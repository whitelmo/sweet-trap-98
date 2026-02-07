import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, Server, Activity } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttackFeed } from "@/components/dashboard/AttackFeed";
import { HoneypotStatus } from "@/components/dashboard/HoneypotStatus";
import { AttackChart } from "@/components/dashboard/AttackChart";
import { TopAttackers } from "@/components/dashboard/TopAttackers";
import { useAuth } from "@/hooks/useAuth";
import { useHoneypotLogs } from "@/hooks/useHoneypotLogs";

const Index = () => {
  const { user, loading, hasRole } = useAuth();
  const { stats } = useHoneypotLogs();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      
      <main className="container mx-auto px-4 py-6 lg:px-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Attacks (24h)"
            value={stats.totalAttacks24h.toLocaleString()}
            icon={AlertTriangle}
            variant="threat"
            trend={stats.totalAttacks24h > 0 ? { value: 12.5, isPositive: false } : undefined}
          />
          <MetricCard
            title="Blocked Threats"
            value={stats.blockedThreats.toLocaleString()}
            icon={Shield}
            variant="success"
            trend={stats.blockedThreats > 0 ? { value: 8.2, isPositive: true } : undefined}
          />
          <MetricCard
            title="Active Honeypots"
            value={`${stats.activeHoneypots}/${stats.totalHoneypots}`}
            icon={Server}
            variant="default"
          />
          <MetricCard
            title="Threat Level"
            value={stats.threatLevel}
            icon={Activity}
            variant={stats.threatLevel === 'CRITICAL' ? 'threat' : stats.threatLevel === 'HIGH' ? 'warning' : 'default'}
          />
        </div>

        {/* Charts Section */}
        <div className="mt-6">
          <AttackChart />
        </div>

        {/* Main Content Grid - Analysts and Admins only */}
        {hasRole('analyst') && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <AttackFeed />
            <TopAttackers />
          </div>
        )}

        {/* Viewer notice for limited access */}
        {!hasRole('analyst') && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <div>
                <p className="font-medium text-foreground">Limited Access</p>
                <p className="text-sm">Contact an administrator to upgrade your role for full dashboard access including live attack feeds and detailed threat analysis.</p>
              </div>
            </div>
          </div>
        )}

        {/* Honeypot Status - Analysts and Admins only */}
        {hasRole('analyst') && (
          <div className="mt-6">
            <HoneypotStatus />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border py-6">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2024 HoneyTrap Security. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span>Last sync: Just now</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
