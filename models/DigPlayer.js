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
    
    //[]是array of card comb
    this.availableCombinations = new Map([
      [CombType.SINGLE, []],
      [CombType.PAIR, []],
      [CombType.TRIPLE, []],
      [CombType.QUAD, []],
      [CombType.STRAIGHT, []],
      [CombType.PAIR_STRAIGHT, []],
      [CombType.TRIPLE_STRAIGHT, []],
      [CombType.QUAD_STRAIGHT, []],
    ])

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
   * @return a CardCombination of selected cards
   * to be examined by game engine.
   */
  getSelectedCardComb() {
    let selectedCards = this.hand.getSelectedCards();
    return new CardCombination(selectedCards);
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



  // -----------   Update Available Combinations   ----------
  // -----------             BEGINS                ----------

  /**
   * Updates available combinations for the player's hand
   * Populates this.availableCombinations with unique combinations (no duplicates by value/straightSize)
   */
  updateAvailableCombinations() {
    this.clearCombinations();
    this.sortHandAscByValue();
    
    const cards = this.getHand().cards;
    if (cards.length === 0) return;
    
    const valueGroups = this.groupCardsByValue(cards);
    
    this.updateSameValueCombinations(valueGroups);
    this.updateAllStraights(valueGroups);
  }

  /**
   * Clears all existing combinations from availableCombinations map
   */
  clearCombinations() {
    for (const [type, combos] of this.availableCombinations) {
      combos.length = 0;
    }
  }

  /**
   * Groups cards by their value
   * @param {Array} cards - Array of card objects
   * @return {Map} valueGroup - Map where key is card value, value is array of cards with that value
   */
  groupCardsByValue(cards) {
    const valueGroups = new Map();
    
    for (const card of cards) {
      const value = card.getValue();
      if (!valueGroups.has(value)) {
        valueGroups.set(value, []);
      }
      valueGroups.get(value).push(card);
    }
    
    return valueGroups;
  }

  /**
   * Updates combinations for cards of the same value (singles, pairs, triples, quads)
   * @param {Map} valueGroups - Map of value to cards array
   */
  updateSameValueCombinations(valueGroups) {
    for (const [value, cardsWithValue] of valueGroups) {
      this.addSingles(cardsWithValue);
      this.addPairs(cardsWithValue);
      this.addTriples(cardsWithValue);
      this.addQuads(cardsWithValue);
    }
  }

  /**
   * Adds all single card combinations for cards of the same value
   * @param {Array} cards - Cards with the same value
   */
  addSingles(cards) {
    // Only add one single per value since all cards of same value are equivalent
    if (cards.length > 0) {
      const combo = new CardCombination([cards[0]]);
      combo.setType(CombType.SINGLE);
      combo.setValue(combo.getFirstCardValue());
      this.availableCombinations.get(CombType.SINGLE).push(combo);
    }
  }

  /**
   * Adds pair combination for cards of the same value (if 2 or more available)
   * @param {Array} cards - Cards with the same value
   */
  addPairs(cards) {
    if (cards.length >= 2) {
      // Only need one pair per value since all pairs of same value are equivalent
      const combo = new CardCombination([cards[0], cards[1]]);
      combo.setType(CombType.PAIR);
      combo.setValue(combo.getFirstCardValue());
      this.availableCombinations.get(CombType.PAIR).push(combo);
    }
  }

  /**
   * Adds triple combination for cards of the same value (if 3 or more available)
   * @param {Array} cards - Cards with the same value
   */
  addTriples(cards) {
    if (cards.length >= 3) {
      // Only need one triple per value since all triples of same value are equivalent
      const combo = new CardCombination([cards[0], cards[1], cards[2]]);
      combo.setType(CombType.TRIPLE);
      combo.setValue(combo.getFirstCardValue());
      this.availableCombinations.get(CombType.TRIPLE).push(combo);
    }
  }

  /**
   * Adds quad combination for cards of the same value (if 4 available)
   * @param {Array} cards - Cards with the same value
   */
  addQuads(cards) {
    if (cards.length >= 4) {
      // Only one quad possible per value
      const combo = new CardCombination([cards[0], cards[1], cards[2], cards[3]]);
      combo.setType(CombType.QUAD);
      combo.setValue(combo.getFirstCardValue());
      this.availableCombinations.get(CombType.QUAD).push(combo);
    }
  }

  /**
   * Updates all straight-type combinations (straight, pair straight, triple straight, quad straight)
   * @param {Map} valueGroups - Map of value to cards array
   */
  updateAllStraights(valueGroups) {
    // Get all values that can form straights (4-13, excluding A,2,3 which are 14,15,16)
    // uniqueValues - Array of values that can form straights
    const uniqueValues = this.getUniqueValuesOfHand(valueGroups);

    if (uniqueValues.length < 3) return;
    
    // Generate all possible consecutive sequences of length 3 or more
    for (let startIdx = 0; startIdx < uniqueValues.length; startIdx++) {
      for (let endIdx = startIdx + 2; endIdx < uniqueValues.length; endIdx++) {
        
        //Generate straight combinations only when it's sequential
        if (uniqueValues[endIdx] - uniqueValues[startIdx] === endIdx - startIdx) {

          const sequence = uniqueValues.slice(startIdx, endIdx + 1);
          this.generateOptimizedStraightCombinations(sequence, valueGroups);

        }
      }
    }

    return;
  }

  /**
   * Gets valid straight values from player's hand (values 4-13 only)
   * @param {Map} valueGroups - Map of value to cards array
   * @return {Array} uniqueValues - Array of values that can form straights
   */
  getUniqueValuesOfHand(valueGroups) {
    const uniqueValues = [];
    for (let value = 4; value <= 13; value++) {
      if (valueGroups.has(value)) {
        uniqueValues.push(value);
      }
    }
    return uniqueValues;
  }

  /**
   * Generates optimized straight combinations (one per type/value/size combination)
   * @param {Array} values - Find all types of straights of these value sequence
   * @param {Map} valueGroups - Map of value to cards array
   */
  generateOptimizedStraightCombinations(values, valueGroups) {
    // Determine possible straight types based on minimum cards available for each value
    // e.g. maxRepeats = 2, only straight and straight pair is possible.
    const maxRepeats = Math.min(...values.map(value => valueGroups.get(value).length));
    
    // Generate one combination for each possible straight type
    for (let cardCount = 1; cardCount <= maxRepeats; cardCount++) {
      const cards = [];
      for (const value of values) {
        // Take first 'cardCount' cards of each value into a card array
        // e.g. maxrepeat = 2, make a array of 456, then make a 445566
        // notice the plurals!!
        const cardsOfThisValue = valueGroups.get(value);
        for (let i = 0; i < cardCount; i++) {
          cards.push(cardsOfThisValue[i]);
        }
      }
      
      this.categorizeStraight(cards, cardCount);
    }
  }

  /**
   * Categorizes a straight combination by its type and adds to appropriate collection
   * @param {Array} cards - Array of cards forming the straight
   */
  categorizeStraight(cards, repeats) {
    const combo = new CardCombination(cards);

    if (repeats === 1) {
      combo.setType(CombType.STRAIGHT);
      combo.setValue(combo.getFirstCardValue());
      combo.setStraightSize(combo.getSize());
      this.availableCombinations.get(CombType.STRAIGHT).push(combo);

    } else if (repeats === 2) {
      combo.setType(CombType.PAIR_STRAIGHT);
      combo.setValue(combo.getFirstCardValue());
      combo.setStraightSize(combo.getSize() / 2);
      this.availableCombinations.get(CombType.PAIR_STRAIGHT).push(combo);

    } else if (repeats === 3) {
      combo.setType(CombType.TRIPLE_STRAIGHT);
      combo.setValue(combo.getFirstCardValue());
      combo.setStraightSize(combo.getSize() / 3);
      this.availableCombinations.get(CombType.TRIPLE_STRAIGHT).push(combo);

    } else if (repeats === 4) {
      combo.setType(CombType.QUAD_STRAIGHT);
      combo.setValue(combo.getFirstCardValue());
      combo.setStraightSize(combo.getSize() / 4);
      this.availableCombinations.get(CombType.QUAD_STRAIGHT).push(combo);
    }
  }

  /**
   * Counts occurrences of each card value in the given cards
   * @param {Array} cards - Array of card objects
   * @return {Map} - Map of value to count
   */
  getValueCounts(cards) {
    const counts = new Map();
    for (const card of cards) {
      const value = card.getValue();
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return counts;
  }

  // -----------   Update Available Combinations   ----------
  // -----------               ENDS                ----------


  /**
   * Prints all available combinations to console, organized by type
   */
  printAvailableCombinations() {
    console.log("=== " + this.name + "\'s Available Combinations ===");
    
    for (const [type, combinations] of this.availableCombinations) {
      if (combinations.length === 0) {
        console.log(`${type}: (none)`);
      } else {
        const combinationStrings = combinations.map(combo => combo.toRankOnlyShortString());
        console.log(`${type}: [${combinationStrings.join(', ')}]`);
      }
    }

    console.log("===============================");
  }

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
  
}