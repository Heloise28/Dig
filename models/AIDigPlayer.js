import { DigPlayer } from './DigPlayer.js';
import { CombType } from './enums.js';


/**
 * @TODO
 * put evaluate all playable combs in super? or static here. Human need it for hints
 * but do human need availableCombinations?
 * 
 * The score for each comb -> Can be the % that it's a turn winning comb.
 */
export class AIDigPlayer extends DigPlayer {
  constructor(name, seatNumber) {
    super(name, false, seatNumber);

  }

  /**
   * @TODO 下面这是随便写的
   */
  makeBidDecision() {
    let bigCardCount = this.hand.countCardsByRank('A') 
    + this.hand.countCardsByRank('2')
    + this.hand.countCardsByRank('3');

    if (bigCardCount > 5) {
        return 3;
    } else if (bigCardCount > 4) {
        return 2;
    } else if (bigCardCount > 3) {
        return 1;
    } else {
        return 0;
    }
  }


  
}