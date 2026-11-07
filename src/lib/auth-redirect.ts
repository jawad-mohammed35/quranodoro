/** Resolve only local paths; reject protocol-relative and backslash redirects. */
export function safeAuthPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/";
  return value;
}
