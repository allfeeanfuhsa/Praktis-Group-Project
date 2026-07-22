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

  const checkStorageLimit = () => {
    const maxStorageMB = parseInt(process.env.MAX_STORAGE_LIMIT_MB) || 5000;
    const maxStorageBytes = maxStorageMB * 1024 * 1024;
    const rootUploads = path.join(__dirname, '../uploads');
    
    let size = 0;
    const calculateSize = (dir) => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const fp = path.join(dir, file);
          const stat = fs.statSync(fp);
          if (stat.isFile()) size += stat.size;
          else if (stat.isDirectory()) calculateSize(fp);
        });
      }
    };
    calculateSize(rootUploads);
    return size >= maxStorageBytes;
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (checkStorageLimit()) {
        return cb(new Error('Kapasitas penyimpanan sistem telah penuh (Storage Quota Exceeded). Hubungi Administrator.'), null);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Filename: userID-timestamp-sanitizedOriginalName.ext
      const nameWithoutExt = path.parse(file.originalname).name;
      const ext = path.extname(file.originalname);
      const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
      const uniquePrefix = `${req.user?.id || 'anon'}-${Date.now()}`;
      cb(null, `${uniquePrefix}-${cleanName}${ext}`);
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
      'image/png',
      'application/zip', // .zip
      'application/x-zip-compressed', // Windows .zip
      'application/x-rar-compressed' // .rar
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