const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({


    bannerUrl: {
        type: String,
        required: true,
    },
    bannerNavigationLink: {
        type: String,
        required: true,
    },


});

module.exports = mongoose.model("Banner", bannerSchema);
