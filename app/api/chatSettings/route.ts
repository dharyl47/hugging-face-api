import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo'; // Adjust the import path as needed
import Chat from '../../../models/ChatData'; // Adjust the import path as needed

// Define an interface for the chat data structure
interface ChatData {
  _id: string;
  friendlyTone: string;
  mainPrompt: string;
  llamaModel: string;
}

export async function GET() {
  try {
    await connectMongoDB(); // Ensure MongoDB is connected

    // Fetch a single document from the Chat collection
    const chatData: ChatData | null = await Chat.findOne({}).exec();

    if (!chatData) {
      return NextResponse.json({ success: false, error: 'No settings found' }, { status: 404 });
    }

    // Return the fetched data directly
    return NextResponse.json({ success: true, data: chatData });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
