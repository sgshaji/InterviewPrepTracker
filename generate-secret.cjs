const crypto = require('crypto');

// Generate a random string of 64 characters
const secret = crypto.randomBytes(32).toString('hex');

console.log('\n=== Secure Session Secret ===');
console.log('Use this in your .env file as SESSION_SECRET:');
console.log('\n' + secret + '\n');
console.log('=== End Secret ===\n'); 