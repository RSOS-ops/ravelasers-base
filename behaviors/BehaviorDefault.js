// DEPRECATED: Use LaserEngine.js in the project root instead of this file.
// This file is kept for legacy reference only.

import * as THREE from 'three';
import { getRandomPointOnSphere, getRandomTargetVertex } from '../LaserSystem.js';

export class BehaviorDefault {
    constructor(config = {}) {
        this.id = 'default';
        
        // Store the configuration that LaserSystem will use
        this.config = {
            ORIGIN_SPHERE_RADIUS: config.ORIGIN_SPHERE_RADIUS || 10,
            STILLNESS_LIMIT: config.STILLNESS_LIMIT || 0.08333333333333333, // 2x faster laser origin changes
            BASE_PULSE_FREQUENCY: config.BASE_PULSE_FREQUENCY || 0.5,
            PULSE_FREQUENCY_SENSITIVITY: config.PULSE_FREQUENCY_SENSITIVITY || 5.0,
            MIN_BRIGHTNESS: config.MIN_BRIGHTNESS || 0.3,
            MAX_BRIGHTNESS: config.MAX_BRIGHTNESS || 2.5,
            MAX_LENGTH: config.MAX_LENGTH || 20,
            MAX_BOUNCES: config.MAX_BOUNCES || 3,
            laserColor: config.laserColor || 0xff0000,
            laserCount: config.laserCount || 4,
            ...config
        };
        
        // Behavior state
        this.lasers = [];
        this.isInitialized = false;
        
        // Camera tracking for jump logic
        this.previousCameraPosition = new THREE.Vector3();
        this.previousCameraQuaternion = new THREE.Quaternion();
        this.stillnessTimer = 0;
        this.CAMERA_ROTATION_THRESHOLD = THREE.MathUtils.degToRad(15);
        this.CAMERA_POSITION_THRESHOLD = 0.1;
    }
    
    init(laserSystem) {
        console.log('BehaviorDefault: Initializing behavior with config:', this.config);
        
        // Use LaserSystem to create the laser show
        this.lasers = laserSystem.createLaserShow(this.config);
        this.isInitialized = true;
        
        // Set up initial camera position tracking
        const camera = laserSystem.getCamera();
        if (camera) {
            this.previousCameraPosition.copy(camera.position);
            this.previousCameraQuaternion.copy(camera.quaternion);
        }
        
        console.log(`BehaviorDefault: Created behavior with ${this.lasers.length} lasers`);
    }    
    update(deltaTime, clock, laserSystem) {
        if (!this.isInitialized || this.lasers.length === 0) return;
        
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
            
            if (this.stillnessTimer >= this.config.STILLNESS_LIMIT) {
                this._jumpLasers(laserSystem);
                this.stillnessTimer = 0;
            }
        }
    }
    
    _jumpLasers(laserSystem) {
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        const fixedTarget = new THREE.Vector3(0, 0, 0); // Always target (0,0,0)
        
        this.lasers.forEach(laser => {
            laser.origin = getRandomPointOnSphere(targetCenter, this.config.ORIGIN_SPHERE_RADIUS);
            laser.target.copy(fixedTarget);
            laser.direction.subVectors(laser.target, laser.origin).normalize();
        });
    }
    
    _updatePulsing(clock) {
        const currentPulseFrequency = this.config.BASE_PULSE_FREQUENCY;
        const sharedPulseIntensity = (Math.sin(clock.elapsedTime * currentPulseFrequency * Math.PI * 2) + 1) / 2;
        const brightnessScalar = this.config.MIN_BRIGHTNESS + (sharedPulseIntensity * (this.config.MAX_BRIGHTNESS - this.config.MIN_BRIGHTNESS));
        
        const currentLaserColorHex = typeof this.config.laserColor === 'number' ? this.config.laserColor : parseInt(this.config.laserColor.getHexString(), 16);
        
        this.lasers.forEach(laser => {
            if (laser.material) {
                laser.material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
            }
        });
    }
    
    _updateLaserGeometry(laserSystem) {
        this.lasers.forEach(laser => {
            this._updateSingleLaserGeometry(laser, laser.origin, laser.direction, laserSystem);
        });
    }
    
    _updateSingleLaserGeometry(laser, origin, direction, laserSystem) {
        if (!laser.line || !laser.line.geometry) return;
        
        const points = [];
        let currentOrigin = origin.clone();
        let currentDirection = direction.clone();
        points.push(currentOrigin.clone());

        for (let i = 0; i < this.config.MAX_BOUNCES; i++) {
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
                
                if (i === this.config.MAX_BOUNCES - 1) {
                    points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.config.MAX_LENGTH)));
                }
            } else {
                points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.config.MAX_LENGTH)));
                break;
            }
        }
        
        laser.line.geometry.setFromPoints(points);
        laser.line.geometry.attributes.position.needsUpdate = true;
    }
    
    cleanup(laserSystem) {
        console.log('BehaviorDefault: Cleaning up behavior');
        
        // LaserSystem will handle the cleanup of laser objects
        laserSystem.clearAllLasers();
        
        this.lasers = [];
        this.isInitialized = false;
    }
}
