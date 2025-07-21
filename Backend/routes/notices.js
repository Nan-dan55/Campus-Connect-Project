const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Get the Firestore instance
const db = admin.firestore();

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request object

    // Verify if user is admin
    const adminsRef = db.collection("admins");
    const adminDoc = await adminsRef.doc(req.user.id).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Create new notice
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      importance,
      deadline
    } = req.body;

    console.log('Received notice data:', req.body);

    // Validate required fields
    const requiredFields = ['title', 'description', 'importance', 'deadline'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        fields: missingFields 
      });
    }

    const noticesRef = db.collection("notices");
    const noticeData = {
      title,
      description,
      importance,
      deadline,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Creating notice with data:', noticeData);

    const docRef = await noticesRef.add(noticeData);
    res.status(201).json({ message: "Notice created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Error creating notice" });
  }
});

// Get all notices
router.get("/", async (req, res) => {
  try {
    console.log('Fetching all notices...');
    const noticesRef = db.collection("notices");
    const snapshot = await noticesRef.orderBy("createdAt", "desc").get();
    
    const notices = [];
    snapshot.forEach(doc => {
      const noticeData = doc.data();
      // Convert Firestore Timestamp to ISO string for proper date handling
      const notice = {
        id: doc.id,
        title: noticeData.title,
        content: noticeData.content,
        description: noticeData.description,
        importance: noticeData.importance || 'medium',
        author: noticeData.author,
        createdAt: noticeData.createdAt?.toDate().toISOString(),
        deadline: noticeData.deadline ? new Date(noticeData.deadline).toISOString() : null
      };
      notices.push(notice);
    });

    console.log('Sending notices:', notices);
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Error fetching notices" });
  }
});

module.exports = router;