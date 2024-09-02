// app/api/userProfiles/checkUser/route.ts
import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';
import UserProfile from '../../../models/UserProfile';

export async function GET(req: Request) {
    try {
        console.log("Attempting to connect to MongoDB");
        await connectMongoDB();
        console.log("MongoDB connection successful");

        const url = new URL(req.url);
        const username = url.searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const userProfile = await UserProfile.findOne({ name: username });

        if (userProfile) {
            return NextResponse.json({ exists: true });
        } else {
            return NextResponse.json({ exists: false });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
