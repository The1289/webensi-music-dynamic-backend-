import mongoose, { Schema } from "mongoose";
import modelOptions from "./model.options.js";

const songSchema = new Schema({
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
    required: true,
  },
  artist: {
    type: String,
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
  youtubeLink: {
    type: String,
    required: true,
  },
  spotifyLink: {
    type: String,
  },
  ganaLink: {
    type: String,
  },
}, modelOptions);

const Song = mongoose.model('Song', songSchema);

export default Song;
