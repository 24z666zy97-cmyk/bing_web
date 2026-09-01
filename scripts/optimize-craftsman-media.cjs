const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const sourceDir = path.resolve('prepare/public/Portfolio/stages/craftsman');
const outputDir = path.resolve('public/portfolio/stages/craftsman');

const images = [
  { source: '1.jpg', name: 'overview', widths: [960, 1440, 1920] },
  { source: '正面.jpg', name: 'front', widths: [900, 1400, 1800] },
  { source: '反面.jpg', name: 'back', widths: [900, 1400, 1800] },
];

async function optimizeImages() {
  for (const image of images) {
    const input = path.join(sourceDir, image.source);
    const metadata = await sharp(input).metadata();
    for (const width of image.widths.filter((value) => value <= metadata.width)) {
      const pipeline = sharp(input).resize({ width, withoutEnlargement: true });
      await pipeline.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(outputDir, `${image.name}-${width}.webp`));
      await pipeline.clone().avif({ quality: 55, effort: 5 }).toFile(path.join(outputDir, `${image.name}-${width}.avif`));
    }
  }
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await optimizeImages();
  await fs.copyFile(path.join(sourceDir, 'video.mp4'), path.join(outputDir, 'craftsman-path.mp4'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
