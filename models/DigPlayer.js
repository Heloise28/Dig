import { CardCombination } from './CardCombination.js';
import { Deck } from './Deck.js';
import { CombType, Suit } from './enums.js';


export class DigPlayer {
  constructor(name, isHuman, seatNumber) {
    this.name = name;
    this.hand = new Deck();
    this.isTurn = false;
    this.isHuman = isHuman;
    this.seatNumber = seatNumber;
    this.countOfEachValue = new Map();
    
    // value is 2D array, outer index is comb size
    // outer index is for straights, but for non straight they are also 1-4 for consistancy
    // inner item is number array of the values of that size
    this.availableMaxCombs  = new Map([
       [CombType.SINGLE, []],
       [CombType.PAIR, []],
       [CombType.TRIPLE, []],
       [CombType.QUAD, []],
       [CombType.STRAIGHT, []],
       [CombType.PAIR_STRAIGHT, []],
       [CombType.TRIPLE_STRAIGHT, []],
       [CombType.QUAD_STRAIGHT, []]
   ]);

  }

  // Getters
  getName() {
    return this.name;
  }

  getHand() {
    return this.hand;
  }

  //returns an integer
  getHandSize() {    
    return this.hand.size();
  }

  getIsTurn() {
    return this.isTurn;
  }

  getIsHuman() {
    return this.isHuman;
  }

  getSeatNumber() {
    return this.seatNumber;
  }

  getAvailableCombinations() {
    return this.availableCombinations;
  }

