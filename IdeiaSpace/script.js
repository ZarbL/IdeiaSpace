// Main script for IdeiaSpace application
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Development utilities
if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
}

// Application lifecycle
app.on('ready', () => {
    console.log('IdeiaSpace application ready');
});

app.on('before-quit', () => {
    console.log('Application is about to quit');
});

// Utility functions
function logSystemInfo() {
    console.log('System Info:', {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        electronVersion: process.versions.electron
    });
}

function setupGlobalShortcuts() {
    // Global shortcuts can be added here
    console.log('Global shortcuts setup');
}

// Export utilities
module.exports = {
    logSystemInfo,
    setupGlobalShortcuts
};
