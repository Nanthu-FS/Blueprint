// Helpers for cleaning model output and wrapping it into a standalone document.

/**
 * Strip anything that isn't body markup: markdown fences, stray <script>/<style>,
 * and full-document wrappers the model might emit despite instructions.
 * (innerHTML never executes injected <script>, but we remove them anyway so the
 * copied/downloaded file is clean.)
 */
export function cleanBodyHtml(raw: string): string {
  let html = raw;

  // Drop ```html ... ``` fences if present.
  html = html.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');

  // If the model wrapped a full doc, keep only the <body> inner content.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];

  // Remove doctype/html/head wrappers and script/style tags.
  html = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  return html.trim();
}

const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

/** Wrap cleaned body markup into a complete, self-contained HTML document. */
export function wrapDocument(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Blueprint export</title>
<script src="${TAILWIND_CDN}"></script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>body{font-family:'Inter',system-ui,sans-serif}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
