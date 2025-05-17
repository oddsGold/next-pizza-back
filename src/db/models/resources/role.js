import { Schema, model } from 'mongoose';

const rolesSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
}, { timestamps: true, versionKey: false });

export const RolesCollection = model('role', rolesSchema);