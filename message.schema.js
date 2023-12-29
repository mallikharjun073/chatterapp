import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    username: {
        type:String
    },
    text:{
        type:String
    },
    room:{
        type:String
    },
    timestamp:{
        type:String
    }
});

export const chatmodel = mongoose.model('chat',messageSchema);





