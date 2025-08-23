import { Player } from './Player.js';

export class HumanPlayer extends Player {
  constructor(name, seatNumber) {
    super(name, true, seatNumber);
  } 

  
  /**
   * @Override
   */
  playSelectedCards() {
    cardsToPlay = player.hand.filter(
        card => card.isSelected === true
    );
    return this.hand.dealSpecificCards(cardsToPlay);
  }

  //playerBid is a global to each player in Game Class
  bid(playerBid) {
  }
}   