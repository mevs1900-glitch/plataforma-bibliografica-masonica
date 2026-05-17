import { trpc } from "@/lib/trpc";
import { BookOpen, Clock, Download, FileText, XCircle } from "lucide-react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const config = {
    pending: {
      label: "Pendiente",
      className: "bg-[oklch(0.75_0.15_80/0.1)] text-[oklch(0.75_0.15_80)] border border-[oklch(0.75_0.15_80/0.3)]",
      icon: <Clock className="w-3 h-3" />,
    },
    approved: {
      label: "Aprobado",
      className: "bg-[oklch(0.55_0.15_160/0.15)] text-[oklch(0.65_0.15_160)] border border-[oklch(0.55_0.15_160/0.3)]",
      icon: <BookOpen className="w-3 h-3" />,
    },
    rejected: {
      label: "Rechazado",
      className: "bg-[oklch(0.55_0.22_25/0.15)] text-[oklch(0.65_0.22_25)] border border-[oklch(0.55_0.22_25/0.3)]",
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${c.className}`} style={{ fontFamily: "Cinzel, serif" }}>
      {c.icon}
      {c.label}
    </span>
  );
}

export default function MyDocuments() {
  const { data: docs, isLoading } = trpc.documents.myDocuments.useQuery();
  const utils = trpc.useUtils();

  const getUrl = trpc.documents.getDownloadUrl.useQuery(
    { documentId: 0 },
    { enabled: false }
  );

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const result = await utils.documents.getDownloadUrl.fetch({ documentId: docId });
      window.open(result.url, "_blank");
    } catch {
      toast.error("No se pudo obtener el enlace de descarga.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Mis trabajos
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
          {docs?.length ?? 0} trabajo(s) enviado(s)
        </p>
      </div>

      {!docs || docs.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <FileText className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            Aún no has enviado ningún trabajo
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-[oklch(0.75_0.15_80/0.15)] bg-[oklch(0.16_0.03_260/0.4)] p-4 hover:border-[oklch(0.75_0.15_80/0.3)] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[oklch(0.75_0.15_80/0.1)] border border-[oklch(0.75_0.15_80/0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
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
                      <p className="text-xs text-[oklch(0.45_0.02_260)] mt-1 line-clamp-2 italic">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-[oklch(0.38_0.02_260)] mt-1">
                      {new Date(doc.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={doc.status} />
                  {doc.status === "approved" && (
                    <button
                      onClick={() => handleDownload(doc.id, doc.fileName)}
                      className="flex items-center gap-1.5 text-xs text-[oklch(0.65_0.02_260)] hover:text-[oklch(0.75_0.15_80)] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
