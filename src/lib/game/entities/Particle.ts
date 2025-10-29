import { Vector2D } from "../types";

export class Particle {
  public position: Vector2D;
  private velocity: Vector2D;
  private radius: number;
  private color: string;
  public alpha: number = 1;
  private decay = 0.02;

  constructor(
    position: Vector2D,
    velocity: Vector2D,
    radius: number,
    color: string
  ) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
  }

  public update(deltaTime: number) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
    
    this.alpha -= this.decay;
    this.radius *= 0.98;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createRadialGradient(
      this.position.x,
      this.position.y,
      0,
      this.position.x,
      this.position.y,
      this.radius * 2
    );
    
    gradient.addColorStop(0, this.color.replace(")", `, ${this.alpha})`).replace("hsl", "hsla"));
    gradient.addColorStop(1, "transparent");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
