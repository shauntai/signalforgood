import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESETS = [
  { cents: 5000, label: "$50", desc: "funds BRIDGEGOOD Open Labs" },
  { cents: 25000, label: "$250", desc: "funds Inspire Oakland Billboards" },
  { cents: 50000, label: "$500", desc: "funds Design Student Stipends" },
  { cents: 100000, label: "$1,000", desc: "funds Apprenticeship Scholarships" },
];

interface Props {
  value: number | null;
  onChange: (cents: number | null) => void;
}

export function DonateAmountPicker({ value, onChange }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handlePreset = (cents: number) => {
    setCustomMode(false);
    setCustomInput("");
    onChange(cents);
  };

  const handleCustom = () => {
    setCustomMode(true);
    onChange(null);
  };

  const handleCustomChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setCustomInput(cleaned);
    const dollars = parseFloat(cleaned);
    if (!isNaN(dollars) && dollars >= 5) {
      onChange(Math.round(dollars * 100));
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-serif mb-4">Choose an amount</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {PRESETS.map((p) => (
          <Button
            key={p.cents}
            variant={!customMode && value === p.cents ? "default" : "outline"}
            className="h-auto py-3 flex flex-col items-center gap-1"
            onClick={() => handlePreset(p.cents)}
          >
            <span className="text-lg font-bold">{p.label}</span>
            <span className="text-xs font-normal opacity-70">{p.desc}</span>
          </Button>
        ))}
      </div>

      <Button
        variant={customMode ? "default" : "outline"}
        className="w-full mb-3"
        onClick={handleCustom}
      >
        Other amount
      </Button>

      {customMode && (
        <div className="space-y-2">
          <Label htmlFor="custom-amount">Enter any amount. Minimum $5.</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="custom-amount"
              type="text"
              inputMode="decimal"
              placeholder="25.00"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        100% of your donation supports community benefit programs. Processing fees may apply depending on the payment method.
      </p>
    </div>
  );
}
