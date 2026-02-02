import type { SVGProps } from "react";

export function HeartFillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Heart</title>
      <g clipPath="url(#a)">
        <path
          d="M16.44 3.1c-1.81 0-3.43.88-4.44 2.23A5.55 5.55 0 0 0 2 8.69q.01 1.78.52 3.31c1.58 5 6.45 7.99 8.86 8.81.34.12.9.12 1.24 0 2.41-.82 7.28-3.81 8.86-8.81q.5-1.53.52-3.31a5.57 5.57 0 0 0-5.56-5.59"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="a">
          <rect height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
}
