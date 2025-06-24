const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");

class StorageService {
  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env.GCS_BUCKET_NAME;
  }

  /**
   * Generate a signed URL for direct upload from client
   * @param {string} behavior - The behavior type (e.g., 'Drowsiness')
   * @param {string} fileExtension - The file extension (default: 'mp3')
   * @param {string} contentType - The content type (default: 'audio/mp3')
   * @returns {Promise<object>} Object containing the URL and file path
   */
  async generateUploadSignedUrl(
    behavior,
    fileExtension = "mp3",
    contentType = "audio/mp3"
  ) {
    // Create a unique filename within a folder structure based on behavior type
    const fileName = `user_uploads/${behavior}/${uuidv4()}.${fileExtension}`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    // Generate signed URL with appropriate options
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    return {
      url,
      filePath: `gs://${this.bucketName}/${fileName}`,
      publicUrl: `https://storage.googleapis.com/${this.bucketName}/${fileName}`,
    };
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param {string} filePath - The file path (gs:// or https:// format)
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteFile(filePath) {
    try {
      if (!filePath) return false;

      // Extract the file name from various URL formats
      let fileName;

      if (filePath.startsWith("gs://")) {
        // Format: gs://bucket-name/path/to/file.ext
        const parts = filePath.split("/");
        // Remove bucket name prefix (first two elements)
        fileName = parts.slice(2).join("/");
      } else if (filePath.startsWith("https://storage.googleapis.com/")) {
        // Format: https://storage.googleapis.com/bucket-name/path/to/file.ext
        const parts = filePath.split("/");
        // Remove domain and bucket name (first 4 elements)
        fileName = parts.slice(4).join("/");
      } else {
        // Assume it's already a relative path
        fileName = filePath;
      }

      // Get a reference to the file
      const file = this.storage.bucket(this.bucketName).file(fileName);

      // Check if the file exists
      const [exists] = await file.exists();
      if (!exists) {
        console.log(`File ${fileName} does not exist`);
        return true; // Not an error if file doesn't exist
      }

      // Delete the file
      await file.delete();
      console.log(`Successfully deleted file: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  }
}

module.exports = new StorageService();
