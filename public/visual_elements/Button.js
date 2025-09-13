export class Button {
  constructor(x, y, width, height, text, onMouseUp) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.textKey = text;
      this.onMouseUp = onMouseUp;
      this.isHovered = false;
      this.isPressed = false;
    }

  drawButton(ctx, displayText) {
    if (this.isHovered) {
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)"; // Green glow, adjust color and alpha as needed
      ctx.shadowBlur = 12; // Adjust blur amount for glow intensity
      ctx.shadowOffsetX = 0; // For a centered glow
      ctx.shadowOffsetY = 0; // For a centered glow
    } else {      
      ctx.shadowBlur = 0; // Cancel glow when hover out
    }

    ctx.fillStyle = this.isPressed ? '#a39232ff' : 
                    this.isHovered ? '#fde89bff' : '#f7dd36ff';
    ctx.fillRect(this.x, this.y, this.width, this.height);    
    ctx.shadowBlur = 0; // Somehow this stops everything else to glow

    ctx.strokeStyle = '#2b2b2bff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = 'black';
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

  handleMouseUp(mouseX, mouseY) {
    if (this.isPointInside(mouseX, mouseY)) {
      this.onMouseUp();
      return true;
    }
    return false;
  }

  handleMouseMove(mouseX, mouseY) {
    if (this.isPointInside(mouseX, mouseY)) {
      this.isHovered = true;
      console.log(`Is hovered : ${this.isHovered}`);
      return true;
    }
    this.isHovered = false;
    return false;
  }
}