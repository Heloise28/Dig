
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
   */

  
  /**
   * Like this is an untility function, independent from AI level
   * translate an array of card values to a CardCombination
   * @param {Array<Number>} values that is AI player decides to play.
   * @return {CardCombination} translate to combination of actual cards in this AI player's hand
  */
  findCombsToPlay(player, values, isFirstRound, valueToBeat) {
    if (values.length <= 0) {
      console.log('You asked me to find comb of nothing.');
      return new CardCombination([]);
    }

    const foundCards = player.getHand().getCardsByValue(values);

    //if is first round, make sure there's a ♥ and just one above valueToBeat;
    if (isFirstRound) {
      console.log('Is first round!');
      let hasTargetHeart = false;

      //Check if target ♥ exist
      for (const card in foundCards) {
          if (card.getValue === valueToBeat + 1 && card.getSuit() === Suit.HEARTS) hasTargetHeart = true;
          console.log('Picked HEART on first try!');
      }

      // If target ♥ doesn't exist, swap a card with the same value for it
      if (!hasTargetHeart) {
        console.log('No...Gonna swap in a HEART.');
        const foundTargetHeart = [];
        for (let i = 0; i < foundCards.length && !hasTargetHeart; i++) {
          if (foundCards[i].getValue = valueToBeat + 1) {
            console.log('Swap in a HEART...found target value!');
            foundTargetHeart = player.getHand().getCards().filter((card) => 
              card.getValue === valueToBeat + 1 && card.getSuit() === Suit.HEARTS);
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

    return new CardCombination(foundCards);

  }

}