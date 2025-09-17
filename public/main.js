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

  vm.initAnimation();

  vm.setCallbacks({
    onStartGame: async () => {
      gameSession = new DigGameSession();

      gameSession.runLocalGUITest(); 

      let j = gameSession.startPlayerIndex;
      const cardsToDeal = new Array(52);
      for (let i = 0; i < 16; i++) {
        cardsToDeal[i*3 + 0] = gameSession.players[j].getHand().getCards()[i];
        cardsToDeal[i*3 + 1] = gameSession.players[(j + 1) % 3].getHand().getCards()[i];
        cardsToDeal[i*3 + 2] = gameSession.players[(j + 2) % 3].getHand().getCards()[i];
      }  
      cardsToDeal[48] = gameSession.pitDeck.getCards()[0];
      cardsToDeal[49] = gameSession.pitDeck.getCards()[1];
      cardsToDeal[50] = gameSession.pitDeck.getCards()[2];
      cardsToDeal[51] = gameSession.pitDeck.getCards()[3];
      
      
      vm.setCurrentSeat(j);
      vm.setStartSeat(j);
      await vm.initGameSession(cardsToDeal);
      vm.setStage(10);
      vm.startMovingCards(cardsToDeal);


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