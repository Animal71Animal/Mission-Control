import Link from "next/link";
import { modules } from "../data/modules";

export default function PromotionsPage() {
  const promoModule = modules.find((m) => m.href === "/promotions");
  const children = promoModule?.children || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">📢 Promotions & Marketing</h1>
      <p className="text-gray-400 mb-8">
        Weekly party concepts, event planning, and promotional assets for Spearmint Rhino Boise.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className="block p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 hover:border-gray-700 transition-all"
          >
            <div className="text-3xl mb-3">{child.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{child.title}</h2>
            <p className="text-gray-400 text-sm">{child.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-xl border border-gray-800 bg-gray-900/30">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-green-400">7</div>
            <div className="text-sm text-gray-400">Party Concepts</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-yellow-400">0</div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-blue-400">0</div>
            <div className="text-sm text-gray-400">Flyers Done</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-purple-400">1</div>
            <div className="text-sm text-gray-400">Monthly Events</div>
          </div>
        </div>
      </div>
    </div>
  );
}
