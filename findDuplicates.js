const fs = require('fs');
const path = require('path');
const getFileHash = require('./getFileHash');


// Initialize an object to hold the file type counts
const fileTypeCounts = {};

// Initialize an object to track files by their hash
const fileHashes = {};


// Function to recursively scan the directory
function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            scanDirectory(fullPath);
        } else {
            const ext = path.extname(file).toLowerCase();

            if (fileTypeCounts[ext]) {
                fileTypeCounts[ext]++;
            } else {
                fileTypeCounts[ext] = 1;
            }

            // Get the file's hash
            const fileHash = getFileHash(fullPath);

            // Track the file by its hash
            if (fileHashes[fileHash]) {
                fileHashes[fileHash].push(fullPath);
            } else {
                fileHashes[fileHash] = [fullPath];
            }
        }
    }
}

// Get the directory from the command-line arguments
const [directoryToScan] = require('./getCMDArgv')();

if (!directoryToScan) {
    console.error('Please provide a directory to scan.');
    process.exit(1);
}

const fullPath = path.resolve(directoryToScan);

if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    console.error('The provided path is not a valid directory.');
    process.exit(1);
}

// Scan the directory
scanDirectory(fullPath);

// Prepare the output
let output = 'File type counts:\n';
for (const [ext, count] of Object.entries(fileTypeCounts)) {
    output += `${ext}: ${count}\n`;
}
output += `\nTotal: ${Object.values(fileTypeCounts).reduce((prev, count) => prev + count, 0)}\n`;
output += '\nDuplicate files:\n';
let hasDuplicates = false;
for (const [hash, files] of Object.entries(fileHashes)) {
    if (files.length > 1) {
        hasDuplicates = true;
        output += `\nFiles with hash ${hash}:\n`;
        files.forEach(file => output += `- ${file}\n`);
    }
}

if (!hasDuplicates) {
    output += 'No duplicate files found.\n';
}

// Write the output to a text file
const outputFilePath = path.join(__dirname, 'scan_results.txt');
fs.writeFileSync(outputFilePath, output, 'utf8');

console.log(`Results written to ${outputFilePath}`);
