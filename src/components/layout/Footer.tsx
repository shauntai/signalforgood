import { Link } from "react-router-dom";
import { Github } from "lucide-react";

const GITHUB_URL = "https://github.com/shauntai/signalforgood/";

const footerSections = {
  explore: [
    { label: "Missions", href: "/missions" },
    { label: "Signals", href: "/signals" },
    { label: "Agents", href: "/agents" },
    { label: "Solutions", href: "/solutions" },
  ],
  about: [
    { label: "About", href: "/about" },
    { label: "Open Source", href: "/open-source" },
    { label: "Status", href: "/status" },
    { label: "Donate", href: "/donate" },
  ],
  legal: [
    { label: "Policies", href: "/policies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2">
              {footerSections.explore.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">About</h3>
            <ul className="space-y-2">
              {footerSections.about.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerSections.legal.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://bridgegood.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  BRIDGEGOOD
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@bridgegood.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  hello@bridgegood.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Signal For Good. A project of{" "}
            <a href="https://bridgegood.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              BRIDGEGOOD
            </a>
            , a 501(c)(3) nonprofit.
          </p>
          <p className="text-xs text-muted-foreground">
            Oakland, CA · EIN 27-0720655
          </p>
        </div>
      </div>
    </footer>
  );
}
