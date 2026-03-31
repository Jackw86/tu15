#!/usr/bin/env node
// run: node generate-icons.js
// Generates PWA icons using canvas (requires: npm install canvas)
// If you don't want to run this, use any 192x192 and 512x512 PNG
// with your logo and place them in /icons/

const fs   = require('fs');
const path = require('path');

// Create icons directory
const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

try {
  const { createCanvas } = require('canvas');

  function makeIcon(size, outPath) {
    const canvas = createCanvas(size, size);
    const ctx    = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0a0a0f');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, size, size, size * 0.22);
    ctx.fill();

    // Glow
    const glow = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    glow.addColorStop(0, '#3b82f640');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // Lightning bolt emoji
    ctx.font      = `${size * 0.52}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', size / 2, size / 2 + size * 0.04);

    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log(`✅ Generated ${outPath}`);
  }

  makeIcon(192, path.join(dir, 'icon-192.png'));
  makeIcon(512, path.join(dir, 'icon-512.png'));

} catch (e) {
  // canvas not installed — write SVG fallback instead
  console.log('canvas not installed — writing SVG placeholder icons');

  const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="42" fill="url(#g)"/>
  <circle cx="96" cy="96" r="60" fill="#3b82f620"/>
  <text x="96" y="112" font-size="80" text-anchor="middle" font-family="serif">⚡</text>
</svg>`;

  const svg512 = svg192.replace(/192/g,'512').replace(/42/g,'112').replace(/96/g,'256').replace(/60/g,'160').replace(/80/g,'220').replace(/112/g,'295');

  fs.writeFileSync(path.join(dir,'icon-192.svg'), svg192);
  fs.writeFileSync(path.join(dir,'icon-512.svg'), svg512);
  console.log('✅ Written SVG fallbacks — convert to PNG before submitting to app stores');
  console.log('   Use: https://svgtopng.com or https://cloudconvert.com/svg-to-png');
}
