const fs = require("fs");
const crypto = require("crypto");

// Function to calculate a file's hash
module.exports = function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}