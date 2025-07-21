const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /notes - Upload a note (link only)
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Received note upload:', req.body); // Debug log
    const { title, link, branch, semester } = req.body;
    const uploaderId = req.user.id;
    const uploaderEmail = req.user.email;
    if (!title || !link || !branch || !semester) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Save note metadata to Firestore
    const noteData = {
      title,
      link,
      branch,
      semester,
      uploaderId,
      uploaderEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('notes').add(noteData);
    res.status(201).json({ message: 'Note uploaded', id: docRef.id });
  } catch (error) {
    console.error('Error uploading note:', error);
    res.status(500).json({ message: 'Error uploading note' });
  }
});

// GET /notes - List notes (optionally filter by branch/semester)
router.get('/', async (req, res) => {
  try {
    let query = db.collection('notes');
    if (req.query.branch) {
      query = query.where('branch', '==', req.query.branch);
    }
    if (req.query.semester) {
      query = query.where('semester', '==', req.query.semester);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const notes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        title: data.title,
        link: data.link, // Ensure link is included
        branch: data.branch,
        semester: data.semester,
        uploaderEmail: data.uploaderEmail,
        createdAt: data.createdAt?.toDate().toISOString()
      });
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// GET /notes/:id - Get note details
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('notes').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
});

module.exports = router; 