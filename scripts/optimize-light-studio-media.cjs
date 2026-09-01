const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const sourceDir = path.resolve('prepare/public/Portfolio/stages/light');
const outputDir = path.resolve('public/portfolio/stages/light');
const widths = [960, 1440, 1920];
const images = [
  ['1封皮页.jpg', 'cover'],
  ['2目录页.jpg', 'contents'],
  ['4概念部分.jpg', 'concept'],
  ['5结构部分.png', 'structure'],
  ['6制作过程.jpg', 'construction'],
  ['7理论分析部分.jpg', 'analysis'],
  ['8效果部分.jpg', 'realization'],
  ['独立2.jpg', 'independent-concept'],
  ['独立.jpg', 'independent'],
];

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  for (const [source, name] of images) {
    const input = path.join(sourceDir, source);
    const outputWidths = name.startsWith('independent') ? [480, 720, 960] : widths;
    for (const width of outputWidths) {
      const pipeline = sharp(input).resize({ width, withoutEnlargement: true });
      await pipeline.clone().webp({ quality: 84, effort: 5 }).toFile(path.join(outputDir, `${name}-${width}.webp`));
      await pipeline.clone().avif({ quality: 58, effort: 5 }).toFile(path.join(outputDir, `${name}-${width}.avif`));
    }
  }
  await fs.copyFile(path.join(sourceDir, 'video.mp4'), path.join(outputDir, 'light-studio.mp4'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
