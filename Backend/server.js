require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: ['https://campus-connect-project-beta.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.static(path.join(__dirname, "public")));

// Import route modules
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const noticeRoutes = require("./routes/notices");
const clubRoutes = require("./routes/clubs");
const notesRoutes = require("./routes/notes");

// Mount routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/notices", noticeRoutes);
app.use("/clubs", clubRoutes);
app.use("/notes", notesRoutes);

app.get("/", (req, res) => {
  console.log("Backend connected");
  res.send("Backend is connected");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});