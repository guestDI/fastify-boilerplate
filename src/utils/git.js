'use strict';

const { exec } = require('child_process');

async function initializeGitRepo(projectDir, spinner) {
  return new Promise((resolve, reject) => {
    exec('git init', { cwd: projectDir }, (error, stdout, stderr) => {
      if (error) {
        spinner.fail('Failed to initialize Git repository');
        console.error('Error initializing Git:', stderr);
        reject(error);
      } else {
        spinner.succeed('Git repository initialized successfully');
        resolve();
      }
    });
  });
}

module.exports = { initializeGitRepo };
