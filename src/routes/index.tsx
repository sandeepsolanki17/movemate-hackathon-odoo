import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Sections />
    </>
  );
}


function Hero() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  const animate = !reduced;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor: "#14171C",
        color: "#EDEEF0",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,135,148,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,135,148,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.5) 70%, transparent 100%)",
        }}
      />
      {/* depth wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 0%, #1C2027 0%, transparent 55%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col justify-center px-8 md:px-14 pt-24 pb-40">
        <div
          className="mb-6"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7C8794",
            opacity: 0,
            animation: animate
              ? "mm-in 0.6s ease-out 0.05s forwards"
              : "none",
            ...(reduced ? { opacity: 1 } : {}),
          }}
        >
          <span style={{ color: "#C9A227" }}>◆</span>&nbsp;&nbsp;MoveMate · Smart Fleet Companion
        </div>

        <h1
          className="m-0"
          style={{
            fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(64px, 11vw, 168px)",
            lineHeight: 0.92,
            letterSpacing: "0.005em",
          }}
        >
          <span
            className="block"
            style={{
              color: "#EDEEF0",
              opacity: 0,
              transform: "translateY(14px)",
              animation: animate
                ? "mm-rise 0.7s ease-out 0.15s forwards"
                : "none",
              ...(reduced ? { opacity: 1, transform: "none" } : {}),
            }}
          >
            Every delivery,
          </span>
          <span
            className="block"
            style={{
              color: "#C9A227",
              opacity: 0,
              transform: "translateY(14px)",
              animation: animate
                ? "mm-rise 0.7s ease-out 0.3s forwards"
                : "none",
              ...(reduced ? { opacity: 1, transform: "none" } : {}),
            }}
          >
            on the move.
          </span>
        </h1>

        <p
          className="mt-8"
          style={{
            color: "#7C8794",
            maxWidth: 480,
            fontSize: 15,
            lineHeight: 1.6,
            opacity: 0,
            transform: "translateY(10px)",
            animation: animate
              ? "mm-rise 0.6s ease-out 0.55s forwards"
              : "none",
            ...(reduced ? { opacity: 1, transform: "none" } : {}),
          }}
        >
          MoveMate handles route planning, live tracking, and dispatch
          intelligence for the vehicles your business already runs.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center gap-3"
          style={{
            opacity: 0,
            transform: "translateY(10px)",
            animation: animate
              ? "mm-rise 0.6s ease-out 0.75s forwards"
              : "none",
            ...(reduced ? { opacity: 1, transform: "none" } : {}),
          }}
        >
          <a
            href="/login"
            className="inline-flex items-center justify-center transition-colors"
            style={{
              background: "#C9A227",
              color: "#14171C",
              padding: "14px 26px",
              borderRadius: 2,
              border: "none",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#D4A72C")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A227")}
          >
            Start Shipping
          </a>

          <button
            type="button"
            className="inline-flex items-center justify-center transition-colors"
            style={{
              background: "transparent",
              color: "#EDEEF0",
              padding: "13px 25px",
              borderRadius: 2,
              border: "1px solid #7C8794",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#EDEEF0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#7C8794")
            }
            onClick={() => document.getElementById("movemate-system")?.scrollIntoView({ behavior: "smooth" })}
          >
            Track a Shipment
          </button>
        </div>
      </div>

      {/* Route line + wordmark + truck zone */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0"
        style={{ bottom: "18vh" }}
      >
        {/* dashed route line */}
        <div
          className="relative mx-auto"
          style={{
            maxWidth: 1400,
            height: 1,
            borderTop: "1px dashed rgba(124,135,148,0.45)",
          }}
        >
          {/* filled progress trail */}
          <div
            style={{
              position: "absolute",
              top: -1,
              left: 0,
              height: 1,
              background: "#C9A227",
              width: animate ? 0 : "78%",
              animation: animate
                ? "mm-trail 1.9s ease-out 1.5s forwards"
                : "none",
            }}
          />
        </div>
      </div>

      {/* Wordmark */}
      <div
        className="pointer-events-none absolute left-0 right-0 flex justify-center"
        style={{ bottom: "8vh" }}
      >
        <div
          className="relative"
          style={{
            opacity: 0,
            transform: "translateY(14px)",
            animation: animate
              ? "mm-rise 0.9s ease-out 1.0s forwards"
              : "none",
            ...(reduced ? { opacity: 1, transform: "none" } : {}),
          }}
        >
          {/* subtle glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-30% -10%",
              background:
                "radial-gradient(ellipse at 65% 50%, rgba(201,162,39,0.22), transparent 65%)",
              filter: "blur(30px)",
              zIndex: 0,
            }}
          />
          <div
            className="relative"
            style={{
              fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(56px, 10vw, 148px)",
              lineHeight: 1,
              letterSpacing: "0.01em",
              zIndex: 1,
            }}
          >
            <span style={{ color: "#EDEEF0" }}>Move</span>
            <span style={{ color: "#C9A227" }}>Mate</span>
          </div>
        </div>
      </div>

      {/* Truck — sits on the dashed line at wordmark height */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0"
        style={{ bottom: "18vh" }}
      >
        <div
          className="relative mx-auto"
          style={{ maxWidth: 1400, height: 0 }}
        >
          <div
            style={{
              position: "absolute",
              right: "22%",
              bottom: 0,
              transform: animate ? "translate(120vw, 0)" : "translate(0,0)",
              animation: animate
                ? "mm-truck 2s cubic-bezier(0.22, 1, 0.36, 1) 1.5s forwards"
                : "none",
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            {/* status pill above truck */}
            <div
              style={{
                position: "absolute",
                top: -34,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#C9A227",
                border: "1px solid rgba(201,162,39,0.4)",
                padding: "4px 8px",
                borderRadius: 2,
                background: "rgba(20,23,28,0.7)",
                whiteSpace: "nowrap",
                opacity: animate ? 0 : 1,
                animation: animate
                  ? "mm-in 0.5s ease-out 3.4s forwards"
                  : "none",
              }}
            >
              ● Arriving
            </div>
            <Truck />
          </div>
        </div>
      </div>

      {/* footer meta */}
      <div
        className="absolute bottom-6 left-8 md:left-14 z-10"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#7C8794",
        }}
      >
        v1.0 · Fleet Ops
      </div>
      <div
        className="absolute bottom-6 right-8 md:right-14 z-10"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#7C8794",
        }}
      >
        Est. 2026
      </div>

      <style>{`
        @keyframes mm-rise {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mm-in {
          to { opacity: 1; }
        }
        @keyframes mm-trail {
          to { width: 78%; }
        }
        @keyframes mm-truck {
          to { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
}

function Truck() {
  // Flat side-profile delivery truck. Dust Yellow cab, Wet Asphalt trailer.
  return (
    <svg
      width="180"
      height="86"
      viewBox="0 0 180 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* trailer */}
      <rect x="2" y="18" width="112" height="48" fill="#1C2027" stroke="#7C8794" strokeWidth="1" />
      {/* trailer seam */}
      <line x1="58" y1="18" x2="58" y2="66" stroke="#7C8794" strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="18" x2="30" y2="66" stroke="#7C8794" strokeWidth="1" opacity="0.3" />
      <line x1="86" y1="18" x2="86" y2="66" stroke="#7C8794" strokeWidth="1" opacity="0.3" />
      {/* small MM mark */}
      <text x="10" y="34" fill="#C9A227" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="1">MM</text>
      {/* cab body */}
      <path d="M116 30 L138 30 L152 46 L152 66 L116 66 Z" fill="#C9A227" />
      {/* cab window */}
      <path d="M120 34 L136 34 L146 46 L120 46 Z" fill="#14171C" opacity="0.85" />
      {/* hood */}
      <rect x="152" y="52" width="18" height="14" fill="#C9A227" />
      {/* grille */}
      <rect x="168" y="54" width="4" height="10" fill="#14171C" />
      {/* headlight */}
      <rect x="168" y="49" width="4" height="3" fill="#EDEEF0" opacity="0.9" />
      {/* wheels */}
      <circle cx="24" cy="70" r="8" fill="#14171C" stroke="#7C8794" strokeWidth="1" />
      <circle cx="24" cy="70" r="3" fill="#7C8794" />
      <circle cx="90" cy="70" r="8" fill="#14171C" stroke="#7C8794" strokeWidth="1" />
      <circle cx="90" cy="70" r="3" fill="#7C8794" />
      <circle cx="140" cy="70" r="8" fill="#14171C" stroke="#7C8794" strokeWidth="1" />
      <circle cx="140" cy="70" r="3" fill="#7C8794" />
    </svg>
  );
}

// ---------- Scroll reveal ----------
function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: any;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: reduced
          ? "none"
          : `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

// ---------- Sections ----------
const ASPHALT = "#14171C";
const WET = "#1C2027";
const DUST = "#C9A227";
const OCHRE = "#D4A72C";
const FOG = "#EDEEF0";
const SLATE = "#7C8794";
const HAIRLINE = "rgba(124,135,148,0.2)";

const font = {
  display: "'Barlow Condensed', 'Inter', sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

function SectionShell({
  bg,
  children,
  id,
}: {
  bg: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{ backgroundColor: bg, color: FOG, fontFamily: font.body }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-8 md:px-14 py-24 md:py-32">
        {children}
      </div>
    </section>
  );
}

function DisplayH2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: "clamp(38px, 5.5vw, 72px)",
        lineHeight: 1.02,
        letterSpacing: "0.005em",
        color: FOG,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: SLATE,
      }}
    >
      {children}
    </div>
  );
}

