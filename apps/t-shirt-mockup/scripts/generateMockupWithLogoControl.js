const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Helper to run shell commands with error handling.
 */
function runCommand(command) {
  execSync(command, { stdio: 'inherit' });
}

/**
 * Clean up temporary files if they exist.
 * @param {string[]} files
 */
function cleanup(files) {
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`[CLEANUP] Deleted: ${file}`);
    }
  });
}

/**
 * Generate a final mockup with:
 * 1. A logo placed/rotated/resized onto the template,
 * 2. Displacement, lighting, and adjustment maps,
 * 3. Compositing with mask.
 * 
 * @param {Object} opts
 * @param {string} opts.template - Path to the template (e.g. "base_images/template.jpg").
 * @param {string} opts.mask - Path to the mask (e.g. "base_images/mask.png").
 * @param {string} opts.logo - Path to the logo (e.g. "swatches/logo.png").
 * @param {number} opts.logoWidth - Desired logo width in pixels.
 * @param {number} opts.logoHeight - Desired logo height in pixels.
 * @param {number} opts.positionX - X offset for the logo placement.
 * @param {number} opts.positionY - Y offset for the logo placement.
 * @param {number} opts.rotation - Rotation angle (in degrees).
 * @param {string} opts.displacementMap - Path to the displacement map (e.g. "maps/displacement_map.png").
 * @param {string} opts.lightingMap - Path to the lighting map (e.g. "maps/lighting_map.png").
 * @param {string} opts.adjustmentMap - Path to the adjustment map (e.g. "maps/adjustment_map.jpg").
 * @param {string} opts.output - Output mockup image path (e.g. "mockups/final_mockup_with_logo_control.png").
 */
function generateMockupWithLogoControl(opts) {
  const {
    template,
    mask,
    logo,
    logoWidth,
    logoHeight,
    positionX,
    positionY,
    rotation,
    displacementMap,
    lightingMap,
    adjustmentMap,
    output,
  } = opts;

  fs.mkdirSync('mpcs', { recursive: true });
  fs.mkdirSync(path.dirname(output), { recursive: true });

  // Intermediate files we’ll clean up later
  const tmpLogoResized = path.join('mpcs', 'logo_resized.png');
  const tmpLogoRotated = path.join('mpcs', 'logo_rotated.png');
  const tmpComposite = path.join('mpcs', 'composite.png');

  try {
    // 1) Resize the logo
    runCommand(
      `convert "${logo}" -resize ${logoWidth}x${logoHeight} "${tmpLogoResized}"`
    );

    // 2) Rotate the logo
    runCommand(
      `convert "${tmpLogoResized}" -background none -rotate ${rotation} "${tmpLogoRotated}"`
    );

    // 3) Composite the transformed logo onto the template in a temporary image
    //    Just to embed the logo at desired position, ignoring maps for now
    runCommand(
      `convert "${template}" "${tmpLogoRotated}" -geometry +${positionX}+${positionY} -compose over -composite "${tmpComposite}"`
    );

    // 4) Apply the displacement map
    //    (A standard technique: -compose displace with 20x20 displacement)
    runCommand(
      `convert "${tmpComposite}" "${displacementMap}" -compose displace -set option:compose:args 20x20 -composite "${tmpComposite}"`
    );

    // 5) Apply the lighting map
    //    We'll use "hardlight" by default, consistent with your prior script
    runCommand(
      `convert "${tmpComposite}" \\( -clone 0 "${lightingMap}" -compose overlay -composite \\) +swap -compose CopyOpacity -composite "${tmpComposite}"`
    );

    // 6) Apply the adjustment map
    runCommand(
      `convert "${tmpComposite}" \\( -clone 0 "${adjustmentMap}" -compose multiply -composite \\) +swap -compose CopyOpacity -composite "${tmpComposite}"`
    );

    // 7) Finally, merge with the mask & resize to desired final size
    //    (Adjust or remove -resize if you don’t want to change final dimensions)
    runCommand(
      `convert "${template}" "${tmpComposite}" "${mask}" -compose over -composite -resize 800 "${output}"`
    );

    console.log(`Mockup generated successfully at: ${output}`);
  } catch (error) {
    console.error('[Error generating mockup with logo control]', error.message);
  } finally {
    cleanup([tmpLogoResized, tmpLogoRotated, tmpComposite]);
  }
}

// Example usage when run from the CLI:
// node generateMockupWithLogoControl.js base_images/template.jpg base_images/mask.png swatches/logo.png ...
if (require.main === module) {
  const [,, template, mask, logo, logoWidth, logoHeight, positionX, positionY, rotation, displacement, lighting, adjustment, out] = process.argv;
  if (!template || !mask || !logo || !logoWidth || !logoHeight || !positionX || !positionY || !rotation || !displacement || !lighting || !adjustment || !out) {
    console.error(`
Usage:
  node generateMockupWithLogoControl.js <template> <mask> <logo> <logoWidth> <logoHeight> <posX> <posY> <rotation> <displacementMap> <lightingMap> <adjustmentMap> <output>

Example:
  node generateMockupWithLogoControl.js base_images/template.jpg base_images/mask.png swatches/logo.png 150 150 120 220 25 maps/displacement_map.png maps/lighting_map.png maps/adjustment_map.jpg mockups/final_mockup_with_logo_control.png
`);
    process.exit(1);
  }

  generateMockupWithLogoControl({
    template,
    mask,
    logo,
    logoWidth: parseInt(logoWidth, 10),
    logoHeight: parseInt(logoHeight, 10),
    positionX: parseInt(positionX, 10),
    positionY: parseInt(positionY, 10),
    rotation: parseInt(rotation, 10),
    displacementMap: displacement,
    lightingMap: lighting,
    adjustmentMap: adjustment,
    output: out,
  });
}

module.exports = { generateMockupWithLogoControl };