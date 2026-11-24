/**
 * Single source for the privacy policy's version.
 *
 * The consent box stores this value when someone presses accept, and shows
 * itself again whenever the stored value differs. Bump POLICY_VERSION when the
 * policy changes in a way people should be asked about again (new data
 * collected, new third party). Fixing a typo does not need a bump.
 */
export const POLICY_VERSION = "2026-11-24";
export const POLICY_UPDATED_TH = "24 พฤศจิกายน 2569";
export const CONSENT_STORAGE_KEY = "linkmvp-privacy-consent";

/** Pure so it can be tested without a browser. */
export function needsConsent(stored: string | null | undefined): boolean {
  return stored !== POLICY_VERSION;
}
