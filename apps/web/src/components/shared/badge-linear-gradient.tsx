import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useAnimate } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface BadgeLinearGradientProps extends useRender.ComponentProps<"div"> {}

function BadgeLinearGradient({
  render,
  className,
  children,
  ...otherProps
}: BadgeLinearGradientProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (!scope.current) return;

    const width = scope.current.offsetWidth;
    const xLeft = "13px";
    const xRight = `${width - 13}px`;

    const controls = animate(
      scope.current,
      {
        "--angle": ["-80deg", "-80deg", "100deg", "100deg", "280deg"],
        "--x": [xLeft, xRight, xRight, xLeft, xLeft],
        "--y": ["13px", "13px", "15px", "15px", "13px"],
      } as Record<string, string[]>,
      {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
        times: [0, 0.25, 0.375, 0.725, 1],
      }
    );

    return () => controls.stop();
  }, [animate, scope]);

  const defaultProps: useRender.ElementProps<"div"> = {
    className: cn(
      "relative inline-flex rounded-full border border-weak-stroke transition-colors duration-300 ease-in-out active:border-subtle-stroke",
      className
    ),
    children: (
      <>
        {/* Gradient border layer - acts as the border */}
        <div className="absolute -inset-px">
          <div
            className="h-full w-full rounded-full bg-[conic-gradient(from_var(--angle)_at_var(--x)_var(--y),#A3ECE900,#A3ECE9_20deg,#709FF5_100deg,#709FF5_120deg,#0000_83deg)]"
            ref={scope}
            style={
              {
                "--angle": "-80deg",
                "--x": "13px",
                "--y": "13px",
              } as React.CSSProperties
            }
          />
        </div>
        {/* Content layer - slightly inset to reveal gradient border */}
        <div className="relative flex items-center gap-x-1 rounded-full bg-white px-2.5 py-1.25 font-medium text-[13px]/[18px] text-secondary-foreground transition-colors duration-300 ease-in-out hover:bg-[#FBFBFC] dark:bg-background dark:hover:bg-accent">
          {children}
        </div>
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, otherProps),
  });
}

export { BadgeLinearGradient };
