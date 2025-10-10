
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  Ref,
} from "react";

/**
 * PrizeWheel.tsx
 * A single-file, plug-and-play, premium-feel SVG Prize Wheel Spinner component.
 * No external dependencies. Copy/paste into any React + TypeScript app.
 *
 * PUBLIC API
 * <PrizeWheel
 *    segments={[{ id:"1", label:"A", weight:1 }, ...]}
 *    radius={160}
 *    thickness={48}
 *    centerLabel="SPIN"
 *    theme={{ background:"#0b0d12", primary:"#111827", text:"#111", centerFill:"#fff", tickColor:"#111", shadow:"rgba(0,0,0,0.25)" }}
 *    fontFamily='ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
 *    spinDurationMs={5200}
 *    easing="easeOutExpo"
 *    winnerId={null}
 *    seed="optional-seed"
 *    onSpinStart={() => {}}
 *    onSpinEnd={(w) => {}}
 *    disabled={false}
 *    allowKeyboard={true}
 *    showCenterButton={true}
 *    tick={{ show:true, size:12 }}
 *    ariaLabel="Prize wheel spinner"
 *    size={400}
 *    labelMaxChars={18}
 *    hoverGlow={true}
 * />
 *
 * Forwarded ref exposes:
 *   - reset(): void — clears final state and re-enables spin
 */

type EasingName = "easeInOutCubic" | "easeOutQuart" | "easeOutExpo";

export type PrizeWheelSegment = {
  id: string;
  label: string;
  weight?: number;
  color?: string;
};

export type PrizeWheelTheme = {
  background?: string;
  primary?: string;
  text?: string;
  centerFill?: string;
  tickColor?: string;
  shadow?: string;
};

export type PrizeWheelProps = {
  segments: PrizeWheelSegment[];
  radius?: number;
  thickness?: number;
  centerLabel?: string;
  theme?: PrizeWheelTheme;
  fontFamily?: string;
  spinDurationMs?: number;
  easing?: EasingName;
  winnerId?: string | null;
  seed?: string | number | null;
  onSpinStart?: () => void;
  onSpinEnd?: (winner: { id: string; label: string; index: number }) => void;
  disabled?: boolean;
  allowKeyboard?: boolean;
  showCenterButton?: boolean;
  tick?: { show?: boolean; size?: number };
  ariaLabel?: string;
  size?: number;
  labelMaxChars?: number;
  hoverGlow?: boolean;
};

export type PrizeWheelRef = {
  reset: () => void;
};

// ────────────────────────────────────────────────────────────────────────────────
// Constants & Utilities
// ────────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  RADIUS: 160,
  THICKNESS: 56,
  SIZE: 400,
  CENTER_LABEL: "SPIN",
  FONT_FAMILY:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans"',
  THEME: {
    background: "#0b0d12",
    primary: "#111827",
    text: "#0b0d12",
    centerFill: "#ffffff",
    tickColor: "#111827",
  } as Required<PrizeWheelTheme>,
  SPIN_MS: 5200,
  EASING: "easeOutExpo" as EasingName,
  TICK_SIZE: 12,
  LABEL_MAX: 18,
};

