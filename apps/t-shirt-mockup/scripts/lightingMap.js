/**
 * lightingMap.js
 *
 * Generates a lighting_map.png similar to the original lighting_map.sh.
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Create a lighting map from template & mask.
 * 
 * @param {string} template - Path to the base template.
 * @param {string} mask - Path to the mask image.
 * @param {string} normalizedTmp - Temporary path for the normalized template image.
 * @param {string} generateTmp - Another temporary path for intermediate output.
 * @param {string} lightingMap - Output lighting map path (PNG).
 */
function createLightingMap(template, mask, normalizedTmp, generateTmp, lightingMap) {
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

  // 2) convert $normalized_template_map_tmp -evaluate subtract $brightness_delta% -background grey50 -alpha remove -alpha off $generate_lighting_map_tmp
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

  // 3) convert $generate_lighting_map_tmp ( -clone 0 -fill grey50 -colorize 100 ) -compose lighten -composite $lighting_map
  cmd = [
    'convert',
    `"${generateTmp}"`,
    '\\(',
    '-clone 0',
    '-fill grey50',
    '-colorize 100',
    '\\)',
    '-compose lighten',
    '-composite',
    `"${lightingMap}"`
  ].join(' ');
  execSync(cmd, { stdio: 'inherit' });
}

if (require.main === module) {
  // Called directly: node lightingMap.js <template> <mask> <tmp1> <tmp2> <lightingMap>
  const [,, template, mask, normalizedTmp, generateTmp, lightingMap] = process.argv;
  if (!template || !mask || !normalizedTmp || !generateTmp || !lightingMap) {
    console.error('Usage: node lightingMap.js <template> <mask> <tmp1> <tmp2> <out>');
    process.exit(1);
  }
  createLightingMap(template, mask, normalizedTmp, generateTmp, lightingMap);
}

module.exports = { createLightingMap };