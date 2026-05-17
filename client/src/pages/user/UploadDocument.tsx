import { trpc } from "@/lib/trpc";
import { FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

const CATEGORIES = [
  "Grado 1 - Aprendiz",
  "Grado 2 - Compañero",
  "Grado 3 - Maestro",
  "Historia y Filosofía",
  "Rituales y Ceremonias",
  "Trabajos de Logia",
  "Comunicados",
  "Otros",
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export default function UploadDocument() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Trabajo enviado correctamente", {
        description: "Será revisado por el administrador.",
      });
      navigate("/dashboard/my-documents");
    },
    onError: (err) => {
      toast.error("Error al subir el trabajo", { description: err.message });
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Formato no permitido", { description: "Solo se aceptan archivos PDF o Word (.doc, .docx)." });
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("Archivo demasiado grande", { description: "El tamaño máximo es 20 MB." });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Selecciona un archivo"); return; }
    if (!form.title || !form.author || !form.category) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        ...form,
        fileData: base64,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type as any,
      });
    };
    reader.readAsDataURL(file);
  };

  const fieldClass =
    "bg-[oklch(0.16_0.03_260/0.8)] border-[oklch(0.75_0.15_80/0.2)] text-[oklch(0.93_0.01_80)] placeholder:text-[oklch(0.4_0.02_260)] focus:border-[oklch(0.75_0.15_80/0.6)] focus:ring-[oklch(0.75_0.15_80/0.2)] rounded-md";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <div className="divider-gold w-16 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.93_0.01_80)] tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Subir trabajo
        </h1>
        <p className="text-sm text-[oklch(0.55_0.02_260)] mt-1">
          Envía tu trabajo para revisión del administrador.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[oklch(0.75_0.15_80/0.2)] bg-[oklch(0.16_0.03_260/0.4)] p-6 space-y-5">
          {/* Title */}
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Título del trabajo *
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ingresa el título del trabajo"
              className={fieldClass}
              required
            />
          </div>

          {/* Author */}
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Autor *
            </Label>
            <Input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Nombre del autor"
              className={fieldClass}
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Grado o categoría *
            </Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full h-10 px-3 py-2 text-sm ${fieldClass}`}
              required
            >
              <option value="" disabled>Selecciona una categoría</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[oklch(0.16_0.03_260)]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Descripción breve
            </Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Breve descripción del contenido del trabajo..."
              rows={3}
              className={`w-full px-3 py-2 text-sm resize-none ${fieldClass}`}
              maxLength={2000}
            />
            <p className="text-xs text-[oklch(0.4_0.02_260)] mt-1 text-right">{form.description.length}/2000</p>
          </div>

          {/* File upload */}
          <div>
            <Label className="text-[oklch(0.75_0.15_80)] text-xs tracking-widest uppercase mb-2 block" style={{ fontFamily: "Cinzel, serif" }}>
              Archivo adjunto * (PDF, DOC, DOCX — máx. 20 MB)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 p-4 rounded-md border border-[oklch(0.75_0.15_80/0.3)] bg-[oklch(0.75_0.15_80/0.08)]">
                <FileText className="w-8 h-8 text-[oklch(0.75_0.15_80)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[oklch(0.85_0.01_80)] truncate">{file.name}</p>
                  <p className="text-xs text-[oklch(0.5_0.02_260)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-[oklch(0.5_0.02_260)] hover:text-[oklch(0.65_0.22_25)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[oklch(0.75_0.15_80/0.25)] rounded-md p-8 flex flex-col items-center gap-3 hover:border-[oklch(0.75_0.15_80/0.5)] hover:bg-[oklch(0.75_0.15_80/0.05)] transition-all duration-200 group"
              >
                <Upload className="w-8 h-8 text-[oklch(0.45_0.02_260)] group-hover:text-[oklch(0.75_0.15_80)] transition-colors" />
                <div className="text-center">
                  <p className="text-sm text-[oklch(0.65_0.02_260)] group-hover:text-[oklch(0.75_0.15_80)] transition-colors">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-[oklch(0.4_0.02_260)] mt-1">PDF, DOC o DOCX</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex-1 border-[oklch(0.75_0.15_80/0.3)] text-[oklch(0.65_0.02_260)] hover:text-[oklch(0.93_0.01_80)] hover:border-[oklch(0.75_0.15_80/0.5)] bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={uploading || !file}
            className="flex-1 bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] hover:bg-[oklch(0.85_0.12_80)] font-semibold tracking-widest uppercase disabled:opacity-50"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[oklch(0.1_0_0)] border-t-transparent rounded-full animate-spin" />
                Subiendo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Enviar trabajo
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
