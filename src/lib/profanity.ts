import { Filter } from "bad-words";

const filter = new Filter();

/**
 * Returns true if the string contains profanity.
 * Only call client-side (bad-words is a pure JS library).
 */
export function isProfane(text: string): boolean {
  try {
    return filter.isProfane(text);
  } catch {
    return false;
  }
}
