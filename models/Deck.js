// Deck.js - Manages a collection of playing cards
// Rules applied: debug logs & comments, modular design, i18n consistency

import { Card } from './Card.js';
import { Suit } from './enums.js';

/**
 * Deck class representing a collection of playing cards
 */
export class Deck {
  constructor() {
    this.cards = [];
    
    // Sound effect placeholders for future implementation
    this.soundEffects = {
      shuffle: null,
      deal: null,
      addCard: null,
      reorganize: null
    };
    
    // console.log('🎴 Deck created');
  }

  /**
   * Add a single card to the deck
   * @param {Card} card - Card to add
   */
  addCard(card) {
    if (!(card instanceof Card)) {
      throw new Error('Invalid card');
    }
    
    this.cards.push(card);
    this.playSoundEffect('addCard');
    
    //console.log(`➕ Added card: ${card.toString()}`);
    return this;
  }

  /**
   * Add multiple cards to the deck
   * @param {Card[]} cards - Array of cards to add
   */
  addCards(cards) {
    if (!Array.isArray(cards)) {
      throw new Error('Cards must be an array');
    }
    
    cards.forEach(card => {
      if (!(card instanceof Card)) {
        throw new Error('Invalid card in array');
      }
    });
    
    this.cards.push(...cards);
    this.playSoundEffect('addCard');
    
    //console.log(`➕ Added ${cards.length} cards to deck`);
    return this;
  }

  /**
   * @return array of selected cards
   */
  getSelectedCards() {
    // Find all selected cards
    const selectedCards = this.cards.filter(card => card.isSelected);
    
    if (selectedCards.length === 0) {
      console.log('No selected cards (Message from Deck Class)');
      return [];
    }

    return selectedCards;
  }

  /**
   * Deal a specific card from the deck
   * Card to deal must have same reference -> the one specific card
   * @param {Card} card - Specific card to deal
   * @returns {Card|null} The dealt card or null if not found
   */
  dealSpecificCard(card) {
    if (!(card instanceof Card)) {
      throw new Error('Invalid card');
    }
    
    const index = this.cards.findIndex(c => c.equalReferenceWith(card));
    if (index === -1) {
      console.warn('Card not found in deck');
      return null;
    }
    
    const dealtCard = this.cards.splice(index, 1)[0];
    
    
    console.log(`🎴 Dealt specific card: ${dealtCard.toString()}`);
    return dealtCard;
  }

  /**
   * Deal multiple specific cards from the deck
   * @param {Card[]} cards - Array of specific cards to deal
   * @returns {Card[]} Array of dealt cards (may be shorter than requested if some cards not found)
   */
  dealSpecificCards(cards) {
    if (!Array.isArray(cards)) {
      throw new Error('Cards must be an array');
    }
    
    const dealtCards = [];
    cards.forEach(card => {
      const dealtCard = this.dealSpecificCard(card);
      if (dealtCard) {
        dealtCards.push(dealtCard);
      }
    });
    
    this.playSoundEffect('deal');

    console.log(`🎴 Dealt ${dealtCards.length} specific cards`);
    return dealtCards;
  }

  /**
   * Deal all selected cards from the deck
   * @returns {Card[]} Array of dealt selected cards (empty array if none selected)
   */
  dealSelectedCards() {
    // Find all selected cards
    const selectedCards = this.cards.filter(card => card.isSelected);
    
    if (selectedCards.length === 0) {
      console.log('No selected cards to deal');
      return [];
    }
    
    // Remove selected cards from deck (iterate backwards to avoid index issues)
    for (let i = this.cards.length - 1; i >= 0; i--) {
      if (this.cards[i].isSelected) {
        this.cards.splice(i, 1);
      }
    }
    
    console.log(`🎴 Dealt ${selectedCards.length} selected card(s): ${selectedCards.map(card => card.toShortString()).join(', ')}`);
    return selectedCards;
  }

   /**
   * Remove all selected cards from the deck
   * @returns {Card[]} Array of dealt selected cards (empty array if none selected)
   */
  removeSelectedCards() {
    // Find all selected cards
    const selectedCards = this.cards.filter(card => card.isSelected);
    
    if (selectedCards.length === 0) {
      console.log('No selected cards to remove');
    }
    
    // Remove selected cards from deck (iterate backwards to avoid index issues)
    for (let i = this.cards.length - 1; i >= 0; i--) {
      if (this.cards[i].isSelected) {
        this.cards.splice(i, 1);
      }
    }
    
    // console.log(`🎴 Removed ${selectedCards.length} selected card(s): ${selectedCards.map(card => card.toShortString()).join(', ')}`);
  }

