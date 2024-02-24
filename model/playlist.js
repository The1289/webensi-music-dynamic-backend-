const mongoose = require("mongoose");


const playlistSchema = new mongoose.Schema({
    playlistName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    songs: {
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

    spotifyLink: {
        type: String,
    },
    ganaLink: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Playlist", playlistSchema);
