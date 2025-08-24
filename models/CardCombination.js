import { CombType, Suit } from './enums.js';


export class CardCombination {

  //doesn't support add cards to existing combo yet

  /**
   * @param {Array} cards - Array of Card objects
   */
  constructor(cards) {
    this.cards = cards;
    this.type = CombType.NONE;
    this.value = 0; // The value of the combination, e.g., highest card value
    this.size = cards.length;
    this.suit = Suit.NONE; 
    this.isValid = false; // Whether the combination is valid  }
  }


  
  getSize() {
    return this.cards.length;
  }

  getValue() {
    return this.value;
  }

  getType() {
    return this.type;
  }

  getSuit() {
    return this.suit;
  }

  isValidCombination() {
    return this.isValid;
  }


  setValue(newValue) {
    if (typeof newValue !== 'number' || newValue < -1000 || newValue > 1000) {
      throw new Error('Card value must be a number between -1000 and 1000');
    }
    this.value = newValue;
    return this;
  }

  setType(type) {
    if (!type || !CombType.isValid(type)) {
      throw new Error(`Invalid type: ${type}.`);
    }
    this.type = type;
  }

  setSuit(suit) {
    if (!suit || !Suit.isValid(suit)) {
      throw new Error(`Invalid suit: ${suit}.`);
    }
    this.suit = suit;
  }

  varify(validity) {
    if (typeof validity !== 'boolean') {
      throw new Error(`Invalid validity value: ${validity}. Must be true or false`);
    }
    this.isValid = validity;
  }

  getLargestCardValue() {
    if (this.cards.length === 0) {
      return 0;
    }
    return Math.max(...this.cards.map(card => card.value));
  }

  setValueToLargestValue() {
    this.value = this.getLargestCardValue();
    return;
  }
  
  /**
   * @TODO I may need a sort by rank later. for now it's ust sort by value
   */


  sortByValueAsc() {
    this.cards.sort((a, b) => a.value - b.value);
  }

  sortByValueDesc() {
    this.cards.sort((a, b) => b.value - a.value);
  }

  isSequentialValue () {
    if (this.cards.length < 2) {
      return false;
    }

    this.cards.sortByValueAsc();

    // Check if each card is exactly 1 more than the previous
    for (let i = 1; i < this.size; i++) {
      if (this.cards[i].getValue() !== this.cards[i-1].getValue() + 1) {
        return false;
      }
    }    
    return true;
  }

  isSameRank() {
    if (this.cards.length === 0) {
      return false;
    }
    
    // Get the rank of the first card
    const firstRank = this.cards[0].getRank();
    
    // Check if all cards have the same rank
    return this.cards.every(card => card.getRank() === firstRank);
  }

  isSameSuit() {
    if (this.cards.length === 0) {
      return false;
    }
    
    // Get the suit of the first card
    const firstSuit = this.cards[0].getSuit();
    
    // Check if all cards have the same suit
    return this.cards.every(card => card.getSuit() === firstSuit);
  }


  toString() {
    return `Combination: Type=${this.type}, Value=${this.value}, Cards=[${this.cards.map(card => card.toString()).join(', ')}]`;
  }

}
/**
 * 检查comb类型和calue的都放在rules里
 * 检查comb合不合法的放在rules里
 */
