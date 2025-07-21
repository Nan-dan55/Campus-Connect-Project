const express = require("express");
const router = express.Router();
const db = require("../config/db");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

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

// Create new event
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      maxParticipants,
      deadline,
      date,
      time,
      venue,
      image
    } = req.body;

    console.log('Received event data:', req.body);

    const requiredFields = ['title', 'description', 'maxParticipants', 'deadline', 'date', 'time', 'venue'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        fields: missingFields 
      });
    }

    const eventsRef = db.collection("events");
    const eventData = {
      title,
      description,
      maxParticipants: parseInt(maxParticipants),
      registeredParticipants: 0,
      deadline,
      date,
      time,
      venue,
      image: image || null, // Store the image URL
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Creating event with data:', eventData);

    const docRef = await eventsRef.add(eventData);
    res.status(201).json({ message: "Event created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    console.log('Fetching all events...');
    const eventsRef = db.collection("events");
    const snapshot = await eventsRef.orderBy("createdAt", "desc").get();
    
    const events = [];
    snapshot.forEach(doc => {
      const eventData = doc.data();
      // Convert Firestore Timestamp to ISO string for proper date handling
      const event = {
        id: doc.id,
        ...eventData,
        createdAt: eventData.createdAt?.toDate().toISOString(),
        deadline: eventData.deadline ? new Date(eventData.deadline).toISOString() : null,
        date: eventData.date ? new Date(eventData.date).toISOString() : null
      };
      events.push(event);
    });

    console.log('Sending events:', events);
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Join event
router.post("/:eventId/join", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Get event document
    const eventRef = db.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventData = eventDoc.data();

    // Check if event is full
    if (eventData.registeredParticipants >= eventData.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Check if registration deadline has passed
    const deadline = new Date(eventData.deadline);
    if (deadline < new Date()) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    // Check if user has already registered
    const registrationsRef = db.collection("event_registrations");
    const registrationQuery = await registrationsRef
      .where("eventId", "==", eventId)
      .where("userId", "==", userId)
      .get();

    if (!registrationQuery.empty) {
      return res.status(400).json({ message: "You have already registered for this event" });
    }

    // Start a transaction to update event and create registration
    const result = await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      const eventData = eventDoc.data();

      if (eventData.registeredParticipants >= eventData.maxParticipants) {
        throw new Error("Event is full");
      }

      // Update event registration count
      transaction.update(eventRef, {
        registeredParticipants: admin.firestore.FieldValue.increment(1)
      });

      // Create registration record
      const registrationRef = registrationsRef.doc();
      transaction.set(registrationRef, {
        eventId,
        userId,
        registeredAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return eventData.registeredParticipants + 1;
    });

    res.status(200).json({ 
      message: "Successfully registered for event",
      registeredParticipants: result
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ message: error.message || "Error joining event" });
  }
});

module.exports = router;