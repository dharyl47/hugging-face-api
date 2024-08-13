import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';
import Setting from '../../../models/Settings';

export async function GET() {
  try {
    await connectMongoDB(); // Ensure MongoDB is connected

    const settings = await Setting.find({});

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }

}
