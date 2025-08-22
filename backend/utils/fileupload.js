// utils/fileupload.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage instance
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "masyntech-mern-blog",
  // Allow common image formats including WebP
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

module.exports = storage;
