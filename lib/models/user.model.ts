import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    bio: { String, trim: true },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
            
        }
    ]

});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;