  /**
   * Deal a random card from the deck
   * @returns {Card|null} Random card or null if deck is empty
   */
  dealRandomCard() {
    if (this.isEmpty()) {
      console.warn('Deck is empty');
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * this.cards.length);
    const dealtCard = this.cards.splice(randomIndex, 1)[0];
    this.playSoundEffect('deal');
    
    console.log(`🎲 Dealt random card: ${dealtCard.toString()}`);
    return dealtCard;
  }

  /**
   * Deal multiple random cards from the deck
   * @param {number} count - Number of random cards to deal
   * @returns {Card[]} Array of dealt cards
   */
  dealRandomCards(count) {
    if (typeof count !== 'number' || count < 0) {
      throw new Error('Count must be a non-negative number');
    }
    
    const dealtCards = [];
    const actualCount = Math.min(count, this.cards.length);
    
    for (let i = 0; i < actualCount; i++) {
      const card = this.dealRandomCard();
      if (card) {
        dealtCards.push(card);
      }
    }
    
    console.log(`🎲 Dealt ${dealtCards.length} random cards`);
    return dealtCards;
  }

  /**
   * Deal a card from the top of the deck
   * @returns {Card|null} Top card or null if deck is empty
   */
  dealTopCard() {
    if (this.isEmpty()) {
      console.warn('Deck is empty');
      return null;
    }
    
    const dealtCard = this.cards.shift();
    this.playSoundEffect('deal');
    
    //console.log(`⬆️ Dealt top card: ${dealtCard.toString()}`);
    return dealtCard;
  }

  /**
   * Deal multiple cards from the top of the deck
   * @param {number} count - Number of cards to deal
   * @returns {Card[]} Array of dealt cards
   */
  dealTopCards(count) {
    if (typeof count !== 'number' || count < 0) {
      throw new Error('Count must be a non-negative number');
    }
    
    const dealtCards = [];
    const actualCount = Math.min(count, this.cards.length);
    
    for (let i = 0; i < actualCount; i++) {
      const card = this.dealTopCard();
      if (card) {
        dealtCards.push(card);
      }
    }
    
    console.log(`⬆️ Dealt ${dealtCards.length} cards from top`);
    return dealtCards;
  }

  /**
   * Shuffle the deck
   */
  shuffle() {
    console.log('🔀 Shuffling deck...');
    
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    
    this.playSoundEffect('shuffle');
    console.log('✅ Deck shuffled');
    
    return this;
  }

  /**
   * Reorganize deck according to rules (placeholder for future implementation)
   * @param {Object} rules - Reorganization rules
   */
  reorganize(rules = {}) {
    console.log('🔄 Reorganizing deck...');
    
    // Placeholder for reorganization logic
    // This will be implemented when the Rules class is created
    
    this.playSoundEffect('reorganize');
    console.log('✅ Deck reorganized');
    
    return this;
  }

  sortByValueAsc() {
    this.cards.sort((a, b) => a.value - b.value);
  } 

  sortByValueDesc() {
    this.cards.sort((a, b) => b.value - a.value);
  }

  /**
   * Peek at the top card without removing it
   * @returns {Card|null} Top card or null if deck is empty
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.cards[0];
  }

  /**
   * Peek at a specific card by index
   * @param {number} index - Index of card to peek at
   * @returns {Card|null} Card at index or null if invalid
   */
  peekAt(index) {
    if (typeof index !== 'number' || index < 0 || index >= this.cards.length) {
      console.warn('Invalid card index');
      return null;
    }
    return this.cards[index];
  }

  /**
   * Check if deck is empty
   * @returns {boolean} True if deck has no cards
   */
  isEmpty() {
    return this.cards.length === 0;
  }

  /**
   * Get the number of cards in the deck
   * @returns {number} Number of cards
   */
  size() {
    return this.cards.length;
  }

  /**
   * Clear all cards from the deck
   */
  clear() {
    this.cards = [];
    console.log('🗑️ Deck cleared');
    return this;
  }

  /**
   * Get all cards in the deck
   * @returns {Card[]} Array of all cards
   */
  getCards() {
    return this.cards;
  }

