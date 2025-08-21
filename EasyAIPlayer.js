import { Player } from './Player';

export class EasyAIPlayer extends Player {
  constructor(name, seatNumber) {
    super(name, false, seatNumber);
  }

  playCard(card) {
    console.log(`${this.name} plays ${card.toString()}`);
  }

  bid(playerBid) {
    let amount = this.makeBidDecision();
    playerBid = playerBid + amount;
    console.log(`${this.name} bids ${amount} for ${playerBid}`);
  }

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