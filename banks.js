// banks.js
import { behaviors } from './behaviors.js';

export const banks = {
    bank1: () => behaviors.default(),
    bank2: () => behaviors.behavior2(),
    bank3: () => behaviors.behavior3(),
    // Add more banks as needed
};
