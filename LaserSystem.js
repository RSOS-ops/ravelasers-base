import * as THREE from 'three';

// Helper functions - exported for behaviors to use
export function getRandomPointOnSphere(center, radius) {
    const point = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
    );
    if (point.lengthSq() === 0) {
        point.x = 1;
    }
    point.normalize().multiplyScalar(radius).add(center);
    return point;
}

export function getRandomTargetVertex(verticesArray) {
    if (!verticesArray || verticesArray.length === 0) {
        console.warn("getRandomTargetVertex: modelVertices array is empty or undefined. Returning default Vector3(0,0,0).");
        return new THREE.Vector3();
    }
    const randomIndex = Math.floor(Math.random() * verticesArray.length);
    return verticesArray[randomIndex].clone();
}

export class LaserSystem {
    constructor(scene, model, controls, camera) {
        this.scene = scene;
        this.model = model;
        this.controls = controls;
        this.camera = camera;
        
        // Core infrastructure only
        this.activeBehaviors = [];
        this.modelVertices = [];
        this.raycaster = new THREE.Raycaster();
        this.interactiveObjects = [];
        
        if (this.model) {
            this.interactiveObjects.push(this.model);
        }
        
        this._extractModelVertices();
    }

    _extractModelVertices() {
        if (!this.model) return;
        this.model.updateMatrixWorld(true);
        this.model.traverse((child) => {
            if (child.isMesh) {
                const positions = child.geometry.attributes.position;
                const worldMatrix = child.matrixWorld;
                for (let i = 0; i < positions.count; i++) {
                    const localVertex = new THREE.Vector3().fromBufferAttribute(positions, i);
                    const worldVertex = localVertex.applyMatrix4(worldMatrix);
                    this.modelVertices.push(worldVertex);
                }
            }
        });
        console.log('LaserSystem: Extracted ' + this.modelVertices.length + ' vertices.');
    }

    // Controller methods for managing behaviors
    addBehavior(behavior) {
        this.activeBehaviors.push(behavior);
        behavior.init(this); // Let behavior initialize itself with system context
        console.log('LaserSystem: Added behavior:', behavior.constructor.name);
    }

    removeBehavior(behaviorId) {
        const index = this.activeBehaviors.findIndex(b => b.id === behaviorId);
        if (index !== -1) {
            this.activeBehaviors[index].cleanup(this);
            this.activeBehaviors.splice(index, 1);
            console.log('LaserSystem: Removed behavior:', behaviorId);
        }
    }

    clearAllBehaviors() {
        console.log('LaserSystem: Clearing all behaviors');
        this.activeBehaviors.forEach(behavior => behavior.cleanup(this));
        this.activeBehaviors = [];
    }

    // Main update loop - delegates to behaviors
    update(deltaTime, clock) {
        this.activeBehaviors.forEach(behavior => {
            behavior.update(deltaTime, clock, this);
        });
    }

    // Utility methods for behaviors to use
    raycast(origin, direction) {
        this.raycaster.set(origin, direction);
        return this.raycaster.intersectObjects(this.interactiveObjects, true);
    }

    getModelVertices() {
        return this.modelVertices;
    }

    getInteractiveObjects() {
        return this.interactiveObjects;
    }

    getScene() {
        return this.scene;
    }

    getModel() {
        return this.model;
    }

    getControls() {
        return this.controls;
    }

    getCamera() {
        return this.camera;
    }

    // Legacy method for PresetManager compatibility - delegates to behaviors
    applyPreset(config) {
        console.log("LaserSystem: applyPreset called - this should now be handled by behaviors");
        console.warn("LaserSystem: applyPreset is deprecated - use behaviors instead");
    }
}
