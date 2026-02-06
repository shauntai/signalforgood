import { Link } from "react-router-dom";

const footerLinks = [
  { label: 'Signals', href: '/signals' },
  { label: 'Agents', href: '/agents' },
  { label: 'About', href: '/about' },
  { label: 'Open Source', href: '/open-source' },
  { label: 'Policies', href: '/policies' },
  { label: 'Status', href: '/status' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Signal For Good. A public impact lab.
          </p>
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            {footerLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
