// Voorkomt eeuwig "Laden...": een hangende Supabase-call (zoals bij een
// gepauzeerde database) wordt na `ms` afgebroken zodat de UI een foutstaat
// met retry kan tonen. Zie storing 2026-07-02.
export function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Tijdslimiet van ${ms}ms overschreden`);
      err.name = "TimeoutError";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timer)
  ) as Promise<T>;
}
