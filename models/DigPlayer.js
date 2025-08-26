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
    
    // value is 2D array, outer index is comb size, mainly for straights
    // for non straight they are all 1, because only 1 unique value
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

   //array of values of each type
   this.singles = [];
   this.pairs = [];
   this.triples = [];
   this.quads = [];
   //straights are 2d arries.
   this.straights = [];
   this.pairStraights = [];
   this.tripleStraights = [];
   this.quadStraights = [];

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
      this.processNonStraights();
      // Pass 2: Process straight combinations
      this.processStraights();
  }

  /**
   * Processes all straight combinations by finding consecutive groups
   * 
   */
  processNonStraights() {

    // map.forEach((value, key, map) => { ... }) Value first, then key!!!
    this.countOfEachValue.forEach((count, value) => {
        // Add maximum combination type for this value
        if (count >= 4) {
            this.quads.push([value, value, value, value]);
        } else if (count >= 3) {
            this.triples.push([value, value, value]);
        } else if (count >= 2) {
            this.pairs.push([value, value]);
        } else {
            this.singles.push([value]);
        }
    });

  }
  /**
   * Processes all straight combinations by finding consecutive groups
   * and determining the minimum multiplicity for each group
   */
  processStraights() {

      let singles = [], pairs = [], triples = [], quads = [];
      this.countOfEachValue.forEach((count, value) => {
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








  printAvailableMaxCombs() {
       //helps printing
      const TypesAndArrays = [
          { type: CombType.SINGLE, array: this.singles },
          { type: CombType.PAIR, array: this.pairs },
          { type: CombType.TRIPLE, array: this.triples },
          { type: CombType.QUAD, array: this.quads },
          { type: CombType.STRAIGHT, array: this.straights },
          { type: CombType.PAIR_STRAIGHT, array: this.pairStraights },
          { type: CombType.TRIPLE_STRAIGHT, array: this.tripleStraights },
          { type: CombType.QUAD_STRAIGHT, array: this.quadStraights }
      ];


    console.log(`=== ${this.name}'s Available Combinations ===`);

    for (let typeInfo of TypesAndArrays) {
        const combinations = [];
        typeInfo.array.forEach ((comb) => {
            const combination = this.buildCombinationDisplay(typeInfo.type, comb);
            combinations.push(combination.join(''));
        });

        if (combinations.length > 0) {
            console.log(`${typeInfo.type}: [${combinations.join(', ')}]`);
        } else {
            console.log(`${typeInfo.type}: (none)`);
        }
    }
  }



  buildCombinationDisplay(type, comb) {
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
              return [valueToDisplay(comb[0])];
              
          case CombType.PAIR:
              return [valueToDisplay(comb[0]), valueToDisplay(comb[0])];
              
          case CombType.TRIPLE:
              return [valueToDisplay(comb[0]), valueToDisplay(comb[0]), valueToDisplay(comb[0])];
              
          case CombType.QUAD:
              return [valueToDisplay(comb[0]), valueToDisplay(comb[0]), valueToDisplay(comb[0]), valueToDisplay(comb[0])];
              
          case CombType.STRAIGHT:
              const straightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  straightCards.push(valueToDisplay(comb[i]));
              }
              return straightCards;
              
          case CombType.PAIR_STRAIGHT:
              const pairStraightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  pairStraightCards.push(valueToDisplay(comb[i]), valueToDisplay(comb[i]));
              }
              return pairStraightCards;
              
          case CombType.TRIPLE_STRAIGHT:
              const tripleStraightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  tripleStraightCards.push(valueToDisplay(comb[i]), valueToDisplay(comb[i]), valueToDisplay(comb[i]));
              }
              return tripleStraightCards;
              
          case CombType.QUAD_STRAIGHT:
              const quadStraightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  quadStraightCards.push(valueToDisplay(comb[i]), valueToDisplay(comb[i]), valueToDisplay(comb[i]), valueToDisplay(comb[i]));
              }
              return quadStraightCards;
              
          default:
              return [];
      }
  }



  }