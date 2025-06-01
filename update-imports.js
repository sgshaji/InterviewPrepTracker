import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of old import paths to new ones
const importMappings = {
    '../auth': '../../services/auth/auth',
    '../email-service': '../../services/email/email-service',
    '../storage': '../../services/storage/storage',
    '../middleware': '../../middleware',
    '../security': '../../utils/security',
    '../cache': '../../utils/cache',
    '../db': '../../config/db',
    '../vite': '../../config/vite'
};

// Function to update imports in a file
function updateImports(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`Warning: File ${filePath} does not exist`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Update imports
    Object.entries(importMappings).forEach(([oldPath, newPath]) => {
        const oldImportRegex = new RegExp(`from ['"]${oldPath}['"]`, 'g');
        if (oldImportRegex.test(content)) {
            content = content.replace(oldImportRegex, `from '${newPath}'`);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated imports in ${filePath}`);
    }
}

// Update imports in all moved files
const filesToUpdate = [
    'server/src/api/routes.ts',
    'server/src/services/auth/auth.ts',
    'server/src/services/email/email-service.ts',
    'server/src/services/email/reminder-scheduler.ts',
    'server/src/services/email/notification-scheduler.ts',
    'server/src/services/storage/storage.ts',
    'server/src/middleware/index.ts',
    'server/src/utils/security.ts',
    'server/src/utils/cache.ts',
    'server/src/config/db.ts',
    'server/src/config/vite.ts',
    'server/src/index.ts'
];

filesToUpdate.forEach(updateImports);

console.log('Import paths updated!'); 