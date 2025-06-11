// BehaviorStart.js - Four blue lasers from corners targeting the 3D model
import * as THREE from 'three';

export class BehaviorStart {
    constructor(config = {}) {
        this.laserColor = config.laserColor || 0x0000ff;
        this.lasers = [];
        this.target = config.target || null; // Should be a THREE.Object3D
    }

    // Called to initialize lasers
    init(scene, camera, target) {
        this.target = target;
        this.lasers = [];
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
