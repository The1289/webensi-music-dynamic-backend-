const express = require("express");
const Artist = require("../model/artist");    
const router = express.Router();
const { uploadSingleImage } = require("../utils/cloudinaryHelper");
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/add-artist', upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a profile photo.' });
    }

    // Extract data from the request body
    const {
      name,
      email,
      phoneNumber,
      bio,
      role,
      dob,
      youtube,
      instagram,
      facebook,
      twitter,
      other,
    } = req.body;

    // Upload profile photo to Cloudinary
    const profilePhotoUrl = await uploadSingleImage(req.file.buffer, 'Artists');

    // Create a new artist document in the database
    const newArtist = new Artist({
      name,
      email,
      phoneNumber,
      bio,
      role,
      dob,
      youtube,
      instagram,
      facebook,
      twitter,
      other,
      profilePhoto: profilePhotoUrl,
    });

    // Save the artist data to the database
    await newArtist.save();

    res.status(201).json({ message: 'Artist registered successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to register artist' });
  }
});



router.get(
  '/get-all-artists',

  catchAsyncErrors(async (req, res, next) => {
    try {
      // Fetch all artists from the database
      const allArtists = await Artist.find().sort({
        createdAt: -1,
      });

      // Return the list of artists in the response
      res.status(200).json({
        success: true,
        artists: allArtists, // Modify the response structure if needed
      });
    } catch (error) {
      // Pass the error to the next middleware
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



module.exports = router;  