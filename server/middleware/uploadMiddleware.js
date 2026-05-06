const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

let storage;
if (isCloudinaryConfigured) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'gharse_menus',
            allowed_formats: ['jpg', 'png', 'jpeg'],
        },
    });
} else {
    // Fallback to local storage or memory storage if Cloudinary is not set
    storage = multer.memoryStorage();
    console.warn('Cloudinary not configured. Falling back to memory storage.');
}

const upload = multer({ storage: storage });

module.exports = upload;
