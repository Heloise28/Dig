import { Card } from './Card.js';
import { Deck } from './Deck.js';
import { HumanDigPlayer } from './HumanDigPlayer.js';
import { AIDigPlayer } from './AIDigPlayer.js';
import { CardCombination } from './CardCombination.js';
import { Suit, CombType, Personality } from './enums.js';
import { DigGameEngine } from './DigGameEngine.js';
import { DigRoundState } from './DigRoundState.js';

export class DigGameSession {
  constructor() {
    this.bid = 0;
    this.startPlayerIndex = 0;
    this.isOpenRound = true;
    this.passesCount = 0;
    this.lastPlayedValue = 0;

    this.bidderIndex = 0;
    this.winnerIndex = 0;

    this.deck = DigGameEngine.createDeckForDig();
    DigGameEngine.raiseBigCardsValue(this.deck);
    this.pitDeck = new Deck();
    this.heartValue = 0;

    this.players = [];
    this.playedCards = [[],[],[]];

    this.state = new DigRoundState();
    this.gameContinue = true;

  }






  async runDigGameSession() {
    this.addAIPlayer('Noobie', 0, 1, Personality.NOOB_BOT);
    this.addAIPlayer('Noobolobus', 1, 1, Personality.NOOB_BOT);
    this.addHumanPlayer('John', 2);

    while (this.gameContinue) {
      await this.runDigGame();
      this.isWinningScoreReached(6);
    }

    /**
     * @todo Don't forget to get rid of this console version in GUI test.
     */
    this.players[2].closeReadLine();
  }



  async runDigGame() {
    this.resetGame();
    await this.runBidding();
    await this.runPlaying();
    this.updateScore();
  }



  resetGame() {
    /**
     * @todo get the pit and update heart value
     */
    this.collectCards();
    this.deck.flipDeck();
    this.deck.shuffle();

    this.bid = 0;
    
    this.pitDeck.addCards(this.deck.dealTopCards(4));

    this.state.setValue(this.findHeartValue());
    this.state.setType(CombType.NONE);
    this.state.setStraightSize(0);
    this.state.setIsFirstRound(true); 
    
    this.players[0].addCards(this.deck.dealTopCards(16));
    this.players[1].addCards(this.deck.dealTopCards(16));
    this.players[2].addCards(this.deck.dealTopCards(16));

    this.players[0].sortHandAscByValue();
    this.players[1].sortHandAscByValue();
    this.players[2].sortHandAscByValue();

    this.players[0].updateHandAnalysis(); 
    this.players[1].updateHandAnalysis(); 
    this.players[2].updateHandAnalysis();
    
    this.findStartPlayerIndex();
  }


  async runBidding() {
    console.log('------ Digging begins! How much y\'all want to dig?')
    console.log('Your cards: ', this.players[2].toString());
    this.passesCount = 0;
    this.lastBid = 0;

    let i = this.startPlayerIndex;
    while (i < 3) {
      let player = this.players[i];
      let playerBid = 0;
      
      if (this.passesCount === 2 && this.bid !== 0) {
        this.bidderIndex = i;
        console.log(this.bidderIndex, ' index player digged ', this.bid, '!');
        break;
      }

      if (this.passesCount === 3 && this.bid === 0) {
        this.bidderIndex = this.startPlayerIndex;
        this.bid = 1;
        console.log('Nobody digged. So ', this.bidderIndex, ' index player digged ', this.bid, '!');
        break;
      }

      if (!player.getIsHuman()) {
        playerBid = player.AIEngine.getAIBidDecision(player);
      } else {
        playerBid = await player.bidFromConsole(this.bid);
      }

      if (playerBid > this.bid) {
        console.log(`${i} digs ${playerBid}`);
        this.bid = playerBid;
        this.passesCount = 0;
        if (this.bid === 3) {
          this.bidderIndex = i;
          console.log(`Biggest dig! Let's go!`);
          break;
        }
      } else {
        console.log(`${i} didn\'t dig enough. Equals pass!`);
        playerBid = 0;
      }
      
      if (playerBid === 0) {
        this.passesCount++;
        console.log(`${i} passes. ${this.passesCount} players passed.`);
      }

      i++;
      if (i === 3) i = 0;
    }

    this.players[this.bidderIndex].addCards(this.pitDeck.dealTopCards(4));
    this.players[this.bidderIndex].sortHandAscByValue();
    console.log(`Just checking, player 0 has ${this.players[0].getHandSize()} cards`);
    console.log(`Just checking, player 1 has ${this.players[1].getHandSize()} cards`);
    console.log(`Just checking, player 2 has ${this.players[2].getHandSize()} cards`);

    console.log(`Pit is ${this.bid}, digger is ${this.bidderIndex}. Let's play!`);
  }


