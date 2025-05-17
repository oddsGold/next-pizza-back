import { Schema, model } from 'mongoose';

const menuSchema = new Schema(
  {
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: 'menu',
      default: null,
    },
    resource_id: {
      type: Schema.Types.ObjectId,
      ref: 'resource',
      default: null,
    },
    permission_id: {
      type: Schema.Types.ObjectId,
      ref: 'permission',
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    urn: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

menuSchema.methods.getChildren = async function() {
  try {
    return await MenuCollection.find({ parent_id: this._id });
  } catch (error) {
    console.error('Error getting children:', error);
    return [];
  }
};

export const MenuCollection = model('menu', menuSchema);
