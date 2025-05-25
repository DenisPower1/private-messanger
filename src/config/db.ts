import mongoose from 'mongoose';
import envConfig from './env.js';

const uri = envConfig.databaseConnectionUri;

const connectToDb = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connection to the database was made successfully!');
  } catch (err) {
    console.warn(`Error while connecting to the database: ${err}`);
    process.exit(1);
  }
};

export default connectToDb;
