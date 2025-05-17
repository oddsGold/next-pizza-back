import { model, Schema } from 'mongoose';
import {
  mongooseSaveError,
  updateDailyRateWater,
} from './hooks.js';

const usersSchema = new Schema(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'role',
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'https://i.pinimg.com/736x/7b/8c/d8/7b8cd8b068e4b9f80b4bcf0928d7d499.jpg',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

usersSchema.post('save', mongooseSaveError);

usersSchema.post('findOneAndUpdate', mongooseSaveError);

usersSchema.pre('findOneAndUpdate', updateDailyRateWater);
export const UsersCollection = model('users', usersSchema);
