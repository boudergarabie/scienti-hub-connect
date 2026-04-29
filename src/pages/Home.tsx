import { MapPin, Calendar, Lightbulb, ChevronDown } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { CONFERENCE } from "@/data/mockData";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// ─── Floating energy particle ─────────────────────────────────────
const Particle = ({
  top, left, right, size, color, animName, delay, duration,
}: {
  top: string; left?: string; right?: string;
  size: number; color: string;
  animName: string; delay: string; duration: string;
}) => (
  <div
    className="absolute rounded-full pointer-events-none"
    aria-hidden="true"
    style={{
      top, left, right,
      width: size, height: size,
      backgroundColor: color,
      animation: `${animName} ${duration} ${delay} ease-in-out infinite`,
    }}
  />
);

// ─── Wind turbine SVG silhouette ──────────────────────────────────
const Turbine = ({
  width, height, hubColor, spinDuration, reverse = false,
}: {
  width: number; height: number;
  hubColor: string; spinDuration: string; reverse?: boolean;
}) => {
  const cx = width / 2;
  const cy = height * 0.3;
  const bladeLen = height * 0.26;
  const spinStyle: React.CSSProperties = {
    transformOrigin: `${cx}px ${cy}px`,
    animation: `turbineSpin ${spinDuration} linear infinite ${reverse ? "reverse" : ""}`,
  };
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="white" xmlns="http://www.w3.org/2000/svg">
      {/* Tower */}
      <path
        d={`M${cx - 4} ${cy + 10} L${cx + 4} ${cy + 10} L${cx + 7} ${height} L${cx - 7} ${height} Z`}
        fill="white"
      />
      {/* Nacelle */}
      <ellipse cx={cx} cy={cy} rx={width * 0.08} ry={width * 0.045} fill="white" />
      {/* Blades */}
      <g style={spinStyle}>
        <ellipse cx={cx} cy={cy - bladeLen * 0.5} rx={width * 0.038} ry={bladeLen} fill="white" transform={`rotate(0 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy - bladeLen * 0.5} rx={width * 0.038} ry={bladeLen} fill="white" transform={`rotate(120 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy - bladeLen * 0.5} rx={width * 0.038} ry={bladeLen} fill="white" transform={`rotate(240 ${cx} ${cy})`} />
      </g>
      {/* Hub dot */}
      <circle cx={cx} cy={cy} r={width * 0.035} fill={hubColor} opacity="0.9" />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════
const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const isAttendee = isAuthenticated && user?.userCategory === "Attendee";

  const particles = [
    { top: "17%", left: "11%",  size: 5, color: "hsl(170 55% 52%)", animName: "particleFloat",  delay: "0s",   duration: "5.5s" },
    { top: "30%", right: "13%", size: 3, color: "hsl(38 80% 65%)",  animName: "particleFloat2", delay: "0s",   duration: "7s"   },
    { top: "54%", left: "6%",   size: 4, color: "hsl(38 80% 62%)",  animName: "particleFloat3", delay: "1s",   duration: "6s"   },
    { top: "63%", right: "9%",  size: 6, color: "hsl(170 55% 52%)", animName: "particleFloat",  delay: "2s",   duration: "8s"   },
    { top: "21%", left: "53%",  size: 2, color: "hsl(38 80% 72%)",  animName: "particleFloat2", delay: "0.5s", duration: "4.5s" },
    { top: "42%", right: "23%", size: 3, color: "hsl(170 55% 52%)", animName: "particleFloat3", delay: "1.5s", duration: "6.5s" },
  ] as const;

  return (
    <div className="pb-20">

      {/* ╔══════════════════════════════════════════════════════════╗
          ║  HERO                                                    ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* ── Layer 1: base deep navy ── */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(170deg, hsl(222 60% 7%) 0%, hsl(220 52% 11%) 55%, hsl(218 46% 15%) 100%)" }}
        />

        {/* ── Layer 2: solar horizon glow (breathing) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 140% 52% at 50% 118%, hsl(38 90% 55% / 0.24) 0%, hsl(38 75% 40% / 0.10) 38%, transparent 66%)",
            animation: "solarBreath 5s ease-in-out infinite",
          }}
        />

        {/* ── Layer 3: teal accent glow (top-left) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 52% 44% at -6% 22%, hsl(170 55% 40% / 0.13) 0%, transparent 60%)" }}
        />

        {/* ── Layer 4: subtle tech grid ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: "linear-gradient(hsl(215 80% 85% / 0.028) 1px, transparent 1px), linear-gradient(90deg, hsl(215 80% 85% / 0.028) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* ── Layer 5: rotating sun rays ── */}
        <div
          className="absolute pointer-events-none"
          aria-hidden="true"
          style={{
            bottom: "-28%",
            left: "50%",
            width: "960px",
            height: "960px",
            marginLeft: "-480px",
            opacity: 0.04,
            animation: "rayRotate 100s linear infinite",
          }}
        >
          <svg viewBox="0 0 960 960" fill="none" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 15 - 90) * (Math.PI / 180);
              return (
                <line
                  key={i}
                  x1="480" y1="480"
                  x2={480 + 480 * Math.cos(angle)}
                  y2={480 + 480 * Math.sin(angle)}
                  stroke="hsl(38 80% 65%)"
                  strokeWidth={i % 4 === 0 ? "2.5" : "1"}
                />
              );
            })}
            {/* Inner ring marks */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              return (
                <circle
                  key={`dot-${i}`}
                  cx={480 + 200 * Math.cos(angle)}
                  cy={480 + 200 * Math.sin(angle)}
                  r="3"
                  fill="hsl(38 80% 65%)"
                />
              );
            })}
          </svg>
        </div>

        {/* ── Layer 6: wind turbine right ── */}
        <div
          className="absolute bottom-0 right-[5%] pointer-events-none select-none hidden md:block"
          aria-hidden="true"
          style={{ opacity: 0.062 }}
        >
          <Turbine width={160} height={310} hubColor="hsl(38 80% 55%)" spinDuration="9s" />
        </div>

        {/* ── Layer 7: wind turbine left (smaller, counter-rotate) ── */}
        <div
          className="absolute bottom-0 left-[7%] pointer-events-none select-none hidden lg:block"
          aria-hidden="true"
          style={{ opacity: 0.04 }}
        >
          <Turbine width={100} height={195} hubColor="hsl(170 55% 45%)" spinDuration="13s" reverse />
        </div>

        {/* ── Floating particles ── */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* ══ CONTENT ══════════════════════════════════════════════ */}
        <div className="container relative z-10 mx-auto px-4 sm:px-6 pt-28 pb-36 max-w-4xl text-center">

          {/* Ghost acronym backdrop */}
          <div
            className="absolute inset-x-0 top-[8%] flex justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="font-display font-bold leading-none text-white"
              style={{ fontSize: "clamp(96px, 20vw, 220px)", letterSpacing: "-0.03em", opacity: 0.032 }}
            >
              ICSIT
            </span>
          </div>

          {/* Date + location pre-heading */}
          <div
            className="inline-flex items-center gap-3 mb-7"
            style={{ animation: "heroReveal 0.7s ease-out both" }}
          >
            <span className="h-px w-10" style={{ background: "hsl(170 55% 50% / 0.65)" }} />
            <span
              className="text-xs sm:text-sm uppercase tracking-[0.22em] font-medium"
              style={{ color: "hsl(170 55% 60%)" }}
            >
              May 2–4, 2026 &nbsp;·&nbsp; Blida, Algeria
            </span>
            <span className="h-px w-10" style={{ background: "hsl(170 55% 50% / 0.65)" }} />
          </div>

          {/* Main title */}
          <h1
            className="relative font-display font-bold text-white leading-[1.07] mb-5"
            style={{
              fontSize: "clamp(26px, 5.2vw, 62px)",
              animation: "heroReveal 0.72s 0.11s ease-out both",
            }}
          >
            {CONFERENCE.name}
          </h1>

          {/* Acronym + gold rule */}
          <div
            className="flex items-center justify-center gap-4 mb-4"
            style={{ animation: "heroReveal 0.72s 0.21s ease-out both" }}
          >
            <span
              className="h-px flex-1 max-w-[90px]"
              style={{ background: "linear-gradient(90deg, transparent, hsl(38 80% 55% / 0.55))" }}
            />
            <span
              className="text-base sm:text-lg font-bold tracking-[0.2em] uppercase"
              style={{ color: "hsl(38 80% 60%)" }}
            >
              ICSIT 2026
            </span>
            <span
              className="h-px flex-1 max-w-[90px]"
              style={{ background: "linear-gradient(270deg, transparent, hsl(38 80% 55% / 0.55))" }}
            />
          </div>

          {/* Venue */}
          <div
            className="flex items-center justify-center gap-2 mb-10"
            style={{ animation: "heroReveal 0.72s 0.3s ease-out both" }}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(38 80% 55% / 0.6)" }} />
            <span className="text-xs sm:text-sm" style={{ color: "hsl(215 30% 70%)" }}>
              {CONFERENCE.venue}
            </span>
          </div>

          {/* Countdown */}
          <div
            className="flex justify-center mb-10"
            style={{ animation: "heroReveal 0.72s 0.4s ease-out both" }}
          >
            <CountdownTimer targetDate={CONFERENCE.date} />
          </div>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center justify-center gap-3"
            style={{ animation: "heroReveal 0.72s 0.52s ease-out both" }}
          >
            {!isAttendee && (
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "hsl(38 80% 55%)",
                  color: "hsl(222 60% 9%)",
                  boxShadow: "0 0 28px hsl(38 80% 55% / 0.32), 0 2px 8px hsl(0 0% 0% / 0.3)",
                }}
              >
                Submit Your Paper
              </Link>
            )}
            <Link
              to="/program"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{
                color: "hsl(215 30% 82%)",
                border: "1px solid hsl(215 40% 55% / 0.28)",
                background: "hsl(215 50% 60% / 0.06)",
              }}
            >
              View Program
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
          style={{ animation: "scrollBounce 2.2s ease-in-out infinite", opacity: 0.28 }}
          aria-hidden="true"
        >
          <span className="text-[9px] uppercase tracking-[0.25em] text-white">Scroll</span>
          <ChevronDown className="h-4 w-4 text-white" />
        </div>

        {/* Bottom horizon line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          aria-hidden="true"
          style={{ background: "linear-gradient(90deg, transparent 0%, hsl(38 80% 55% / 0.35) 40%, hsl(170 55% 45% / 0.25) 60%, transparent 100%)" }}
        />
      </section>

      {/* ── Scientific Themes ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Scientific Themes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore cutting-edge research across six multidisciplinary tracks
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONFERENCE.themes.map((theme) => (
              <div
                key={theme}
                className="bg-card border border-border rounded-lg p-6 shadow-card hover:border-primary/40 transition-colors group"
              >
                <Lightbulb className="h-8 w-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-lg font-semibold text-foreground">{theme}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Info ───────────────────────────────────────────── */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto max-w-4xl grid sm:grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <Calendar className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">3 Days of Innovation</h3>
              <p className="text-muted-foreground text-sm">
                Keynotes, panel discussions, poster sessions, and networking events across three action-packed days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">Venue</h3>
              <p className="text-muted-foreground text-sm">{CONFERENCE.venue}</p>
              <p className="text-muted-foreground text-sm">{CONFERENCE.location}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
