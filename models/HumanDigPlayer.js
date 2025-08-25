import { DigPlayer } from './DigPlayer.js';
import readline from 'readline';


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

  async getSelectedCardsFromConsole() {
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
    return this.getSelectedCardComb()

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