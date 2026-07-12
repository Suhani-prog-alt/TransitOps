import { Schema, model, Types } from 'mongoose';

export interface IActivity {
  vehicle?: Types.ObjectId;
  type: 'Vehicle Added' | 'Maintenance Started' | 'Vehicle Retired' | 'Maintenance Completed' | 'Status Update' | 'System Alert';
  description: string;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    type: {
      type: String,
      enum: ['Vehicle Added', 'Maintenance Started', 'Vehicle Retired', 'Maintenance Completed', 'Status Update', 'System Alert'],
      required: true
    },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Activity = model<IActivity>('Activity', activitySchema);
export default Activity;