function Sections() {
  return (
    <div style={{ backgroundColor: ASPHALT, fontFamily: font.body }}>
      {/* SECTION 1 — Trust bar */}
      <section
        style={{
          backgroundColor: WET,
          borderTop: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div className="mx-auto w-full max-w-[1200px] px-8 md:px-14 py-6">
          <Reveal>
            <ul
              className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                fontFamily: font.mono,
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: SLATE,
              }}
            >
              {[
                "Real-time dispatch validation",
                "Automatic status tracking",
                "Zero manual DB edits",
                "Built for fleet operations",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      background: DUST,
                      display: "inline-block",
                    }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2 — The Problem */}
      <SectionShell bg={ASPHALT}>
        <Reveal>
          <Eyebrow>◆ The Problem</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 max-w-[900px]">
            <DisplayH2>Spreadsheets weren&apos;t built for this.</DisplayH2>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <p
            className="mt-8"
            style={{
              color: SLATE,
              maxWidth: 620,
              fontSize: 16,
              lineHeight: 1.65,
            }}
          >
            Operations teams assign vehicles and drivers by memory. Nobody knows which van is
            actually free, which license just expired, or which truck is out for service.
            Overloaded cargo and lapsed permits only surface after the trip is already
            out the gate — usually as a phone call from the driver.
          </p>
        </Reveal>
      </SectionShell>

      {/* SECTION 3 — How MoveMate Works */}
      <SectionShell bg={WET} id="movemate-system">
        <Reveal>
          <Eyebrow>◆ The System</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 max-w-[900px]">
            <DisplayH2>One system. Every moving part.</DisplayH2>
          </div>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: HAIRLINE }}>
          {[
            {
              label: "Vehicles & Drivers",
              body: "Know what's available, what's expired, what's down for service — before you assign anything.",
            },
            {
              label: "Trip Dispatch",
              body: "The system checks capacity, license validity, and availability before a trip is dispatched — and tells you why, if it can't.",
            },
            {
              label: "Maintenance & Fuel",
              body: "Every cost and every service event tied directly to the vehicle that incurred it.",
            },
            {
              label: "Reports",
              body: "Fuel efficiency, utilization, and cost — computed live, not reconstructed at month-end.",
            },
          ].map((m, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                style={{
                  background: WET,
                  padding: "28px 24px",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: DUST,
                  }}
                >
                  ◆ Module
                </div>
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: 26,
                    lineHeight: 1.05,
                    color: FOG,
                    letterSpacing: "0.005em",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: SLATE,
                  }}
                >
                  {m.body}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* SECTION 4 — Signature feature */}
      <SectionShell bg={ASPHALT}>
        <Reveal>
          <Eyebrow>◆ Signature Feature</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 max-w-[960px]">
            <DisplayH2>
              It doesn&apos;t just track dispatch —{" "}
              <span style={{ color: DUST }}>it prevents bad ones.</span>
            </DisplayH2>
          </div>
        </Reveal>


        <Reveal delay={280}>
          <p
            className="mt-10"
            style={{
              color: SLATE,
              maxWidth: 560,
              fontSize: 15,
              lineHeight: 1.65,
            }}
          >
            Bad dispatches cost fuel, time, and trust. MoveMate stops them at the
            point of decision — with a reason your fleet team can actually act on.
          </p>
        </Reveal>
      </SectionShell>

      {/* SECTION 5 — By the numbers */}
      <SectionShell bg={WET}>
        <Reveal>
          <Eyebrow>◆ By the Numbers</Eyebrow>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { n: "24", l: "Vehicles under management", c: "Demo fleet" },
            { n: "312", l: "Trips dispatched", c: "Last 30 days" },
            { n: "96%", l: "On-time completion", c: "Rolling avg" },
            { n: "4.2s", l: "Avg dispatch check", c: "Validation latency" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div>
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: "clamp(48px, 6vw, 84px)",
                    lineHeight: 1,
                    color: DUST,
                    letterSpacing: "0.005em",
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    color: FOG,
                    fontSize: 15,
                    lineHeight: 1.4,
                  }}
                >
                  {s.l}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: font.mono,
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: SLATE,
                  }}
                >
                  {s.c}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* SECTION 6 — Built For */}
      <SectionShell bg={ASPHALT}>
        <Reveal>
          <Eyebrow>◆ Built For</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-6 max-w-[900px]">
            <DisplayH2>Built around how a fleet actually runs.</DisplayH2>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { r: "Fleet Manager", d: "Vehicles, maintenance, and dispatch oversight in one view." },
            { r: "Driver", d: "Today's trip, route, and status — nothing else in the way." },
            { r: "Safety Officer", d: "License expiries, incident logs, and compliance flags." },
            { r: "Financial Analyst", d: "Fuel, service, and cost-per-trip pulled straight from operations." },
          ].map((r, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                style={{
                  background: WET,
                  border: `1px solid ${HAIRLINE}`,
                  padding: "22px 22px 24px",
                  minHeight: 160,
                }}
              >
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: DUST,
                    marginBottom: 12,
                  }}
                >
                  Role
                </div>
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: 22,
                    lineHeight: 1.1,
                    color: FOG,
                  }}
                >
                  {r.r}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: SLATE,
                  }}
                >
                  {r.d}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* SECTION 7 — Final CTA */}
      <SectionShell bg={WET}>
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Eyebrow>◆ Get Started</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-6" style={{ maxWidth: 780 }}>
              <DisplayH2>Ready to see it in motion?</DisplayH2>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <a
              href="/login"
              className="mt-10 inline-flex items-center justify-center transition-colors"
              style={{
                background: DUST,
                color: ASPHALT,
                padding: "16px 32px",
                borderRadius: 2,
                fontFamily: font.mono,
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = OCHRE)}
              onMouseLeave={(e) => (e.currentTarget.style.background = DUST)}
            >
              Start Shipping
            </a>
          </Reveal>
        </div>
      </SectionShell>

      {/* SECTION 8 — Footer */}
      <footer
        style={{
          backgroundColor: WET,
          borderTop: `1px solid ${HAIRLINE}`,
        }}
      >
        <div className="mx-auto w-full max-w-[1200px] px-8 md:px-14 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div
              style={{
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              <span style={{ color: FOG }}>Move</span>
              <span style={{ color: DUST }}>Mate</span>
            </div>
            <nav
              className="flex flex-wrap items-center gap-x-8 gap-y-2"
              style={{
                fontFamily: font.mono,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: SLATE,
              }}
            >
              {[
                ["Product", "#movemate-system"],
                ["Dashboard", "/dashboard"],
                ["Reports", "/reports"],
                ["Login", "/login"],
              ].map(([l, href]) => (
                <a
                  key={l}
                  href={href}
                  style={{ color: SLATE, textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = FOG)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = SLATE)}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
          <div
            className="mt-8"
            style={{
              fontFamily: font.mono,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: SLATE,
            }}
          >
            MoveMate — built for the Fleet Ops Hackathon, 2026.
          </div>
        </div>
      </footer>
    </div>
  );
}

