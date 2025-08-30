import { CardCombination } from './CardCombination.js';
import { Deck } from './Deck.js';
import { CombType, Suit } from './enums.js';




/**
 * Key difference of game flow between human and AI sub class
 * Human select cards first, then program make a CardCombination
 * of selected cards, send it to evaluation and verification
 * then let huamn play them or reject
 * 
 * But AI first turn it's own cards and 
 * (to be implemented in the future) history of played cards 
 * in to data strutures of card value numbers.
 * Then compute, get a number array of the values to play;
 * Then pick out a CardCombination of these values from AI's hand;
 * Then mark them selected, and send them to game engine
 * (Can skip evaluation and verification)
 * 
 */
export class DigPlayer {
  constructor(name, isHuman, seatNumber) {
    this.name = name;
    this.hand = new Deck();
    this.isTurn = false;
    this.isHuman = isHuman;
    this.seatNumber = seatNumber;
    this.countOfEachValue = new Map();
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

  getCountOfEachValue() {
    return this.countOfEachValue;
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
    console.log(`After remove ${this.name}'s situation is: ${this}`);
  }

  updateHandAnalysis() {      
    //update value counts first
    this.countOfEachValue = this.updateValueCounts();

    //clear all available combs
    this.AIEngine.clearAvailableCombs();

    if (!this.isHuman) {
      if (this.level === 1) {
        this.AIEngine.updateSafeCombs(this);
      }
    }
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
  updateValueCounts() {
    const cards = this.hand.getCards();
    const counts = new Map();
    for (const card of cards) {
      const value = card.getValue();
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return counts;
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