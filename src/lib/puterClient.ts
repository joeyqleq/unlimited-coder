declare global {
  interface Window {
    puter?: any;
  }
}

export function getPuter(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).puter ?? null;
}
