import { DigGameSession } from '../models/DigGameSession.js';
import { VisualManager } from './VisualManager.js'
import { initI18n } from './lang/i18n.js';






// session.runConsoleTest();


async function main() {
  await initI18n();



  const canvas = document.getElementById('canvas');
  const vm = new VisualManager(canvas);
  let gameSession = null;

  vm.resizeCanvas();
  vm.setStage(0);
  window.addEventListener('resize', () => vm.resizeCanvas());

  vm.initiateAnimation();

  vm.setCallbacks({
    onStartGame: async () => {
      gameSession = new DigGameSession();

      vm.updateGameSessionState(gameSession);
      await vm.initiateGameSession();
      gameSession.runLocalGUITest();
      vm.setStage(10);

      const cardsToDeal = new Array(52);
      for (let i = 0; i < 16; i++) {
        cardsToDeal[i*3 + 0] = gameSession.players[0].getHand().getCards()[i];
        cardsToDeal[i*3 + 1] = gameSession.players[1].getHand().getCards()[i];
        cardsToDeal[i*3 + 2] = gameSession.players[2].getHand().getCards()[i];
      }
      cardsToDeal[48] = gameSession.pitDeck.getCards()[0];
      cardsToDeal[49] = gameSession.pitDeck.getCards()[1];
      cardsToDeal[50] = gameSession.pitDeck.getCards()[2];
      cardsToDeal[51] = gameSession.pitDeck.getCards()[3];
      vm.startMovingCards(cardsToDeal);
      vm.storeAllCards(cardsToDeal);

      console.log("just create game session");
      // const initialState = gameSession.startGame();
      // visual.showGameBoard(initialState);    
    },

    onBackMainMenu: () => {
      gameSession = null;
      vm.setStage(0);
      console.log("just back main menu");
    }
    /*
    onCardClick: (cardIndex) => {
      const result = gameSession.selectCard(cardIndex);
      visual.updateDisplay(result);
    },
    
    onPlayCard: () => {
      const result = gameSession.playCard();
      visual.animateCardPlay(result);
    }
    */
  });

}

main();