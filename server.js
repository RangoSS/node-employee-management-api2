const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const employeeRoutes = require('./routes/employeeRoutes');
const path = require('path'); // Make sure to import 'path'
const { db, bucket } = require('./config/firebaseConfig'); // Import Firestore db and Storage bucket

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or default to 5001

// Middleware
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Routes
app.use('/api', employeeRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export Firestore db and Storage bucket for use in routes if needed
module.exports = { db, bucket };
