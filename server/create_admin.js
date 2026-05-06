require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`Existing user ${email} has been promoted to Admin!`);
        } else {
            user = await User.create({
                name: 'System Admin',
                email: email,
                mobile: '0000000000',
                password: '123456',
                role: 'admin',
                address: 'Headquarters',
                location: {
                    type: 'Point',
                    coordinates: [72.5714, 23.0225] // Default to Ahmedabad
                }
            });
            console.log(`New Admin account created: ${email} with password: 123456`);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Replace with your email
const targetEmail = process.argv[2];
if (!targetEmail) {
    console.log('Please provide an email: node create_admin.js your@email.com');
    process.exit(1);
}

promoteToAdmin(targetEmail);
