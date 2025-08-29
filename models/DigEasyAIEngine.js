
/**
 * @TODO
 * because singles - quadstraights are noe data memeber, don't dnon't need parameter!!!
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

    const isFirstRound = state.getIsFirstRound();        
    const valueToBeat = state.getValue();
    const isOpenRound = state.getIsOpenRound();
    const straightSizeOfTurn = state.getStraightSize();
    const typeOfTurn = state.getType();

    //check roud state for testing
    if (CombType.isValid(typeOfTurn)) {
        if (typeOfTurn === CombType.NONE) {
          if (straightSizeOfTurn !== 0 || valueToBeat !== 0) {
            throw new Error('Open Round, straight size and value to beat must be 0');
          }
        } else if (typeOfTurn === CombType.STRAIGHT
           || typeOfTurn === CombType.PAIR_STRAIGHT
           || typeOfTurn === CombType.TRIPLE_STRAIGHT
           || typeOfTurn === CombType.QUAD_STRAIGHT) {
              if (straightSizeOfTurn === 0) {
                  throw new Error('Straight Round, straight size must NOT be 0');
              }
           }
    } else {
      throw new Error("Type of Combination of Turn, N\'EXISTE PAS!");
    }

    const playResult = this.getPlayFromHandler(
      straightSizeOfTurn, 
      valueToBeat, 
      typeOfTurn,
      isFirstRound
    );
    
    console.log(`${player.name} decided to play `, playResult, ' but hasn\'t played them yet. (Message from getAIcombDecision(state))');

    // First round (find heart) also handled here.
    const combToPlay = this.findCombsToPlay(
      player, 
      playResult, 
      typeOfTurn, 
      straightSizeOfTurn, 
      isFirstRound, 
      valueToBeat
    );

    console.log('\nDid I handle combs with repeats? Comb to Playis :  ', combToPlay.toShortString(), '\n');

    combToPlay.selectComb(); 

    console.log(`And the picked comb looks like ${combToPlay.getSize() > 0 ? combToPlay.toShortString() : 'nothing'}.`);

    return combToPlay;
  }

  /**
   * Set the type of round to the type of which I have most combinations to play
   * For first round, prioritizes types where the lowest value is exactly one above valueToBeat
   * 
   * @param {number} straightSizeOfTurn - Straight size to follow
   * @param {number} valueToBeat - The minimum value that needs to be exceeded
   * @param {CombType} typeOfTurn
   * @param {Boolean} isFirstRound
   * @returns {Array<number>} The type I want this round to follow
   */
  getPlayFromHandler(straightSizeOfTurn, valueToBeat, typeOfTurn, isFirstRound) {
        // Play decision based on typeOfTurn
    let playResult = [];
    console.log('So type of turn is ' + typeOfTurn + '. Start handling.... (I\m in getPlayFromHandler() right before switch, which is inside getAIcombDecision(player, state))');

    switch (typeOfTurn) {
        case CombType.SINGLE:
            playResult = this.handleSinglesPlay(valueToBeat);
            break;
            
        case CombType.PAIR:
            playResult = this.handlePairsPlay(valueToBeat);
            playResult.push(...playResult);
            break;
            
        case CombType.TRIPLE:
            let tempTrip = this.handleTriplesPlay(valueToBeat);
            for (const value of tempTrip) {
              playResult.push(value);
              playResult.push(value);
              playResult.push(value);
            }
            break;
            
        case CombType.QUAD:
            playResult = this.handleQuadsPlay(valueToBeat);
            playResult.push(...playResult);
            playResult.push(...playResult);
            break;
            
        case CombType.STRAIGHT:
            playResult = this.handleStraightsPlay(this.straights, valueToBeat, straightSizeOfTurn);
            break;
            
        case CombType.PAIR_STRAIGHT:
            playResult = this.handleRepeatStraightsPlay(this.pairStraights, valueToBeat, straightSizeOfTurn);
            playResult.push(...playResult);
            playResult.sort((a, b) => a - b);
            break;
            
        case CombType.TRIPLE_STRAIGHT:
            let tempTripStr = this.handleRepeatStraightsPlay(this.tripleStraights, valueToBeat, straightSizeOfTurn);
            for (const value of tempTripStr) {
              playResult.push(value);
              playResult.push(value);
              playResult.push(value);
            }
            playResult.sort((a, b) => a - b);
            break;
            
        case CombType.QUAD_STRAIGHT:
            playResult = this.handleRepeatStraightsPlay(this.quadStraights, valueToBeat, straightSizeOfTurn);
            playResult.push(...playResult);
            playResult.push(...playResult);
            playResult.sort((a, b) => a - b);
            break;
            
        case CombType.NONE:           
            playResult = this.handleNoneTypePlay(
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
  decideRoundType(isFirstRound, valueToBeat) {   

      // All combination types with their data
      const allTypes = [
          { type: CombType.QUAD_STRAIGHT, combinations: this.quadStraights },
          { type: CombType.TRIPLE_STRAIGHT, combinations: this.tripleStraights },
          { type: CombType.PAIR_STRAIGHT, combinations: this.pairStraights },
          { type: CombType.QUAD, combinations: this.quads },
          { type: CombType.TRIPLE, combinations: this.triples },
          { type: CombType.STRAIGHT, combinations: this.straights },
          { type: CombType.PAIR, combinations: this.pairs },
          { type: CombType.SINGLE, combinations: this.singles }
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
  handleSinglesPlay(valueToBeat) {
      // Find best combination from pairs that can be broken up
      return this.findBestCandidate(this.singles, valueToBeat);
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
  handlePairsPlay(valueToBeat) {
      const candidates = this.pairs;

      
      // Add special cases: if we have 3+ twos (15) or 3+ threes (16) in triples or quads
      // Since 2s and 3s can't participate in straights, they can be safely broken down  
      // Check triples for twos and threes
      for (let triple of this.triples) {
          if (!triple || triple.length === 0) continue;
          
          const tripleValue = triple[0];
          
          // If we have triples of value 15 (twos) or 16 (threes)
          if (tripleValue === 15 && candidates[candidates.length-1] < 15) {
              candidates.push([tripleValue]);
          }

          if (tripleValue === 16 && candidates[candidates.length-1] < 16) {
              candidates.push([tripleValue]);
          }
      }
      
      // Check quads for twos and threes
      for (let quad of this.quads) {
          if (!quad || quad.length < 4) continue;
          
          const quadValue = quad[0];
          
          // If we have quads of value 15 (twos) or 16 (threes)
          if (quadValue === 15 || candidates[candidates.length-1] < 15) {
              candidates.push([quadValue]);
          }
          if (quadValue === 16 || candidates[candidates.length-1] < 16) {
              candidates.push([quadValue]);
          }
      }
      
      // Find best combination from quads that can be broken down
      return this.findBestCandidate(candidates, valueToBeat);
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
  handleTriplesPlay(valueToBeat) {

      console.log('GAGU', valueToBeat);
      const candidates = this.triples;

      let safeQuads = [];
      // steal 2 and 3 from quads too
      if (this.quads.length !== 0) {
            safeQuads = this.quads.filter(combination => {
            return combination && combination[0] > 14;
        });
      }
      candidates.push(...safeQuads);  
      return this.findBestCandidate(candidates, valueToBeat);
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
  handleQuadsPlay(valueToBeat) {
      return this.findBestCandidate(this.quads, valueToBeat);
  }

  handleStraightsPlay(straights, valueToBeat, straightSizeOfTurn) {
    // If straightSizeOfTurn is 0, find the first available straight
    // If we get to this situation, that means open round and type set to straight
    // Which means there is at least a straight to play
    // And Value to beat is 0
    if (straightSizeOfTurn === 0) {
      return straights[0];
    }

    // If no straights available, return empty
    if (straights.length === 0) {
        return [];
    }
    // Find straights with length >= 3 and max value > valueToBeat
    const straightsThatBeats = this.getStraightsThatBeats (straights, valueToBeat);

    const candidateStraights = this.generateSafePossibleStraights(straightsThatBeats, straightSizeOfTurn);
    
    // Find the best candidate from all valid straight sections
    return this.findBestCandidate(candidateStraights, valueToBeat);

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
  handleRepeatStraightsPlay(straights, valueToBeat, straightSizeOfTurn) {
    // If straightSizeOfTurn is 0, find the first available straight
    // If we get to this situation, that means open round and type set to straight
    // Which means there is at least a straight to play
    // And Value to beat is 0
    if (straightSizeOfTurn === 0) {
      return straights[0];
    }

    // If no straights available, return empty
    if (straights.length === 0) {
        return [];
    }

    // Find straights with length >= 3 and max value > valueToBeat
    const straightsThatBeats = this.getStraightsThatBeats (straights, valueToBeat);

    const candidateStraights = this.generateSafePossibleStraights(straightsThatBeats, straightSizeOfTurn);
    
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
  handlePairStraightsPlay(valueToBeat, straightSize) {
    // Deprecated
      const allPossibleStraights = this.generateSafePossibleStraights(this.pairStraights, straightSize);
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
  handleTripleStraightsPlay(valueToBeat, straightSize) {
    // Deprecated
      const allPossibleStraights = this.generateSafePossibleStraights(this.tripleStraights, straightSize);
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
  handleQuadStraightsPlay(valueToBeat, straightSize) {
    // Deprecated
      const allPossibleStraights = this.generateSafePossibleStraights(this.quadStraights, straightSize);
      return this.findBestCandidate(allPossibleStraights, valueToBeat);
  }

  /**
   * Like this is an untility function, independent from AI level
   * translate an array of card values to a CardCombination
   * @param {Array<Array<Number>>} : all player max combinations
   * @param: And many DigRoundStates Things
   * @returns {Array<number>} Best type AND combination to play
  */
  handleNoneTypePlay(typeOfTurn, straightSizeOfTurn, isFirstRound, valueToBeat) {
    typeOfTurn = this.decideRoundType(isFirstRound, valueToBeat);

    console.log(`Decided this round's combination type to be ${typeOfTurn}`);

    return this.getPlayFromHandler(
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

  getStraightsThatBeats (straights, valueToBeat) {
    const straightsThatBeats = straights.filter(straight => 
        straight && straight.length >= 3 && 
        straight[straight.length - 1] > valueToBeat
    );
    console.log("(getStraightsThatBeats()) Value to beat: ", valueToBeat);
    console.log('(getStraightsThatBeats()) Straights That Beats ready to be processed: ', straightsThatBeats);
    return straightsThatBeats;
  }  

/**
   * Generates all possible straight sub-combinations from a given straight
   * Minimum straight length is 3, so generates all contiguous subsequences of length 3 or more
   * That also don't break this straight
   * 
   * @param {Array<number>} straight - A single straight array (e.g., [4,5,6,7])
   * @returns {Array<Array<number>>} - All possible sub-straights of length 3+
   * @param {number} straightSize - Straight size to follow
   */
  generateSafeSubStraights(straight, straightSize) {
      console.log('generateSafeSubStraights is called......Takes: ', straight, ' and size: ', straightSize);

      if (straightSize < 3) {
        throw new Error('Hey you want straights but it\'t not the stage to require 0 size straigt. I\'m in generateSubStraights() BTW');
      }
          
      //Case of can't generate straights larger then itself.
      if (straight.length < straightSize) {
        console.log('Can\'t generate straights larger then itself. Returning nothing.');
        return [[]];
      }

      // Case of garenteed break
      if (straight.length < straightSize * 2) {
        console.log('Straight to small to have sub straights. Returning itself.');
        return [[]];
      }

      const subStraights = [];
      // Generate all contiguous subsequences of length 3 or more
      for (let start = 0; start <= straight.length - straightSize; start++) {
          if (start === 0 || start === straight.length - straightSize) {              
            const subStraight = straight.slice(start, start + straightSize);
            subStraights.push(subStraight);
            console.log(`I got this subStraight: ${subStraight}`);
          
          } else if (start >= straightSize && start <= straight.length - straightSize * 2) {              
            const subStraight = straight.slice(start, start + straightSize);
            subStraights.push(subStraight);
            console.log(`I got this subStraight: ${subStraight}`);          

          }
      }
      console.log('generateSubStraights outputs: ', subStraights);
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
  generateSafePossibleStraights(straights, straightSize) {
      const allPossibleStraights = [];
      
      for (let straight of straights) {
          if (!straight || straight.length < 3) continue;
          
          const subStraights = this.generateSafeSubStraights(straight, straightSize);
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
   * Helper function to find values that would break straights to less than a min size if removed
   * 
   * @param {Array<number>} straight - an array of straight combinations (preserving groups)
   * @param {Array<number>} values - Array of values to check against straights. 
   *  --- !! param values must be garenteed to exist in this straight.
   * @param {Number} mustMaintainSize
   * @returns {Array<number>} - Values that would break straights if removed
   */
  findStraightBreakers(straight, values, mustMaintainSize) {   
    console.log(`Let's see if ${values} breaks ${straight}`);
      if (mustMaintainSize < 3 || straight.length < 3) {
          throw new Error(`Invalid find straight safe request. ${straight.length}, ${mustMaintainSize}`);
      }

      if (straight.length <= mustMaintainSize) {
        console.log('This straight ', straight, ' is too short to be safe from anything.');
        return values.filter(value => straight.includes(value));
      }

      const breakerValues = [];

      for (let i = 0; i < values.length - 1; i++) {
          if (!straight) continue;
          if (values[i] < straight[0]) continue;
          // Big straight, push
          if (straight.length >= (mustMaintainSize * 2) + 1) {
            // Exclude non-breakers in the middle
            if (values[i] < straight[mustMaintainSize] || straight[straight.length - mustMaintainSize - 1] < values[i]) {
              // Exclude head and tail
              if (values[i] !== straight[0] & values[i] !== straight[straight.length - 1]) {
                  // Push the rest
                  breakerValues.push(values[i]);
              }
            }

          } else { //Small straight, only head or tail are not breaker, push the rest.
            if (values[i] !== straight[0] & values[i] !== straight[straight.length - 1]) {
                breakerValues.push(values[i]);
            }
          }
      }
      console.log(`${breakerValues.length > 0 ? straight + " would be broken by " + breakerValues : values + " do not break " + straight}`);
      return breakerValues;
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
      console.log('Looking for best candidate in ', candidates, ' to beat ', valueToBeat);
      // Return empty array if no candidates provided
      if (!candidates || candidates.length === 0) {
          console.log('findBestCandidate(), and I got nothing! So best candidate is nothing.');
          return [];
      }

      // Just to be sure, sort candidates by value ascending
      candidates.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

      let bestCombination = [];
      // Iterate through each candidate combination
      // Find first one that beats, which will be the smallest because candidates sorted.
      for (let i = 0; i < candidates.length; i++) {
          const combination = candidates[i];

          // Check if this combination can beat the target value
          if (combination[combination.length - 1] > valueToBeat) {
              console.log('Got a smallest winning value: ', combination[combination.length - 1]);
              bestCombination = combination;
              break;
          }
      }
      console.log('Best candidate is ', bestCombination);
      // Return the best combination found, or empty array if none can win
      return bestCombination;
  }
//--------------- Helpers for Easy Logic for Handling All 8 Types --------------------------
//---------------                     ENDS                      --------------------------



  //--------------- Update All Safe Combinations --------------------------
  //---------------                     BEGINS                    --------------------------
    
  /**
   * Calls updateAvailableMaxCombs() and update all combinations from it
   */

  updateSafeCombs(player) {
    const countOfEachValue = player.getCountOfEachValue();
    this.updateAvailableMaxCombs(countOfEachValue);
    this.turnMaxCombsSafe();
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
  turnMaxCombsSafe() {        
      console.log('------  Player\'s combs before SAFE ------- ');
      console.log(this.singles);
      console.log(this.pairs);
      console.log(this.triples);
      console.log(this.quads);
      console.log(this.straights);
      console.log(this.pairStraights);
      console.log(this.tripleStraights);
      console.log(this.quadStraights);
      console.log('\n');

      const singleValues = this.flattenCombinations(this.singles);
      const pairValues = this.flattenCombinations(this.pairs);
      const tripleValues = this.flattenCombinations(this.triples);
      const quadValues = this.flattenCombinations(this.quads);
      const straightValues = this.flattenCombinations(this.straights);
      const pairStraightValues = this.flattenCombinations(this.pairStraights);
      const tripleStraightValues = this.flattenCombinations(this.tripleStraights);
      const quadStraightValues = this.flattenCombinations(this.quadStraights);


      const overlappingSingles = singleValues.filter(value => straightValues.includes(value));
      const overlappingPairs = pairValues.filter(value => straightValues.includes(value));
      const overlappingTriples = tripleValues.filter(value => straightValues.includes(value));      
      const overlappingQuads = quadValues.filter(value => straightValues.includes(value));

      const breakerSingles = [];
      const breakerPairs = [];
      const breakerTriples = [];
      const breakerQuads = [];

      // Get's ready for cleaning groups
      // original singles and pairs that can potentially damage the group
      // need for later process the straights
      const pairsAndTriples = [...pairValues, ...tripleValues].filter(value => value < 13);
      const modifiedGroups = [];
      
      // Process each straight group
      for (let group of this.straights) {
          if (!group || group.length < 3) continue;
          
          // Add to breakerSingles;
          console.log(`Now group is: ${group}`);
          breakerSingles.push(...this.findStraightBreakers(group, overlappingSingles, 4));
          breakerPairs.push(...this.findStraightBreakers(group, overlappingPairs, 3));
          breakerTriples.push(...this.findStraightBreakers(group, overlappingTriples, 3));
          breakerQuads.push(...this.findStraightBreakers(group, overlappingQuads, 3));
          
          // Now let's update this group
          // Rule a little different so separate.
          // Find overlapping numbers in this group
          const overlappingNumbers = group.filter(value => 
              value < 13 && pairsAndTriples.includes(value)
          );
          
          // Check if we should remove conflicts from this group
          const conflictThreshold = (group.length / 4) + 1;

          if (overlappingNumbers.length <= conflictThreshold) {
              // Don't touch this group - conflicts are acceptable
              modifiedGroups.push([...group]);
          } else {
              // Remove conflicting numbers from the group
              const cleanedGroup = group.filter(value => 
                  value >= 13 || !pairsAndTriples.includes(value)
              );
              
              if (cleanedGroup.length > 0) {
                  modifiedGroups.push(cleanedGroup);
              }
          }
      }

      // Flatten all modified groups and regroup into consecutive sequences of 3+
      const allRemainingValues = modifiedGroups.flat().sort((a, b) => a - b);
      this.straights = this.regroupConsecutiveValues(allRemainingValues);
      
      // Add K's because K is breaker, break biggesr straights
      if (overlappingSingles[overlappingSingles.length - 1] === 13) breakerSingles.push(13);
      if (overlappingPairs[overlappingPairs.length - 1] === 13) breakerPairs.push(13);
      if (overlappingTriples[overlappingTriples.length - 1] === 13) breakerTriples.push(13);

      // Filter breakers out
      const safeSingles = singleValues.filter(value => !breakerSingles.includes(value));
      const safePairs = pairValues.filter(value => !breakerPairs.includes(value));
      const safeTriples = tripleValues.filter(value => !breakerTriples.includes(value));
      const safeQuads = quadValues.filter(value => !breakerQuads.includes(value));

      // "Downgrade" quads, triples, pairs, add to lower tiers
      for (const breaker of breakerPairs) {
        safeSingles.push(breaker);
      }

      for (const breaker of breakerTriples) {
        if (pairStraightValues.includes(breaker)) {
          safeSingles.push(breaker);
        } else {
          safePairs.push(breaker);
        }
      }

      for (const breaker of breakerQuads) {
        if (tripleStraightValues.includes(breaker)) {
          safeSingles.push(breaker);      
        } else if (pairStraightValues.includes(breaker)) {
          safePairs.push(breaker);
        } else {
          safeTriples.push(breaker);
        }
      }


      safeSingles.sort((a, b) => a - b);
      safePairs.sort((a, b) => a - b);
      safeTriples.sort((a, b) => a - b);
      safeQuads.sort((a, b) => a - b);

      // Rebuild 2D arrays to work with
      this.singles = safeSingles.map(num => [num]);
      this.pairs = safePairs.map(num => [num]);
      this.triples = safeTriples.map(num => [num]);
      this.quads = safeQuads.map(num => [num]);
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

