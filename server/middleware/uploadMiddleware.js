// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (subfolder) => {
  // 1. Dynamic Destination
  const uploadDir = `uploads/${subfolder}`;
  
  // Ensure the specific folder exists (e.g., uploads/materials)
  if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Filename: userID-timestamp-random.ext
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  // 2. Dynamic File Filter (Optional: You can customize this per folder if needed)
  const fileFilter = (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'image/jpeg', 
      'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Docs, PPT, and Images are allowed.'), false);
    }
  };

  return multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB for PPTs
    fileFilter: fileFilter
  });
};

module.exports = createUploader;