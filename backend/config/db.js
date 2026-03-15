
import mongoose from "mongoose"

// config mongodb 
export const connectDb= async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)

        console.log("Mongo db connected");
    } catch (error) {
        console.log("Mongo db connection failed",error);

    }
}

export default connectDb;