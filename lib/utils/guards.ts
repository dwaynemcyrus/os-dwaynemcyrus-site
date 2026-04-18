export function normalizeCaptureContent(content: string) {
  return content.trim();
}

export function isEmptyCaptureContent(content: string) {
  return normalizeCaptureContent(content).length === 0;
}
