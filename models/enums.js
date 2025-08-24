const CombType = Object.freeze({
  SINGLE: 'Single',
  PAIR: 'Pair',
  TRIPLE: 'Triple',
  STRAIGHT: 'Straight',
  QUAD: 'Quad',
  PAIR_STRAIGHT: 'PairStraight',
  TRIPLE_STRAIGHT: 'TripleStraight',
  QUAD_STRAIGHT: 'QuadStraight',
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





export { CombType, Suit };



