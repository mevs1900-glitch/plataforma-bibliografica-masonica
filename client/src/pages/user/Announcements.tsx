import { trpc } from "@/lib/trpc";
import { Megaphone } from "lucide-react";

export default function Announcements() {
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Comunicados
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
          Información y comunicados publicados por la administración.
        </p>
      </div>

      {!announcements || announcements.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <Megaphone className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            No hay comunicados publicados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann: { id: number; title: string; content: string; adminName: string | null; createdAt: Date }) => (
            <div
              key={ann.id}
              className="rounded-lg border border-[oklch(0.75_0.15_80/0.2)] bg-[oklch(0.16_0.03_260/0.4)] p-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[oklch(0.75_0.15_80/0.15)] border border-[oklch(0.75_0.15_80/0.3)] flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-4 h-4 text-[oklch(0.75_0.15_80)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[oklch(0.85_0.01_80)]" style={{ fontFamily: "Cinzel, serif" }}>
                    {ann.title}
                  </h3>
                  <p className="text-xs text-[oklch(0.5_0.02_260)] mt-0.5">
                    {ann.adminName ?? "Administración"} ·{" "}
                    {new Date(ann.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="divider-gold mb-3" />
              <p className="text-sm text-[oklch(0.7_0.02_260)] leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
