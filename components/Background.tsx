// Cinematic ambient background: true near-black with restrained directional
// light-leaks (warm from top, cool from a corner), a fine dot-grid, grain, and
// an edge vignette. Calm and premium - no rainbow blobs.

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base">
      {/* fine dot-grid texture */}
      <div className="dotgrid absolute inset-0 opacity-[0.035]" />

      {/* warm top-center light-leak (the "gauge" energy) */}
      <div className="absolute -top-[28rem] left-1/2 h-[58rem] w-[80rem] -translate-x-1/2 rounded-full bg-amber/[0.09] blur-[170px] animate-breathe" />

      {/* cool glow, lower-left */}
      <div className="absolute -bottom-[22rem] -left-48 h-[46rem] w-[46rem] rounded-full bg-steel/[0.08] blur-[160px]" />

      {/* faint warm ember, lower-right */}
      <div className="absolute -bottom-[18rem] -right-40 h-[34rem] w-[34rem] rounded-full bg-amber/[0.05] blur-[150px]" />

      {/* grain */}
      <div className="grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />

      {/* edge vignette to focus the center */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_40%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
