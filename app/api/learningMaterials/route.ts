import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';
import LearningMaterial from '../../../models/LearningMaterial';

export async function GET() {
  try {
    await connectMongoDB(); // Ensure MongoDB is connected

    const learningMaterials = await LearningMaterial.find({});

    return NextResponse.json({ success: true, data: learningMaterials });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }

}
