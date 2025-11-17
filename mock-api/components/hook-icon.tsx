export function HookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M13 4C13 4 15 6 15 9C15 12 13 15 10 15C9 15 8 14.5 8 13.5"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="5" r="1.5" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  )
}