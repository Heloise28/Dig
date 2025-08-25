import { Card } from '../models/Card.js';
import { Deck } from '../models/Deck.js';
import { HumanDigPlayer } from '../models/HumanDigPlayer.js';
import { CardCombination } from '../models/CardCombination.js';
import { Suit } from '../models/enums.js';
import { DigGameEngine } from '../models/DigGameEngine.js';


console.log(Suit.isValid(Suit.HEARTS));
console.log('\n');
let c0 = new Card('4', Suit.HEARTS, true);
let c1 = new Card('A', 45, true);
