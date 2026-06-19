// Fixed full-screen ambient background: animated gradient-mesh blobs + grain.
// Pure CSS transforms (translate/scale) so it stays cheap and 60fps.

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base">
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-violet/25 blur-[120px] animate-float" />
      <div className="absolute -right-32 top-10 h-[34rem] w-[34rem] rounded-full bg-cyan/20 blur-[120px] animate-drift" />
      <div className="absolute bottom-[-12rem] left-1/3 h-[38rem] w-[38rem] rounded-full bg-magenta/15 blur-[140px] animate-float" />
      <div className="grain absolute inset-0 opacity-[0.06] mix-blend-soft-light" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_55%)]" />
    </div>
  );
}
