const mongoose = require('mongoose');

const FeeChalanSchema = new mongoose.Schema({
    studentID: {
        type: String,
        required: true
    },
    isPaid:{
        type: Boolean,
        required: true,
        default: false
    },
    pathToFile:{
        type: String,
        required: true
    }
});

const FeeChallan = mongoose.model('FeeChallan', FeeChalanSchema);
module.exports = FeeChallan;