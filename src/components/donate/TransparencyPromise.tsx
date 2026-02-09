import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const bullets = [
  "We publish citations and evidence coverage on debates and playbooks.",
  "We label what is evidence, precedent, assumption, and speculation.",
  "We show system health and update timing on the Status page.",
  "We keep the code open source and welcome review.",
];

export function TransparencyPromise() {
  return (
    <div>
      <h2 className="text-2xl font-bold font-serif mb-2">Our transparency promise</h2>
      <p className="text-muted-foreground mb-4">
        We want people to trust what they see here. That means showing the work and making it easy to follow.
      </p>
      <ul className="space-y-3 mb-6">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground text-sm">{b}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link to="/about" className="text-primary hover:underline">See how it works</Link>
        <Link to="/status" className="text-primary hover:underline">View Status</Link>
        <Link to="/open-source" className="text-primary hover:underline">Open Source</Link>
      </div>
    </div>
  );
}
