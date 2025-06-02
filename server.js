// Express server that handles Render's directory structure
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Safe route loading with detailed error handling
console.log('Loading routes...');

let plaidRoutes, personaRoutes, unitRoutes;

try {
  console.log('Loading plaidRoutes...');
  plaidRoutes = require('./routes/plaidRoutes');
  console.log('✓ Plaid routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading plaid routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  console.log('Loading personaRoutes...');
  personaRoutes = require('./routes/persona');
  console.log('✓ Persona routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading persona routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  console.log('Loading unitRoutes...');
  unitRoutes = require('./routes/unit');
  console.log('✓ Unit routes loaded successfully');
} catch (error) {
  console.error('✗ Error loading unit routes:', error.message);
  console.error('Stack:', error.stack);
}

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
    required: false,
    sparse: true,
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
    required: true,
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
  address: {
    type: String,
    trim: true
  },
  plaidAccounts: [{
    accessToken: String,
    itemId: String,
    institutionName: String,
    accountId: String,
    accountType: String,
    linkedAt: { type: Date, default: Date.now }
  }],
  plaidIdentityVerificationId: String,
  plaidIdentityStatus: {
    type: String,
    enum: ['pending', 'approved', 'failed', 'pending_review'],
    default: 'pending'
  },
  personaVerified: {
    type: Boolean,
    default: false
  },
  personaInquiryId: String,
  persona_inquiry_id: String,
  persona_status: {
    type: String,
    enum: ['pending', 'created', 'completed', 'approved', 'failed', 'declined', 'needs_review', 'pending_review', 'expired'],
    default: 'pending'
  },
  persona_updated_at: Date,
  persona_completed_at: Date,
  kyc_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  kyc_completed_at: Date,
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
    ssn: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

const buildPath = path.join(__dirname, 'build');

if (fs.existsSync(buildPath)) {
  console.log('Build directory found');
} else {
  console.log('Build directory not found');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Database middleware
const databaseMiddleware = (req, res, next) => {
  req.db = mongoose.connection.db;
  next();
};

// API Routes - Only add routes that loaded successfully
console.log('Setting up API routes...');

if (plaidRoutes) {
  console.log('Adding Plaid routes to /api/plaid');
  app.use('/api/plaid', plaidRoutes);
} else {
  console.log('Skipping Plaid routes - failed to load');
}

if (personaRoutes) {
  console.log('Adding Persona routes to /api/persona');
  app.use('/api/persona', authenticateToken, databaseMiddleware, personaRoutes);
} else {
  console.log('Skipping Persona routes - failed to load');
}

if (unitRoutes) {
  console.log('Adding Unit routes to /api/unit');
  app.use('/api/unit', authenticateToken, unitRoutes);
} else {
  console.log('Skipping Unit routes - failed to load');
}

// EMAIL VERIFICATION ENDPOINTS (MODERN MAILGUN)
app.post('/api/email/send-verification', async (req, res) => {
  try {
    const { email, name } = req.body;
    
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
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    global.verificationCodes = global.verificationCodes || {};
    global.verificationCodes[email] = {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0
    };
    
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
    
    await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
    
    res.json({ 
      success: true, 
      message: 'Verification email sent',
      emailSent: true
    });
    
  } catch (error) {
    console.error('Email verification error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

app.post('/api/email/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required'
      });
    }
    
    const storedData = global.verificationCodes?.[email];
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found for this email'
      });
    }
    
    if (Date.now() > storedData.expires) {
      delete global.verificationCodes[email];
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }
    
    if (storedData.attempts >= 3) {
      delete global.verificationCodes[email];
      return res.status(400).json({
        success: false,
        error: 'Too many verification attempts'
      });
    }
    
    if (storedData.code !== code.toString()) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
    
    delete global.verificationCodes[email];
    
    res.json({ 
      success: true, 
      verified: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Email verification error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// USER ACCOUNT CREATION
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, username, password, phoneVerified, emailVerified } = req.body;
    
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, username, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
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
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      phoneVerified: phoneVerified || false,
      emailVerified: emailVerified || false,
      balance: 0
    });
    
    await newUser.save();
    
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
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
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Signup error:', error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
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

// USER PROFILE ENDPOINT
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const getAddressString = (user) => {
      if (user.address && typeof user.address === 'string') {
        return user.address;
      }
      
      if (user.profile?.address && typeof user.profile.address === 'string') {
        return user.profile.address;
      }
      
      if (user.profile?.address && typeof user.profile.address === 'object') {
        const addr = user.profile.address;
        const parts = [addr.street, addr.city, addr.state].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
      
      return 'Not provided';
    };
    
    const profileData = {
      name: user.name,
      username: user.username,
      phone: user.phone,
      phone_verified: user.phoneVerified,
      email: user.email,
      address: getAddressString(user),
      kyc_status: user.persona_status || (user.personaVerified ? 'completed' : 'pending'),
      persona_status: user.persona_status || 'pending',
      persona_inquiry_id: user.persona_inquiry_id || user.personaInquiryId,
      balance: user.balance || 0,
      createdAt: user.createdAt
    };
    
    res.json(profileData);
    
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// UPDATE USER PROFILE
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, username, email, phone, address, profile } = req.body;
    const userId = req.user.userId;
    
    const updateData = {};
    
    if (name) {
      updateData.name = name.trim();
    }
    
    if (username) {
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      
      updateData.username = username.toLowerCase().trim();
    }
    
    if (email) {
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
    
    if (address !== undefined) {
      updateData.address = typeof address === 'string' ? address.trim() : '';
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
    console.error('Profile update error:', error.message);
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
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
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
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Serve static files if build exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// API test endpoints
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/email/test', (req, res) => {
  res.json({ 
    message: 'Mailgun Email API is ready!',
    domain: process.env.MAILGUN_DOMAIN,
    hasApiKey: !!process.env.MAILGUN_API_KEY,
    mailgunVersion: 'modern mailgun.js'
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
  if (personaRoutes) console.log('Persona identity verification endpoints ready');
  if (plaidRoutes) console.log('Plaid banking endpoints ready');
  if (unitRoutes) console.log('Unit banking endpoints ready');
});