const sharp = require('sharp');
const path = require('path');

const inputPath = "c:\\Users\\chadn\\CodingProjects\\seasaba-web\\public\\images\\Saba - 2025 - Candice Landau - Underwater Photography-056.jpg";
const outputPath = "c:\\Users\\chadn\\CodingProjects\\seasaba-web\\public\\images\\optimized\\candice-landau-saba.webp";

sharp(inputPath)
  .webp({ quality: 80 })
  .toFile(outputPath)
  .then(() => console.log('Optimized:', outputPath))
  .catch(err => console.error('Error:', err));
