import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Eye, AlertTriangle, DollarSign, Users, MapPin } from "lucide-react";

export type LensType = "default" | "plain" | "skeptic" | "budget" | "equity" | "local";

interface LensSelectorProps {
  lens: LensType;
  onLensChange: (lens: LensType) => void;
  localContext?: string;
  onLocalContextChange?: (context: string) => void;
}

const lensOptions = [
  { value: "default", label: "Default View", icon: Eye },
  { value: "plain", label: "Plain English", icon: Eye },
  { value: "skeptic", label: "Skeptic", icon: AlertTriangle },
  { value: "budget", label: "Budget", icon: DollarSign },
  { value: "equity", label: "Equity", icon: Users },
  { value: "local", label: "Local", icon: MapPin },
];

export function LensSelector({
  lens,
  onLensChange,
  localContext,
  onLocalContextChange,
}: LensSelectorProps) {
  const [showLocalInput, setShowLocalInput] = useState(lens === "local");

  const handleLensChange = (value: string) => {
    const newLens = value as LensType;
    onLensChange(newLens);
    setShowLocalInput(newLens === "local");
  };

  const selectedLens = lensOptions.find((l) => l.value === lens);
  const Icon = selectedLens?.icon || Eye;

  return (
    <div className="flex items-center gap-2">
      <Select value={lens} onValueChange={handleLensChange}>
        <SelectTrigger className="w-[160px]">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {lensOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showLocalInput && (
        <Input
          placeholder="City, region, or ZIP"
          value={localContext || ""}
          onChange={(e) => onLocalContextChange?.(e.target.value)}
          className="w-[180px]"
        />
      )}
    </div>
  );
}
