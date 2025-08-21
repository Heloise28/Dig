import { Player } from './Player';

export class HumanPlayer extends Player {
  constructor(name, seatNumber) {
    super(name, true, seatNumber);
  } 

  playCard(card) {
    console.log(`${this.name} plays ${card.toString()}`);
  }

  //playerBid is a global to each player in Game Class
  bid(playerBid) {
  }
}   