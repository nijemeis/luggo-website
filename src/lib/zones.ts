/** Zone math shared by the hero radar and the zones demo (docs/design/README.md, Animation spec). */

export type ZoneKey = "far" | "med" | "near" | "here";

export const ZONE_COLOR: Record<ZoneKey, string> = { far: "#7ea6c6", med: "#d9a25a", near: "#e0805c", here: "#e0805c" };
/** Darker text colour for the zone pill under the slider (contrast). */
export const ZONE_TEXT: Record<ZoneKey, string> = { far: "#4f7797", med: "#a8772f", near: "#c05f3c", here: "#c05f3c" };
export const ZONE_WORD: Record<ZoneKey, string> = { far: "Far", med: "Medium", near: "Near", here: "Here" };
/** Representative progress per zone (1 = far, 0 = arrived). */
export const ZONE_P: Record<ZoneKey, number> = { far: 0.8, med: 0.45, near: 0.18, here: 0 };
export const ZONE_KEYS: ZoneKey[] = ["far", "med", "near", "here"];

export function zoneFor(p: number): ZoneKey {
  if (p > 0.62) return "far";
  if (p > 0.3) return "med";
  if (p > 0.06) return "near";
  return "here";
}

/** Ping-pong 0..1. */
export function reflect(x: number): number {
  const m = ((x % 2) + 2) % 2;
  return m > 1 ? 2 - m : m;
}

export type ZoneCopy = Record<ZoneKey, { title: string; copy: string }>;
