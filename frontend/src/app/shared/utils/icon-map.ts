/** Maps category icon names to emoji characters. */
export const ICON_MAP: Record<string, string> = {
  'briefcase': '\u{1F4BC}',
  'heart': '\u2764\uFE0F',
  'banknotes': '\u{1F4B0}',
  'academic-cap': '\u{1F393}',
  'user': '\u{1F464}',
  'users': '\u{1F465}',
  'star': '\u2B50',
  'trophy': '\u{1F3C6}',
  'shield': '\u{1F6E1}\uFE0F',
  'target': '\u{1F3AF}',
  'chart': '\u{1F4CA}',
  'calendar': '\u{1F4C5}',
  'fire': '\u{1F525}',
  'bolt': '\u26A1',
  'globe': '\u{1F30D}',
  'home': '\u{1F3E0}',
  'book': '\u{1F4DA}',
  'music': '\u{1F3B5}',
  'camera': '\u{1F4F7}',
  'airplane': '\u2708\uFE0F',
};

/** Returns the emoji for an icon name, or the name itself as fallback. */
export function getIconEmoji(iconName: string): string {
  return ICON_MAP[iconName] || iconName;
}
