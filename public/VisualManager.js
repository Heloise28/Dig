import { Button } from './visual_elements/Button.js';
import { t, setLanguage } from './lang/i18n.js';

export class VisualManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.callbacks = {};
    this.gameSession = null;

    this.lang = 'en'; // Default English

    this.buttons = new Map();
    this.loadButtons();
    this.setUpEventListeners();

    this.cardVisibleWidth = 38;
    this.cardWidth = 122;
    this.cardHeight = 177;
    this.cardImageMap = null;
    this.cardBackImage = null;
    this.cardXYMap = null;
    
    // 0 -> main menu
    // 10 -> Start a game, deal cards, wait for bidding
    this.stage = 0;

    this.cardsToMove = [];   // copy array
    this.currentAnimatingCard = null;
    this.movingFinished = true; 
    this.moveCardToX = 0;
    this.moveCardToY = 0;
    this.moveCardSpeedX = 0;
    this.moveCardSpeedY = 0;

  }


  
  async initiateGameSession() {
    await this.loadAllCardImages();
    console.log('Load all card image done!');
    this.loadAllCardXY();
  }


  handleCanvasMouseMove(event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    this.buttons.forEach((button) => {
        if (button.handleMouseMove(mouseX, mouseY)) {
        // This is a common pattern for event handling.
        // Button click handled, re-render will be triggered by toggleLanguage
        }
      }
    );

  }

  handleCanvasMouseUp(event) {
    // The canvas.getBoundingClientRect() method in JavaScript returns a DOMRect object that provides information about the size and position of the canvas element relative to the viewport. 
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.buttons.forEach((button) => {
        if (button.handleMouseUp(mouseX, mouseY)) {
        // This is a common pattern for event handling.
        // Button click handled, re-render will be triggered by toggleLanguage
        }
      }
    );

  }

  handleCanvasClick(event) {
    // The canvas.getBoundingClientRect() method in JavaScript returns a DOMRect object that provides information about the size and position of the canvas element relative to the viewport. 
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  }

  async toggleLanguage() {
    this.lang = this.lang === 'en' ? 'zh' : 'en';
    await setLanguage(this.lang);
    console.log(`toggle lang, set to ${this.lang}`);

    this.buttons.get('lang').text = 'switch_lang';
    this.buttons.get('start').text = 'start_game';
    this.render();
  }











  initiateAnimation() {
    requestAnimationFrame(this.animate);
  }

 
  animate = (timestamp) => {  // Arrow function preserves 'this'
    this.clearCanvas();
    this.update(this.gameSession);
    this.render();
    requestAnimationFrame(this.animate);
  }



  // Updates
  update(session) {
    if (this.stage === 10) {
      this.updateInitialDealingAnimation(session.deck.getCards());
    }
  }


  // ChatGPT did this one!
  // Called inside your update() when stage === 10
  updateInitialDealingAnimation() {
    // If currently animating a card → move it
    if (this.currentAnimatingCard) {
      const { card, targetX, targetY, speedX, speedY } = this.currentAnimatingCard;
      const [x, y] = this.cardXYMap.get(card);

      // Move closer to target
      let newX = x + speedX;
      let newY = y + speedY;

      // Check if reached destination (simple overshoot check)
      if ((speedX >= 0 && newX >= targetX) || (speedX < 0 && newX <= targetX)) {
        newX = targetX;
      }
      if ((speedY >= 0 && newY >= targetY) || (speedY < 0 && newY <= targetY)) {
        newY = targetY;
      }

      this.cardXYMap.set(card, [newX, newY]);

      // Done? → clear current card
      if (newX === targetX && newY === targetY) {
        this.currentAnimatingCard = null;
      }

      return; // ✅ only one card animates at a time
    }

    // If no card animating and queue has cards → start next one
    if (this.cardsToMove.length > 0) {
      const card = this.cardsToMove.shift();

      // Example: send it to (500, 500). You’d calculate based on player seat.
      this.currentAnimatingCard = {
        card,
        targetX: 500,
        targetY: 500,
        speedX: 5,
        speedY: 5
      };
      return;
    }

    // If no more cards left → mark finished
    if (!this.movingFinished) {
      this.movingFinished = true;
      console.log("✅ Finished moving cards");
      this.setStage(11); // advance stage
    }
  }

  // moveCard(card, toX, toY, perSecondX, perSecondY) {
  //   const xy = this.cardXYMap.get(card);
  //   this.cardXYMap.set(card, [xy[0] + perSecondX, xy[1] + perSecondY]);
  //   console.log(`Moving ${card} to ${this.cardXYMap.get(card)}`);
  // }



  // renders

  render() {
    if (this.stage === 0) {
      this.renderMainMenu();   
    }
    if (this.stage === 10) {
      this.renderGameStart();
    }

    if (this.stage > 0) {
      this.buttons.get('back').drawButton(this.ctx, t(this.buttons.get('back').textKey));
    }
    // Update button text based on current language
    this.buttons.get('lang').drawButton(this.ctx, t(this.buttons.get('lang').textKey));
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }


  renderMainMenu() {
    this.ctx.fillStyle = 'rgba(43, 87, 47, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.fillStyle = 'white';
    this.ctx.font = '80px Tahoma';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      t('title'), // uses translation
      this.canvas.width * 0.5,
      this.canvas.height * 0.35
    );

    // Sub title
    this.ctx.fillStyle = 'white';
    this.ctx.font = '25px Tahoma';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      t('sub_title'), // uses translation
      this.canvas.width * 0.5,
      this.canvas.height * 0.45
    );

    this.buttons.get('start').drawButton(this.ctx, t(this.buttons.get('start').textKey));
  }

  renderGameStart() { 
    this.ctx.fillStyle = 'rgba(43, 87, 47, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let initialDeckX = this.canvas.width / 2 - 61;
    let initialDeckY = this.canvas.height / 3 - 88;

    for (const card of this.gameSession.deck.getCards()) {
      this.drawCardBack(card);
    }
  }

  drawCardFace(card) {
    this.ctx.drawImage(this.cardImageMap.get(card), this.cardXYMap.get(card)[0], this.cardXYMap.get(card)[1], this.cardWidth, this.cardHeight);
  }

  drawCardBack(card) {
    this.ctx.drawImage(this.cardBackImage, this.cardXYMap.get(card)[0], this.cardXYMap.get(card)[1], this.cardWidth, this.cardHeight);
  }


  resizeCanvas() {
    //The window object is part of the browser's global scope, so any JavaScript code (including your class methods) can access window.innerWidth, window.innerHeight, etc. directly.
    let w = Math.min(window.innerWidth, 1920);
    let h = w * (9 / 16);

    if (h > window.innerHeight) {
      h = Math.min(window.innerHeight, 1080);
      w = h * (16 / 9);
    }

    w = Math.max(w, 1280);
    h = Math.max(h, 720);

    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.buttons.forEach((value) => value.handleResize(this.canvas));

    this.render();
    console.log('resizing!');
  }




  isMainMenu() {
    return this.stage === 0;
  }



  loadButtons() {
    this.buttons.set(
      'lang',
      new Button(
        0.6,
        0.1,
        0.1,
        0.033,
        this.canvas,
        'switch_lang', // translation key
        () => this.toggleLanguage()
      )
    );

    this.buttons.set(
      'start',
      new Button(
        0.4,
        0.55,
        0.2,
        0.067,
        this.canvas,
        'start_game', 
        () => this.callbacks.onStartGame()
      )
    );

    this.buttons.set(
      'back',
      new Button(
        0.6,
        0.9,
        0.15, 
        0.067,
        this.canvas,
        'back_to_main', 
        () => this.callbacks.onBackMainMenu()
      )
    );
  }

  async loadAllCardImages() {
    // Load back image
    const backImagePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.src = 'public/assets/cards/standard-deck/back.png';
      image.addEventListener("load", () => {
        this.cardBackImage = image;
        resolve();
      });
      image.addEventListener("error", reject);
    });

    // Load face images
    const cards = this.gameSession.deck.getCards();
    const cardImageMap = new Map();

    const faceImagePromises = cards.map(card => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = card.getFaceImagePath();
        image.addEventListener("load", () => {
          cardImageMap.set(card, image);
          resolve();
        });
        image.addEventListener("error", reject);
      });
    });

    // Wait for everything to finish
    await Promise.all([backImagePromise, ...faceImagePromises]);

    this.cardImageMap = cardImageMap;
  }

  loadAllCardXY() {
    const cards = this.gameSession.deck.getCards();
    const cardXYMap = new Map();

    for (const card of cards) {
      cardXYMap.set(card, [0,0]);
    }
    this.cardXYMap = cardXYMap;
  }


  setUpEventListeners() {
    this.canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
    // this.canvas.addEventListener('mousedown', (event) => this.handleCanvasMouseDown(event));
    this.canvas.addEventListener('mouseup', (event) => this.handleCanvasMouseUp(event));
    this.canvas.addEventListener('mousemove', (event) => this.handleCanvasMouseMove(event));
  }

  setStage(n) {
    this.stage = n;
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  updateGameSession(gameSession) {
    this.gameSession = gameSession;
  }

  // Call this before stage 10 starts
  startMovingCards(cards) {
    // Queue of cards to deal
    this.cardsToMove = [...cards];   // copy array
    this.currentAnimatingCard = null;
    this.movingFinished = false;
  }

  findSpeed(from, to, seconds) {
    const d = to - from;
    const frames = seconds * 60;
    return d / frames; // units per frame
  }

}