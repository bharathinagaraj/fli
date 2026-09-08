const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route by field name into subfolders: uploads/products, uploads/avatars, etc.
    const subfolder = file.fieldname === "avatar" ? "avatars" : "products";
    const dest = path.join(UPLOAD_DIR, subfolder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

// Single file upload, e.g. avatar
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files under one field, e.g. product images
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Mixed fields, e.g. { thumbnail: 1, gallery: 5 }
const uploadFields = (fields) => upload.fields(fields);

// Wraps multer's callback-style errors into consistent JSON responses.
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max size is 5MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Too many files, or wrong field name." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Builds a public URL for a saved file, to store on the model (e.g. Product.images)
const getFileUrl = (req, filename, subfolder = "products") => {
  return `${req.protocol}://${req.get("host")}/uploads/${subfolder}/${filename}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  getFileUrl,
};