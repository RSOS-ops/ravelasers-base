// banks.js
import { behaviors } from './behaviors.js';

const banks = {
  "bank.1": {
    "name": "STARTER_PACK",
    "description": "Basic behaviors for beginners",
    "behaviors": ["behavior.1", "behavior.3"]
  },
  "bank.2": {
    "name": "HIGH_ENERGY",
    "description": "Intense and dynamic behaviors",
    "behaviors": ["behavior.2"]
  },
  "bank.3": {
    "name": "ALL_BEHAVIORS",
    "description": "Complete collection",
    "behaviors": ["behavior.1", "behavior.2", "behavior.3"]
  }
};

export { banks };