  // Setters with validation
  setName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Name must be a non-empty string');
    }
    this.name = name.trim();
  }

  setHand(hand) {
    if (!(hand instanceof Deck)) {
      throw new Error('Hand must be a Deck instance');
    }
    this.hand = hand;
  }

  setIsTurn(isTurn) {
    if (typeof isTurn !== 'boolean') {
      throw new Error('isTurn must be a boolean');
    }
    this.isTurn = isTurn;
  }

  setIsHuman(isHuman) {
    if (typeof isHuman !== 'boolean') {
      throw new Error('isHuman must be a boolean');
    }
    this.isHuman = isHuman;
  }

  setSeatNumber(seatNumber) {
    if (typeof seatNumber !== 'number' || !Number.isInteger(seatNumber) || seatNumber < 0) {
      throw new Error('Seat number must be a non-negative integer');
    }
    this.seatNumber = seatNumber;
  }

  addCard(card) {
    this.hand.addCard(card);
  }

  removeCard(card) {
    this.hand.removeCard(card);
  }
  
  addCards(cards) {
    this.hand.addCards(cards);
  }

  removeCards(cards) {
    this.hand.removeCards(cards);
  }

  clearHand() {
    this.hand.clear();
  }

  sortHandAscByValue() {
    this.hand.sortByValueAsc();
  }

  sortHandDescByValue() {
    this.hand.sortByValueDesc();
  }


  /**
   * abstract
   * @return a CardCombination of selected cards
   */
  getCombOfSelectedCards() {
  }

  /**
   * @returns array of selected cards (removed from a player's hand)
   */  
  playSelectedCards() {
    return this.hand.dealSelectedCards();
  }

  loseSelectedCards() {
    this.hand.removeSelectedCards();
  }

  //returns a boolean 
  isPlayerTurn() {
    return this.isTurn;
  }

  setPlayerTurn(isTurn) {
    this.isTurn = isTurn;
  }

  //Abstract method
  bid(playerBid) {

  }


  
  /**
   * Counts occurrences of each card value in the given cards
   * @return {Map} - Map of value to count
   */
  getValueCounts() {
    const cards = this.hand.getCards();
    const counts = new Map();
    for (const card of cards) {
      const value = card.getValue();
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return counts;
  }
    

  // -----------               ENDS                ----------



  toString() {
    let handShortString = '';
    this.hand.cards.forEach((card)=> {
      handShortString += card.toShortString();
      handShortString += ' ';
    });
    
    return `Player: ${this.name}, 
      Seat: ${this.seatNumber}, 
      Hand: ${handShortString}`;
  }
  













  // -----------   Update Available **Max** Combinations   ----------
  // -----------             BEGINS                ----------

  /**
   * Updates availableMaxCombs with all maximum possible combinations from current hand.
   * Simple two-pass approach: non-straights first, then straights by consecutive groups.
   */
  updateAvailableMaxCombs() {

    //update countOfEachValue first;
    this.countOfEachValue = this.getValueCounts();

      // Pass 1: Process non-straight combinations
      // map.forEach((value, key, map) => { ... }) Value first, then key!!!
      this.countOfEachValue.forEach((count, value) => {

          // Add maximum combination type for this value
          if (count >= 4) {
              this.addCombination(CombType.QUAD, 4, value);
          } else if (count >= 3) {
              this.addCombination(CombType.TRIPLE, 3, value);
          } else if (count >= 2) {
              this.addCombination(CombType.PAIR, 2, value);
          } else {
              this.addCombination(CombType.SINGLE, 1, value);
          }
      });

      // Pass 2: Process straight combinations
      this.processStraights();
  }

  /**
   * Processes all straight combinations by finding consecutive groups
   * and determining the minimum multiplicity for each group
   */
  processStraights() {
      // Get all values that can be in straights (4-13), sorted
      const straightValues = Array.from(this.countOfEachValue.keys())
          .filter(value => value >= 4 && value <= 13)
          .sort((a, b) => a - b);

      // Find consecutive groups
      const consecutiveGroups = this.findConsecutiveGroups(straightValues);

      // Process each consecutive group
      consecutiveGroups.forEach(group => {
          // Find minimum count for this group
          const minCount = Math.min(...group.map(value => this.countOfEachValue.get(value)));
          const size = group.length;
          const maxValue = group[group.length - 1]; // Last value is the max

          // Add appropriate straight combination based on minimum count
          if (minCount >= 4) {
              this.addCombination(CombType.QUAD_STRAIGHT, size, maxValue);
          } else if (minCount >= 3) {
              this.addCombination(CombType.TRIPLE_STRAIGHT, size, maxValue);
          } else if (minCount >= 2) {
              this.addCombination(CombType.PAIR_STRAIGHT, size, maxValue);
          } else if (minCount >= 1) {
              this.addCombination(CombType.STRAIGHT, size, maxValue);
          }
      });
  }

  /**
   * Finds all consecutive groups from sorted values that are at least 3 cards long
   * @param {Array} sortedValues - Sorted array of values
   * @returns {Array} 2D array where each sub-array is a consecutive group of ≥3 cards
   */
  findConsecutiveGroups(sortedValues) {
      if (sortedValues.length === 0) return [];
      
      const groups = [];
      let currentGroup = [sortedValues[0]];

      for (let i = 1; i < sortedValues.length; i++) {
          if (sortedValues[i] === sortedValues[i-1] + 1) {
              // Consecutive, add to current group
              currentGroup.push(sortedValues[i]);
          } else {
              // Not consecutive, save current group if valid and start new one
              if (currentGroup.length >= 3) {
                  groups.push(currentGroup);
              }
              currentGroup = [sortedValues[i]];
          }
      }
      
      // Don't forget the last group
      if (currentGroup.length >= 3) {
          groups.push(currentGroup);
      }
      
      return groups;
  }

  /**
   * Helper to add combination to availableMaxCombs
   * @param {CombType} combType - Type of combination
   * @param {number} size - Size of combination
   * @param {number} maxValue - Maximum value in combination
   */
  addCombination(combType, size, maxValue) {
      const typeArray = this.availableMaxCombs.get(combType);
      if (!typeArray[size]) {
          typeArray[size] = [];
      }
      typeArray[size].push(maxValue);
  }

  // -----------   Update Available **Max** Combinations   ----------
  // -----------              ENDS                 ----------


















  // -----------   Update Available Combinations   ----------
  // -----------             BEGINS                ----------

  //  **NOT USED! I SWITCH TO SIMPLER availableMaxCombs**

  /**
   * Update Available Combinations
   * Must be called after playing a card.
   */
  updateAvailableCombs() {

    //update countOfEachValue first;
    this.countOfEachValue = this.getValueCounts();

    // Build singles, pairs, triples, and quads
    for (let [value, count] of this.countOfEachValue) {
        if (count >= 1) {
            this.ensureArrayExists(CombType.SINGLE, 1);
            this.allAvailableCombs.get(CombType.SINGLE)[1].push(value);
        }
        if (count >= 2) {
            this.ensureArrayExists(CombType.PAIR, 2);
            this.allAvailableCombs.get(CombType.PAIR)[2].push(value);
        }
        if (count >= 3) {
            this.ensureArrayExists(CombType.TRIPLE, 3);
            this.allAvailableCombs.get(CombType.TRIPLE)[3].push(value);
        }
        if (count >= 4) {
            this.ensureArrayExists(CombType.QUAD, 4);
            this.allAvailableCombs.get(CombType.QUAD)[4].push(value);
        }
    }

    // Build all types of straights
    this.buildStraights();
  }

  ensureArrayExists(type, index) {
    const arr = this.allAvailableCombs.get(type);
    while (arr.length <= index) {
        arr.push([]);
    }
  }

  buildStraights() {
    // Get available values for straights (4-13, excluding 14,15,16)
    const straightValues = [];
    for (let [value, count] of this.countOfEachValue) {
        if (value >= 4 && value <= 13) {
            straightValues.push({ value, count });
        }
    }
    
    // Sort by value
    straightValues.sort((a, b) => a.value - b.value);
    
    if (straightValues.length < 3) return; // Need at least 3 different values for straights
    
    // Try all possible straight lengths from 3 to straightValues.length
    for (let length = 3; length <= straightValues.length; length++) {
        // Try all possible starting positions
        for (let start = 0; start <= straightValues.length - length; start++) {
            // Check if we have a consecutive sequence
            let isConsecutive = true;
            let minCount = Infinity;
            
            for (let i = 0; i < length; i++) {
                if (i > 0 && straightValues[start + i].value !== straightValues[start + i - 1].value + 1) {
                    isConsecutive = false;
                    break;
                }
                minCount = Math.min(minCount, straightValues[start + i].count);
            }
            
            if (isConsecutive) {
                const highestValue = straightValues[start + length - 1].value;
                
                // Regular straight (need at least 1 of each card)
                if (minCount >= 1) {
                    this.ensureArrayExists(CombType.STRAIGHT, length);
                    this.allAvailableCombs.get(CombType.STRAIGHT)[length].push(highestValue);
                }
                
                // Pair straight (need at least 2 of each card)
                if (minCount >= 2) {
                    this.ensureArrayExists(CombType.PAIR_STRAIGHT, length * 2);
                    this.allAvailableCombs.get(CombType.PAIR_STRAIGHT)[length * 2].push(highestValue);
                }
                
                // Triple straight (need at least 3 of each card)
                if (minCount >= 3) {
                    this.ensureArrayExists(CombType.TRIPLE_STRAIGHT, length * 3);
                    this.allAvailableCombs.get(CombType.TRIPLE_STRAIGHT)[length * 3].push(highestValue);
                }
                
                // Quad straight (need at least 4 of each card)
                if (minCount >= 4) {
                    this.ensureArrayExists(CombType.QUAD_STRAIGHT, length * 4);
                    this.allAvailableCombs.get(CombType.QUAD_STRAIGHT)[length * 4].push(highestValue);
                }
            }
        }
    }
  }

  // -----------   Update Available Combinations   ----------
  // -----------              ENDS                 ----------













  /**
   * Just copy and change availableMaxCombs to allAvailableCombs, and add allAvailableCombs back in constructor, it should print
   * Because availableMaxCombs and allAvailableCombs are same data structure. allAvailableCombs
   */
  printAvailableMaxCombs() {
    console.log(`=== ${this.name}'s Available Combinations ===`);
    
    const typesToDisplay = [
        { type: CombType.SINGLE, name: "Single", fixedSize: 1 },
        { type: CombType.PAIR, name: "Pair", fixedSize: 2 },
        { type: CombType.TRIPLE, name: "Triple", fixedSize: 3 },
        { type: CombType.QUAD, name: "Quad", fixedSize: 4 },
        { type: CombType.STRAIGHT, name: "Straight", fixedSize: null },
        { type: CombType.PAIR_STRAIGHT, name: "Pair Straight", fixedSize: null },
        { type: CombType.TRIPLE_STRAIGHT, name: "Triple Straight", fixedSize: null },
        { type: CombType.QUAD_STRAIGHT, name: "Quad Straight", fixedSize: null }
    ];
    
    for (let typeInfo of typesToDisplay) {
        const combinations = [];
        const arrays = this.availableMaxCombs.get(typeInfo.type);
        
        if (!arrays) continue;
        
        if (typeInfo.fixedSize !== null) {
            // For non-straights, only check the specific size index
            if (arrays.length > typeInfo.fixedSize && arrays[typeInfo.fixedSize] && arrays[typeInfo.fixedSize].length > 0) {
                for (let value of arrays[typeInfo.fixedSize]) {
                    const combination = this.buildCombinationDisplay(typeInfo.type, typeInfo.fixedSize, value);
                    combinations.push(combination.join(''));
                }
            }
        } else {
            // For straights, check all possible sizes
            for (let size = 3; size < arrays.length; size++) { // Start from 3 since straights need at least 3 cards
                if (arrays[size] && arrays[size].length > 0) {
                    for (let highestValue of arrays[size]) {
                        const combination = this.buildCombinationDisplay(typeInfo.type, size, highestValue);
                        combinations.push(combination.join(''));
                    }
                }
            }
        }
        
        if (combinations.length > 0) {
            console.log(`${typeInfo.name}: [${combinations.join(', ')}]`);
        } else {
            console.log(`${typeInfo.name}: (none)`);
        }
    }
    
    console.log("===============================");
  }

  buildCombinationDisplay(type, size, highestValue) {
      const valueToDisplay = (val) => {
          if (val === 11) return 'J';
          if (val === 12) return 'Q'; 
          if (val === 13) return 'K';
          if (val === 14) return 'A';
          if (val === 15) return '2';
          if (val === 16) return '3';
          return val.toString();
      };
      
      switch (type) {
          case CombType.SINGLE:
              return [valueToDisplay(highestValue)];
              
          case CombType.PAIR:
              return [valueToDisplay(highestValue), valueToDisplay(highestValue)];
              
          case CombType.TRIPLE:
              return [valueToDisplay(highestValue), valueToDisplay(highestValue), valueToDisplay(highestValue)];
              
          case CombType.QUAD:
              return [valueToDisplay(highestValue), valueToDisplay(highestValue), valueToDisplay(highestValue), valueToDisplay(highestValue)];
              
          case CombType.STRAIGHT:
              const straightCards = [];
              for (let i = highestValue - size + 1; i <= highestValue; i++) {
                  straightCards.push(valueToDisplay(i));
              }
              return straightCards;
              
          case CombType.PAIR_STRAIGHT:
              const pairStraightCards = [];
              const pairLength = size / 2;
              for (let i = highestValue - pairLength + 1; i <= highestValue; i++) {
                  pairStraightCards.push(valueToDisplay(i), valueToDisplay(i));
              }
              return pairStraightCards;
              
          case CombType.TRIPLE_STRAIGHT:
              const tripleStraightCards = [];
              const tripleLength = size / 3;
              for (let i = highestValue - tripleLength + 1; i <= highestValue; i++) {
                  tripleStraightCards.push(valueToDisplay(i), valueToDisplay(i), valueToDisplay(i));
              }
              return tripleStraightCards;
              
          case CombType.QUAD_STRAIGHT:
              const quadStraightCards = [];
              const quadLength = size / 4;
              for (let i = highestValue - quadLength + 1; i <= highestValue; i++) {
                  quadStraightCards.push(valueToDisplay(i), valueToDisplay(i), valueToDisplay(i), valueToDisplay(i));
              }
              return quadStraightCards;
              
          default:
              return [];
      }
  }



  }