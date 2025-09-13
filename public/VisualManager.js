import { Button } from './visual_elements/Button.js';
import { t, setLanguage } from './lang/i18n.js';

export class VisualManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    
    this.canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
    
    this.lang = 'en'; // Default English

    // Button uses translation key, not raw string
    this.langButton = new Button(
      canvas.width * 0.9,
      canvas.height * 0.05,
      120,
      40,
      'switch_lang', // translation key
      () => this.toggleLanguage()
    );

    this.startButton = new Button(
      canvas.width * 0.9,
      canvas.height * 0.05,
      120,
      40,
      'switch_lang', // translation key
      () => this.toggleLanguage()
    );

  }

  handleCanvasMouseMove(event) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    //然后把检查有没有在button里面的一样写到这颗里面是一个if

  }


  handleCanvasClick(event) {
    // The canvas.getBoundingClientRect() method in JavaScript returns a DOMRect object that provides information about the size and position of the canvas element relative to the viewport. 
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.langButton.handleClick(mouseX, mouseY)) {
      // This is a common pattern for event handling.
      // Button click handled, re-render will be triggered by toggleLanguage
    }
  }

  async toggleLanguage() {
    this.lang = this.lang === 'en' ? 'zh' : 'en';
    await setLanguage(this.lang);
    console.log(`toggle lang, set to ${this.lang}`);
    this.render();
  }

  render() {
    this.renderMainMenu();
  }

  renderMainMenu() {
    this.ctx.fillStyle = 'rgba(77, 110, 188, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dummy text using translation key
    this.ctx.fillStyle = 'white';
    this.ctx.font = '32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      t('start_game'), // uses translation
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    // Update button text based on current language
    this.langButton.text = this.lang === 'en' ? 'switch_lang' : 'switch_lang';
    this.langButton.drawButton(this.ctx, t(this.langButton.textKey));
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
    this.render();
    console.log('resizing!');
  }
}