import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type HoneypotLog = Tables<'honeypot_logs'>;

export interface AttackStats {
  totalAttacks24h: number;
  blockedThreats: number;
  activeHoneypots: number;
  totalHoneypots: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TopAttacker {
  ip: string;
  attacks: number;
  lastSeen: string;
  threatScore: number;
}

export interface AttackTypeBreakdown {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface TimeSeriesData {
  time: string;
  attacks: number;
  blocked: number;
}

export interface HoneypotStatusData {
  name: string;
  type: string;
  status: 'online' | 'offline' | 'alert';
  attacks24h: number;
  lastActivity: string | null;
}

const ATTACK_TYPE_COLORS: Record<string, string> = {
  'SSH Brute Force': 'hsl(0, 85%, 55%)',
  'SQL Injection': 'hsl(35, 100%, 50%)',
  'Port Scan': 'hsl(170, 100%, 50%)',
  'XSS Attempt': 'hsl(280, 80%, 60%)',
  'Credential Stuffing': 'hsl(200, 80%, 50%)',
  'Directory Traversal': 'hsl(45, 90%, 50%)',
  'DDoS': 'hsl(320, 80%, 55%)',
  'Other': 'hsl(220, 15%, 40%)',
};

export function useHoneypotLogs() {
  const queryClient = useQueryClient();

  // Fetch recent logs (last 24 hours)
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['honeypot-logs'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('honeypot_logs')
        .select('*')
        .gte('timestamp', twentyFourHoursAgo)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as HoneypotLog[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('honeypot-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'honeypot_logs',
        },
        (payload) => {
          queryClient.setQueryData(['honeypot-logs'], (old: HoneypotLog[] = []) => {
            const newLog = payload.new as HoneypotLog;
            return [newLog, ...old.slice(0, 499)];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate statistics
  const stats: AttackStats = {
    totalAttacks24h: logs.length,
    blockedThreats: Math.floor(logs.length * 0.98), // Assume 98% blocked
    activeHoneypots: new Set(logs.map(l => l.honeypot_name)).size,
    totalHoneypots: 6,
    threatLevel: logs.length > 1000 ? 'CRITICAL' : logs.length > 500 ? 'HIGH' : logs.length > 100 ? 'MEDIUM' : 'LOW',
  };

  // Calculate top attackers
  const topAttackers: TopAttacker[] = (() => {
    const ipCounts: Record<string, { count: number; lastSeen: string }> = {};
    
    logs.forEach(log => {
      if (!ipCounts[log.source_ip]) {
        ipCounts[log.source_ip] = { count: 0, lastSeen: log.timestamp };
      }
      ipCounts[log.source_ip].count++;
      if (log.timestamp > ipCounts[log.source_ip].lastSeen) {
        ipCounts[log.source_ip].lastSeen = log.timestamp;
      }
    });

    return Object.entries(ipCounts)
      .map(([ip, data]) => ({
        ip,
        attacks: data.count,
        lastSeen: formatTimeAgo(new Date(data.lastSeen)),
        threatScore: Math.min(100, Math.floor(50 + (data.count / logs.length) * 100)),
      }))
      .sort((a, b) => b.attacks - a.attacks)
      .slice(0, 5);
  })();

  // Calculate attack type breakdown
  const attackTypeBreakdown: AttackTypeBreakdown[] = (() => {
    const typeCounts: Record<string, number> = {};
    
    logs.forEach(log => {
      const type = log.attack_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const total = logs.length || 1;
    return Object.entries(typeCounts)
      .map(([name, count]) => ({
        name,
        count,
        value: Math.round((count / total) * 100),
        color: ATTACK_TYPE_COLORS[name] || ATTACK_TYPE_COLORS['Other'],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  // Calculate time series data (hourly buckets)
  const timeSeriesData: TimeSeriesData[] = (() => {
    const buckets: Record<string, number> = {};
    const now = new Date();
    
    // Initialize 24 hourly buckets
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      buckets[key] = 0;
    }

    logs.forEach(log => {
      const logTime = new Date(log.timestamp);
      const key = logTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (buckets[key] !== undefined) {
        buckets[key]++;
      }
    });

    return Object.entries(buckets).map(([time, attacks]) => ({
      time: time.replace(':00', ':00'),
      attacks,
      blocked: Math.floor(attacks * 0.98),
    }));
  })();

  // Calculate honeypot status
  const honeypotStatus: HoneypotStatusData[] = (() => {
    const honeypotTypes: Record<string, string> = {
      'SSH-01': 'SSH Server',
      'WEB-01': 'Web Application',
      'WEB-02': 'Web Application',
      'NET-01': 'Network Scanner',
      'FTP-01': 'FTP Server',
      'SMTP-01': 'Mail Server',
    };

    const honeypotStats: Record<string, { attacks: number; lastActivity: string | null }> = {};
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Initialize all known honeypots
    Object.keys(honeypotTypes).forEach(name => {
      honeypotStats[name] = { attacks: 0, lastActivity: null };
    });

    logs.forEach(log => {
      if (!honeypotStats[log.honeypot_name]) {
        honeypotStats[log.honeypot_name] = { attacks: 0, lastActivity: null };
        honeypotTypes[log.honeypot_name] = log.honeypot_type;
      }
      honeypotStats[log.honeypot_name].attacks++;
      if (!honeypotStats[log.honeypot_name].lastActivity || 
          log.timestamp > honeypotStats[log.honeypot_name].lastActivity!) {
        honeypotStats[log.honeypot_name].lastActivity = log.timestamp;
      }
    });

    return Object.entries(honeypotStats).map(([name, data]) => {
      const lastActivityDate = data.lastActivity ? new Date(data.lastActivity) : null;
      let status: 'online' | 'offline' | 'alert' = 'offline';
      
      if (lastActivityDate) {
        if (lastActivityDate > oneHourAgo) {
          status = data.attacks > 100 ? 'alert' : 'online';
        }
      }

      return {
        name,
        type: honeypotTypes[name] || 'Unknown',
        status,
        attacks24h: data.attacks,
        lastActivity: data.lastActivity,
      };
    }).sort((a, b) => b.attacks24h - a.attacks24h);
  })();

  return {
    logs,
    isLoading,
    error,
    stats,
    topAttackers,
    attackTypeBreakdown,
    timeSeriesData,
    honeypotStatus,
  };
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
