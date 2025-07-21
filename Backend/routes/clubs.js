const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

// Multer setup for image upload (store in memory for now)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const adminsRef = db.collection('admins');
    const adminDoc = await adminsRef.doc(req.user.id).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

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

// POST /clubs - Admin creates a club
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, lead } = req.body;
    if (!name || !description || !lead) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // For now, just store image as a placeholder string
    let imageUrl = '';
    if (req.file) {
      // TODO: Upload to Firebase Storage and get URL
      imageUrl = `uploads/${req.file.originalname}`;
    }
    const clubData = {
      name,
      description,
      lead,
      image: imageUrl,
      members: [],
      pendingRequests: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.id
    };
    const docRef = await db.collection('clubs').add(clubData);
    res.status(201).json({ message: 'Club created successfully', id: docRef.id });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Error creating club' });
  }
});

// GET /clubs - Get all clubs
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('clubs').orderBy('createdAt', 'desc').get();
    const clubs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      clubs.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        lead: data.lead,
        image: data.image,
        members: data.members || [],
        pendingRequests: data.pendingRequests || []
      });
    });
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Error fetching clubs' });
  }
});

// POST /clubs/:clubId/join - Student requests to join a club
router.post('/:clubId/join', verifyToken, async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const userId = req.user.id;
    const name = req.body.name;
    const email = req.user.email;
    if (!userId || !name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
      return res.status(404).json({ message: 'Club not found' });
    }
    const clubData = clubDoc.data();
    // Check if already a member
    if ((clubData.members || []).includes(userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    // Remove any previous pending request for this user
    const filteredPending = (clubData.pendingRequests || []).filter(r => r.userId !== userId);
    // Add the new request object
    filteredPending.push({ userId, name, email });
    await clubRef.update({
      pendingRequests: filteredPending
    });
    res.status(200).json({ message: 'Join request sent' });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ message: 'Error joining club' });
  }
});

// POST /clubs/:clubId/leave - Student leaves a club
router.post('/:clubId/leave', verifyToken, async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const userId = req.user.id;
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
      return res.status(404).json({ message: 'Club not found' });
    }
    const clubData = clubDoc.data();
    // Remove from members
    await clubRef.update({
      members: admin.firestore.FieldValue.arrayRemove(userId),
      // Remove from pendingRequests by filtering and setting
      pendingRequests: (clubData.pendingRequests || []).filter(r => r.userId !== userId)
    });
    res.status(200).json({ message: 'Left club' });
  } catch (error) {
    console.error('Error leaving club:', error);
    res.status(500).json({ message: 'Error leaving club' });
  }
});

// GET /clubs/pending-requests - Admin: get all clubs with pending requests
router.get('/pending-requests', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('clubs').get();
    const clubs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.pendingRequests && data.pendingRequests.length > 0) {
        clubs.push({
          id: doc.id,
          name: data.name,
          pendingRequests: data.pendingRequests, // now array of {userId, name, email}
          members: data.members || [],
          lead: data.lead,
          description: data.description,
          image: data.image
        });
      }
    });
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching pending club requests:', error);
    res.status(500).json({ message: 'Error fetching pending club requests' });
  }
});

// POST /clubs/:clubId/approve - Admin: approve a join request
router.post('/:clubId/approve', verifyAdmin, async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) return res.status(404).json({ message: 'Club not found' });
    const clubData = clubDoc.data();
    // Remove from pendingRequests and add to members
    const updatedPending = (clubData.pendingRequests || []).filter(r => r.userId !== userId);
    await clubRef.update({
      pendingRequests: updatedPending,
      members: admin.firestore.FieldValue.arrayUnion(userId)
    });
    res.status(200).json({ message: 'Request approved' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Error approving request' });
  }
});

// POST /clubs/:clubId/reject - Admin: reject a join request
router.post('/:clubId/reject', verifyAdmin, async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const clubRef = db.collection('clubs').doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) return res.status(404).json({ message: 'Club not found' });
    const clubData = clubDoc.data();
    // Remove from pendingRequests
    const updatedPending = (clubData.pendingRequests || []).filter(r => r.userId !== userId);
    await clubRef.update({
      pendingRequests: updatedPending
    });
    res.status(200).json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Error rejecting request' });
  }
});

module.exports = router; 