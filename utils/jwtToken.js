// utils/jwtToken.js

const sendToken = (user, statusCode, res, token) => {
  const expiresIn = process.env.COOKIE_EXPIRES_IN || 7 * 24 * 60 * 60 * 1000; // Default to 7 days if not provided
  const options = {
    expires: new Date(Date.now() + Number(expiresIn)),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        // Include any user data you want to send in the response
        _id: user._id,
        email: user.email,
        // ... other user fields
      },
    });
};

module.exports = sendToken;
