import { DigPlayer } from './DigPlayer.js';
import { CardCombination } from './CardCombination.js';
import readline from 'readline';

/**
 * @todo To enable AI suggestions for human players, 
 * here I will later put a function that can create
 * an AI Engine class depend on how strong you want 
 * the AI enginie to be and help you to select cards.
 * 
 */

export class HumanDigPlayer extends DigPlayer {
  constructor(name, seatNumber) {
    super(name, true, seatNumber);
  } 

  /**
   * @TODO
   */
  //playerBid is a global to each player in Game Class
  bid(playerBid) {
  }
  

  /**
   * @overide
   * @return a CardCombination of selected cards
   * to be examined by game engine.
   */
  async getCombOfSelectedCards() {
    await this.selectCardsFromConsole();
    let selectedCards = this.hand.getSelectedCards();
    return new CardCombination(selectedCards);
  }



  async selectCardsFromConsole() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    while (true) {
      const notation = await this.askQuestion('Enter card notation (or "quit" to exit): ', rl);
      
      if (notation.toLowerCase() === 'q') {
        break;
      }
      
      this.selectCardByNotation(notation);
    }

    rl.close();
  }

  //the following is the functions to select cards in console
  //in order to test
  //Requires this (seen on top): "import readline from 'readline';"
  askQuestion(question, rl) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  //for testing in console
  selectCardByNotation(notation) {
    this.hand.selectCardByNotation(notation);
  }

}   