/** Easing functions (t in [0,1]). */
const EASINGS: Record<EasingName, (t: number) => number> = {
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

/** Hash a string/number to uint32. */
function hashSeed(input: string | number): number {
  const str = String(input);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG. Deterministic given a seed. */
function mulberry32(a: number) {
  return function(): number {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Secure/random float [0,1). Prefers seed->mulberry, else crypto, else Math.random. */
function makeRandom(seed: string | number | null | undefined): () => number {
  if (seed !== undefined && seed !== null) {
    const s = hashSeed(seed);
    const r = mulberry32(s);
    return () => r();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return () => {
      const u32 = new Uint32Array(1);
      crypto.getRandomValues(u32);
      return u32[0] / 0xffffffff;
    };
  }
  return Math.random;
}

/** Clamp utility. */
const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x));

/** Normalize angle (deg) to [0,360). */
const normDeg = (deg: number) => ((deg % 360) + 360) % 360;

/** Convert polar to cartesian in SVG space (0° at 12 o'clock, clockwise). */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

/** Describe a donut slice path between start/end angles (deg). */
function describeDonutSlice(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
) {
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

/** Truncate string with ellipsis. */
function truncateLabel(label: string, max: number) {
  if (label.length <= max) return label;
  if (max <= 1) return "…";
  return label.slice(0, Math.max(0, max - 1)) + "…";
}

/** Generate a pleasant default HSL palette for n segments. */
function autoColors(n: number, s = 68, l = 58) {
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    const hue = Math.round((360 * i) / n);
    colors.push(`hsl(${hue} ${s}% ${l}%)`);
  }
  return colors;
}

/** Build cumulative weighted angle map. Angles measured CW from 0° at 12 o'clock. */
function buildSlices(segments: PrizeWheelSegment[]) {
  const weights = segments.map((seg) => (seg.weight ?? 1) > 0 ? seg.weight! : 0.0001);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const slices = segments.map((_seg, i) => {
    const frac = weights[i] / total;
    const start = (acc / total) * 360;
    const end = ((acc + weights[i]) / total) * 360;
    const mid = (start + end) / 2;
    acc += weights[i];
    return { index: i, startDeg: start, endDeg: end, midDeg: mid, frac };
  });
  return { totalWeight: total, slices };
}

/** Pick weighted random index using PRNG in [0,1). */
function pickWeightedIndex(weights: number[], rnd: () => number) {
  const total = weights.reduce((a, b) => a + Math.max(b, 0), 0);
  let r = rnd() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(weights[i], 0);
    if (r <= 1e-12) return i;
  }
  return weights.length - 1;
}

/** Compute final wheel rotation delta to align a segment center (deg) to the top needle (0°). */
function computeDeltaRotation(currentDeg: number, targetSegmentMid: number, extraTurns = 4) {
  const desired = normDeg(-targetSegmentMid);
  let delta = desired - normDeg(currentDeg);
  while (delta < extraTurns * 360) {
    delta += 360;
  }
  return delta;
}

// rAF / cancel polyfills with types
type RAF = (cb: FrameRequestCallback) => number;
type CAF = (h: number) => void;

const getRAF = (): RAF =>
  typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : ((cb: FrameRequestCallback) =>
      (setTimeout(() => cb(Date.now()), 16) as unknown as number));

const getCAF = (): CAF =>
  typeof cancelAnimationFrame === "function"
    ? cancelAnimationFrame
    : ((h: number) => clearTimeout(h));

// ────────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────────

const PrizeWheel = forwardRef(function PrizeWheel(
  props: PrizeWheelProps,
  ref: Ref<PrizeWheelRef>
) {
  const {
    segments,
    radius = DEFAULTS.RADIUS,
    thickness = DEFAULTS.THICKNESS,
    centerLabel = DEFAULTS.CENTER_LABEL,
    theme = DEFAULTS.THEME,
    fontFamily = DEFAULTS.FONT_FAMILY,
    spinDurationMs = DEFAULTS.SPIN_MS,
    easing = DEFAULTS.EASING,
    winnerId = null,
    seed = null,
    onSpinStart,
    onSpinEnd,
    disabled = false,
    allowKeyboard = true,
    showCenterButton = true,
    tick = { show: true, size: DEFAULTS.TICK_SIZE },
    ariaLabel = "Prize wheel spinner",
    size = DEFAULTS.SIZE,
    labelMaxChars = DEFAULTS.LABEL_MAX,
    hoverGlow = true,
  } = props;

  const outerR = radius;
  const innerR = Math.max(8, radius - thickness);
  const viewBox = useMemo(() => {
    const pad = 8; // slight padding for shadows/tick
    const dim = (outerR + pad) * 2;
    return `0 0 ${dim} ${dim}`;
  }, [outerR]);

  const cx = outerR + 8;
  const cy = outerR + 8;

  const colorPalette = useMemo(() => autoColors(Math.max(segments.length, 1)), [segments.length]);

  const { slices } = useMemo(() => buildSlices(segments), [segments]);

  const [angleDeg, setAngleDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<{ id: string; label: string; index: number } | null>(null);
  const [liveMsg, setLiveMsg] = useState<string>("");

  // rAF lifecycle
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const durationRef = useRef<number>(spinDurationMs);

  // Responsive "box" size (square). Defaults to the provided `size` prop.
  const [boxSize, setBoxSize] = useState(size);

  // Responsive helper: shrink from the `size` prop on smaller viewports
  const calcResponsiveSize = (vw: number, base: number) => {
    // tweak the breakpoints/numbers if you like
    if (vw <= 380) return Math.min(base, 260);
    if (vw <= 640) return Math.min(base, 300);
    if (vw <= 900) return Math.min(base, 360);
    if (vw <= 1280) return Math.min(base, 400);
    return base; // desktop: use the prop as-is
  };


  // Cleanup rAF
  useEffect(() => {
    return () => {
      const caf = getCAF();
      if (rafRef.current !== null) {
        caf(rafRef.current);
      }
    };
  }, []);

  // Update duration on prop change while idle
  useEffect(() => {
    if (!isSpinning) durationRef.current = spinDurationMs;
  }, [spinDurationMs, isSpinning]);

  // Reset if segments change while idle
  useEffect(() => {
    if (!isSpinning) {
      setAngleDeg(0);
      setWinner(null);
      setLiveMsg("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(segments.map((s) => [s.id, s.label, s.weight, s.color]))]);

  // Ref API
  useImperativeHandle(ref, () => ({
    reset() {
      const caf = getCAF();
      if (rafRef.current !== null) {
        caf(rafRef.current);
      }
      setAngleDeg(0);
      setIsSpinning(false);
      setWinner(null);
      setLiveMsg("");
    },
  }));

  // Compute chosen winner index based on props (winnerId or weighted PRNG)
  const chooseWinnerIndex = useCallback(() => {
    if (typeof winnerId === "string" && winnerId.length > 0) {
      const idx = segments.findIndex((s) => s.id === winnerId);
      return idx >= 0 ? idx : 0;
    }
    const rnd = makeRandom(seed);
    const weights = segments.map((s) => (s.weight ?? 1) > 0 ? s.weight! : 0.0001);
    return pickWeightedIndex(weights, rnd);
  }, [winnerId, seed, segments]);

  const easingFn = useMemo(() => EASINGS[easing], [easing]);

  const spin = useCallback(() => {
    if (disabled || isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setLiveMsg("Spinning…");
    onSpinStart?.();

    const idx = chooseWinnerIndex();
    const slice = buildSlices(segments).slices[idx];
    const extraTurns = 4 + Math.floor(makeRandom(seed ?? Date.now())() * 3); // 4–6 turns
    const delta = computeDeltaRotation(angleDeg, slice.midDeg, extraTurns);
    const target = angleDeg + delta;

    startTimeRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    startAngleRef.current = angleDeg;
    targetAngleRef.current = target;
    durationRef.current = spinDurationMs;

    const raf = getRAF();

    const step = (now: number) => {
      const t0 = startTimeRef.current;
      const d = durationRef.current;
      const elapsed = clamp(now - t0, 0, d);
      const p = easingFn(elapsed / d);
      const current = startAngleRef.current + (targetAngleRef.current - startAngleRef.current) * p;

      setAngleDeg(current);

      if (elapsed < d) {
        rafRef.current = raf(step);
      } else {
        setAngleDeg(targetAngleRef.current);
        setIsSpinning(false);
        const chosen = segments[idx];
        const w = { id: chosen.id, label: chosen.label, index: idx };
        setWinner(w);
        setLiveMsg(`Winner: ${chosen.label}`);
        onSpinEnd?.(w);
      }
    };

    rafRef.current = raf(step);
  }, [
    disabled,
    isSpinning,
    segments,
    onSpinStart,
    onSpinEnd,
    chooseWinnerIndex,
    easingFn,
    spinDurationMs,
    seed,
    angleDeg,
  ]);

  // Interactions
  const handleActivate = useCallback(() => {
    if (!isSpinning && !disabled) {
      spin();
    }
  }, [spin, isSpinning, disabled]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!allowKeyboard) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    },
    [allowKeyboard, handleActivate]
  );

  // Visuals
  const baseStyle: React.CSSProperties = {
    position: "relative",
    width: boxSize,
    height: boxSize,
    display: "inline-block",
    userSelect: "none",
    outline: "none",
    fontFamily,
  };

  const glow = hoverGlow && !disabled && !isSpinning ? "0 0 0 8px rgba(59,130,246,0.12)" : "none";

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    background: theme.background ?? DEFAULTS.THEME.background,
    position: "relative",
    display: "grid",
    placeItems: "center",
    transition: "box-shadow 200ms ease, transform 150ms ease",
  };

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: Math.max(64, thickness * 1.8),
    minHeight: Math.max(64, thickness * 1.8),
    borderRadius: "999px",
    border: "none",
    background: theme.centerFill ?? DEFAULTS.THEME.centerFill,
    color: theme.text ?? DEFAULTS.THEME.text,
    fontWeight: 700,
    letterSpacing: 0.5,
    fontSize: 14,
    cursor: disabled || isSpinning ? "not-allowed" : "pointer",
    transition: "transform 120ms ease, box-shadow 180ms ease, opacity 160ms ease",
    padding: "0 16px",
    display: showCenterButton ? "inline-flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    opacity: disabled ? 0.6 : 1,
  };

  const centerPressScale = disabled || isSpinning ? 1 : 0.985;

  const tickSize = clamp(tick?.size ?? DEFAULTS.TICK_SIZE, 6, 24);

  // Compute segment labels positions
  const labelRadius = (innerR + outerR) / 2;
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    fill: theme.text ?? DEFAULTS.THEME.text,
    pointerEvents: "none",
  };

  // Determine per-segment colors
  const segColors = segments.map((_seg, i) => _seg.color || colorPalette[i % colorPalette.length]);

  const ringStroke = theme.primary ?? DEFAULTS.THEME.primary;

  // Accessibility roles/labels
  const role = "group";
  const ariaBusy = isSpinning ? true : undefined;

  useEffect(() => {
    // SSR-safe
    if (typeof window === "undefined") {
      setBoxSize(size);
      return;
    }
    const update = () => setBoxSize(calcResponsiveSize(window.innerWidth, size));
    update(); // initial
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [size]);

  return (
    <div
      style={{ ...baseStyle }}
      tabIndex={allowKeyboard ? 0 : -1}
      role={role}
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      onKeyDown={onKeyDown}
    >
      {/* Embedded minimal styles for focus ring & hover glow */}
      <style>{`
        .pw-focusable:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 3px;
        }
        .pw-container:hover { box-shadow: ${glow}; }
        .pw-center:active { transform: translate(-50%, -50%) scale(${centerPressScale}); }
        @keyframes pw-pulse {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.50); }
          100% { box-shadow: 0 0 0 24px rgba(99,102,241,0.0); }
        }
      `}</style>

      <div className="pw-container" style={containerStyle}>
        {/* SVG Wheel */}
        <svg
          viewBox={viewBox}
          width="90%"
          height="90%"
          style={{ display: "block" }}
          aria-hidden="true"
        >
          {/* Wheel Shadow */}
          <defs>
            <filter id="pw-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Backplate */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill={ringStroke}
            opacity={0.06}
            filter="url(#pw-soft)"
          />

          {/* Rotating group */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${angleDeg}deg)`,
              transition: "transform 0ms", // rAF-driven
            }}
          >
            {/* Segments */}
            {slices.map((slice, i) => {
              const path = describeDonutSlice(
                cx,
                cy,
                outerR,
                innerR,
                slice.startDeg,
                slice.endDeg
              );
              const color = segColors[i];
              const mid = slice.midDeg;
              const labelPos = polarToCartesian(cx, cy, labelRadius, mid);
              const textRotate = mid;
              const display = truncateLabel(segments[i].label, labelMaxChars);
              const fullLabel = segments[i].label;

              return (
                <g key={segments[i].id}>
                  <path d={path} fill={color} />
                  {/* Subtle separators */}
                  <path
                    d={describeDonutSlice(cx, cy, outerR, innerR, slice.startDeg, slice.startDeg + 0.4)}
                    fill={"rgba(255,255,255,0.18)"}
                  />
                  {/* Label */}
                  <g transform={`rotate(${textRotate} ${labelPos.x} ${labelPos.y})`}>
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={labelStyle}
                    >
                      <title>{fullLabel}</title>
                      {display}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Inner donut hole */}
          <circle cx={cx} cy={cy} r={innerR} fill={theme.background ?? DEFAULTS.THEME.background} />

          {/* Tick / Needle at top */}
          {tick?.show !== false && (
            <g>
              <circle cx={cx} cy={cy - outerR - tickSize * 0.1} r={tickSize * 0.5} fill={theme.centerFill ?? DEFAULTS.THEME.centerFill} />
              <path
                d={[
                  `M ${cx} ${cy - outerR - tickSize * 0.5}`,
                  `L ${cx - tickSize * 0.7} ${cy - outerR + tickSize * 0.9}`,
                  `L ${cx + tickSize * 0.7} ${cy - outerR + tickSize * 0.9}`,
                  "Z",
                ].join(" ")}
                fill={theme.tickColor ?? DEFAULTS.THEME.tickColor}
                stroke="rgba(0,0,0,0.05)"
              />
            </g>
          )}
        </svg>

        {/* Center Button */}
        <button
          type="button"
          className="pw-center pw-focusable"
          style={buttonStyle}
          aria-label={ariaLabel}
          aria-disabled={disabled || isSpinning}
          disabled={disabled || isSpinning}
          onClick={handleActivate}
        >
          {centerLabel}
        </button>

        {/* Invisible overlay to allow click-to-spin anywhere (but not when disabled/spinning) */}
        {!showCenterButton && !disabled && !isSpinning && (
          <div
            onClick={handleActivate}
            title="Spin"
            style={{
              position: "absolute",
              inset: 0,
              cursor: "pointer",
              borderRadius: 24,
            }}
          />
        )}
      </div>

      {/* Live region for winners */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {liveMsg}
      </div>

      {/* Micro animation pulse on win */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: 24,
          boxShadow:
            winner && !isSpinning
              ? "0 0 0 0 rgba(99,102,241,0.0)"
              : "none",
          animation:
            winner && !isSpinning
              ? "pw-pulse 900ms ease-out 1"
              : "none",
        }}
      />
    </div>
  );
});

export default PrizeWheel;

/* ────────────────────────────────────────────────────────────────────────────────
USAGE EXAMPLE (not executed)
──────────────────────────────────────────────────────────────────────────────────
import PrizeWheel, { PrizeWheelSegment, PrizeWheelRef } from "./PrizeWheel";
import { useRef } from "react";

const segments: PrizeWheelSegment[] = [
  { id: "1", label: "Gift Card", weight: 2 },
  { id: "2", label: "Headphones", weight: 1.5 },
  { id: "3", label: "Sticker Pack", weight: 1 },
  { id: "4", label: "T-Shirt", weight: 1 },
  { id: "5", label: "Coffee Mug", weight: 1 },
];

export function Demo() {
  const ref = useRef<PrizeWheelRef>(null);
  return (
    <div style={{ display: "grid", gap: 24, placeItems: "center", padding: 24 }}>
      <PrizeWheel
        ref={ref}
        segments={segments}
        centerLabel="SPIN"
        onSpinEnd={(w) => console.log("Winner:", w)}
        size={420}
        labelMaxChars={16}
        theme={{ background: "#0b0d12", primary: "#0f172a", text: "#0b0d12", centerFill: "#ffffff", tickColor: "#0b0d12" }}
        hoverGlow
      />
      <button onClick={() => ref.current?.reset()}>Reset</button>
    </div>
  );
}

TESTING CHECKLIST
- [ ] Click center button spins; disabled while spinning; re-enabled after end.
- [ ] Keyboard: focus container, press Enter/Space -> spins.
- [ ] ARIA: announces "Spinning…" then "Winner: X".
- [ ] winnerId forces precise landing; onSpinEnd returns correct id/index.
- [ ] Seeded randomness reproducible; weights honored.
- [ ] Responsive & crisp; no leaks; SSR-safe guards.
*/
