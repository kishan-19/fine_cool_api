const tryCatch = require("../utils/tryCatch");

const checkToken = tryCatch(async (req, res) => {

    res.status(200).json({
        success: true,
        message: "Token is valid",
    });

}); 

module.exports = { checkToken };