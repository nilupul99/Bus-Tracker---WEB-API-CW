// Root entrypoint: forward to the real server in ./src
// Some hosting platforms (Render, etc.) expect a server.js at the repository root.
// Requiring the existing src/server.js keeps behavior identical while fixing the
// "Cannot find module '/opt/render/project/src/server.js'" error during deploy.
try {
  require('./src/server');
} catch (err) {
  console.error('Failed to start application from root server.js:', err);
  // Re-throw so hosting logs capture the startup error clearly
  throw err;
}
