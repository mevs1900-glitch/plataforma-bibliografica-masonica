import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Shield } from "lucide-react";
import { useLocation } from "wouter";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_260)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[oklch(0.75_0.15_80/0.3)] border-t-[oklch(0.75_0.15_80)] rounded-full animate-spin" />
        <p className="text-xs text-[oklch(0.45_0.02_260)] tracking-widest uppercase" style={{ fontFamily: "Cinzel, serif" }}>
          Verificando acceso...
        </p>
      </div>
    </div>
  );
}

// ─── Access denied screen ─────────────────────────────────────────────────────

function AccessDenied() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_260)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Shield className="w-16 h-16 text-[oklch(0.55_0.22_25)] mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[oklch(0.93_0.01_80)] mb-3 tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Acceso restringido
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mb-8 leading-relaxed">
          No tienes los permisos necesarios para acceder a esta sección. Debe ser autorizado por el administrador.
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-[oklch(0.75_0.15_80)] hover:text-[oklch(0.85_0.12_80)] tracking-widest uppercase transition-colors"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = getLoginUrl();
    return <LoadingScreen />;
  }

  // Check if user is approved (except admins)
  if (user && !user.isApproved && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[oklch(0.1_0.02_260)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-[oklch(0.75_0.15_80)] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[oklch(0.93_0.01_80)] mb-3 tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
            Acceso Pendiente
          </h1>
          <p className="text-sm text-[oklch(0.55_0.02_260)] mb-8 leading-relaxed">
            Tu solicitud de acceso está siendo revisada por los administradores. Te notificaremos cuando sea aprobada.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Admin guard ──────────────────────────────────────────────────────────────

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return <LoadingScreen />;
  }
  if (user?.role !== "admin") return <AccessDenied />;
  if (user && !user.isApproved) return <AccessDenied />;

  return <>{children}</>;
}
