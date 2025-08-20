import React, { useMemo } from 'react';

// Star field constants based on the provided SCSS
const STAR_FIELD_WIDTH = 2560;
const STAR_FIELD_HEIGHT = 2560;
const STAR_START_OFFSET = 600; // used in CSS ::after

// Counts and speeds
const NUM_STAR_ONE = 1700;
const NUM_STAR_TWO = 700;
const NUM_STAR_THREE = 200;
const NUM_SHOOTING_STARS = 10; // Multiple subtle streaks with randomized starts

const DURATION_ONE = '100s';
const DURATION_TWO = '125s';
const DURATION_THREE = '175s';
const DURATION_SHOOTING = '10s';

// Generate base star points, then tile them in a 2x2 grid (x, y), (x+W, y), (x, y+H), (x+W, y+H)
type Point = { x: number; y: number };

function generateStarPoints(n: number, width: number, height: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < n; i++) {
    points.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    });
  }
  return points;
}

function buildTiledBoxShadow(points: Point[], width: number, height: number): string {
  // Build a 2x2 tiling so when we translate by -width and -height the pattern wraps seamlessly
  const parts: string[] = [];
  for (const p of points) {
    // original tile
    parts.push(`${p.x}px ${p.y}px #FFF`);
    // right tile
    parts.push(`${p.x + width}px ${p.y}px #FFF`);
    // bottom tile
    parts.push(`${p.x}px ${p.y + height}px #FFF`);
    // bottom-right tile
    parts.push(`${p.x + width}px ${p.y + height}px #FFF`);
  }
  return parts.join(', ');
}

function generateStars(n: number, width: number, height: number) {
  // Produce a CSS box-shadow list: "xpx ypx #FFF, xpx ypx #FFF, ..."
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    parts.push(`${x}px ${y}px #FFF`);
  }
  return parts.join(', ');
}

const StarLayer: React.FC<{ count: number; sizePx: number; duration: string }>
  = ({ count, sizePx, duration }) => {
  const points = useMemo(
    () => generateStarPoints(count, STAR_FIELD_WIDTH, STAR_FIELD_HEIGHT),
    [count]
  );
  const boxShadow = useMemo(
    () => buildTiledBoxShadow(points, STAR_FIELD_WIDTH, STAR_FIELD_HEIGHT),
    [points]
  );

  return (
    <div
      className="star-layer"
      aria-hidden
      style={
        {
          // custom properties consumed by CSS
          ['--star-size' as any]: `${sizePx}px`,
          ['--star-duration' as any]: duration,
          ['--star-field-width' as any]: `${STAR_FIELD_WIDTH}px`,
          ['--star-field-height' as any]: `${STAR_FIELD_HEIGHT}px`,
          ['--star-start-offset' as any]: `${STAR_START_OFFSET}px`,
          ['--star-boxshadow' as any]: boxShadow,
          // Disable ::after clone to avoid unnecessary overdraw; tiling already covers wrap-around
          ['--star-boxshadow-2' as any]: 'none',
        } as React.CSSProperties
      }
    />
  );
};

const StarField: React.FC<{ className?: string; shootingStars?: boolean }>
  = ({ className, shootingStars = false }) => {
  return (
    <div
      className={['starfield-overlay', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      {/* Three layers of different sizes and speeds */}
      <StarLayer count={NUM_STAR_ONE} sizePx={1} duration={DURATION_ONE} />
      <StarLayer count={NUM_STAR_TWO} sizePx={2} duration={DURATION_TWO} />
      <StarLayer count={NUM_STAR_THREE} sizePx={3} duration={DURATION_THREE} />
      {/* Shooting stars (optional) */}
      {shootingStars &&
        Array.from({ length: NUM_SHOOTING_STARS }).map((_, i) => {
          // Randomize starting position as percentages within the overlay box
          const top = `${Math.floor(Math.random() * 100)}%`;
          const left = `${Math.floor(Math.random() * 100)}%`;
          // Use negative delay to stagger phases immediately
          const delay = `-${Math.floor(Math.random() * 10)}s`;
          // Shorter tail: 160px - 300px
          const tail = `${160 + Math.floor(Math.random() * 140)}px`;
          return (
            <div
              key={`shooting-${i}`}
              className="shooting-star"
              style={{
                ['--star-field-width' as any]: `${STAR_FIELD_WIDTH}px`,
                ['--star-field-height' as any]: `${STAR_FIELD_HEIGHT}px`,
                ['--shooting-star-duration' as any]: DURATION_SHOOTING,
                ['--shooting-start-top' as any]: top,
                ['--shooting-start-left' as any]: left,
                ['--shooting-star-tail' as any]: tail,
                animationDelay: delay,
              } as React.CSSProperties}
            />
          );
        })}
    </div>
  );
};

export default StarField;
