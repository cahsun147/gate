"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AgentMetricsCard } from "@/components/agent-metrics-card";
import { AgentDominanceChart } from "@/components/agent-dominance-chart";
import { TopAgentsGrid } from "@/components/top-agents-grid";
import { AgentStatsTable } from "@/components/agent-stats-table";
import { Search } from "lucide-react";

export default function AIAgentIndex() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-semibold">1477 agents tracked</div>
        <div className="flex gap-4">
          <Button variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            See Cookie DeFAI Hackathon Projects New
          </Button>
          <Button variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Trade New
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-transparent border border-gray-800">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="infra">Infra</TabsTrigger>
          <TabsTrigger value="defai">DeFAI</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input 
          placeholder="Search AI Agents or infrastructure" 
          className="pl-10 bg-transparent border-gray-800"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Metrics Section */}
        <div className="col-span-12 lg:col-span-4">
          <div className="grid gap-6">
            <AgentMetricsCard 
              title="Total market cap"
              value="6.49B"
              change="-3.52%"
              period="24H"
              chartData={[65, 59, 80, 81, 56, 55, 40]}
              borderColor="#ff4444"
              backgroundColor="rgba(255, 68, 68, 0.1)"
            />
            <AgentMetricsCard 
              title="Smart Engagement"
              value="7.09K"
              change="-3.48%"
              period="24H"
              chartData={[28, 48, 40, 19, 86, 27, 90]}
              borderColor="#4CAF50"
              backgroundColor="rgba(76, 175, 80, 0.1)"
            />
          </div>
        </div>

        {/* Top Agents Section */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-black border-gray-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top 10 AI Agents by Mindshare (last 24h)</h2>
            </div>
            <TopAgentsGrid />
          </Card>
        </div>

        {/* Dominance Chart */}
        <div className="col-span-12">
          <Card className="bg-black border-gray-800 p-4">
            <h2 className="text-lg font-semibold mb-4">Dominance</h2>
            <AgentDominanceChart />
          </Card>
        </div>

        {/* Stats Table */}
        <div className="col-span-12">
          <AgentStatsTable />
        </div>
      </div>
    </div>
  );
} 