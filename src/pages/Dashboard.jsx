// src/pages/Dashboard.jsx  (or wherever your Dashboard file is)
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { StatsCard } from "../dashboard/StatsCard";
import { ActivityChart } from "../dashboard/ActivityChart";
import { RecentMessages } from "../dashboard/RecentMessages";
import { Package2, Briefcase, MessageSquare, Users } from "lucide-react";

export default function Dashboard() {
  return (
    // ← Remove the <Layout> wrapper completely
    <div className="p-6 md:p-8 lg:p-10 space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111114] dark:text-white">
              Welcome back, Admin
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
              Here's what's happening at{" "}
              <span className="font-semibold text-primary-600">
                TCAM Solution
              </span>{" "}
              today
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Dec 3, 2025
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value="68"
            change="+18%"
            icon={Package2}
            trend="up"
            variant="teal"
            subtitle="In stock"
            trendData={[12, 20, 18, 28, 34, 40, 68]}
          />
          <StatsCard
            title="Active Services"
            value="24"
            change="+12%"
            icon={Briefcase}
            trend="up"
            variant="purple"
            subtitle="Ongoing"
            trendData={[5, 6, 9, 11, 14, 18, 24]}
          />
          <StatsCard
            title="New Messages"
            value="12"
            change="+45%"
            icon={MessageSquare}
            trend="up"
            variant="blue"
            subtitle="Unread"
            trendData={[2, 2, 3, 4, 8, 9, 12]}
          />
          <StatsCard
            title="Happy Clients"
            value="156"
            change="+8%"
            icon={Users}
            trend="up"
            variant="orange"
            subtitle="This month"
            trendData={[100, 110, 120, 140, 150, 152, 156]}
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-[#1C1B1B] dark:text-white">
                Activity Overview
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time analytics and performance metrics
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-72 md:h-80 lg:h-96">
                <ActivityChart />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#1C1B1B] dark:text-white">
                Recent Activity
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest notifications and messages
              </p>
            </CardHeader>
            <CardContent>
              <RecentMessages />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
