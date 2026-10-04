import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
      <svg viewBox="0 0 24 24" className="size-6 text-primary" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.8 3.8L12 11.9 5.2 8.1 12 4.3ZM5 9.8l6 3.4v6.6l-6-3.4V9.8Zm8 10V13.2l6-3.4v6.6l-6 3.4Z"
        />
      </svg>
      <span>
        ShareYour<span className="text-primary">BO</span>
      </span>
    </Link>
  )
}
