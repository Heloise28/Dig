import { Card } from '../models/Card.js';
import { Deck } from '../models/Deck.js';
import { HumanDigPlayer } from '../models/HumanDigPlayer.js';
import { AIDigPlayer } from '../models/AIDigPlayer.js';
import { CardCombination } from '../models/CardCombination.js';
import { Suit, CombType, Personality } from '../models/enums.js';
import { DigGameEngine } from '../models/DigGameEngine.js';
import { DigRoundState } from '../models/DigRoundState.js';



console.log('=== Testing ===');

const digDeck = DigGameEngine.createDeckForDig();
digDeck.flipDeck();
digDeck.shuffle();
console.log('Dig deck created:', digDeck.toString());

const noob = new AIDigPlayer('Noob', 1, 1, Personality.NOOB_BOT);

//For now don't deal random cards so I commented it out
//noob.addCards(digDeck.dealTopCards(16));

noob.addCards([
  new Card("4", Suit.CLUBS, true),
  new Card("4", Suit.HEARTS, true),
  new Card("4", Suit.HEARTS, true),
  new Card("5", Suit.CLUBS, true),
  new Card("6", Suit.CLUBS, true),
  new Card("7", Suit.CLUBS, true),
  
  new Card("K", Suit.CLUBS, true),
  new Card("A", Suit.CLUBS, true),
  new Card("10", Suit.CLUBS, true),
  new Card("J", Suit.CLUBS, true),
]);


DigGameEngine.raiseBigCardsValue(noob.getHand());//Don't forget to raise A,2,3 value.

noob.sortHandAscByValue();
console.log(noob.toString());

/**
 * @TODO replace with 2D array of all cards played in this game.
 * i is # of turn; j is played comb, j index is player seat #
 */
let noobPlayed;

const state = new DigRoundState();
state.setType(CombType.NONE);
state.setValue(3);
state.setStraightSize(0);
state.setIsFirstRound(true);
state.setIsOpenRound(true);

noob.updateAvailableMaxCombs();
noob.printAvailableMaxCombs();

let i = 0;
while (noob.getHandSize() > 0 && i < 1) {
  let selectedComb = noob.getAISelectedComb(state);

  if (selectedComb.getSize() === 0) {
    console.log('No cards selected. Player chose to pass. (I\'m in tests)')
  
  //else, compute
  } else {
    DigGameEngine.evaluateCardCombination(selectedComb, state)
    if (selectedComb.isValidCombination()) {
      state.setType(selectedComb.getType());
      state.setValue(selectedComb.getValue());
      state.setStraightSize(selectedComb.getStraightSize());
      state.setIsOpenRound(false);
      //update what noob player played in this turn
      noobPlayed = selectedComb;
      noob.loseSelectedCards();
      console.log('John plays: ' + noobPlayed);
      console.log(noob.toString());
    } else {
      console.log('can\'t play this!');
    
    }
    selectedComb.deselectComb();    
  
  }

  i++;
}