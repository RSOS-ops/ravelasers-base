import { BehaviorDefault } from './BehaviorDefault.js';
import * as THREE from 'three';

export class BehaviorStaticStart extends BehaviorDefault {
    constructor(config = {}) {
        const staticConfig = {
            laserColor: 0xff0000,
            ORIGIN_SPHERE_RADIUS: 15,
            ...config
        };
        super(staticConfig);
        this.id = 'static_start';
    }

    _initializeLaserPositions(laserSystem) {
        const camera = laserSystem.getCamera();
        if (!camera) {
            super._initializeLaserPositions(laserSystem);
            return;
        }
        const aspect = camera.aspect;
        const fov = THREE.MathUtils.degToRad(camera.fov);
        const distance = this.ORIGIN_SPHERE_RADIUS;
        const height = 2 * Math.tan(fov / 2) * distance;
        const width = height * aspect;
        // Front (top corners, closer to camera)
        const frontDistance = distance * 0.8;
        this.origins[0].set(-width/2, height/2, frontDistance);   // Top-left front
        this.origins[1].set(width/2, height/2, frontDistance);    // Top-right front
        // Back (bottom corners, farther from camera)
        const backDistance = distance * 1.2;
        this.origins[2].set(-width/2, -height/2, backDistance);   // Bottom-left back
        this.origins[3].set(width/2, -height/2, backDistance);    // Bottom-right back
        // All lasers target the center
        const fixedTarget = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < 4; i++) {
            this.targets[i].copy(fixedTarget);
            this.directions[i].subVectors(this.targets[i], this.origins[i]).normalize();
        }
    }

    _handleCameraMovement() {
        // Do nothing: static
    }

    _jumpLasers() {
        // Do nothing: static
    }

    _updateLaserGeometry(laserSystem) {
        // For each laser, cast a ray, reflect off the normal, and update geometry
        for (let i = 0; i < this.laserLines.length; i++) {
            const origin = this.origins[i];
            const direction = this.directions[i];
            const points = [origin.clone()];
            let currentOrigin = origin.clone();
            let currentDirection = direction.clone();
            let bounces = 0;
            while (bounces < this.MAX_BOUNCES) {
                const intersects = laserSystem.raycast(currentOrigin, currentDirection);
                if (intersects && intersects.length > 0) {
                    const hit = intersects[0];
                    const hitPoint = hit.point.clone();
                    points.push(hitPoint);
                    // Reflect off the normal
                    const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0,1,0);
                    normal.transformDirection(hit.object.matrixWorld);
                    currentOrigin = hitPoint.clone();
                    currentDirection.reflect(normal).normalize();
                    bounces++;
                } else {
                    // No hit, extend laser
                    points.push(currentOrigin.clone().add(currentDirection.clone().multiplyScalar(this.MAX_LENGTH)));
                    break;
                }
            }
            this.laserLines[i].geometry.setFromPoints(points);
            this.laserLines[i].geometry.attributes.position.needsUpdate = true;
        }
    }
}
