const fileUpload = require('express-fileupload');
const trialMiddleware = (req,res,next)=> {console.log("just structuring project");
    next()
}

const uploadMiddleware = fileUpload({
  createParentPath: true, // Automatically create directories if they don't exist
});

module.exports = {trialMiddleware,uploadMiddleware}