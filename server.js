// ── Import tools we installed ──────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ─────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Connect to MongoDB ─────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
  })
  .catch((err) => {
    console.log('❌ MongoDB Error:', err);
  });

// ── Message Schema ─────────────────────────────────
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// ── POST: Save contact form data ───────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Please fill all required fields'
      });
    }

    const newMessage = new Message({
      name,
      email,
      subject,
      message
    });

    await newMessage.save();

    console.log('📩 New message from:', name);

    res.status(200).json({
      success: true,
      message: 'Message saved successfully!'
    });

  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      error: 'Something went wrong'
    });
  }
});

// ── GET: Fetch all messages ─────────────────────────
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching messages'
    });
  }
});

// ── Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});