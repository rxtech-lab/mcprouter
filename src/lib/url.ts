export interface Context {
  version: string;
}

export function renderUrl(url: string, context: Context) {
  return url.replaceAll("{{version}}", context.version);
}
