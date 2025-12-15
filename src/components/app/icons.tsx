import type { SVGProps } from 'react';

export const Icons = {
  spine: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 16c-2.2 0-4-1.8-4-4s1.8-4 4-4" />
      <path d="M20 8c2.2 0 4 1.8 4 4s-1.8 4-4 4" />
      <path d="M12 4v16" />
      <path d="M4 12h8" />
      <path d="M12 12h8" />
    </svg>
  ),
  shoulder: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 8.5a4 4 0 1 1-8 0" />
      <path d="M10 8.5V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8.5" />
      <path d="m14 11-4 1" />
      <path d="M10 14h4" />
    </svg>
  ),
  knee: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16.48,8.23,12,12.71,7.52,8.23" />
      <path d="M8,18.23V14.5" />
      <path d="M16,18.23V14.5" />
      <path d="M12.01,22l-4.2-6.02" />
      <path d="M12.01,22l4.2-6.02" />
      <path d="M12.01,6l-4.2,6.02" />
      <path d="M12.01,6l4.2,6.02" />
      <ellipse cx="12" cy="12" rx="2" ry="2" />
    </svg>
  ),
  foot: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M4 17v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
        <path d="M12 10V6" />
        <path d="M12 6L9 3" />
        <path d="M12 6l3 3" />
        <path d="M12 10l-2 7h4l-2-7z" />
        <path d="M6 14l-2 3h4" />
        <path d="M18 14l2 3h-4" />
    </svg>
  ),
  hand: (props: SVGProps<SVGSVGElement>) => (
     <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10" />
        <path d="M18 11a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2.5" />
        <path d="M4 14a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1.5" />
    </svg>
  ),
};

export type IconName = keyof typeof Icons;
