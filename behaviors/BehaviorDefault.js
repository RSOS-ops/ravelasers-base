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
          // Laser objects
        this.laserLines = [];
        this.laserCylinders = []; // New: cylinder meshes for each laser segment
        this.materials = [];
        this.cylinderMaterials = []; // New: materials for cylinder meshes
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
            
            // Create cylinder material for this laser
            const cylinderMaterial = new THREE.MeshBasicMaterial({ 
                color: this.laserColor,
                transparent: true,
                opacity: 0.8
            });
            this.cylinderMaterials.push(cylinderMaterial);
            
            // Initialize empty array for cylinder segments
            this.laserCylinders.push([]);
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
        
        // Update cylinder materials with same pulsing
        this.cylinderMaterials.forEach(material => {
            material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
        });
    }
      _updateLaserGeometry(laserSystem) {
        for (let i = 0; i < this.laserLines.length; i++) {
            this._updateSingleLaserGeometry(this.laserLines[i], this.origins[i], this.directions[i], laserSystem, i);
        }
    }
    
    // Helper method to create a cylinder between two points
    _createCylinderSegment(start, end, material) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const radius = 0.01; // Thin cylinder radius
        
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
        const cylinder = new THREE.Mesh(geometry, material);
        
        // Position cylinder at midpoint
        cylinder.position.copy(start).add(end).multiplyScalar(0.5);
        
        // Align cylinder with the direction vector
        cylinder.lookAt(end);
        cylinder.rotateX(Math.PI / 2); // Cylinders are created along Y-axis, rotate to align with direction
        
        return cylinder;
    }
    
    // Helper method to clear existing cylinder segments for a laser
    _clearCylinderSegments(laserIndex, scene) {
        if (this.laserCylinders[laserIndex]) {
            this.laserCylinders[laserIndex].forEach(cylinder => {
                scene.remove(cylinder);
                cylinder.geometry.dispose();
            });
            this.laserCylinders[laserIndex] = [];
        }
    }
      _updateSingleLaserGeometry(laserLine, origin, direction, laserSystem, laserIndex) {
        const scene = laserSystem.getScene();
        const points = [];
        let currentOrigin = origin.clone();
        let currentDirection = direction.clone();
        points.push(currentOrigin.clone());

        // Clear existing cylinder segments for this laser
        this._clearCylinderSegments(laserIndex, scene);

        for (let i = 0; i < this.MAX_BOUNCES; i++) {
            const intersects = laserSystem.raycast(currentOrigin, currentDirection);

            if (intersects.length > 0) {
                const intersection = intersects[0];
                const impactPoint = intersection.point;
                points.push(impactPoint.clone());

                // Create cylinder segment for this laser path
                const cylinder = this._createCylinderSegment(
                    currentOrigin.clone(), 
                    impactPoint.clone(), 
                    this.cylinderMaterials[laserIndex]
                );
                scene.add(cylinder);
                this.laserCylinders[laserIndex].push(cylinder);

                const surfaceNormal = intersection.face.normal.clone();
                const worldNormal = new THREE.Vector3();
                worldNormal.copy(surfaceNormal).transformDirection(intersection.object.matrixWorld);

                if (currentDirection.dot(worldNormal) > 0) {
                    worldNormal.negate();
                }

                currentDirection.reflect(worldNormal);
                currentOrigin.copy(impactPoint).add(currentDirection.clone().multiplyScalar(0.001));

                if (i === this.MAX_BOUNCES - 1) {
                    const finalPoint = currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH));
                    points.push(finalPoint);
                    
                    // Create final cylinder segment
                    const finalCylinder = this._createCylinderSegment(
                        currentOrigin.clone(), 
                        finalPoint, 
                        this.cylinderMaterials[laserIndex]
                    );
                    scene.add(finalCylinder);
                    this.laserCylinders[laserIndex].push(finalCylinder);
                }
            } else {
                const finalPoint = currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH));
                points.push(finalPoint);
                
                // Create cylinder segment for non-intersecting laser
                const cylinder = this._createCylinderSegment(
                    currentOrigin.clone(), 
                    finalPoint, 
                    this.cylinderMaterials[laserIndex]
                );
                scene.add(cylinder);
                this.laserCylinders[laserIndex].push(cylinder);
                break;
            }
        }
        
        laserLine.geometry.setFromPoints(points);
        laserLine.geometry.attributes.position.needsUpdate = true;
    }
      cleanup(laserSystem) {
        const scene = laserSystem.getScene();
        
        // Remove wireframe lines
        this.laserLines.forEach(line => scene.remove(line));
        this.laserLines = [];
        this.materials = [];
        
        // Remove cylinder meshes
        this.laserCylinders.forEach(cylinderArray => {
            cylinderArray.forEach(cylinder => {
                scene.remove(cylinder);
                cylinder.geometry.dispose();
            });
        });
        this.laserCylinders = [];
        this.cylinderMaterials.forEach(material => material.dispose());
        this.cylinderMaterials = [];
        
        this.origins = [];
        this.directions = [];
        this.targets = [];
        console.log('BehaviorDefault: Cleaned up default behavior (wireframes and cylinders)');
    }
}
