import * as THREE from 'three';

// Helper function (originally global, now can be part of the class or local to this module if not used elsewhere)
function getRandomPointOnSphere(center, radius) { // Renamed for generic use if needed
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

function getRandomTargetVertex(verticesArray) { // Renamed for generic use
    if (!verticesArray || verticesArray.length === 0) {
        console.warn("getRandomTargetVertex: modelVertices array is empty or undefined. Returning default Vector3(0,0,0).");
        return new THREE.Vector3();
    }
    const randomIndex = Math.floor(Math.random() * verticesArray.length);
    return verticesArray[randomIndex].clone();
}

export class LaserSystem {
    constructor(scene, model, controls, camera) { // Added controls and camera as dependencies
        this.scene = scene;
        this.model = model;
        this.controls = controls; // OrbitControls instance
        this.camera = camera;     // Main camera

        // Configuration Parameters (will be set by applyPreset)
        this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS = 10;
        this.RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT = 0.16666666666666666;
        this.BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY = 0.5;
        this.RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY_SENSITIVITY = 5.0;
        this.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS = 0.3;
        this.MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS = 2.5;
        this.MAX_RAVE_LASER_SYSTEM_1_LENGTH = 20;
        this.MAX_BOUNCES = 3;
        this.laserColor = new THREE.Color(0xff0000); // Default color

        // Camera Movement Tracking State (specific to laser system jump logic)
        this.previousCameraPosition = new THREE.Vector3();
        this.previousCameraQuaternion = new THREE.Quaternion();
        this.stillnessTimer = 0;
        // These might be better managed in main.js if they are for general camera state,
        // but RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT is tied to laser jumps.
        this.CAMERA_ROTATION_THRESHOLD = THREE.MathUtils.degToRad(15); // Made properties
        this.CAMERA_POSITION_THRESHOLD = 0.1;                     // Made properties


        this.raveLaserSystem1Raycaster = new THREE.Raycaster();
        this.interactiveObjects = [];
        if (this.model) {
            this.interactiveObjects.push(this.model);
        }

        this.modelVertices = []; // To store world coordinates of model vertices
        this._extractModelVertices();

        // Laser Objects
        this.raveLaserSystem1Line = null;
        this.raveLaserSystem1Origin1 = new THREE.Vector3();
        this.raveLaserSystem1InitialDirection1 = new THREE.Vector3(0, 0, -1);
        this.raveLaserSystem1TargetVertex1 = new THREE.Vector3(); // Will be set to (0,0,0)

        this.raveLaserSystem1Line2 = null;
        this.raveLaserSystem1Origin2 = new THREE.Vector3();
        this.raveLaserSystem1InitialDirection2 = new THREE.Vector3(0, 0, -1);
        this.raveLaserSystem1TargetVertex2 = new THREE.Vector3(); // Will be set to (0,0,0)

        this.raveLaserSystem1Line3 = null;
        this.raveLaserSystem1Origin3 = new THREE.Vector3();
        this.raveLaserSystem1InitialDirection3 = new THREE.Vector3(0, 0, -1);
        this.raveLaserSystem1TargetVertex3 = new THREE.Vector3(); // Will be set to (0,0,0)

        this.raveLaserSystem1Line4 = null;
        this.raveLaserSystem1Origin4 = new THREE.Vector3();
        this.raveLaserSystem1InitialDirection4 = new THREE.Vector3(0, 0, -1);
        this.raveLaserSystem1TargetVertex4 = new THREE.Vector3(); // Will be set to (0,0,0)

        this.raveLaserSystem1Material = new THREE.LineBasicMaterial({ color: this.laserColor });
        this.raveLaserSystem1Material2 = new THREE.LineBasicMaterial({ color: this.laserColor });
        this.raveLaserSystem1Material3 = new THREE.LineBasicMaterial({ color: this.laserColor });
        this.raveLaserSystem1Material4 = new THREE.LineBasicMaterial({ color: this.laserColor });


        this._setupLaserLines(); // Call setup
        this.initializeLasers(); // Initialize origins and targets
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

    _setupLaserLines() {
        const points = [new THREE.Vector3(), new THREE.Vector3(0,0,1)]; // Dummy points

        const geom1 = new THREE.BufferGeometry().setFromPoints(points);
        this.raveLaserSystem1Line = new THREE.Line(geom1, this.raveLaserSystem1Material);
        this.scene.add(this.raveLaserSystem1Line);

        const geom2 = new THREE.BufferGeometry().setFromPoints(points);
        this.raveLaserSystem1Line2 = new THREE.Line(geom2, this.raveLaserSystem1Material2);
        this.scene.add(this.raveLaserSystem1Line2);

        const geom3 = new THREE.BufferGeometry().setFromPoints(points);
        this.raveLaserSystem1Line3 = new THREE.Line(geom3, this.raveLaserSystem1Material3);
        this.scene.add(this.raveLaserSystem1Line3);

        const geom4 = new THREE.BufferGeometry().setFromPoints(points);
        this.raveLaserSystem1Line4 = new THREE.Line(geom4, this.raveLaserSystem1Material4);
        this.scene.add(this.raveLaserSystem1Line4);
    }

    initializeLasers() {
        const fixedTarget = new THREE.Vector3(0, 0, 0); // All lasers target origin

        if (this.modelVertices.length === 0) { // Still good to have a fallback, though origins are random
            console.warn("LaserSystem.initializeLasers: model vertices not ready for robust origin sphere checks, but origins will be random relative to view target.");
            // Origins will be random around camera target or sphere radius if controls.target is (0,0,0)
            const originCenter = this.controls ? this.controls.target : new THREE.Vector3();
            this.raveLaserSystem1Origin1 = getRandomPointOnSphere(originCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
            this.raveLaserSystem1Origin2 = getRandomPointOnSphere(originCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
            this.raveLaserSystem1Origin3 = getRandomPointOnSphere(originCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
            this.raveLaserSystem1Origin4 = getRandomPointOnSphere(originCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
        } else {
            // Get random origins on the sphere
            const targetCenter = this.controls.target;
            this.raveLaserSystem1Origin1 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
            this.raveLaserSystem1Origin2 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
            this.raveLaserSystem1Origin3 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
            this.raveLaserSystem1Origin4 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
        }

        // Set fixed target for all lasers
        this.raveLaserSystem1TargetVertex1.copy(fixedTarget);
        this.raveLaserSystem1TargetVertex2.copy(fixedTarget);
        this.raveLaserSystem1TargetVertex3.copy(fixedTarget);
        this.raveLaserSystem1TargetVertex4.copy(fixedTarget);

        // Calculate initial directions based on new origins and fixed target
        this.raveLaserSystem1InitialDirection1.subVectors(this.raveLaserSystem1TargetVertex1, this.raveLaserSystem1Origin1).normalize();
        this.raveLaserSystem1InitialDirection2.subVectors(this.raveLaserSystem1TargetVertex2, this.raveLaserSystem1Origin2).normalize();
        this.raveLaserSystem1InitialDirection3.subVectors(this.raveLaserSystem1TargetVertex3, this.raveLaserSystem1Origin3).normalize();
        this.raveLaserSystem1InitialDirection4.subVectors(this.raveLaserSystem1TargetVertex4, this.raveLaserSystem1Origin4).normalize();

        console.log("LaserSystem: Lasers initialized with fixed target (0,0,0) and static origins.");
    }

    applyPreset(config) {
        console.log("LaserSystem: Applying preset:", config);
        this.MAX_BOUNCES = config.MAX_BOUNCES !== undefined ? config.MAX_BOUNCES : this.MAX_BOUNCES;
        this.MAX_RAVE_LASER_SYSTEM_1_LENGTH = config.MAX_RAVE_LASER_SYSTEM_1_LENGTH !== undefined ? config.MAX_RAVE_LASER_SYSTEM_1_LENGTH : this.MAX_RAVE_LASER_SYSTEM_1_LENGTH;
        this.RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT = config.RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT !== undefined ? config.RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT : this.RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT;
        this.BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY = config.BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY !== undefined ? config.BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY : this.BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY;
        this.RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY_SENSITIVITY = config.RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY_SENSITIVITY !== undefined ? config.RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY_SENSITIVITY : this.RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY_SENSITIVITY;
        this.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS = config.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS !== undefined ? config.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS : this.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS;
        this.MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS = config.MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS !== undefined ? config.MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS : this.MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS;

        if (config.laserColor !== undefined) {
            this.laserColor.set(config.laserColor); // Assuming laserColor is a hex string like "0xff0000"
            this.raveLaserSystem1Material.color.set(this.laserColor);
            this.raveLaserSystem1Material2.color.set(this.laserColor);
            this.raveLaserSystem1Material3.color.set(this.laserColor);
            this.raveLaserSystem1Material4.color.set(this.laserColor);
        }
        // RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS could also be part of presets if desired
    }

    _updateLaserLineGeometry(laserLineObj, origin, direction) {
        const points = [];
        let currentOrigin = origin.clone();
        let currentDirection = direction.clone();
        points.push(currentOrigin.clone());

        for (let i = 0; i < this.MAX_BOUNCES; i++) {
            this.raveLaserSystem1Raycaster.set(currentOrigin, currentDirection);
            const intersects = this.raveLaserSystem1Raycaster.intersectObjects(this.interactiveObjects, true);

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

                if (i === this.MAX_BOUNCES - 1) {
                    points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_RAVE_LASER_SYSTEM_1_LENGTH)));
                }
            } else {
                points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_RAVE_LASER_SYSTEM_1_LENGTH)));
                break;
            }
        }
        laserLineObj.geometry.setFromPoints(points);
        laserLineObj.geometry.attributes.position.needsUpdate = true;
    }

    _handleLaserJumpLogic() {
        // This function is no longer called from update() for static behavior,
        // but kept for potential future use with dynamic presets.
        if (this.modelVertices.length === 0) {
            return;
        }
        const targetCenter = this.controls.target;

        this.raveLaserSystem1Origin1 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
        this.raveLaserSystem1TargetVertex1 = getRandomTargetVertex(this.modelVertices); // This would revert to random target if called
        this.raveLaserSystem1InitialDirection1.subVectors(this.raveLaserSystem1TargetVertex1, this.raveLaserSystem1Origin1).normalize();

        this.raveLaserSystem1Origin2 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
        this.raveLaserSystem1TargetVertex2 = getRandomTargetVertex(this.modelVertices);
        this.raveLaserSystem1InitialDirection2.subVectors(this.raveLaserSystem1TargetVertex2, this.raveLaserSystem1Origin2).normalize();

        this.raveLaserSystem1Origin3 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
        this.raveLaserSystem1TargetVertex3 = getRandomTargetVertex(this.modelVertices);
        this.raveLaserSystem1InitialDirection3.subVectors(this.raveLaserSystem1TargetVertex3, this.raveLaserSystem1Origin3).normalize();

        this.raveLaserSystem1Origin4 = getRandomPointOnSphere(targetCenter, this.RAVE_LASER_SYSTEM_1_ORIGIN_SPHERE_RADIUS);
        this.raveLaserSystem1TargetVertex4 = getRandomTargetVertex(this.modelVertices);
        this.raveLaserSystem1InitialDirection4.subVectors(this.raveLaserSystem1TargetVertex4, this.raveLaserSystem1Origin4).normalize();
    }

    update(deltaTime, clock) {
        // --- MODIFIED PART ---
        // Commented out camera stillness/movement detection and _handleLaserJumpLogic call
        /*
        let deltaRotation = 0;
        let deltaPosition = 0;

        if (this.camera && this.previousCameraPosition && this.previousCameraQuaternion) {
            if (this.previousCameraPosition.lengthSq() === 0 && this.previousCameraQuaternion.x === 0 && this.previousCameraQuaternion.y === 0 && this.previousCameraQuaternion.z === 0 && this.previousCameraQuaternion.w === 1) {
                this.previousCameraPosition.copy(this.camera.position);
                this.previousCameraQuaternion.copy(this.camera.quaternion);
            }

            deltaRotation = this.previousCameraQuaternion.angleTo(this.camera.quaternion);
            deltaPosition = this.previousCameraPosition.distanceTo(this.camera.position);
            let hasCameraMovedSignificantly = false;

            if (deltaRotation > this.CAMERA_ROTATION_THRESHOLD || deltaPosition > this.CAMERA_POSITION_THRESHOLD) {
                this.stillnessTimer = 0;
                hasCameraMovedSignificantly = true;
            } else {
                this.stillnessTimer += deltaTime;
                if (this.stillnessTimer >= this.RAVE_LASER_SYSTEM_1_STILLNESS_LIMIT) {
                    this.stillnessTimer = 0;
                    hasCameraMovedSignificantly = true;
                }
            }

            // if (hasCameraMovedSignificantly) {
            //     this._handleLaserJumpLogic(); // Call is commented out/removed
            // }

            this.previousCameraPosition.copy(this.camera.position);
            this.previousCameraQuaternion.copy(this.camera.quaternion);
        }
        */
        // --- END MODIFIED PART ---

        // Laser Pulsing Logic (assuming this should still run)
        // If deltaPosition and deltaRotation are needed for pulsing and they are not calculated above,
        // this part might need adjustment or use of last known values.
        // For now, let's assume pulsing continues based on preset params, not dynamic camera speed.
        // To simplify, we can remove cameraSpeed influence on pulsing for this static mode.

        // Simplified pulsing: uses base frequency, not affected by camera movement
        const currentPulseFrequency = this.BASE_RAVE_LASER_SYSTEM_1_PULSE_FREQUENCY;
        const sharedPulseIntensity = (Math.sin(clock.elapsedTime * currentPulseFrequency * Math.PI * 2) + 1) / 2;
        const brightnessScalar = this.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS + (sharedPulseIntensity * (this.MAX_RAVE_LASER_SYSTEM_1_BRIGHTNESS - this.MIN_RAVE_LASER_SYSTEM_1_BRIGHTNESS));

        const currentLaserColorHex = parseInt(this.laserColor.getHexString(), 16);

        if (this.raveLaserSystem1Line && this.raveLaserSystem1Line.material) {
            this.raveLaserSystem1Line.material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
        }
        if (this.raveLaserSystem1Line2 && this.raveLaserSystem1Line2.material) {
            this.raveLaserSystem1Line2.material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
        }
        if (this.raveLaserSystem1Line3 && this.raveLaserSystem1Line3.material) {
            this.raveLaserSystem1Line3.material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
        }
        if (this.raveLaserSystem1Line4 && this.raveLaserSystem1Line4.material) {
            this.raveLaserSystem1Line4.material.color.setHex(currentLaserColorHex).multiplyScalar(brightnessScalar);
        }

        // Update laser line geometries
        if (this.raveLaserSystem1Line && this.raveLaserSystem1Origin1 && this.raveLaserSystem1InitialDirection1) {
            this._updateLaserLineGeometry(this.raveLaserSystem1Line, this.raveLaserSystem1Origin1, this.raveLaserSystem1InitialDirection1);
        }
        if (this.raveLaserSystem1Line2 && this.raveLaserSystem1Origin2 && this.raveLaserSystem1InitialDirection2) {
            this._updateLaserLineGeometry(this.raveLaserSystem1Line2, this.raveLaserSystem1Origin2, this.raveLaserSystem1InitialDirection2);
        }
        if (this.raveLaserSystem1Line3 && this.raveLaserSystem1Origin3 && this.raveLaserSystem1InitialDirection3) {
            this._updateLaserLineGeometry(this.raveLaserSystem1Line3, this.raveLaserSystem1Origin3, this.raveLaserSystem1InitialDirection3);
        }
        if (this.raveLaserSystem1Line4 && this.raveLaserSystem1Origin4 && this.raveLaserSystem1InitialDirection4) {
            this._updateLaserLineGeometry(this.raveLaserSystem1Line4, this.raveLaserSystem1Origin4, this.raveLaserSystem1InitialDirection4);
        }
    }
}
