const storageService = require('../services/storageService');

class FileController {
  /**
   * Generate signed URL for direct client upload to GCS
   */
  async getSignedUploadUrl(req, res) {
    try {
      const { behavior} = req.query;
      
      // Validate behavior type
      const validBehaviors = ['Drowsiness', 'Distraction', 'Phone Usage', 'Intoxication'];
      if (!behavior || !validBehaviors.includes(behavior)) {
        return res.status(400).json({ 
          message: `Invalid behavior type. Must be one of: ${validBehaviors.join(', ')}` 
        });
      }
      
      const fileType = req.query.fileType || 'mp3';
      const contentType = req.query.contentType || 'audio/mp3';
      
      const { url, filePath, publicUrl } = await storageService.generateUploadSignedUrl(
        behavior, fileType, contentType
      );
      
      res.status(200).json({
        signedUrl: url,
        filePath,
        publicUrl,
        expiresIn: 15 * 60 // 15 minutes in seconds
      });
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      res.status(500).json({ 
        message: 'Failed to generate upload URL',
        error: error.message 
      });
    }
  }
}

// Create instance and bind methods
const fileController = new FileController();
module.exports = {
  getSignedUploadUrl: fileController.getSignedUploadUrl.bind(fileController)
};