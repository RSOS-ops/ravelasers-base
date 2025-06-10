import { BehaviorDefault } from './BehaviorDefault.js';

export class BehaviorGreenLasers extends BehaviorDefault {
    constructor(config = {}) {
        const greenConfig = {
            laserColor: 0x00ff00,
            ...config
        };
        super(greenConfig);
        this.id = 'green_lasers';
    }
}
