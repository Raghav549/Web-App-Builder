import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  numericId: integer("numeric_id").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  alternateBio: text("alternate_bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  isVerified: boolean("is_verified").notNull().default(true),
  role: text("role").notNull().default("user"), // "user" | "creator"
  isPrivate: boolean("is_private").notNull().default(false),
  mixChannelId: text("mix_channel_id"),
  // Privacy settings
  whoCanMessage: text("who_can_message").notNull().default("everyone"),
  whoCanComment: text("who_can_comment").notNull().default("everyone"),
  whoCanViewFollowers: text("who_can_view_followers").notNull().default("everyone"),
  whoCanDownload: text("who_can_download").notNull().default("everyone"),
  // Chat settings
  readReceipts: boolean("read_receipts").notNull().default(true),
  typingIndicators: boolean("typing_indicators").notNull().default(true),
  showOnlineStatus: boolean("show_online_status").notNull().default(true),
  whoCanMessageMe: text("who_can_message_me").notNull().default("everyone"),
  // Notification settings
  notifVotes: boolean("notif_votes").notNull().default(true),
  notifNewFollowers: boolean("notif_new_followers").notNull().default(true),
  notifFollowRequests: boolean("notif_follow_requests").notNull().default(true),
  notifLikes: boolean("notif_likes").notNull().default(true),
  notifComments: boolean("notif_comments").notNull().default(true),
  notifReplies: boolean("notif_replies").notNull().default(true),
  notifMessages: boolean("notif_messages").notNull().default(true),
  notifMentions: boolean("notif_mentions").notNull().default(true),
  notifPostShares: boolean("notif_post_shares").notNull().default(true),
  notifProfileViews: boolean("notif_profile_views").notNull().default(true),
  notifAiNewPosts: boolean("notif_ai_new_posts").notNull().default(true),
  notifSystemAlerts: boolean("notif_system_alerts").notNull().default(true),
  // Vote goal (for creator)
  goalVotes: integer("goal_votes").notNull().default(10000),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
