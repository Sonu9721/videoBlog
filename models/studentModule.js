const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const videoSchema = new mongoose.Schema({

    img:{
        type: String,        
    },
    userId: {
        type:ObjectId, 
        ref:'Email',
    },

    isDeleted: {
        type: Boolean, default: false
      },

      deletedAt: {
        type: String, default: null
      },
      createAt: {
        type: String, default: null
      },
},{})

module.exports = mongoose.model("Vidow", videoSchema)