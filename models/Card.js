// Card.js - Represents a single playing card
// Rules applied: debug logs & comments, modular design, i18n consistency

/**
 * Card class representing a playing card
 */

import { Suit } from './enums.js';


export class Card {
  //ranks are strings A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, Black, Red
  //rank is string, suit is enum Suit
  //Black is little joker, Red is big joker
  constructor(rank, suit, isFaceUp) {
    
    // Validate rank
    const validRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'Black', 'Red'];
    if (!rank || typeof rank !== 'string' || !validRanks.includes(rank)) {
      throw new Error(`Invalid rank: ${rank}. Must be one of: ${validRanks.join(', ')}`);
    }
    
    // Validate suit
    if (!suit || !Suit.isValid(suit)) {
      throw new Error(`Invalid suit: ${suit}.`);
    }
    
    // Special validation for jokers
    if (suit === Suit.JOKER) {
      if (rank !== 'Black' && rank !== 'Red') {
        throw new Error(`Invalid joker rank: ${rank}. Jokers must have rank 'Black' or 'Red'`);
      }
    } else if (rank === 'Black' || rank === 'Red') {
      throw new Error(`Invalid combination: ${rank} rank can only be used with Joker suit`);
    }
    
    // Validate suit restrictions
    if (suit === Suit.MIXED || suit === Suit.NONE) {
      throw new Error('Invalid suit for a single card: MIXED and NONE are not allowed');
    }
    
    // Validate isFaceUp
    if (typeof isFaceUp !== 'boolean') {
      throw new Error(`Invalid isFaceUp value: ${isFaceUp}. Must be true or false`);
    }
    
    // All validations passed, set properties
    this.rank = rank;
    this.suit = suit;

    this.isFaceUp = isFaceUp;
    this.value = this.calculateValue();
    this.isSelected = false;
    
    // Sound effect placeholders for future implementation
    this.soundEffects = {
      flip: null,
      deal: null,
      play: null
    };
    
