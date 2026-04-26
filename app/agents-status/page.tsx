"use client";

import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  discipline: string;
  color: string;
  status: string;
  status_text: string;
  active_tasks: number;
}

interface StatusData {
  timestamp: string;
  agents: Agent[];
  summary: {
    total_agents: number;
    active_count: number;
    working_count: number;
    busy_count: number;
    total_tasks: number;
  };
}

interface Robot {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  name: string;
  active_tasks: number;
  status: string;
}

const AGENT_COLORS: Record<string, string> = {
  langostino: "#9b5de5",
  homard: "#00bbf9",
  clawdia: "#fee440",
  shelly: "#00f5d4",
  rockwell: "#f15bb5",
  barnaby: "#f15b5b",
  sebastian: "#f19b5b",
  coral: "#5bf166",
};

export default function AgentsStatus() {
  const [data, setData] = useState<StatusData | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/data/agents-status.json");
        const json = await res.json();
        setData(json);

        // Initialize robots from agents
        const newRobots: Robot[] = json.agents.map((agent: Agent, i: number) => ({
          id: i,
          x: Math.random() * 400,
          y: Math.random() * 300,
          targetX: Math.random() * 400,
          targetY: Math.random() * 300,
          color: AGENT_COLORS[agent.id] || "#888",
          name: agent.name,
          active_tasks: agent.active_tasks,
          status: agent.status,
        }));
        setRobots(newRobots);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animate robots
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setRobots((prev) =>
        prev.map((robot) => {
          let { x, y, targetX, targetY } = robot;
          const speed = 2;

          if (Math.abs(x - targetX) < speed && Math.abs(y - targetY) < speed) {
            targetX = Math.random() * 400;
            targetY = Math.random() * 300;
          }

          const dx = targetX - x;
          const dy = targetY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > speed) {
            x += (dx / distance) * speed;
            y += (dy / distance) * speed;
          }

          return { ...robot, x, y, targetX, targetY };
        })
      );

      setTime(new Date());
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900 mb-2">Loading...</div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900">No data available</div>
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🏢 AI Office</h1>
            <p className="text-slate-600">Real-time agent status and task allocation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Office Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="relative w-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden" style={{ height: "400px" }}>
                  {/* Grid background */}
                  <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="400" height="300" fill="url(#grid)" />
                  </svg>

                  {/* Robots */}
                  {robots.map((robot) => (
                    <div
                      key={robot.id}
                      className="absolute transition-all duration-75 flex flex-col items-center"
                      style={{ left: `${robot.x}px`, top: `${robot.y}px` }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg hover:shadow-xl transition-shadow cursor-default"
                        style={{ backgroundColor: robot.color }}
                      >
                        {robot.name[0]}
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
                        {robot.name}
                      </div>
                      <div className="text-xs text-slate-500">{robot.status}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-500 text-center">
                  🕐 {time.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Team Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-700">Idle</span>
                    </div>
                    <span className="font-bold text-slate-900">{data.summary.active_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-slate-700">Working</span>
                    </div>
                    <span className="font-bold text-slate-900">{data.summary.working_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-slate-700">Busy</span>
                    </div>
                    <span className="font-bold text-slate-900">{data.summary.busy_count}</span>
                  </div>
                </div>
              </div>

              {/* Tasks Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Active Tasks</h2>
                <div className="text-4xl font-bold text-blue-600">{data.summary.total_tasks}</div>
                <p className="text-sm text-slate-600 mt-2">across all agents</p>
              </div>

              {/* Agents List */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Agents</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }}></div>
                        <span className="font-semibold text-slate-900">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{agent.active_tasks}</span>
                        <span className="text-xl">{agent.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
