const multer = require('multer');
const path = require('path');

// Set up storage for multer
const storage = multer.memoryStorage(); // Store the file in memory

// Create multer instance with defined storage
const upload = multer({ storage: storage });

module.exports = upload; // Export the upload instance
