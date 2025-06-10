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
        this.lasers = [];
        this.modelVertices = []; // Store all model vertices
        
        // Extract vertices from the model
        this.extractModelVertices();
    }

    extractModelVertices() {
        if (!this.model) return;
        
        this.modelVertices = [];
        
        this.model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const geometry = child.geometry;
                const positionAttribute = geometry.attributes.position;
                
                if (positionAttribute) {
                    // Get world matrix for proper vertex positioning
                    child.updateMatrixWorld();
                    
                    for (let i = 0; i < positionAttribute.count; i++) {
                        const vertex = new THREE.Vector3();
                        vertex.fromBufferAttribute(positionAttribute, i);
                        
                        // Transform vertex to world coordinates
                        vertex.applyMatrix4(child.matrixWorld);
                        
                        this.modelVertices.push(vertex.clone());
                    }
                }
            }
        });
        
        console.log(`✅ Extracted ${this.modelVertices.length} vertices from model`);
    }

    getRandomModelVertex() {
        if (this.modelVertices.length === 0) {
            console.warn("No model vertices available, using origin");
            return new THREE.Vector3(0, 0, 0);
        }
        
        const randomIndex = Math.floor(Math.random() * this.modelVertices.length);
        return this.modelVertices[randomIndex].clone();
    }

    createLaser(config) {
        // ...existing laser creation code...
        
        // Set random target vertex
        const targetVertex = this.getRandomModelVertex();
        laser.targetPosition = targetVertex;
        
        // If using line geometry, update the line to point to the vertex
        if (laser.line && laser.line.geometry) {
            const positions = laser.line.geometry.attributes.position.array;
            positions[3] = targetVertex.x; // End point X
            positions[4] = targetVertex.y; // End point Y
            positions[5] = targetVertex.z; // End point Z
            laser.line.geometry.attributes.position.needsUpdate = true;
        }
        
        // ...rest of laser creation...
    }

    // Method to retarget a laser to a new random vertex
    retargetLaser(laser) {
        const newTarget = this.getRandomModelVertex();
        laser.targetPosition = newTarget;
        
        // Update line geometry if it exists
        if (laser.line && laser.line.geometry) {
            const positions = laser.line.geometry.attributes.position.array;
            positions[3] = newTarget.x;
            positions[4] = newTarget.y;
            positions[5] = newTarget.z;
            laser.line.geometry.attributes.position.needsUpdate = true;
        }
        
        console.log(`🎯 Laser retargeted to vertex: (${newTarget.x.toFixed(2)}, ${newTarget.y.toFixed(2)}, ${newTarget.z.toFixed(2)})`);
    }

    // Call this when lasers change origin or need new targets
    updateLaserTargets() {
        this.lasers.forEach(laser => {
            this.retargetLaser(laser);
        });
    }

    // Core infrastructure only
    activeBehaviors = [];
    raycaster = new THREE.Raycaster();
    interactiveObjects = [];
    
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
