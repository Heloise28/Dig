import { Card } from '../models/Card.js';
import { HumanDigPlayer } from '../models/HumanDigPlayer.js';
import { Suit, CombType } from '../models/enums.js';
import { DigGameEngine } from '../models/DigGameEngine.js';




/*
// Test Card class functionality
console.log('=== Testing Card Class ===');

const card1 = new Card('A', 'hearts');
const card2 = new Card('K', 'spades'); 
const card3 = new Card('2', 'diamonds');
const joker1 = new Card('Joker', 'red');

console.log('Card 1 (Ace):', card1.toString(), 'Value:', card1.value);
console.log('Card 2 (King):', card2.toString(), 'Value:', card2.value);
console.log('Card 3 (Two):', card3.toString(), 'Value:', card3.value);
console.log('Joker:', joker1.toString(), 'Value:', joker1.value);

console.log('Ace vs King:', card1.compareTo(card2));
console.log('King vs Two:', card2.compareTo(card3));
console.log('Joker vs King:', joker1.compareTo(card2));

card1.flip();
console.log('After flip:', card1.toString());

card1.flip();
console.log('After second flip:', card1.toString());

console.log('Card image path:', card1.getImagePath());

joker1.flip();
console.log('Joker revealed:', joker1.toString());
console.log('Joker image path:', joker1.getImagePath());

// Test Deck class functionality
console.log('\n=== Testing Deck Class ===');

// Test 54-card deck (with jokers)
const deck54 = Deck.createStandardDeck();
console.log('54-card deck created:', deck54.toString());

console.log('Peek at top card:', deck54.peek()?.toString());
console.log('Deck size:', deck54.size());

// Test 52-card deck (without jokers)
const deck52 = Deck.create52CardDeck();
console.log('52-card deck created:', deck52.toString());

// Test joker removal from 54-card deck
console.log('\n=== Testing Joker Removal ===');
const deckWithJokers = Deck.createStandardDeck();
console.log('Before joker removal:', deckWithJokers.size());
const removedJokers = deckWithJokers.removeJokers();
console.log('After joker removal:', deckWithJokers.size());
console.log('Removed jokers:', removedJokers.map(card => card.toString()));

// Deal some cards
const dealtCards = deck54.dealTopCards(5);
console.log('\nDealt 5 cards:', dealtCards.map(card => card.toString()));
console.log('Remaining deck size:', deck54.size());

// Shuffle the deck
deck54.shuffle();
console.log('After shuffle, top card:', deck54.peek()?.toString());

// Add cards back
deck54.addCards(dealtCards);
console.log('After adding cards back, deck size:', deck54.size());

// Test specific card dealing
const specificCard = new Card('K', 'hearts');
const foundCard = deck54.dealSpecificCard(specificCard);
console.log('Dealt specific card:', foundCard?.toString() || 'Not found');

// Test random card dealing
const randomCard = deck54.dealRandomCard();
console.log('Dealt random card:', randomCard?.toString());

// Test filtering cards
console.log('\n=== Testing Card Filtering ===');
const testDeck = Deck.createStandardDeck();
const removedAces = testDeck.removeCardsByRank('A');
console.log('Removed Aces:', removedAces.length);
console.log('Deck size after removing Aces:', testDeck.size());

console.log('Final deck size:', deck54.size());
console.log('Is deck empty?', deck54.isEmpty());

*/









console.log('=== Testing ===');

// 54-card deck (with jokers)
/*
const deck54 = Deck.createStandardDeck();
deck54.flipDeck();
deck54.shuffle();
console.log('54-card deck created:', deck54.toString());
*/

const digDeck = DigGameEngine.createDeckForDig();
digDeck.flipDeck();
digDeck.shuffle();
console.log('Dig deck created:', digDeck.toString());

const john = new HumanDigPlayer('John', 1);
john.addCards(digDeck.dealTopCards(16));

john.addCards([
  new Card("4", Suit.CLUBS, true),
  new Card("4", Suit.CLUBS, true),
  new Card("5", Suit.CLUBS, true),
  new Card("5", Suit.CLUBS, true),
  new Card("6", Suit.CLUBS, true),
  new Card("6", Suit.CLUBS, true),
]);

john.sortHandAscByValue();
//console.log(playerJohn.getHand().peek().toShortString());
console.log(john.toString());

let johnPlayed;
let i = 0;

let typeOfTurn = CombType.PAIR_STRAIGHT;
let valueToBeat = 2;
let sraightSizeOfTurn = 3;

john.updateAvailableCombinations();
john.printAvailableCombinations();

while (john.getHandSize() > 0 && i < 1) {
    let selectedComb = await john.getSelectedCardsFromConsole();
    DigGameEngine.evaluateCardCombination(selectedComb, typeOfTurn, valueToBeat, sraightSizeOfTurn)
    if (selectedComb.isValidCombination()) {
        typeOfTurn = selectedComb.getType();
        valueToBeat = selectedComb.getValue();
        johnPlayed = selectedComb;
        john.loseSelectedCards();
        console.log('John plays: ' + johnPlayed);
        console.log(john.toString());
    } else {
        console.log('can\'t play this!');
        john.getHand().deselectDeck();
    }
    i++;
}








