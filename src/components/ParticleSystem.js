import React from 'react';
import { G, Circle } from 'react-native-svg';

/**
 * Super lightweight ParticleSystem.
 * Simplified for maximum compatibility and performance.
 */
const ParticleSystem = React.memo(({ particles }) => {
  if (!particles || particles.length === 0) return null;

  return (
    <G>
      {particles.map((p) => (
        <Circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.radius}
          fill={p.color}
          opacity={p.life * 0.8}
        />
      ))}
    </G>
  );
}, (prevProps, nextProps) => {
  // Custom equality check: only re-render if particle count/IDs change meaningfully
  // Actually, standard shallow comparison is fine if we update the array reference properly.
  // But strictly, we want to update every frame the parent passes new props.
  // Since we throttle in parent, React.memo mainly helps when parent re-renders for OTHER reasons (like score updates).
  return prevProps.particles === nextProps.particles;
});

export default ParticleSystem;

export class Particle {
  constructor(x, y, color) {
    this.id = Math.random().toString(36).substring(7);
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = 0.05 + Math.random() * 0.05;
    this.radius = Math.random() * 2 + 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    return this.life > 0;
  }
}

export const createParticleBurst = (x, y, color, count = 10) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
  return particles;
};
