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

// ADD MAILGUN (MODERN PACKAGE)
const Mailgun = require('mailgun.js');
const formData = require('form-data');

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'your-mailgun-api-key',
  url: 'https://api.mailgun.net'
});

/* 
// TWILIO - COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
*/

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
    required: false, // Changed to false since we're using email verification
    sparse: true,    // Allows multiple null values
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
    required: true,  // Now required for email verification
    unique: true,
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
  balance: {
    type: Number,
    default: 0
  },
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

// EMAIL VERIFICATION ENDPOINTS (MODERN MAILGUN)
app.post('/api/email/send-verification', async (req, res) => {
  try {
    console.log('=== EMAIL VERIFICATION DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    
    const { email, name } = req.body;
    
    console.log('Extracted email:', email);
    console.log('Extracted name:', name);
    console.log('Email type:', typeof email);
    
    // Validate email format
    if (!email) {
      throw new Error('Email is required');
    }
    
    if (typeof email !== 'string') {
      throw new Error('Email must be a string');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    console.log('Mailgun credentials check:');
    console.log('API Key exists:', !!process.env.MAILGUN_API_KEY);
    console.log('Domain exists:', !!process.env.MAILGUN_DOMAIN);
    console.log('Domain:', process.env.MAILGUN_DOMAIN);
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code temporarily (in production, use Redis or database)
    // For now, we'll store in memory with expiration
    global.verificationCodes = global.verificationCodes || {};
    global.verificationCodes[email] = {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };
    
    console.log('Generated verification code for:', email);
    console.log('Attempting to send email...');
    
    // Prepare email content (MODERN MAILGUN API)
    const messageData = {
      from: `PagoMigo <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: 'Verify Your PagoMigo Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">PagoMigo</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Welcome${name ? `, ${name}` : ''}!</h2>
            <p style="color: #666; font-size: 16px;">
              Thank you for joining PagoMigo. To complete your account verification, please use the code below:
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h3>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            <p style="color: #666; font-size: 14px;">
              Welcome to the future of digital payments!<br>
              The PagoMigo Team
            </p>
          </div>
        </div>
      `,
      text: `Welcome to PagoMigo${name ? `, ${name}` : ''}! Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`
    };
    
    // Send email via Mailgun (MODERN API)
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
    
    console.log('Email sent successfully!');
    console.log('Mailgun response:', result);
    console.log('================================');
    
    res.json({ 
      success: true, 
      message: 'Verification email sent',
      emailSent: true
    });
    
  } catch (error) {
    console.error('=== EMAIL ERROR DETAILS ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error object:', error);
    console.error('============================');
    
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

app.post('/api/email/verify-code', async (req, res) => {
  try {
    console.log('=== EMAIL CODE VERIFICATION ===');
    const { email, code } = req.body;
    
    console.log('Email:', email);
    console.log('Code received:', code);
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required'
      });
    }
    
    // Check stored verification code
    const storedData = global.verificationCodes?.[email];
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found for this email'
      });
    }
    
    // Check if expired
    if (Date.now() > storedData.expires) {
      delete global.verificationCodes[email];
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }
    
    // Check attempts
    if (storedData.attempts >= 3) {
      delete global.verificationCodes[email];
      return res.status(400).json({
        success: false,
        error: 'Too many verification attempts'
      });
    }
    
    // Verify code
    if (storedData.code !== code.toString()) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
    
    // Success - clean up
    delete global.verificationCodes[email];
    
    console.log('Email verification successful!');
    console.log('==============================');
    
    res.json({ 
      success: true, 
      verified: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/*
// TWILIO VERIFY ENDPOINTS - COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED
app.post('/api/sms/send-verification', async (req, res) => {
  try {
    console.log('=== TWILIO SMS DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { phoneNumber } = req.body;
    
    console.log('Extracted phoneNumber:', phoneNumber);
    console.log('phoneNumber type:', typeof phoneNumber);
    console.log('phoneNumber length:', phoneNumber?.length);
    console.log('First character:', phoneNumber?.[0]);
    console.log('Last character:', phoneNumber?.[phoneNumber?.length - 1]);
    
    // Validate phone number format
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    
    if (typeof phoneNumber !== 'string') {
      throw new Error('Phone number must be a string');
    }
    
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must include country code with + prefix');
    }
    
    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      throw new Error('Phone number length is invalid');
    }
    
    console.log('Twilio credentials check:');
    console.log('Account SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
    console.log('Auth Token exists:', !!process.env.TWILIO_AUTH_TOKEN);
    console.log('Verify Service ID exists:', !!process.env.TWILIO_VERIFY_SERVICE_ID);
    console.log('Verify Service ID:', process.env.TWILIO_VERIFY_SERVICE_ID);
    
    console.log('Attempting Twilio verification...');
    
    const verification = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });
    
    console.log('Verification successful!');
    console.log('Verification SID:', verification.sid);
    console.log('Verification status:', verification.status);
    console.log('========================');
    
    res.json({ 
      success: true, 
      status: verification.status,
      sid: verification.sid
    });
    
  } catch (error) {
    console.error('=== TWILIO ERROR DETAILS ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error moreInfo:', error.moreInfo);
    console.error('Full error object:', error);
    console.error('Error stack:', error.stack);
    console.error('===========================');
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.moreInfo || 'No additional details'
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
*/

// USER ACCOUNT CREATION (PRODUCTION READY)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, username, password, phoneVerified, emailVerified } = req.body;
    
    // Validate required fields - email is now required, phone is optional
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, username, and password are required'
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
        { email: email.toLowerCase() },
        ...(phone ? [{ phone: phone }] : [])
      ]
    });
    
    if (existingUser) {
      let message = 'User already exists';
      if (existingUser.username === username.toLowerCase()) {
        message = 'Username already exists';
      } else if (existingUser.email === email.toLowerCase()) {
        message = 'Email already registered';
      } else if (phone && existingUser.phone === phone) {
        message = 'Phone number already registered';
      }
      
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      phoneVerified: phoneVerified || false,
      emailVerified: emailVerified || false,
      balance: 0 // Initialize balance to 0
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    // Return user data (without password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      username: newUser.username,
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

// USER PROFILE ENDPOINT (FIXED TO MATCH FRONTEND EXPECTATIONS)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    console.log('=== FETCHING USER PROFILE ===');
    console.log('User ID from token:', req.user.userId);
    
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found in database:', {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone
    });
    
    // Format the response to match what your frontend expects
    const profileData = {
      name: user.name,
      username: user.username,
      phone: user.phone,
      phone_verified: user.phoneVerified,
      email: user.email,
      address: user.profile?.address?.street || 'Not provided',
      kyc_status: user.personaVerified ? 'completed' : 'pending',
      balance: user.balance || 0, // Default to 0 instead of undefined
      createdAt: user.createdAt
    };
    
    console.log('Sending profile data:', profileData);
    console.log('===============================');
    
    // Send the data directly (not wrapped in a 'user' object)
    res.json(profileData);
    
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// UPDATE USER PROFILE (for adding phone, etc.)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { email, phone, profile } = req.body;
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
    
    if (phone) {
      // Check if phone already exists
      const existingUser = await User.findOne({ 
        phone: phone,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
      
      updateData.phone = phone.trim();
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
    
    // Find user by username, email, or phone
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() },
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
        email: user.email
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
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified
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

/*
// TWILIO WEBHOOK HANDLER - COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED
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
*/

// Serve static files if build exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// API test endpoints
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

// EMAIL TEST ENDPOINT (MODERN MAILGUN)
app.get('/api/email/test', (req, res) => {
  res.json({ 
    message: 'Mailgun Email API is ready!',
    domain: process.env.MAILGUN_DOMAIN,
    hasApiKey: !!process.env.MAILGUN_API_KEY,
    mailgunVersion: 'modern mailgun.js'
  });
});

/*
// SMS TEST ENDPOINT - COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED
app.get('/api/sms/test', (req, res) => {
  res.json({ 
    message: 'Twilio SMS API is ready!',
    twilioNumber: '+12147613175',
    hasCredentials: !!(accountSid && authToken)
  });
});
*/

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
          <p><a href="/api/ping">Test API</a> | <a href="/api/email/test">Test Mailgun Email</a></p>
        </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, function() {
  console.log(`Server running on port ${PORT}`);
  console.log('Mailgun Email endpoints ready');
  console.log('Auth endpoints ready');
  console.log('User profile endpoints ready');
  // console.log('Twilio SMS endpoints ready'); // COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED
});