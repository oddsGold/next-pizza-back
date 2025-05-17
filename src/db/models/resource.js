import { Schema, model } from 'mongoose';

const resourcesSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true,
  },
}, { timestamps: true, versionKey: false });

export const ResourcesCollection = model('resource', resourcesSchema);