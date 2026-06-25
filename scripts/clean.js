const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const pathsToRemove = [
    path.join(rootDir, 'dist'),
    path.join(rootDir, 'webapp', 'dist'),
    path.join(rootDir, 'webapp', 'junit.xml'),
];

for (const targetPath of pathsToRemove) {
    fs.rmSync(targetPath, {recursive: true, force: true});
}

console.log('Removed Node build artifacts.');