  /**
   * @todo gather all cards
   * @todo updated played cards
   */

  async runPlaying() {
      console.log('\n------------  You versus 2 noobs BEGIN! ------------');

      this.passesCount = 0;
      this.lastPlayedValue = 0;
      this.isOpenRound = true;

      let i = this.startPlayerIndex;
      while (i < 3) {
        let player = this.players[i];
        // console.log('Round begins ======== ', isOpenRound, lastPlayedValue, passesCount);

        if (!player.getIsHuman()) {
          this.AIPlayerGO(player, this.state);
        } else {
          await this.humanPlayerGO(player, this.state);
        }

        // If this player clears hand, game ends
        if (player.getHandSize() === 0) {
          console.log(`${player.getName()} first cleared their hand! WINS!`);
          this.winnerIndex = i;
          break;
        }

        if (this.state.getValue() === 16 || (this.isATypeOfStraights() && this.state.getValue() === 13)) {
          console.log('Largest value! You beat the round!');
          this.state.setType(CombType.NONE);
          this.state.setValue(0);
          this.state.setStraightSize(0);
          this.isOpenRound = true;
          continue;
        }

        if (!this.isOpenRound) {
          // If this player passed (value to beat is the same)
          if (this.state.getValue() === this.lastPlayedValue) {
            this.passesCount++;

            // If count 2 passes, goes back to this player who can decide what to play.
            if (this.passesCount === 2) {
              this.state.setType(CombType.NONE);
              this.state.setValue(0);
              this.state.setStraightSize(0);
              this.isOpenRound = true;
            }

          } else {
            this.passesCount = 0;
          }
        
        } else {
          this.isOpenRound = false;
          this.passesCount = 0;
        }
        // Update lastPlayedValue to what is player played
        this.lastPlayedValue = this.state.getValue();

        // If this player still has card, move i to next player.
        i++;
        if (i === 3) i = 0;
        console.log('\nNext player index is ', i);
      }
      console.log('game ends');
    
    /*
    // Collect Cards Testers
    console.log(`Player 0 played: ${this.playedCards[0]}, has ${this.players[0].getHand().size()} cards left.\n`);
    console.log(`Player 1 played: ${this.playedCards[1]}, has ${this.players[1].getHand().size()} cards left.\n`);
    console.log(`Player 2 played: ${this.playedCards[2]}, has ${this.players[2].getHand().size()} cards left.\n`);
    this.collectCards();
    console.log(`Player 0 played: ${this.playedCards[0]}, has ${this.players[0].getHand().size()} cards left.\n`);
    console.log(`Player 1 played: ${this.playedCards[1]}, has ${this.players[1].getHand().size()} cards left.\n`);
    console.log(`Player 2 played: ${this.playedCards[2]}, has ${this.players[2].getHand().size()} cards left.\n`);
    console.log(this.deck.cards.length);
    */
  }

  updateScore() {
    if (this.bidderIndex === this.winnerIndex) {
      for (let i = 0; i < 3; i++) {
        if (i === this.bidderIndex) {
          this.players[i].addScore(this.bid * 2);
          console.log(`Player ${i} gets ${this.bid * 2}! Now score is ${this.players[i].getScore()}`);
        } else {
          this.players[i].deductScore(this.bid);
          console.log(`Player ${i} loses ${this.bid}! Now score is ${this.players[i].getScore()}`);                  
        }  
      }
    
    } else {
      for (let i = 0; i < 3; i++) {
        if (i === this.bidderIndex) {
          this.players[i].deductScore(this.bid * 2);
          console.log(`Player ${i} loese ${this.bid * 2}! Now score is ${this.players[i].getScore()}`);
        } else {
          this.players[i].addScore(this.bid);
          console.log(`Player ${i} gets ${this.bid}! Now score is ${this.players[i].getScore()}`);                  
        }
      }
    }
  }


  isWinningScoreReached(winningScore) {
    for (let i = 0; i < 3; i++) {
      const player = this.players[i];
      if (player.getScore() >= winningScore) {
        this.gameContinue = false;
        console.log(`Player ${i} reached ${winningScore}! Game session over!`);
      }
    }
  }




  findHeartValue() {
    let heartValue = 3;
    this.pitDeck.sortByValueAsc();
    for (const card of this.pitDeck.getCards()) {
      if (card.getSuit() === Suit.HEARTS && card.getValue() === heartValue + 1) {
        heartValue = card.getValue();
        console.log(`${card.toShortString()} is in the pit!`);
      }
    }
    console.log(`Player with ${heartValue + 1} of heart bid and play first!`);
    return heartValue;
  }



