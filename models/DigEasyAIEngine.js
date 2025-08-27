
/**
 * @TODO
 * The score for each comb -> Can be the % that it's a turn winning comb.
 * I have a findStraightBreakingValues()!!, might be useful later for complex decision.
 */

import { CardCombination } from "./CardCombination.js";
import { CombType } from "./enums.js";
import { DigRoundState } from "./DigRoundState.js";
import { DigAIEngine } from "./DigAIEngine.js";


export class DigEasyAIEngine extends DigAIEngine {



/**
 * @override
 * @param { CardCombination} availableCombinations
 * @param { DigRoundState } state
 * @return {CardCombination} the card combination AI choses, don't forget to select them!
 */
  getAIcombDecision(player, state) {

    //Let's not have 8 getters...
    //array of values of each type
    const singles = player.singles;
    const pairs = player.pairs;
    const triples = player.triples;
    const quads = player.quads;
    //straights are 2d arries.
    const straights = player.straights;
    const pairStraights = player.pairStraights;
    const tripleStraights = player.tripleStraights;
    const quadStraights = player.quadStraights;


    const isFirstRound = state.getIsFirstRound();        
    const valueToBeat = state.getValue();
    const typeOfTurn = state.getType();
    //Am I to start a round, to set combination type
    //I can trust that the game engine will set valueToBeat to just one less than my lowest ♥
    //setRoundType() handles first round ♥ requirement
    if (state.getType() === CombType.NONE) {
      const typeOfTurn = this.setRoundType(singles, pairs, triples, quads, straights, pairStraights, tripleStraights, quadStraights, isFirstRound, valueToBeat);
      console.log(`${player.name} set this round's combination type to ${typeOfTurn}`);
    }

    const straightSizeOfTurn = state.getStraightSize();


    // Play decision based on typeOfTurn
    let playResult;

    switch (typeOfTurn) {
        case CombType.SINGLE:
            playResult = this.handleSinglesPlay(singles, pairs, straights, pairStraights, valueToBeat);
            break;
            
        case CombType.PAIR:
            playResult = this.handlePairsPlay(pairs, triples, quads, straights, pairStraights, tripleStraights, valueToBeat);
            break;
            
        case CombType.TRIPLE:
            playResult = this.handleTriplesPlay(triples, straights, valueToBeat);
            break;
            
        case CombType.QUAD:
            playResult = this.handleQuadsPlay(quads, straights, valueToBeat);
            break;
            
        case CombType.STRAIGHT:
            playResult = this.handleStraightsPlay(straights, pairs, triples, valueToBeat, straightSizeOfTurn);
            break;
            
        case CombType.PAIR_STRAIGHT:
            playResult = this.handlePairStraightsPlay(pairStraights, valueToBeat, straightSizeOfTurn);
            playResult.push(...playResult);
            playResult.sort((a, b) => a - b);
            break;
            
        case CombType.TRIPLE_STRAIGHT:
            playResult = this.handleTripleStraightsPlay(tripleStraights, valueToBeat, straightSizeOfTurn);
            playResult.push(...playResult);
            playResult.sort((a, b) => a - b);
            break;
            
        case CombType.QUAD_STRAIGHT:
            playResult = this.handleQuadStraightsPlay(quadStraights, valueToBeat, straightSizeOfTurn);
            playResult.push(...playResult);
            playResult.sort((a, b) => a - b);
            break;
            
        default:
            playResult = []; // Return empty array if unknown type
            break;
    }
    console.log(`${player.name} decided to play ${playResult}, but hasn't played them yet.`);

    const combToPlay = this.findCombsToPlay(player, playResult, isFirstRound, valueToBeat);
    combToPlay.selectComb();

    console.log(`And the picked comb looks like ${combToPlay.length > 0 ? combToPlay.toShortString() : 'nothing'}.`);
    console.log(`Is the comb selected? ${combToPlay.length > 0 ? combToPlay.getCards()[0].isSelected : 'I don\'t know. Nothing is selected'}.`);

    return combToPlay;
  }




