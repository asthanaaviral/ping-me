const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    users: [{ type: String, required: true }]
}, {
    timestamps: true,
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

module.exports = mongoose.model("Chat", ChatSchema);
