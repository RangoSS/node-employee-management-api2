const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

// Import the credentialsSDK.json from the config folder
const serviceAccount = require('../credentialsSDK.json'); // Adjust this path if necessary

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: serviceAccount.project_id + ".appspot.com",
    });
}

// Initialize Firestore and Storage
const db = admin.firestore();
const storage = new Storage({ keyFilename: './credentialsSDK.json' }); // Use the credentials file
const bucket = storage.bucket(serviceAccount.project_id + ".appspot.com");

// Export Firestore db and Storage bucket
module.exports = { db, bucket };
