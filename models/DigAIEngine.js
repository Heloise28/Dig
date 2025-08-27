
import { CardCombination } from "./CardCombination.js";
import { CombType, Suit } from "./enums.js";
import { DigRoundState } from "./DigRoundState.js";


export class DigAIEngine {

  /**
 * @abstract
 * The core function, implemented by each AIEngine.
 * @param { CardCombination} availableCombinations
 * @param { DigRoundState } state
 * @return {CardCombination} the card combination AI choses, don't forget to select them!
 */
  getAIcombDecision(player, state) {}











  /**
   * @TODO As you build child class of harder AI
   * You may want to move some helper/utility functions from DigEasyAI to here.
   * Like I have a findStraightBreakingValues()!!, might be useful later for complex decision.
   */

  
  /**
   * Like this is an untility function, independent from AI level
   * translate an array of card values to a CardCombination
   * @param {DigPlayer}
   * @param {Array<Number>} values that is AI player decides to play.
   * @param: And many DigRoundStates Things
   * @return {CardCombination} translate to combination of actual cards in this AI player's hand
  */
  findCombsToPlay(player, values, typeOfTurn, straightSizeOfTurn, isFirstRound, valueToBeat) {
    if (values.length <= 0) {
      console.log('You asked me to find comb of nothing.');
      return new CardCombination([]);
    }

    //foundCards is an array<Card>
    const foundCards = player.getHand().getCardsByValue(values);
    console.log('Hmm...So AI picked these cards: ' + foundCards);

    //if is first round, make sure there's a ♥ and just one above valueToBeat;
    if (isFirstRound) {
      console.log('Is first round! Gonna need a ' + (valueToBeat + 1) + ' of HEART!');
      let hasTargetHeart = false;
      //Check if target ♥ exist
      for (const card of foundCards) {
          if (card.getValue() === valueToBeat + 1 && card.getSuit() === Suit.HEARTS) {
              hasTargetHeart = true;
              console.log('Picked ' + card.getValue() + ' of ' + card.getSuit() + ' on the first try!');
          }
      }

      // If target ♥ doesn't exist, swap a card with the same value for it
      if (!hasTargetHeart) {
        console.log('No...Gonna swap in a HEART.');
        const foundTargetHeart = [];
        for (let i = 0; i < foundCards.length && !hasTargetHeart; i++) {
          if (foundCards[i].getValue = valueToBeat + 1) {
            console.log('Swap in a HEART...found target value!');
            foundTargetHeart.push(player.getHand().getCards().filter((card) => 
              card.getValue === valueToBeat + 1 && card.getSuit() === Suit.HEARTS));
          }
          if (foundTargetHeart.length > 0) {
            console.log('Swap in a HEART...found target value AND HEART');
            foundCards[i] = foundTargetHeart[0];
            hasTargetHeart = true;
          }
        }
        console.log('Break out of swap HEART. Did I found it? ' + hasTargetHeart);
      }
    }

    const combToPlay = new CardCombination(foundCards);
    // Get this comb ready so that may skip evaluating comb.
    combToPlay.setType(typeOfTurn);
    combToPlay.setValue(values[values.length - 1]);
    combToPlay.setStraightSize(straightSizeOfTurn);

    return combToPlay;

  }

}