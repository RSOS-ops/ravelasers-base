import { BehaviorDefault } from './BehaviorDefault.js';

export class BehaviorYellowWide extends BehaviorDefault {
    constructor(config = {}) {
        const yellowConfig = {
            laserColor: 0xffff00,
            ORIGIN_SPHERE_RADIUS: 15,
            ...config
        };
        super(yellowConfig);
        this.id = 'yellow_wide';
    }
}
