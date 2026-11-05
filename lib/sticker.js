import sharp from 'sharp';
import webpmux from 'node-webpmux';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'node:crypto';

const { Image } = webpmux;

const EXIF_HEADER = Buffer.from([
  0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
]);

/** يبني حزمة EXIF اللي واتساب يقراها لاسم الباك والمؤلف. */
function buildExif(pack, author) {
  const json = {
    'sticker-pack-id': randomUUID(),
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
  };
  const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([EXIF_HEADER, jsonBuf]);
  exif.writeUInt32LE(jsonBuf.length, 14);
  return exif;
}

/**
 * يحوّل صورة/فيديو (Buffer) لستيكر WebP.
 * الفيديو محتاج ffmpeg على النظام.
 */
export async function toSticker(buffer, { pack = 'FLASH BOT', author = 'FLASH', quality = 70 } = {}) {
  const kind = await fileTypeFromBuffer(buffer);
  if (!kind) throw new Error('نوع الملف غير معروف');

  let webp;
  if (kind.mime.startsWith('image/')) {
    webp = await sharp(buffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality })
      .toBuffer();
  } else if (kind.mime.startsWith('video/')) {
    const { default: ffmpeg } = await import('fluent-ffmpeg');
    webp = await new Promise((resolve, reject) => {
      const chunks = [];
      ffmpeg(buffer)
        .inputFormat(kind.ext)
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(chunks)))
        .outputOptions([
          '-vcodec libwebp',
          '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15',
          '-lossless 0', '-compression_level 6', '-q:v 50', '-loop 0', '-an',
        ])
        .format('webp')
        .pipe()
        .on('data', (c) => chunks.push(c));
    });
  } else {
    throw new Error('الملف لازم يكون صورة أو فيديو');
  }

  // إضافة بيانات الحزمة (pack/author)
  const img = new Image();
  await img.load(webp);
  img.exif = buildExif(pack, author);
  return img.save(null);
}

export default toSticker;
