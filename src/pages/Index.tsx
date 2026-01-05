import { Shield, AlertTriangle, Server, Activity } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttackFeed } from "@/components/dashboard/AttackFeed";
import { HoneypotStatus } from "@/components/dashboard/HoneypotStatus";
import { AttackChart } from "@/components/dashboard/AttackChart";
import { TopAttackers } from "@/components/dashboard/TopAttackers";
import { ThreatMap } from "@/components/dashboard/ThreatMap";

const Index = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      
      <main className="container mx-auto px-4 py-6 lg:px-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Attacks (24h)"
            value="38,429"
            icon={AlertTriangle}
            variant="threat"
            trend={{ value: 12.5, isPositive: false }}
          />
          <MetricCard
            title="Blocked Threats"
            value="37,892"
            icon={Shield}
            variant="success"
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title="Active Honeypots"
            value="5/6"
            icon={Server}
            variant="default"
          />
          <MetricCard
            title="Threat Level"
            value="HIGH"
            icon={Activity}
            variant="warning"
          />
        </div>

        {/* Charts Section */}
        <div className="mt-6">
          <AttackChart />
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AttackFeed />
          <div className="space-y-6">
            <TopAttackers />
            <ThreatMap />
          </div>
        </div>

        {/* Honeypot Status */}
        <div className="mt-6">
          <HoneypotStatus />
        </div>
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
