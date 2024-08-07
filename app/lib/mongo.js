import mongoose from 'mongoose';

const connectMongoDB = async () => {
   

    try {
        await mongoose.connect("mongodb+srv://blacandbloo:jnijdnsfnjMLKNDVJKSfdfs3434@moneyversityai.ut7dw3f.mongodb.net/Moneyversity?retryWrites=true&w=majority&appName=MoneyversityAI", {
        });
        console.log("MongoDB connection successful");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
};

export default connectMongoDB;
