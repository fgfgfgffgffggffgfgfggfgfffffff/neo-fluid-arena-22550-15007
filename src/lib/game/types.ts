export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}
