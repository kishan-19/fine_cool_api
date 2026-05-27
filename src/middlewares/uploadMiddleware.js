const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");

const uploadFolder = path.join(__dirname, "../assets/uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

/*
|--------------------------------------------------------------------------
| MULTER CONFIG
|--------------------------------------------------------------------------
*/

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;

  const isMimeTypeValid = allowedTypes.test(file.mimetype.toLowerCase());

  const isExtensionValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (isMimeTypeValid && isExtensionValid) {
    return cb(null, true);
  }

  cb(new Error("Only image files are allowed."));
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: imageFilter,
});

/*
|--------------------------------------------------------------------------
| RESIZE + COMPRESS IMAGE
|--------------------------------------------------------------------------
*/

const processImages = async (files = [], options = {}) => {
  const { width = 800, height = 800, quality = 70, format = "jpeg" } = options;

  let uploadedImages = [];

  for (const file of files) {
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}.${format}`;

    const outputPath = path.join(uploadFolder, fileName);

    let sharpFile = sharp(file.buffer).resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });

    /*
    |--------------------------------------------------------------------------
    | FORMAT HANDLE
    |--------------------------------------------------------------------------
    */

    if (format === "png") {
      sharpFile.png({
        quality,
      });
    } else if (format === "webp") {
      sharpFile.webp({
        quality,
      });
    } else {
      sharpFile.jpeg({
        quality,
      });
    }

    await sharpFile.toFile(outputPath);

    uploadedImages.push(fileName);
  }

  return uploadedImages;
};

/*
|--------------------------------------------------------------------------
| DELETE OLD IMAGES
|--------------------------------------------------------------------------
*/

const deleteImages = (images = []) => {
  for (const image of images) {
    const imagePath = path.join(uploadFolder, image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
};

/*
|--------------------------------------------------------------------------
| GENERATE FULL IMAGE URL
|--------------------------------------------------------------------------
*/

const generateImageUrls = (req, images = []) => {
  return images.map(
    (image) => `${req.protocol}://${req.get("host")}/api/assets/uploads/${image}`,
  );
};


const generateImageUrlsFromString = (req, images) => {

  if (!images || images === "" || images === "[]") {
    return [];
  }

  let imgArray = images;

  // if DB value is string (JSON)
  if (typeof imgArray === "string") {
    try {
      imgArray = JSON.parse(imgArray);
    } catch (e) {
      imgArray = [];
    }
  }

    if (!Array.isArray(imgArray) || imgArray.length === 0) {
    return [];
  }

  return imgArray.map(image =>
    `${req.protocol}://${req.get("host")}/api/assets/uploads/${image}`
  );
};

module.exports = {
  upload,
  processImages,
  deleteImages,
  generateImageUrls,
  generateImageUrlsFromString
};
