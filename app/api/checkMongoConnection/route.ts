import { NextResponse } from 'next/server';
import connectMongoDB from '../../lib/mongo'; // Adjust the path as needed

export async function GET() {
  try {
    await connectMongoDB(); // Check the MongoDB connection
    return NextResponse.json({ message: 'MongoDB is connected' }, { status: 200 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ message: 'Failed to connect to MongoDB' }, { status: 500 });
  }
}

