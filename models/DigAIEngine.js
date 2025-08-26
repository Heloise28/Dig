
/**
 * @TODO
 * The score for each comb -> Can be the % that it's a turn winning comb.
 */

import { CardCombination } from "./CardCombination";
import { CombType } from "./enums";
import { RoundState } from "./DigRoundState";

export class DigGameEngine {

  //in case needed
  static allTypes = [
    CombType.SINGLE,
    CombType.PAIR,
    CombType.TRIPLE,
    CombType.QUAD,
    CombType.STRAIGHT,
    CombType.PAIR_STRAIGHT,
    CombType.TRIPLE_STRAIGHT,
    CombType.QUAD_STRAIGHT,
    CombType.NONE,
  ];


/**
 * @param { CardCombination} availableCombinations
 * @param { RoundState } state
 * @return {CardCombination}
 */
  static easyAIcombDecision(player, state) {

    const typeOfTurn = state.getType();
    const valueToBeat = state.getValue();
    const straightSizeOfTurn = state.getStraightSize();

    
    /**
     * @TODO handle first round, 4 of heart 
     * then open round
     * then normal round
    */


    /**
     * @TODO Easy will pick lowest comb that can beat value, from available max combs
     * will break straight if the remining can still from straight
     * otherwise will pass and return CardCombination([]);
     */

    /**
     * @TODO { CardCombination } combToPlay is the card comb to play
     */

    this.selectCardsInAComb(combToPlay);
    return combToPlay;
  }


  /**
  * Can only be called within DigAIEngine!!
  * So that the comb is sure to be from player's deck
  * @param { CardCombination } comb
  */
  static selectCardsInAComb(comb) {
    for (const card of comb.getCards()) {
        card.selectCard();
    }
  }

  












  //------------------    Find cards conflicts in a player's available combinations    ----------------
  //------------------                           BEGINS                                ----------------
  
