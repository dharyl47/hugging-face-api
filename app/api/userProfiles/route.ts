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
      estatePlanFlexibility,
      businessProtectionImportance,
      financialSafeguardStrategies,
      insolvencyProtectionConcern,
      dependentsMaintenanceImportance,
      taxMinimizationPriority,
      estatePlanReviewConfidence,
      realEstateProperties, // added for updating Assets.realEstateProperties
    } = await req.json();

    if (!name || name === '404') {
      return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    console.log("Updating or creating user profile");

    const updatedFields: any = {};

    // Update specific fields in user profile
    if (dateOfBirth) updatedFields.dateOfBirth = dateOfBirth;
    if (will) updatedFields.will = will;
    if (dateCreated) updatedFields.dateCreated = dateCreated;
    if (willStatus) updatedFields.willStatus = willStatus;
    if (deletionRequest) updatedFields.deletionRequest = deletionRequest;
    if (emailAddress) updatedFields.emailAddress = emailAddress;
    if (dependentsOver) updatedFields.dependentsOver = dependentsOver;
    if (dependentsUnder) updatedFields.dependentsUnder = dependentsUnder;
    if (propertyRegime) updatedFields.propertyRegime = propertyRegime;
    if (checkboxesAsset) updatedFields['Assets.checkboxesAsset'] = checkboxesAsset;  // Update Asset-related fields
    if (maritalStatus) updatedFields.maritalStatus = maritalStatus;

    // Update fields inside ObjectivesOfEstatePlanning without overwriting
    if (estatePlanFlexibility) updatedFields['ObjectivesOfEstatePlanning.estatePlanFlexibility'] = estatePlanFlexibility;
    if (businessProtectionImportance) updatedFields['ObjectivesOfEstatePlanning.businessProtectionImportance'] = businessProtectionImportance;
    if (financialSafeguardStrategies) updatedFields['ObjectivesOfEstatePlanning.financialSafeguardStrategies'] = financialSafeguardStrategies;
    if (insolvencyProtectionConcern) updatedFields['ObjectivesOfEstatePlanning.insolvencyProtectionConcern'] = insolvencyProtectionConcern;
    if (taxMinimizationPriority) updatedFields['ObjectivesOfEstatePlanning.taxMinimizationPriority'] = taxMinimizationPriority;
    if (estatePlanReviewConfidence) updatedFields['ObjectivesOfEstatePlanning.estatePlanReviewConfidence'] = estatePlanReviewConfidence;

    // Update fields inside realEstateProperties within Assets
    if (realEstateProperties) {
      if (realEstateProperties.uploadDocumentAtEndOfChat !== undefined) {
        updatedFields['Assets.realEstateProperties.uploadDocumentAtEndOfChat'] = realEstateProperties.uploadDocumentAtEndOfChat;
      }
      if (realEstateProperties.propertiesDetails) {
        updatedFields['Assets.realEstateProperties.propertiesDetails'] = realEstateProperties.propertiesDetails;
      }
      if (realEstateProperties.inDepthDetails) {
        if (realEstateProperties.inDepthDetails.propertyType) {
          updatedFields['Assets.realEstateProperties.inDepthDetails.propertyType'] = realEstateProperties.inDepthDetails.propertyType;
        }
        if (realEstateProperties.inDepthDetails.propertyLocation) {
          updatedFields['Assets.realEstateProperties.inDepthDetails.propertyLocation'] = realEstateProperties.inDepthDetails.propertyLocation;
        }
        if (realEstateProperties.inDepthDetails.propertySize) {
          updatedFields['Assets.realEstateProperties.inDepthDetails.propertySize'] = realEstateProperties.inDepthDetails.propertySize;
        }
        if (realEstateProperties.inDepthDetails.bedroomsAndBathroomCount) {
          updatedFields['Assets.realEstateProperties.inDepthDetails.bedroomsAndBathroomCount'] = realEstateProperties.inDepthDetails.bedroomsAndBathroomCount;
        }
        if (realEstateProperties.inDepthDetails.propertyCondition) {
          updatedFields['Assets.realEstateProperties.inDepthDetails.propertyCondition'] = realEstateProperties.inDepthDetails.propertyCondition;
        }
      }
    }

    if (encryptedName) updatedFields.mvID = encryptedName;  // Ensure mvID is only updated if it's not empty

    // Ensure that 'dependants' includes 'stepChildren' and 'grandChildren' by merging with default values
    const defaultDependants = {
      spouse: false,
      children: false,
      stepChildren: false,
      grandChildren: false,
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

    // Log the data that is being used to update the profile
    console.log("Data to be updated:", updatedFields);

    // Use dot notation to update the fields inside nested objects without overwriting
    let userProfile = await UserProfile.findOneAndUpdate(
      { name },
      { $set: updatedFields },  // Using dot notation to update nested fields
      { new: true, upsert: true }
    );

    // Log the document that was updated/created
    console.log("Updated or created User Profile:", userProfile);

    console.log("User profile saved/updated");
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