  /**
   * Set the type of round to the type of which I have most combinations to play
   * For first round, prioritizes types where the lowest value is exactly one above valueToBeat
   * 
   * @param {Array<Array<number>>} singles - 2D array of single card combinations
   * @param {Array<Array<number>>} pairs - 2D array of pair combinations  
   * @param {Array<Array<number>>} triples - 2D array of triple combinations
   * @param {Array<Array<number>>} quads - 2D array of quad combinations
   * @param {Array<Array<number>>} straights - 2D array of straight combinations
   * @param {Array<Array<number>>} pairStraights - 2D array of pair straight combinations
   * @param {Array<Array<number>>} tripleStraights - 2D array of triple straight combinations
   * @param {Array<Array<number>>} quadStraights - 2D array of quad straight combinations
   * @param {boolean} isFirstRound - Whether this is the first round
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @returns {CombType} The type I want this round to follow
   */
  setRoundType(singles, pairs, triples, quads, straights, pairStraights, tripleStraights, quadStraights, isFirstRound, valueToBeat) {
      
      // Helper function to get the first value of a combination type
      function getFirstValue(combinations) {
          if (!combinations || combinations.length === 0 || !combinations[0] || combinations[0].length === 0) {
              return null;
          }
          return combinations[0][combinations[0].length - 1]; // Last value since combinations are sorted
      }
      
      // All combination types with their data
      const allTypes = [
          { type: CombType.QUAD_STRAIGHT, combinations: quadStraights },
          { type: CombType.TRIPLE_STRAIGHT, combinations: tripleStraights },
          { type: CombType.PAIR_STRAIGHT, combinations: pairStraights },
          { type: CombType.QUAD, combinations: quads },
          { type: CombType.TRIPLE, combinations: triples },
          { type: CombType.STRAIGHT, combinations: straights },
          { type: CombType.PAIR, combinations: pairs },
          { type: CombType.SINGLE, combinations: singles }
      ];
      
      let candidateTypes = allTypes;
      
      // First round optimization: narrow down to types where first value is exactly valueToBeat + 1
      if (isFirstRound) {
          const targetValue = valueToBeat + 1;
          const firstRoundCandidates = allTypes.filter(typeData => {
              const firstValue = getFirstValue(typeData.combinations);
              return firstValue === targetValue;
          });
          
          // Only use first round filtering if we found candidates
          if (firstRoundCandidates.length > 0) {
              candidateTypes = firstRoundCandidates;
          }
      }
      
      // Build a map of how many combinations I have for each type
      // Using combination count as key, with arrays of types as values
      const combCounts = new Map();
      
      // Initialize map with empty arrays for counts 0-13
      for (let i = 0; i <= 13; i++) {
          combCounts.set(i, []);
      }
      
      // Fill the map with candidate types only
      // Order matters! It's the priority, because the first in the array will be picked.
      // High priority means harder to have a chance to play as game progress.
      candidateTypes.forEach(typeData => {
          const count = typeData.combinations.length;
          combCounts.get(count).push(typeData.type);
      });
      
      // Find the type with the most combinations (highest priority within that count)
      for (let i = 13; i >= 0; i--) {
          if (combCounts.get(i).length !== 0) {
              return combCounts.get(i)[0];
          }
      }
      
      // Fallback (should not reach here if there are any combinations)
      return CombType.SINGLE;
  }



//--------------- Easy Logic for Handling All 8 Types --------------------------
//---------------             BEGINS                  --------------------------

  /**
   * Handles the decision making for playing singles by finding the best single card to play
   * while considering conflicts with straights and pair straights
   * 
   * Note: Straights are sorted, unique, and grouped to maximum consecutive groups.
   * Each straight of repeating values is a subset of the straight with one less repeating values.
   * 
   * @param {Array<Array<number>>} singles - 2D array of single card values (e.g., [[4], [7], [10]])
   * @param {Array<Array<number>>} pairs - 2D array of pair combinations (e.g., [[4,4], [5,5]])
   * @param {Array<Array<number>>} straights - 2D array of straight combinations (e.g., [[4,5,6,7,8]])
   * @param {Array<Array<number>>} pairStraights - 2D array of pair straight combinations (e.g., [[4,5,6]])
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * 
   * @returns {Array<number>} - The best single card to play as 1D array, or empty array if none found
   */
  handleSinglesPlay(singles, pairs, straights, pairStraights, valueToBeat) {
      // Get all values that participate in straights and pair straights
      const valuesInStraights = this.flattenCombinations(straights);
      const valuesInPairStraights = this.flattenCombinations(pairStraights);
      
      // Find singles that don't participate in straights
      const singlesNotInStraights = singles.filter(single => {
          if (!single || single.length === 0) return false;
          const singleValue = single[0]; // Singles have only one value
          return !valuesInStraights.includes(singleValue);
      });
      
      // First priority: Use singles that don't participate in straights
      if (singlesNotInStraights.length > 0) {
          return this.findBestCandidate(singlesNotInStraights, valueToBeat);
      }
      
      // Second priority: If all singles participate in straights,
      // find pairs that exist in straights but don't exist in pair straights
      const candidatesFromPairs = pairs
          .filter(pair => {
              if (!pair || pair.length < 2) return false;
              const pairValue = pair[0]; // All values in a pair are the same
              return valuesInStraights.includes(pairValue) && 
                    !valuesInPairStraights.includes(pairValue);
          })
          .map(pair => [pair[0]]); // Convert pair to single format
      
      // Find best combination from pairs that can be broken up
      return this.findBestCandidate(candidatesFromPairs, valueToBeat);
  }

