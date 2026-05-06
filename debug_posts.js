const mongoose = require('mongoose');
const Post = require('./models/feed/Post');
const User = require('./models/User');

async function checkSurajPosts() {
    try {
        await mongoose.connect('mongodb://localhost:27017/andaman'); // Adjust DB URI if needed
        const user = await User.findOne({ handle: 'suraj' });
        if (!user) {
            console.log('User suraj not found');
            return;
        }
        console.log('User found:', user._id);
        const posts = await Post.find({ authorId: user._id });
        console.log(`Found ${posts.length} posts for suraj`);
        posts.forEach(p => {
            console.log(`- ID: ${p._id}, Status: ${p.status}, Visibility: ${p.visibility}, Type: ${p.type}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSurajPosts();
