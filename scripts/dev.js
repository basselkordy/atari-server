import { execSync } from 'child_process';

// Only run chcp on Windows
if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to set code page:', err.message);
  }
}

// Start the dev server
execSync('tsx watch --env-file=.env src/index.ts', { stdio: 'inherit' });
