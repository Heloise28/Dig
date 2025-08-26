import { CardCombination } from './CardCombination.js';
import { DigPlayer } from './DigPlayer.js';
import { Personality } from './enums.js';
import { RoundState } from './DigRoundState.js';


export class AIDigPlayer extends DigPlayer {
  constructor(name, seatNumber, level, personality) {
    super(name, false, seatNumber);

    //level is a number, personality is personality enum
    //why not validate first?
    if (!personality || !Personality.isValid(personality)) {
      throw new Error(`${suit} is not a personality!`);
    }
    if (typeof newValue !== 'number') {
      throw new Error('Ce niveau d\'IA n\'existe pas!');
    }
    this.level = level;
    this.personality = personality;

  }

  /**
   * Call decision makers from DigAIEngine
   * @TODO will ask for 2D array of all cards played in this game as param
   * for better decision making.
   * @param { RoundState } state
   * @return { CardCombination }
   * 
   */
  getAISelectedComb(state) {
    
    if (this.level === 1) {
      return DigAIEngine.easyAIcombDecision(this, state);
    }

    console.log('This is a broken AI player. It can only pass.')
    return CardCombination([]);
  }


  
}