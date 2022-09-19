export function generateId(): string {
  return Date.now().toString();
}

export const cls = (...args: any[]) => args.filter(Boolean).join(" ");
