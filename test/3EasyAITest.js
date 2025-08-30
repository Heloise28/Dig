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
DigGameEngine.raiseBigCardsValue(digDeck);
console.log('Dig deck created:', digDeck.toString());

const noob1 = new AIDigPlayer('Noob One', 1, 1, Personality.NOOB_BOT);
const noob2 = new AIDigPlayer('Noob Two', 2, 1, Personality.NOOB_BOT);
const noob3 = new AIDigPlayer('Noob Three', 3, 1, Personality.NOOB_BOT);

noob1.addCards(digDeck.dealTopCards(16));
noob2.addCards(digDeck.dealTopCards(16));
noob3.addCards(digDeck.dealTopCards(16));


// DigGameEngine.raiseBigCardsValue(noob.getHand());//Don't forget to raise A,2,3 value.

noob1.sortHandAscByValue();
noob2.sortHandAscByValue();
noob3.sortHandAscByValue();

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

//----------- Later you find a good placec to update hand!! --------
noob1.updateHandAnalysis(); 
noob2.updateHandAnalysis(); 
noob3.updateHandAnalysis(); 

console.log(noob1.toString());
noob1.AIEngine.printAvailableCombs(noob1);

console.log(noob2.toString());
noob2.AIEngine.printAvailableCombs(noob2);

console.log(noob3.toString());
noob3.AIEngine.printAvailableCombs(noob3);

const players = [noob1, noob2, noob3];
let playerPlayed;

console.log('\n------------  3 Noobs Begin!! ------------');

// A while is a game, end when a player clears their hand.
while (noob1.getHandSize() > 0 && noob2.getHandSize() > 0 && noob3.getHandSize() > 0) {

  // These 3 are trackers for winner of round
  // Winner gets to reset type
  let passesCount = 0;
  let lastPlayedValue = 0;
  let isOpenRound = true; // Start is open round
  let notHaveThatHeart = true;

  for (const player of players) {    
    
    /**
     * @todo take number as the # of heart paramter, and see how has it and let this player begin
     * I better use traditonal for loop for players...
     */
    AIPlayerGO(player, state);
    if (!isOpenRound) {
      // If this player passed (value to beat is the same)
      if (lastPlayedValue === state.getValue()) {
        passesCount++;

        if (passesCount === 2) {
          state.setType(CombType.NONE);
          state.setValue(0);
          state.setStraightSize(0);
          isOpenRound = true;
          passesCount = 0;
        }
      }
    
    } else {
      lastPlayedValue = state.getValue();
      isOpenRound = false;
    }
  }

}











// Also updates all round states
function AIPlayerGO(player, state) {
  let selectedComb = player.getAISelectedComb(state);

  // Handle if no card selected 
  if (selectedComb.getSize() === 0) {
    if (state.getType() === CombType.NONE) {
      throw new Error('AI passes in a when it\s supposed to open!');
    } else {
      console.log(`No cards selected. ${player.getName()} chose to pass. (I\'m in tests)`)
      return;
    }
  }

  // If there's card
  DigGameEngine.evaluateCardCombination(selectedComb, state)
  if (selectedComb.isValidCombination()) {

    // Update round stats
    state.setType(selectedComb.getType());
    state.setValue(selectedComb.getValue());
    state.setStraightSize(selectedComb.getStraightSize());
    if (state.getIsFirstRound()) state.setIsFirstRound(false);

    console.log(`\n${player.getName()} plays: ${selectedComb}`);
    player.loseSelectedCards();
    player.updateHandAnalysis(); 

  } else {
    console.log('can\'t play this!');
  
  }
  selectedComb.deselectComb();    

}