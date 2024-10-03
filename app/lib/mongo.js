// import mongoose from 'mongoose';

// const connectMongoDB = async () => {
   

//     try {
//         await mongoose.connect("mongodb+srv://blacandbloo:jnijdnsfnjMLKNDVJKSfdfs3434@moneyversityai.ut7dw3f.mongodb.net/Moneyversity?retryWrites=true&w=majority&appName=MoneyversityAI", {
//         });
//         console.log("MongoDB connection successful");
//     } catch (error) {
//         console.error("Failed to connect to MongoDB", error);
//         throw error;
//     }
// };

// export default connectMongoDB;


// app/lib/mongo.js
import mongoose from 'mongoose';

let isConnected = false; // Track MongoDB connection

const connectMongoDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected.");
    return;
  }

  try {
    await mongoose.connect("mongodb+srv://blacandbloo:jnijdnsfnjMLKNDVJKSfdfs3434@moneyversityai.ut7dw3f.mongodb.net/Moneyversity?retryWrites=true&w=majority&appName=MoneyversityAI", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000, // Increase to 30 seconds
      socketTimeoutMS: 30000, // Increase to 30 seconds
    });
    isConnected = true;
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
};

export default connectMongoDB;
