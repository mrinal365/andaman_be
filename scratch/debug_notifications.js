const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/andaman');
    console.log('Connected to DB');

    const unreadMessages = await Notification.find({ type: 'message', read: false });
    console.log(`Total unread message notifications: ${unreadMessages.length}`);

    if (unreadMessages.length > 0) {
        console.log('Sample unread notification:');
        const sample = unreadMessages[0];
        console.log({
            _id: sample._id,
            recipient: sample.recipient,
            type: sample.type,
            data: sample.data,
            conversationIdType: typeof sample.data.conversationId,
            isObjectId: sample.data.conversationId instanceof mongoose.Types.ObjectId
        });

        const conversationIds = unreadMessages.map(n => n.data.conversationId?.toString());
        const uniqueConvos = [...new Set(conversationIds)];
        console.log(`Unread messages across ${uniqueConvos.length} conversations: ${uniqueConvos.join(', ')}`);
        
        uniqueConvos.forEach(convoId => {
            const count = conversationIds.filter(id => id === convoId).length;
            console.log(`Convo ${convoId}: ${count} messages`);
        });
    }

    await mongoose.disconnect();
}

debug().catch(console.error);
