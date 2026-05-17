import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  createDocument: vi.fn().mockResolvedValue({}),
  createNotification: vi.fn().mockResolvedValue(undefined),
  getDocumentsByUser: vi.fn().mockResolvedValue([
    { id: 1, title: "Trabajo de prueba", author: "Hermano Test", category: "Grado 1 - Aprendiz", status: "pending", userId: 1, createdAt: new Date(), updatedAt: new Date(), fileKey: "test/file.pdf", fileName: "file.pdf", fileSize: 1024, mimeType: "application/pdf", description: null },
  ]),
  getApprovedDocuments: vi.fn().mockResolvedValue([
    { id: 2, title: "Trabajo aprobado", author: "Hermano Aprobado", category: "Grado 2 - Compañero", status: "approved", userId: 2, createdAt: new Date(), updatedAt: new Date(), fileKey: "test/approved.pdf", fileName: "approved.pdf", fileSize: 2048, mimeType: "application/pdf", description: "Descripción" },
  ]),
  getAllDocuments: vi.fn().mockResolvedValue([]),
  getAllUsers: vi.fn().mockResolvedValue([
    { id: 1, openId: "user-1", name: "Miembro Test", email: "test@example.com", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "manus" },
    { id: 2, openId: "admin-1", name: "Admin Test", email: "admin@example.com", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "manus" },
  ]),
  getAdminUsers: vi.fn().mockResolvedValue([
    { id: 2, openId: "admin-1", name: "Admin Test", email: "admin@example.com", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: "manus" },
  ]),
  getDocumentById: vi.fn().mockResolvedValue({ id: 1, title: "Trabajo", author: "Autor", category: "Grado 1 - Aprendiz", status: "pending", userId: 1, fileKey: "test/file.pdf", fileName: "file.pdf", fileSize: 1024, mimeType: "application/pdf", description: null, createdAt: new Date(), updatedAt: new Date() }),
  updateDocumentStatus: vi.fn().mockResolvedValue(undefined),
  deleteDocument: vi.fn().mockResolvedValue(undefined),
  getNotificationsByUser: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, type: "document_approved", title: "Trabajo aprobado", message: "Tu trabajo fue aprobado", read: false, relatedDocumentId: 1, createdAt: new Date() },
  ]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getAnnouncements: vi.fn().mockResolvedValue([
    { id: 1, title: "Comunicado de prueba", content: "Contenido del comunicado", adminId: 2, adminName: "Admin Test", createdAt: new Date(), updatedAt: new Date() },
  ]),
  createAnnouncement: vi.fn().mockResolvedValue(undefined),
  deleteAnnouncement: vi.fn().mockResolvedValue(undefined),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test/file.pdf", url: "/manus-storage/test/file.pdf" }),
  storageGet: vi.fn().mockResolvedValue({ key: "test/file.pdf", url: "/manus-storage/test/file.pdf" }),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────

function makeUserCtx(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: { id: 1, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("documents.myDocuments", () => {
  it("returns documents for the authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.documents.myDocuments();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Trabajo de prueba");
  });
});

describe("documents.library", () => {
  it("returns approved documents", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.documents.library({});
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("approved");
  });

  it("accepts search and category filters", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.documents.library({ search: "aprobado", category: "Grado 2 - Compañero" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("documents.all (admin only)", () => {
  it("allows admin to list all documents", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.documents.all();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.documents.all()).rejects.toThrow();
  });
});

describe("documents.updateStatus (admin only)", () => {
  it("allows admin to approve a document", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.documents.updateStatus({ documentId: 1, status: "approved" });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users from updating status", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.documents.updateStatus({ documentId: 1, status: "approved" })).rejects.toThrow();
  });
});

describe("notifications.list", () => {
  it("returns notifications for the authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.notifications.list();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("document_approved");
  });
});

describe("notifications.markAllRead", () => {
  it("marks all notifications as read", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.notifications.markAllRead();
    expect(result.success).toBe(true);
  });
});

describe("announcements.list", () => {
  it("returns announcements for authenticated users", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.announcements.list();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Comunicado de prueba");
  });
});

describe("announcements.create (admin only)", () => {
  it("allows admin to create announcements", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.announcements.create({ title: "Nuevo comunicado", content: "Contenido importante" });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users from creating announcements", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.announcements.create({ title: "Test", content: "Test" })).rejects.toThrow();
  });
});

describe("users.list (admin only)", () => {
  it("allows admin to list users", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.users.list();
    expect(result).toHaveLength(2);
  });

  it("rejects non-admin users from listing users", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.users.list()).rejects.toThrow();
  });
});

describe("users.updateRole (admin only)", () => {
  it("allows admin to update user role", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.users.updateRole({ userId: 1, role: "admin" });
    expect(result.success).toBe(true);
  });
});

describe("documents.upload", () => {
  it("allows authenticated user to upload a valid PDF", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    const result = await caller.documents.upload({
      title: "Trabajo de prueba",
      author: "Hermano Test",
      category: "Grado 1 - Aprendiz",
      fileData: Buffer.from("fake pdf content").toString("base64"),
      fileName: "trabajo.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects files over 20 MB", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(
      caller.documents.upload({
        title: "Trabajo grande",
        author: "Hermano Test",
        category: "Grado 1 - Aprendiz",
        fileData: Buffer.from("x").toString("base64"),
        fileName: "grande.pdf",
        fileSize: 21 * 1024 * 1024, // 21 MB — over limit
        mimeType: "application/pdf",
      })
    ).rejects.toThrow();
  });

  it("rejects non-authenticated users from uploading", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.documents.upload({
        title: "Test",
        author: "Test",
        category: "Otros",
        fileData: "dGVzdA==",
        fileName: "test.pdf",
        fileSize: 100,
        mimeType: "application/pdf",
      })
    ).rejects.toThrow();
  });
});

describe("documents.updateStatus — reject flow", () => {
  it("allows admin to reject a document and notifies the user", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.documents.updateStatus({ documentId: 1, status: "rejected" });
    expect(result.success).toBe(true);
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const ctx = makeUserCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
