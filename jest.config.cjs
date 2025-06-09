/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['dotenv/config'],

  // 👇 Tell Jest how to map `@shared/…` imports to your actual file location
  moduleNameMapper: {
    // if your schema file lives at <projectRoot>/shared/schema.ts:
    '^@shared/(.*)$': '<rootDir>/shared/$1.ts',
    // —OR— if it’s under the server folder, e.g. <projectRoot>/server/schema.ts:
    // '^@shared/(.*)$': '<rootDir>/server/$1.ts',
  },
};
