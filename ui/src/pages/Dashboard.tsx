import { useState, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, Lock, Unlock, Clock, Users, TrendingUp, 
  Calendar, Shield, Activity, BarChart3, PieChart
} from 'lucide-react';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { getEncryptedDiaryContract } from '@/lib/contract';
import { BrowserProvider } from 'ethers';
import Navigation from '@/components/Navigation';
import PageTransition from '@/components/PageTransition';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface DiaryStats {
  totalEntries: number;
  userEntries: number;
  lockedEntries: number;
  unlockedEntries: number;
  publicEntries: number;
  privateEntries: number;
  neverUnlockEntries: number;
  entriesByDate: Array<{ date: string; count: number }>;
  unlockTimeline: Array<{ date: string; count: number }>;
}

const CHART_COLORS = ['#00d4d4', '#9333ea', '#f59e0b', '#10b981', '#ef4444'];

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  const [stats, setStats] = useState<DiaryStats>({
    totalEntries: 0,
    userEntries: 0,
    lockedEntries: 0,
    unlockedEntries: 0,
    publicEntries: 0,
    privateEntries: 0,
    neverUnlockEntries: 0,
    entriesByDate: [],
    unlockTimeline: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && publicClient) {
      loadStats();
    }
  }, [isConnected, address, chainId, publicClient]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const provider = new BrowserProvider(publicClient.transport as any);
      const contract = getEncryptedDiaryContract(provider, chainId);

      // Get total entry count from contract
      const totalCount = await contract.getEntryCount();
      const total = Number(totalCount);

      // Get user's entry count
      let userCount = 0;
      if (address) {
        const userEntryCount = await contract.getUserEntryCount(address);
        userCount = Number(userEntryCount);
      }

      // Initialize counters
      let locked = 0;
      let unlocked = 0;
      let publicCount = 0;
      let privateCount = 0;
      let neverUnlock = 0;
      
      const entriesByDateMap: Record<string, number> = {};
      const unlockTimelineMap: Record<string, number> = {};
      const now = Math.floor(Date.now() / 1000);

      // Fetch metadata for all entries (limited to recent entries for performance)
      const maxEntriesToFetch = Math.min(total, 100);
      
      for (let i = 0; i < maxEntriesToFetch; i++) {
        try {
          const [author, createdAt, unlockTimestamp, isPublic] = await contract.getEntryMetadata(i);
          
          const createdDate = new Date(Number(createdAt) * 1000);
          const dateKey = format(createdDate, 'yyyy-MM-dd');
          entriesByDateMap[dateKey] = (entriesByDateMap[dateKey] || 0) + 1;

          const unlockTs = Number(unlockTimestamp);
          
          if (unlockTs === 0) {
            neverUnlock++;
            locked++;
          } else if (now >= unlockTs) {
            unlocked++;
          } else {
            locked++;
            const unlockDate = new Date(unlockTs * 1000);
            const unlockDateKey = format(unlockDate, 'yyyy-MM-dd');
            unlockTimelineMap[unlockDateKey] = (unlockTimelineMap[unlockDateKey] || 0) + 1;
          }

          if (isPublic) {
            publicCount++;
          } else {
            privateCount++;
          }
        } catch (err) {
          console.warn(`Failed to fetch entry ${i}:`, err);
        }
      }

      // Convert maps to sorted arrays
      const entriesByDate = Object.entries(entriesByDateMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14); // Last 14 days

      const unlockTimeline = Object.entries(unlockTimelineMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 14); // Next 14 days

      setStats({
        totalEntries: total,
        userEntries: userCount,
        lockedEntries: locked,
        unlockedEntries: unlocked,
        publicEntries: publicCount,
        privateEntries: privateCount,
        neverUnlockEntries: neverUnlock,
        entriesByDate,
        unlockTimeline,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Locked', value: stats.lockedEntries, color: CHART_COLORS[0] },
    { name: 'Unlocked', value: stats.unlockedEntries, color: CHART_COLORS[1] },
  ];

  const privacyData = [
    { name: 'Public', value: stats.publicEntries, color: CHART_COLORS[2] },
    { name: 'Private', value: stats.privateEntries, color: CHART_COLORS[3] },
    { name: 'Never Unlock', value: stats.neverUnlockEntries, color: CHART_COLORS[4] },
  ];

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    color = 'primary' 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    description?: string;
    color?: 'primary' | 'accent' | 'success' | 'warning';
  }) => {
    const colorClasses = {
      primary: 'text-primary bg-primary/10',
      accent: 'text-accent bg-accent/10',
      success: 'text-green-500 bg-green-500/10',
      warning: 'text-amber-500 bg-amber-500/10',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (!isConnected) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
          <Navigation />
          <main className="flex-1 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-7xl">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Connect Wallet to View Dashboard
                  </CardTitle>
                  <CardDescription>
                    Please connect your wallet to view analytics and statistics.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <main className="flex-1 pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Activity className="w-10 h-10 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Real-time statistics from the Encrypted Diary smart contract
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Shield className="w-12 h-12 text-primary" />
                </motion.div>
                <span className="ml-4 text-lg">Loading contract data...</span>
              </div>
            ) : error ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Entries"
                    value={stats.totalEntries}
                    icon={BookOpen}
                    description="All diary entries on-chain"
                    color="primary"
                  />
                  <StatCard
                    title="Your Entries"
                    value={stats.userEntries}
                    icon={Users}
                    description="Entries you created"
                    color="accent"
                  />
                  <StatCard
                    title="Locked Entries"
                    value={stats.lockedEntries}
                    icon={Lock}
                    description="Waiting to be unlocked"
                    color="warning"
                  />
                  <StatCard
                    title="Unlocked Entries"
                    value={stats.unlockedEntries}
                    icon={Unlock}
                    description="Ready for decryption"
                    color="success"
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Entry Creation Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Entry Creation Timeline
                        </CardTitle>
                        <CardDescription>
                          Diary entries created over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.entriesByDate}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                dataKey="date" 
                                stroke="hsl(var(--muted-foreground))"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                              />
                              <YAxis stroke="hsl(var(--muted-foreground))" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--primary))' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Unlock Schedule */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-accent" />
                          Upcoming Unlocks
                        </CardTitle>
                        <CardDescription>
                          Entries scheduled to unlock
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.unlockTimeline}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis 
                                dataKey="date" 
                                stroke="hsl(var(--muted-foreground))"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                              />
                              <YAxis stroke="hsl(var(--muted-foreground))" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Pie Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lock Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-primary" />
                          Lock Status Distribution
                        </CardTitle>
                        <CardDescription>
                          Locked vs Unlocked entries
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Privacy Settings Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-accent" />
                          Privacy Settings
                        </CardTitle>
                        <CardDescription>
                          Entry visibility distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={privacyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {privacyData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
