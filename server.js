// 1. imports
const express = require('express');          // framework for building web applications
const mongoose = require('mongoose');        // ODM for MongoDB
const cors = require('cors');                // allows other domains to request
const bcrypt = require('bcrypt');            // password hashing
const jwt = require('jsonwebtoken');         // token creation & verification
require('dotenv').config();                  // load environment variables from .env file

// 2. app setup
const app = express();
const PORT = process.env.PORT || 3000;

// 3. middleware
app.use(cors());           // enable CORS for all routes
app.use(express.json());   // parse JSON requests

// 4. database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

/* ============================================
   5A. SNIPPET SCHEMA (YOUR ORIGINAL ONE)
============================================ */
const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
  },
  description: String,
  tags: [String],
  created_at: {
    type: Date,
    default: Date.now,
  },
});
const Snippet = mongoose.model('Snippet', snippetSchema);

/* ============================================
   5B. USER SCHEMA (FOR AUTH)
============================================ */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

/* ============================================
   5C. ITEM SCHEMA (FOR /api/items)
   Simple structure: title + createdAt
============================================ */
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Item = mongoose.model('Item', itemSchema);

/* ============================================
   6. AUTH MIDDLEWARE
   Reads token from x-auth-token header
============================================ */
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // not used further now, but available if needed
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

/* ============================================
   7. BASIC ROOT ROUTE
============================================ */
app.get('/', (req, res) => {
  res.send('Welcome to the Snippet API with Auth & Items');
});

/* ============================================
   8. AUTH ROUTES: REGISTER & LOGIN
============================================ */

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
    });

    await user.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in /api/register:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Error in /api/login:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ============================================
   9. ITEMS ROUTES (USED BY REACT useApi('/api/items'))
   All protected with auth middleware
============================================ */

// Get all items (protected)
app.get('/api/items', auth, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create new item (protected)
app.post('/api/items', auth, async (req, res) => {
  try {
    const newItem = new Item({ title: req.body.title });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(400).json({ message: 'Bad Request' });
  }
});

// Delete item (protected)
app.delete('/api/items/:id', auth, async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/* ============================================
   10. ORIGINAL SNIPPET ROUTES (UNCHANGED)
============================================ */

// get all snippets
// example: GET /api/snippets?lang=javascript&limit=5
app.get('/api/snippets', async (req, res) => {
  try {
    const filter = {};
    if (req.query.lang) {
      filter.language = req.query.lang.toLowerCase();
    }

    const limit = parseInt(req.query.limit, 10) || 10;

    const snippets = await Snippet.find(filter)
      .sort({ created_at: -1 })
      .limit(limit);

    res.json(snippets);
  } catch (err) {
    console.error('Error fetching snippets:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//create a new snippet
app.post('/api/snippets', async (req, res) => {
  try {
    const newSnippet = new Snippet(req.body);
    const savedSnippet = await newSnippet.save();
    res.status(201).json(savedSnippet);
  } catch (err) {
    console.error('Error creating snippet:', err);
    res.status(400).json({ error: 'Bad Request' });
  }
});

// get a specific snippet by id
app.get('/api/snippets/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (err) {
    console.error('Error fetching snippet:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// update a snippet by id
app.put('/api/snippets/:id', async (req, res) => {
  try {
    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // return the updated document
        runValidators: true, // validate before update
      }
    );

    if (!updatedSnippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(updatedSnippet);
  } catch (err) {
    console.error('Error updating snippet:', err);
    res.status(400).json({ error: 'Bad Request' });
  }
});

// delete a snippet by id
app.delete('/api/snippets/:id', async (req, res) => {
  try {
    const deletedSnippet = await Snippet.findByIdAndDelete(req.params.id);
    if (!deletedSnippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json({ message: 'Snippet deleted successfully' });
  } catch (err) {
    console.error('Error deleting snippet:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// start the server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
