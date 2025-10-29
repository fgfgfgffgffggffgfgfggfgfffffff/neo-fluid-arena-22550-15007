import { Vector2D } from "../types";

export class Bullet {
  public position: Vector2D;
  public velocity: Vector2D;
  public direction: Vector2D;
  public radius: number;
  public color: string;
  private speed = 20; // Wider shooting range

  constructor(position: Vector2D, direction: Vector2D, radius: number, color: string = "hsl(200, 100%, 70%)") {
    this.position = position;
    this.direction = direction;
    this.velocity = {
      x: direction.x * this.speed,
      y: direction.y * this.speed,
    };
    this.radius = radius;
    this.color = color;
  }

  public update(deltaTime: number) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  
  public isOutOfBounds(canvas: HTMLCanvasElement): boolean {
    return (
      this.position.x < 0 ||
      this.position.x > canvas.width ||
      this.position.y < 0 ||
      this.position.y > canvas.height
    );
  }

  public render(ctx: CanvasRenderingContext2D) {
    const x = this.position.x;
    const y = this.position.y;

    // Outer glow - wider spread
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 3);
    outerGlow.addColorStop(0, this.color.replace("hsl", "hsla").replace(")", ", 0.6)"));
    outerGlow.addColorStop(0.5, this.color.replace("hsl", "hsla").replace(")", ", 0.3)"));
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
    coreGradient.addColorStop(0, this.color.replace("hsl", "hsla").replace(")", ", 1)"));
    coreGradient.addColorStop(0.7, this.color.replace("hsl", "hsla").replace(")", ", 0.8)"));
    coreGradient.addColorStop(1, this.color.replace("hsl", "hsla").replace(")", ", 0.4)"));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    const highlight = ctx.createRadialGradient(
      x - this.radius * 0.3,
      y - this.radius * 0.3,
      0,
      x,
      y,
      this.radius * 0.5
    );
    highlight.addColorStop(0, "hsla(0, 0%, 100%, 0.9)");
    highlight.addColorStop(1, "transparent");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
