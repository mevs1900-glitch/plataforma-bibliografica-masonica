import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertDocument, documents,
  InsertNotification, notifications,
  InsertAnnouncement, announcements,
  InsertInvitation, invitations,
  InsertInvitationUse, invitationUses
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; values.isApproved = true; updateSet.isApproved = true; }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function approveUser(userId: number) { const db = await getDb(); if (db) await db.update(users).set({ isApproved: true }).where(eq(users.id, userId)); }
export async function rejectUser(userId: number) { const db = await getDb(); if (db) await db.update(users).set({ isApproved: false }).where(eq(users.id, userId)); }
export async function getPendingUsers() { const db = await getDb(); if (!db) return []; return db.select().from(users).where(eq(users.isApproved, false)).orderBy(desc(users.createdAt)); }
export async function getAllApprovedUsers() { const db = await getDb(); if (!db) return []; return db.select().from(users).where(eq(users.isApproved, true)); }
export async function getAllUsers() { const db = await getDb(); if (!db) return []; return db.select().from(users).orderBy(desc(users.createdAt)); }
export async function getAdminUsers() { const db = await getDb(); if (!db) return []; return db.select().from(users).where(eq(users.role, "admin")); }
export async function updateUserRole(userId: number, role: "user" | "admin") { const db = await getDb(); if (db) await db.update(users).set({ role }).where(eq(users.id, userId)); }

// ─── Documents ────────────────────────────────────────────────

export async function createDocument(doc: InsertDocument) { const db = await getDb(); if (!db) throw new Error("Database not available"); await db.insert(documents).values(doc); }
export async function getDocumentsByUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt)); }

export async function getApprovedDocuments(search?: string, category?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions: ReturnType<typeof eq>[] = [eq(documents.status, "approved")];
  if (search) { const sc = or(like(documents.title, `%${search}%`), like(documents.author, `%${search}%`)); if (sc) conditions.push(sc); }
  if (category) conditions.push(eq(documents.category, category));
  return db.select().from(documents).where(and(...conditions)).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1); return result.length > 0 ? result[0] : undefined; }
export async function getAllDocuments() { const db = await getDb(); if (!db) return []; return db.select().from(documents).orderBy(desc(documents.createdAt)); }
export async function updateDocumentStatus(documentId: number, status: "approved" | "rejected") { const db = await getDb(); if (db) await db.update(documents).set({ status }).where(eq(documents.id, documentId)); }
export async function deleteDocument(documentId: number) { const db = await getDb(); if (db) await db.delete(documents).where(eq(documents.id, documentId)); }

// ─── Notifications ────────────────────────────────────────────

export async function createNotification(notif: InsertNotification) { const db = await getDb(); if (db) await db.insert(notifications).values(notif); }
export async function getNotificationsByUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)); }
export async function markNotificationRead(notificationId: number, userId: number) { const db = await getDb(); if (db) await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId))); }
export async function markAllNotificationsRead(userId: number) { const db = await getDb(); if (db) await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId)); }

// ─── Announcements ────────────────────────────────────────────

export async function createAnnouncement(a: InsertAnnouncement) { const db = await getDb(); if (db) await db.insert(announcements).values(a); }
export async function getAnnouncements() { const db = await getDb(); if (!db) return []; return db.select().from(announcements).orderBy(desc(announcements.createdAt)); }
export async function deleteAnnouncement(id: number) { const db = await getDb(); if (db) await db.delete(announcements).where(eq(announcements.id, id)); }

// ─── Invitations ──────────────────────────────────────────────

export async function createInvitation(inv: InsertInvitation) { const db = await getDb(); if (db) await db.insert(invitations).values(inv); }
export async function getInvitationsByAdmin(adminId: number) { const db = await getDb(); if (!db) return []; return db.select().from(invitations).where(eq(invitations.createdBy, adminId)).orderBy(desc(invitations.createdAt)); }
export async function getAllInvitations() { const db = await getDb(); if (!db) return []; return db.select().from(invitations).orderBy(desc(invitations.createdAt)); }
export async function getInvitationByCode(code: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(invitations).where(eq(invitations.code, code)).limit(1); return result.length > 0 ? result[0] : undefined; }
export async function activateInvitation(invitationId: number) { const db = await getDb(); if (db) await db.update(invitations).set({ isActive: true }).where(eq(invitations.id, invitationId)); }
export async function deactivateInvitation(invitationId: number) { const db = await getDb(); if (db) await db.update(invitations).set({ isActive: false }).where(eq(invitations.id, invitationId)); }
export async function incrementInvitationUsage(invitationId: number) { const db = await getDb(); if (db) await db.update(invitations).set({ usedCount: sql`used_count + 1` }).where(eq(invitations.id, invitationId)); }
export async function recordInvitationUse(use: InsertInvitationUse) { const db = await getDb(); if (db) await db.insert(invitationUses).values(use); }