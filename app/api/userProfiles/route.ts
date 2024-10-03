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
      farmProperties,
      vehicleProperties,
      valuablePossessions,
      householdEffects,
      investmentPortfolio,
      bankBalances,
      businessAssets,
      otherAssets,
      intellectualPropertyRights,
      assetsInTrust,
      outstandingMortgageLoans,
      personalLoans,
      creditCardDebt,
      vehicleLoans,
      otherOutstandingDebts,
      strategyLiabilities,
      foreseeableFuture
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
  // Handle realEstateProperties
// Handle realEstateProperties
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

// Handle farmProperties
if (farmProperties) {
  if (farmProperties.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.farmProperties.uploadDocumentAtEndOfChat'] = farmProperties.uploadDocumentAtEndOfChat;
  }
  if (farmProperties.propertiesDetails) {
    updatedFields['Assets.farmProperties.propertiesDetails'] = farmProperties.propertiesDetails;
  }
}

// Handle vehicleProperties
if (vehicleProperties) {
  if (vehicleProperties.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.vehicleProperties.uploadDocumentAtEndOfChat'] = vehicleProperties.uploadDocumentAtEndOfChat;
  }
  if (vehicleProperties.propertiesDetails) {
    updatedFields['Assets.vehicleProperties.propertiesDetails'] = vehicleProperties.propertiesDetails;
  }
}

// Handle valuablePossessions
if (valuablePossessions) {
  if (valuablePossessions.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.valuablePossessions.uploadDocumentAtEndOfChat'] = valuablePossessions.uploadDocumentAtEndOfChat;
  }
  if (valuablePossessions.propertiesDetails) {
    updatedFields['Assets.valuablePossessions.propertiesDetails'] = valuablePossessions.propertiesDetails;
  }
}

// Handle householdEffects
if (householdEffects) {
  if (householdEffects.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.householdEffects.uploadDocumentAtEndOfChat'] = householdEffects.uploadDocumentAtEndOfChat;
  }
  if (householdEffects.propertiesDetails) {
    updatedFields['Assets.householdEffects.propertiesDetails'] = householdEffects.propertiesDetails;
  }
}

// Handle investmentPortfolio
if (investmentPortfolio) {
  if (investmentPortfolio.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.investmentPortfolio.uploadDocumentAtEndOfChat'] = investmentPortfolio.uploadDocumentAtEndOfChat;
  }
  if (investmentPortfolio.propertiesDetails) {
    updatedFields['Assets.investmentPortfolio.propertiesDetails'] = investmentPortfolio.propertiesDetails;
  }
}

// Handle bankBalances
if (bankBalances) {
  if (bankBalances.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.bankBalances.uploadDocumentAtEndOfChat'] = bankBalances.uploadDocumentAtEndOfChat;
  }
  if (bankBalances.propertiesDetails) {
    updatedFields['Assets.bankBalances.propertiesDetails'] = bankBalances.propertiesDetails;
  }
}

// Handle businessAssets
if (businessAssets) {
  if (businessAssets.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.businessAssets.uploadDocumentAtEndOfChat'] = businessAssets.uploadDocumentAtEndOfChat;
  }
  if (businessAssets.propertiesDetails) {
    updatedFields['Assets.businessAssets.propertiesDetails'] = businessAssets.propertiesDetails;
  }
}

// Handle otherAssets
if (otherAssets) {
  if (otherAssets.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.otherAssets.uploadDocumentAtEndOfChat'] = otherAssets.uploadDocumentAtEndOfChat;
  }
  if (otherAssets.propertiesDetails) {
    updatedFields['Assets.otherAssets.propertiesDetails'] = otherAssets.propertiesDetails;
  }
}

// Handle intellectualPropertyRights
if (intellectualPropertyRights) {
  if (intellectualPropertyRights.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.intellectualPropertyRights.uploadDocumentAtEndOfChat'] = intellectualPropertyRights.uploadDocumentAtEndOfChat;
  }
  if (intellectualPropertyRights.propertiesDetails) {
    updatedFields['Assets.intellectualPropertyRights.propertiesDetails'] = intellectualPropertyRights.propertiesDetails;
  }
}

// Handle assetsInTrust
if (assetsInTrust) {
  if (assetsInTrust.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Assets.assetsInTrust.uploadDocumentAtEndOfChat'] = assetsInTrust.uploadDocumentAtEndOfChat;
  }
  if (assetsInTrust.propertiesDetails) {
    updatedFields['Assets.assetsInTrust.propertiesDetails'] = assetsInTrust.propertiesDetails;
  }
}

// Handle Liabilities
if (outstandingMortgageLoans) {
  if (outstandingMortgageLoans.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.outstandingMortgageLoans.uploadDocumentAtEndOfChat'] = outstandingMortgageLoans.uploadDocumentAtEndOfChat;
  }
  if (outstandingMortgageLoans.propertiesDetails) {
    updatedFields['Liabilities.outstandingMortgageLoans.propertiesDetails'] = outstandingMortgageLoans.propertiesDetails;
  }
}

if (personalLoans) {
  if (personalLoans.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.personalLoans.uploadDocumentAtEndOfChat'] = personalLoans.uploadDocumentAtEndOfChat;
  }
  if (personalLoans.propertiesDetails) {
    updatedFields['Liabilities.personalLoans.propertiesDetails'] = personalLoans.propertiesDetails;
  }
}

if (creditCardDebt) {
  if (creditCardDebt.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.creditCardDebt.uploadDocumentAtEndOfChat'] = creditCardDebt.uploadDocumentAtEndOfChat;
  }
  if (creditCardDebt.propertiesDetails) {
    updatedFields['Liabilities.creditCardDebt.propertiesDetails'] = creditCardDebt.propertiesDetails;
  }
}

if (vehicleLoans) {
  if (vehicleLoans.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.vehicleLoans.uploadDocumentAtEndOfChat'] = vehicleLoans.uploadDocumentAtEndOfChat;
  }
  if (vehicleLoans.propertiesDetails) {
    updatedFields['Liabilities.vehicleLoans.propertiesDetails'] = vehicleLoans.propertiesDetails;
  }
}

if (otherOutstandingDebts) {
  if (otherOutstandingDebts.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.otherOutstandingDebts.uploadDocumentAtEndOfChat'] = otherOutstandingDebts.uploadDocumentAtEndOfChat;
  }
  if (otherOutstandingDebts.propertiesDetails) {
    updatedFields['Liabilities.otherOutstandingDebts.propertiesDetails'] = otherOutstandingDebts.propertiesDetails;
  }
}

if (strategyLiabilities) {
  if (strategyLiabilities.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.strategyLiabilities.uploadDocumentAtEndOfChat'] = strategyLiabilities.uploadDocumentAtEndOfChat;
  }
  if (strategyLiabilities.propertiesDetails) {
    updatedFields['Liabilities.strategyLiabilities.propertiesDetails'] = strategyLiabilities.propertiesDetails;
  }
}

if (foreseeableFuture) {
  if (foreseeableFuture.uploadDocumentAtEndOfChat !== undefined) {
    updatedFields['Liabilities.foreseeableFuture.uploadDocumentAtEndOfChat'] = foreseeableFuture.uploadDocumentAtEndOfChat;
  }
  if (foreseeableFuture.propertiesDetails) {
    updatedFields['Liabilities.foreseeableFuture.propertiesDetails'] = foreseeableFuture.propertiesDetails;
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
