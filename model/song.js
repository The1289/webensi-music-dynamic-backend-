const mongoose = require("mongoose");


const songSchema = new mongoose.Schema({
  songName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lyrics: {
    type: String,

  },
  artists: {
    type: [], 
    required: true,

  },
  genre: {
    type: String,
  },
  type: {
    type: String,
  },
  category: {
    type: String,
  },
  tags: {
    type: [String],
  },
  thumbnail: {
    type: String,  // Assuming you store file paths or references
  },
  banner: {
    type: String,  // Assuming you store file paths or references
  },
  youtubeVideoId: {
    type: String,
    required: true,
  },
  spotifyLink: {
    type: String,
  },
  ganaLink: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Song", songSchema);
