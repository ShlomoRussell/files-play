const fs = require('fs');
const path = require('path');
const getAllFiles = require('./getAllFiles');

// Function to check if a file is referenced in the project files
function checkFileUsage(filePath, projectFiles) {
    const fileName = path.basename(filePath);
    let isUsed = false;

    projectFiles.forEach(projFile => {
        const content = fs.readFileSync(projFile, 'utf8');
        if (content.includes(fileName)) {
            isUsed = true;
        }
    });

    return isUsed;
}

// Function to delete a file
function deleteFile(filePath) {
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${filePath}`);
}

// Get the assets directory and Angular project directory from the command-line arguments
const [assetsDir, projectDir] = require('./getCMDArgv')()

if (!assetsDir || !projectDir) {
    console.error('Please provide both the assets directory and the Angular project directory.');
    process.exit(1);
}

console.log(`Found ${assetsDir} from ${projectDir}`, '\nProgram Running...\nCtrl ^c to exit');

const assetsFullPath = path.resolve(assetsDir);
const projectFullPath = path.resolve(projectDir);
const excludeDirs = ['.angular', '.nx', '.husky', 'node_modules'];

const assetFiles = getAllFiles(assetsFullPath, ['css', 'font', 'styling','assets-icon','remediation_actions_icons','connectors_icons','temp_kpis','svg-icons'], ['.scss', '.html',], ['.gitkeep']);

const projectFiles = getAllFiles(projectFullPath, excludeDirs).filter(file => {
    return ['.html', '.ts', '.css', '.scss', '.json'].includes(path.extname(file).toLowerCase());
});

let output = '';
let hasUnusedFiles = false;
let unusedFileCount = 0;

assetFiles.forEach(file => {
    if (!checkFileUsage(file, projectFiles)) {
        hasUnusedFiles = true;
        output += `${file}\n`;
        unusedFileCount++;
        deleteFile(file);
    }
});
if (hasUnusedFiles) {
    output = 'Unused asset files:\n' + output;
    output += `Total unused files deleted: ${unusedFileCount}\n`;
} else {
    output += 'No unused files found.\n';
}

// Write the output to a text file
const outputFilePath = path.join(__dirname, 'unused_assets.txt');
fs.writeFileSync(outputFilePath, output, 'utf8');

console.log(`Results written to ${outputFilePath}`);
