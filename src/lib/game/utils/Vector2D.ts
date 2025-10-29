import { Vector2D } from "../types";

export const magnitude = (v: Vector2D): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

export const normalize = (v: Vector2D): Vector2D => {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
};

export const distance = (a: Vector2D, b: Vector2D): number => {
  return magnitude({ x: b.x - a.x, y: b.y - a.y });
};

export const dotProduct = (a: Vector2D, b: Vector2D): number => {
  return a.x * b.x + a.y * b.y;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
