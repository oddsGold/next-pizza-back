import { Schema, model } from 'mongoose';

const permissionsSchema = new Schema({
  action: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'upload'],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
}, { timestamps: true, versionKey: false });

export const PermissionsCollection = model('permission', permissionsSchema);