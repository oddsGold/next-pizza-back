import { loadResourceMap } from '../utils/resource-loader.js';
import { ResourcesCollection } from './models/resource.js';

export const syncResourcesToDB = async () => {
  const resourceMap = await loadResourceMap();

  for (const [name, label] of Object.entries(resourceMap)) {
    const existing = await ResourcesCollection.findOne({ name });

    if (!existing) {
      await ResourcesCollection.create({ name, label });
      console.log(`✅ Синхронизировано: ${name}`);
    } else {
      console.log(`ℹ️ Уже существует: ${name}`);
    }
  }
};