import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const handleLogin = () => {
    // Redirigir directamente al dashboard de miembro (temporal)
    window.location.href = "/dashboard";
  };

  const handleAdminLogin = () => {
    // Redirigir directamente al admin (temporal)
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">◈✦◇✦◈</div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-4">
            ACCESO A MATERIAL
            <br />
            BIBLIOGRÁFICO Y DE
            <br />
            ESTUDIO MASÓNICO
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Repositorio privado de trabajos, documentos y comunicados internos.
            Acceso exclusivo para miembros autorizados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Botón Miembros */}
          <Card className="bg-gray-800/50 border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-amber-500">
                ACCESO MIEMBROS
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Accede al panel de miembros
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={handleLogin}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
              >
                🔓 Acceder como Miembro
              </Button>
            </CardContent>
          </Card>

          {/* Botón Administrador */}
          <Card className="bg-gray-800/50 border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-amber-500">
                ACCESO ADMINISTRADOR
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Acceso restringido para administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={handleAdminLogin}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
              >
                🔑 Acceder como Administrador
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">PLATAFORMA DE ACCESO RESTRINGIDO</p>
          <p className="text-gray-600 text-xs mt-4">
            © 2026 Plataforma Bibliográfica Masónica. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