  /**
 * Handles the decision making for playing pairs by finding the best pair to play
 * while considering conflicts with straights and higher-level combinations
 * 
 * @param {Array<Array<number>>} pairs - 2D array of pair combinations (e.g., [[4,4], [5,5]])
 * @param {Array<Array<number>>} triples - 2D array of triple combinations (e.g., [[6,6,6], [7,7,7]])
 * @param {Array<Array<number>>} quads - 2D array of quad combinations (e.g., [[6,6,6,6], [7,7,7,7]])
 * @param {Array<Array<number>>} straights - 2D array of straight combinations (e.g., [[4,5,6,7,8]])
 * @param {Array<Array<number>>} pairStraights - 2D array of pair straight combinations (e.g., [[4,5,6]])
 * @param {Array<Array<number>>} tripleStraights - 2D array of triple straight combinations (e.g., [[4,5,6]])
 * @param {number} valueToBeat - The minimum value that needs to be exceeded
 * 
 * @returns {Array<number>} - The best pair to play as 1D array, or empty array if none found
 */
  handlePairsPlay(pairs, triples, quads, straights, pairStraights, tripleStraights, valueToBeat) {
      // Get all values that participate in different types of straights
      const valuesInStraights = this.flattenCombinations(straights);
      const valuesInPairStraights = this.flattenCombinations(pairStraights);
      const valuesInTripleStraights = this.flattenCombinations(tripleStraights);
      
      // Find pairs that don't participate in any straights
      const pairsNotInStraights = pairs.filter(pair => {
          if (!pair || pair.length < 2) return false;
          const pairValue = pair[0]; // All values in a pair are the same
          return !valuesInStraights.includes(pairValue);
      });
      
      // First priority: Use pairs that don't participate in straights
      if (pairsNotInStraights.length > 0) {
          return this.findBestCandidate(pairsNotInStraights, valueToBeat);
      }
      
      // Second priority: If all pairs participate in straights,
      // find quads that participate in pair straights but don't participate in triple straights
      const candidatesFromQuads = [];
      
      for (let quad of quads) {
          if (!quad || quad.length < 4) continue;
          
          const quadValue = quad[0]; // All values in a quad are the same
          
          // Check if this quad value exists in pair straights but not in triple straights
          if (valuesInPairStraights.includes(quadValue) && 
              !valuesInTripleStraights.includes(quadValue)) {
              // Convert quad to pair for playing
              candidatesFromQuads.push([quadValue, quadValue]);
          }
      }
      
      // Add special cases: if we have 3+ twos (15) or 3+ threes (16) in triples or quads
      // Since 2s and 3s can't participate in straights, they can be safely broken down
      
      // Check triples for twos and threes
      for (let triple of triples) {
          if (!triple || triple.length < 3) continue;
          
          const tripleValue = triple[0];
          
          // If we have triples of value 15 (twos) or 16 (threes)
          if (tripleValue === 15 || tripleValue === 16) {
              candidatesFromQuads.push([tripleValue, tripleValue]);
          }
      }
      
      // Check quads for twos and threes
      for (let quad of quads) {
          if (!quad || quad.length < 4) continue;
          
          const quadValue = quad[0];
          
          // If we have quads of value 15 (twos) or 16 (threes)
          if (quadValue === 15 || quadValue === 16) {
              candidatesFromQuads.push([quadValue, quadValue]);
          }
      }
      
      // Find best combination from quads that can be broken down
      return this.findBestCandidate(candidatesFromQuads, valueToBeat);
  }
  
