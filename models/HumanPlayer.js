import { Player } from './Player.js';

export class HumanPlayer extends Player {
  constructor(name, seatNumber) {
    super(name, true, seatNumber);
  } 

  
  

  //playerBid is a global to each player in Game Class
  bid(playerBid) {
  }
}   