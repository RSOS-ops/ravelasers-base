import { BehaviorDefault } from './BehaviorDefault.js';

export class BehaviorRedDefault extends BehaviorDefault {
    constructor(config = {}) {
        const redConfig = {
            laserColor: 0xff0000,
            ...config
        };
        super(redConfig);
        this.id = 'red_default';
    }
}
