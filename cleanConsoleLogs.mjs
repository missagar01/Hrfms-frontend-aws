// Quick script to remove console.log from specific frontend files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToClean = [
    path.join(__dirname, 'src', 'pages', 'ResumeCreate.jsx'),
    path.join(__dirname, 'src', 'pages', 'RequestCreate.jsx'),
    path.join(__dirname, 'src', 'pages', 'MyProfile.jsx')
];

function removeConsoleLogs(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove console.log statements (keep commented ones)
    content = content.replace(/^\s*console\.log\([^)]*\);?\s*$/gm, '');

    // Clean up multiple empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Cleaned: ${filePath}`);
        return true;
    }

    console.log(`⏭️  Skipped (no changes): ${filePath}`);
    return false;
}

console.log('🧹 Cleaning frontend console.logs...\n');

filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
        removeConsoleLogs(file);
    } else {
        console.log(`⚠️  Not found: ${file}`);
    }
});

console.log('\n✨ Frontend cleanup complete!');
