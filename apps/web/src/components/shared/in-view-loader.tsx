import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface InViewLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  rootId?: string;
  loadFn: () => unknown | Promise<unknown>;
  loadCondition: boolean;
  loadTimeout?: number;
  margin?: string;
}

export default function InViewLoader({
  rootId,
  children,
  loadFn,
  loadCondition,
  loadTimeout = 500,
  margin = "1000px 0px",
  ...props
}: InViewLoaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, {
    rootMargin: margin,
    getRoot: () => (rootId ? document?.getElementById(rootId) : null),
  });
  const [initialCanLoad, setInitialCanLoad] = useState(false);
  const [canLoad, setCanLoad] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setInitialCanLoad(true);
    }, 1500);
  }, []);

  useEffect(() => {
    if (isIntersecting && loadCondition && initialCanLoad && canLoad) {
      const handleLoad = async () => {
        try {
          await loadFn();
        } catch (error) {
          console.error("InViewLoader: Error loading data", error);
        } finally {
          setTimeout(() => setCanLoad(true), loadTimeout);
        }
      };

      setCanLoad(false);
      handleLoad();
    }
  }, [
    isIntersecting,
    loadCondition,
    initialCanLoad,
    canLoad,
    loadFn,
    loadTimeout,
  ]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
