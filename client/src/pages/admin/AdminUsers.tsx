import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Shield, User, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const utils = trpc.useUtils();

  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Rol actualizado correctamente");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Gestión de miembros
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
          {users?.length ?? 0} miembro(s) registrado(s)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-[oklch(0.75_0.15_80/0.2)] bg-[oklch(0.75_0.15_80/0.06)] p-4">
          <p className="text-xs text-[oklch(0.55_0.02_260)] tracking-widest uppercase mb-1" style={{ fontFamily: "Cinzel, serif" }}>Miembros</p>
          <p className="text-2xl font-bold text-[oklch(0.93_0.01_80)]" style={{ fontFamily: "Cinzel, serif" }}>
            {users?.filter((u) => u.role === "user").length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-[oklch(0.55_0.15_300/0.2)] bg-[oklch(0.55_0.15_300/0.06)] p-4">
          <p className="text-xs text-[oklch(0.55_0.02_260)] tracking-widest uppercase mb-1" style={{ fontFamily: "Cinzel, serif" }}>Administradores</p>
          <p className="text-2xl font-bold text-[oklch(0.93_0.01_80)]" style={{ fontFamily: "Cinzel, serif" }}>
            {users?.filter((u) => u.role === "admin").length ?? 0}
          </p>
        </div>
      </div>

      {!users || users.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <Users className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            No hay miembros registrados
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isCurrentUser = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-4 p-4 rounded-lg border border-[oklch(0.75_0.15_80/0.15)] bg-[oklch(0.16_0.03_260/0.4)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[oklch(0.75_0.15_80/0.15)] border border-[oklch(0.75_0.15_80/0.3)] flex items-center justify-center flex-shrink-0">
                    {u.role === "admin" ? (
                      <Shield className="w-4 h-4 text-[oklch(0.75_0.15_80)]" />
                    ) : (
                      <User className="w-4 h-4 text-[oklch(0.65_0.12_80)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[oklch(0.85_0.01_80)] truncate">
                      {u.name ?? "Sin nombre"}
                      {isCurrentUser && (
                        <span className="ml-2 text-[10px] text-[oklch(0.75_0.15_80)] tracking-widest" style={{ fontFamily: "Cinzel, serif" }}>
                          (tú)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[oklch(0.5_0.02_260)] truncate">{u.email ?? "Sin correo"}</p>
                    <p className="text-[10px] text-[oklch(0.38_0.02_260)] mt-0.5">
                      Miembro desde {new Date(u.createdAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${
                    u.role === "admin"
                      ? "bg-[oklch(0.55_0.15_300/0.15)] text-[oklch(0.65_0.15_300)] border-[oklch(0.55_0.15_300/0.3)]"
                      : "bg-[oklch(0.75_0.15_80/0.1)] text-[oklch(0.65_0.12_80)] border-[oklch(0.75_0.15_80/0.2)]"
                  }`} style={{ fontFamily: "Cinzel, serif" }}>
                    {u.role === "admin" ? "Admin" : "Miembro"}
                  </span>

                  {!isCurrentUser && (
                    <select
                      value={u.role}
                      onChange={(e) => {
                        if (confirm(`¿Cambiar el rol de ${u.name ?? "este usuario"} a ${e.target.value === "admin" ? "Administrador" : "Miembro"}?`)) {
                          updateRole.mutate({ userId: u.id, role: e.target.value as "user" | "admin" });
                        }
                      }}
                      className="text-xs h-8 px-2 rounded-md bg-[oklch(0.18_0.04_260/0.8)] border border-[oklch(0.75_0.15_80/0.2)] text-[oklch(0.75_0.01_80)] focus:border-[oklch(0.75_0.15_80/0.5)] focus:outline-none"
                    >
                      <option value="user" className="bg-[oklch(0.16_0.03_260)]">Miembro</option>
                      <option value="admin" className="bg-[oklch(0.16_0.03_260)]">Admin</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
