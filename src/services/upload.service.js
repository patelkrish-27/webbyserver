const cloudinary = require('../config/cloudinary');

class UploadService {
    async uploadFile(filePath) {
        try {
            const result = await cloudinary.uploader.upload(filePath);
            return result;
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
}

module.exports = new UploadService();
