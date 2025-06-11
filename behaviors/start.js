// BehaviorStart.js - Four blue lasers from corners targeting the 3D model
import * as THREE from 'three';
import { getRandomPointOnSphere, getRandomTargetVertex } from '../LaserSystem.js';

export class BehaviorStart {
    constructor(config = {}) {
        this.id = 'start';
        this.name = 'Start';
        this.lasers = [];
        this.cylinders = []; // Add cylinder tracking
        this.laserColor = config.laserColor || 0x0000ff;
        this.target = config.target || null; // Should be a THREE.Object3D
    }

    // Called to initialize lasers
    init(scene, camera, target) {
        this.target = target;
        this.lasers = [];
        this.cylinders = [];
        const corners = this._getScreenCorners(camera, scene);
        // Defensive: ensure target and target.position exist
        const targetPos = (target && target.position) ? target.position.clone() : new THREE.Vector3(0, 0, 0);
        // Defensive: get scene from scene or from laserSystem pattern
        let realScene = scene;
        if (!realScene || typeof realScene.add !== 'function') {
            // Try to get scene from scene.getScene() if available (laserSystem pattern)
            if (scene && typeof scene.getScene === 'function') {
                realScene = scene.getScene();
            } else {
                // Can't add lasers if no valid scene
                return;
            }
        }
        for (let i = 0; i < 4; i++) {
            // Defensive: ensure corners[i] is valid
            const start = corners[i] ? corners[i].clone() : new THREE.Vector3(0, 0, 0);
            const laser = this._createLaser(start, targetPos);
            realScene.add(laser);
            this.lasers.push(laser);
        }
    }

    // Called every frame to update laser directions
    update(scene, camera, target) {
        // Defensive: ensure target and target.position exist
        if (!target || !target.position) return;
        const corners = this._getScreenCorners(camera, scene);
        for (let i = 0; i < 4; i++) {
            const laser = this.lasers[i];
            if (!laser) continue;
            // Defensive: ensure corners[i] is valid
            const start = corners[i] ? corners[i] : new THREE.Vector3(0, 0, 0);
            const positions = laser.geometry.attributes.position.array;
            positions[0] = start.x;
            positions[1] = start.y;
            positions[2] = start.z;
            positions[3] = target.position.x;
            positions[4] = target.position.y;
            positions[5] = target.position.z;
            laser.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Helper to create a laser (THREE.Line) from start to end
    _createLaser(start, end) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            start.x, start.y, start.z,
            end.x, end.y, end.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ color: this.laserColor });
        return new THREE.Line(geometry, material);
    }

    // Get world positions for the 4 screen corners
    _getScreenCorners(camera, scene) {
        // Defensive: ensure camera is defined and has projectionMatrixInverse
        if (!camera || typeof camera.unproject !== 'function' || !camera.projectionMatrixInverse) {
            // Fallback: return corners at origin
            return [
                new THREE.Vector3(-10, 10, -10),
                new THREE.Vector3(10, 10, -10),
                new THREE.Vector3(-10, -10, -10),
                new THREE.Vector3(10, -10, -10)
            ];
        }
        // NDC corners: [(-1,1), (1,1), (-1,-1), (1,-1)]
        const ndc = [
            new THREE.Vector3(-1, 1, -1),
            new THREE.Vector3(1, 1, -1),
            new THREE.Vector3(-1, -1, -1),
            new THREE.Vector3(1, -1, -1)
        ];
        // Project from NDC to world at near plane
        return ndc.map(v => v.clone().unproject(camera));
    }

    // Cleanup method to remove lasers from the scene
    cleanup(laserSystem) {
        // Remove lasers from the scene
        if (this.lasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.lasers.forEach(laser => scene.remove(laser));
        }
        this.lasers = [];
    }

    _createInitialLasers() {
        // Create a simple initial laser configuration
        const laserConfig = {
            origin: new THREE.Vector3(0, 0, 5),
            direction: new THREE.Vector3(0, 0, -1),
            color: 0x00ff00,
            intensity: 1.0
        };
        
        this._createLaser(laserConfig);
    }

    _createLaser(config) {
        // Create wireframe line
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ 
            color: config.color || 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        
        const positions = new Float32Array(6); // Start and end points
        positions[0] = config.origin.x;
        positions[1] = config.origin.y;
        positions[2] = config.origin.z;
        positions[3] = config.origin.x + config.direction.x * 10;
        positions[4] = config.origin.y + config.direction.y * 10;
        positions[5] = config.origin.z + config.direction.z * 10;
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const line = new THREE.Line(geometry, material);
        
        // Create cylinder mesh
        const distance = config.origin.distanceTo(new THREE.Vector3(
            positions[3], positions[4], positions[5]
        ));
        
        const cylinderGeometry = new THREE.CylinderGeometry(0.01, 0.01, distance, 8);
        const cylinderMaterial = new THREE.MeshBasicMaterial({
            color: config.color || 0x00ff00,
            transparent: true,
            opacity: 0.6
        });
        
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        
        // Position and orient cylinder
        const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
        const end = new THREE.Vector3(positions[3], positions[4], positions[5]);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        
        cylinder.position.copy(center);
        cylinder.lookAt(end);
        cylinder.rotateX(Math.PI / 2);
        
        // Create laser object
        const laser = {
            line: line,
            cylinder: cylinder,
            origin: config.origin.clone(),
            direction: config.direction.clone(),
            color: config.color || 0x00ff00,
            intensity: config.intensity || 1.0
        };
        
        this.lasers.push(laser);
        this.cylinders.push(cylinder);
        
        // Add to scene
        this.scene.add(line);
        this.scene.add(cylinder);
        
        console.log('BehaviorStart: Created laser with cylinder');
    }

    update(deltaTime, clock, laserSystem) {
        // Simple pulsing animation
        const time = clock.getElapsedTime();
        const pulse = (Math.sin(time * 2) + 1) * 0.5;
        
        this.lasers.forEach(laser => {
            if (laser.line && laser.line.material) {
                laser.line.material.opacity = 0.3 + pulse * 0.5;
            }
            if (laser.cylinder && laser.cylinder.material) {
                laser.cylinder.material.opacity = 0.2 + pulse * 0.4;
            }
        });
    }

    cleanup(laserSystem) {
        console.log('BehaviorStart: Cleaning up...');
        
        // Remove lines
        this.lasers.forEach(laser => {
            if (laser.line) {
                this.scene.remove(laser.line);
                if (laser.line.geometry) laser.line.geometry.dispose();
                if (laser.line.material) laser.line.material.dispose();
            }
            if (laser.cylinder) {
                this.scene.remove(laser.cylinder);
                if (laser.cylinder.geometry) laser.cylinder.geometry.dispose();
                if (laser.cylinder.material) laser.cylinder.material.dispose();
            }
        });
        
        this.lasers = [];
        this.cylinders = [];
    }
}

// Auto-save the 'start' behavior on startup if not already saved
try {
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.presetManager && window.presetManager.saveBehavior) {
                // Only save if not already present
                const saved = window.presetManager.listBehaviors && window.presetManager.listBehaviors();
                if (!saved || !saved.includes('start')) {
                    window.presetManager.saveBehavior('start', { laserColor: 0x0000ff }, 'start');
                    console.log('Auto-saved "start" behavior on startup.');
                }
            }
        });
    }
} catch (e) { console.warn('Auto-save for start behavior failed:', e); }
