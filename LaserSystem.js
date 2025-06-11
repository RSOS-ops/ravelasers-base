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
    // Global cylinder mesh parameters
    // Set radius here
    static CYLINDER_RADIUS = 0.005;
    static CYLINDER_SEGMENTS = 12;
    static CYLINDER_MATERIAL = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
        metalness: 0.7,
        roughness: 0.2
    });

    constructor(scene, model, controls, camera) {
        this.scene = scene;
        this.model = model;
        this.controls = controls;
        this.camera = camera;
        
        // Make sure these arrays are initialized
        this.modelVertices = [];
        this.modelFaces = [];
        this.lasers = [];
        
        // Core infrastructure only
        this.activeBehaviors = [];
        this.raycaster = new THREE.Raycaster();
        this.interactiveObjects = [];
        
        console.log("LaserSystem initialized");
    }

    setupInteractiveObjects() {
        if (!this.model) return;
        
        // Add all mesh children of the model to interactive objects
        this.model.traverse((child) => {
            if (child.isMesh) {
                this.interactiveObjects.push(child);
                console.log(`📍 Added mesh to interactive objects: ${child.name || 'unnamed mesh'}`);
            }
        });
        
        console.log(`✅ Setup ${this.interactiveObjects.length} interactive objects for raycasting`);
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

    extractModelFaces() {
        if (!this.model) return;
        
        this.modelFaces = [];
        
        this.model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const geometry = child.geometry;
                const positionAttribute = geometry.attributes.position;
                const normalAttribute = geometry.attributes.normal;
                
                if (positionAttribute && normalAttribute) {
                    // Get world matrix for proper positioning
                    child.updateMatrixWorld();
                    const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld);
                    
                    // Extract faces (assuming triangulated geometry)
                    const indices = geometry.index;
                    const faceCount = indices ? indices.count / 3 : positionAttribute.count / 3;
                    
                    for (let i = 0; i < faceCount; i++) {
                        const face = {
                            vertices: [],
                            normal: new THREE.Vector3(),
                            center: new THREE.Vector3()
                        };
                        
                        // Get the three vertices of the face
                        for (let j = 0; j < 3; j++) {
                            const vertexIndex = indices ? indices.getX(i * 3 + j) : i * 3 + j;
                            const vertex = new THREE.Vector3();
                            vertex.fromBufferAttribute(positionAttribute, vertexIndex);
                            vertex.applyMatrix4(child.matrixWorld);
                            face.vertices.push(vertex);
                        }
                        
                        // Calculate face center
                        face.center.addVectors(face.vertices[0], face.vertices[1]).add(face.vertices[2]).divideScalar(3);
                        
                        // Get face normal (use first vertex's normal as representative)
                        const normalIndex = indices ? indices.getX(i * 3) : i * 3;
                        face.normal.fromBufferAttribute(normalAttribute, normalIndex);
                        face.normal.applyMatrix3(normalMatrix).normalize();
                        
                        this.modelFaces.push(face);
                    }
                }
            }
        });
        
        console.log(`✅ Extracted ${this.modelFaces.length} faces from model`);
    }

    getRandomModelVertex() {
        if (this.modelVertices.length === 0) {
            console.warn("No model vertices available, using origin");
            return new THREE.Vector3(0, 0, 0);
        }
        
        const randomIndex = Math.floor(Math.random() * this.modelVertices.length);
        return this.modelVertices[randomIndex].clone();
    }

    getRandomModelFace() {
        if (this.modelFaces.length === 0) {
            console.warn("No model faces available, creating default face");
            return {
                center: new THREE.Vector3(0, 0, 0),
                normal: new THREE.Vector3(0, 1, 0),
                vertices: [
                    new THREE.Vector3(-0.5, 0, -0.5),
                    new THREE.Vector3(0.5, 0, -0.5),
                    new THREE.Vector3(0, 0, 0.5)
                ]
            };
        }
        
        const randomIndex = Math.floor(Math.random() * this.modelFaces.length);
        return this.modelFaces[randomIndex];
    }

    /**
     * Create a laser with both a THREE.Line and a cylinder mesh, using global parameters
     * @param {object} config - Laser configuration (color, origin, target, etc.)
     * @returns {object} laser object with line, cylinder, and config
     */
    createLaser(config) {
        // Config: { origin, target, color, ... }
        const origin = config.origin ? config.origin.clone() : new THREE.Vector3();
        const target = config.target ? config.target.clone() : this.getRandomModelVertex();
        const color = config.laserColor || 0xffffff;

        // Create line
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array([
            origin.x, origin.y, origin.z,
            target.x, target.y, target.z
        ]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(line);

        // Create cylinder mesh
        const cylGeom = new THREE.CylinderGeometry(
            LaserSystem.CYLINDER_RADIUS,
            LaserSystem.CYLINDER_RADIUS,
            1,
            LaserSystem.CYLINDER_SEGMENTS,
            1,
            true
        );
        const cylMat = LaserSystem.CYLINDER_MATERIAL.clone();
        cylMat.color.set(color);
        cylMat.emissive.set(color);
        const cylinder = new THREE.Mesh(cylGeom, cylMat);
        cylinder.castShadow = false;
        cylinder.receiveShadow = false;
        this.scene.add(cylinder);

        // Position and scale cylinder to match laser
        const delta = new THREE.Vector3().subVectors(target, origin);
        const length = delta.length();
        cylinder.position.copy(origin).addScaledVector(delta, 0.5);
        cylinder.scale.set(1, length, 1);
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
        cylinder.visible = true;

        // Store laser object
        const laser = {
            origin: origin.clone(),
            target: target.clone(),
            color,
            line,
            cylinder,
            config: { ...config }
        };
        this.lasers.push(laser);
        return laser;
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

    /**
     * Update laser origins and targets from behaviors
     */
    updateLaserFromBehavior(laserIndex, origin, target) {
        if (this.lasers[laserIndex]) {
            this.lasers[laserIndex].origin = origin.clone();
            this.lasers[laserIndex].target = target.clone();
        }
    }

    /**
     * Update all laser geometries so that each laser (line and cylinder) reflects off object surfaces using the face normal.
     * This is a global directive for all lasers.
     */
    updateAllLaserGeometries() {
        for (const laser of this.lasers) {
            // Start at origin, initial direction
            const points = [];
            let currentOrigin = laser.origin.clone();
            let currentDirection = new THREE.Vector3().subVectors(laser.target, laser.origin).normalize();
            points.push(currentOrigin.clone());
            
            let bounces = 0;
            const maxBounces = laser.config.MAX_BOUNCES || 3;
            const maxLength = laser.config.MAX_LENGTH || 20;
            
            while (bounces < maxBounces) {
                const intersects = this.raycast(currentOrigin, currentDirection);
                if (intersects && intersects.length > 0) {
                    const hit = intersects[0];
                    const hitPoint = hit.point.clone();
                    points.push(hitPoint);
                    
                    console.log(`🔄 Laser hit at:`, hitPoint, 'bounce:', bounces);
                    
                    // Get the face normal and transform to world space
                    let normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
                    const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
                    normal.applyMatrix3(normalMatrix).normalize();
                    
                    // Ensure normal points away from incoming ray
                    if (currentDirection.dot(normal) > 0) {
                        normal.negate();
                    }
                    
                    // Reflect the direction off the surface normal
                    currentDirection.reflect(normal).normalize();
                    
                    // Move slightly off the surface to prevent self-intersection
                    currentOrigin = hitPoint.clone().add(currentDirection.clone().multiplyScalar(0.001));
                    bounces++;
                } else {
                    // No hit, extend laser to max length
                    console.log(`❌ No intersection found for laser, extending to max length`);
                    points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(maxLength)));
                    break;
                }
            }
            
            // Update line geometry with all reflection points
            if (laser.line && laser.line.geometry) {
                laser.line.geometry.setFromPoints(points);
                laser.line.geometry.attributes.position.needsUpdate = true;
            }
            
            // Update cylinder mesh to match first segment only
            if (laser.cylinder) {
                if (points.length >= 2) {
                    const start = points[0];
                    const end = points[1];
                    const delta = new THREE.Vector3().subVectors(end, start);
                    const length = delta.length();
                    laser.cylinder.position.copy(start).addScaledVector(delta, 0.5);
                    laser.cylinder.scale.set(1, length, 1);
                    laser.cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
                    laser.cylinder.visible = true;
                } else {
                    laser.cylinder.visible = false;
                }
            }
        }
    }

    // Core infrastructure only
    activeBehaviors = [];
    raycaster = new THREE.Raycaster();
    interactiveObjects = [];
    
    // Controller methods for managing behaviors
    addBehavior(behavior) {
        this.clearAllLasers(); // Always clear lasers before adding a new behavior
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
        this.clearAllLasers(); // Also clear all lasers from the scene
    }

    clearAllLasers() {
        // Remove all laser lines and cylinders from the scene
        for (const laser of this.lasers) {
            if (laser.line) this.scene.remove(laser.line);
            if (laser.cylinder) this.scene.remove(laser.cylinder);
        }
        this.lasers = [];
    }

    // Main update loop - delegates to behaviors and updates all laser geometries
    update(deltaTime, clock) {
        this.activeBehaviors.forEach(behavior => {
            behavior.update(deltaTime, clock, this);
        });
        this.updateAllLaserGeometries(); // Always update all laser geometries globally
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
