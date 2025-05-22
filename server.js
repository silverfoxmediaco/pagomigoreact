// Basic Express server without complex routing
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the build folder
app.use(express.static(path.resolve(__dirname, 'build')));

// API test endpoint
app.get('/api/ping', function(req, res) {
  res.json({ message: 'API is working!' });
});

// Serve index.html without using * wildcard
app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});