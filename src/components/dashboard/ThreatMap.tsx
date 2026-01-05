import { MapPin } from "lucide-react";

interface ThreatLocation {
  country: string;
  code: string;
  attacks: number;
  percentage: number;
}

const threatLocations: ThreatLocation[] = [
  { country: "Russia", code: "RU", attacks: 12453, percentage: 32 },
  { country: "China", code: "CN", attacks: 8921, percentage: 23 },
  { country: "United States", code: "US", attacks: 5672, percentage: 15 },
  { country: "Netherlands", code: "NL", attacks: 4231, percentage: 11 },
  { country: "Ukraine", code: "UA", attacks: 2845, percentage: 7 },
  { country: "Brazil", code: "BR", attacks: 2156, percentage: 6 },
  { country: "South Korea", code: "KR", attacks: 1423, percentage: 4 },
  { country: "Other", code: "XX", attacks: 892, percentage: 2 },
];

export function ThreatMap() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Geographic Distribution</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {threatLocations.map((location) => (
            <div key={location.code} className="group">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-7 rounded bg-secondary px-1.5 py-0.5 text-center text-xs font-medium text-muted-foreground">
                    {location.code}
                  </span>
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {location.country}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {location.attacks.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs font-semibold w-8 text-right">
                    {location.percentage}%
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-destructive transition-all duration-500 group-hover:opacity-80"
                  style={{ width: `${location.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
