import mongoose from 'mongoose';

// Define connection interface for TypeScript
interface MongoConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to cache the connection in serverless environments
declare global {
  var mongoose: MongoConnection | undefined;
}

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'admire';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// Connection options for optimal performance and reliability
const options = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  dbName: MONGODB_DB,
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with connection pooling and caching for serverless environments
 * @returns Promise<typeof mongoose> - The mongoose connection
 */
async function connectDB(): Promise<typeof mongoose> {
  if (cached!.conn) {
    console.log('🚀 Using cached MongoDB connection');
    return cached!.conn;
  }

  if (!cached!.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    
    cached!.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      cached!.promise = null; // Reset promise on error
      throw error;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (error) {
    cached!.promise = null; // Reset promise on error
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * @returns Promise<void>
 */
async function disconnectDB(): Promise<void> {
  if (cached!.conn) {
    await cached!.conn.disconnect();
    cached!.conn = null;
    cached!.promise = null;
    console.log('🔌 MongoDB disconnected');
  }
}

/**
 * Check if MongoDB is connected
 * @returns boolean - Connection status
 */
function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get current connection state
 * @returns string - Connection state description
 */
function getConnectionState(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Handle connection events for monitoring
 */
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

export {
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionState,
  mongoose
};

export default connectDB;
