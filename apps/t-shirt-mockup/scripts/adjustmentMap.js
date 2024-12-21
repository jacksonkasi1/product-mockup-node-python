/**
 * adjustmentMap.js
 * 
 * This script replicates the functionality of the original adjustment_map.sh.
 * It uses a template and a mask to generate an "adjustment_map.jpg" in the maps/ folder.
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Generate an adjustment map image.
 * @param {string} template - Path to base template (JPG/PNG).
 * @param {string} mask - Path to the mask PNG.
 * @param {string} out - Where to write the adjustment map.
 */
function createAdjustmentMap(template, mask, out) {
  // This reproduces the shell command:
  // convert $template ( -clone 0 -fill "#f1f1f1" -colorize 100 ) $mask -compose DivideSrc -composite $out
  const cmd = [
    'convert',
    `"${template}"`,
    '\\(',
    '-clone 0',
    '-fill "#f1f1f1"',
    '-colorize 100',
    '\\)',
    `"${mask}"`,
    '-compose DivideSrc',
    '-composite',
    `"${out}"`
  ].join(' ');
  execSync(cmd, { stdio: 'inherit' });
}

if (require.main === module) {
  // If called directly via node adjustmentMap.js template mask ...
  const [,, template, mask, out] = process.argv;
  if (!template || !mask || !out) {
    console.error('Usage: node adjustmentMap.js <template> <mask> <out>');
    process.exit(1);
  }
  createAdjustmentMap(template, mask, out);
}

module.exports = { createAdjustmentMap };