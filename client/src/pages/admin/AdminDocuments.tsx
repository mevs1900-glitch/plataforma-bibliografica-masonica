import { trpc } from "@/lib/trpc";
import { Check, Download, FileText, Filter, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pendiente", className: "bg-[oklch(0.75_0.15_80/0.1)] text-[oklch(0.75_0.15_80)] border border-[oklch(0.75_0.15_80/0.3)]" },
    approved: { label: "Aprobado", className: "bg-[oklch(0.55_0.15_160/0.15)] text-[oklch(0.65_0.15_160)] border border-[oklch(0.55_0.15_160/0.3)]" },
    rejected: { label: "Rechazado", className: "bg-[oklch(0.55_0.22_25/0.15)] text-[oklch(0.65_0.22_25)] border border-[oklch(0.55_0.22_25/0.3)]" },
  };
  const c = config[status] ?? config.pending;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full ${c.className}`} style={{ fontFamily: "Cinzel, serif" }}>
      {c.label}
    </span>
  );
}

export default function AdminDocuments() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { data: docs, isLoading } = trpc.documents.all.useQuery();
  const utils = trpc.useUtils();

  const updateStatus = trpc.documents.updateStatus.useMutation({
    onSuccess: (_, vars) => {
      utils.documents.all.invalidate();
      toast.success(vars.status === "approved" ? "Trabajo aprobado" : "Trabajo rechazado");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteDoc = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.all.invalidate();
      toast.success("Trabajo eliminado");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDownload = async (docId: number) => {
    try {
      const result = await utils.documents.getDownloadUrl.fetch({ documentId: docId });
      window.open(result.url, "_blank");
    } catch {
      toast.error("No se pudo obtener el enlace.");
    }
  };

  const filtered = docs?.filter((d) => statusFilter === "all" || d.status === statusFilter) ?? [];

  const filterBtns: { label: string; value: StatusFilter }[] = [
    { label: "Todos", value: "all" },
    { label: "Pendientes", value: "pending" },
    { label: "Aprobados", value: "approved" },
    { label: "Rechazados", value: "rejected" },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Gestión de trabajos
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
          {docs?.length ?? 0} trabajo(s) en total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Filter className="w-4 h-4 text-[oklch(0.45_0.02_260)] self-center mr-1" />
        {filterBtns.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setStatusFilter(btn.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              statusFilter === btn.value
                ? "bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] border-[oklch(0.75_0.15_80)]"
                : "border-[oklch(0.75_0.15_80/0.25)] text-[oklch(0.55_0.02_260)] hover:border-[oklch(0.75_0.15_80/0.5)] hover:text-[oklch(0.75_0.15_80)]"
            }`}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {btn.label}
            {btn.value !== "all" && docs && (
              <span className="ml-1.5 opacity-70">
                ({docs.filter((d) => d.status === btn.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <FileText className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            No hay trabajos en esta categoría
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-[oklch(0.75_0.15_80/0.15)] bg-[oklch(0.16_0.03_260/0.4)] p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[oklch(0.75_0.15_80/0.1)] border border-[oklch(0.75_0.15_80/0.2)] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[oklch(0.75_0.15_80)]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[oklch(0.85_0.01_80)] truncate" style={{ fontFamily: "Cinzel, serif" }}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-[oklch(0.5_0.02_260)] mt-0.5">
                      {doc.author} · {doc.category}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-[oklch(0.45_0.02_260)] mt-1 line-clamp-1 italic">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-[oklch(0.38_0.02_260)] mt-1">
                      {new Date(doc.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })} · {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <StatusBadge status={doc.status} />
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="p-2 rounded-md text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.75_0.15_80)] hover:bg-[oklch(0.75_0.15_80/0.1)] transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {doc.status !== "approved" && (
                    <button
                      onClick={() => updateStatus.mutate({ documentId: doc.id, status: "approved" })}
                      disabled={updateStatus.isPending}
                      className="p-2 rounded-md text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.65_0.15_160)] hover:bg-[oklch(0.55_0.15_160/0.1)] transition-colors"
                      title="Aprobar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {doc.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus.mutate({ documentId: doc.id, status: "rejected" })}
                      disabled={updateStatus.isPending}
                      className="p-2 rounded-md text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.1)] transition-colors"
                      title="Rechazar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar este trabajo permanentemente?")) {
                        deleteDoc.mutate({ documentId: doc.id });
                      }
                    }}
                    disabled={deleteDoc.isPending}
                    className="p-2 rounded-md text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.1)] transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
