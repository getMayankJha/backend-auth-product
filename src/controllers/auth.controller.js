const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateResetToken } = require('../utils/resetToken');
const crypto = require('crypto');


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // 5. Send response (no password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      // 1. Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
  
      // 2. Find user (explicitly select password)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
  
      // 3. Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
  
      // 4. Generate JWT
      const token = generateToken({
        id: user._id,
        email: user.email
      });
  
      // 5. Response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  
    } catch (error) {
      next(error);
    }
  };

  /**
 * @desc Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        // SECURITY: do not reveal user existence
        return res.status(200).json({
          success: true,
          message: 'If email exists, reset token has been generated'
        });
      }
  
      const { resetToken, hashedToken } = generateResetToken();
  
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  
      await user.save({ validateBeforeSave: false });
  
      // In real app → send email
      // Here → return token for testing
      res.status(200).json({
        success: true,
        message: 'Password reset token generated',
        resetToken
      });
  
    } catch (error) {
      next(error);
    }
  };


  /**
 * @desc Reset password
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
exports.resetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }
  
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
  
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      }).select('+password');
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
  
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      // Clear reset fields
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
  
    } catch (error) {
      next(error);
    }
  };
  