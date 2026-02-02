import React from "react";

export const useIntersectionObserver = <T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  options: {
    rootMargin?: string;
    threshold?: number | number[];
    logicFn?: (entry: IntersectionObserverEntry) => boolean;
    getRoot?: () => Element | null;
  } = {
    threshold: 0,
  }
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const _root = options.getRoot ? options.getRoot() : null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(
            options?.logicFn ? options.logicFn(entry) : entry.isIntersecting
          );
        }
      },
      {
        ...options,
        root: _root,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const refCurrent = ref.current;

    return () => {
      if (refCurrent) {
        observer.unobserve(refCurrent);
      }
    };
  }, [options, ref]);

  return isIntersecting;
};
