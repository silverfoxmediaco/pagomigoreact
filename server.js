// Express server that handles Render's directory structure
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const plaidRoutes = require('./routes/plaidRoutes');

// ADD TWILIO
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const app = express();
const PORT = process.env.PORT || 5002;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    sparse: true, // Allows multiple null values (users can add email later)
    trim: true,
    lowercase: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  plaidAccounts: [{
    accountId: String,
    institutionName: String,
    accountType: String,
    linkedAt: { type: Date, default: Date.now }
  }],
  personaVerified: {
    type: Boolean,
    default: false
  },
  personaInquiryId: String,
  unitCustomerId: String,
  unitCustomerToken: String,
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' }
    },
    ssn: String // Encrypted in production
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

const User = mongoose.model('User', UserSchema);

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
app.use(express.urlencoded({ extended: true }));
app.use('/api/plaid', plaidRoutes);

// JWT Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// TWILIO VERIFY ENDPOINTS
app.post('/api/sms/send-verification', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    const verification = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });
    
    console.log('Verification sent:', verification.sid);
    
    res.json({ 
      success: true, 
      status: verification.status,
      sid: verification.sid
    });
    
  } catch (error) {
    console.error('SMS Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/sms/verify-code', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });
    
    console.log(`Verification check: ${verificationCheck.status}`);
    
    res.json({ 
      success: true, 
      verified: verificationCheck.status === 'approved',
      status: verificationCheck.status
    });
    
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// USER ACCOUNT CREATION (PRODUCTION READY)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, username, password, phoneVerified } = req.body;
    
    // Validate required fields
    if (!name || !phone || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { phone: phone }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username.toLowerCase() 
          ? 'Username already exists' 
          : 'Phone number already registered'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = new User({
      name: name.trim(),
      phone: phone.trim(),
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      phoneVerified: phoneVerified || false
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        phone: newUser.phone
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    // Return user data (without password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      username: newUser.username,
      email: newUser.email,
      phoneVerified: newUser.phoneVerified,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt
    };
    
    console.log('New user created:', userResponse.username);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Signup Error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Account creation failed',
      error: error.message
    });
  }
});

// USER PROFILE ENDPOINT (PRODUCTION READY)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// UPDATE USER PROFILE (for adding email, etc.)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { email, profile } = req.body;
    const userId = req.user.userId;
    
    const updateData = {};
    
    if (email) {
      // Check if email already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      updateData.email = email.toLowerCase().trim();
    }
    
    if (profile) {
      updateData.profile = { ...updateData.profile, ...profile };
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find user by username or phone
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { phone: username }
      ]
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        phone: user.phone
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        email: user.email,
        phoneVerified: user.phoneVerified
      }
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Twilio webhook handler
app.post('/api/sms/webhook', (req, res) => {
  console.log('Twilio webhook received:', req.body);
  const { From, Body, MessageSid, MessageStatus } = req.body;
  
  if (MessageStatus) {
    console.log(`Message ${MessageSid} status: ${MessageStatus}`);
  }
  
  if (Body && Body.toUpperCase().includes('STOP')) {
    console.log(`Opt-out request from ${From}`);
  }
  
  res.status(200).send('OK');
});

// Serve static files if build exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// API test endpoints
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/sms/test', (req, res) => {
  res.json({ 
    message: 'Twilio SMS API is ready!',
    twilioNumber: '+12147613175',
    hasCredentials: !!(accountSid && authToken)
  });
});

// Serve the React app or a fallback message
app.use(function(req, res) {
  const indexPath = path.join(buildPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <html>
        <head><title>PagoMigo Server</title></head>
        <body>
          <h1>PagoMigo Server Running</h1>
          <p>Build directory expected at: ${buildPath}</p>
          <p>Current directory: ${__dirname}</p>
          <p><a href="/api/ping">Test API</a> | <a href="/api/sms/test">Test Twilio SMS</a></p>
        </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, function() {
  console.log(`Server running on port ${PORT}`);
  console.log('Twilio SMS endpoints ready');
  console.log('Auth endpoints ready');
  console.log('User profile endpoints ready');
});