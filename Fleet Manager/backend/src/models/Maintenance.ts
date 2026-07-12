import { Schema, model, Types } from 'mongoose';

export interface IMaintenance {
  vehicle: Types.ObjectId;
  type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  mechanic: string;
  estimatedCost: number;
  actualCost: number;
  startDate: Date;
  expectedCompletion: Date;
  completionDate?: Date;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, required: true }, // e.g. Brake Inspection, Oil Change, Tire Replacement, General Service, Engine Check
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true
    },
    description: { type: String, required: true },
    mechanic: { type: String, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
    actualCost: { type: Number, default: 0 },
    startDate: { type: Date, required: true, default: Date.now },
    expectedCompletion: { type: Date, required: true },
    completionDate: { type: Date },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    }
  },
  { timestamps: true }
);

export const Maintenance = model<IMaintenance>('Maintenance', maintenanceSchema);
export default Maintenance;
