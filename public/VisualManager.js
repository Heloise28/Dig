import { Button } from './Button.js';
import { t, setLanguage } from './lang/i18n.js';

export class VisualManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.callbacks = {};
    this.gameSession = null;

    this.mySeat = 2;
    // left, center, right
    this.positionOfSeats = new Array(3);
    this.currentSeat = -1;

    this.lang = 'en'; // Default English

    this.buttons = new Map();
    this.loadButtons();
    this.setUpEventListeners();

    this.allCards = [];
    this.cardVisibleWidth = 25;
    this.cardVisibleHeight = 25;
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

    this.anchorOffsetX = 0;
    this.anchorOffsetY = 0;

    this.handAnchorLeftX = 100;
    this.handAnchorLeftY = 100;
    this.handAnchorRightX = 1180;
    this.handAnchorRightY = 100;
    this.handAnchorCenterX = 640;
    this.handAnchorCenterY = 560;

    this.deckAnchorX = this.canvas.width / 2 - 61;
    this.deckAnchorY = this.canvas.height / 3 - 88;

  }


  
  async initiateGameSession() {
    await this.loadAllCardImages();
    console.log('Load all card image done!');
    this.loadAllCardXY();
    this.setPositionOfSeats();
    this.resetAnchorOffset();
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
      const { card, toX, toY, speedX, speedY } = this.currentAnimatingCard;
      const [x, y] = this.cardXYMap.get(card);

      // Move closer to target
      let newX = x + speedX;
      let newY = y + speedY;

      // Check if reached destination (simple overshoot check)
      if ((speedX >= 0 && newX >= toX) || (speedX < 0 && newX <= toX)) {
        newX = toX;
      }
      if ((speedY >= 0 && newY >= toY) || (speedY < 0 && newY <= toY)) {
        newY = toY;
      }

      this.cardXYMap.set(card, [newX, newY]);

      // Done? → clear current card
      if (newX === toX && newY === toY) {
        this.currentAnimatingCard = null;
      }
      // console.log(`Moving ${card}`);  
      return; // ✅ only one card animates at a time
    }

    // If no card animating and queue has cards → start next one
    if (this.cardsToMove.length > 0) {
      const card = this.cardsToMove.shift();
      this.setCurrentSeat(this.currentSeat >= 2 ? 0 : this.currentSeat + 1);
      console.log(`current seat is ${this.currentSeat}`);
      // console.log(`Dealing ${card} to seat ${this.currentSeat}`);

      let targetX = 0;
      let targetY = 0;

      if (this.currentSeat === this.mySeat) {
        targetX = this.handAnchorCenterX + this.anchorOffsetX;
        targetY = this.handAnchorCenterY;

      } else if (this.currentSeat === (this.mySeat + 1) % 3) {
        targetX = this.handAnchorLeftX;
        targetY = this.handAnchorLeftY + this.anchorOffsetY;
      } else {        
        targetX = this.handAnchorRightX;
        targetY = this.handAnchorRightY + this.anchorOffsetY;
      }

      if (this.currentSeat === 0) {
        this.anchorOffsetX += this.cardVisibleWidth;
        this.anchorOffsetY += this.cardVisibleHeight;
      }

      let speedX = this.findSpeed(this.cardXYMap.get(card)[0], targetX, 1);
      let speedY = this.findSpeed(this.cardXYMap.get(card)[1], targetY, 1);

      this.currentAnimatingCard = {
        card,
        toX: targetX,
        toY: targetY,
        speedX: speedX,
        speedY: speedY
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
    this.drawAllButtons();
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

  }

  renderGameStart() { 
    this.ctx.fillStyle = 'rgba(43, 87, 47, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawAllCardsFace();

  }

  drawCardFace(card) {
    this.ctx.drawImage(this.cardImageMap.get(card), this.cardXYMap.get(card)[0], this.cardXYMap.get(card)[1], this.cardWidth, this.cardHeight);
  }

  drawCardBack(card) {
    this.ctx.drawImage(this.cardBackImage, this.cardXYMap.get(card)[0], this.cardXYMap.get(card)[1], this.cardWidth, this.cardHeight);
  }

  drawAllCardsFace() {
    for (const card of this.allCards) {
      this.drawCardFace(card);
    }
  }

  drawAllCardsBack() {
    for (const card of this.allCards) {
      this.drawCardBack(card);
    }
  }

  drawAllButtons() {
    this.buttons.forEach((value, key) => {
      value.drawButton(this.ctx, t(value.textKey));
    });
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

    this.handAnchorLeftX = this.canvas.width * 0.09 - this.cardWidth / 2;
    this.handAnchorLeftY = this.canvas.height * 0.15 - this.cardHeight / 2;
    this.handAnchorRightX = this.canvas.width * 0.91 - this.cardWidth / 2;
    this.handAnchorRightY = this.canvas.height * 0.15 - this.cardHeight / 2;
    this.handAnchorCenterX = this.canvas.width * 0.43 - this.cardWidth / 2;
    this.handAnchorCenterY = this.canvas.height * 0.6 - this.cardHeight / 2;

    this.deckAnchorX = this.canvas.width / 2 - this.cardWidth / 2;
    this.deckAnchorY = this.canvas.height / 3 - this.cardHeight / 2;

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
      cardXYMap.set(card, [this.deckAnchorX,this.deckAnchorY]);
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

    this.buttons.forEach((value, key) => {
      value.hideButton();
    });

    this.buttons.get('lang').displayButton();

    if (n === 0) {
      this.buttons.get('start').displayButton();
    }
    if (n > 0) {
      this.buttons.get('back').displayButton();
    }
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  updateGameSessionState(gameSession) {
    this.gameSession = gameSession;
  }

  // Call this before stage 10 starts
  startMovingCards(cards) {
    // console.log(`Gonna move these cards: ${cards}`);

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

  setPositionOfSeats() {
    this.positionOfSeats[this.mySeat] = 'center';
    this.positionOfSeats[(this.mySeat + 1) % 3] = 'right';
    this.positionOfSeats[(this.mySeat + 2) % 3] = 'left';
  }

  setCurrentSeat(n) {
    this.currentSeat = n;
  }

  storeAllCards(cards) {
    this.allCards = cards;
  }

  resetAnchorOffset() { 
    this.anchorOffsetX = 0;
    this.anchorOffsetY = 0;
  }

}