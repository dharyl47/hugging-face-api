import mongoose from 'mongoose';

// Define schema
const userProfileSchema = new mongoose.Schema({
  name: { type: String },
  dateCreated: { type: Date, default: Date.now },
  propertyRegime: { type: String, default: 'N/A' },
  deletionRequest: { type: String, default: 'N/A' },
  dependentsOver: { type: String, default: 'N/A' },
  dependentsUnder: { type: String, default: 'N/A' },
  will: { type: String, default: 'N/A' },
  willStatus: { type: String, default: 'N/A' },
  emailAddress: { type: String, default: 'N/A' },
  dateOfBirth: { type: String, default: 'N/A' },
  dependants: {
    spouse: { type: Boolean, default: false },
    children: { type: Boolean, default: false },
    stepChildren: { type: Boolean, default: false },
    grandChildren: { type: Boolean, default: false },
    factualDependents: { type: Boolean, default: false },
    other: { type: Boolean, default: false },
  },
  asset: {
    primaryResidents: { type: Boolean, default: false },
    otherRealEstate: { type: Boolean, default: false },
    bankAccounts: { type: Boolean, default: false },
    investmentAccounts: { type: Boolean, default: false },
    businessInterests: { type: Boolean, default: false },
    personalProperty: { type: Boolean, default: false },
    otherAsset: { type: Boolean, default: false },
  },
  maritalStatus: { type: String, default: 'Single' },
  investmentRisk: {
    lowRisk: { type: Boolean, default: false },
    mediumRisk: { type: Boolean, default: false },
    highRisk: { type: Boolean, default: false },
  },
  mvID: { type: String },
  templatesDownloaded: {
    will: { type: Boolean, default: false },
    trust: { type: Boolean, default: false },
    powerOfAttorney: { type: Boolean, default: false },
    livingWill: { type: Boolean, default: false },
  },
   ObjectivesOfEstatePlanning: {
    estatePlanFlexibility: { type: String, default: 'N/A' },
    businessProtectionImportance: { type: String, default: 'N/A' },
    financialSafeguardStrategies: { type: String, default: 'N/A' },
    insolvencyProtectionConcern: { type: String, default: 'N/A' },
    taxMinimizationPriority: { type: String, default: 'N/A' },
    estatePlanReviewConfidence: { type: String, default: 'N/A' },
  },
  Assets: {
    realEstateProperties: {
      uploadDocumentAtEndOfChat: { type: Boolean, default: false },  // Boolean to indicate document upload
      propertiesDetails: { type: String, default: '' },  // General property details
      inDepthDetails: {  // Nested object inside realEstateProperties
        propertyType: { type: String, default: 'N/A' },
        propertyLocation: { type: String, default: 'N/A' },
        propertySize: { type: String, default: 'N/A' },
        bedroomsAndBathroomCount: { type: String, default: 'N/A' },
        propertyCondition: { type: String, default: 'N/A' },
      },
    },
    // You can add more asset-related fields here if needed in the future
  },
  mvID: { type: String },
});

// Use the collection name in lowercase to match MongoDB collection
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