  /**
   *  *** IMPORTANT ***
   * 
   * 8.25.2025
   * I don't want this because these functions take a Card combination with Card objects, 
   * and I think it's more efficient to have data structures with just numbers and the enum of card types.
   * Will be easier to compute and then I'll get a result and then turn it into a card combination.
   */

/**
 * Finds all combinations that would be destroyed if the given combo is played
 * Accounts for multiple cards of same value - playing one card may not destroy
 * other combinations if there are spare cards of that value
 * @param {CardCombination} combo - The combination to play
 * @param {Map} availableCombinations - Map of [type, combinations[]] from updateAvailableCombinations
 * @return {Map} - Map of [type, conflictingCombinations[]] that would be destroyed
 */
findConflictingCombinations(combo, player) {
  const availableCombinations = player.getAvailableCombinations();
  const conflictingCombinations = new Map();
  
  // Initialize result map with empty arrays
  for (const [type] of availableCombinations) {
    conflictingCombinations.set(type, []);
  }
  
  // Step 1: Count how many cards of each value we have total
  const totalValueCounts = player.getValueCounts();
  
  // Step 2: Count how many cards of each value the combo consumes
  const comboValueConsumption = this.getValueCounts(combo.getCards());
  
  // Step 3: For each other combination, check if playing combo would leave insufficient cards
  for (const [type, combinations] of availableCombinations) {
    for (const otherCombo of combinations) {
      if (otherCombo === combo) continue;
      
      if (this.wouldConflict(comboValueConsumption, otherCombo, totalValueCounts)) {
        conflictingCombinations.get(type).push(otherCombo);
      }
    }
  }
  
  return conflictingCombinations;
}

/**
 * Optimized version that directly analyzes card requirements
 * @param {CardCombination} combo - The combination to play
 * @param {Map} availableCombinations - All available combinations
 * @return {Map} - Map of conflicting combinations
 */
findConflictingCombinationsOptimized(combo, availableCombinations) {
  const conflictingCombinations = new Map();
  
  // Initialize result map
  for (const [type] of availableCombinations) {
    conflictingCombinations.set(type, []);
  }
  
  // Step 1: Quick analysis - count available cards per value by checking combination types
  const availableCards = this.getAvailableCardCounts(availableCombinations);
  
  // Step 2: Get consumption pattern of the combo to play
  const comboConsumption = this.getValueCounts(combo.getCards());
  
  // Step 3: For each combination, check if sufficient cards remain after playing combo
  for (const [type, combinations] of availableCombinations) {
    for (const otherCombo of combinations) {
      if (otherCombo === combo) continue;
      
      if (this.hasInsufficientCards(availableCards, comboConsumption, otherCombo)) {
        conflictingCombinations.get(type).push(otherCombo);
      }
    }
  }
  
  return conflictingCombinations;
}

/**
 * Efficiently determines available card counts by analyzing combination types
 * @param {Map} availableCombinations - All available combinations
 * @return {Map} - Map of value to available count
 */
getAvailableCardCounts(availableCombinations) {
  const availableCards = new Map();
  
  // Strategy: For each value, find the highest combination type to infer total cards
  const valueToMaxCombo = new Map();
  
  for (const [type, combinations] of availableCombinations) {
    for (const combo of combinations) {
      if (this.isStraightType(type)) {
        // For straights, analyze each value individually
        const valueCounts = this.getValueCounts(combo.getCards());
        for (const [value, count] of valueCounts) {
          const currentMax = valueToMaxCombo.get(value) || { type: null, count: 0 };
          if (count > currentMax.count) {
            valueToMaxCombo.set(value, { type, count });
          }
        }
      } else {
        // For same-value combinations
        const value = combo.getCards()[0].getValue();
        const count = this.getCardCountForComboType(type);
        const currentMax = valueToMaxCombo.get(value) || { type: null, count: 0 };
        if (count > currentMax.count) {
          valueToMaxCombo.set(value, { type, count });
        }
      }
    }
  }
  
  // Convert to final counts
  for (const [value, maxCombo] of valueToMaxCombo) {
    availableCards.set(value, maxCombo.count);
  }
  
  return availableCards;
}

/**
 * Gets the number of cards required for a combination type
 * @param {string} type - Combination type
 * @return {number} - Number of cards of same value required
 */
getCardCountForComboType(type) {
  switch (type) {
    case CombType.SINGLE: return 1;
    case CombType.PAIR: return 2;
    case CombType.TRIPLE: return 3;
    case CombType.QUAD: return 4;
    default: return 1;
  }
}

/**
 * Checks if playing a combo would leave insufficient cards for another combination
 * @param {Map} availableCards - Total cards available per value
 * @param {Map} comboConsumption - Cards consumed by combo to play
 * @param {CardCombination} otherCombo - Other combination to check
 * @return {boolean} - True if insufficient cards would remain
 */
hasInsufficientCards(availableCards, comboConsumption, otherCombo) {
  const otherRequirements = this.getValueCounts(otherCombo.getCards());
  
  for (const [value, requiredCount] of otherRequirements) {
    const totalAvailable = availableCards.get(value) || 0;
    const consumedByCombo = comboConsumption.get(value) || 0;
    const remaining = totalAvailable - consumedByCombo;
    
    if (remaining < requiredCount) {
      return true; // Conflict: insufficient cards
    }
  }
  
  return false; // No conflict
}

/**
 * Simplified conflict check (fallback method)
 * @param {Map} comboValueConsumption - Cards consumed by combo to play  
 * @param {CardCombination} otherCombo - Other combination to check
 * @param {Map} totalValueCounts - Total available cards per value
 * @return {boolean} - True if combinations would conflict
 */
wouldConflict(comboValueConsumption, otherCombo, totalValueCounts) {
  const otherRequirements = this.getValueCounts(otherCombo.getCards());
  
  for (const [value, otherNeeds] of otherRequirements) {
    const comboConsumes = comboValueConsumption.get(value) || 0;
    const totalAvailable = totalValueCounts.get(value) || 0;
    
    if (totalAvailable - comboConsumes < otherNeeds) {
      return true; // Conflict
    }
  }
  
  return false; // No conflict
}

/**
 * Checks if a combination type is a straight type
 * @param {string} type - The combination type
 * @return {boolean} - True if it's a straight type
 */
isStraightType(type) {
  return type === CombType.STRAIGHT || 
         type === CombType.PAIR_STRAIGHT || 
         type === CombType.TRIPLE_STRAIGHT || 
         type === CombType.QUAD_STRAIGHT;
}

  //------------------    Find cards conflicts in a player's available combinations    ----------------
  //------------------                            ENDS                                 ----------------











  







  /**
   * @TODO 下面这是随便写的
   */
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

