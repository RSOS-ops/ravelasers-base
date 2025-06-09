// banks.js
import { behaviors } from './behaviors.js';

export const banks = {
    bank1: () => [
        behaviors.default()
    ],
    
    bank2: () => [
        behaviors.default({ laserColor: 0x00ff00 })
    ],
    
    bank3: () => [
        behaviors.default({ laserColor: 0x0000ff, MAX_BOUNCES: 5 })
    ],
    
    bank4: () => [
        behaviors.default({ laserColor: 0xffff00, ORIGIN_SPHERE_RADIUS: 15 })
    ],
    
    bank5: () => [
        behaviors.default(),
        behaviors.default({ laserColor: 0x00ff00, ORIGIN_SPHERE_RADIUS: 15 }),
        behaviors.default({ laserColor: 0x0000ff, ORIGIN_SPHERE_RADIUS: 5 })
    ]
};
