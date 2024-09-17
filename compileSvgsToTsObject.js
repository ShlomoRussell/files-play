const fs = require('fs');
const path = require('path');
const getAllFiles = require('./getAllFiles');
const getFileHash = require('./getFileHash');

// Function to check if an SVG file is referenced in the project files and return the paths where it's used
function findSvgUsage(svgFileName, projectFiles) {
    const usedInFiles = [];

    projectFiles.forEach(projFile => {
        const content = fs.readFileSync(projFile, 'utf8');
        if (content.includes(svgFileName)) {
            usedInFiles.push(projFile);
        }
    });

    return usedInFiles;
}

// Get the assets directory and Angular project directory from the command-line arguments
const [assetsDir, projectDir] = require('./getCMDArgv')()


if (!assetsDir || !projectDir) {
    console.error('Please provide both the assets directory and the Angular project directory.');
    process.exit(1);
}
console.log(`Found ${assetsDir} from ${projectDir}`, '\nProgram Running...\nCtrl ^c to exit');
// Resolve the full paths
const assetsFullPath = path.resolve(assetsDir);
const projectFullPath = path.resolve(projectDir);

const excludeDirs = ['.angular', '.nx', '.husky', 'node_modules'];

// Get all SVG files
const svgFiles = getAllFiles(assetsFullPath, [], [], ['vulcan.svg']).filter(file => path.extname(file).toLowerCase() === '.svg');

// Get all project files (HTML, TS, SCSS, CSS, JSON)
const projectFiles = getAllFiles(projectFullPath, excludeDirs).filter(file => {
    return ['.html', '.ts', '.css', '.scss', '.json'].includes(path.extname(file).toLowerCase());
});

// Initialize an object to track unique SVGs by their hash and usage
const uniqueSvgs = {};

// Filter out duplicate SVGs, include only those that are used in the project, and log their usage
let usageLog = 'SVG Usage Log:\n\n';
let svgCount = 0;
svgFiles.forEach(file => {
    const fileName = path.basename(file);
    const fileHash = getFileHash(file);
    const usedInFiles = findSvgUsage(fileName, projectFiles);


    svgCount++;
    if (!uniqueSvgs[fileHash] && usedInFiles.length > 0) {
        uniqueSvgs[fileHash] = file;
        usageLog += `SVG: ${fileName}\nUsed in:\n${usedInFiles.join('\n')}\n\n`;
    }
});

// Prepare the content for the TypeScript file
let tsContent = 'export const svgs = {\n';

for (const fileHash in uniqueSvgs) {
    const filePath = uniqueSvgs[fileHash];
    const fileName = path.basename(filePath, '.svg');
    const svgContent = fs.readFileSync(filePath, 'utf8').replace(/`/g, '\\`');
    tsContent += `  '${fileName}': \`${svgContent}\`,\n`;
}

tsContent += '};\n\nexport type SvgNames = keyof typeof svgs;\n';
usageLog += `\nTotal: ${svgCount}\n`;
// Write the TypeScript content to a file
const outputFilePath = path.join(__dirname, 'svgs.ts');
fs.writeFileSync(outputFilePath, tsContent, 'utf8');

// Write the usage log to a text file
const logFilePath = path.join(__dirname, 'svg_usage_log.txt');
fs.writeFileSync(logFilePath, usageLog, 'utf8');

console.log(`TypeScript file written to ${outputFilePath}`);
console.log(`Usage log written to ${logFilePath}`);
