import mongoose from 'mongoose';

// Define schema
const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  propertyRegime: { type: String, default: 'N/A'},
  dependants: {
    spouse: { type: Boolean, default: false },
    children: { type: Boolean, default: false },
    stepChildren: { type: Boolean, default: false },
    grandChildren: { type: Boolean, default: false },
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
  mvID: { type: String, required: true },
});

// Use the collection name in lowercase to match MongoDB collection
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
