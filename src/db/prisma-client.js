import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

let prisma;

export const connectToDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      if (!global.prismaGlobal) {
        global.prismaGlobal = prismaClientSingleton();
      }
      prisma = global.prismaGlobal;
    } else {
      prisma = prismaClientSingleton();
    }

    await prisma.$connect();
    console.log('Successfully connected to the database with Prisma!');
  } catch (error) {
    console.error('Error while connecting to the database:', error);
    process.exit(1);
  }
};

export { prisma };
