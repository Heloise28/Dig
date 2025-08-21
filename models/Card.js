// Card.js - Represents a single playing card
// Rules applied: debug logs & comments, modular design, i18n consistency

/**
 * Card class representing a playing card
 */
export class Card {
  constructor(rank, suit) {
    //ranks are strings A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, Joker
    //suits are strings spades, hearts, diamonds, clubs
    this.rank = rank;
    this.suit = suit;
    this.isFaceUp = false;
    this.numericalValue = this.calculateNumericalValue();
    
    // Sound effect placeholders for future implementation
    this.soundEffects = {
      flip: null,
      deal: null,
      play: null
    };
    
    console.log(`🃏 Card created: ${this.rank} of ${this.suit} (Value: ${this.numericalValue})`);
  }

  /**
   * Calculate standard numerical value for cards
   * Standard values: A=1, 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, Joker=14
   */
  calculateNumericalValue() {
    // Handle jokers first
    if (this.rank === 'Joker' || this.rank === 'JOKER') {
      return 14;
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
   * Flip the card (face up to face down or vice versa)
   */
  flip() {
    this.isFaceUp = !this.isFaceUp;
    
    // Placeholder for flip sound effect
    this.playSoundEffect('flip');
    
    console.log(`🔄 Card ${this.toString()} flipped. Face up: ${this.isFaceUp}`);
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

  /**
   * Get card display string
   */
  toString() {
    if (!this.isFaceUp) {
      return 'face down';
    }
    
    // Handle jokers specially
    if (this.rank === 'Joker' || this.rank === 'JOKER') {
      return `${this.suit} Joker`;
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
    if (this.rank === 'Joker' || this.rank === 'JOKER') {
      return `${this.suit}J`;
    }
    
    return `${this.rank}${this.suit.charAt(0).toUpperCase()}`;
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
   * Check if this card equals another card
   * @param {Card} otherCard - Card to compare with
   * @returns {boolean} True if cards are equal
   */
  equals(otherCard) {
    if (!(otherCard instanceof Card)) return false;
    return this.rank === otherCard.rank && this.suit === otherCard.suit;
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
      'spades': 'spades',
      'hearts': 'hearts', 
      'diamonds': 'diamonds',
      'clubs': 'clubs'
    };
    
    const rank = rankMap[this.rank] || this.rank;
    const suit = suitMap[this.suit];
    
    return `/assets/cards/standard-deck/${rank}_of_${suit}.png`;
  }
}
