import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminInvitations() {
  const { user } = useAuth();
  const [maxUses, setMaxUses] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: invitations, isLoading, refetch } = trpc.invitations.listAll.useQuery();
  const createMutation = trpc.invitations.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Código generado: ${data.code}`);
      setMaxUses("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Error al generar código");
    },
  });

  const deactivateMutation = trpc.invitations.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Código desactivado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Error al desactivar código");
    },
  });

  const activateMutation = trpc.invitations.activate.useMutation({
    onSuccess: () => {
      toast.success("Código activado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Error al activar código");
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await createMutation.mutateAsync({
        maxUses: maxUses ? parseInt(maxUses) : undefined,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggle = (invitationId: number, isActive: boolean) => {
    if (isActive) {
      deactivateMutation.mutate({ invitationId });
    } else {
      activateMutation.mutate({ invitationId });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado al portapapeles");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[oklch(0.93_0.01_80)]" style={{ fontFamily: "Cinzel, serif" }}>
          Códigos de Invitación
        </h1>
        <p className="text-[oklch(0.65_0.02_260)] mt-1">
          Genera y gestiona códigos para controlar el acceso a la plataforma
        </p>
      </div>

      {/* Generate new code */}
      <Card className="bg-[oklch(0.11_0.02_260)] border border-[oklch(0.75_0.15_80/0.2)] p-6">
        <h2 className="text-lg font-semibold text-[oklch(0.93_0.01_80)] mb-4">Generar Nuevo Código</h2>
        <div className="flex gap-3 flex-col md:flex-row">
          <div className="flex-1">
            <label className="block text-sm text-[oklch(0.75_0.15_80)] mb-2">Usos máximos (opcional)</label>
            <Input
              type="number"
              placeholder="Dejar vacío para usos ilimitados"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              disabled={isGenerating}
              className="bg-[oklch(0.18_0.04_260)] border-[oklch(0.75_0.15_80/0.3)]"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full md:w-auto bg-[oklch(0.75_0.15_80)] hover:bg-[oklch(0.85_0.12_80)] text-[oklch(0.1_0_0)] font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar Código"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Invitations list */}
      <Card className="bg-[oklch(0.11_0.02_260)] border border-[oklch(0.75_0.15_80/0.2)] p-6">
        <h2 className="text-lg font-semibold text-[oklch(0.93_0.01_80)] mb-4">Códigos Activos</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.75_0.15_80)]" />
          </div>
        ) : invitations && invitations.length > 0 ? (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 bg-[oklch(0.18_0.04_260)] rounded-md border border-[oklch(0.75_0.15_80/0.1)]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-lg font-mono font-bold text-[oklch(0.75_0.15_80)]">{inv.code}</code>
                    <button
                      onClick={() => copyToClipboard(inv.code)}
                      className="p-1 hover:bg-[oklch(0.75_0.15_80/0.1)] rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-[oklch(0.65_0.02_260)]" />
                    </button>
                  </div>
                  <div className="text-sm text-[oklch(0.65_0.02_260)] space-y-0.5">
                    <p>
                      Usos: {inv.usedCount}
                      {inv.maxUses ? `/${inv.maxUses}` : " (ilimitados)"}
                    </p>
                    <p>
                      Creado hace{" "}
                      {formatDistanceToNow(new Date(inv.createdAt), {
                        locale: es,
                        addSuffix: false,
                      })}
                    </p>
                    {inv.expiresAt && (
                      <p>
                        Expira:{" "}
                        {formatDistanceToNow(new Date(inv.expiresAt), {
                          locale: es,
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(inv.id, inv.isActive)}
                    className="p-2 hover:bg-[oklch(0.75_0.15_80/0.1)] rounded transition-colors"
                  >
                    {inv.isActive ? (
                      <ToggleRight className="w-5 h-5 text-[oklch(0.75_0.15_80)]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-[oklch(0.5_0.02_260)]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[oklch(0.65_0.02_260)] py-8">No hay códigos de invitación generados aún</p>
        )}
      </Card>
    </div>
  );
}
