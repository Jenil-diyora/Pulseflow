import React from 'react';
import { Circle } from 'react-native-svg';

const ParticleSystem = React.memo(({ particles }) => {
  return (
    <>
      {particles.map((particle) => (
        <Circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.radius}
          fill={particle.color}
          opacity={particle.life}
        />
      ))}
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render if particle count or reference changes
  return prevProps.particles === nextProps.particles;
});

export default ParticleSystem;

// Particle class for game logic (matching code.html exactly)
export class Particle {
  constructor(x, y, color) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = x;
    this.y = y;
    this.color = color;
    // Random angle and speed matching code.html
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.02;
    this.radius = Math.random() * 3 + 1;
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
