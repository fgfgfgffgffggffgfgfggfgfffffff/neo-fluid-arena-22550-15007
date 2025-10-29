import { Vector2D } from "../types";

/**
 * 移动优化器 - 使AI移动流畅且具有特效
 * 实现平滑插值和轨迹预测，避免闪现
 */
export class MovementOptimizer {
  private trails: Map<string, Vector2D[]> = new Map();
  private maxTrailLength = 15;
  private smoothingFactor = 0.15; // 平滑系数，越小越平滑
  
  /**
   * 计算平滑移动
   */
  public smoothMove(
    entityId: string,
    currentPos: Vector2D,
    targetPos: Vector2D,
    speed: number,
    deltaTime: number
  ): Vector2D {
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      return currentPos;
    }
    
    // 使用平滑插值而不是直接移动
    const smoothSpeed = speed * this.smoothingFactor;
    const moveX = (dx / distance) * smoothSpeed;
    const moveY = (dy / distance) * smoothSpeed;
    
    const newPos = {
      x: currentPos.x + moveX,
      y: currentPos.y + moveY
    };
    
    // 更新轨迹
    this.updateTrail(entityId, newPos);
    
    return newPos;
  }
  
  /**
   * 计算缓动移动（Ease-in-out）
   */
  public easeMove(
    currentPos: Vector2D,
    targetPos: Vector2D,
    progress: number // 0-1
  ): Vector2D {
    // 使用三次缓动函数
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    return {
      x: currentPos.x + (targetPos.x - currentPos.x) * easeProgress,
      y: currentPos.y + (targetPos.y - currentPos.y) * easeProgress
    };
  }
  
  /**
   * 更新轨迹
   */
  private updateTrail(entityId: string, position: Vector2D): void {
    if (!this.trails.has(entityId)) {
      this.trails.set(entityId, []);
    }
    
    const trail = this.trails.get(entityId)!;
    trail.unshift({ ...position });
    
    if (trail.length > this.maxTrailLength) {
      trail.pop();
    }
  }
  
  /**
   * 获取轨迹
   */
  public getTrail(entityId: string): Vector2D[] {
    return this.trails.get(entityId) || [];
  }
  
  /**
   * 清除轨迹
   */
  public clearTrail(entityId: string): void {
    this.trails.delete(entityId);
  }
  
  /**
   * 计算预测位置（用于瞄准预判）
   */
  public predictPosition(
    currentPos: Vector2D,
    velocity: Vector2D,
    predictionTime: number
  ): Vector2D {
    return {
      x: currentPos.x + velocity.x * predictionTime,
      y: currentPos.y + velocity.y * predictionTime
    };
  }
  
  /**
   * 计算避障路径
   */
  public calculateAvoidancePath(
    currentPos: Vector2D,
    targetPos: Vector2D,
    obstacles: Vector2D[],
    avoidRadius: number
  ): Vector2D {
    let adjustedTarget = { ...targetPos };
    
    // 检查每个障碍物
    for (const obstacle of obstacles) {
      const dx = currentPos.x - obstacle.x;
      const dy = currentPos.y - obstacle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 如果太接近障碍物，调整目标位置
      if (dist < avoidRadius) {
        const avoidX = (dx / dist) * avoidRadius;
        const avoidY = (dy / dist) * avoidRadius;
        
        adjustedTarget.x += avoidX * 0.5;
        adjustedTarget.y += avoidY * 0.5;
      }
    }
    
    return adjustedTarget;
  }
  
  /**
   * 渲染移动轨迹特效
   */
  public renderTrailEffect(
    ctx: CanvasRenderingContext2D,
    entityId: string,
    color: string,
    radius: number
  ): void {
    const trail = this.getTrail(entityId);
    
    if (trail.length < 2) return;
    
    // 绘制渐隐的轨迹
    for (let i = 0; i < trail.length - 1; i++) {
      const alpha = (1 - i / trail.length) * 0.6;
      const currentRadius = radius * (1 - i / trail.length * 0.5);
      
      const gradient = ctx.createRadialGradient(
        trail[i].x,
        trail[i].y,
        0,
        trail[i].x,
        trail[i].y,
        currentRadius * 2
      );
      
      gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.5, `${color}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(trail[i].x, trail[i].y, currentRadius * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * 创建冲刺特效
   */
  public renderDashEffect(
    ctx: CanvasRenderingContext2D,
    startPos: Vector2D,
    endPos: Vector2D,
    color: string
  ): void {
    const gradient = ctx.createLinearGradient(
      startPos.x,
      startPos.y,
      endPos.x,
      endPos.y
    );
    
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.stroke();
  }
}
