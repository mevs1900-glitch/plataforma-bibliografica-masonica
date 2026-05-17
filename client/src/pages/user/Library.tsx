import { trpc } from "@/lib/trpc";
import { BookOpen, Download, FileText, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Todos",
  "Grado 1 - Aprendiz",
  "Grado 2 - Compañero",
  "Grado 3 - Maestro",
  "Historia y Filosofía",
  "Rituales y Ceremonias",
  "Trabajos de Logia",
  "Comunicados",
  "Otros",
];

export default function Library() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const { data: docs, isLoading } = trpc.documents.library.useQuery({
    search: debouncedSearch || undefined,
    category: category === "Todos" ? undefined : category,
  });

  const utils = trpc.useUtils();

  const handleDownload = async (docId: number) => {
    try {
      const result = await utils.documents.getDownloadUrl.fetch({ documentId: docId });
      window.open(result.url, "_blank");
    } catch {
      toast.error("No se pudo obtener el enlace de descarga.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Biblioteca
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
          Repositorio de trabajos aprobados disponibles para todos los miembros.
        </p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.02_260)]" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por título o autor..."
            className="pl-9 bg-[oklch(0.16_0.03_260/0.8)] border-[oklch(0.75_0.15_80/0.2)] text-[oklch(0.93_0.01_80)] placeholder:text-[oklch(0.4_0.02_260)] focus:border-[oklch(0.75_0.15_80/0.6)]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 px-3 py-2 text-sm rounded-md bg-[oklch(0.16_0.03_260/0.8)] border border-[oklch(0.75_0.15_80/0.2)] text-[oklch(0.93_0.01_80)] focus:border-[oklch(0.75_0.15_80/0.6)] focus:outline-none sm:w-56"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-[oklch(0.16_0.03_260)]">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Category pills (mobile friendly) */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.slice(0, 5).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              category === cat
                ? "bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] border-[oklch(0.75_0.15_80)]"
                : "border-[oklch(0.75_0.15_80/0.25)] text-[oklch(0.55_0.02_260)] hover:border-[oklch(0.75_0.15_80/0.5)] hover:text-[oklch(0.75_0.15_80)]"
            }`}
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-[oklch(0.45_0.02_260)] mb-4 tracking-wider">
          {docs?.length ?? 0} documento(s) encontrado(s)
        </p>
      )}

      {/* Documents grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-[oklch(0.16_0.03_260/0.4)] animate-pulse" />
          ))}
        </div>
      ) : !docs || docs.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-[oklch(0.75_0.15_80/0.2)]">
          <BookOpen className="w-12 h-12 text-[oklch(0.35_0.02_260)] mx-auto mb-4" />
          <p className="text-[oklch(0.55_0.02_260)]" style={{ fontFamily: "Cinzel, serif" }}>
            No se encontraron documentos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group rounded-lg border border-[oklch(0.75_0.15_80/0.15)] bg-[oklch(0.16_0.03_260/0.4)] p-5 hover:border-[oklch(0.75_0.15_80/0.4)] hover:bg-[oklch(0.18_0.04_260/0.5)] transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.75_0.15_80/0.1)] border border-[oklch(0.75_0.15_80/0.2)] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[oklch(0.75_0.15_80)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[oklch(0.85_0.01_80)] line-clamp-2 leading-snug" style={{ fontFamily: "Cinzel, serif" }}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-[oklch(0.5_0.02_260)] mt-1">{doc.author}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.75_0.15_80/0.1)] text-[oklch(0.65_0.12_80)] border border-[oklch(0.75_0.15_80/0.2)] mt-2">
                    {doc.category}
                  </span>
                  {doc.description && (
                    <p className="text-xs text-[oklch(0.45_0.02_260)] mt-2 line-clamp-2 italic">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-[oklch(0.38_0.02_260)]">
                  {new Date(doc.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="flex items-center gap-1.5 text-xs text-[oklch(0.55_0.02_260)] hover:text-[oklch(0.75_0.15_80)] transition-colors group-hover:text-[oklch(0.65_0.12_80)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
