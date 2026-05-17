import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_260)] flex items-center justify-center px-6">
      <div className="text-center max-w-md animate-fade-in-up">
        <p className="text-8xl font-bold text-gold-gradient mb-4" style={{ fontFamily: "Cinzel, serif" }}>
          404
        </p>
        <div className="divider-gold w-24 mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-[oklch(0.85_0.01_80)] mb-3 tracking-wider" style={{ fontFamily: "Cinzel, serif" }}>
          Página no encontrada
        </h1>
        <p className="text-sm text-[oklch(0.5_0.02_260)] mb-8">
          La ruta que buscas no existe o no tienes acceso a ella.
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-[oklch(0.75_0.15_80)] hover:text-[oklch(0.85_0.12_80)] tracking-widest uppercase transition-colors"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}
