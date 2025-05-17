import { ResourcesCollection } from '../models/resource.js';

export const seedResources = async () => {
  const existing = await ResourcesCollection.findOne({ name: 'Models\\Menu' });
  if (existing) {
    console.log('Resource "App\\Models\\Menu" already seeded');
    return;
  }

  await ResourcesCollection.create({ name: 'Models\\Menu', label: 'Menu' } );
  console.log('Resource "Models\\Menu" seeded successfully ✅');
};
