// Basic Express server without complex routing
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const projectRoot = process.cwd();
const buildPath = path.join(projectRoot, 'build');

console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Project root:', projectRoot);
console.log('Build path:', buildPath);

console.log('Current directory contents:', fs.readdirSync(projectRoot));
if (fs.existsSync(buildPath)) {
  console.log('Build directory found');
  console.log('Build contents:', fs.readdirSync(buildPath));
} else {
  console.log('Build directory not found at:', buildPath);
}
// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the build folder
app.use(express.static(buildPath));

// API test endpoint
app.get('/api/ping', function(req, res) {
  res.json({ message: 'API is working!' });
});

// Serve the React app for all other routes
app.use(function(req, res) {
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Attempting to serve:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`Build files not found. Expected at: ${indexPath}`);
  }
});

// Start the server
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});