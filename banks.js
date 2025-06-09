// banks.js
import { behaviors } from './behaviors.js';

export const banks = {
    bank1: () => [
        behaviors.default(),
        behaviors.twoLaserSweep({ laserColor: 0x00ff00 })
    ],
    
    bank2: () => [
        behaviors.randomVertex({ LASER_COUNT: 6, laserColor: 0x0066ff }),
        behaviors.singleChase({ laserColor: 0xff00ff }),
        behaviors.default({ laserColor: 0xff0000, MAX_BOUNCES: 2 })
    ],
    
    bank3: () => [
        behaviors.default({ laserColor: 0xffff00, MAX_BOUNCES: 5 }),
        behaviors.twoLaserSweep({ SWEEP_SPEED: 4.0, laserColor: 0xff6600 }),
        behaviors.randomVertex({ LASER_COUNT: 8, RETARGET_FREQUENCY: 1.0 })
    ],
    
    // Add more banks as needed - each can have different combinations
    bank4: () => [
        behaviors.singleChase({ CHASE_SPEED: 8.0, laserColor: 0x00ffff })
    ],
    
    bank5: () => [
        behaviors.default(),
        behaviors.default({ laserColor: 0x00ff00, ORIGIN_SPHERE_RADIUS: 15 }),
        behaviors.default({ laserColor: 0x0000ff, ORIGIN_SPHERE_RADIUS: 5 })
    ]
};
