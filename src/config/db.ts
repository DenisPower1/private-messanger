import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const uri = process.env.database_connection_uri;
const dbName = process.env.database_name;
const appName = process.env.app_name;

const connectToDb = async () => {
  try {
    await mongoose.connect(uri || '', {
      dbName: dbName,
      appName: appName,
    });
    console.log('Connection to the database was made successfully!');
  } catch (err) {
    console.warn(`Error while connecting to the database: ${err}`);
    process.exit(1);
  }
};

export default connectToDb;
