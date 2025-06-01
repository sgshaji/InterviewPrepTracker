const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
    'server/src/api',
    'server/src/services/auth',
    'server/src/services/email',
    'server/src/services/storage',
    'server/src/middleware',
    'server/src/utils',
    'server/src/config',
    'server/src/types',
    'scripts/db',
    'scripts/setup',
    'scripts/maintenance',
    'shared/types',
    'shared/constants',
    'config',
    'docs/api',
    'docs/setup'
];

// Create directories
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Server file mappings
const serverMoves = [
    { from: 'server/routes.ts', to: 'server/src/api/routes.ts' },
    { from: 'server/storage.ts', to: 'server/src/services/storage/storage.ts' },
    { from: 'server/security.ts', to: 'server/src/utils/security.ts' },
    { from: 'server/db.ts', to: 'server/src/config/db.ts' },
    { from: 'server/index.ts', to: 'server/src/index.ts' },
    { from: 'server/cache.ts', to: 'server/src/utils/cache.ts' },
    { from: 'server/reminder-scheduler.ts', to: 'server/src/services/email/reminder-scheduler.ts' },
    { from: 'server/vite.ts', to: 'server/src/config/vite.ts' },
    { from: 'server/middleware.ts', to: 'server/src/middleware/index.ts' },
    { from: 'server/notification-scheduler.ts', to: 'server/src/services/email/notification-scheduler.ts' },
    { from: 'server/email-service.ts', to: 'server/src/services/email/email-service.ts' },
    { from: 'server/auth.ts', to: 'server/src/services/auth/auth.ts' }
];

// Move server files
serverMoves.forEach(move => {
    if (fs.existsSync(move.from)) {
        // Create target directory if it doesn't exist
        const targetDir = path.dirname(move.to);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Copy file to new location
        fs.copyFileSync(move.from, move.to);
        console.log(`Copied ${move.from} to ${move.to}`);
    } else {
        console.log(`Warning: Source file ${move.from} does not exist`);
    }
});

// Move configuration files
const configMoves = [
    { from: 'vite.config.ts', to: 'config/vite.config.ts' },
    { from: 'tailwind.config.ts', to: 'config/tailwind.config.ts' },
    { from: 'tsconfig.json', to: 'config/tsconfig.json' },
    { from: 'drizzle.config.ts', to: 'config/drizzle.config.ts' }
];

configMoves.forEach(move => {
    if (fs.existsSync(move.from)) {
        fs.copyFileSync(move.from, move.to);
        console.log(`Copied ${move.from} to ${move.to}`);
    } else {
        console.log(`Warning: Source file ${move.from} does not exist`);
    }
});

// Move database scripts
const dbScriptMoves = [
    { from: 'test-db.js', to: 'scripts/db/test-db.js' },
    { from: 'backup-db.js', to: 'scripts/db/backup-db.js' },
    { from: 'add-indexes.js', to: 'scripts/db/add-indexes.js' },
    { from: 'import-data.js', to: 'scripts/db/import-data.js' },
    { from: 'bulk-import.js', to: 'scripts/db/bulk-import.js' }
];

dbScriptMoves.forEach(move => {
    if (fs.existsSync(move.from)) {
        fs.copyFileSync(move.from, move.to);
        console.log(`Copied ${move.from} to ${move.to}`);
    } else {
        console.log(`Warning: Source file ${move.from} does not exist`);
    }
});

// Move setup scripts
const setupScriptMoves = [
    { from: 'generate-secret.js', to: 'scripts/setup/generate-secret.js' },
    { from: 'generate-secret.cjs', to: 'scripts/setup/generate-secret.cjs' },
    { from: 'update-roles.js', to: 'scripts/setup/update-roles.js' }
];

setupScriptMoves.forEach(move => {
    if (fs.existsSync(move.from)) {
        fs.copyFileSync(move.from, move.to);
        console.log(`Copied ${move.from} to ${move.to}`);
    } else {
        console.log(`Warning: Source file ${move.from} does not exist`);
    }
});

console.log('Restructuring complete! Please verify the new structure before deleting old files.'); 