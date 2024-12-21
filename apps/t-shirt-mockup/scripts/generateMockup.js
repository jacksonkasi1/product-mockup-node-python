/**
 * generateMockup.js
 *
 * Replaces generate_mockup.sh. Composites an artwork (logo or any image) onto
 * a template using a displacement map, lighting map, and adjustment map, then
 * merges with a mask to produce a final output.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function execCommand(command) {
  execSync(command, { stdio: 'inherit' });
}

/**
 * Clean up temp files if they exist.
 * @param {string[]} files
 */
function cleanup(files) {
  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`[CLEANUP] Deleted: ${file}`);
    }
  });
}

/**
 * Generate mockup with the specified images and output path.
 * 
 * @param {Object} params
 * @param {string} params.template      - The template image path
 * @param {string} params.mask          - The mask image path
 * @param {string} params.artwork       - The artwork or logo image path
 * @param {string} params.displacement  - Displacement map path
 * @param {string} params.lighting      - Lighting map path
 * @param {string} params.adjustment    - Adjustment map path
 * @param {string} params.out           - Output image path
 */
function generateMockup(params) {
  const {
    template,
    mask,
    artwork,
    displacement,
    lighting,
    adjustment,
    out
  } = params;

  const tmp = path.join('mpcs', 'mockup.mpc');
  fs.mkdirSync('mpcs', { recursive: true });
  fs.mkdirSync(path.dirname(out), { recursive: true });

  try {
    // 1) Add border to the artwork
    execCommand(`convert "${artwork}" -bordercolor transparent -border 1 "${tmp}"`);

    // 2) Optional: Perspective transform (comment out if not needed).
    //    Reproduce the example from generate_mockup.sh. Here we keep it as is.
    const coords = '0,0,100,0,0,3000,100,4000,1500,3000,1700,4000,1500,0,1700,0';
    execCommand([
      'convert',
      `"${template}"`,
      '-alpha transparent',
      '\\(',
      `"${tmp}"`,
      `+distort perspective "${coords}"`,
      '\\)',
      '-background transparent',
      '-layers merge',
      '+repage',
      `"${tmp}"`
    ].join(' '));

    // 3) Set background color (transparent)
    execCommand(`convert "${tmp}" -background transparent -alpha remove "${tmp}"`);

    // 4) Add displacement map
    execCommand([
      'convert',
      `"${tmp}"`,
      `"${displacement}"`,
      '-compose displace',
      '-set option:compose:args 20x20',
      '-composite',
      `"${tmp}"`
    ].join(' '));

    // 5) Add highlights
    //    For example using hardlight
    execCommand([
      'convert',
      `"${tmp}"`,
      '\\(',
      '-clone 0',
      `"${lighting}"`,
      '-compose hardlight',
      '-composite',
      '\\)',
      '+swap',
      '-compose CopyOpacity',
      '-composite',
      `"${tmp}"`
    ].join(' '));

    // 6) Adjust colors
    execCommand([
      'convert',
      `"${tmp}"`,
      '\\(',
      '-clone 0',
      `"${adjustment}"`,
      '-compose multiply',
      '-composite',
      '\\)',
      '+swap',
      '-compose CopyOpacity',
      '-composite',
      `"${tmp}"`
    ].join(' '));

    // 7) Compose artwork onto final template w/ mask
    execCommand([
      'convert',
      `"${template}"`,
      `"${tmp}"`,
      `"${mask}"`,
      '-compose over',
      '-composite',
      '-resize 800',
      `"${out}"`
    ].join(' '));

    console.log(`Mockup generated: ${out}`);
  } catch (err) {
    console.error('Mockup generation failed:', err.message);
  } finally {
    cleanup([tmp]);
  }
}

/**
 * CLI interface
 */
function main() {
  const [,, template, mask, artwork, displacement, lighting, adjustment, out] = process.argv;
  if (!template || !mask || !artwork || !displacement || !lighting || !adjustment || !out) {
    console.error(`
Usage: node generateMockup.js <template> <mask> <artwork> <displacementMap> <lightingMap> <adjustmentMap> <outFile>
Example:
node generateMockup.js base_images/template.jpg base_images/mask.png swatches/logo.png maps/displacement_map.png maps/lighting_map.png maps/adjustment_map.jpg mockups/final_mockup.png
`);
    process.exit(1);
  }

  generateMockup({
    template,
    mask,
    artwork,
    displacement,
    lighting,
    adjustment,
    out
  });
}

if (require.main === module) {
  main();
}

module.exports = { generateMockup };