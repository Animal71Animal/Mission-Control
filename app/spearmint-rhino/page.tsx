import TodoList from "@/components/TodoList";
import PageHeader from "@/components/PageHeader";

const todoItems = [
  { id: "1", text: "Rearrange DJ booth", completed: false, category: "Setup" },
  { id: "2", text: "Clean all amps and equipment (need compressed air)", completed: false, category: "Maintenance" },
  { id: "3", text: "Add scenes to Light Jockey", completed: false, category: "Lighting" },
  { id: "4", text: "Get smoke machine in the DMX chain", completed: false, category: "Lighting" },
  { id: "5", text: "Adjust video so that the big screen will show Main Computer", completed: false, category: "Video" },
  { id: "6", text: "Fix the 'no mic in dressing room' issue", completed: false, category: "Audio" },
  { id: "7", text: "Make Final Version of Promotional Video", completed: false, category: "Media" },
  { id: "8", text: "Get sound back in Private Dance rooms", completed: false, category: "Audio" },
  { id: "9", text: "Audio processor and adjust crossover for speakers", completed: false, category: "Audio" },
  { id: "10", text: "Change over to new hard drive", completed: false, category: "IT" },
  { id: "11", text: "Get computer screen fixed", completed: false, category: "IT" },
  { id: "12", text: "See about getting Vesuvio fixed", completed: false, category: "Equipment" },
  { id: "13", text: "Look for flash drive of corporate video", completed: false, category: "Media" },
  { id: "14", text: "Haze machine", completed: false, category: "Lighting" },
  { id: "15", text: "Prepare Ableton sample bank", completed: false, category: "Music" },
  { id: "16", text: "Make hourly shot special and bottle audio", completed: false, category: "Audio" },
  { id: "17", text: "Make promo video for club", completed: false, category: "Media" },
  { id: "18", text: "Write email to Amanda (thank you + request hazer, Vesuvio fix, lighting programmer)", completed: false, category: "Communication" },
  { id: "19", text: "Print more Spotify dancer instructions", completed: false, category: "Communication" },
];

const categories = ["All", "Setup", "Maintenance", "Lighting", "Video", "Audio", "Media", "IT", "Equipment", "Music", "Communication"];

export default function SpearmintRhinoPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Spearmint Rhino"
        subtitle="Club operations and venue management"
        icon="🦏"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Todo List */}
        <div className="lg:col-span-2">
          <TodoList
            title="Club To-Do List"
            items={todoItems}
            categories={categories}
            storageKey="spearmint-rhino-todos"
          />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
              Progress Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tasks</span>
                <span className="font-mono">{todoItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categories</span>
                <span className="font-mono">{categories.length - 1}</span>
              </div>
            </div>
          </div>

          {/* Priority Items */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent2)" }}>
              High Priority
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400">🔴</span>
                <span>Audio processor and crossover adjustment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">🔴</span>
                <span>Sound in Private Dance rooms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">🟡</span>
                <span>Promotional video (final version)</span>
              </li>
            </ul>
          </div>

          {/* Equipment Status */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
              Equipment Notes
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Compressed air needed for amp cleaning</p>
              <p>• New hard drive ready for swap</p>
              <p>• Vesuvio needs repair assessment</p>
              <p>• Flash drive location unknown</p>
            </div>
          </div>

          {/* Email to Amanda */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent2)" }}>
              📧 Email to Amanda
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-800 p-3 rounded border-l-4 border-purple-500">
                <p className="text-gray-300 mb-2">
                  <strong>Subject:</strong> Thank You + Equipment & Programming Needs
                </p>
                <p className="text-gray-400 text-xs">
                  Draft email requesting hazer, Vesuvio repair, and lighting programmer support.
                </p>
              </div>
              <a 
                href="/spearmint-rhino/amanda-email"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>View & Edit Email</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
