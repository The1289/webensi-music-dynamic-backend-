const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');      
const  EventEmitter =   require('events');
EventEmitter.defaultMaxListeners = 15;   

      

const corsOptions = {   
  origin: ['https://sprightly-salmiakki-ce51e3.netlify.app', 'https://webensimusic.webensi.com'],
  credentials: true,                                                            
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use("/test", (req, res) => {
  res.send("Hello world!"); 
});


// middleware in place to parse the request body.
app.use(express.json()); 




// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
const user = require("./controller/user");
const contact = require("./controller/contact")
const artist = require('./controller/artist')
const song = require("./controller/song")
const playlist = require("./controller/playlist")
const banner = require("./controller/banner")


                    

app.use("/api/v1/user", user);
app.use("/api/v1/artist", artist);
app.use("/api/v1/song", song)
app.use("/api/v1/contact", contact)
app.use("/api/v1/playlist", playlist);
app.use("/api/v1/banner", banner);


          










// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
