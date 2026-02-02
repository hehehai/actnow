import type { SVGProps } from "react";

export function AppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>App</title>
      <g clipPath="url(#a)">
        <path
          d="M12 22.75a4.3 4.3 0 0 1-3.08-1.27l-6.39-6.4a4.33 4.33 0 0 1 0-6.15l6.39-6.4a4.33 4.33 0 0 1 6.16 0l6.39 6.4a4.33 4.33 0 0 1 0 6.16l-6.39 6.39A4.3 4.3 0 0 1 12 22.75m0-20c-.77 0-1.49.3-2.02.83L3.59 9.97a2.86 2.86 0 0 0 0 4.04l6.39 6.39a2.94 2.94 0 0 0 4.04 0l6.39-6.4c.54-.54.83-1.25.83-2.02s-.3-1.5-.83-2.02l-6.39-6.39A2.8 2.8 0 0 0 12 2.75"
          fill="currentColor"
        />
        <path
          d="M17.75 18.5a.7.7 0 0 1-.53-.22L5.72 6.78a.75.75 0 0 1 0-1.06.75.75 0 0 1 1.06 0l11.5 11.5c.29.29.29.77 0 1.06a.7.7 0 0 1-.53.22"
          fill="currentColor"
        />
        <path
          d="M6.25 18.5a.7.7 0 0 1-.53-.22.75.75 0 0 1 0-1.06l11.5-11.5a.75.75 0 0 1 1.06 0c.29.29.29.77 0 1.06l-11.5 11.5a.7.7 0 0 1-.53.22"
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
