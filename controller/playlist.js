const express = require("express");
const Playlist = require("../model/playlist");
const router = express.Router(); 
const { handleUpload } = require("../utils/cloudinaryHelper");
const multer = require( 'multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const mongoose = require("mongoose");    
const Song = require("../model/song");


router.post('/create', upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      playlistName,
      description,
      genre,
      type, 
      category,
    } = req.body;

    // Upload thumbnail to Cloudinary
    const thumbnailUrl = await handleUpload(req.file.buffer);

    // Create a new playlist document in the database
    const newPlaylist = new Playlist({
      playlistName,
      description,
      genre,
      type,
      category,
      thumbnail: thumbnailUrl,
    });

    // Save the playlist data to the database
    await newPlaylist.save();

    res.status(201).json({ message: 'Playlist created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});                          


router.get('/get-all-playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find(); // Assuming you are using Mongoose for MongoDB

    res.status(200).json({ playlists });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});
 
// Route to add songs to a playlist     
router.post('/add-to-playlist', async (req, res) => {
  const { playlistId, songIds } = req.body;

  try {
    // Validate that playlistId is provided and is a valid ObjectId
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ error: 'Invalid playlistId' });
    }

    // Validate that songIds is an array of valid ObjectId
    if (!Array.isArray(songIds) || songIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'Invalid songIds' });
    }

    // Fetch the playlist
    const playlist = await Playlist.findById(playlistId);  

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Add songs to the playlist
    playlist.songs = [...new Set([...playlist.songs, ...songIds])];

    // Save the updated playlist
    await playlist.save();

    res.status(200).json({ message: 'Songs added to playlist successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add songs to playlist' });
  }
});




// Route to get songs for a playlist
router.get('/get-songs-for-playlist/:playlistId', async (req, res) => {
  try {
    const songs = await Song.find({ playlistId: req.params.playlistId });
    res.status(200).json({ songs });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to retrieve playlist songs' });
  }
});


   





module.exports = router;  