import mongoose from "mongoose";
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI;

if (!MONGODB_URI) {
  // sendMail(uri )
  throw new Error("uri not defined");
}

let cachecdConn = null;

export async function connect() {
  if (cachecdConn) return cachecdConn;
  try {
    const dbConnection = await mongoose.connect(MONGODB_URI);
    cachecdConn = dbConnection;
    console.log("connected");
    return dbConnection;
  } catch (error) {
    // SendMail(error);
    console.log(error);
  }
}
