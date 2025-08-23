const CombType = Object.freeze({
  SINGLE: 'Single',
  PAIR: 'Pair',
  TRIPLE: 'Triple',
  STRAIGHT: 'Straight',
  QUAD: 'Quad',
  PAIR_STRAIGHT: 'PairStraight',
  PAIR_TRIPLE: 'PairTriple',
  PAIR_QUAD: 'PairQuad',
  NONE: 'None',
});

const Suit = Object.freeze({
  HEARTS: 'Hearts',
  DIAMONDS: 'Diamonds',
  CLUBS: 'Clubs',
  SPADES: 'Spades',
  JOKER: 'Joker', // For Joker cards
  MIXED: 'Mixed', // For combinations with mixed suits
  NONE: 'None', // For no suit
});

export { CombType, Suit };