import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const trackIntent = async (method: string) => {
  try {
    await supabase.functions.invoke("track-donation-intent", {
      body: { method, page_path: "/donate" },
    });
  } catch {
    // non-blocking
  }
};

const openLink = (url: string, method: string) => {
  trackIntent(method);
  window.open(url, "_blank", "noopener");
};

export function OtherWaysToGive() {
  return (
    <div>
      <h2 className="text-2xl font-bold font-serif mb-2">Other ways to give</h2>
      <p className="text-muted-foreground mb-6">
        Use Venmo, Cash App, or PayPal. Choose what is easiest.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Venmo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Venmo</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">@BRIDGEGOOD</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => openLink("https://venmo.com/u/bridgegood", "venmo")}
            >
              Donate with Venmo
              <ExternalLink className="h-3 w-3" />
            </Button>
            <p className="text-xs text-muted-foreground">Opens Venmo in a new tab.</p>
          </CardContent>
        </Card>

        {/* Cash App */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cash App</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">$BRIDGEGOOD</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => openLink("https://cash.app/$BRIDGEGOOD", "cashapp")}
            >
              Donate with Cash App
              <ExternalLink className="h-3 w-3" />
            </Button>
            <p className="text-xs text-muted-foreground">Opens Cash App in a new tab.</p>
          </CardContent>
        </Card>

        {/* PayPal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">PayPal</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">donate@bridgegood.com</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() =>
                openLink(
                  "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=donate%40odalc.org&item_name=Formerly+Oakland+Digital,+BRIDGEGOOD+is+a+501%28c%29%283%29+nonprofit+organization+that+prepares+job+seekers+for+tech+%26+design+careers.&currency_code=USD&source=url",
                  "paypal_link"
                )
              }
            >
              Donate with PayPal
              <ExternalLink className="h-3 w-3" />
            </Button>
            <p className="text-xs text-muted-foreground">Opens PayPal in a new tab.</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={() =>
                openLink("https://www.paypal.com/us/fundraiser/charity/1369969", "paypal_fundraiser")
              }
            >
              PayPal fundraiser page
              <ExternalLink className="h-3 w-3" />
            </Button>
            <p className="text-xs text-muted-foreground">Opens the fundraiser in a new tab.</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        If you need help with a donation, email{" "}
        <a href="mailto:donate@bridgegood.com" className="text-primary hover:underline">
          donate@bridgegood.com
        </a>
        .
      </p>
    </div>
  );
}
