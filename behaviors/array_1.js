// BehaviorArray_1.js - Four blue lasers from corners targeting the 3D model (clone of start.js)
import * as THREE from 'three';

export class BehaviorArray_1 {    constructor(config = {}) {
        this.laserColor = config.laserColor || 0x0000ff;
        this.lasers = [];
        this.target = config.target || null; // Should be a THREE.Object3D
        this.id = 'array_1';
        
        // Animation timing
        this.startTime = null;
        this.staticDuration = 1.0; // 1 second static
        this.spreadDuration = 3.0; // 3 seconds to spread
        this.totalDuration = this.staticDuration + this.spreadDuration;
        
        // Array configuration
        this.lasersPerCorner = 8; // Each corner creates 8 lasers
        this.spreadAngle = Math.PI / 4; // 45 degrees spread angle
        this.isArrayExpanded = false;
        
        // Store original laser data for animation
        this.originalLasers = []; // Original 4 corner lasers
        this.oppositeLasers = []; // 4 opposite lasers targeting the object
        this.arrayLasers = []; // All 32 lasers (4 corners × 8 lasers each)
        this.oppositeArrayLasers = []; // All 32 opposite lasers (4 opposite corners × 8 lasers each)
        
        // Surface spread data for each corner
        this.hitFaces = []; // Store hit face info for each corner laser
        this.surfaceCoords = []; // Store local coordinate systems for each hit face
        this.oppositeHitFaces = []; // Store hit face info for each opposite laser
        this.oppositeSurfaceCoords = []; // Store local coordinate systems for each opposite hit face

