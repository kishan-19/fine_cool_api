const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.resizeImage = async (req, res) => {
  try {

    const { image } = req.params;
    const { w, h, q, zc } = req.query;

    const imagePath = path.join(
      __dirname,
      "../../src/assets/uploads",
      image
    );

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    let transformer = sharp(imagePath);

    const width = parseInt(w);
    const height = parseInt(h);
    const quality = parseInt(q);

    /*
    |--------------------------------------------------------------------------
    | ZOOM / CROP CONTROL (zc)
    |--------------------------------------------------------------------------
    | 1 = contain (no crop)
    | 2 = cover (crop center - default)
    | 3 = fill (stretch)
    */

    let fitType = "cover"; // default

    if (zc == 1) fitType = "contain";
    if (zc == 2) fitType = "cover";
    if (zc == 3) fitType = "fill";

    if (width || height) {
      transformer = transformer.resize(
        width || null,
        height || null,
        {
          fit: fitType,
          withoutEnlargement: true,
        }
      );
    }

    res.set("Content-Type", "image/jpeg");

    transformer
      .jpeg({ quality: quality || 80 })
      .pipe(res);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};