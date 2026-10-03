// One game clock, independent of renderer tickers. Renderers must never tick Game/Physics.
// frame receives monotonic milliseconds; the existing fixed-step accumulator owns time limits.
export function startFrameLoop(frame, {
 request = callback => globalThis.requestAnimationFrame(callback),
 cancel = id => globalThis.cancelAnimationFrame(id),
 now = () => globalThis.performance.now()
} = {}) {
 let active = true;
 let pending;
 const next = () => {
  if (!active) return;
  pending = request(next);
  frame(now());
 };
 pending = request(next);
 return () => {
  if (!active) return;
  active = false;
  cancel(pending);
 };
}
