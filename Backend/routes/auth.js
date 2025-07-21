const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const admin = require("firebase-admin");
require("dotenv").config();

// Registration endpoint - only requires email, password, and role
router.post("/register", async (req, res) => {
  const { email, password, role, adminCode } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Check if email exists
    const usersRef = db.collection("users");
    const adminsRef = db.collection("admins");
    
    const [userSnapshot, adminSnapshot] = await Promise.all([
      usersRef.where("email", "==", email).limit(1).get(),
      adminsRef.where("email", "==", email).limit(1).get()
    ]);

    if (!userSnapshot.empty || !adminSnapshot.empty) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate Admin Code for admin registration
    if (role === "admin") {
      if (!adminCode) {
        return res.status(400).json({ message: "Admin code is required" });
      }
      
      const codesRef = db.collection("admin_codes");
      const codeSnapshot = await codesRef.where("code", "==", adminCode).limit(1).get();
      
      if (codeSnapshot.empty) {
        return res.status(400).json({ message: "Invalid admin code" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let collectionRef, data;
    if (role === "admin") {
      collectionRef = adminsRef;
      data = {
        email,
        password: hashedPassword,
        phone: null,        // Initialize as null
        admin_name: null,   // Initialize as null
        designation: null,  // Initialize as null
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
    } else {
      collectionRef = usersRef;
      data = {
        email,
        password: hashedPassword,
        phone: null,       // Initialize as null
        user_name: null,   // Initialize as null
        city: null,        // Initialize as null
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
    }

    // Add document to Firestore
    const docRef = await collectionRef.add(data);
    res.status(201).json({ message: "User registered successfully", id: docRef.id });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login endpoint remains unchanged
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check both collections for the email
    const usersRef = db.collection("users");
    const adminsRef = db.collection("admins");
    
    const [userSnapshot, adminSnapshot] = await Promise.all([
      usersRef.where("email", "==", email).limit(1).get(),
      adminsRef.where("email", "==", email).limit(1).get()
    ]);

    let userData = null;
    let isAdmin = false;
    
    if (!userSnapshot.empty) {
      userData = userSnapshot.docs[0].data();
      userData.id = userSnapshot.docs[0].id;
    } else if (!adminSnapshot.empty) {
      userData = adminSnapshot.docs[0].data();
      userData.id = adminSnapshot.docs[0].id;
      isAdmin = true;
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign({
      id: userData.id,
      email: userData.email,
      role: isAdmin ? "yes" : "no",
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.status(200).json({ token, role: isAdmin ? "yes" : "no", id: userData.id });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;