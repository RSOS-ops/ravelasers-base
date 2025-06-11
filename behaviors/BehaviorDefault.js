import * as THREE from 'three';
import { getRandomPointOnSphere, getRandomTargetVertex } from '../LaserSystem.js';

export class BehaviorDefault {
    constructor(config = {}) {
        this.id = 'default';
        
        // All the parameters that were in LaserSystem
        this.ORIGIN_SPHERE_RADIUS = config.ORIGIN_SPHERE_RADIUS || 10;
        this.STILLNESS_LIMIT = config.STILLNESS_LIMIT || 0.08333333333333333; // 2x faster laser origin changes
        this.BASE_PULSE_FREQUENCY = config.BASE_PULSE_FREQUENCY || 0.5;
        this.PULSE_FREQUENCY_SENSITIVITY = config.PULSE_FREQUENCY_SENSITIVITY || 5.0;
        this.MIN_BRIGHTNESS = config.MIN_BRIGHTNESS || 0.3;
        this.MAX_BRIGHTNESS = config.MAX_BRIGHTNESS || 2.5;
        this.MAX_LENGTH = config.MAX_LENGTH || 20;
        this.MAX_BOUNCES = config.MAX_BOUNCES || 3;
        this.laserColor = new THREE.Color(config.laserColor || 0xff0000);
        
        // Laser state/config only
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
        const fixedTarget = new THREE.Vector3(0, 0, 0);
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        
        // Set random origins on sphere
        for (let i = 0; i < 4; i++) {
            this.origins[i] = getRandomPointOnSphere(targetCenter, this.ORIGIN_SPHERE_RADIUS);
            this.targets[i] = fixedTarget.clone();
            this.directions[i] = new THREE.Vector3().subVectors(this.targets[i], this.origins[i]).normalize();
        }
        
        console.log("BehaviorDefault: Initialized default behavior with 4 lasers");
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
    }
    
    _jumpLasers(laserSystem) {
        const controls = laserSystem.getControls();
        const targetCenter = controls ? controls.target : new THREE.Vector3();
        const fixedTarget = new THREE.Vector3(0, 0, 0); // Always target (0,0,0)
        
        for (let i = 0; i < 4; i++) {
            this.origins[i] = getRandomPointOnSphere(targetCenter, this.ORIGIN_SPHERE_RADIUS);
            this.targets[i] = fixedTarget.clone();
            this.directions[i] = new THREE.Vector3().subVectors(this.targets[i], this.origins[i]).normalize();
        }
    }
    
    _updatePulsing(clock) {
        // Only update config/parameters, not Three.js objects
    }
    
    _updateLaserGeometry(laserSystem) {
        // Only update config/state, not Three.js objects
    }
    
    cleanup(laserSystem) {
        // No Three.js object removal needed
        this.origins = [];
        this.directions = [];
        this.targets = [];
        console.log('BehaviorDefault: Cleaned up default behavior');
    }
}
