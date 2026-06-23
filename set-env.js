const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Write public/config.json
const configData = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  apiUrl: process.env.API_URL || 'https://backend-farmease-1.onrender.com',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || ''
};

const configPath = path.join(__dirname, './public/config.json');
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}
fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
console.log(`Config JSON file generated at ${configPath}`);
