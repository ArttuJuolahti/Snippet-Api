// 1. imports
const express = require('express'); // framework for building web applications
const mongoose = require('mongoose'); // ODM for MongoDB
const cors = require('cors'); // allows other domains to request
require('dotenv').config(); // load environment variables from .env file

// 2. app setup
const app = express();
const PORT = process.env.PORT || 3000;

// 3. middleware
app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse JSON requests

// 4. database connection
mongoose.connect(process.env.MONGODB_URI,)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
  
  // 5. Schema
const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true

  },
  description: String,
  tags: [String],
  created_at: {
    type: Date,
    default: Date.now
  }
});
const Snippet = mongoose.model('Snippet', snippetSchema);

// 6. routes
app.get('/', (req, res) => {
  res.send('Welcome to the Snippet API');
});

// get all snippets
// example: GET /api/snippets?lang=javascript&limit=5
app.get('/api/snippets', async (req, res) => {
  try {
    // check language query parameter
    const filter = {};
    if (req.query.lang) {
      filter.language = req.query.lang.toLowerCase();
    }

    //check limit query parameter
    const limit = parseInt(req.query.limit, 10) || 10;

    // find snippets from database matching the filter and limit
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
    // create a new snippet using data from request body
    const newSnippet = new Snippet(req.body);
    // save the snippet to the database
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
    // find snippet by id from request parameters 
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
    // find snippet by id and update with data from request body
    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, // return the updated document 
        
        runValidators: true // validate before update
      }
    );

    // if snippet not found, return 404
    if (!updatedSnippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    } 
    // return the updated snippet
    res.json(updatedSnippet);
  } catch (err) {
    console.error('Error updating snippet:', err);
    res.status(400).json({ error: 'Bad Request' });
  }
});

// delete a snippet by id
app.delete('/api/snippets/:id', async (req, res) => {
  try {
    // find snippet by id and delete  
    const deletedSnippet = await Snippet.findByIdAndDelete(req.params.id);
    // if snippet not found, return 404
    if (!deletedSnippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    } 
    // return success message
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
