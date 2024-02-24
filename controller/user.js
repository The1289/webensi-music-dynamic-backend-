const express = require("express");
const User = require("../model/user");
const router = express.Router();
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const mongoose = require("mongoose");



router.post('/add-user', async (req, res) => {
  try {
    const {
      name,
      displayName,
      email,
      mobileNumber,
      password,
      role = 'user',
    } = req.body;

    // Create a new user document in the database
    const newUser = new User({
      name,
      displayName,
      email,
      mobileNumber,
      password,
      role,
    });

    // Set the user password
    newUser.setPassword(password);

    // Save the user data to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error:', error);

    if (error.name === 'ValidationError') {
      // Handle Mongoose ValidationError
      const duplicateField = Object.keys(error.errors)[0];
      let errorMessage = '';

      if (duplicateField === 'email') {
        errorMessage = 'User with this email already exists.';
      } else if (duplicateField === 'mobileNumber') {
        errorMessage = 'User with this mobile number already exists.';
      } else {
        errorMessage = `User with this ${duplicateField} already exists.`;
      }

      return res.status(400).json({ error: errorMessage });
    }

    if (error.code === 11000 || (error.name === 'MongoError' && error.code === 11000)) {
      // Handle MongoDB duplicate key error (code 11000)
      const duplicateField = Object.keys(error.keyValue)[0];
      let errorMessage = '';

      if (duplicateField === 'email') {
        errorMessage = 'User with this email already exists.';
      } else if (duplicateField === 'mobileNumber') {
        errorMessage = 'User with this mobile number already exists.';
      } else {
        errorMessage = 'User with these details already exists.';
      }

      return res.status(400).json({ error: errorMessage });
    }

    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists and select the password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if the entered password is correct
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate and send the JWT token
    const token = user.getJwtToken();
    sendToken(user, 200, res, token);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// load user
router.get("/getuser", isAuthenticated, catchAsyncErrors(async(req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if(!user){
      return next(new ErrorHandler("User doesnt't exists", 400))
    }
    res.status(200).json({
      success: true, 
      user,   
    })     
  } catch (error) {
    return next (new ErrorHandler(error.message, 500))
  }
}))









router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler('User with this email does not exist', 404));
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '10m',
      }
    );

    const resetPasswordLink = 'http://localhost:3000/reset-password/' + resetToken;

    const emailOptions = {
      email: user.email,
      subject: 'Password Reset Link',
      message: `Click the following link to reset your password: <a href="${resetPasswordLink}">Reset Password</a>`,
    };

    sendMail(emailOptions); // Send the email using the sendMail function

    res.status(200).json({ success: true, message: 'Password reset link sent successfully' });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


// Reset Password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify the reset token
    jwt.verify(resetToken, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return next(new ErrorHandler('Invalid or expired reset token', 400));
      }

      const userId = decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      // Update the user's password with the new one
      user.password = newPassword;
      await user.save();

      res.status(200).json({ success: true, message: 'Password reset successful' });
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});



// load user
router.get("/getuser", isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return next(new ErrorHandler("User doesnt't exists", 400))
    }
    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    return next(new ErrorHandler(error.message, 500))
  }
}))

// log out user
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400)
        );
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-user/:userId",

  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.params.userId;

      // Validate if userId is a valid ObjectId (assuming you're using MongoDB)
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorHandler("Invalid user ID format", 400));
      }

      const user = await User.findById(userId);

      // Check if the user exists
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all users --- for admin
router.get(
  "/get-all-users",

  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete users --- admin
router.delete(
  "/delete-user/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Validate if userId is provided
      if (!userId) {
        return next(new ErrorHandler("Invalid user ID provided", 400));
      }

      // Delete single user
      const result = await User.findByIdAndDelete(userId);

      // Check if user was deleted
      if (result) {
        res.status(200).json({
          success: true,
          message: "User deleted successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No user found with the provided ID.",
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// delete multiple users 

router.delete(
  "/delete-multiple-users",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Assuming req.body.userIds is an array of user IDs to delete
      const { userIds } = req.body;

      // Validate if userIds array is provided
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return next(new ErrorHandler("Invalid user IDs provided", 400));
      }

      // Delete multiple users
      const result = await User.deleteMany({ _id: { $in: userIds } });

      // Check if any users were deleted
      if (result.deletedCount > 0) {
        res.status(200).json({
          success: true,
          message: `${result.deletedCount} user(s) deleted successfully.`,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No users found with the provided IDs.",
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  '/update-user/:userId',
  catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { displayName, role, name, mobileNumber, email } = req.body;

    try {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } }, // Exclude the current user being updated
          { $or: [{ email }, { mobileNumber }] },
        ],
      });

      if (existingUser) {
        let errorMessage = '';
        if (existingUser.email === email) {
          errorMessage = 'User with this email already exists.';
        } else if (existingUser.mobileNumber === mobileNumber) {
          errorMessage = 'User with this mobile number already exists.';
        }

        return res.status(400).json({ error: errorMessage });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { displayName, role, name, mobileNumber, email },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return next(new ErrorHandler('User not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'User details updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


module.exports = router;
