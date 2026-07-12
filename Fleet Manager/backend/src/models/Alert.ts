import { Schema, model, Types } from 'mongoose';

export interface IAlert {
  vehicle: Types.ObjectId;
  type: 'Maintenance Due' | 'Insurance Expiry' | 'Idle Vehicle' | 'Mileage Limit' | 'High Cost' | 'Long Downtime';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: {
      type: String,
      enum: ['Maintenance Due', 'Insurance Expiry', 'Idle Vehicle', 'Mileage Limit', 'High Cost', 'Long Downtime'],
      required: true
    },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning'
    },
    isResolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Alert = model<IAlert>('Alert', alertSchema);
export default Alert;
