
import { CardCombination } from "./CardCombination.js";
import { CombType, Suit } from "./enums.js";
import { DigRoundState } from "./DigRoundState.js";


export class DigAIEngine {

  constructor() {
    //array of values of each type
    this.singles = [];
    this.pairs = [];
    this.triples = [];
    this.quads = [];
    //straights are 2d arries.
    this.straights = [];
    this.pairStraights = [];
    this.tripleStraights = [];
    this.quadStraights = [];
  }


  /**
 * @abstract
 * The core function, implemented by each AIEngine.
 * @param { CardCombination} availableCombinations
 * @param { DigRoundState } state
 * @return {CardCombination} the card combination AI choses, don't forget to select them!
 */
  getAIcombDecision(player, state) {}











  /**
   * @TODO As you build child class of harder AI
   * You may want to move some helper/utility functions from DigEasyAI to here.
   * Like I have a findStraightBreakingValues()!!, might be useful later for complex decision.
   * also the generate sub straught and find all possible straights. I currently am not even using them.
   */

  
  /**
   * Like this is an untility function, independent from AI level
   * translate an array of card values to a CardCombination
   * @param {DigPlayer}
   * @param {Array<Number>} values that is AI player decides to play.
   * @param: And many DigRoundStates Things
   * @return {CardCombination} translate to combination of actual cards in this AI player's hand
  */
  findCombsToPlay(player, values, typeOfTurn, straightSizeOfTurn, isFirstRound, valueToBeat) {
    if (values.length <= 0) {
      console.log('You asked me to find comb of nothing.');
      return new CardCombination([]);
    }
    console.log(`I go get these cards from your hand: ${values}`);
    //foundCards is an array<Card>
    const foundCards = player.getHand().getCardsByValue(values);
    console.log('Hmm...So AI picked these cards: ' + foundCards);

    //if is first round, make sure there's a ♥ and just one above valueToBeat;
    if (isFirstRound) {
      console.log('Is first round! Gonna need a ' + (valueToBeat + 1) + ' of HEART!');
      let hasTargetHeart = false;
      //Check if target ♥ exist
      for (const card of foundCards) {
          if (card.getValue() === valueToBeat + 1 && card.getSuit() === Suit.HEARTS) {
              hasTargetHeart = true;
              console.log('Picked ' + card.getValue() + ' of ' + card.getSuit() + ' on the first try!');
          }
      }

      // If target ♥ doesn't exist, swap a card with the same value for it
      if (!hasTargetHeart) {
        console.log('No...Gonna swap in a HEART.');
        const foundTargetHeart = [];
        for (let i = 0; i < foundCards.length && !hasTargetHeart; i++) {
          if (foundCards[i].getValue = valueToBeat + 1) {
            console.log('Swap in a HEART...found target value!');
            foundTargetHeart.push(player.getHand().getCards().filter((card) => 
              card.getValue === valueToBeat + 1 && card.getSuit() === Suit.HEARTS));
          }
          if (foundTargetHeart.length > 0) {
            console.log('Swap in a HEART...found target value AND HEART');
            foundCards[i] = foundTargetHeart[0];
            hasTargetHeart = true;
          }
        }
        console.log('Break out of swap HEART. Did I found it? ' + hasTargetHeart);
      }
    }

    const combToPlay = new CardCombination(foundCards);
    // Get this comb ready so that may skip evaluating comb.
    combToPlay.setType(typeOfTurn);
    combToPlay.setValue(values[values.length - 1]);
    combToPlay.setStraightSize(straightSizeOfTurn);

    return combToPlay;
  }


  


/**
 * Printer for available combinations, what ever nature they are.
 */
  printAvailableCombs(player) {
       //helps printing
      const TypesAndArrays = [
          { type: CombType.SINGLE, array: this.singles },
          { type: CombType.PAIR, array: this.pairs },
          { type: CombType.TRIPLE, array: this.triples },
          { type: CombType.QUAD, array: this.quads },
          { type: CombType.STRAIGHT, array: this.straights },
          { type: CombType.PAIR_STRAIGHT, array: this.pairStraights },
          { type: CombType.TRIPLE_STRAIGHT, array: this.tripleStraights },
          { type: CombType.QUAD_STRAIGHT, array: this.quadStraights }
      ];


    console.log(`\n=== ${player.getName()}'s Available Combinations ===`);

    for (let typeInfo of TypesAndArrays) {
        const combinations = [];
        typeInfo.array.forEach ((comb) => {
            const combination = this.buildCombinationDisplay(typeInfo.type, comb);
            combinations.push(combination.join(''));
        });

        if (combinations.length > 0) {
            console.log(`${typeInfo.type}: [${combinations.join(', ')}]`);
        } else {
            console.log(`${typeInfo.type}: (none)`);
        }
    }

    console.log(`=======================================\n`);
  }


  buildCombinationDisplay(type, comb) {
      const valueToDisplay = (val) => {
          if (val === 11) return 'J';
          if (val === 12) return 'Q'; 
          if (val === 13) return 'K';
          if (val === 14) return 'A';
          if (val === 15) return '2';
          if (val === 16) return '3';
          return val.toString();
      };
      switch (type) {
          case CombType.SINGLE:
              return [valueToDisplay(comb[0])];
              
          case CombType.PAIR:
              return [valueToDisplay(comb[0]), valueToDisplay(comb[0])];
              
          case CombType.TRIPLE:
              return [valueToDisplay(comb[0]), valueToDisplay(comb[0]), valueToDisplay(comb[0])];
              
          case CombType.QUAD:
              return [valueToDisplay(comb[0]), valueToDisplay(comb[0]), valueToDisplay(comb[0]), valueToDisplay(comb[0])];
              
          case CombType.STRAIGHT:
              const straightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  straightCards.push(valueToDisplay(comb[i]));
              }
              return straightCards;
              
          case CombType.PAIR_STRAIGHT:
              const pairStraightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  pairStraightCards.push(valueToDisplay(comb[i]), valueToDisplay(comb[i]));
              }
              return pairStraightCards;
              
          case CombType.TRIPLE_STRAIGHT:
              const tripleStraightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  tripleStraightCards.push(valueToDisplay(comb[i]), valueToDisplay(comb[i]), valueToDisplay(comb[i]));
              }
              return tripleStraightCards;
              
          case CombType.QUAD_STRAIGHT:
              const quadStraightCards = [];
              for (let i = 0 ; i < comb.length; i++) {
                  quadStraightCards.push(valueToDisplay(comb[i]), valueToDisplay(comb[i]), valueToDisplay(comb[i]), valueToDisplay(comb[i]));
              }
              return quadStraightCards;
              
          default:
              return [];
      }
  }



}