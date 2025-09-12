import { DigPlayer } from './DigPlayer.js';
import { CardCombination } from './CardCombination.js';
import { DigEasyAIEngine } from './DigEasyAIEngine.js';
let readline;
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // We're in Node.js
    // Because if we are in browser, readline won't work.
    readline = await import('readline');
} else {
  console.log("Not gonna import readline. We are not in console!");
}

/**
 * @todo To enable AI suggestions for human players, 
 * here I will later put a function that can create
 * an AI Engine class , or simply this.AIEngine and set to MAX AI
 * Suggestions are going to be the best
 * 
 */

export class HumanDigPlayer extends DigPlayer {
  constructor(name, seatNumber) {
    super(name, true, seatNumber);

    // But will be smarter later
    this.AIEngine = new DigEasyAIEngine();
    if (readline) {
      // Use readline for Node.js testing
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    } else {
      console.log("Console input not available in browser - use UI instead");
    }
  } 

/**
 * @param {Number} currentBid
 * @return {Number}
 */
  async bidFromConsole(currentBid) {

    let bid = 0;
    while (true) {
      bid = await this.askQuestion(`Current pit is ${currentBid}. How much do you dig?: `);
      bid = Number(bid);
      if (isNaN(bid)) console.log('You must dig a number.');
      if (bid === 0) break;
      if ((bid === 1 || bid === 2 || bid === 3) && bid > currentBid) break;
      console.log(`You need to dig deeper!`);
    }

    return bid;
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
    while (true) {
      const notation = await this.askQuestion('Enter card notation (or "quit" to exit): ');
      
      if (notation.toLowerCase() === 'q') {
        break;
      }
      
      this.selectCardByNotation(notation);
    }
  }


  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  closeReadLine() {
    this.rl.close();
    console.log(`I just closed ${this.name}'s readline.`);
  }
  //for testing in console
  selectCardByNotation(notation) {
    this.hand.selectCardByNotation(notation);
  }

}   