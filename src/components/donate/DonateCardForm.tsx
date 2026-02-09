import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  amountCents: number | null;
}

export function DonateCardForm({ amountCents }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!amountCents || amountCents < 500) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-donation-checkout",
        {
          body: {
            amount_cents: amountCents,
            donor_email: email || undefined,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.session_url) {
        window.location.href = data.session_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      setError("We could not start checkout right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-serif mb-2">Donate by card</h2>
      <p className="text-muted-foreground mb-4">
        Use a secure checkout to donate by credit or debit card. You will receive a receipt by email.
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <Label htmlFor="donor-email">Email for receipt (optional)</Label>
          <Input
            id="donor-email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full gap-2"
        disabled={!amountCents || amountCents < 500 || loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Continue to secure checkout
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        We do not store card details on this site.
      </p>
    </div>
  );
}