  /**
   * Build a array of cards of each value from this deck 
   * @param {Array<Number>} values
   * @return {Array<Card>} Found cards of this value
   */
  getCardsByValue(values) {
    const foundCards = [];
    const tempValues = values.slice();
    this.cards.forEach((card) => {
      
      if (tempValues.includes(card.getValue())) {
        foundCards.push(card);
        const i = tempValues.indexOf(card.getValue());

        if (i > -1) { // only splice array when item is found
          tempValues.splice(i, 1); // 2nd parameter means remove one item only
        }
      }

    });

    return foundCards;
  }

  /**
   * Find a card in the deck
   * Find means same reference -> the one specific card
   * @param {Card} card - Card to find
   * @returns {number} Index of card or -1 if not found
   */
  findIndexOfCard(card) {
    if (!(card instanceof Card)) {
      return -1;
    }
    return this.cards.findIndex(c => c.equalReferenceWith(card));
  }

  /**
   * Find a certain unselected card in the deck
   * Unlike findIndexOfCard(), this is find by rank and suit, not reference.
   * So it finds you an unselected card of the rank and suit you want.
   * @param {Card} card - Card to find
   * @returns {number} Index of card or -1 if not found
   */
  findIndexOfCardUnselected(card) {
    if (!(card instanceof Card)) {
      return -1;
    }
    return this.cards.findIndex(c => c.equalRandAndSuitWith(card) && !c.isSelected);
  }

  //for testing in console
  selectCardByNotation(notation) {
  // Handle empty or invalid input
    if (!notation || typeof notation !== 'string') {
      console.log('find card:  Invalid input');
      return;
    }
    
    const input = notation.trim().toLowerCase();
    
    if (input === '') {
      console.log('find card:  Invalid input');
      return;
    }
    
    let targetRank, targetSuit;
    
    // Handle jokers
    if (input === 'j') {
      targetRank = 'Black';
      targetSuit = Suit.JOKER;
    } else if (input === 'J') {
      targetRank = 'Red';
      targetSuit = Suit.JOKER;
    } else if (input.length >= 2) {
      // Parse rank and suit for regular cards
      const rank = input.slice(0, -1);
      const suitChar = input.slice(-1);
      
      // Map rank notation to actual rank
      const rankMap = {
        'a': 'A',
        '2': '2', 
        '3': '3', 
        '4': '4', 
        '5': '5',
        '6': '6', 
        '7': '7', 
        '8': '8', 
        '9': '9',
        '10': '10',
        'j': 'J',
        'q': 'Q',
        'k': 'K'
      };
      
      // Map suit notation to actual suit
      const suitMap = {
        'h': Suit.HEARTS,
        'd': Suit.DIAMONDS,
        'c': Suit.CLUBS,
        's': Suit.SPADES
      };
      
      targetRank = rankMap[rank];
      targetSuit = suitMap[suitChar];
      
      if (!targetRank || !targetSuit) {
        console.log('find card:  Invalid input');
        return;
      }

    } else {
      console.log('find card: Invalid input');
      return;
    }
      
    // Find the card in the deck
    const targetCard = new Card(targetRank, targetSuit, true);
    const cardIndex = this.findIndexOfCardUnselected(targetCard);
    
    if (cardIndex !== -1) {
      this.cards[cardIndex].selectCard();
      console.log(`Selected: ${this.cards[cardIndex].toShortString()}`);
    } else {
      console.log('find card: card not found or already selected');
    }
  }


  /**
   * Check if deck contains a specific card
   * @param {Card} card - Card to check for
   * @returns {boolean} True if card is in deck
   */
  contains(card) {
    return this.findIndexOfCard(card) !== -1;
  }

  /**
 * Counts the number of cards in the deck with a specific rank
 * @param {string} rank - Rank to count
 * @returns {number} Number of cards with the specified rank
 */
  countCardsByRank(rank) {
    return this.cards.filter(card => card.rank === rank).length;
  }

    /**
   * Counts the number of cards in the deck with a specific suit
   * @param {string} suit - Suit to count
   * @returns {number} Number of cards with the specified suit
   */
  countCardsBySuit(suit) {
    return this.cards.filter(card => card.suit === suit).length;
  }

  /**
   * Remove all jokers from the deck
   * @returns {Card[]} Array of removed joker cards
   */
  removeJokers() {
    const jokers = [];
    this.cards = this.cards.filter(card => {
      if (card.rank === 'Red' || card.rank === 'Black') {
        jokers.push(card);
        return false;
      }
      return true;
    });
    
    console.log(`🃏 Removed ${jokers.length} jokers from deck`);
    return jokers;
  }

