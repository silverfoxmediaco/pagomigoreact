// Express server that handles Render's directory structure
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// The build directory should be at the same level as package.json
// Based on the logs, we're in /opt/render/project/src, so build should be here
const buildPath = path.join(__dirname, 'build');

console.log('Server starting from:', __dirname);
console.log('Looking for build directory at:', buildPath);

// Check if build directory exists
if (fs.existsSync(buildPath)) {
  console.log('Build directory found');
  console.log('Build contents:', fs.readdirSync(buildPath));
} else {
  console.log('Build directory not found');
  console.log('Will create a simple response for now');
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files if build exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// API test endpoint
app.get('/api/ping', function(req, res) {
  res.json({ message: 'API is working!' });
});

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Setup Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(plaidConfig);

// Identity Verification token endpoint
app.post('/api/plaid/create-idv-link-token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'demo-user-123', // You can replace this with a real user ID
      },
      client_name: 'Pagomigo',
      language: 'en',
      country_codes: ['US'],
      products: ['identity_verification'],
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create IDV link token' });
  }
});


// Serve the React app or a fallback message
app.use(function(req, res) {
  const indexPath = path.join(buildPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback response when build directory doesn't exist
    res.status(200).send(`
      <html>
        <head><title>Build Issue</title></head>
        <body>
          <h1>Server is running but build files not found</h1>
          <p>Build directory expected at: ${buildPath}</p>
          <p>Current directory: ${__dirname}</p>
          <p>Directory contents: ${fs.readdirSync(__dirname).join(', ')}</p>
          <p><a href="/api/ping">Test API endpoint</a></p>
        </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});