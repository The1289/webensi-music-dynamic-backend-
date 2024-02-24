const express = require("express");
const Banner = require("../model/banner");
const router = express.Router();
const { uploadSingleImage } = require("../utils/cloudinaryHelper");       
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });    




router.post('/add-banner', upload.single('bannerImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a banner image.' });  
        }  

        // Extract data from the request body
        const { bannerNavigationLink } = req.body;

        // Upload banner image to Cloudinary                 
        const bannerImageUrl = await uploadSingleImage(req.file.buffer, 'Banners');

        // Create a new banner document in the database
        const newBanner = new Banner({
            bannerNavigationLink,
            bannerUrl: bannerImageUrl,
        });

        // Save the banner data to the database
        await newBanner.save();

        res.status(201).json({ message: 'Banner uploaded successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to upload banner' });
    }
});



// Route to update an existing banner
router.put('/update-banner/:id', upload.single('bannerImage'), async (req, res) => {
    try {
        const bannerId = req.params.id;

        // Check if the banner exists
        const existingBanner = await Banner.findById(bannerId);
        if (!existingBanner) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        // Extract data from the request body
        const { bannerNavigationLink } = req.body;

        // Update banner image if a new one is provided
        let bannerImageUrl = existingBanner.bannerUrl;
        if (req.file) {
            bannerImageUrl = await uploadSingleImage(req.file.buffer, 'Banners');
        }

        // Update banner data in the database
        existingBanner.bannerNavigationLink = bannerNavigationLink;
        existingBanner.bannerUrl = bannerImageUrl;

        // Save the updated banner data
        await existingBanner.save();

        res.status(200).json({ message: 'Banner updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update banner' });
    }
});


        
// Route to get all banners
router.get('/all-banners', catchAsyncErrors(async (req, res) => {
    try {
        // Fetch all banners from the database
        const allBanners = await Banner.find();

        res.status(200).json({ banners: allBanners });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to retrieve banners' });
    }
}));


module.exports = router;
