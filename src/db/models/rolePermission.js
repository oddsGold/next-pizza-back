import { model, Schema } from 'mongoose';

const rolePermissionSchema = new Schema({
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'role',
    required: true
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'resource',
    required: true
  },
  permissionId: {
    type: Schema.Types.ObjectId,
    ref: 'permission',
    required: true
  },
}, { timestamps: true, versionKey: false });

export const RolePermissionCollection = model('rolePermission', rolePermissionSchema);