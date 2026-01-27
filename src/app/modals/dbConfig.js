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
    const dbConnection = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections to maintain
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a socket operation
      connectTimeoutMS: 10000, // How long to wait for initial connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    });
    cachecdConn = dbConnection;
    console.log("connected");
    return dbConnection;
  } catch (error) {
    // SendMail(error);
    console.log(error);
    throw error; // Re-throw to allow callers to handle connection failures
  }
}
