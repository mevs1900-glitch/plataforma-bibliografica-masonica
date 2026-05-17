import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import MasonicLayout from "./components/MasonicLayout";
import { AdminGuard, AuthGuard } from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import RedeemInvitation from "./pages/RedeemInvitation";

// User pages
import Announcements from "./pages/user/Announcements";
import Library from "./pages/user/Library";
import MyDocuments from "./pages/user/MyDocuments";
import Notifications from "./pages/user/Notifications";
import UploadDocument from "./pages/user/UploadDocument";
import UserDashboard from "./pages/user/UserDashboard";

// Admin pages
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminApproval from "./pages/admin/AdminApproval";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInvitations from "./pages/admin/AdminInvitations";

// ─── User layout wrapper ──────────────────────────────────────────────────────

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MasonicLayout role="user">{children}</MasonicLayout>
    </AuthGuard>
  );
}

// ─── Admin layout wrapper ─────────────────────────────────────────────────────

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <MasonicLayout role="admin">{children}</MasonicLayout>
    </AdminGuard>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/redeem" component={RedeemInvitation} />

      {/* User routes */}
      <Route path="/dashboard">
        <UserLayout><UserDashboard /></UserLayout>
      </Route>
      <Route path="/dashboard/upload">
        <UserLayout><UploadDocument /></UserLayout>
      </Route>
      <Route path="/dashboard/my-documents">
        <UserLayout><MyDocuments /></UserLayout>
      </Route>
      <Route path="/dashboard/library">
        <UserLayout><Library /></UserLayout>
      </Route>
      <Route path="/dashboard/announcements">
        <UserLayout><Announcements /></UserLayout>
      </Route>
      <Route path="/dashboard/notifications">
        <UserLayout><Notifications /></UserLayout>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/approval">
        <AdminLayout><AdminApproval /></AdminLayout>
      </Route>
      <Route path="/admin/documents">
        <AdminLayout><AdminDocuments /></AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/admin/announcements">
        <AdminLayout><AdminAnnouncements /></AdminLayout>
      </Route>
      <Route path="/admin/library">
        <AdminLayout><Library /></AdminLayout>
      </Route>
      <Route path="/admin/notifications">
        <AdminLayout><Notifications /></AdminLayout>
      </Route>
      <Route path="/admin/invitations">
        <AdminLayout><AdminInvitations /></AdminLayout>
      </Route>

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.16 0.03 260)",
                border: "1px solid oklch(0.75 0.15 80 / 0.3)",
                color: "oklch(0.93 0.01 80)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
