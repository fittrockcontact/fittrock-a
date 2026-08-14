/**
 * Whitelisted Administrator Emails for Fittrock Ergonomics
 */
export const ADMIN_EMAILS: string[] = [
  'fittrock.contact@gmail.com',
  'trishuldn@gmail.com',
  'ganeshdevkate@gmail.com',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}
