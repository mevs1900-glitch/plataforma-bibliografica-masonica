import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  activateInvitation,
  approveUser,
  createAnnouncement,
  createDocument,
  createInvitation,
  createNotification,
  deactivateInvitation,
  deleteAnnouncement,
  deleteDocument,
  getAllApprovedUsers,
  getAllDocuments,
  getAllInvitations,
  getAllUsers,
  getAdminUsers,
  getAnnouncements,
  getApprovedDocuments,
  getDocumentById,
  getDocumentsByUser,
  getInvitationByCode,
  getInvitationsByAdmin,
  getNotificationsByUser,
  getPendingUsers,
  incrementInvitationUsage,
  markAllNotificationsRead,
  markNotificationRead,
  recordInvitationUse,
  rejectUser,
  updateDocumentStatus,
  updateUserRole,
} from "./db";
import { storagePut, storageGet } from "./storage";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso restringido a administradores." });
  }
  return next({ ctx });
});

export const DOCUMENT_CATEGORIES = [
  "Grado 1 - Aprendiz",
  "Grado 2 - Compañero",
  "Grado 3 - Maestro",
  "Historia y Filosofía",
  "Rituales y Ceremonias",
  "Trabajos de Logia",
  "Comunicados",
  "Otros",
] as const;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  documents: router({
    upload: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          author: z.string().min(1).max(255),
          category: z.string().min(1).max(100),
          description: z.string().max(2000).optional(),
          fileData: z.string(),
          fileName: z.string().min(1).max(255),
          fileSize: z.number().max(20 * 1024 * 1024),
          mimeType: z.enum([
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `documents/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        await storagePut(fileKey, buffer, input.mimeType);

        await createDocument({
          title: input.title,
          author: input.author,
          category: input.category,
          description: input.description,
          fileKey,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          userId: ctx.user.id,
          status: "pending",
        });

        const admins = await getAdminUsers();
        for (const admin of admins) {
          await createNotification({
            userId: admin.id,
            type: "new_document",
            title: "Nuevo trabajo recibido",
            message: `${ctx.user.name ?? "Un miembro"} ha subido el trabajo: "${input.title}"`,
            relatedDocumentId: null,
          });
        }

        return { success: true };
      }),

    myDocuments: protectedProcedure.query(async ({ ctx }) => {
      return getDocumentsByUser(ctx.user.id);
    }),

    library: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getApprovedDocuments(input.search, input.category);
      }),

    getDownloadUrl: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ ctx, input }) => {
        const doc = await getDocumentById(input.documentId);
        if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

        if (doc.status !== "approved" && doc.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { url } = await storageGet(doc.fileKey);
        return { url, fileName: doc.fileName };
      }),

    all: adminProcedure.query(async () => {
      return getAllDocuments();
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          documentId: z.number(),
          status: z.enum(["approved", "rejected"]),
        })
      )
      .mutation(async ({ input }) => {
        const doc = await getDocumentById(input.documentId);
        if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

        await updateDocumentStatus(input.documentId, input.status);

        const notifType = input.status === "approved" ? "document_approved" : "document_rejected";
        const notifTitle = input.status === "approved" ? "Trabajo aprobado" : "Trabajo rechazado";
        const notifMsg = input.status === "approved"
          ? `Tu trabajo "${doc.title}" ha sido aprobado y está disponible en la biblioteca.`
          : `Tu trabajo "${doc.title}" ha sido rechazado. Contacta al administrador para más información.`;

        await createNotification({
          userId: doc.userId,
          type: notifType,
          title: notifTitle,
          message: notifMsg,
          relatedDocumentId: doc.id,
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        const doc = await getDocumentById(input.documentId);
        if (!doc) throw new TRPCError({ code: "NOT_FOUND" });
        await deleteDocument(input.documentId);
        return { success: true };
      }),

    categories: publicProcedure.query(() => DOCUMENT_CATEGORIES),
  }),

  users: router({
    list: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    updateRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["user", "admin"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsByUser(ctx.user.id);
    }),

    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.notificationId, ctx.user.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  announcements: router({
    list: protectedProcedure.query(async () => {
      return getAnnouncements();
    }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAnnouncement({
          title: input.title,
          content: input.content,
          adminId: ctx.user.id,
          adminName: ctx.user.name ?? "Administrador",
        });

        const allUsers = await getAllUsers();
        for (const user of allUsers) {
          if (user.id !== ctx.user.id) {
            await createNotification({
              userId: user.id,
              type: "announcement",
              title: "Nuevo comunicado",
              message: `Se ha publicado un nuevo comunicado: "${input.title}"`,
            });
          }
        }

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  invitations: router({
    create: adminProcedure
      .input(
        z.object({
          maxUses: z.number().optional(),
          expiresAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        await createInvitation({
          code,
          createdBy: ctx.user.id,
          maxUses: input.maxUses,
          expiresAt: input.expiresAt,
        });
        return { code, success: true };
      }),

    listByAdmin: adminProcedure.query(async ({ ctx }) => {
      return getInvitationsByAdmin(ctx.user.id);
    }),

    listAll: adminProcedure.query(async () => {
      return getAllInvitations();
    }),

    validateCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const invitation = await getInvitationByCode(input.code);
        if (!invitation) return { valid: false, message: "Código inválido" };
        if (!invitation.isActive) return { valid: false, message: "Código desactivado" };
        if (invitation.expiresAt && new Date() > invitation.expiresAt) return { valid: false, message: "Código expirado" };
        if (invitation.maxUses && invitation.usedCount >= invitation.maxUses) return { valid: false, message: "Código agotado" };
        return { valid: true, message: "Código válido" };
      }),

    redeemCode: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invitation = await getInvitationByCode(input.code);
        if (!invitation) throw new TRPCError({ code: "NOT_FOUND", message: "Código inválido" });
        if (!invitation.isActive) throw new TRPCError({ code: "FORBIDDEN", message: "Código desactivado" });
        if (invitation.expiresAt && new Date() > invitation.expiresAt) throw new TRPCError({ code: "FORBIDDEN", message: "Código expirado" });
        if (invitation.maxUses && invitation.usedCount >= invitation.maxUses) throw new TRPCError({ code: "FORBIDDEN", message: "Código agotado" });
        await recordInvitationUse({ invitationId: invitation.id, userId: ctx.user.id });
        await incrementInvitationUsage(invitation.id);
        return { success: true };
      }),

    deactivate: adminProcedure
      .input(z.object({ invitationId: z.number() }))
      .mutation(async ({ input }) => {
        await deactivateInvitation(input.invitationId);
        return { success: true };
      }),

    activate: adminProcedure
      .input(z.object({ invitationId: z.number() }))
      .mutation(async ({ input }) => {
        await activateInvitation(input.invitationId);
        return { success: true };
      }),
  }),

  approval: router({
    getPendingUsers: adminProcedure.query(async () => {
      return getPendingUsers();
    }),

    approveUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await approveUser(input.userId);
        return { success: true };
      }),

    rejectUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await rejectUser(input.userId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;