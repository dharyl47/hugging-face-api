// app/api/testMongo/route.ts
import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';

export async function POST(req: Request) {
  try {
    console.log("Attempting to connect to MongoDB");
    await connectMongoDB();
    console.log("MongoDB connection successful");

    return NextResponse.json({ message: "MongoDB connection successful" });
  } catch (error) {
    console.error("MongoDB connection failed", error);
    return NextResponse.json({ error: "MongoDB connection failed" }, { status: 500 });
  }
}
