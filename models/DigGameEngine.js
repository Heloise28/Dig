/* 
set new value to A,2,3 here first


when click play cards, 
set selected comb value and type here
check selected comb valid here
update this turn's value and type




  verifySelectedCards(player) {
    selctedCards = CardCombination(player.hand.filter(card => card.isSelected === true));
    
  }

*/


import { Deck } from './Deck.js';
import { CombType } from './enums.js';
import { Player } from './Player.js';




export class DigGameEngine {

  


  /**
   * create a deck for Dig
   * 52 cards, no jokers
   * Value: 3 > 2 > A > K > Q .... > 4
  */
  static createDeckForDig() {
    let deck = Deck.create52CardDeck();
    for (let i=0; i<52; i++) {
      if (deck.cards[i].rank === 'A') {
        deck.cards[i].setCardValue(14);
      }
      if (deck.cards[i].rank === '2') {
        deck.cards[i].setCardValue(15);
      }
      if (deck.cards[i].rank === '3') {
        deck.cards[i].setCardValue(16);
      }
    }
    return deck;
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
   * because comb is passed by reference, its properties are set,
   * for next stage, reject the cards or let player play them.
   */
  static evaluateCardCombination(comb, typeOfTurn, valueToBeat) {
    comb.sortByValueAsc();  
        
    if (comb.size === 1) {
      comb.setType(CombType.SINGLE);
    
    } else if (comb.size === 2 && comb.isSameRank()) {
      comb.setType(CombType.PAIR);
    
    } else if (comb.size === 3 && comb.isSameRank()) {
      comb.setType(CombType.TRIPLE);
    
    } else if (comb.size === 4 && comb.isSameRank()) {
      comb.setType(CombType.QUAD);
    }

    //at this point it can only be straight or none.
    //no A23 in straight, so
   //value for A, 2, 3 set to 14, 15, 16 by createDeckForDig()
    if (comb.getType !== CombType.NONE && comb.getLargestCardValue() < 14) {
      if (comb.getSize() >= 3) {
        const allValues = comb.cards.map(card => card.value);
        const allUniqueValues = [...new Set(allValues)];

        if (this.isSequential(allUniqueValues)) {
          
          if (allUniqueValues.length === allValues.length) {
            comb.setType(CombType.STRAIGHT);

          } else {
            comb.setType(this.findStraightType(allValues, allUniqueValues));
          }
       }
      }
    }


    if (comb.getType() !== CombType.NONE) {
      comb.setValueToLargestValue();
      console.log('Valid Combination Type!' + comb);

      if (typeOfTurn !== CombType.NONE && valueToBeat !== 0) {
        if (comb.getType() === typeOfTurn &&  comb.getValue() > valueToBeat) {
          comb.varify(true);
          console.log('It\'s OK to play ' + comb);
        }
      } else {
        comb.varify(true);
        console.log('It\'s OK to play ' + comb);
      }

    }

    return;
  }


  //heler for evaluateCardCombination()
  static isSequential(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1] + 1) {
        return false;
      }
    }
    return true;
  }

  /**
  *heler for evaluateCardCombination()
  *check if it's  PAIR_STRAIGHT, TRIPLE_STRAIGHT QUAD_STRAIGHT
  *@param 2 number arrays, all values and all unique values
  *@return a type enum
  */
   static findStraightType(all, unique) {
    let countArr = [];
    let count = 0;
    let i = 0;
    let j = 0;
    
    while (i<all.length) {
      if (all[i] === unique[j]) {
        count++;
        i++;
      } else {
        countArr.push(count);
        count = 0;
        j++;
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

}