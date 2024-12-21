const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Composites a logo onto a base template with full control over:
 *   1) Logo width & height
 *   2) X & Y position
 *   3) Rotation angle
 * 
 * @param {Object} options
 * @param {string} options.templatePath - Path to the base template image (e.g., "base_images/template.jpg").
 * @param {string} options.outputPath   - Path where the final output image should be saved.
 * @param {string} options.logoPath     - Path to the logo image.
 * @param {number} options.logoWidth    - Desired logo width in pixels.
 * @param {number} options.logoHeight   - Desired logo height in pixels.
 * @param {number} options.positionX    - X offset (distance from the left edge) for placing the logo.
 * @param {number} options.positionY    - Y offset (distance from the top edge) for placing the logo.
 * @param {number} options.rotation     - Rotation angle in degrees (0–360).
 */
function placeAndTransformLogo({
  templatePath,
  outputPath,
  logoPath,
  logoWidth,
  logoHeight,
  positionX,
  positionY,
  rotation
}) {
  try {
    // 1. Resize the logo.
    const resizedLogo = 'tmp_resized.png';
    execSync(`convert "${logoPath}" -resize ${logoWidth}x${logoHeight} "${resizedLogo}"`, { stdio: 'inherit' });

    // 2. Rotate the logo if needed.
    const rotatedLogo = 'tmp_rotated.png';
    execSync(`convert "${resizedLogo}" -background none -rotate ${rotation} "${rotatedLogo}"`, { stdio: 'inherit' });

    // 3. Composite the transformed logo onto the template at position (positionX, positionY).
    //
    // The -geometry +X+Y flag sets the offset from top-left corner where the logo is placed.
    execSync(
      `convert "${templatePath}" "${rotatedLogo}" -geometry +${positionX}+${positionY} -compose over -composite "${outputPath}"`,
      { stdio: 'inherit' }
    );

    // 4. Clean up temporary files.
    fs.unlinkSync(resizedLogo);
    fs.unlinkSync(rotatedLogo);

    console.log(`Done! Image saved as ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage:
placeAndTransformLogo({
  templatePath: 'base_images/template.jpg',
  outputPath: 'final_output.png',
  logoPath: 'swatches/logo.png',
  logoWidth: 500,     // Width in px
  logoHeight: 500,    // Height in px
  positionX: 500,     // Offset from the left of the template
  positionY: 550,     // Offset from the top of the template
  rotation: -30        // Degrees to rotate the logo
});