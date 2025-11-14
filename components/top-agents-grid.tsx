"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export function TopAgentsGrid() {
  const agents = [
    {
      name: "AVA",
      image: "/agents/ava.png",
      value: "4.22%",
      change: "+2.2",
      current: "4.22%"
    },
    {
      name: "BUDDY",
      image: "/agents/buddy.png",
      value: "2.75%",
      change: "+2.03",
      current: "2.75%"
    },
    // Add more agents...
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {agents.map((agent, index) => (
        <Card key={index} className="bg-black/50 border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <Image
                src={agent.image}
                alt={agent.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            </Avatar>
            <div>
              <div className="font-medium">{agent.name}</div>
              <div className="text-sm text-gray-400">{agent.current}</div>
              <div className="text-sm text-green-500">{agent.change}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 