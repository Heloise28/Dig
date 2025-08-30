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

const noob1 = new AIDigPlayer('Noobie', 1, 1, Personality.NOOB_BOT);
const noob2 = new AIDigPlayer('Nooblonie', 2, 1, Personality.NOOB_BOT);
const john = new HumanDigPlayer('John', 3, 1, Personality.NOOB_BOT);

noob1.addCards(digDeck.dealTopCards(17));
noob2.addCards(digDeck.dealTopCards(17));
john.addCards(digDeck.dealTopCards(18));


// DigGameEngine.raiseBigCardsValue(noob.getHand());//Don't forget to raise A,2,3 value.

noob1.sortHandAscByValue();
noob2.sortHandAscByValue();
john.sortHandAscByValue();

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
john.updateHandAnalysis(); 

console.log(noob1.toString());
noob1.AIEngine.printAvailableCombs(noob1);

console.log(noob2.toString());
noob2.AIEngine.printAvailableCombs(noob2);

console.log(john.toString());
john.AIEngine.printAvailableCombs(john);

const players = [noob1, noob2, john];

console.log('\n------------  You versus 2 noobs BEGIN! ------------');

// These 3 are trackers for winner of round
// Winner gets to reset type
let passesCount = 0;
let lastPlayedValue = 0;
let isOpenRound = true; // Start is open round

const heartValue = state.getValue() + 1; 
let i = 1000;
if (hasThatHeart(noob1, heartValue)) {
  i = 0;
} else if (hasThatHeart(noob2, heartValue)) {
  i = 1;
} else if (hasThatHeart(john, heartValue)) {
  i = 2;
} else {
  throw new Error(`What? No player has required heart?`);
}
console.log('Set first player to player index', i);

//players start to take turns.
while (i < 3) {
  let player = players[i];
  // console.log('Round begins ======== ', isOpenRound, lastPlayedValue, passesCount);

  if (!player.getIsHuman()) {
    AIPlayerGO(player, state);
  } else {
    await humanPlayerGO(player, state);
  }

  // If this player clears hand, game ends
  if (player.getHandSize() === 0) {
    console.log(`${player.getName()} first cleared their hand! WINS!`);
    break;
  }

  if (!isOpenRound) {
    // If this player passed (value to beat is the same)
    if (state.getValue() === lastPlayedValue) {
      passesCount++;

      // If count 2 passes, goes back to this player who can decide what to play.
      if (passesCount === 2) {
        state.setType(CombType.NONE);
        state.setValue(0);
        state.setStraightSize(0);
        isOpenRound = true;
      }

    } else {
      passesCount = 0;
    }
  
  } else {
    isOpenRound = false;
    passesCount = 0;
  }
  // Update lastPlayedValue to what is player played
  lastPlayedValue = state.getValue();

  // If this player still has card, move i to next player.
  i++;
  if (i === 3) i = 0;
  console.log('\nRound ends. Next player index is ', i);
}

console.log('game ends');




function hasThatHeart(player, heartValue) {
  if (heartValue < 4 || heartValue > 8) {
    throw new Error(`The requirement of a ${heartValue} of heart is impossible!`);
  }

  const heartRank = heartValue + '';
  
  for (const card of player.getHand().getCards()) {
    if (card.equalRandAndSuitWith(new Card(heartRank, Suit.HEARTS, true))) {
      return true;
    }
  }

  return false;
}



// Also updates all round states
function AIPlayerGO(player, state) {
  let selectedComb = player.getAISelectedComb(state);

  // Handle if no card selected 
  if (selectedComb.getSize() === 0) {
    if (state.getType() === CombType.NONE) {
      throw new Error('AI passes when it\s supposed to open!');
    } else {
      console.log(`No cards selected. ${player.getName()} chose to pass. (I\'m in AIPlayerGO)`)
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

async function humanPlayerGO (player, state) {
  console.log(`\n${state.getType()} ${state.getValue()} ${state.getIsFirstRound()}`);
  console.log(player.toString());
  let haveToPlay = true;
  while (haveToPlay) {
    let selectedComb = await player.getCombOfSelectedCards();
    
    // Handle if no card selected 
    if (selectedComb.getSize() === 0) {
      if (state.getType() === CombType.NONE) {
        throw new Error(`${player.getName()} passes when it\s supposed to open!`);
      } else {
        console.log(`No cards selected. ${player.getName()} chose to pass. (I\'m in AIPlayerGO)`)
        return;
      }
    
    } else {
      DigGameEngine.evaluateCardCombination(selectedComb, state)
      if (selectedComb.isValidCombination()) {
        haveToPlay = false;
        //update what player played in this turn
        state.setType(selectedComb.getType());
        state.setValue(selectedComb.getValue());
        state.setStraightSize(selectedComb.getStraightSize());      
        if (state.getIsFirstRound()) state.setIsFirstRound(false);

        console.log(`\n${player.getName()} plays: ${selectedComb}`);
        player.loseSelectedCards();

      } else {
        console.log('can\'t play this!');
      
      }
      selectedComb.deselectComb();      
    }
  }
  return;
}