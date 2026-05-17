import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, FileText, Bell, MessageSquare } from "lucide-react";

export default function UserDashboard() {
  const menuItems = [
    { href: "/dashboard/upload", icon: Upload, title: "Subir Trabajo", desc: "Envía un nuevo documento para revisión" },
    { href: "/dashboard/my-documents", icon: FileText, title: "Mis Trabajos", desc: "Gestiona tus documentos enviados" },
    { href: "/dashboard/library", icon: BookOpen, title: "Biblioteca", desc: "Explora trabajos aprobados" },
    { href: "/dashboard/announcements", icon: MessageSquare, title: "Comunicados", desc: "Lee los anuncios oficiales" },
    { href: "/dashboard/notifications", icon: Bell, title: "Notificaciones", desc: "Revisa tus alertas y mensajes" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Miembro</h1>
        <p className="text-muted-foreground mt-1">Bienvenido a la Plataforma Bibliográfica Masónica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}