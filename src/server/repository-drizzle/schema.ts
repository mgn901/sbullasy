import { date, inet, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const userAccountTable = pgTable('user_accounts', {
  id: varchar({ length: 16 }).primaryKey(),
  emailAddress: varchar({ length: 256 }).notNull().unique(),
  registeredAt: date({ mode: 'date' }).notNull(),
});

export const accessTokenTable = pgTable('access_tokens', {
  id: varchar({ length: 16 }).primaryKey(),
  secret: varchar({ length: 64 }).notNull().unique(),
  logInUserId: varchar({ length: 16 }).notNull(),
  ipAddress: inet().notNull(),
  userAgent: text().notNull(),
  loggedInAt: date({ mode: 'date' }).notNull(),
  lastUsedAt: date({ mode: 'date' }).notNull(),
  expiredAt: date({ mode: 'date' }).notNull(),
  status: varchar({ enum: ['valid-or-expired', 'revoked'] }).notNull(),
});

export const authenticationAttemptTable = pgTable('authentication_attempts', {
  type: varchar({ enum: ['registration', 'log-in'] }).notNull(),
  id: varchar({ length: 16 }).primaryKey(),
  emailAddress: varchar({ length: 256 }).notNull(),
  ipAddress: inet().notNull(),
  userAgent: text().notNull(),
  status: varchar({ enum: ['attempted', 'completed', 'canceled'] }).notNull(),
  attemptedAt: date({ mode: 'date' }).notNull(),
  associatedEmailVerificationId: varchar({ length: 16 }).notNull(),
  userId: varchar({ length: 16 }),
});

export const certifiedUserProfileTable = pgTable('certified_user_profiles', {
  certifiedUserId: varchar({ length: 16 }).primaryKey(),
  name: varchar({ length: 16 }).notNull().unique(),
  displayName: varchar({ length: 64 }).notNull(),
  certifiedAt: date({ mode: 'date' }).notNull(),
  expiredAt: date({ mode: 'date' }).notNull(),
});
