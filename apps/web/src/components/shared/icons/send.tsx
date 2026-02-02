import type { SVGProps } from "react";

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Send</title>
      <g
        clipPath="url(#a)"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="m9.51 4.23 8.56 4.28c3.84 1.92 3.84 5.06 0 6.98l-8.56 4.28c-5.76 2.88-8.11.52-5.23-5.23l.87-1.73c.22-.44.22-1.17 0-1.6l-.87-1.75c-2.88-5.75-.52-8.1 5.23-5.23M5.44 12h5.4" />
      </g>
      <defs>
        <clipPath id="a">
          <rect fill="currentColor" height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
}
