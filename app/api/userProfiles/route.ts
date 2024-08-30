import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';
import UserProfile from '../../../models/UserProfile';

export async function POST(req: Request) {
    try {
        console.log("Attempting to connect to MongoDB");
        await connectMongoDB();
        console.log("MongoDB connection successful");

        const { name, dateOfBirth, emailAddress, dependentsOver, dependentsUnder, propertyRegime, encryptedName, checkboxes, checkboxesAsset, maritalStatus } = await req.json();

        if (name === '404') {
            return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
        }

        console.log("Updating or creating user profile");

        const updatedFields: any = {};
        if (dateOfBirth) updatedFields.dateOfBirth = dateOfBirth;
        if (emailAddress) updatedFields.emailAddress = emailAddress;
        if (dependentsOver) updatedFields.dependentsOver = dependentsOver;
        if (dependentsUnder) updatedFields.dependentsUnder = dependentsUnder;
        if (propertyRegime) updatedFields.propertyRegime = propertyRegime;
        if (checkboxes) updatedFields.dependants = checkboxes;
        if (checkboxesAsset) updatedFields.asset = checkboxesAsset;
        if (maritalStatus) updatedFields.maritalStatus = maritalStatus;

        let userProfile = await UserProfile.findOneAndUpdate(
            { name },
            { $set: updatedFields, mvID: encryptedName },
            { new: true, upsert: true }
        );

        console.log("User profile saved/updated");
        return NextResponse.json(userProfile);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