  findStartPlayerIndex() {
    this.heartValue = this.state.getValue() + 1; 

    if (this.hasThatHeart(this.players[0], this.heartValue)) {
      this.startPlayerIndex = 0;
    } else if (this.hasThatHeart(this.players[1], this.heartValue)) {
      this.startPlayerIndex = 1;
    } else if (this.hasThatHeart(this.players[2], this.heartValue)) {
      this.startPlayerIndex = 2;
    } else {
      throw new Error(`What? No player has required heart?`);
    }
    console.log('Set first player to player index', this.startPlayerIndex);
  }


  isATypeOfStraights() {
    const type = this.state.getType();
    if (type === CombType.STRAIGHT
      || type === CombType.PAIR_STRAIGHT
      || type === CombType.TRIPLE_STRAIGHT
      || type === CombType.QUAD_STRAIGHT) {
        return true;
      }
    return false;
  }

  /**
   * Collect played cards and player's remaining cards back to deck.
   */
  collectCards() {
    for (const group of this.playedCards) {
      for (const comb of group) {
        this.deck.addCards(comb.getCards());
      }
    }
    this.playedCards = [[],[],[]];
    for (const player of this.players) {
      let count = player.getHand().size();
      this.deck.addCards(player.getHand().dealTopCards(count));
    }
  }


  addAIPlayer(name, seatNumber, level, personality) {
    const player = new AIDigPlayer(name, seatNumber, level, personality);
    this.players.push(player);
  }

  addHumanPlayer(name, seatNumber) {
    const player = new HumanDigPlayer(name, seatNumber);
    this.players.push(player);
  }


  hasThatHeart(player, heartValue) {
    if (heartValue < 4 || heartValue > 8) {
      throw new Error(`The requirement of a ${heartValue} of heart is impossible!`);
    }

    const heartRank = heartValue + '';
    
    for (const card of player.getHand().getCards()) {
      if (card.equalRandAndSuitWith(new Card(heartRank, Suit.HEARTS, true))) {
        return true;
      }
    }

    return false;
  }


  // Also updates all round states
  AIPlayerGO(player, state) {
    let selectedComb = player.getAISelectedComb(state);

    // Handle if no card selected 
    if (selectedComb.getSize() === 0) {
      if (state.getType() === CombType.NONE) {
        throw new Error('AI passes when it\s supposed to open!');
      } else {
        console.log(`No cards selected. ${player.getName()} chose to pass. (I\'m in AIPlayerGO)`)
        return;
      }
    }

    // If there's card
    DigGameEngine.evaluateCardCombination(selectedComb, state)
    if (selectedComb.isValidCombination()) {

      // Update round stats
      state.setType(selectedComb.getType());
      state.setValue(selectedComb.getValue());
      state.setStraightSize(selectedComb.getStraightSize());
      if (state.getIsFirstRound()) state.setIsFirstRound(false);

      console.log(`\n${player.getName()} plays: ${selectedComb}`);
      player.loseSelectedCards();
      player.updateHandAnalysis(); 

    } else {
      console.log('can\'t play this!');
    
    }
    this.playedCards[player.getSeatNumber()].push(selectedComb);
    selectedComb.deselectComb();    
  }

  async humanPlayerGO (player, state) {
    console.log(`\n${state.getType()} ${state.getValue()} (First Round? -> ${state.getIsFirstRound()}`);
    console.log(player.toString());
    let haveToPlay = true;
    while (haveToPlay) {
      let selectedComb = await player.getCombOfSelectedCards();
      
      // Handle if no card selected 
      if (selectedComb.getSize() === 0) {
        if (state.getType() === CombType.NONE) {
          console.log(`${player.getName()} must open this round. Play anything!`);
        } else {
          console.log(`No cards selected. ${player.getName()} chose to pass. (I\'m in HumanPlayerGO)`)
          return;
        }
      
      } else {
        DigGameEngine.evaluateCardCombination(selectedComb, state)
        if (selectedComb.isValidCombination()) {
          haveToPlay = false;
          //update what player played in this turn
          state.setType(selectedComb.getType());
          state.setValue(selectedComb.getValue());
          state.setStraightSize(selectedComb.getStraightSize());      
          if (state.getIsFirstRound()) state.setIsFirstRound(false);

          console.log(`\n${player.getName()} plays: ${selectedComb}`);
          player.loseSelectedCards();

        } else {
          console.log('can\'t play this!');
        
        }
        this.playedCards[player.getSeatNumber()].push(selectedComb);
        selectedComb.deselectComb();      
      }
    }
    return;
  }

}