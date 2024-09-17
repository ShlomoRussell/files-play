const fs = require('fs');
const path = require('path');

// Function to read all files in a directory recursively
module.exports = // Function to read all files in a directory recursively, excluding certain directories, file types, and filenames
    function getAllFiles(dir, excludeDirs = [], excludeExts = [], excludeFiles = [], filesArray = []) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);

            // Skip excluded directories
            if (fs.statSync(fullPath).isDirectory()) {
                if (!excludeDirs.includes(file)) {
                    getAllFiles(fullPath, excludeDirs, excludeExts, excludeFiles, filesArray);
                }
            } else {
                // Skip excluded file types and filenames
                if (!excludeExts.includes(path.extname(file).toLowerCase()) &&
                    !excludeFiles.includes(path.basename(file).toLowerCase())) {
                    filesArray.push(fullPath);
                }
            }
        });

        return filesArray;
    }