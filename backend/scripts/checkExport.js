const path = require('path');
const fs = require('fs');
try {
  const target = path.join(__dirname, '..', 'utils', 'sendAccVerificationEmail');
  const resolved = require.resolve(target);
  console.log('Resolved path:', resolved);
  // Read and show first 200 chars of source
  const src = fs.readFileSync(resolved, 'utf8');
  console.log('Source preview:', src.slice(0, 200).replace(/\n/g, '\\n'));
  delete require.cache[resolved];
  const mod = require(resolved);
  console.log('typeof export:', typeof mod);
  console.dir(mod, { depth: null });
  console.log('keys:', Object.keys(mod));
  if (mod && mod.default) {
    console.log('default typeof:', typeof mod.default);
  }
} catch (e) {
  console.error('Error requiring module:', e);
  process.exit(1);
}
