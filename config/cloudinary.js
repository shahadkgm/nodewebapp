const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath, folder = 'furni-products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const deleteFromCloudinary = async (imageUrlOrPublicId) => {
  try {
    if (!imageUrlOrPublicId) return;
    let publicId = imageUrlOrPublicId;
    if (imageUrlOrPublicId.startsWith('http')) {
      // e.g. https://res.cloudinary.com/sw6ze3yu/image/upload/v12345/furni-products/xyz.jpg
      const urlParts = imageUrlOrPublicId.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1) {
        // Skip version if present (e.g. v12345678)
        let startIndex = uploadIndex + 1;
        if (urlParts[startIndex] && urlParts[startIndex].startsWith('v') && !isNaN(urlParts[startIndex].substring(1))) {
          startIndex++;
        }
        const publicIdWithExt = urlParts.slice(startIndex).join('/');
        publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      }
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
