import { useEffect, useState } from "react";
import { Shield, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attack {
  id: string;
  timestamp: Date;
  ip: string;
  country: string;
  attackType: string;
  severity: "low" | "medium" | "high" | "critical";
  honeypot: string;
  blocked: boolean;
}

const severityStyles = {
  low: "text-muted-foreground border-muted",
  medium: "text-warning border-warning/50",
  high: "text-destructive border-destructive/50",
  critical: "text-destructive border-destructive animate-threat-pulse",
};

const severityBadgeStyles = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/20 text-warning",
  high: "bg-destructive/20 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

const mockAttacks: Attack[] = [
  { id: "1", timestamp: new Date(), ip: "185.220.101.34", country: "RU", attackType: "SSH Brute Force", severity: "high", honeypot: "SSH-01", blocked: true },
  { id: "2", timestamp: new Date(Date.now() - 15000), ip: "45.155.205.233", country: "NL", attackType: "SQL Injection", severity: "critical", honeypot: "WEB-02", blocked: true },
  { id: "3", timestamp: new Date(Date.now() - 45000), ip: "194.26.29.113", country: "UA", attackType: "Port Scan", severity: "low", honeypot: "NET-01", blocked: false },
  { id: "4", timestamp: new Date(Date.now() - 120000), ip: "91.240.118.172", country: "RU", attackType: "Credential Stuffing", severity: "medium", honeypot: "SSH-01", blocked: true },
  { id: "5", timestamp: new Date(Date.now() - 180000), ip: "23.129.64.130", country: "US", attackType: "Directory Traversal", severity: "high", honeypot: "WEB-01", blocked: true },
  { id: "6", timestamp: new Date(Date.now() - 240000), ip: "89.248.167.131", country: "NL", attackType: "XSS Attempt", severity: "medium", honeypot: "WEB-02", blocked: true },
];

export function AttackFeed() {
  const [attacks, setAttacks] = useState<Attack[]>(mockAttacks);

  // Simulate new attacks coming in
  useEffect(() => {
    const interval = setInterval(() => {
      const newAttack: Attack = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: ["RU", "CN", "US", "NL", "UA", "BR", "KR"][Math.floor(Math.random() * 7)],
        attackType: ["SSH Brute Force", "SQL Injection", "Port Scan", "XSS Attempt", "DDoS", "Credential Stuffing"][Math.floor(Math.random() * 6)],
        severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as Attack["severity"],
        honeypot: ["SSH-01", "WEB-01", "WEB-02", "NET-01", "FTP-01"][Math.floor(Math.random() * 5)],
        blocked: Math.random() > 0.2,
      };
      setAttacks(prev => [newAttack, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <h3 className="font-semibold">Live Attack Feed</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {attacks.length} events
        </span>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {attacks.map((attack, index) => (
          <div
            key={attack.id}
            className={cn(
              "flex items-center gap-4 border-b border-border/50 p-4 transition-colors hover:bg-secondary/50",
              index === 0 && "animate-slide-in bg-secondary/30",
              severityStyles[attack.severity]
            )}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              attack.blocked ? "bg-success/20" : "bg-destructive/20"
            )}>
              {attack.blocked ? (
                <Shield className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{attack.ip}</span>
                <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
                  {attack.country}
                </span>
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-xs font-medium",
                  severityBadgeStyles[attack.severity]
                )}>
                  {attack.severity.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {attack.attackType} → <span className="text-primary">{attack.honeypot}</span>
              </p>
            </div>
            
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {formatTime(attack.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
