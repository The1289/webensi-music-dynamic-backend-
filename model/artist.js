// artist.model.js
const mongoose = require ("mongoose");
                      

const artistSchema = new mongoose.Schema({    
  role: {
    type: String,
    enum: ["Singer", "Actor", "Writer", "Producer", "Director", "Editor"],
    required: true,  
  },
  name: {  
    type: String,                         
    required: true,                                       
  },  
  email: {
    type: String,
    
  },
  phoneNumber: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 250, 
  },
  dob: {
    type: Date,
  },
  youtube: {
    type: String,

  },
  instagram: {
    type: String,
  },
  facebook: {
    type: String,
  }, 
  twitter: {
    type: String,
  }, 
  other: {
    type: String,
  }, 
  profilePhoto: {
    type: String, // Assuming Cloudinary URL or any other storage service URL
  },
});

module.exports = mongoose.model("Artist", artistSchema);
