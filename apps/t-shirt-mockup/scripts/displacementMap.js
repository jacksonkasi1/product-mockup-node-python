/**
 * displacementMap.js
 *
 * Replicates the functionality of displacement_map.sh using Node.js.
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Generate a displacement map image from a template and a mask,
 * similar to the original shell script.
 * 
 * @param {string} template - Path to the template image.
 * @param {string} mask - Path to the mask image.
 * @param {string} normalizedTmp - Path to a temporary image file (MPC or PNG).
 * @param {string} generateTmp - Another temporary output path.
 * @param {string} displacementMap - Final displacement map output path.
 */
function createDisplacementMap(template, mask, normalizedTmp, generateTmp, displacementMap) {
  // 1) convert $template $mask -alpha off -colorspace gray -compose CopyOpacity -composite $normalized_template_map_tmp
  let cmd = [
    'convert',
    `"${template}"`,
    `"${mask}"`,
    '-alpha off',
    '-colorspace gray',
    '-compose CopyOpacity',
    '-composite',
    `"${normalizedTmp}"`
  ].join(' ');
  execSync(cmd, { stdio: 'inherit' });

  // brightness_delta=30
  const brightnessDelta = 30;

  // 2) convert $normalized_template_map_tmp -evaluate subtract 30% -background grey50 -alpha remove -alpha off $generate_displacement_map_tmp
  cmd = [
    'convert',
    `"${normalizedTmp}"`,
    `-evaluate subtract ${brightnessDelta}%`,
    '-background grey50',
    '-alpha remove',
    '-alpha off',
    `"${generateTmp}"`
  ].join(' ');
  execSync(cmd, { stdio: 'inherit' });

  // 3) convert $generate_displacement_map_tmp -blur 0x10 $displacement_map
  cmd = [
    'convert',
    `"${generateTmp}"`,
    '-blur 0x10',
    `"${displacementMap}"`
  ].join(' ');
  execSync(cmd, { stdio: 'inherit' });
}

if (require.main === module) {
  // Called directly: node displacementMap.js <template> <mask> <normalizedTmp> <generateTmp> <displacementMap>
  const [,, template, mask, normalizedTmp, generateTmp, displacementMap] = process.argv;
  if (!template || !mask || !normalizedTmp || !generateTmp || !displacementMap) {
    console.error('Usage: node displacementMap.js <template> <mask> <tmp1> <tmp2> <out>');
    process.exit(1);
  }
  createDisplacementMap(template, mask, normalizedTmp, generateTmp, displacementMap);
}

module.exports = { createDisplacementMap };