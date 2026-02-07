import { Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHoneypotLogs, HoneypotLog } from "@/hooks/useHoneypotLogs";

type Severity = "low" | "medium" | "high" | "critical";

const severityStyles: Record<Severity, string> = {
  low: "text-muted-foreground border-muted",
  medium: "text-warning border-warning/50",
  high: "text-destructive border-destructive/50",
  critical: "text-destructive border-destructive animate-threat-pulse",
};

const severityBadgeStyles: Record<Severity, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/20 text-warning",
  high: "bg-destructive/20 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

// Determine severity based on attack type
function getSeverity(attackType: string | null): Severity {
  if (!attackType) return 'low';
  const type = attackType.toLowerCase();
  
  if (type.includes('sql injection') || type.includes('ddos') || type.includes('rce')) {
    return 'critical';
  }
  if (type.includes('brute force') || type.includes('xss') || type.includes('directory')) {
    return 'high';
  }
  if (type.includes('credential') || type.includes('stuffing')) {
    return 'medium';
  }
  return 'low';
}

// Get country code from IP (simplified - in production use a GeoIP service)
function getCountryFromMetadata(metadata: any): string {
  if (metadata?.country) return metadata.country;
  return '??';
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", { hour12: false });
}

export function AttackFeed() {
  const { logs, isLoading } = useHoneypotLogs();

  // Get the most recent 10 logs
  const recentLogs = logs.slice(0, 10);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
            <h3 className="font-semibold">Live Attack Feed</h3>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          Loading attack data...
        </div>
      </div>
    );
  }

  if (recentLogs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <h3 className="font-semibold">Live Attack Feed</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            0 events
          </span>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No attacks detected in the last 24 hours</p>
          <p className="text-xs mt-1">Honeypots are monitoring for threats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <h3 className="font-semibold">Live Attack Feed</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {logs.length} events
        </span>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {recentLogs.map((log, index) => {
          const severity = getSeverity(log.attack_type);
          const country = getCountryFromMetadata(log.metadata);
          const blocked = true; // Honeypots capture but don't actually block

          return (
            <div
              key={log.id}
              className={cn(
                "flex items-center gap-4 border-b border-border/50 p-4 transition-colors hover:bg-secondary/50",
                index === 0 && "animate-slide-in bg-secondary/30",
                severityStyles[severity]
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                blocked ? "bg-success/20" : "bg-destructive/20"
              )}>
                {blocked ? (
                  <Shield className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{log.source_ip}</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
                    {country}
                  </span>
                  <span className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-medium",
                    severityBadgeStyles[severity]
                  )}>
                    {severity.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {log.attack_type || 'Unknown Attack'} → <span className="text-primary">{log.honeypot_name}</span>
                </p>
              </div>
              
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {formatTime(log.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
