import { useCallback, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useCopy() {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const [error, setError] = useState<Error | null>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      const clipboardError = new Error("Clipboard not supported");
      setError(clipboardError);
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setError(null);
      return true;
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Copy failed");
      setCopiedText(null);
      setError(nextError);
      return false;
    }
  }, []);

  return { copiedText, copy, error };
}
