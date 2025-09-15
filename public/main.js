import { DigGameSession } from '../models/DigGameSession.js';
import { VisualManager } from './VisualManager.js'
import { initI18n } from './lang/i18n.js';






// session.runDigGameSession();


async function main() {
  await initI18n();



  const canvas = document.getElementById('canvas');
  const vm = new VisualManager(canvas);
  let gameSession = null;

  vm.resizeCanvas();
  window.addEventListener('resize', () => vm.resizeCanvas());

  vm.initiateAnimation();

  vm.setCallbacks({
    onStartGame: async () => {
      gameSession = new DigGameSession();
      vm.updateGameSession(gameSession);
      await vm.initiateGameSession();
      vm.setStage(10);
      vm.startMovingCards(gameSession.deck.getCards());
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