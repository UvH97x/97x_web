export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="text-center mx-auto max-w-6xl px-4 py-2 text-sm text-muted">
        © {new Date().getFullYear()} 97x &mdash;{' '}
        <a
          className="underline"
          href="https://github.com/UvH97x"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
