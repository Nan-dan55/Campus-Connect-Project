// root/config/db.js
const dotenv = require('dotenv')
const admin = require('firebase-admin')

// load .env into process.env
dotenv.config()

// decode your base-64’d service account JSON
const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_KEY, 'base64').toString('utf8')
)

// initialize the Admin SDK exactly once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "scan-dbb9d.appspot.com" // <-- Replace with your actual bucket if different
    })
}

// grab the Firestore client
const db = admin.firestore()

module.exports = db
