import { NextResponse } from 'next/server';
import connectMongoDB from '../../lib/mongo'; // Adjust the path to your MongoDB connection
import Settings from '../../../models/Settings'; // Import the Settings model
import FileData from '../../../models/FileData'; // Import the File model
import Chunk from '../../../models/Chunk'; // Import the Chunk model

const getMimeType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg': return 'image/jpeg';
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    await connectMongoDB();

    // Find settings with the provided filename
    const settings = await Settings.findOne({ engagingImage: filename }).exec();
    if (!settings) {
      return NextResponse.json({ error: 'File metadata not found' }, { status: 404 });
    }

    // Get the file ID from settings
    const fileId = settings.engagingImage;

    // Use the File model to get the file metadata
    const file = await FileData.findOne({ filename: fileId }).exec();
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Use the Chunk model to get the file chunks
    const chunks = await Chunk.find({ files_id: file._id }).sort({ n: 1 }).exec();
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'File chunks not found' }, { status: 404 });
    }

    // Concatenate all chunks
    const fileBuffer = Buffer.concat(chunks.map(chunk => chunk.data));
    const mimeType = getMimeType(fileId);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
      },
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
