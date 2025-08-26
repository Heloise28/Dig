const CombType = Object.freeze({
  SINGLE: 'Single',
  PAIR: 'Pair',
  TRIPLE: 'Triple',
  QUAD: 'Quad',
  STRAIGHT: 'Straight',
  PAIR_STRAIGHT: 'Pair Straight',
  TRIPLE_STRAIGHT: 'Triple Straight',
  QUAD_STRAIGHT: 'Quad Straight',
  NONE: 'None',

  isValid(value) {
    return Object.values(this).includes(value);
  },

});

const Suit = Object.freeze({
  HEARTS: 'Hearts',
  DIAMONDS: 'Diamonds',
  CLUBS: 'Clubs',
  SPADES: 'Spades',
  JOKER: 'Joker', // For Joker cards
  MIXED: 'Mixed', // For combinations with mixed suits
  NONE: 'None', // For no suit

  isValid(value) {
    return Object.values(this).includes(value);
  },

});

const Personality = Object.freeze({
  NOOB_BOT: "Noob Bot",

  isValid(value) {
    return Object.values(this).includes(value);
  },

});




export { CombType, Suit };



