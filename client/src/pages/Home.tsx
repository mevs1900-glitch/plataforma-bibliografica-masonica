import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

// ─── Masonic SVG symbols ──────────────────────────────────────────────────────

function CompassSquare({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Square */}
      <path
        d="M20 90 L20 30 L80 30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Compass left leg */}
      <path
        d="M60 20 L30 90"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Compass right leg */}
      <path
        d="M60 20 L90 90"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Compass hinge */}
      <circle cx="60" cy="20" r="4" fill="currentColor" />
      {/* G letter */}
      <text
        x="60"
        y="68"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="22"
        fontFamily="Cinzel, serif"
        fontWeight="600"
        fill="currentColor"
      >
        G
      </text>
      {/* Outer circle */}
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
    </svg>
  );
}

function GeometricPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Star of Solomon / hexagram */}
      <polygon
        points="100,20 120,60 160,60 130,85 140,125 100,100 60,125 70,85 40,60 80,60"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <polygon
        points="100,180 120,140 160,140 130,115 140,75 100,100 60,75 70,115 40,140 80,140"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      {/* Outer octagon */}
      <polygon
        points="100,5 155,25 195,75 195,125 155,175 100,195 45,175 5,125 5,75 45,25"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_260)] text-[oklch(0.93_0.01_80)] flex flex-col overflow-hidden">
      {/* Background geometric decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GeometricPattern className="absolute -top-20 -right-20 w-96 h-96 text-[oklch(0.75_0.15_80)]" />
        <GeometricPattern className="absolute -bottom-20 -left-20 w-80 h-80 text-[oklch(0.75_0.15_80)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.1_0.02_260/0.8)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[oklch(0.75_0.15_80/0.2)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Masónico" className="w-10 h-10 object-contain" />
            <span
              className="text-sm font-medium tracking-widest uppercase text-[oklch(0.75_0.15_80)]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Ordo Ab Chao
            </span>
          </div>
          <a
            href="#"
            className="text-sm text-[oklch(0.75_0.15_80)] hover:text-[oklch(0.85_0.12_80)] transition-colors duration-200 tracking-wider"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Ingresar
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Central symbol */}
        <div className="animate-fade-in-up mb-10">
          <img src="/logo.png" alt="Logo Masónico" className="w-28 h-28 md:w-36 md:h-36 mx-auto drop-shadow-[0_0_24px_rgba(214,175,0,0.4)]" />
        </div>

        {/* Title */}
        <div className="animate-fade-in-up delay-100">
          <div className="divider-gold w-32 mx-auto mb-6" />
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-4 leading-tight"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            <span className="text-gold-gradient">Acceso a material</span>
            <br />
            <span className="text-[oklch(0.93_0.01_80)]">bibliográfico y de</span>
            <br />
            <span className="text-gold-gradient">estudio masónico</span>
          </h1>
          <div className="divider-gold w-32 mx-auto mt-6 mb-8" />
        </div>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up delay-200 text-base md:text-lg text-[oklch(0.65_0.02_260)] max-w-xl mx-auto mb-12 leading-relaxed italic"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Repositorio privado de trabajos, documentos y comunicados internos.
          Acceso exclusivo para miembros autorizados.
        </p>

        {/* Access buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
          {/* Members access */}
          <a href="#" className="flex-1">
            <Button
              className="w-full h-14 text-base tracking-widest uppercase font-semibold bg-[oklch(0.75_0.15_80)] text-[oklch(0.1_0_0)] hover:bg-[oklch(0.85_0.12_80)] border-0 transition-all duration-200 shadow-[0_0_20px_oklch(0.75_0.15_80/0.3)] hover:shadow-[0_0_30px_oklch(0.75_0.15_80/0.5)]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Acceso Miembros
            </Button>
          </a>
          
          {/* Admin access */}
          <a href="#" className="flex-1">
            <Button
              className="w-full h-14 text-base tracking-widest uppercase font-semibold bg-[oklch(0.55_0.15_300)] text-[oklch(0.93_0.01_80)] hover:bg-[oklch(0.65_0.15_300)] border border-[oklch(0.55_0.15_300/0.5)] transition-all duration-200 shadow-[0_0_20px_oklch(0.55_0.15_300/0.3)] hover:shadow-[0_0_30px_oklch(0.55_0.15_300/0.5)]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Acceso Administrador
            </Button>
          </a>
        </div>

        {/* Restricted notice */}
        <p
          className="animate-fade-in-up delay-400 mt-8 text-xs text-[oklch(0.45_0.02_260)] tracking-widest uppercase"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          Plataforma de acceso restringido
        </p>
      </main>

      {/* Decorative row of symbols */}
      <div className="relative z-10 py-6 border-t border-[oklch(0.75_0.15_80/0.15)]">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-8 opacity-30">
          {["◈", "✦", "◇", "✦", "◈"].map((sym, i) => (
            <span
              key={i}
              className="text-[oklch(0.75_0.15_80)] text-sm"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              {sym}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[oklch(0.75_0.15_80/0.2)] py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-xs text-[oklch(0.45_0.02_260)] tracking-widest uppercase"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Derechos reservados
          </p>
          <p
            className="text-xs text-[oklch(0.35_0.02_260)] tracking-widest"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {new Date().getFullYear()} · Logia Masónica
          </p>
        </div>
      </footer>
    </div>
  );
}