  /**
   * Handles the decision making for playing triples by finding the best triple to play
   * while avoiding breaking straights
   * 
   * @param {Array<Array<number>>} triples - 2D array of triple combinations (e.g., [[6,6,6], [7,7,7]])
   * @param {Array<Array<number>>} straights - 2D array of straight combinations (e.g., [[4,5,6,7,8]])
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * 
   * @returns {Array<number>} - The best triple to play as 1D array, or empty array if none found
   */
  handleTriplesPlay(triples, straights, valueToBeat) {
      return this.handleHighValueCombinations(triples, straights, valueToBeat);
  }

  /**
   * Handles the decision making for playing quads by finding the best quad to play
   * while avoiding breaking straights
   * 
   * @param {Array<Array<number>>} quads - 2D array of quad combinations (e.g., [[6,6,6,6], [7,7,7,7]])
   * @param {Array<Array<number>>} straights - 2D array of straight combinations (e.g., [[4,5,6,7,8]])
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * 
   * @returns {Array<number>} - The best quad to play as 1D array, or empty array if none found
   */
  handleQuadsPlay(quads, straights, valueToBeat) {
      return this.handleHighValueCombinations(quads, straights, valueToBeat);
  }

    /**
   * Handles the decision making for playing straights by finding the best straight to play
   * while considering conflicts with pairs and triples, and prioritizing straights with Kings (13)
   * 
   * @param {Array<Array<number>>} straights - 2D array of straight combinations
   * @param {Array<Array<number>>} pairs - 2D array of pair combinations
   * @param {Array<Array<number>>} triples - 2D array of triple combinations
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {number} straightSize - Straight size to follow
   * 
   * @returns {Array<number>} - The best straight to play as 1D array, or empty array if none found
   */
  handleStraightsPlay(straights, pairs, triples, valueToBeat, straightSize) {
      // Generate all possible straight combinations and sub-combinations
      const allPossibleStraights = this.generateAllPossibleStraights(straights, straightSize);
      
      // Filter out straights that:
      // 1. Don't involve K (value 13) AND
      // 2. Conflict with pairs and triples
      const candidateStraights = allPossibleStraights.filter(straight => {
          const hasKing = straight.includes(13); // K has value 13
          const hasConflict = this.hasConflictWithPairsTriples(straight, pairs, triples);
          
          // Keep straights that either:
          // - Have a King (regardless of conflicts), OR
          // - Don't have conflicts (regardless of King)
          return hasKing || !hasConflict;
      });
      
      // Find the best candidate from filtered straights
      return this.findBestCandidate(candidateStraights, valueToBeat);
  }

    /**
   * Handles the decision making for playing pair straights by finding the best pair straight to play
   * 
   * @param {Array<Array<number>>} pairStraights - 2D array of pair straight combinations (e.g., [[4,5,6], [7,8,9]])
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {number} straightSize - Straight size to follow
   * 
   * @returns {Array<number>} - The best pair straight to play as 1D array, or empty array if none found
   */
  handlePairStraightsPlay(pairStraights, valueToBeat, straightSize) {
      const allPossibleStraights = this.generateAllPossibleStraights(pairStraights, straightSize);
      return this.findBestCandidate(allPossibleStraights, valueToBeat);
  }

  /**
   * Handles the decision making for playing triple straights by finding the best triple straight to play
   * 
   * @param {Array<Array<number>>} tripleStraights - 2D array of triple straight combinations (e.g., [[4,5,6], [7,8,9]])
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {number} straightSize - Straight size to follow
   * 
   * @returns {Array<number>} - The best triple straight to play as 1D array, or empty array if none found
   */
  handleTripleStraightsPlay(tripleStraights, valueToBeat, straightSize) {
      const allPossibleStraights = this.generateAllPossibleStraights(tripleStraights, straightSize);
      return this.findBestCandidate(allPossibleStraights, valueToBeat);
  }

