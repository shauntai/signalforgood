export function ContactBlock() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold font-serif mb-4">Contact</h2>
      <address className="not-italic text-muted-foreground space-y-1 text-sm mb-6">
        <p>95 Washington Street</p>
        <p>Oakland, CA 94607</p>
        <p>
          <a href="mailto:hello@bridgegood.com" className="text-primary hover:underline">
            hello@bridgegood.com
          </a>
        </p>
        <p>
          <a href="tel:+15104352945" className="text-primary hover:underline">
            (510) 435-2945
          </a>
        </p>
        <p className="text-primary font-medium">#DesignForSocialGood</p>
      </address>

      <p className="text-xs text-muted-foreground max-w-md mx-auto">
        &copy; 2026 BRIDGEGOOD. Oakland Digital Arts and Literacy Center Inc. is a 501(c)(3) nonprofit. 27-0720655. Donations are tax deductible supporting design equity.
      </p>
    </div>
  );
}
