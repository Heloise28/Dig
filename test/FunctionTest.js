import { Card } from '../models/Card.js';
import { Deck } from '../models/Deck.js';
import { HumanDigPlayer } from '../models/HumanDigPlayer.js';
import { AIDigPlayer } from '../models/AIDigPlayer.js';
import { CardCombination } from '../models/CardCombination.js';
import { Suit, CombType, Personality } from '../models/enums.js';
import { DigGameEngine } from '../models/DigGameEngine.js';
import { DigRoundState } from '../models/DigRoundState.js';


/*
const noob = new AIDigPlayer('Noob', 1, 1, Personality.NOOB_BOT);
const result = noob.AIEngine.findStraightBreakers([4,5,6,7,8,9,10], [4,5,6,7,8,9,10], 3);
console.log(result);

noob.AIEngine.straights = [[4,5,6,7,8,9,10,11,12,13]];
noob.AIEngine.singles = [[4], [5], [6], [7], [9], [13]];
noob.AIEngine.pairs = [[11], [12]];
noob.AIEngine.triples = [[8]];
noob.AIEngine.quads = [[10]];

noob.AIEngine.turnMaxCombsSafe();
noob.AIEngine.printAvailableCombs(noob);  

*/