  /**
   * Handles the decision making for playing quad straights by finding the best quad straight to play
   * 
   * @param {Array<Array<number>>} quadStraights - 2D array of quad straight combinations (e.g., [[4,5,6], [7,8,9]])
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {number} straightSize - Straight size to follow
   * 
   * @returns {Array<number>} - The best quad straight to play as 1D array, or empty array if none found
   */
  handleQuadStraightsPlay(quadStraights, valueToBeat, straightSize) {
      const allPossibleStraights = this.generateAllPossibleStraights(quadStraights, straightSize);
      return this.findBestCandidate(allPossibleStraights, valueToBeat);
  }

//--------------- Easy Logic for Handling All 8 Types --------------------------
//---------------             ENDS                  --------------------------







//--------------- Helpers for Easy Logic for Handling All 8 Types --------------------------
//---------------                     BEGINS                      --------------------------
  /**
   * Generates all possible straight sub-combinations from a given straight
   * Minimum straight length is 3, so generates all contiguous subsequences of length 3 or more
   * 
   * @param {Array<number>} straight - A single straight array (e.g., [4,5,6,7])
   * @returns {Array<Array<number>>} - All possible sub-straights of length 3+
   * @param {number} straightSize - Straight size to follow
   * 
   * @example
   * // For straight [4,5,6,7]
   * generateSubStraights([4,5,6,7]) // Returns [[4,5,6], [5,6,7], [4,5,6,7]]
   */
  generateSubStraights(straight, straightSize) {
      if (straightSize === straight.length) {
        return straight.slice();
      }

      const subStraights = [];
      // Generate all contiguous subsequences of length 3 or more
      for (let start = 0; start <= straight.length - straightSize; start++) {
          const subStraight = straight.slice(start, start + straightSize);
          subStraights.push(subStraight);
      }
      
      return subStraights;
  }

  /**
   * Generates all possible straight combinations and sub-combinations from straights array
   * 
   * @param {Array<Array<number>>} straights - 2D array of straight combinations
   * @returns {Array<Array<number>>} - All possible straight combinations including sub-combinations
   * @param {number} straightSize - Straight size to follow
   * 
   * @example
   * // For straights [[4,5,6,7], [9,10,11,12]]
   * // Returns [[4,5,6], [5,6,7], [4,5,6,7], [9,10,11], [10,11,12], [9,10,11,12]]
   */
  generateAllPossibleStraights(straights, straightSize) {
      const allPossibleStraights = [];
      
      for (let straight of straights) {
          if (!straight || straight.length < 3) continue;
          
          const subStraights = this.generateSubStraights(straight, straightSize);
          allPossibleStraights.push(...subStraights);
      }
      
      return allPossibleStraights;
  }

  /**
   * Checks if a straight combination conflicts with pairs or triples
   * A conflict occurs when a value in the straight is also needed for pairs/triples
   * 
   * @param {Array<number>} straight - Single straight combination to check
   * @param {Array<Array<number>>} pairs - 2D array of pair combinations
   * @param {Array<Array<number>>} triples - 2D array of triple combinations
   * @returns {boolean} - True if there's a conflict, false otherwise
   */
  hasConflictWithPairsTriples(straight, pairs, triples) {
      const pairValues = this.flattenCombinations(pairs);
      const tripleValues = this.flattenCombinations(triples);
      
      // Check if any value in the straight conflicts with pairs or triples
      for (let value of straight) {
          if (pairValues.includes(value) || tripleValues.includes(value)) {
              return true;
          }
      }
      
      return false;
  }

    /**
   * Helper function to find values that would break straights if removed
   * A value breaks a straight if it's at position 0, 1, length-2, or length-1 in any straight group
   * Since minimum straight size is 3, removing these positions would make the straight too short
   * 
   * @param {Array<Array<number>>} straights - 2D array of straight combinations (preserving groups)
   * @param {Array<number>} values - Array of values to check against straights
   * @returns {Array<number>} - Values that would break straights if removed
   */
  findStraightBreakingValues(straights, values) {
      const breakingValues = [];
      
      for (let value of values) {
          let wouldBreakStraight = false;
          
          // Check each straight group
          for (let straight of straights) {
              if (!straight || straight.length < 3) continue;
              
              const valueIndex = straight.indexOf(value);
              if (valueIndex !== -1) {
                  // Check if removing this value would break the straight
                  // Breaking positions: 0, 1, length-2, length-1
                  const length = straight.length;
                  if (valueIndex === 0 || valueIndex === 1 || 
                      valueIndex === length - 2 || valueIndex === length - 1) {
                      wouldBreakStraight = true;
                      break;
                  }
              }
          }
          
          if (!wouldBreakStraight) {
              breakingValues.push(value);
          }
      }
      
      return breakingValues;
  }

  /**
   * Generic helper function to handle triples or quads play decision
   * Eliminates values that would break straights and finds the best candidate
   * 
   * @param {Array<Array<number>>} combinations - 2D array of triple or quad combinations
   * @param {Array<Array<number>>} straights - 2D array of straight combinations (preserving groups)
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @returns {Array<number>} - The best combination to play, or empty array if none found
   */
  handleHighValueCombinations(combinations, straights, valueToBeat) {
      // Get all values from the combinations (triples or quads)
      const allValues = this.flattenCombinations(combinations);
      
      // Find values that would break straights if used (unsafe values)
      const unsafeValues = this.findStraightBreakingValues(straights, allValues);
      
      // Filter original combinations to only include those with safe values (not in unsafe list)
      const safeCombinations = combinations.filter(combination => {
          if (!combination || combination.length === 0) return false;
          const combinationValue = combination[0]; // All values in combination are the same
          return !unsafeValues.includes(combinationValue);
      });
      
      // Find the best candidate from safe combinations
      return this.findBestCandidate(safeCombinations, valueToBeat);
  }

