import { Globe, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attacker {
  ip: string;
  country: string;
  attacks: number;
  lastSeen: string;
  threatScore: number;
  blocked: boolean;
}

const attackers: Attacker[] = [
  { ip: "185.220.101.34", country: "Russia", attacks: 4521, lastSeen: "2 min ago", threatScore: 95, blocked: true },
  { ip: "45.155.205.233", country: "Netherlands", attacks: 3892, lastSeen: "5 min ago", threatScore: 88, blocked: true },
  { ip: "194.26.29.113", country: "Ukraine", attacks: 2847, lastSeen: "12 min ago", threatScore: 76, blocked: false },
  { ip: "91.240.118.172", country: "Russia", attacks: 2156, lastSeen: "18 min ago", threatScore: 82, blocked: true },
  { ip: "23.129.64.130", country: "United States", attacks: 1923, lastSeen: "25 min ago", threatScore: 71, blocked: true },
];

const getThreatColor = (score: number) => {
  if (score >= 90) return "text-destructive";
  if (score >= 70) return "text-warning";
  return "text-muted-foreground";
};

const getThreatBarColor = (score: number) => {
  if (score >= 90) return "bg-destructive";
  if (score >= 70) return "bg-warning";
  return "bg-muted";
};

export function TopAttackers() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold">Top Attacking IPs</h3>
        <button className="text-xs text-primary hover:text-primary/80 transition-colors">
          View All →
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {attackers.map((attacker, index) => (
          <div
            key={attacker.ip}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-sm font-bold text-muted-foreground">
              {index + 1}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{attacker.ip}</span>
                {attacker.blocked && (
                  <Ban className="h-3.5 w-3.5 text-destructive" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>{attacker.country}</span>
                <span>•</span>
                <span>{attacker.lastSeen}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-mono text-sm font-semibold">
                {attacker.attacks.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">attacks</p>
            </div>
            
            <div className="w-20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Threat</span>
                <span className={cn("font-mono font-bold", getThreatColor(attacker.threatScore))}>
                  {attacker.threatScore}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all", getThreatBarColor(attacker.threatScore))}
                  style={{ width: `${attacker.threatScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
