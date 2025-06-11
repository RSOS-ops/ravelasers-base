import * as THREE from 'three';
import { getRandomPointOnSphere, getRandomTargetVertex } from '../LaserSystem.js';

export class BehaviorWireframe {
    constructor(config = {}) {
        this.id = 'wireframe';
        
        // All the parameters that were in LaserSystem
        this.ORIGIN_SPHERE_RADIUS = config.ORIGIN_SPHERE_RADIUS || 10;
        this.STILLNESS_LIMIT = config.STILLNESS_LIMIT || 0.5; // 2x faster laser origin changes
        this.BASE_PULSE_FREQUENCY = config.BASE_PULSE_FREQUENCY || 0.5;
        this.PULSE_FREQUENCY_SENSITIVITY = config.PULSE_FREQUENCY_SENSITIVITY || 5.0;
        this.MIN_BRIGHTNESS = config.MIN_BRIGHTNESS || 0.3;
        this.MAX_BRIGHTNESS = config.MAX_BRIGHTNESS || 2.5;
        this.MAX_LENGTH = config.MAX_LENGTH || 20;
        this.MAX_BOUNCES = config.MAX_BOUNCES || 3;
        this.laserColor = new THREE.Color(config.laserColor || 0x00ff00); // Default to green for wireframe
          // Laser state/config only
        this.origins = [];
        this.directions = [];
        this.targets = [];
        this.targetFaces = []; // Store target face data for reflection
        
        // Camera tracking for jump logic
        this.previousCameraPosition = new THREE.Vector3();
        this.previousCameraQuaternion = new THREE.Quaternion();
        this.stillnessTimer = 0;
        this.CAMERA_ROTATION_THRESHOLD = THREE.MathUtils.degToRad(15);
        this.CAMERA_POSITION_THRESHOLD = 0.1;
    }
    
    init(laserSystem) {
        console.log('BehaviorWireframe: Initializing wireframe behavior');
        this._initializeLaserPositions(laserSystem);
        // Create lasers via LaserSystem
        for (let i = 0; i < 4; i++) {
            laserSystem.createLaser({
                origin: this.origins[i],
                target: this.targets[i],
                laserColor: this.laserColor.getHex(),
                MAX_BOUNCES: this.MAX_BOUNCES,
                MAX_LENGTH: this.MAX_LENGTH
            });
        }
    }
    
    _initializeLaserPositions(laserSystem) {
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        
        // Set random origins on sphere and random face targets
        for (let i = 0; i < 4; i++) {
            this.origins[i] = getRandomPointOnSphere(targetCenter, this.ORIGIN_SPHERE_RADIUS);
            
            // Get random face instead of vertex
            const randomFace = this._getRandomModelFace(laserSystem);
            this.targets[i] = randomFace.center.clone();
            this.targetFaces[i] = randomFace;
            
            this.directions[i] = new THREE.Vector3().subVectors(this.targets[i], this.origins[i]).normalize();
            
            console.log(`🎯 Laser ${i} targeting face center:`, this.targets[i], 'with normal:', randomFace.normal);
        }
        
        console.log("BehaviorWireframe: Initialized wireframe behavior with 4 lasers targeting random faces");
    }
      update(deltaTime, clock, laserSystem) {
        // Handle camera stillness detection and jumping (if needed)
        this._handleCameraMovement(deltaTime, laserSystem);
        
        // Update pulsing
        this._updatePulsing(clock);
        
        // Update laser origins and targets in LaserSystem
        for (let i = 0; i < Math.min(this.origins.length, laserSystem.lasers.length); i++) {
            laserSystem.updateLaserFromBehavior(i, this.origins[i], this.targets[i]);
        }
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
    }      _jumpLasers(laserSystem) {
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        
        for (let i = 0; i < 4; i++) {
            this.origins[i] = getRandomPointOnSphere(targetCenter, this.ORIGIN_SPHERE_RADIUS);
            
            // Get random face instead of vertex
            const randomFace = this._getRandomModelFace(laserSystem);
            this.targets[i] = randomFace.center.clone();
            this.targetFaces[i] = randomFace;
            
            this.directions[i] = new THREE.Vector3().subVectors(this.targets[i], this.origins[i]).normalize();
            
            console.log(`🔄 Laser ${i} retargeted to face center:`, this.targets[i], 'with normal:', randomFace.normal);
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

                // Debug log for first bounce
                if (i === 0) {
                    console.log(`🔄 Laser hit surface at:`, impactPoint, 'distance:', intersection.distance);
                }

                const surfaceNormal = intersection.face.normal.clone();
                const worldNormal = new THREE.Vector3();
                worldNormal.copy(surfaceNormal).transformDirection(intersection.object.matrixWorld);

                // Ensure normal points away from incoming ray
                if (currentDirection.dot(worldNormal) > 0) {
                    worldNormal.negate();
                }

                // Reflect the direction off the surface
                currentDirection.reflect(worldNormal);
                
                // Move slightly off the surface to prevent self-intersection
                currentOrigin.copy(impactPoint).add(currentDirection.clone().multiplyScalar(0.001));

                if (i === this.MAX_BOUNCES - 1) {
                    points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH)));
                }
            } else {
                // No intersection found - extend laser to max length
                if (i === 0) {
                    console.warn('❌ No surface intersection found for laser');
                }
                points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH)));
                break;
            }
        }
        
        laserLine.geometry.setFromPoints(points);
        laserLine.geometry.attributes.position.needsUpdate = true;
    }
      _getRandomModelFace(laserSystem) {
        // Try to get a random face from the loaded model
        const face = laserSystem.getRandomModelFace();
        if (face) {
            return face;
        }
        
        // Fallback to default face if no model faces available
        console.warn("BehaviorWireframe: No model faces available, using default face");
        return {
            center: new THREE.Vector3(0, 0, 0),
            normal: new THREE.Vector3(0, 1, 0),
            vertices: [
                new THREE.Vector3(-0.5, 0, -0.5),
                new THREE.Vector3(0.5, 0, -0.5),
                new THREE.Vector3(0, 0, 0.5)
            ]
        };
    }    cleanup(laserSystem) {
        this.origins = [];
        this.directions = [];
        this.targets = [];
        this.targetFaces = [];
        console.log('BehaviorWireframe: Cleaned up wireframe behavior');
    }
}