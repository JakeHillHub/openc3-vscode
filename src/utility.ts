/**
 * General utility stuff that doesn't fit in
 */

/**
 * NOTE: this acts as a "trailing edge debounce" keep your timeout/wait very short
 * to avoid excessive delays and unresponsiveness
 * @param func function to debounce
 * @param wait milliseconds
 * @returns {any} composition
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export class UpdateSettingsFlag {
  private isUpdatingSettings: number = 0;

  public isSet(): boolean {
    return this.isUpdatingSettings > 0;
  }

  public set() {
    this.isUpdatingSettings++;
  }

  public clear() {
    this.isUpdatingSettings--;
  }
}
