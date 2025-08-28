import { CardCombination } from './CardCombination.js';
import { DigPlayer } from './DigPlayer.js';
import { Personality } from './enums.js';
import { DigRoundState } from './DigRoundState.js';
import { DigEasyAIEngine } from './DigEasyAIEngine.js';



export class AIDigPlayer extends DigPlayer {
  constructor(name, seatNumber, level, personality) {
    super(name, false, seatNumber);

    //level is a number, personality is personality enum
    //why not validate first?
    
    if (!personality || !Personality.isValid(personality)) {
      throw new Error(`${suit} is not a personality!`);
    }
    if (typeof level !== 'number') {
      throw new Error('Ce niveau d\'IA n\'existe pas!');
    }
    this.level = level;
    this.personality = personality;

    if (this.level === 1) this.AIEngine = new DigEasyAIEngine();

  }

  /**
   * Call decision makers from DigAIEngine
   * @TODO will ask for 2D array of all cards played in this game as param
   * for better decision making.
   * @param { DigRoundState } state
   * @return { CardCombination }
   * 
   */
  getAISelectedComb(state) {

    if (this.level === 1) {
      return this.AIEngine.getAIcombDecision(this, state);
    }

    console.log('Invalid AI level!!')
    return new CardCombination([]);
  }


  
}