        // Cylinder meshes for lasers
        this.cylinderMeshes = [];
        this.originalCylinderMeshes = [];
        this.oppositeCylinderMeshes = [];
        this.arrayCylinderMeshes = [];
        this.oppositeArrayCylinderMeshes = [];
    }    // Called to initialize lasers
    init(laserSystem) {
        this.lasers = [];
        this.originalLasers = [];
        this.oppositeLasers = [];
        this.arrayLasers = [];
        this.oppositeArrayLasers = [];
        this.hitFaces = [];
        this.surfaceCoords = [];
        this.oppositeHitFaces = [];
        this.oppositeSurfaceCoords = [];
        this.startTime = null;
        this.isArrayExpanded = false;
        
        const scene = laserSystem.getScene();
        const camera = laserSystem.getCamera();
        const target = laserSystem.getModel();
        
        const corners = this._getScreenCorners(camera, scene);
        // Defensive: ensure target and target.position exist
        const targetPos = (target && target.position) ? target.position.clone() : new THREE.Vector3(0, 0, 0);
        
        // Create the initial 4 corner lasers
        for (let i = 0; i < 4; i++) {
            // Defensive: ensure corners[i] is valid
            const start = corners[i] ? corners[i].clone() : new THREE.Vector3(0, 0, 0);
            const laser = this._createLaser(start, targetPos);
            scene.add(laser);
            // --- Cylinder mesh ---
            const cylGeom = new THREE.CylinderGeometry(0.025, 0.025, 1, 12, 1, true);
            const cylMat = new THREE.MeshStandardMaterial({ color: this.laserColor, emissive: this.laserColor, emissiveIntensity: 1, metalness: 0.7, roughness: 0.2 });
            const cylinder = new THREE.Mesh(cylGeom, cylMat);
            cylinder.castShadow = false;
            cylinder.receiveShadow = false;
            scene.add(cylinder);
            this.cylinderMeshes.push(cylinder);
            this.originalCylinderMeshes.push(cylinder);
            
            // Store original laser data
            this.originalLasers.push({
                laser: laser,
                startPos: start.clone(),
                endPos: targetPos.clone(),
                cornerIndex: i
            });
            
            this.lasers.push(laser);
        }
        
        // Create 4 opposite lasers
        this._createOppositeLasers(scene, corners, targetPos);
        
        // Find hit faces for each corner laser using raycasting
        this._findHitFaces(laserSystem, corners, targetPos);
        
        // Find hit faces for opposite lasers
        this._findOppositeHitFaces(laserSystem, corners, targetPos);
        
        // Pre-create all array lasers (initially hidden)
        this._createArrayLasers(scene, corners, targetPos);
        
        // Pre-create all opposite array lasers (initially hidden)
        this._createOppositeArrayLasers(scene, corners, targetPos);
    }// Called every frame to update laser directions
    update(deltaTime, clock, laserSystem) {
        if (this.startTime === null) {
            this.startTime = clock.getElapsedTime();
        }
        
        const elapsed = clock.getElapsedTime() - this.startTime;
        const camera = laserSystem.getCamera();
        const target = laserSystem.getModel();
        
        // Defensive: ensure target and target.position exist
        if (!target || !target.position) return;
        
        const corners = this._getScreenCorners(camera);
        const targetPos = target.position;
        
        if (elapsed < this.staticDuration) {
            // Phase 1: Static phase - just update original laser positions
            this._updateStaticPhase(corners, targetPos);
        } else if (elapsed < this.totalDuration) {
            // Phase 2: Array spreading phase
            const spreadProgress = (elapsed - this.staticDuration) / this.spreadDuration;
            this._updateSpreadPhase(corners, targetPos, spreadProgress);
        } else {
            // Phase 3: Fully expanded array
            this._updateExpandedPhase(corners, targetPos);
        }
    }    // Helper to create a laser (THREE.Line) from start to end
    _createLaser(start, end) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            start.x, start.y, start.z,
            end.x, end.y, end.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ color: this.laserColor });
        return new THREE.Line(geometry, material);
    }    // Create 4 opposite lasers that target the object from opposite directions
    _createOppositeLasers(scene, corners, targetPos) {
        for (let i = 0; i < 4; i++) {
            const cornerPos = corners[i] ? corners[i].clone() : new THREE.Vector3(0, 0, 0);
            
            // Calculate opposite position by reflecting corner through object center
            const oppositePos = this._calculateOppositePosition(cornerPos, targetPos);
            
            // Create laser from opposite position to object
            const laser = this._createLaser(oppositePos, targetPos);
            scene.add(laser);
            
            // Store opposite laser data
            this.oppositeLasers.push({
                laser: laser,
                startPos: oppositePos.clone(),
                endPos: targetPos.clone(),
                cornerIndex: i
            });
            
            this.lasers.push(laser);
        }
    }

    // Calculate opposite position by reflecting through object center
    _calculateOppositePosition(cornerPos, objectCenter) {
        // Vector from object to corner
        const toCorner = new THREE.Vector3().subVectors(cornerPos, objectCenter);
        
        // Opposite position is object center minus the vector to corner
        const oppositePos = new THREE.Vector3().subVectors(objectCenter, toCorner);
        
        return oppositePos;
    }

    // Create all array lasers (initially invisible)
    _createArrayLasers(scene, corners, targetPos) {
        for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
            const cornerStart = corners[cornerIndex] ? corners[cornerIndex].clone() : new THREE.Vector3(0, 0, 0);
            
            for (let laserIndex = 0; laserIndex < this.lasersPerCorner; laserIndex++) {
                const laser = this._createLaser(cornerStart, targetPos);
                laser.visible = false; // Start invisible
                scene.add(laser);
                
                this.arrayLasers.push({
                    laser: laser,
                    cornerIndex: cornerIndex,
                    laserIndex: laserIndex,
                    originalStart: cornerStart.clone(),
                    originalEnd: targetPos.clone()
                });
            }
        }
    }

    // Create all opposite array lasers (initially invisible)
    _createOppositeArrayLasers(scene, corners, targetPos) {
        for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
            const cornerPos = corners[cornerIndex] ? corners[cornerIndex].clone() : new THREE.Vector3(0, 0, 0);
            const oppositeStart = this._calculateOppositePosition(cornerPos, targetPos);
            
            for (let laserIndex = 0; laserIndex < this.lasersPerCorner; laserIndex++) {
                const laser = this._createLaser(oppositeStart, targetPos);
                laser.visible = false; // Start invisible
                scene.add(laser);
                
                this.oppositeArrayLasers.push({
                    laser: laser,
                    cornerIndex: cornerIndex,
                    laserIndex: laserIndex,
                    originalStart: oppositeStart.clone(),
                    originalEnd: targetPos.clone()
                });
            }
        }
    }

    // Find where each corner laser hits the object surface
    _findHitFaces(laserSystem, corners, targetPos) {
        this.hitFaces = [];
        this.surfaceCoords = [];
        
        for (let i = 0; i < 4; i++) {
            const start = corners[i] ? corners[i].clone() : new THREE.Vector3(0, 0, 0);
            const direction = new THREE.Vector3().subVectors(targetPos, start).normalize();
            
            // Raycast to find intersection
            const intersects = laserSystem.raycast(start, direction);
            
            if (intersects.length > 0) {
                const intersection = intersects[0];
                const hitPoint = intersection.point.clone();
                const face = intersection.face;
                const object = intersection.object;
                
                // Get world-space normal
                const faceNormal = face.normal.clone();
                const worldNormal = new THREE.Vector3();
                worldNormal.copy(faceNormal).transformDirection(object.matrixWorld).normalize();
                
                // Create local coordinate system on the hit face
                const surfaceCoord = this._createSurfaceCoordinateSystem(hitPoint, worldNormal, direction);
                
                this.hitFaces.push({
                    hitPoint: hitPoint,
                    normal: worldNormal,
                    face: face,
                    object: object
                });
                
                this.surfaceCoords.push(surfaceCoord);
                
                console.log(`🎯 Corner ${i} hit face at:`, hitPoint, 'normal:', worldNormal);
            } else {
                // Fallback if no hit detected
                console.warn(`⚠️ No hit detected for corner ${i}, using default`);
                this.hitFaces.push({
                    hitPoint: targetPos.clone(),
                    normal: new THREE.Vector3(0, 1, 0),
                    face: null,
                    object: null
                });
                
                this.surfaceCoords.push({
                    center: targetPos.clone(),
                    tangent1: new THREE.Vector3(1, 0, 0),
                    tangent2: new THREE.Vector3(0, 0, 1),
                    normal: new THREE.Vector3(0, 1, 0)
                });
            }
        }
    }

    // Find where each opposite laser hits the object surface
    _findOppositeHitFaces(laserSystem, corners, targetPos) {
        this.oppositeHitFaces = [];
        this.oppositeSurfaceCoords = [];
        
        for (let i = 0; i < 4; i++) {
            const cornerPos = corners[i] ? corners[i].clone() : new THREE.Vector3(0, 0, 0);
            const oppositePos = this._calculateOppositePosition(cornerPos, targetPos);
            const direction = new THREE.Vector3().subVectors(targetPos, oppositePos).normalize();
            
            // Raycast to find intersection
            const intersects = laserSystem.raycast(oppositePos, direction);
            
            if (intersects.length > 0) {
                const intersection = intersects[0];
                const hitPoint = intersection.point.clone();
                const face = intersection.face;
                const object = intersection.object;
                
                // Get world-space normal
                const faceNormal = face.normal.clone();
                const worldNormal = new THREE.Vector3();
                worldNormal.copy(faceNormal).transformDirection(object.matrixWorld).normalize();
                
                // Create local coordinate system on the hit face
                const surfaceCoord = this._createSurfaceCoordinateSystem(hitPoint, worldNormal, direction);
                
                this.oppositeHitFaces.push({
                    hitPoint: hitPoint,
                    normal: worldNormal,
                    face: face,
                    object: object
                });
                
                this.oppositeSurfaceCoords.push(surfaceCoord);
                
                console.log(`🎯 Opposite ${i} hit face at:`, hitPoint, 'normal:', worldNormal);
            } else {
                // Fallback if no hit detected
                console.warn(`⚠️ No hit detected for opposite ${i}, using default`);
                this.oppositeHitFaces.push({
                    hitPoint: targetPos.clone(),
                    normal: new THREE.Vector3(0, 1, 0),
                    face: null,
                    object: null
                });
                
                this.oppositeSurfaceCoords.push({
                    center: targetPos.clone(),
                    tangent1: new THREE.Vector3(1, 0, 0),
                    tangent2: new THREE.Vector3(0, 0, 1),
                    normal: new THREE.Vector3(0, 1, 0)
                });
            }
        }
    }

    // Create a local coordinate system on the hit face surface
    _createSurfaceCoordinateSystem(hitPoint, normal, incomingDirection) {
        // Create two tangent vectors perpendicular to the normal
        const tangent1 = new THREE.Vector3();
        const tangent2 = new THREE.Vector3();
        
        // Find a vector not parallel to the normal to use as reference
        const reference = Math.abs(normal.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        
        // Create first tangent by crossing normal with reference
        tangent1.crossVectors(normal, reference).normalize();
        
        // Create second tangent perpendicular to both normal and first tangent
        tangent2.crossVectors(normal, tangent1).normalize();
        
        return {
            center: hitPoint,
            tangent1: tangent1,
            tangent2: tangent2,
            normal: normal
        };
    }

    // Update during static phase (first 1 second)
    _updateStaticPhase(corners, targetPos) {
        // Update original lasers
        for (let i = 0; i < this.originalLasers.length; i++) {
            const laserData = this.originalLasers[i];
            const laser = laserData.laser;
            const cylinder = this.originalCylinderMeshes[i];
            if (!laser || !cylinder) continue;
            
            // Update original laser positions
            const start = corners[i] ? corners[i] : new THREE.Vector3(0, 0, 0);
            const positions = laser.geometry.attributes.position.array;
            positions[0] = start.x;
            positions[1] = start.y;
            positions[2] = start.z;
            positions[3] = targetPos.x;
            positions[4] = targetPos.y;
            positions[5] = targetPos.z;
            laser.geometry.attributes.position.needsUpdate = true;
            // --- Cylinder update ---
            const delta = new THREE.Vector3().subVectors(targetPos, start);
            const length = delta.length();
            cylinder.position.copy(start).addScaledVector(delta, 0.5);
            cylinder.scale.set(1, length, 1);
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
            cylinder.visible = true;
        }
        
        // Update opposite lasers
        for (let i = 0; i < this.oppositeLasers.length; i++) {
            const laserData = this.oppositeLasers[i];
            const laser = laserData.laser;
            
            if (!laser) continue;
            
            // Calculate new opposite position based on current corner
            const cornerPos = corners[i] ? corners[i] : new THREE.Vector3(0, 0, 0);
            const oppositePos = this._calculateOppositePosition(cornerPos, targetPos);
            
            // Update opposite laser positions
            const positions = laser.geometry.attributes.position.array;
            positions[0] = oppositePos.x;
            positions[1] = oppositePos.y;
            positions[2] = oppositePos.z;
            positions[3] = targetPos.x;
            positions[4] = targetPos.y;
            positions[5] = targetPos.z;
            laser.geometry.attributes.position.needsUpdate = true;
        }
    }    // Update during spread phase (3 seconds of spreading)
    _updateSpreadPhase(corners, targetPos, progress) {
        // Smooth easing function for more natural animation
        const easedProgress = this._easeInOutCubic(progress);
        
        // Hide original lasers and show array lasers
        if (!this.isArrayExpanded) {
            this.originalLasers.forEach(data => data.laser.visible = false);
            this.oppositeLasers.forEach(data => data.laser.visible = false);
            this.arrayLasers.forEach(data => data.laser.visible = true);
            this.oppositeArrayLasers.forEach(data => data.laser.visible = true);
            this.isArrayExpanded = true;
        }
        
        // Update each array laser to spread across the hit surface
        this.arrayLasers.forEach(data => {
            const { laser, cornerIndex, laserIndex } = data;
            const corner = corners[cornerIndex] ? corners[cornerIndex] : new THREE.Vector3(0, 0, 0);
            
            // Get the hit face data for this corner
            const hitFace = this.hitFaces[cornerIndex];
            const surfaceCoord = this.surfaceCoords[cornerIndex];
            
            if (!hitFace || !surfaceCoord) return;
            
            // Calculate spread position on the surface
            const surfaceOffset = this._calculateSurfaceSpreadOffset(cornerIndex, laserIndex, easedProgress, surfaceCoord);
            
            // Calculate new start position (spread from corner towards hit point)
            const directionToHit = new THREE.Vector3().subVectors(hitFace.hitPoint, corner).normalize();
            const startSpread = corner.clone().add(directionToHit.clone().multiplyScalar(easedProgress * 2.0));
            
            // Calculate new end position (spread across the surface)
            const newEnd = hitFace.hitPoint.clone().add(surfaceOffset);
            
            // Update laser positions
            const positions = laser.geometry.attributes.position.array;
            positions[0] = startSpread.x;
            positions[1] = startSpread.y;
            positions[2] = startSpread.z;
            positions[3] = newEnd.x;
            positions[4] = newEnd.y;
            positions[5] = newEnd.z;
            laser.geometry.attributes.position.needsUpdate = true;
        });
        
        // Update each opposite array laser to spread across their hit surfaces
        this.oppositeArrayLasers.forEach(data => {
            const { laser, cornerIndex, laserIndex } = data;
            const cornerPos = corners[cornerIndex] ? corners[cornerIndex] : new THREE.Vector3(0, 0, 0);
            const oppositeCorner = this._calculateOppositePosition(cornerPos, targetPos);
            
            // Get the hit face data for this opposite corner
            const hitFace = this.oppositeHitFaces[cornerIndex];
            const surfaceCoord = this.oppositeSurfaceCoords[cornerIndex];
            
            if (!hitFace || !surfaceCoord) return;
            
            // Calculate spread position on the surface
            const surfaceOffset = this._calculateSurfaceSpreadOffset(cornerIndex, laserIndex, easedProgress, surfaceCoord);
            
            // Calculate new start position (spread from opposite corner towards hit point)
            const directionToHit = new THREE.Vector3().subVectors(hitFace.hitPoint, oppositeCorner).normalize();
            const startSpread = oppositeCorner.clone().add(directionToHit.clone().multiplyScalar(easedProgress * 2.0));
            
            // Calculate new end position (spread across the surface)
            const newEnd = hitFace.hitPoint.clone().add(surfaceOffset);
            
            // Update laser positions
            const positions = laser.geometry.attributes.position.array;
            positions[0] = startSpread.x;
            positions[1] = startSpread.y;
            positions[2] = startSpread.z;
            positions[3] = newEnd.x;
            positions[4] = newEnd.y;
            positions[5] = newEnd.z;
            laser.geometry.attributes.position.needsUpdate = true;
        });
    }

    // Update during expanded phase (after animation completes)
    _updateExpandedPhase(corners, targetPos) {
        // Continue updating positions as camera/target moves
        this._updateSpreadPhase(corners, targetPos, 1.0); // Full spread
    }    // Calculate spread offset for a specific laser across the hit surface
    _calculateSurfaceSpreadOffset(cornerIndex, laserIndex, progress, surfaceCoord) {
        // Create a grid pattern on the surface using the tangent vectors
        const gridSize = Math.ceil(Math.sqrt(this.lasersPerCorner)); // 3x3 grid for 8 lasers
        const row = Math.floor(laserIndex / gridSize);
        const col = laserIndex % gridSize;
        
        // Normalize grid coordinates to [-1, 1] range
        const normalizedRow = (row / (gridSize - 1)) * 2 - 1;
        const normalizedCol = (col / (gridSize - 1)) * 2 - 1;
        
        // Maximum spread distance on surface (increases with progress)
        const maxSpread = 3.0 * progress;
        
        // Calculate offset using surface tangent vectors
        const offset1 = surfaceCoord.tangent1.clone().multiplyScalar(normalizedCol * maxSpread);
        const offset2 = surfaceCoord.tangent2.clone().multiplyScalar(normalizedRow * maxSpread);
        
        // Combine the offsets to get final surface position
        return offset1.add(offset2);
    }

    // Legacy method - kept for compatibility but now uses surface spreading
    _calculateSpreadOffset(cornerIndex, laserIndex, progress) {
        // This method is replaced by _calculateSurfaceSpreadOffset
        // but kept for backward compatibility if needed
        const angleStep = (2 * Math.PI) / this.lasersPerCorner;
        const angle = laserIndex * angleStep;
        
        const maxDistance = 5.0 * progress;
        const offsetX = Math.cos(angle) * maxDistance;
        const offsetY = Math.sin(angle) * maxDistance;
        const offsetZ = Math.sin(angle * 2) * maxDistance * 0.5;
        
        return new THREE.Vector3(offsetX, offsetY, offsetZ);
    }

    // Smooth easing function for animation
    _easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Get world positions for the 4 screen corners
    _getScreenCorners(camera, scene) {
        // Defensive: ensure camera is defined and has projectionMatrixInverse
        if (!camera || typeof camera.unproject !== 'function' || !camera.projectionMatrixInverse) {
            // Fallback: return corners at visible positions
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
    }    // Cleanup method to remove lasers from the scene
    cleanup(laserSystem) {
        // Remove original lasers from the scene
        if (this.originalLasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.originalLasers.forEach(data => {
                if (data.laser) {
                    scene.remove(data.laser);
                }
            });
        }
        
        // Remove opposite lasers from the scene
        if (this.oppositeLasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.oppositeLasers.forEach(data => {
                if (data.laser) {
                    scene.remove(data.laser);
                }
            });
        }
        
        // Remove array lasers from the scene
        if (this.arrayLasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.arrayLasers.forEach(data => {
                if (data.laser) {
                    scene.remove(data.laser);
                }
            });
        }
        
        // Remove opposite array lasers from the scene
        if (this.oppositeArrayLasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.oppositeArrayLasers.forEach(data => {
                if (data.laser) {
                    scene.remove(data.laser);
                }
            });
        }
        
        // Remove all lasers from the main array
        if (this.lasers && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.lasers.forEach(laser => scene.remove(laser));
        }
        
        // Remove cylinder meshes from the scene
        if (this.cylinderMeshes && laserSystem && laserSystem.getScene) {
            const scene = laserSystem.getScene();
            this.cylinderMeshes.forEach(cyl => scene.remove(cyl));
        }
        
        // Clear all arrays
        this.lasers = [];
        this.originalLasers = [];
        this.oppositeLasers = [];
        this.arrayLasers = [];
        this.oppositeArrayLasers = [];
        this.cylinderMeshes = [];
        this.originalCylinderMeshes = [];
        this.oppositeCylinderMeshes = [];
        this.arrayCylinderMeshes = [];
        this.oppositeArrayCylinderMeshes = [];
        this.isArrayExpanded = false;
        this.startTime = null;
    }
}

export default BehaviorArray_1;