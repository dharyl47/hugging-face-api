import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongo';
import UserProfile from '../../../models/UserProfile';

export async function POST(req: Request) {
  try {
    console.log("Attempting to connect to MongoDB");
    await connectMongoDB();
    console.log("MongoDB connection successful");

    // Extract template-related fields along with other user details
    const {
      name,
      dateOfBirth,
      will,
      willStatus,
      dateCreated,
      emailAddress,
      deletionRequest,
      dependentsOver,
      dependentsUnder,
      propertyRegime,
      encryptedName,
      checkboxes,
      checkboxesAsset,
      maritalStatus,
      templatesDownloaded,
    } = await req.json();

    if (name === '404') {
      return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    console.log("Updating or creating user profile");

    const updatedFields: any = {};
    if (dateOfBirth) updatedFields.dateOfBirth = dateOfBirth;
    if (will) updatedFields.will = will;
    if (dateCreated) updatedFields.dateCreated = dateCreated;
    if (willStatus) updatedFields.willStatus = willStatus;
    if (deletionRequest) updatedFields.deletionRequest = deletionRequest;
    if (emailAddress) updatedFields.emailAddress = emailAddress;
    if (dependentsOver) updatedFields.dependentsOver = dependentsOver;
    if (dependentsUnder) updatedFields.dependentsUnder = dependentsUnder;
    if (propertyRegime) updatedFields.propertyRegime = propertyRegime;
    if (checkboxesAsset) updatedFields.asset = checkboxesAsset;
    if (maritalStatus) updatedFields.maritalStatus = maritalStatus;

    // Ensure that 'dependants' includes 'stepChildren' and 'grandChildren' by merging with default values
    const defaultDependants = {
      spouse: false,
      children: false,
      stepChildren: false,  // Add stepChildren
      grandChildren: false, // Add grandChildren
      factualDependents: false,
      other: false,
    };

    if (checkboxes) {
      updatedFields.dependants = {
        ...defaultDependants, // Include default values for dependants
        ...checkboxes,        // Merge with provided checkboxes
      };
    }

    // Handle the templatesDownloaded updates if provided in the request
    if (templatesDownloaded) {
      updatedFields.templatesDownloaded = templatesDownloaded;
    }

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
