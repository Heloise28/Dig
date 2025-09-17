

export class CardVisual {
  constructor(card, image) {
    this.card = card; // Card model object
    this.image = image; // Image object
    this.anchor = null;
    this.anchorX = 0; // proportion (0-1)
    this.anchorY = 0; // proportion (0-1)
    this.offsetTimesX = 0; // integer, can be negative
    this.offsetTimesY = 0; // integer, can be negative

    // Placeholder event handlers
    this.onMouseUp = () => {};
    this.onHover = () => {};
  }

  getCanvasX(canvas) {

  }
  getCanvasY(canvas) {
  }

  setCardVisualAnchor(anchor) {
    this.anchor = anchor;
  }

  draw(ctx, canvas, width, height) {
    ctx.drawImage(
      this.image,
      this.getCanvasX(canvas),
      this.getCanvasY(canvas),
      width,
      height
    );
  }

  // For hit detection
  isPointInside(mouseX, mouseY, canvas, width, height) {
    const x = this.getCanvasX(canvas);
    const y = this.getCanvasY(canvas);
    return (
      mouseX >= x &&
      mouseX <= x + width &&
      mouseY >= y &&
      mouseY <= y + height
    );
  }
}