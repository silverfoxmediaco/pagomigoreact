// Simple Express server to serve the React app
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')));

// API test endpoint
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Serve the React app for all other routes (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});