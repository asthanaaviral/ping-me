const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    chatId: { type: String, required: true, index: true },
    sender: { type: String, required: true, index: true },
    content: { type: String, required: true },
    timestamp: { type: Number, default: Date.now },
    sent: { type: Boolean, default: true },
    seen: { type: Boolean, default: false }
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model("Message", MessageSchema);
