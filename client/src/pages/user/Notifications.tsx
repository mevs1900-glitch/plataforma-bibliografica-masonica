import { trpc } from "@/lib/trpc";
import { Bell, BellOff, BookOpen, CheckCheck, FileText, Megaphone, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function NotifIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    document_approved: <BookOpen className="w-4 h-4 text-[oklch(0.65_0.15_160)]" />,
    document_rejected: <XCircle className="w-4 h-4 text-[oklch(0.65_0.22_25)]" />,
    new_document: <FileText className="w-4 h-4 text-[oklch(0.75_0.15_80)]" />,
    announcement: <Megaphone className="w-4 h-4 text-[oklch(0.65_0.15_240)]" />,
  };
  return icons[type] ?? <Bell className="w-4 h-4 text-[oklch(0.55_0.02_260)]" />;
}

export default function Notifications() {
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const utils = trpc.useUtils();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      toast.success("Todas las notificaciones marcadas como leídas");
    },
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="divider-gold w-16 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
            Notificaciones
          </h1>
          <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="border-[oklch(0.75_0.15_80/0.3)] text-[oklch(0.65_0.02_260)] hover:text-[oklch(0.75_0.15_80)] hover:border-[oklch(0.75_0.15_80/0.5)] bg-transparent mt-6 flex-shrink-0"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Marcar todas
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <BellOff className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            Sin notificaciones
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                notif.read
                  ? "border-[oklch(0.75_0.15_80/0.1)] bg-[oklch(0.14_0.02_260/0.3)] opacity-70"
                  : "border-[oklch(0.75_0.15_80/0.3)] bg-[oklch(0.16_0.03_260/0.6)]"
              }`}
              onClick={() => !notif.read && markRead.mutate({ notificationId: notif.id })}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.read ? "bg-[oklch(0.18_0.03_260/0.4)]" : "bg-[oklch(0.2_0.04_260/0.6)]"
                }`}>
                  <NotifIcon type={notif.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${notif.read ? "text-[oklch(0.6_0.02_260)]" : "text-[oklch(0.85_0.01_80)]"}`} style={{ fontFamily: "Cinzel, serif" }}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[oklch(0.75_0.15_80)] flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${notif.read ? "text-[oklch(0.45_0.02_260)]" : "text-[oklch(0.6_0.02_260)]"}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-[oklch(0.38_0.02_260)] mt-1.5">
                    {new Date(notif.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
