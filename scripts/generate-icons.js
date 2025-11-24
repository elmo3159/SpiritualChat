const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../public/icons/icon-192x192.png');
const outputDir = path.join(__dirname, '../public/icons');
const faviconPath = path.join(__dirname, '../public/favicon.ico');

async function generateIcons() {
  try {
    // Generate 16x16 icon
    await sharp(sourceIcon)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'icon-16x16.png'));
    console.log('✓ icon-16x16.png 作成完了');

    // Generate 32x32 icon
    await sharp(sourceIcon)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'icon-32x32.png'));
    console.log('✓ icon-32x32.png 作成完了');

    // Generate favicon.ico (32x32 is commonly used)
    await sharp(sourceIcon)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(faviconPath);
    console.log('✓ favicon.ico 作成完了');

    console.log('\n全てのアイコンが正常に生成されました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

generateIcons();
