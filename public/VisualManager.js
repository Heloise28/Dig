import { Button } from './Button.js';
import { t, setLanguage } from './lang/i18n.js';

export class VisualManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.callbacks = {};

    this.mySeat = 2;
    // left, center, right
    this.positionOfSeats = new Array(3);
    this.currentSeat = -1;
    this.startSeat = -1;

    this.lang = 'en'; // Default English

    this.buttons = new Map();
    this.loadButtons();
    this.setUpEventListeners();

    this.allCardsToRender = [];
    this.cardVisibleWidth = 25;
    this.cardVisibleHeight = 25;
    this.cardBackVisibleHeight = 8;
    this.cardWidth = 122;
    this.cardHeight = 177;
    this.cardImageMap = null;
    this.cardBackImage = null;
    this.cardXYMap = null;
    this.cardVisualsMap = new Map();
    
    // 0 -> main menu
    // 10 -> Start a game, deal cards, wait for bidding
    this.stage = 0;

    this.cardsToMove = [];   // copy array
    this.currentAnimatingCard = null;
    this.movingFinished = true; // true when all cards moved
    this.offsetMultiple = 0;

    this.handAnchorLeftX = 0.09;
    this.handAnchorLeftY = 0.15;
    this.handAnchorRightX = 0.91;
    this.handAnchorRightY = 0.15;
    this.handAnchorCenterX = 0.25;
    this.handAnchorCenterY = 0.7;
    this.pitAnchorX = 0.25;
    this.pitAnchorY = 0.15;

    this.deckAnchorX = 0.09;
    this.deckAnchorY = 0.7;
  }


  
  async initGameSession(cardsToDeal) {
      
    this.storeallCardsToRender(cardsToDeal); 
    await this.loadAllCardImages();
    console.log('Load all card image done!');
    this.initCardVisualsMap(this.allCardsToRender);
    this.setAllCardVisualOwners();

    this.setPositionOfSeats();
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




  initAnimation() {
    requestAnimationFrame(this.animate);
  }

 
  animate = (timestamp) => {  // Arrow function preserves 'this'
    this.clearCanvas();
    this.update();
    this.render();
    requestAnimationFrame(this.animate);
  }



  // Updates
  update() {
    if (this.stage === 10) {
      this.updateInitialDealingAnimation();
    }
  }

  moveCurrentAnimatingCard() {
    if (!this.currentAnimatingCard) return; 
    const { card, toX, toY, speedX, speedY } = this.currentAnimatingCard;
    const visual = this.cardVisualsMap.get(card);

    const x = visual.x;
    const y = visual.y;
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

    visual.x = newX;
    visual.y = newY;

    // Done? → clear current card
    if (newX === toX && newY === toY) {
      this.currentAnimatingCard = null;
    }
  }


  // ChatGPT did this one!
  // Called inside your update() when stage === 10
  updateInitialDealingAnimation() {
    // If currently animating a card → move it
    if (this.currentAnimatingCard) {
      this.moveCurrentAnimatingCard();
      return; // ✅ only one card animates at a time
    }

    // If no card animating and queue has cards → start next one
    if (this.cardsToMove.length > 0) {
      const card = this.cardsToMove.shift();

      let visual = this.cardVisualsMap.get(card);

      if (visual.seatOfOwner !== -1) {
        if (visual.seatOfOwner === this.mySeat) {
          this.setCardVisualAnchor(card, 'hand_center', this.offsetMultiple);
        } else if (visual.seatOfOwner === (this.mySeat + 1) % 3) { 
          this.setCardVisualAnchor(card, 'hand_right', this.offsetMultiple);
        } else if (visual.seatOfOwner === (this.mySeat + 2) % 3) {
          this.setCardVisualAnchor(card, 'hand_left', this.offsetMultiple);
        } else if (visual.seatOfOwner === 8) {
          this.setCardVisualAnchor(card, 'pit', this.offsetMultiple);
        }

        this.setCurrentSeat(this.currentSeat >= 2 ? 0 : this.currentSeat + 1);
        if (this.currentSeat === this.startSeat) {
          this.offsetMultiple ++;
        }
      
      } else {
        if (this.offsetMultiple > 3) this.offsetMultiple = 0;
        this.setCardVisualAnchor(card, 'pit', this.offsetMultiple);
        this.offsetMultiple ++;
      }
      
      let targetX = visual.anchorX + visual.offsetX * visual.offsetTimesX;
      let targetY = visual.anchorY + visual.offsetY * visual.offsetTimesY;

      let speedX = this.findSpeed(visual.x, targetX, 0.3);
      let speedY = this.findSpeed(visual.y, targetY, 0.3);

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
      this.offsetMultiple = 0;
      this.movingFinished = true;
      this.setStage(20); // advance stage
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
    if (this.stage === 20) {
      this.ctx.fillStyle = 'rgba(43, 87, 47, 1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);   
      this.drawAllCardsAfterDealing();
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

    this.drawCardsBackXY(this.allCardsToRender);
  }


  drawCardFaceXY(card) {
    let visual = this.cardVisualsMap.get(card);
    if (!visual) return;
    this.ctx.drawImage(visual.faceImage, visual.x, visual.y, this.cardWidth, this.cardHeight);
  }


  drawCardsFaceXY(cards) {
    for (const card of cards) {
      this.drawCardFaceXY(card);
    }
  }

  drawCardBackXY(card) {
    let visual = this.cardVisualsMap.get(card);
    if (!visual) return;
    this.ctx.drawImage(this.cardBackImage, visual.x, visual.y, this.cardWidth, this.cardHeight);
  }


  drawCardsBackXY(cards) {
    for (const card of cards) {
      this.drawCardBackXY(card);
    }
  }

  drawCardFaceAnchor(card) {
    let visual = this.cardVisualsMap.get(card);
    if (!visual) return;
    let x = visual.anchorX + visual.offsetX * visual.offsetTimesX;
    let y = visual.anchorY + visual.offsetY * visual.offsetTimesY;
    this.ctx.drawImage(visual.faceImage, x, y, this.cardWidth, this.cardHeight);
  }

  drawCardsFaceAnchor(cards) {
    for (const card of cards) {
      this.drawCardFaceAnchor(card);
    }
  }

  drawCardBackAnchor(card) {
    let visual = this.cardVisualsMap.get(card);
    if (!visual) return;
    let x = visual.anchorX + visual.offsetX * visual.offsetTimesX;
    let y = visual.anchorY + visual.offsetY * visual.offsetTimesY;
    this.ctx.drawImage(this.cardBackImage, x, y, this.cardWidth, this.cardHeight);
  }

  drawCardsBackAcnhor(cards) {
    for (const card of cards) {
      this.drawCardBackAnchor(card);
    }
  }

  drawAllCardsAfterDealing() {
    for (const card of this.allCardsToRender) {
      let visual = this.cardVisualsMap.get(card);
      if (visual.anchor === 'hand_left' || visual.anchor === 'hand_right') {
        this.drawCardBackAnchor(card);
      } else {
        this.drawCardFaceAnchor(card);
      }
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


    if (this.stage > 0) this.updateCardVisualsAnchor();

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
        0.8,
        0.05,
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
        0.8,
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
    const cards = this.allCardsToRender;
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

  // loadAllCardXY() {
  //   const cards = this.gameSession.deck.getCards();
  //   const cardXYMap = new Map();

  //   for (const card of cards) {
  //     cardXYMap.set(card, [this.deckAnchorX * this.canvas.width,this.deckAnchorY * this.canvas.height]);
  //   }
  //   this.cardXYMap = cardXYMap;
  // }


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

  // storeGameSession(gameSession) {
  //   this.gameSession = gameSession;
  // }

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

  setPositionOfSeats() {
    this.positionOfSeats[this.mySeat] = 'center';
    this.positionOfSeats[(this.mySeat + 1) % 3] = 'right';
    this.positionOfSeats[(this.mySeat + 2) % 3] = 'left';
  }

  setCurrentSeat(n) {
    this.currentSeat = n;
  }

  setStartSeat(n) {
    this.startSeat = n;
  }

  storeallCardsToRender(cards) {
    this.allCardsToRender = cards;
  }

  // Fetch visual informations here
  initCardVisualsMap(cards) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      // Optionally set event handlers:
      this.cardVisualsMap.set(
        card,
        {
          faceImage: this.cardImageMap.get(card),

          seatOfOwner: -1,
          // deck, hand_left, hand_right, hand_center, pit
          anchor: 'deck',
          anchorX: this.deckAnchorX * this.canvas.width,
          anchorY: this.deckAnchorY * this.canvas.height,

          offsetX: 0,
          offsetY: 0,
          offsetTimesX: 0,
          offsetTimesY: 0,

          x: this.deckAnchorX * this.canvas.width,
          y: this.deckAnchorY * this.canvas.height,

          onMouseUp: () => { /* ... */ },
          onHover: () => { /* ... */ },
        }
      )
    }
  }

  setCardVisualsOwner(card, seat) {
    this.cardVisualsMap.get(card).seatOfOwner = seat;
  }

  setAllCardVisualOwners() {
    for (let i = 0; i < 48; i++) {
      this.setCardVisualsOwner(this.allCardsToRender[i], (this.currentSeat + i) % 3);
    }
  }

  setCardVisualAnchor(card, anchor, times) {
    const visual = this.cardVisualsMap.get(card);
    if (!visual) return;
    visual.anchor = anchor;
    if (anchor === 'deck') {
        visual.anchorX = this.deckAnchorX * this.canvas.width;
        visual.anchorY = this.deckAnchorY * this.canvas.height;
        visual.offsetX = 0;
        visual.offsetY = 0;
        visual.offsetTimesX = 0;
        visual.offsetTimesY = 0;

    } else if (anchor === 'hand_center') {
        visual.anchorX = this.handAnchorCenterX * this.canvas.width;
        visual.anchorY = this.handAnchorCenterY * this.canvas.height;
        visual.offsetX = this.cardVisibleWidth;
        visual.offsetY = 0;
        visual.offsetTimesX = times || 0;
        visual.offsetTimesY = 0;

    } else if (anchor === 'hand_left') {
        visual.anchorX = this.handAnchorLeftX * this.canvas.width;
        visual.anchorY = this.handAnchorLeftY * this.canvas.height;
        visual.offsetX = 0;
        visual.offsetY = this.cardBackVisibleHeight;
        visual.offsetTimesX = 0;
        visual.offsetTimesY = times;
    } else if (anchor === 'hand_right') {
        visual.anchorX = this.handAnchorRightX * this.canvas.width - this.cardWidth;
        visual.anchorY = this.handAnchorRightY * this.canvas.height;
        visual.offsetX = 0;
        visual.offsetY = this.cardBackVisibleHeight;
        visual.offsetTimesX = 0;
        visual.offsetTimesY = times;
    } else if (anchor === 'pit') {
        visual.anchorX = this.pitAnchorX * this.canvas.width;
        visual.anchorY = this.pitAnchorY * this.canvas.height;
        visual.offsetX = this.cardWidth + 10;
        visual.offsetY = 0;
        visual.offsetTimesX = times;
        visual.offsetTimesY = 0;
    }
  }

  // Call when canvas resize
  updateCardVisualsAnchor() {
    this.cardVisualsMap.forEach((visual) => {
      if (visual.anchor === 'deck') {
          visual.anchorX = this.deckAnchorX * this.canvas.width;
          visual.anchorY = this.deckAnchorY * this.canvas.height;
      } else if (visual.anchor === 'hand_left') {
          visual.anchorX = this.handAnchorLeftX * this.canvas.width;
          visual.anchorY = this.handAnchorLeftY * this.canvas.height;
      } else if (visual.anchor === 'hand_center') {
          visual.nchorX = this.handAnchorCenterX * this.canvas.width;
          visual.anchorY = this.handAnchorCenterY * this.canvas.height;
      } else if (visual.anchor === 'hand_right') {
          visual.anchorX = this.handAnchorRightX * this.canvas.width - this.cardWidth;
          visual.anchorY = this.handAnchorRightY * this.canvas.height;
      } else if (visual.anchor === 'pit') {
        visual.anchorX = this.pitAnchorX * this.canvas.width;
        visual.anchorY = this.pitAnchorY * this.canvas.height;
      }
    })
  }


  // updateCardXYToResize() {
  //   this.cardXYMap.forEach((value, key) => {
  //     value[0] = value[0]
  //   })
  // }

}