const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const icoPath = path.join(__dirname, 'public', 'favicon.ico');

console.log('--- generating favicon.ico from star ---');

try {
  // Ensure the SVG exists
  if (!fs.existsSync(svgPath)) {
    console.error('error: public/favicon.svg not found.');
    process.exit(1);
  }

  console.log('running conversion...');
  execSync(`npx -y svg-to-ico ${svgPath} ${icoPath}`, { stdio: 'inherit' });
  
  console.log('success: favicon.ico generated in public/ folder.');
} catch (error) {
  console.error('error generating favicon:', error.message);
}
