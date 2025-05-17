import { connectToDatabase  } from './db/prisma-client.js';
import { initMongoDB } from './db/initMongoDB.js';
import { startServer } from './server.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { initRedis } from './db/initRedis.js';
import { syncResourcesToDB } from './db/syncResourcesToDB.js';
import { seeds } from './db/seed/index.js';

const bootstrap = async () => {
  await initMongoDB();
  await connectToDatabase ();
  await initRedis();
  await syncResourcesToDB();
  await seeds();
  await createDirIfNotExists(TEMP_UPLOAD_DIR);
  await createDirIfNotExists(UPLOAD_DIR);
  startServer();
};

bootstrap();
