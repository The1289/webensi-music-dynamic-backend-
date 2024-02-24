const express = require("express");
const router = express.Router();
const Inquiry = require("../model/inquiry");   
                                       
router.post('/submit-inquiry', async (req, res) => {
    try {    
        // Extract data from the request body          
        const { name, email, mobile, message } = req.body;

        // Create a new inquiry instance (assuming you have a schema for it)                                         
        const newInquiry = new Inquiry({  
            name,   
            email,  
            mobile,
            message,
        });

        // Save the new inquiry to the database
        const savedInquiry = await newInquiry.save();

        res.status(201).json(savedInquiry);
    } catch (error) {
        console.error("Error submitting inquiry:", error);
        res.status(500).json({ error: "Could not submit inquiry" });
    }
});
 
module.exports = router;  