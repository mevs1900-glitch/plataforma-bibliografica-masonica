import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Bell,
  BookOpen,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

// ─── Masonic logo ─────────────────────────────────────────────────────────────

function MasonicLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Logo Masónico"
      style={{ width: size, height: size }}
      className="object-contain"
    />
  );
}

// ─── Nav item types ───────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
};

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  navItems,
  currentPath,
  onNavigate,
  userName,
  userRole,
  onLogout,
}: {
  navItems: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[oklch(0.75_0.15_80/0.2)]">
        <div className="flex items-center gap-3">
          <MasonicLogo size={36} />
          <div>
            <p className="text-xs text-[oklch(0.75_0.15_80)] tracking-widest uppercase font-semibold" style={{ fontFamily: "Cinzel, serif" }}>
              Ordo Ab Chao
            </p>
            <p className="text-[10px] text-[oklch(0.45_0.02_260)] tracking-wider mt-0.5">
              Repositorio Interno
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-[oklch(0.75_0.15_80/0.1)]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-[oklch(0.18_0.04_260/0.5)]">
          <div className="w-9 h-9 rounded-full bg-[oklch(0.75_0.15_80/0.2)] border border-[oklch(0.75_0.15_80/0.4)] flex items-center justify-center flex-shrink-0">
            <span className="text-[oklch(0.75_0.15_80)] text-sm font-semibold" style={{ fontFamily: "Cinzel, serif" }}>
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[oklch(0.93_0.01_80)] font-medium truncate">{userName}</p>
            <p className="text-[10px] text-[oklch(0.75_0.15_80)] tracking-widest uppercase" style={{ fontFamily: "Cinzel, serif" }}>
              {userRole === "admin" ? "Administrador" : "Maestro Masón"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 text-left group",
                isActive
                  ? "bg-[oklch(0.75_0.15_80/0.15)] text-[oklch(0.75_0.15_80)] border border-[oklch(0.75_0.15_80/0.3)]"
                  : "text-[oklch(0.65_0.02_260)] hover:bg-[oklch(0.18_0.04_260/0.5)] hover:text-[oklch(0.85_0.01_80)]"
              )}
            >
              <span className={cn("flex-shrink-0", isActive ? "text-[oklch(0.75_0.15_80)]" : "text-[oklch(0.5_0.02_260)] group-hover:text-[oklch(0.75_0.15_80)]")}>
                {item.icon}
              </span>
              <span className="flex-1 tracking-wide">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <Badge className="bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] text-[10px] h-5 min-w-5 px-1.5">
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              ) : null}
              {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[oklch(0.75_0.15_80/0.2)]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.55_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.1)] transition-all duration-200"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Cerrar sesión</span>
        </button>
        <p className="text-[10px] text-[oklch(0.3_0.01_260)] text-center mt-3 tracking-widest uppercase" style={{ fontFamily: "Cinzel, serif" }}>
          Derechos reservados
        </p>
      </div>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function MasonicLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "user" | "admin";
}) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Unread notifications count
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userNavItems: NavItem[] = [
    { label: "Inicio", path: "/dashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Subir trabajo", path: "/dashboard/upload", icon: <Upload className="w-4 h-4" /> },
    { label: "Mis trabajos", path: "/dashboard/my-documents", icon: <FileText className="w-4 h-4" /> },
    { label: "Biblioteca", path: "/dashboard/library", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Comunicados", path: "/dashboard/announcements", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Notificaciones", path: "/dashboard/notifications", icon: <Bell className="w-4 h-4" />, badge: unreadCount },
  ];

  const adminNavItems: NavItem[] = [
    { label: "Panel", path: "/admin", icon: <Shield className="w-4 h-4" /> },
    { label: "Aprobaciones", path: "/admin/approval", icon: <Users className="w-4 h-4" /> },
    { label: "Trabajos", path: "/admin/documents", icon: <FileText className="w-4 h-4" /> },
    { label: "Usuarios", path: "/admin/users", icon: <Users className="w-4 h-4" /> },
    { label: "Comunicados", path: "/admin/announcements", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Invitaciones", path: "/admin/invitations", icon: <Upload className="w-4 h-4" /> },
    { label: "Biblioteca", path: "/admin/library", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Notificaciones", path: "/admin/notifications", icon: <Bell className="w-4 h-4" />, badge: unreadCount },
  ];

  const navItems = role === "admin" ? adminNavItems : userNavItems;
  const userName = user?.name ?? "Miembro";
  const userRoleLabel = user?.role ?? "user";

  const sidebarProps = {
    navItems,
    currentPath: location,
    onNavigate: navigate,
    userName,
    userRole: userRoleLabel,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_260)] text-[oklch(0.93_0.01_80)] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-[oklch(0.11_0.02_260)] border-r border-[oklch(0.75_0.15_80/0.2)] fixed h-full z-20">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-[oklch(0.11_0.02_260)] border-r border-[oklch(0.75_0.15_80/0.2)] z-40 lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-[oklch(0.65_0.02_260)] hover:text-[oklch(0.93_0.01_80)]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-[oklch(0.11_0.02_260/0.95)] backdrop-blur-sm border-b border-[oklch(0.75_0.15_80/0.2)] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-md text-[oklch(0.65_0.02_260)] hover:text-[oklch(0.93_0.01_80)] hover:bg-[oklch(0.18_0.04_260/0.5)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <MasonicLogo size={24} />
            <span className="text-xs text-[oklch(0.75_0.15_80)] tracking-widest uppercase font-semibold" style={{ fontFamily: "Cinzel, serif" }}>
              Logia
            </span>
          </div>
          <button
            onClick={() => navigate(role === "admin" ? "/admin/notifications" : "/dashboard/notifications")}
            className="relative p-2 rounded-md text-[oklch(0.65_0.02_260)] hover:text-[oklch(0.93_0.01_80)] hover:bg-[oklch(0.18_0.04_260/0.5)] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[oklch(0.75_0.15_80)] rounded-full text-[oklch(0.1_0_0)] text-[9px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[oklch(0.11_0.02_260/0.97)] backdrop-blur-sm border-t border-[oklch(0.75_0.15_80/0.2)] px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-200 relative",
                    isActive
                      ? "text-[oklch(0.75_0.15_80)]"
                      : "text-[oklch(0.45_0.02_260)]"
                  )}
                >
                  {item.icon}
                  <span className="text-[9px] tracking-wide">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-[oklch(0.75_0.15_80)] rounded-full text-[oklch(0.1_0_0)] text-[8px] flex items-center justify-center font-bold">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
