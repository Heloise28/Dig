export class Button {
  constructor(x, y, width, height, text, onClick) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.textKey = text;
      this.onClick = onClick;
      this.isHovered = false;
      this.isPressed = false;
    }

  drawButton(ctx, displayText) {
    ctx.fillStyle = this.isPressed ? '#0056b3' : 
                    this.isHovered ? '#007bff' : '#0d6efd';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = '#0056b3';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        displayText, 
        this.x + this.width / 2, 
        this.y + this.height / 2
    );
  }

  isPointInside(mouseX, mouseY) {
    return mouseX >= this.x && 
            mouseX <= this.x + this.width &&
            mouseY >= this.y && 
            mouseY <= this.y + this.height;
  }

  handleClick(mouseX, mouseY) {
    if (this.isPointInside(mouseX, mouseY)) {
      this.onClick();
      return true;
    }
    return false;
  }
}