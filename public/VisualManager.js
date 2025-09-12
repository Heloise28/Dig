
export class VisualManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

  }

  render() {
    this.renderMainMenu();
  }


  renderMainMenu() {
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }


  resizeCanvas() {
    //The window object is part of the browser's global scope, so any JavaScript code (including your class methods) can access window.innerWidth, window.innerHeight, etc. directly.
    let w = Math.min(window.innerWidth, 1920);
    let h = w * (9/16);
    
    if (h > window.innerHeight) {
      h = Math.min(window.innerHeight, 1080);
      w = h * (16/9);
    }
    
    w = Math.max(w, 1280);
    h = Math.max(h, 720);
    
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    this.render();
    console.log('resizing!');
  }


}