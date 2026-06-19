// A hand-drawn-looking wireframe sketch, shipped as an SVG so users can try
// Blueprint instantly without taking a photo. CaptureZone rasterizes it to a
// PNG (via canvas) before sending, since the vision model wants raster bytes.

export const DEMO_SKETCH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650">
  <rect width="900" height="650" fill="#fdfcf7"/>
  <g fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" font-family="Comic Sans MS, cursive">
    <!-- top bar -->
    <rect x="40" y="40" width="820" height="70" rx="6"/>
    <circle cx="85" cy="75" r="16"/>
    <text x="120" y="84" font-size="26" stroke="none" fill="#2b2b2b">Acme Dashboard</text>
    <line x1="600" y1="75" x2="660" y2="75"/>
    <line x1="690" y1="75" x2="750" y2="75"/>
    <rect x="775" y="58" width="60" height="34" rx="17"/>
    <text x="792" y="80" font-size="18" stroke="none" fill="#2b2b2b">Log in</text>

    <!-- hero heading -->
    <text x="40" y="180" font-size="40" stroke="none" fill="#2b2b2b">Welcome back, Sam</text>
    <line x1="40" y1="205" x2="520" y2="205"/>
    <line x1="40" y1="225" x2="430" y2="225"/>

    <!-- 3 stat cards -->
    <rect x="40" y="265" width="250" height="150" rx="8"/>
    <text x="60" y="305" font-size="22" stroke="none" fill="#2b2b2b">Revenue</text>
    <text x="60" y="360" font-size="44" stroke="none" fill="#2b2b2b">$24k</text>

    <rect x="320" y="265" width="250" height="150" rx="8"/>
    <text x="340" y="305" font-size="22" stroke="none" fill="#2b2b2b">Users</text>
    <text x="340" y="360" font-size="44" stroke="none" fill="#2b2b2b">1,204</text>

    <rect x="600" y="265" width="260" height="150" rx="8"/>
    <text x="620" y="305" font-size="22" stroke="none" fill="#2b2b2b">Churn</text>
    <text x="620" y="360" font-size="44" stroke="none" fill="#2b2b2b">2.1%</text>

    <!-- chart placeholder -->
    <rect x="40" y="445" width="530" height="170" rx="8"/>
    <polyline points="70,580 160,520 250,555 340,470 430,500 520,440"/>
    <text x="60" y="475" font-size="20" stroke="none" fill="#2b2b2b">Sales over time</text>

    <!-- list / activity -->
    <rect x="600" y="445" width="260" height="170" rx="8"/>
    <line x1="620" y1="485" x2="840" y2="485"/>
    <line x1="620" y1="520" x2="840" y2="520"/>
    <line x1="620" y1="555" x2="840" y2="555"/>
    <line x1="620" y1="590" x2="780" y2="590"/>
  </g>
</svg>`;

export function demoSketchFile(): File {
  const blob = new Blob([DEMO_SKETCH_SVG], { type: 'image/svg+xml' });
  return new File([blob], 'demo-sketch.svg', { type: 'image/svg+xml' });
}
