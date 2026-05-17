import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RedeemInvitation() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redeemMutation = trpc.invitations.redeemCode.useMutation({
    onSuccess: () => {
      toast.success("Código canjeado exitosamente. Accediendo a la plataforma...");
      setTimeout(() => {
        navigate(user?.role === "admin" ? "/admin" : "/dashboard");
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Error al canjear el código");
    },
  });

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error("Por favor ingresa un código");
      return;
    }
    setIsLoading(true);
    try {
      await redeemMutation.mutateAsync({ code: code.toUpperCase() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_260)] text-[oklch(0.93_0.01_80)] flex flex-col items-center justify-center px-4 py-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-40 h-40 border-2 border-[oklch(0.75_0.15_80)] rotate-45" />
        <div className="absolute bottom-10 left-10 w-32 h-32 border border-[oklch(0.75_0.15_80)] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold text-[oklch(0.75_0.15_80)] mb-2"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Ordo Ab Chao
          </h1>
          <p className="text-[oklch(0.65_0.02_260)] text-sm tracking-widest uppercase" style={{ fontFamily: "Cinzel, serif" }}>
            Plataforma Bibliográfica Masónica
          </p>
        </div>

        <Card className="bg-[oklch(0.11_0.02_260)] border border-[oklch(0.75_0.15_80/0.2)] p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[oklch(0.93_0.01_80)] mb-2">Canjear Código</h2>
            <p className="text-[oklch(0.65_0.02_260)] text-sm">
              Ingresa el código de invitación que recibiste para acceder a la plataforma.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[oklch(0.75_0.15_80)] mb-2">
                Código de Invitación
              </label>
              <Input
                type="text"
                placeholder="Ej: ABC12345"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="bg-[oklch(0.18_0.04_260)] border-[oklch(0.75_0.15_80/0.3)] text-[oklch(0.93_0.01_80)] placeholder-[oklch(0.5_0.02_260)]"
              />
            </div>

            <Button
              onClick={handleRedeem}
              disabled={isLoading || !code.trim()}
              className="w-full bg-[oklch(0.75_0.15_80)] hover:bg-[oklch(0.85_0.12_80)] text-[oklch(0.1_0_0)] font-semibold py-2 rounded-md transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canjeando...
                </>
              ) : (
                "Canjear Código"
              )}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-[oklch(0.75_0.15_80/0.2)]">
            <p className="text-[10px] text-[oklch(0.45_0.02_260)] text-center tracking-widest uppercase" style={{ fontFamily: "Cinzel, serif" }}>
              Derechos reservados
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
