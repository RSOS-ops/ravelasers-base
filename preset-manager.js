import { behaviors } from './behaviors.js';
import { banks } from './banks.js';

export class PresetManager {
  static getBehavior(behaviorId) {
    return behaviors[behaviorId];
  }

  static getBank(bankId) {
    return banks[bankId];
  }

  static getBehaviorsInBank(bankId) {
    const bank = banks[bankId];
    if (!bank) return [];
    
    return bank.behaviors.map(behaviorId => ({
      id: behaviorId,
      ...behaviors[behaviorId]
    }));
  }

  static createBehavior(id, name, description, config) {
    behaviors[id] = {
      name,
      description,
      config
    };
  }

  static exportToJSON() {
    return {
      behaviors,
      banks,
      metadata: {
        version: "1.0",
        created: new Date().toISOString()
      }
    };
  }
}