    /*
    if (suit === Suit.JOKER) {
      console.log(`🃏 Card created: ${this.rank} ${this.suit} (Value: ${this.value})`);
    } else {
      console.log(`🃏 Card created: ${this.rank} of ${this.suit} (Value: ${this.value})`);
    }
    */
  }

  getRank() {
    return this.rank;
  }

  getSuit() {
    return this.suit;
  }

  getValue() {
    return this.value;
  }

  get isSelected() {
    return this.isSelected;
  }


  /**
   * Calculate standard numerical value for cards
   * Standard values: A=1, 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, Joker=14
   */
  calculateValue() {
    // Handle jokers first
    if (this.rank === 'Black') {
      return 14;
    } else if (this.rank === 'Red') {
      return 15;
    }
    
    const rankValues = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13
    };
    
    if (!(this.rank in rankValues)) {
      throw new Error(`Invalid card rank: ${this.rank}`);
    }
    
    return rankValues[this.rank];
  }

  /**
   * Set a new rank for the card and recalculate its numerical value
   * arbitrary range -1000 to 1000
   * @param {string} newRank - New rank for the card
  * @throws Will throw an error if the new rank is invalid 
  */
  setValue(newValue) {
    if (typeof newValue !== 'number' || newValue < -1000 || newValue > 1000) {
      throw new Error('Card value must be a number between -1000 and 1000');
    }
    this.value = newValue;
    //console.log(`🔢 Card ${this.toShortString()} value set to ${this.value}`);
    return this;
  }

  /**
   * Flip the card (face up to face down or vice versa)
   */
  flip() {
    this.isFaceUp = !this.isFaceUp;
    
    // Placeholder for flip sound effect
    //this.playSoundEffect('flip');
    
    //console.log(`🔄 Card ${this.toString()} flipped. Face up: ${this.isFaceUp}`);
    return this;
  }

  /**
   * Set card to face up
   */
  show() {
    if (!this.isFaceUp) {
      this.isFaceUp = true;
      this.playSoundEffect('flip');
      console.log(`👁️ Card ${this.toString()} revealed`);
    }
    return this;
  }

  /**
   * Set card to face down
   */
  hide() {
    if (this.isFaceUp) {
      this.isFaceUp = false;
      this.playSoundEffect('flip');
      console.log(`🙈 Card ${this.toString()} hidden`);
    }
    return this;
  }

  faceIsUp() {
    return this.isFaceUp;
  }

  selectCard() {
    this.isSelected = true;
  }

  deselectCard() {
    this.isSelected = false;
  }

  isSelected() {
    return this.isSelected;
  }


  /**
   * Get card display string
   */
  toString() {
    if (!this.isFaceUp) {
      return 'face down';
    }
    
    // Handle jokers specially
    if (this.rank === 'Black') {
      return `${this.rank} Joker`;
    } else if (this.rank === 'Red') {
      return `${this.rank} Joker`;
    }

    return `${this.rank} of ${this.suit}`;
  }

  /**
   * Get card short representation
   */
  toShortString() {
    if (!this.isFaceUp) {
      return '🂠'; // Card back unicode
    }
    
    // Handle jokers specially
    if (this.rank === 'Black') {
      return `j`;
    } else if (this.rank === 'Red') {
      return `J`;
    }
    
    return `${this.rank}${this.suit.charAt(0).toUpperCase()}`;
  }

  toRankOnlyShortString() {
    if (!this.isFaceUp) {
      return '🂠'; // Card back unicode
    }
    
    // Handle jokers specially
    if (this.rank === 'Black') {
      return `j`;
    } else if (this.rank === 'Red') {
      return `J`;
    }
    
    return `${this.rank}`;
  }

  /**
   * Compare this card with another card
   * @param {Card} otherCard - Card to compare with
   * @returns {number} -1 if this card is lower, 0 if equal, 1 if higher
   */
  compareTo(otherCard) {
    if (!(otherCard instanceof Card)) {
      throw new Error('Invalid card for comparison');
    }
    
    if (this.numericalValue < otherCard.numericalValue) return -1;
    if (this.numericalValue > otherCard.numericalValue) return 1;
    return 0;
  }

  /**
   * Check if this card and another card has same rank and suit
   * @param {Card} otherCard - Card to compare with
   * @returns {boolean} True if cards are equal
   */
  equalRandAndSuitWith(otherCard) {
    if (!(otherCard instanceof Card)) return false;
    return this.rank === otherCard.rank && this.suit === otherCard.suit;
  }

  /**
   * Check if this card and another card are same reference
   * @param {Card} otherCard - Card to compare with
   * @returns {boolean} True if cards are equal
   */  
  equalReferenceWith(other) {
    return this === other;
  }

  /**
   * Placeholder for sound effect playback
   * @param {string} effectType - Type of sound effect ('flip', 'deal', 'play')
   */
  playSoundEffect(effectType) {
    // Placeholder for future sound implementation
    if (this.soundEffects[effectType]) {
      // this.soundEffects[effectType].play();
      console.log(`🔊 Playing ${effectType} sound for card ${this.toString()}`);
    }
  }

  /**
   * Set sound effect for this card
   * @param {string} effectType - Type of sound effect
   * @param {Audio} audio - Audio object
   */
  setSoundEffect(effectType, audio) {
    if (this.soundEffects.hasOwnProperty(effectType)) {
      this.soundEffects[effectType] = audio;
    }
  }

  /**
   * Get card image path based on rank and suit
   */
  getImagePath() {
    if (!this.isFaceUp) {
      return '/assets/cards/standard-deck/back.png';
    }
    
    // Handle jokers specially
    if (this.rank === 'Joker' || this.rank === 'JOKER') {
      return `/assets/cards/standard-deck/${this.suit}_joker.png`;
    }
    
    const rankMap = {
      'A': '1', 'J': '11', 'Q': '12', 'K': '13'
    };
    
    const suitMap = {
      /*
      The problem is that you are using an object key 
      without quotes or brackets, which is invalid 
      syntax in JavaScript unless Suit.SPADES is a 
      variable; you should use computed property 
      syntax for Suit.SPADES.
      */
      [Suit.SPADES]: 'spades',
      [Suit.HEARTS]: 'hearts', 
      [Suit.DIAMONDS]: 'diamonds',
      [Suit.CLUBS]: 'clubs',
      [Suit.JOKER]: 'joker' // Just in case
    };
    
    const rank = rankMap[this.rank] || this.rank;
    const suit = suitMap[this.suit];
    
    return `/assets/cards/standard-deck/${rank}_of_${suit}.png`;
  }
}
