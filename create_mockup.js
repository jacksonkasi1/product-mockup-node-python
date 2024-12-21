const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Run a shell command with improved error handling.
 * @param {string} command
 * @returns {Promise<void>}
 */
function execShellCommand(command) {
  return new Promise((resolve, reject) => {
    try {
      execSync(command, { stdio: 'inherit' });
      resolve();
    } catch (error) {
      console.error(`[ERROR] Command failed: ${command}\n`, error.message);
      reject(error);
    }
  });
}

/**
 * Perform cleanup of temporary files.
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
 * Mockup generation functions
 */
async function addBorder(params) {
  const { artwork, out } = params;
  await execShellCommand(`convert "${artwork}" -bordercolor transparent -border 1 "${out}"`);
}

async function perspectiveTransform(params) {
  const { template, artwork, out } = params;
  const coordinates = [0, 0, 100, 0, 0, 3000, 100, 4000, 1500, 3000, 1700, 4000, 1500, 0, 1700, 0].join(',');
  const transform = `convert "${template}" -alpha transparent \\( "${artwork}" +distort perspective "${coordinates}" \\) -background transparent -layers merge +repage "${out}"`;
  await execShellCommand(transform);
}

async function setBackgroundColor(params) {
  const { artwork, color = 'transparent', out } = params;
  await execShellCommand(`convert "${artwork}" -background "${color}" -alpha remove "${out}"`);
}

async function addDisplacement(params) {
  const { artwork, displacementMap, out, dx = 20, dy = 20 } = params;
  await execShellCommand(`convert "${artwork}" "${displacementMap}" -compose displace -set option:compose:args ${dx}x${dy} -composite "${out}"`);
}

async function addHighlights(params) {
  const { artwork, lightingMap, out, mode = 'hardlight' } = params;
  await execShellCommand(`convert "${artwork}" \\( -clone 0 "${lightingMap}" -compose ${mode} -composite \\) +swap -compose CopyOpacity -composite "${out}"`);
}

async function adjustColors(params) {
  const { artwork, adjustmentMap, out } = params;
  await execShellCommand(`convert "${artwork}" \\( -clone 0 "${adjustmentMap}" -compose multiply -composite \\) +swap -compose CopyOpacity -composite "${out}"`);
}

async function composeArtwork(params) {
  const { template, artwork, mask, out, mode = 'over' } = params;
  await execShellCommand(`convert "${template}" "${artwork}" "${mask}" -compose ${mode} -composite "${out}"`);
}

async function generateMockup(params) {
  const baseDir = path.resolve(__dirname);
  const { artwork, template, displacementMap, lightingMap, adjustmentMap, mask, out } = params;

  // Ensure output directory exists
  const outputDir = path.dirname(path.join(baseDir, out));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const tmp = path.join(os.tmpdir(), `${Math.random().toString(36).substring(7)}.mpc`);
  const tempFiles = [tmp];

  try {
    await addBorder({ artwork: path.join(baseDir, artwork), out: tmp });
    await perspectiveTransform({ template: path.join(baseDir, template), artwork: tmp, out: tmp });
    await addDisplacement({ artwork: tmp, displacementMap: path.join(baseDir, displacementMap), out: tmp });
    await addHighlights({ artwork: tmp, lightingMap: path.join(baseDir, lightingMap), out: tmp });
    await adjustColors({ artwork: tmp, adjustmentMap: path.join(baseDir, adjustmentMap), out: tmp });
    await composeArtwork({
      template: path.join(baseDir, template),
      artwork: tmp,
      mask: path.join(baseDir, mask),
      out: path.join(baseDir, out),
    });
    console.log(`Mockup generated: ${path.join(baseDir, out)}`);
  } catch (err) {
    console.error('Mockup generation failed:', err.message);
  } finally {
    cleanup(tempFiles);
  }
}


/**
 * Entry point for mockup generation
 */
const mockups = {
  out: 'mockups/final_mockup.png',  // Output file
  artwork: 'swatches/art24.png',   // Swatch file
  template: 'base_images/template.jpg', // Template file
  mask: 'base_images/mask.png',        // Mask file
  displacementMap: 'maps/displacement_map.png', // Displacement map
  lightingMap: 'maps/lighting_map.png',    // Lighting map
  adjustmentMap: 'maps/adjustment_map.jpg', // Adjustment map
};

generateMockup(mockups)
  .then(() => console.log('Mockup generation successful.'))
  .catch((error) => console.error('Mockup generation failed:', error));

