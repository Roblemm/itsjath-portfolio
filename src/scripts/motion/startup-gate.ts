export interface StartupGate {
  claim: () => boolean;
  reset: () => void;
}

export function createStartupGate(): StartupGate {
  let claimed = false;

  return {
    claim() {
      if (claimed) return false;
      claimed = true;
      return true;
    },
    reset() {
      claimed = false;
    },
  };
}
