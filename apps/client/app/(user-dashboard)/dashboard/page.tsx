"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CircleAlert,
  Clock3,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { openSans } from "@/fonts";
import { useCurrentUser } from "@/features/users/hooks/use-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const stats = [
  {
    label: "Portfolio Return",
    value: "+12.4%",
    trend: "This month",
    icon: TrendingUp,
    positive: true,
  },
  {
    label: "Win Rate",
    value: "68%",
    trend: "Last 20 trades",
    icon: ShieldCheck,
    positive: true,
  },
  {
    label: "Risk Exposure",
    value: "Moderate",
    trend: "2 active positions",
    icon: Activity,
    positive: true,
  },
  {
    label: "Avg Drawdown",
    value: "-3.1%",
    trend: "Within target",
    icon: TrendingDown,
    positive: true,
  },
];

const watchlist = [
  { symbol: "NIFTY", price: "22,384.25", change: "+0.64%", positive: true },
  { symbol: "BANKNIFTY", price: "47,109.80", change: "+0.31%", positive: true },
  { symbol: "RELIANCE", price: "2,918.45", change: "-0.22%", positive: false },
  { symbol: "HDFCBANK", price: "1,592.70", change: "+0.52%", positive: true },
  { symbol: "TCS", price: "3,881.30", change: "-0.17%", positive: false },
];

const roadmap = [
  { title: "Options Greeks Deep Dive", progress: 75, eta: "18 min" },
  { title: "Expiry Day Playbook", progress: 45, eta: "34 min" },
  { title: "Risk to Reward Drills", progress: 20, eta: "42 min" },
];

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Skeleton className="h-30 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: user, isInitialLoading, isError, refetch, isRefetching } =
    useCurrentUser();

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = user?.name?.split(" ")[0] ?? "Trader";
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div
      className={`${openSans.className} relative min-h-[calc(100svh-var(--header-height))] p-4 md:p-6`}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-primary/10" />

      <div className="flex flex-col gap-6">
        <Card className="border-primary/20 bg-card/70 backdrop-blur-sm">
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit gap-1">
                <Zap className="size-3" />
                Live Session
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl">
                Welcome back, {firstName}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {today} - Track your setups, refine strategy, and stay disciplined.
              </CardDescription>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/create">
                Start Trade Journal
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
        </Card>

        {isError ? (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleAlert className="size-4 text-destructive" />
                Could not refresh profile data
              </CardTitle>
              <CardDescription>
                Dashboard data loaded with fallback values. Retry to sync your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? "Retrying..." : "Retry"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{item.label}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                  <p
                    className={`text-xs ${item.positive ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {item.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-4 text-primary" />
                Market Watchlist
              </CardTitle>
              <CardDescription>
                Quick pulse of your core symbols before placing new trades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {watchlist.map((item, index) => (
                <div key={item.symbol}>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">{item.symbol}</p>
                    <p className="font-medium">{item.price}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <p>Last traded</p>
                    <Badge
                      variant="outline"
                      className={
                        item.positive
                          ? "border-emerald-500/30 text-emerald-500"
                          : "border-rose-500/30 text-rose-500"
                      }
                    >
                      {item.change}
                    </Badge>
                  </div>
                  {index < watchlist.length - 1 ? <Separator className="mt-3" /> : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-primary" />
                Learning Roadmap
              </CardTitle>
              <CardDescription>
                Continue your Techno Traders modules with momentum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roadmap.map((item) => (
                <div key={item.title} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">{item.title}</p>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock3 className="size-3" />
                      {item.eta}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
