import { BehaviorDefault } from './BehaviorDefault.js';

export class BehaviorBlueBounce extends BehaviorDefault {
    constructor(config = {}) {
        const blueConfig = {
            laserColor: 0x0000ff,
            MAX_BOUNCES: 5,
            ...config
        };
        super(blueConfig);
        this.id = 'blue_bounce';
    }
}
