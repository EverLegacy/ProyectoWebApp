import { Schema, model } from 'mongoose';

export interface ActivityLogDocument {
  userId: number;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

const activityLogSchema = new Schema<ActivityLogDocument>({
  userId: { type: Number, required: true },
  action: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export const ActivityLog = model<ActivityLogDocument>('ActivityLog', activityLogSchema);

export interface UserSessionDocument {
  userId: number;
  token: string;
  device?: string;
  ip?: string;
  createdAt?: Date;
  expiresAt: Date;
}

const userSessionSchema = new Schema<UserSessionDocument>({
  userId: { type: Number, required: true },
  token: { type: String, required: true },
  device: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export const UserSession = model<UserSessionDocument>('UserSession', userSessionSchema);

export interface StoreAnalyticsDocument {
  storeId: number;
  date: string;
  totalSales: number;
  pointsIssued: number;
  scanCount: number;
}

const storeAnalyticsSchema = new Schema<StoreAnalyticsDocument>({
  storeId: { type: Number, required: true },
  date: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  pointsIssued: { type: Number, default: 0 },
  scanCount: { type: Number, default: 0 },
});

export const StoreAnalytics = model<StoreAnalyticsDocument>(
  'StoreAnalytics',
  storeAnalyticsSchema,
);

export interface RewardCatalogDocument {
  rewardId: number;
  imageUrl?: string;
  tags?: string[];
}

const rewardCatalogSchema = new Schema<RewardCatalogDocument>({
  rewardId: { type: Number, required: true },
  imageUrl: { type: String },
  tags: [{ type: String }],
});

export const RewardCatalog = model<RewardCatalogDocument>('RewardCatalog', rewardCatalogSchema);

export interface NotificationDocument {
  userId: number;
  message: string;
  read: boolean;
  createdAt?: Date;
}

const notificationSchema = new Schema<NotificationDocument>({
  userId: { type: Number, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = model<NotificationDocument>('Notification', notificationSchema);

export interface AppConfigDocument {
  key: string;
  value: unknown;
}

const appConfigSchema = new Schema<AppConfigDocument>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
});

export const AppConfig = model<AppConfigDocument>('AppConfig', appConfigSchema);
