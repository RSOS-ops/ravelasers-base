import * as THREE from 'three';
import { getRandomPointOnSphere, getRandomTargetVertex } from './LaserSystem.js';

// BEHAVIOR 1: Default (4 lasers targeting center)
export class BehaviorDefault {
    constructor(config = {}) {
        this.id = 'default';
        
        // All the parameters that were in LaserSystem
        this.ORIGIN_SPHERE_RADIUS = config.ORIGIN_SPHERE_RADIUS || 10;
        this.STILLNESS_LIMIT = config.STILLNESS_LIMIT || 0.16666666666666666;
        this.BASE_PULSE_FREQUENCY = config.BASE_PULSE_FREQUENCY || 0.5;
        this.PULSE_FREQUENCY_SENSITIVITY = config.PULSE_FREQUENCY_SENSITIVITY || 5.0;
        this.MIN_BRIGHTNESS = config.MIN_BRIGHTNESS || 0.3;
        this.MAX_BRIGHTNESS = config.MAX_BRIGHTNESS || 2.5;
        this.MAX_LENGTH = config.MAX_LENGTH || 20;
        this.MAX_BOUNCES = config.MAX_BOUNCES || 3;
        this.laserColor = new THREE.Color(config.laserColor || 0xff0000);
        
        // Laser objects
        this.laserLines = [];
        this.materials = [];
        this.origins = [];
        this.directions = [];
        this.targets = [];
        
        // Camera tracking for jump logic
        this.previousCameraPosition = new THREE.Vector3();
        this.previousCameraQuaternion = new THREE.Quaternion();
        this.stillnessTimer = 0;
        this.CAMERA_ROTATION_THRESHOLD = THREE.MathUtils.degToRad(15);
        this.CAMERA_POSITION_THRESHOLD = 0.1;
    }
    
    init(laserSystem) {
        console.log('BehaviorDefault: Initializing default behavior');
        this._setupLasers(laserSystem);
        this._initializeLaserPositions(laserSystem);
    }
    
    _setupLasers(laserSystem) {
        const scene = laserSystem.getScene();
        
        // Create 4 lasers
        for (let i = 0; i < 4; i++) {
            const material = new THREE.LineBasicMaterial({ color: this.laserColor });
            const points = [new THREE.Vector3(), new THREE.Vector3(0, 0, 1)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            
            scene.add(line);
            this.laserLines.push(line);
            this.materials.push(material);
            this.origins.push(new THREE.Vector3());
            this.directions.push(new THREE.Vector3(0, 0, -1));
            this.targets.push(new THREE.Vector3());
        }
    }
    
    _initializeLaserPositions(laserSystem) {
        const fixedTarget = new THREE.Vector3(0, 0, 0);
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        
        // Set random origins on sphere
        for (let i = 0; i < 4; i++) {
            this.origins[i] = getRandomPointOnSphere(targetCenter, this.ORIGIN_SPHERE_RADIUS);
            this.targets[i].copy(fixedTarget);
            this.directions[i].subVectors(this.targets[i], this.origins[i]).normalize();
        }
        
        console.log("BehaviorDefault: Initialized default behavior with 4 lasers");
    }
    
    update(deltaTime, clock, laserSystem) {
        // Handle camera stillness detection and jumping (if needed)
        this._handleCameraMovement(deltaTime, laserSystem);
        
        // Update pulsing
        this._updatePulsing(clock);
        
        // Update laser geometry
        this._updateLaserGeometry(laserSystem);
    }
    
    _handleCameraMovement(deltaTime, laserSystem) {
        const camera = laserSystem.getCamera();
        if (!camera) return;
        
        const currentCameraPosition = camera.position.clone();
        const currentCameraQuaternion = camera.quaternion.clone();
        
        const positionChanged = currentCameraPosition.distanceTo(this.previousCameraPosition) > this.CAMERA_POSITION_THRESHOLD;
        const rotationChanged = this.previousCameraQuaternion.angleTo(currentCameraQuaternion) > this.CAMERA_ROTATION_THRESHOLD;
        
        if (positionChanged || rotationChanged) {
            this.stillnessTimer = 0;
            this.previousCameraPosition.copy(currentCameraPosition);
            this.previousCameraQuaternion.copy(currentCameraQuaternion);
        } else {
            this.stillnessTimer += deltaTime;
            
            if (this.stillnessTimer >= this.STILLNESS_LIMIT) {
                this._jumpLasers(laserSystem);
                this.stillnessTimer = 0;
            }
        }
    }
    
    _jumpLasers(laserSystem) {
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        const fixedTarget = new THREE.Vector3(0, 0, 0); // Always target (0,0,0)
        
        for (let i = 0; i < 4; i++) {
            this.origins[i] = getRandomPointOnSphere(targetCenter, this.ORIGIN_SPHERE_RADIUS);
            this.targets[i].copy(fixedTarget); // Ensure targets remain at (0,0,0)
            this.directions[i].subVectors(this.targets[i], this.origins[i]).normalize();
        }
    }
    
    _updatePulsing(clock) {
        const currentPulseFrequency = this.BASE_PULSE_FREQUENCY;
        const sharedPulseIntensity = (Math.sin(clock.elapsedTime * currentPulseFrequency * Math.PI * 2) + 1) / 2;
        const brightnessScalar = this.MIN_BRIGHTNESS + (sharedPulseIntensity * (this.MAX_BRIGHTNESS - this.MIN_BRIGHTNESS));
        
        const currentLaserColorHex = parseInt(this.laserColor.getHexString(), 16);
        
        this.materials.forEach(material => {
            material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
        });
    }
    
    _updateLaserGeometry(laserSystem) {
        for (let i = 0; i < this.laserLines.length; i++) {
            this._updateSingleLaserGeometry(this.laserLines[i], this.origins[i], this.directions[i], laserSystem);
        }
    }
    
    _updateSingleLaserGeometry(laserLine, origin, direction, laserSystem) {
        const points = [];
        let currentOrigin = origin.clone();
        let currentDirection = direction.clone();
        points.push(currentOrigin.clone());

        for (let i = 0; i < this.MAX_BOUNCES; i++) {
            const intersects = laserSystem.raycast(currentOrigin, currentDirection);

            if (intersects.length > 0) {
                const intersection = intersects[0];
                const impactPoint = intersection.point;
                points.push(impactPoint.clone());

                const surfaceNormal = intersection.face.normal.clone();
                const worldNormal = new THREE.Vector3();
                worldNormal.copy(surfaceNormal).transformDirection(intersection.object.matrixWorld);

                if (currentDirection.dot(worldNormal) > 0) {
                    worldNormal.negate();
                }

                currentDirection.reflect(worldNormal);
                currentOrigin.copy(impactPoint).add(currentDirection.clone().multiplyScalar(0.001));

                if (i === this.MAX_BOUNCES - 1) {
                    points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH)));
                }
            } else {
                points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH)));
                break;
            }
        }
        
        laserLine.geometry.setFromPoints(points);
        laserLine.geometry.attributes.position.needsUpdate = true;
    }
    
    cleanup(laserSystem) {
        const scene = laserSystem.getScene();
        this.laserLines.forEach(line => scene.remove(line));
        this.laserLines = [];
        this.materials = [];
        this.origins = [];
        this.directions = [];
        this.targets = [];
        console.log('BehaviorDefault: Cleaned up default behavior');
    }
}

// Export behaviors object for banks.js to use
export const behaviors = {
    default: (config = {}) => new BehaviorDefault(config),
    // Add other behavior factory functions as you create them
};
