import type { Announcement } from "../../../../drizzle/schema";
import { trpc } from "@/lib/trpc";
import { Megaphone, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminAnnouncements() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: announcements, isLoading } = trpc.announcements.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("Comunicado publicado correctamente");
      setTitle("");
      setContent("");
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("Comunicado eliminado");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Completa el título y el contenido");
      return;
    }
    createMutation.mutate({ title: title.trim(), content: content.trim() });
  };

  const fieldClass =
    "bg-[oklch(0.16_0.03_260/0.8)] border-[oklch(0.75_0.15_80/0.2)] text-[oklch(0.93_0.01_80)] placeholder:text-[oklch(0.4_0.02_260)] focus:border-[oklch(0.75_0.15_80/0.6)] rounded-md";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="divider-gold w-16 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
            Comunicados
          </h1>
          <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
            Publica información para todos los miembros.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] hover:bg-[oklch(0.85_0.12_80)] mt-6 flex-shrink-0"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancelar" : "Nuevo"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-[oklch(0.75_0.15_80/0.3)] bg-[oklch(0.16_0.03_260/0.6)] p-6 space-y-4 animate-fade-in-up">
          <h2 className="text-sm text-[oklch(0.75_0.15_80)] tracking-widest uppercase font-semibold" style={{ fontFamily: "Cinzel, serif" }}>
            Nuevo comunicado
          </h2>
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Título *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del comunicado"
              className={fieldClass}
              required
            />
          </div>
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Contenido *
            </Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido del comunicado..."
              rows={5}
              className={`w-full px-3 py-2 text-sm resize-none ${fieldClass}`}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] hover:bg-[oklch(0.85_0.12_80)] font-semibold tracking-widest uppercase"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {createMutation.isPending ? "Publicando..." : "Publicar comunicado"}
          </Button>
        </form>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
          ))}
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <Megaphone className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            No hay comunicados publicados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann: Announcement) => (
            <div
              key={ann.id}
              className="rounded-lg border border-[oklch(0.75_0.15_80/0.2)] bg-[oklch(0.16_0.03_260/0.4)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[oklch(0.75_0.15_80/0.15)] border border-[oklch(0.75_0.15_80/0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4 text-[oklch(0.75_0.15_80)]" />
                  </div>
                  <div className="min-w-0">
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
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este comunicado?")) {
                      deleteMutation.mutate({ id: ann.id });
                    }
                  }}
                  className="p-2 rounded-md text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.55_0.22_25/0.1)] transition-colors flex-shrink-0"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="divider-gold my-3" />
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
