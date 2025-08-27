/* 

when click play cards, 
set selected comb value and type here
check selected comb valid here
update this turn's value and type



*/

import { Deck } from './Deck.js';
import { Card } from './Card.js';
import { CombType } from './enums.js';
import { CardCombination } from './CardCombination.js';
import { DigRoundState } from '../models/DigRoundState.js';

export class DigGameEngine {

  


  /**
   * create a deck for Dig
   * 52 cards, no jokers
   * Value: 3 > 2 > A > K > Q .... > 4
  */
  static createDeckForDig() {
    const deck = Deck.create52CardDeck();
    this.raiseBigCardsValue(deck);
    return deck;
  }

  /**
   * Raise A, 2, 3 value to 14, 15, 16
   * Helps to build a deck for Dig
   */
  static raiseBigCardsValue(deck) {
    for (let i=0; i<deck.getCards().length; i++) {
      if (deck.getCards()[i].getRank() === 'A') {
        deck.getCards()[i].setValue(14);
      }
      if (deck.getCards()[i].getRank() === '2') {
        deck.getCards()[i].setValue(15);
      }
      if (deck.getCards()[i].getRank() === '3') {
        deck.getCards()[i].setValue(16);
      }
    }
  }

  //call these two after evaluating a comb
  static updateTypeOfTurn(comb, typeOfTurn) {
    return comb.getType();
  }

  static updateValueToBeat(comb, valueToBeat) {
    return comb.getValue();
  } 



  /**
   * Static function to evaluate a card combination and set its properties
   * @param {CardCombination} comb - The card combination to evaluate
   * @param {DigRoundState} state
   * because comb is passed by reference, its properties are set,
   * for next stage, reject the cards or let player play them.
   */
  static evaluateCardCombination(comb, state) {

    const typeOfTurn = state.getType();
    const valueToBeat = state.getValue();
    const straightSizeOfTurn = state.getStraightSize();

    const size = comb.getSize();
    const cardValues = comb.getCards().map((c) => c.getValue());

    if (size === 0) {
      console.log('No card selected! (from DigGameEngine)');
      return;
    }

    comb.setType(this.determineType(size, cardValues));
    comb.setStraightSize(this.determineStraightSize(size, comb.getType()));


    //if matches a comb type
    if (comb.getType() !== CombType.NONE) {
      //give it a value
      comb.setValueToLargestValue();
      console.log('Selected cards match a combination type! ' + comb);

      if (this.isCombOkToPlay(comb, typeOfTurn, valueToBeat, straightSizeOfTurn)) {
        comb.verify(true);
        return;

      }
    
    } else {

      console.log('Selected cards does NOT match a combination type! ' + comb);
    }

    return;
  }

  /**
   * helper for evaluateCardCombination()
   * @param {CardCombination} comb - The card combination to evaluate
   * @param {CombType} typeOfTurn
   * @param {Number} valueToBeat
   * @param {Number} straightSizeOfTurn
   * @return {boolean} is the comb ok to play? 
   */
  static isCombOkToPlay(comb, typeOfTurn, valueToBeat, straightSizeOfTurn) {
    //if there's NO type to follow or a value to beat, OK to play.
    if (typeOfTurn === CombType.NONE && valueToBeat === 0) {
      console.log('It\'s OK to play these cards!');
      return true;
    }

    //if doesn't meet required type of this turn, and doesn't beats last player's value
    //Not Ok to play
    if (comb.getType() !== typeOfTurn || comb.getValue() <= valueToBeat) {
      console.log('Wrong type or too small value!');
      return false;
    }

    //if it's a straight
    if (straightSizeOfTurn !== 0) {

      //if straight size don't match, NOT OK to play
      if (straightSizeOfTurn !== comb.getStraightSize()) {
        console.log('It\'s straight but size don\'t match!');
        return false;
      }
    
    }

    console.log('It\'s OK to play these cards!');
    return true;
  }

  /**
   * helper for evaluateCardCombination()
   * @param: number size, CombType
   * @return: a number
   */
  static determineStraightSize(size, type) {
    if (type === CombType.STRAIGHT) {
      return size;
    }
    if (type === CombType.PAIR_STRAIGHT) {
      return size / 2;
    }
    if (type === CombType.TRIPLE_STRAIGHT) {
      return size / 3;
    }
    if (type === CombType.QUAD_STRAIGHT) {
      return size / 4;
    }
    return 0;
  }


  /**
   * helper for evaluateCardCombination()
   * @param int size, int array cardValues
   * @return a CombType
   */
  static determineType(size, cardValues) {
    
    if (cardValues[0] === cardValues[size - 1]) {
      return this.findPTQType(size, cardValues);
    }

    if (cardValues[size - 1] < 14 && size > 2) {
      return this.findStraightType(size, cardValues)
    }

    return CombType.NONE;    
  }

  /**
   * Helper for determineType()
   * @TODO can it be more optimized?
   * @param int size, int array cardValues
   * @return a CombType
   */
  static findStraightType(size, cardValues) {
    let repeatCount = 1;
    let firstRepeatCount = 1;
    let difference;

    for (let i = 1; i < size; i ++) {        
      difference = cardValues[i] - cardValues[i-1];

      if (difference > 1) return CombType.NONE;


      if (difference === 0) {
        repeatCount ++;

        if (cardValues[i] === cardValues[0]) {
          firstRepeatCount ++;
        }
      }

      if (difference === 1) {

        if (repeatCount !== firstRepeatCount) {
          return CombType.NONE;
        }

        repeatCount = 1;
      }

      if (i === size - 1) {
        if (repeatCount !== firstRepeatCount) {
          return CombType.NONE;
        }
      }
    }

    if (firstRepeatCount === 1) {
      return CombType.STRAIGHT;
    }
    if (firstRepeatCount === 2) {
      return CombType.PAIR_STRAIGHT;
    }
    if (firstRepeatCount === 3) {
      return CombType.TRIPLE_STRAIGHT;
    }
    if (firstRepeatCount === 4) {
      return CombType.QUAD_STRAIGHT;
    }

    return CombType.NONE;
  }

  /**
   * Helper for determineType()
   * P: Pair, T: Triple, Q: Quad
   * @param int size, int array cardValues
   * @return a CombType
   */
  static findPTQType(size, cardValues) {
    if (size === 1) {
      return CombType.SINGLE;
    }
    if (size === 2) {
      return CombType.PAIR;
    }
    if (size === 3) {
      return CombType.TRIPLE;
    }
    if (size === 4) {
      return CombType.QUAD;      
    }

    return CombType.NONE;
  }



  
  /**
  *helper for evaluateCardCombination()
  *check if it's  PAIR_STRAIGHT, TRIPLE_STRAIGHT QUAD_STRAIGHT
  *@param 2 number arrays, all values and all unique values
  *@return a type enum
  */
 //**NOT EFFICIENT ENOUOGH** 
 /*
   static findStraightType(all, unique) {
    let countArr = [];
    let count = 0;
    let i = 0;
    let j = 0;
    
    while (i<all.length) {
      if (all[i] === unique[j]) {
        count ++;
        i ++;
      } else {
        countArr.push(count);
        count = 0;
        j ++;
      }
    }
    countArr.push(count);

    let countSet = new Set(countArr);
    if (countSet.size !== 1) {
      return CombType.NONE;
    } else {
      const repeat = [...countSet][0];

      if (repeat === 2) {
        return CombType.PAIR_STRAIGHT;
      }
      if (repeat === 3) {
        return CombType.TRIPLE_STRAIGHT;
      }
      if (repeat === 4) {
        return CombType.QUAD_STRAIGHT;
      }
    }
  }
  */

}