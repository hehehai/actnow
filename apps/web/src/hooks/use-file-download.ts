import { useCallback } from "react";

interface FileDownloadOptions {
  url: string;
  filename: string;
}

export function useFileDownload() {
  const download = useCallback(
    async ({ url, filename }: FileDownloadOptions) => {
      if (typeof document === "undefined") return;
      if (!url) return;

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      } catch {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    },
    []
  );

  return { download };
}
