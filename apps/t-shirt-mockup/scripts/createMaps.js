/**
 * createMaps.js
 *
 * Replaces create_maps.sh. Generates lighting_map, displacement_map, and adjustment_map
 * using the three separate Node scripts for each map.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function execCommand(command) {
  execSync(command, { stdio: 'inherit' });
}

function main() {
  const [,, template, mask] = process.argv;
  if (!template || !mask) {
    console.error('Usage: node createMaps.js <template> <mask>');
    process.exit(1);
  }

  // Make sure directories exist
  fs.mkdirSync('mpcs', { recursive: true });
  fs.mkdirSync('maps', { recursive: true });

  // lighting_map
  execCommand(`node scripts/lightingMap.js "${template}" "${mask}" "mpcs/normalized_template_map_tmp.mpc" "mpcs/generate_lighting_map_tmp.mpc" "maps/lighting_map.png"`);

  // displacement_map
  execCommand(`node scripts/displacementMap.js "${template}" "${mask}" "mpcs/normalized_template_map_tmp.mpc" "mpcs/generate_displacement_map_tmp.mpc" "maps/displacement_map.png"`);

  // adjustment_map
  execCommand(`node scripts/adjustmentMap.js "${template}" "${mask}" "maps/adjustment_map.jpg"`);
}

if (require.main === module) {
  main();
}

module.exports = { main };