/**
 * Footer component with Cal.com sponsorship banner
 * Server component with CSS-based theme switching
 */
export function Footer() {
  const calBookingUrl = "https://cal.com/discuno";

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Main footer content in a single row on larger screens */}
          <div className="flex flex-col items-center space-y-3 md:flex-row md:justify-between md:space-y-0 md:w-full">

            {/* Copyright - left side on desktop */}
            <div className="text-center text-sm text-muted-foreground md:text-left">
              <p>© {new Date().getFullYear()} Discuno. Built with ❤️ for students.</p>
            </div>

            {/* Cal.com Sponsorship Banner - center */}
            <div className="flex flex-col items-center space-y-1">
              <p className="text-xs text-muted-foreground">Sponsored by</p>
              <a
                href={calBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
                aria-label="Book us with Cal.com"
              >
                {/* Light theme banner */}
                <img
                  alt="Book us with Cal.com"
                  src="https://cal.com/book-with-cal-light.svg"
                  className="h-6 w-auto dark:hidden"
                  loading="lazy"
                />
                {/* Dark theme banner */}
                <img
                  alt="Book us with Cal.com"
                  src="https://cal.com/book-with-cal-dark.svg"
                  className="hidden h-6 w-auto dark:block"
                  loading="lazy"
                />
              </a>
            </div>

            {/* Footer Links - right side on desktop */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground md:justify-end">
              <a href="/about" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a
                href="https://github.com/bradmcnew/discuno"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
