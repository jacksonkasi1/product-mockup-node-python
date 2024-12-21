/**
 * main.js
 *
 * This is just an example entry point. It demonstrates how you might call
 * the createMaps function and then the generateMockup function in Node code.
 */

const path = require('path');
const { execSync } = require('child_process');

try {
  // 1) Create the map images
  execSync('node scripts/createMaps.js base_images/template.jpg base_images/mask.png', { stdio: 'inherit' });

  // 2) Generate final mockup from the newly created maps plus your artwork (logo.png)
  execSync('node scripts/generateMockup.js base_images/template.jpg base_images/mask.png swatches/logo.png maps/displacement_map.png maps/lighting_map.png maps/adjustment_map.jpg mockups/final_mockup.png', { stdio: 'inherit' });
  
  console.log('All processes completed successfully!');
} catch (err) {
  console.error('Error in main.js:', err.message);
}