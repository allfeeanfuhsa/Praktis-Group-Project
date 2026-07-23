/**
 * Utility helper to strip internal storage prefixes (e.g., "4-1784685365253-")
 * from filenames, returning clean human-readable original names for UI display.
 */
export const getCleanFilename = (filename) => {
  if (!filename) return '';
  return filename.replace(/^\d+-\d+-(?:\d+-)?/, '');
};
