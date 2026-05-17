import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminApproval() {
  const { data: pendingUsers, isLoading, refetch } = trpc.approval.getPendingUsers.useQuery();
  const approveMutation = trpc.approval.approveUser.useMutation();
  const rejectMutation = trpc.approval.rejectUser.useMutation();

  const handleApprove = async (userId: number) => {
    try {
      await approveMutation.mutateAsync({ userId });
      toast.success("Usuario aprobado exitosamente");
      refetch();
    } catch (error) {
      toast.error("Error al aprobar usuario");
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectMutation.mutateAsync({ userId });
      toast.success("Usuario rechazado");
      refetch();
    } catch (error) {
      toast.error("Error al rechazar usuario");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Cinzel, serif" }}>
          Solicitudes de Acceso
        </h1>
        <p className="text-muted-foreground mt-2">
          Revisa y aprueba o rechaza las solicitudes de nuevos usuarios
        </p>
      </div>

      {!pendingUsers || pendingUsers.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No hay solicitudes pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <Card key={user.id} className="border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(user.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(user.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
