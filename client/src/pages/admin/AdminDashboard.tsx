import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Bell, BookOpen, Clock, FileText, Megaphone, Users } from "lucide-react";
import { useLocation } from "wouter";

function StatCard({
  label,
  value,
  icon,
  color = "gold",
  onClick,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "gold" | "blue" | "green" | "red" | "purple";
  onClick?: () => void;
}) {
  const colors = {
    gold: "border-[oklch(0.75_0.15_80/0.3)] bg-[oklch(0.75_0.15_80/0.08)]",
    blue: "border-[oklch(0.55_0.15_240/0.3)] bg-[oklch(0.55_0.15_240/0.08)]",
    green: "border-[oklch(0.55_0.15_160/0.3)] bg-[oklch(0.55_0.15_160/0.08)]",
    red: "border-[oklch(0.55_0.22_25/0.3)] bg-[oklch(0.55_0.22_25/0.08)]",
    purple: "border-[oklch(0.55_0.15_300/0.3)] bg-[oklch(0.55_0.15_300/0.08)]",
  };
  const iconColors = {
    gold: "text-[oklch(0.75_0.15_80)]",
    blue: "text-[oklch(0.65_0.15_240)]",
    green: "text-[oklch(0.65_0.15_160)]",
    red: "text-[oklch(0.65_0.22_25)]",
    purple: "text-[oklch(0.65_0.15_300)]",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-5 transition-all duration-200 ${colors[color]} ${onClick ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[oklch(0.55_0.02_260)] tracking-widest uppercase mb-1" style={{ fontFamily: "Cinzel, serif" }}>
            {label}
          </p>
          <p className="text-3xl font-bold text-[oklch(0.93_0.01_80)]" style={{ fontFamily: "Cinzel, serif" }}>
            {value}
          </p>
        </div>
        <span className={`${iconColors[color]} mt-1`}>{icon}</span>
      </div>
    </button>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: allDocs } = trpc.documents.all.useQuery();
  const { data: allUsers } = trpc.users.list.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery();
  const { data: announcements } = trpc.announcements.list.useQuery();

  const pendingDocs = allDocs?.filter((d) => d.status === "pending").length ?? 0;
  const approvedDocs = allDocs?.filter((d) => d.status === "approved").length ?? 0;
  const unreadNotifs = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Panel de <span className="text-gold-gradient">Administración</span>
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1 italic" style={{ fontFamily: "Cormorant Garamond, serif" }}>
          Bienvenido, {user?.name ?? "Administrador"} · Gestión de la Logia
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total docs"
          value={allDocs?.length ?? 0}
          icon={<FileText className="w-5 h-5" />}
          color="gold"
          onClick={() => navigate("/admin/documents")}
        />
        <StatCard
          label="Pendientes"
          value={pendingDocs}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate("/admin/documents")}
        />
        <StatCard
          label="Aprobados"
          value={approvedDocs}
          icon={<BookOpen className="w-5 h-5" />}
          color="green"
          onClick={() => navigate("/admin/library")}
        />
        <StatCard
          label="Miembros"
          value={allUsers?.length ?? 0}
          icon={<Users className="w-5 h-5" />}
          color="purple"
          onClick={() => navigate("/admin/users")}
        />
        <StatCard
          label="Sin leer"
          value={unreadNotifs}
          icon={<Bell className="w-5 h-5" />}
          color="red"
          onClick={() => navigate("/admin/notifications")}
        />
      </div>

      {/* Pending documents alert */}
      {pendingDocs > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-[oklch(0.75_0.15_80/0.4)] bg-[oklch(0.75_0.15_80/0.08)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[oklch(0.75_0.15_80)] flex-shrink-0" />
            <p className="text-sm text-[oklch(0.85_0.01_80)]">
              <span className="font-semibold text-[oklch(0.75_0.15_80)]">{pendingDocs} trabajo(s)</span> pendiente(s) de revisión
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/documents")}
            className="text-xs text-[oklch(0.75_0.15_80)] hover:text-[oklch(0.85_0.12_80)] font-semibold tracking-widest uppercase flex-shrink-0"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Revisar →
          </button>
        </div>
      )}

      {/* Recent documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs text-[oklch(0.55_0.02_260)] tracking-widest uppercase mb-4" style={{ fontFamily: "Cinzel, serif" }}>
            Últimos trabajos recibidos
          </h2>
          <div className="space-y-2">
            {allDocs?.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[oklch(0.75_0.15_80/0.1)] bg-[oklch(0.16_0.03_260/0.4)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[oklch(0.65_0.12_80)] flex-shrink-0" />
                  <p className="text-sm text-[oklch(0.75_0.01_80)] truncate">{doc.title}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                  doc.status === "approved"
                    ? "bg-[oklch(0.55_0.15_160/0.2)] text-[oklch(0.65_0.15_160)]"
                    : doc.status === "rejected"
                    ? "bg-[oklch(0.55_0.22_25/0.2)] text-[oklch(0.65_0.22_25)]"
                    : "bg-[oklch(0.75_0.15_80/0.1)] text-[oklch(0.75_0.15_80)]"
                }`} style={{ fontFamily: "Cinzel, serif" }}>
                  {doc.status === "approved" ? "Aprobado" : doc.status === "rejected" ? "Rechazado" : "Pendiente"}
                </span>
              </div>
            )) ?? (
              <p className="text-sm text-[oklch(0.45_0.02_260)] italic">Sin documentos aún</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xs text-[oklch(0.55_0.02_260)] tracking-widest uppercase mb-4" style={{ fontFamily: "Cinzel, serif" }}>
            Últimos comunicados
          </h2>
          <div className="space-y-2">
            {announcements?.slice(0, 3).map((ann: { id: number; title: string; createdAt: Date }) => (
              <div
                key={ann.id}
                className="p-3 rounded-lg border border-[oklch(0.75_0.15_80/0.1)] bg-[oklch(0.16_0.03_260/0.4)]"
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[oklch(0.65_0.15_240)] flex-shrink-0" />
                  <p className="text-sm text-[oklch(0.75_0.01_80)] truncate font-medium">{ann.title}</p>
                </div>
                <p className="text-xs text-[oklch(0.45_0.02_260)] mt-1 ml-6">
                  {new Date(ann.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )) ?? (
              <p className="text-sm text-[oklch(0.45_0.02_260)] italic">Sin comunicados aún</p>
            )}
            {!announcements?.length && (
              <p className="text-sm text-[oklch(0.45_0.02_260)] italic">Sin comunicados aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