    /**
   * Flattens a 2D array of card combinations into a single array of all values
   * Since the original 2D array is already optimized without repeats, no deduplication needed
   * 
   * @param {Array<Array<number>>} combinations - 2D array of combinations (e.g., [[4,5,6], [7,8,9,10]])
   * @returns {Array<number>} - Flat array containing all values from the combinations
   * 
   * @example
   * // For straights [[4,5,6], [7,8,9]]
   * flattenCombinations([[4,5,6], [7,8,9]]) // Returns [4,5,6,7,8,9]
   */
  flattenCombinations(combinations) {
      return combinations.flat();
  }

  /**
   * Finds values that are common between two 2D arrays of card combinations
   * 
   * @param {Array<Array<number>>} combinations1 - First 2D array of combinations
   * @param {Array<Array<number>>} combinations2 - Second 2D array of combinations
   * @returns {Array<number>} - Array of values that appear in both combination arrays
   * 
   * @example
   * // Find common values between straights and pair straights
   * findCommonValues([[4,5,6,7]], [[4,5,6]]) // Returns [4,5,6]
   */
  findCommonValues(combinations1, combinations2) {
      const values1 = this.flattenCombinations(combinations1);
      const values2 = this.flattenCombinations(combinations2);
      
      return values1.filter(value => values2.includes(value));
  }

  /**
   * Finds values that are NOT common between two 2D arrays of card combinations
   * Returns values from the first array that don't appear in the second array
   * 
   * @param {Array<Array<number>>} combinations1 - First 2D array of combinations
   * @param {Array<Array<number>>} combinations2 - Second 2D array of combinations
   * @returns {Array<number>} - Array of values from combinations1 that don't appear in combinations2
   * 
   * @example
   * // Find values in straights but not in pair straights
   * findNonCommonValues([[4,5,6,7]], [[4,5,6]]) // Returns [7]
   */
  findNonCommonValues(combinations1, combinations2) {
      const values1 = this.flattenCombinations(combinations1);
      const values2 = this.flattenCombinations(combinations2);
      
      return values1.filter(value => !values2.includes(value));
  }

    /**
   * Finds the card combination with the smallest value that can beat the target value
   * 
   * @param {Array<Array<number>>} candidates - 2D array where each inner array represents 
   *                                           a card combination (e.g., [[4,4], [5,5]] for pairs)
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * 
   * @returns {Array<number>} - The card combination (1D array) with the smallest value 
   *                           that beats valueToBeat, or empty array if none found
   * 
   * @example
   * // For pairs of 4 and 5, trying to beat value 4
   * findBestCandidate([[4,4], [5,5]], 4) // Returns [5,5]
   * 
   * // For straights, trying to beat value 6
   * findBestCandidate([[3,4,5], [7,8,9]], 6) // Returns [7,8,9]
   */
  findBestCandidate(candidates, valueToBeat) {
      // Return empty array if no candidates provided
      if (!candidates || candidates.length === 0) {
          return [];
      }
      
      let bestCombination = null;
      let smallestWinningValue = Infinity;
      
      // Iterate through each candidate combination
      for (let i = 0; i < candidates.length; i++) {
          const combination = candidates[i];
          
          // Skip empty combinations
          if (!combination || combination.length === 0) {
              continue;
          }
          
          // Get the value of this combination (last card since inner arrays are sorted)
          const combinationValue = combination[combination.length - 1];
          
          // Check if this combination can beat the target value
          if (combinationValue > valueToBeat) {
              // If this is the smallest winning value found so far, update our best choice
              if (combinationValue < smallestWinningValue) {
                  smallestWinningValue = combinationValue;
                  bestCombination = combination;
              }
          }
      }
      
      // Return the best combination found, or empty array if none can win
      return bestCombination ? [...bestCombination] : [];
  }
//--------------- Helpers for Easy Logic for Handling All 8 Types --------------------------
//---------------                     ENDS                      --------------------------













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











  






}