  /**
   * Remove cards by rank
   * @param {string|string[]} ranks - Rank(s) to remove
   * @returns {Card[]} Array of removed cards
   */
  removeCardsByRank(ranks) {
    const ranksToRemove = Array.isArray(ranks) ? ranks : [ranks];
    const removedCards = [];
    
    this.cards = this.cards.filter(card => {
      if (ranksToRemove.includes(card.rank)) {
        removedCards.push(card);
        return false;
      }
      return true;
    });
    
    console.log(`🗑️ Removed ${removedCards.length} cards with rank(s): ${ranksToRemove.join(', ')}`);
    return removedCards;
  }

  /**
   * Remove cards by suit
   * @param {string|string[]} suits - Suit(s) to remove
   * @returns {Card[]} Array of removed cards
   */
  removeCardsBySuit(suits) {
    const suitsToRemove = Array.isArray(suits) ? suits : [suits];
    const removedCards = [];
    
    this.cards = this.cards.filter(card => {
      if (suitsToRemove.includes(card.suit)) {
        removedCards.push(card);
        return false;
      }
      return true;
    });
    
    console.log(`🗑️ Removed ${removedCards.length} cards with suit(s): ${suitsToRemove.join(', ')}`);
    return removedCards;
  }

  /**
   * Filter cards by a custom function
   * @param {function} filterFn - Function that returns true for cards to keep
   * @returns {Card[]} Array of removed cards
   */
  filterCards(filterFn) {
    const removedCards = [];
    
    this.cards = this.cards.filter(card => {
      if (filterFn(card)) {
        return true;
      } else {
        removedCards.push(card);
        return false;
      }
    });
    
    console.log(`🔍 Filtered deck: removed ${removedCards.length} cards`);
    return removedCards;
  }

  flipDeck() {
    for (let i=0; i<this.cards.length; i++) {
      this.cards[i].flip();
    }
    console.log(`🔄 Deck flipped. Face up: ${this.cards[0].isFaceUp}`);

    return this;
  }

  deselectDeck() {
    // Deselected cards from deck (iterate backwards to avoid index issues)
    for (let i = this.cards.length - 1; i >= 0; i--) {
      if (this.cards[i].isSelected) {
        this.cards[i].deselectCard();
      }
    }

  }

  /**
   * Placeholder for sound effect playback
   * @param {string} effectType - Type of sound effect
   */
  playSoundEffect(effectType) {
    // Placeholder for future sound implementation
    if (this.soundEffects[effectType]) {
      // this.soundEffects[effectType].play();
      console.log(`🔊 Playing ${effectType} sound for deck`);
    }
  }

  /**
   * Set sound effect for this deck
   * @param {string} effectType - Type of sound effect
   * @param {Audio} audio - Audio object
   */
  setSoundEffect(effectType, audio) {
    if (this.soundEffects.hasOwnProperty(effectType)) {
      this.soundEffects[effectType] = audio;
    }
  }

  /**
   * Create a standard 54-card deck (52 cards + 2 jokers)
   * @returns {Deck} New deck with all 54 cards
   */
  static createStandardDeck() {
    console.log('🎴 Creating standard 54-card deck...');
    
    const deck = new Deck();
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
    
    // Add standard 52 cards
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.addCard(new Card(rank, suit, false));
      });
    });
    
    // Add 2 jokers (Red and Black)
    deck.addCard(new Card('Black', Suit.JOKER, false));
    deck.addCard(new Card('Red', Suit.JOKER, false));
    
    console.log(`✅ Standard deck created with ${deck.size()} cards (52 regular + 2 jokers)`);
    return deck;
  }

  /**
   * Create a 52-card deck without jokers
   * @returns {Deck} New deck with 52 cards (no jokers)
   */
  static create52CardDeck() {
    console.log('🎴 Creating 52-card deck (no jokers)...');
    
    const deck = new Deck();
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.addCard(new Card(rank, suit, false));
      });
    });
    
    console.log(`✅ 52-card deck created with ${deck.size()} cards`);
    return deck;
  }

  /**
   * Get string representation of the deck
   */
  toString() {
    if (this.isEmpty()) {
      return 'Empty deck';
    }
    return `Deck with ${this.size()} cards`;
  }
}
