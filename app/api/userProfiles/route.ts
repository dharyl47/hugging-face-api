// app/api/your-endpoint/route.ts

import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';
import UserProfile from '../../../models/UserProfile';

export async function POST(req: Request) {
    try {
        console.log("Attempting to connect to MongoDB");
        await connectMongoDB();
        console.log("MongoDB connection successful");

        const { name, propertyRegime, encryptedName, checkboxes, checkboxesAsset, maritalStatus } = await req.json();

        if (name === '404') {
            return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
        }

        console.log("Searching for user profile");
        let userProfile = await UserProfile.findOne({ name });

        if (!userProfile) {
            console.log("Creating new user profile");
            userProfile = new UserProfile({
                name,
                propertyRegime,
                mvID: encryptedName,
                dependants: checkboxes,
                asset: checkboxesAsset,
                maritalStatus,
            });
        } else {
            console.log("Updating existing user profile");
            userProfile.propertyRegime = propertyRegime;
            userProfile.dependants = checkboxes;
            userProfile.asset = checkboxesAsset;
            userProfile.maritalStatus = maritalStatus;
        }

        await userProfile.save();
        console.log("User profile saved");
        return NextResponse.json(userProfile);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
