const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, index: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dp: { type: String, default: null }
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
