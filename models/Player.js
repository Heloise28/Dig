import { Deck } from './Deck.js';


export class Player {
  constructor(name, isHuman, seatNumber) {
    this.name = name;
    this.hand = new Deck();
    this.isTurn = false;
    this.isHuman = isHuman;
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

  //returns a deck
  getHand() {
    return this.hand;
  }

  //returns an integer
  getHandSize() {    
    return this.hand.size();
  }

  clearHand() {
    this.hand.clear();
  }

  //Abstract method
  playSelectedCards() {

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