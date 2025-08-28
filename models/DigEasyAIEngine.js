
/**
 * @TODO
 * The score for each comb -> Can be the % that it's a turn winning comb.
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

    // Let's not have 8 getters...
    //array of values of each type
    const singles = this.singles;
    const pairs = this.pairs;
    const triples = this.triples;
    const quads = this.quads;
    // straights are 2d arries.
    // straights get's purified, excluded the ones that conflict too much with pairs and triples
    const straights = this.straights;
    const pairStraights = this.pairStraights;
    const tripleStraights = this.tripleStraights;
    const quadStraights = this.quadStraights;

    const isFirstRound = state.getIsFirstRound();        
    const valueToBeat = state.getValue();
    const isOpenRound = state.getIsOpenRound();
    const straightSizeOfTurn = state.getStraightSize();
    const typeOfTurn = state.getType();

    const playResult = this.getPlayFromHandler(
      singles, 
      pairs, 
      triples, 
      quads, 
      straights, 
      pairStraights, 
      tripleStraights, 
      quadStraights, 
      straightSizeOfTurn, 
      valueToBeat, 
      typeOfTurn,
      isFirstRound
    );
    
    console.log(`${player.name} decided to play ${playResult}, but hasn't played them yet. (Message from getAIcombDecision(state))`);

    // First round (find heart) handled here.
    const combToPlay = this.findCombsToPlay(
      player, 
      playResult, 
      typeOfTurn, 
      straightSizeOfTurn, 
      isFirstRound, 
      valueToBeat
    );

    combToPlay.selectComb(); 

    console.log(`And the picked comb looks like ${combToPlay.getSize() > 0 ? combToPlay.toShortString() : 'nothing'}.`);

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
   * @param {number} straightSizeOfTurn - Straight size to follow
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {CombType} typeOfTurn
   * @returns {Array<number>} The type I want this round to follow
   */
  getPlayFromHandler(singles, pairs, triples, quads, straights, pairStraights, tripleStraights, quadStraights, straightSizeOfTurn, valueToBeat, typeOfTurn, isFirstRound) {
        // Play decision based on typeOfTurn
    let playResult;
    console.log('So type of turn is ' + typeOfTurn + '. Start handling.... (I\m in getPlayFromHandler() right before switch, which is inside getAIcombDecision(player, state))');

    switch (typeOfTurn) {
        case CombType.SINGLE:
            playResult = this.handleSinglesPlay(singles, pairs, straights, pairStraights, valueToBeat);
            break;
            
        case CombType.PAIR:
            playResult = this.handlePairsPlay(pairs, triples, quads, straights, pairStraights, tripleStraights, valueToBeat);
            break;
            
        case CombType.TRIPLE:
            playResult = this.handleTriplesPlay(triples, quads, straights, valueToBeat);
            break;
            
        case CombType.QUAD:
            playResult = this.handleQuadsPlay(quads, straights, valueToBeat);
            break;
            
        case CombType.STRAIGHT:
            playResult = this.handleStraightsPlay(straights, valueToBeat, straightSizeOfTurn);
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
            
        case CombType.NONE:           
            playResult = this.handleNoneTypePlay(
              singles, 
              pairs, 
              triples, 
              quads, 
              straights, 
              pairStraights, 
              tripleStraights, 
              quadStraights, 
              typeOfTurn, 
              straightSizeOfTurn, 
              isFirstRound, 
              valueToBeat);
            break;
            
        default:
            playResult = []; // Return empty array if unknown type
            break;
    }

    return playResult;
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
  decideRoundType(singles, pairs, triples, quads, straights, pairStraights, tripleStraights, quadStraights, isFirstRound, valueToBeat) {   

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
      
      // First round optimization: narrow down to types that has valueToBeat + 1
      // This function rely on that:
      /**
       * @todo maybe a check?
       */
      // Game Engine will garantee that this player has valueToBeat + 1 of Heart
      if (isFirstRound) {
          const targetValue = valueToBeat + 1;
          const firstRoundCandidates = allTypes.filter(typeData => {
              const allCombValues = this.flattenCombinations(typeData.combinations);                           
              return allCombValues.includes(targetValue);
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
          console.log('Found ' + count + ' ' +  typeData.type + '(s) as candidate types!');
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



//--------------- Easy Handlers/Deciders for All 8 Types --------------------------
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
              if (!pair || pair.length === 0) return false;
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
          if (!pair || pair.length === 0) return false;
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
          if (!quad || quad.length === 0) continue;
          
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
          if (!triple || triple.length === 0) continue;
          
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
  handleTriplesPlay(triples, quads, straights, valueToBeat) {
      const candidates = this.handleHighValueCombinations(triples, straights, valueToBeat);
      if (candidates.length === 0 && quads.length !== 0) {
        let safeQuads;
        // Filter 2 and 3 from quads
        safeQuads = quads.filter(combination => {
            return !combination && combination[0] > 14;
        });
      }
      return this.findBestCandidate(candidates.push(...safeQuads), valueToBeat);
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
   * Handles the decision making for playing straights by finding the best straight to play
   * Now works with pure straights and considers straight size requirements
   * 
   * @param {Array<Array<number>>} straights - 2D array of pure straight combinations (conflicts already resolved)
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {number} straightSizeOfTurn - Required straight length (0 means use shortest available)
   * 
   * @returns {Array<number>} - The best straight to play as 1D array, or empty array if none found
  */
  handleStraightsPlay(straights, valueToBeat, straightSizeOfTurn) {
    // If straightSizeOfTurn is 0, find the shortest available straight length
    if (straightSizeOfTurn === 0) {
    console.log('Straight size is zero? So I\'ll set it.')
        for (let straight of straights) {
            if (straight && straight.length >= 3) {
                if (straightSizeOfTurn === 0 || straight.length < straightSizeOfTurn) {
                    straightSizeOfTurn = straight.length;
                }
            }
        }
        console.log('Set this round straight size to ' + straightSizeOfTurn);
        
        // If no valid straights available, return empty
        if (straightSizeOfTurn === 0) {
            return [];
        }
    }
    
    const candidateStraights = [];

    console.log('Looking for eligible straights from these.:', straights);
    console.log("Value to beat: ", valueToBeat);
    // Find straights with length >= 3 and max value > valueToBeat
    const eligibleStraights = straights.filter(straight => 
        straight && straight.length >= 3 && 
        straight[straight.length - 1] > valueToBeat
    );
    console.log('Eligible Sraights ready to be processed: ', eligibleStraights);
    
    // Process each eligible straight
    for (let straight of eligibleStraights) {
        if (straight.length === straightSizeOfTurn) {
            // If straight length exactly matches target size, add it directly
            candidateStraights.push([...straight]);
            console.log('Found size match, candicates are: ', straight);
        } else if (straight.length >= straightSizeOfTurn + 3) {
            // Add head and tail sub straight first
            candidateStraights.push(straight.slice(0, straightSizeOfTurn));
            candidateStraights.push(straight.slice(straight.length - straightSizeOfTurn, straight.length));
            console.log('Found big and head tail match, candicates are: ', candidateStraights);

            if (straight.length >= straightSizeOfTurn + 6) {
            // Find all sections of straightSizeOfTurn within this straight
            // Sections must be at least 3 numbers away from head/tail
                for (let start = 3; start <= straight.length - straightSizeOfTurn - 3; start++) {
                    const section = straight.slice(start, start + straightSizeOfTurn);
                    candidateStraights.push(section);
                }
            console.log('Found super match, candicates are: ', candidateStraights);
            }
        }
    }
    
    // Find the best candidate from all valid straight sections
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

  /**
   * Like this is an untility function, independent from AI level
   * translate an array of card values to a CardCombination
   * @param {Array<Array<Number>>} : all player max combinations
   * @param: And many DigRoundStates Things
   * @returns {Array<number>} Best type AND combination to play
  */
  handleNoneTypePlay(singles, pairs, triples, quads, straights, pairStraights, tripleStraights, quadStraights, typeOfTurn, straightSizeOfTurn, isFirstRound, valueToBeat) {
    typeOfTurn = this.decideRoundType(
      singles, 
      pairs, 
      triples, 
      quads, 
      straights, 
      pairStraights, 
      tripleStraights, 
      quadStraights, 
      isFirstRound, 
      valueToBeat
    );

    console.log(`Decided this round's combination type to be ${typeOfTurn}`);

    return this.getPlayFromHandler(
      singles, 
      pairs, 
      triples, 
      quads, 
      straights, 
      pairStraights, 
      tripleStraights, 
      quadStraights, 
      straightSizeOfTurn, 
      valueToBeat, 
      typeOfTurn,
      isFirstRound
    );
  }

//--------------- Easy Handlers/Deciders for All 8 Types --------------------------
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
                  if (valueIndex === 1 || valueIndex === 2 || 
                      valueIndex === length - 3 || valueIndex === length - 2) {
                      wouldBreakStraight = true;
                      break;
                  }
              }
          }
          
          if (wouldBreakStraight) {
              breakingValues.push(value);
          }
      }
      console.log(`${breakingValues.length > 0 ? straights + " would be broken by " + breakingValues : values + " don\'t break " + straights}`);
      return breakingValues;
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



  //--------------- Update All Less Conflicting Combinations --------------------------
  //---------------                     BEGINS                    --------------------------
    
  /**
   * Calls updateAvailableMaxCombs() and update all combinations from it
   */

  updateLessConflictingCombs(player) {
    const countOfEachValue = player.getCountOfEachValue();
    this.updateAvailableMaxCombs(countOfEachValue);
    this.updateLessConflictingStraights(this.straights, this.pairs, this.triples);
    this.printAvailableCombs(player);
  }


  /**
   * Creates pure/unconflicting straights by removing conflicting values and regrouping
   * To replace straights in the main 
   * 
   * @param {Array<Array<number>>} straights - 2D array of straight groups (consecutive numbers)
   * @param {Array<Array<number>>} pairs - 2D array of pair combinations
   * @param {Array<Array<number>>} triples - 2D array of triple combinations
   * @returns {Array<Array<number>>} - New 2D array of pure straights with conflicts removed
   * 
   * @example
   * // If straights = [[4,5,6,7,8]], pairs = [[5,5]], triples = [[7,7,7]]
   * // Conflicts = [5,7], length = 5, threshold = 5/4 = 1.25
   * // Since 2 > 1.25, conflicts are removed: group becomes [4,6,8]
   * // After regrouping: [] (no consecutive groups of 3+)
   */
  updateLessConflictingStraights(straights, pairs, triples) {
      // Get all values that exist in pairs and triples (excluding Kings)
      const pairValues = this.flattenCombinations(pairs);
      const tripleValues = this.flattenCombinations(triples);
      const conflictingValues = [...pairValues, ...tripleValues].filter(value => value < 13);
      
      const modifiedGroups = [];
      
      // Process each straight group
      for (let group of straights) {
          if (!group || group.length < 3) continue;
          
          // Find overlapping numbers in this group
          const overlappingNumbers = group.filter(value => 
              value < 13 && conflictingValues.includes(value)
          );
          
          // Check if we should remove conflicts from this group
          const conflictThreshold = (group.length / 4) + 1;

          if (overlappingNumbers.length <= conflictThreshold) {
              // Don't touch this group - conflicts are acceptable
              modifiedGroups.push([...group]);
          } else {
              // Remove conflicting numbers from the group
              const cleanedGroup = group.filter(value => 
                  value >= 13 || !conflictingValues.includes(value)
              );
              
              if (cleanedGroup.length > 0) {
                  modifiedGroups.push(cleanedGroup);
              }
          }
      }
      
      // Flatten all modified groups and regroup into consecutive sequences of 3+
      const allRemainingValues = modifiedGroups.flat().sort((a, b) => a - b);
      
      this.straights = this.regroupConsecutiveValues(allRemainingValues);
  }

  /**
   * Regroups an array of values into consecutive sequences of minimum length 3
   * Consecutive groups are automatically joined together
   * 
   * @param {Array<number>} values - Sorted array of values to regroup
   * @returns {Array<Array<number>>} - 2D array of consecutive groups (minimum length 3)
   * 
   * @example
   * // Input: [4,5,7,8,9,11,12,13]
   * // Output: [[4,5], [7,8,9], [11,12,13]] -> filter length 3+ -> [[7,8,9], [11,12,13]]
   */
  regroupConsecutiveValues(values) {
      if (!values || values.length === 0) {
          return [];
      }
      
      const groups = [];
      let currentGroup = [values[0]];
      
      // Group consecutive values
      for (let i = 1; i < values.length; i++) {
          // Check if current value is consecutive to the last value in current group
          if (values[i] === values[i-1] + 1) {
              currentGroup.push(values[i]);
          } else {
              // End current group and start a new one
              groups.push(currentGroup);
              currentGroup = [values[i]];
          }
      }
      
      // Don't forget the last group
      groups.push(currentGroup);
      console.log("Pure groups just made and ready to go (has less than 3s) ", groups);
      
      // Filter out groups with less than 3 elements (minimum straight size)
      return groups.filter(group => group.length >= 3);
  }

//--------------- Update All Limitedly Conflicting Combinations --------------------------
//---------------                     ENDS                    --------------------------
  


  // -----------   Update Available **Max** Combinations   ----------
  // -----------             BEGINS                ----------

  /**
   * Updates arrays of the 8 types with all maximum possible combinations from current hand.
   * Simple two-pass approach: non-straights first, then straights by consecutive groups.
   * @param {Map} countOfEachValue
   */
  updateAvailableMaxCombs(countOfEachValue) {

      // Pass 1: Process non-straight combinations
      this.processNonStraights(countOfEachValue);
      // Pass 2: Process straight combinations
      this.processStraights(countOfEachValue);
  }

  /**
   * Processes all straight combinations by finding consecutive groups
   * 
   */
  processNonStraights(countOfEachValue) {

    // map.forEach((value, key, map) => { ... }) Value first, then key!!!
    countOfEachValue.forEach((count, value) => {
        // Add maximum combination type for this value
        if (count >= 4) {
            this.quads.push([value]);
        } else if (count >= 3) {
            this.triples.push([value]);
        } else if (count >= 2) {
            this.pairs.push([value]);
        } else {
            this.singles.push([value]);
        }
    });

  }
  /**
   * Processes all straight combinations by finding consecutive groups
   * and determining the minimum multiplicity for each group
   */
  processStraights(countOfEachValue) {

      let singles = [], pairs = [], triples = [], quads = [];
      countOfEachValue.forEach((count, value) => {
          if (value >= 4 && value <= 13) {
              singles.push(value);
              if (count > 1) pairs.push(value);
              if (count > 2) triples.push(value);
              if (count > 3) quads.push(value);
          }
      });

      // Find consecutive groups
      singles = this.findConsecutiveGroups(singles);
      pairs = this.findConsecutiveGroups(pairs);
      triples = this.findConsecutiveGroups(triples);
      quads = this.findConsecutiveGroups(quads);

      this.straights = singles;
      this.pairStraights = pairs;
      this.tripleStraights = triples;
      this.quadStraights = quads;
  }

  /**
   * Finds all consecutive groups from sorted values that are at least 3 cards long
   * @param {Array} values - array of values
   * @returns {Array} 2D array where each sub-array is a consecutive group of ≥3 cards
   */
  findConsecutiveGroups(values) {

      //need at least 3 to form a straight
      if (values.length < 3) return [];

      //sort asc
      values.sort((a, b) => a - b);

      const groups = [];
      let currentGroup = [values[0]];

      for (let i = 1; i < values.length; i++) {
          if (values[i] === values[i-1] + 1) {
              // Consecutive, add to current group
              currentGroup.push(values[i]);
          } else {
              // Not consecutive, save current group if valid and start new one
              if (currentGroup.length >= 3) {
                  groups.push(currentGroup);
              }
              currentGroup = [values[i]];
          }
      }
      
      // Don't forget the last group
      if (currentGroup.length >= 3) {
          groups.push(currentGroup);
      }
      
      return groups;
  }

  // -----------   Update Available **Max** Combinations   ----------
  // -----------              ENDS                 ----------







}

