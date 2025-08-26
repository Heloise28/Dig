import { CombType, Suit } from "./enums.js";

export class DigRoundState {
  constructor() {
    this.type = CombType.NONE;
    this.value = 0;
    this.suit = Suit.NONE;
    this.isFirstRound = false;

    this.straightSize = 0;

  }

  getType() {
    return this.type;
  }

  getValue() {
    return this.value;
  }

  getSuit() {
    return this.suit;
  }

  getIsFirstRound() {
    return this.isFirstRound;
  }

  setType(newType) {
    this.type = newType;
    return;
  }

  setValue(newValue) {
    this.value = newValue;
    
    return;
  }

  setSuit(newSuit) {
    this.suit = newSuit;
    
    return;
  }

  setIsFirstRound(newBoolean) {
    this.isFirstRound = newBoolean;
  
    return;
  }

  
  getStraightSize() {
    return this.straightSize;
  }

  setStraightSize(newSize) {
    this.straightSize = newSize;    
    return;
  }



}