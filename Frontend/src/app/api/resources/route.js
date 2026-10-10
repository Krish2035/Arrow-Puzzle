import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const candidateDirs = [
      path.join(process.cwd(), 'resources'),
      path.join(process.cwd(), 'public', 'resources')
    ];

    const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];

    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        // Look for video files
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (videoExts.includes(ext)) {
            return NextResponse.json({
              found: true,
              filename: file,
              videoUrl: `/resources/${encodeURIComponent(file)}`
            });
          }
        }
      }
    }

    return NextResponse.json({
      found: false,
      message: 'No video found yet in Frontend/resources'
    });
  } catch (err) {
    return NextResponse.json({ found: false, error: err.message }, { status: 500 });
  }
}
