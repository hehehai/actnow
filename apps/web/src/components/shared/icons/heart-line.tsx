import type { SVGProps } from "react";

export function HeartLineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Heart</title>
      <path
        d="M12 21.65q-.47 0-.86-.13c-3.82-1.31-9.89-5.96-9.89-12.83 0-3.5 2.83-6.34 6.31-6.34 1.69 0 3.27.66 4.44 1.84a6.2 6.2 0 0 1 4.44-1.84 6.34 6.34 0 0 1 6.31 6.34c0 6.88-6.07 11.52-9.89 12.83q-.39.13-.86.13M7.56 3.85a4.83 4.83 0 0 0-4.81 4.84c0 6.83 6.57 10.63 8.88 11.42.18.06.57.06.75 0 2.3-.79 8.88-4.58 8.88-11.42a4.83 4.83 0 0 0-4.81-4.84c-1.52 0-2.93.71-3.84 1.94-.28.38-.92.38-1.2 0a4.8 4.8 0 0 0-3.85-1.94"
        fill="currentColor"
      />
    </svg>
  );
}
