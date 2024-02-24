const express = require("express");
const Song = require("../model/song");
const router = express.Router(); 
const { handleUpload } = require("../utils/cloudinaryHelper");
const multer = require( 'multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/publish', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
      const {
        songName,
        description,    
        lyrics,
        artists,
        genre,
        type,
        category,
        tags,
        youtubeVideoId,
        spotifyLink,
        ganaLink,
      } = req.body;
  
      // Upload thumbnail to Cloudinary
      const thumbnailUrl = await handleUpload(req.files.thumbnail[0].buffer);
  
      // Upload banner to Cloudinary 
      const bannerUrl = await handleUpload(req.files.banner[0].buffer);

      
  
      // Create a new song document in the database
      const newSong = new Song({
        songName,
        description, 
        lyrics,
        artists: artists.split(','),
        genre,
        type, 
        category,
        tags: tags.split(','), 
        thumbnail: thumbnailUrl,
        banner: bannerUrl,
        youtubeVideoId,
        spotifyLink,
        ganaLink,
      });
     
      // Save the song data to the database
      await newSong.save();
  
      res.status(201).json({ message: 'Song uploaded successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to upload song' });
    }
  });
   
  // route to get single song by id 

  router.get('/get/:id', async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);
      if (!song) {
        return res.status(404).json({ error: 'Song not found' });
      }
      res.status(200).json(song);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to retrieve song' });
    }
  });


  
  // Route to get all songs
  router.get('/get-all-songs', async (req, res) => {
    try {
      const songs = await Song.find();
      res.status(200).json(songs);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to retrieve songs' });
    }
  });
      
  // Route to delete a single song by ID
  router.delete('/delete-song/:id', async (req, res) => {
    try {
      const deletedSong = await Song.findByIdAndDelete(req.params.id); 
      if (!deletedSong) {
        return res.status(404).json({ error: 'Song not found' });
      }
      res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to delete song' });
    }
  });
  
  // Route to delete multiple songs by IDs
  router.delete('/delete-multiple-songs', async (req, res) => {
    try {
      const { songIds } = req.body;
      const deletedSongs = await Song.deleteMany({ _id: { $in: songIds } });
      res.status(200).json({ message: 'Songs deleted successfully', deletedCount: deletedSongs.deletedCount });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to delete songs' });
    }
  });
  
  router.put('/update-song/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), async (req, res) => {
    try {
      const {
        songName,
        description,    
        lyrics,
        artists,
        genre,
        type,
        category,
        tags,
        youtubeLink,
        spotifyLink,
        ganaLink,
      } = req.body;
  
      // Check if the request contains files
      const hasThumbnail = req.files && req.files.thumbnail;
      const hasBanner = req.files && req.files.banner;
  
      // Initialize URLs for Cloudinary
      let thumbnailUrl, bannerUrl;
  
      // Upload thumbnail to Cloudinary if it exists in the request
      if (hasThumbnail) {
        thumbnailUrl = await handleUpload(req.files.thumbnail[0].buffer);
      }
  
      // Upload banner to Cloudinary if it exists in the request
      if (hasBanner) {
        bannerUrl = await handleUpload(req.files.banner[0].buffer);
      }
  
      // Update the song document in the database
      const updatedSong = await Song.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            songName,
            description,
            lyrics,
            artists: artists.split(','),
            genre,
            type,
            category,
            tags: tags.split(','),
            ...(hasThumbnail && { thumbnail: thumbnailUrl }),
            ...(hasBanner && { banner: bannerUrl }),
            youtubeLink,
            spotifyLink,
            ganaLink,
          },
        },
        { new: true }
      );
  
      if (!updatedSong) {
        return res.status(404).json({ error: 'Song not found' });
      }
  
      res.status(200).json({ message: 'Song updated successfully', song: updatedSong });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to update song' });
    }
  });
module.exports = router;  