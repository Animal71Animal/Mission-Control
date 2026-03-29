"use client";

import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const emailDraft = `Subject: Thank You + Equipment & Programming Support

Hi Amanda,

Hope you're doing well! I wanted to reach out and say thank you for everything you've done to support the club and the shows. It's been great working with you, and I really appreciate your help keeping things running smoothly.

I'm writing to ask for your support on a few equipment and programming needs that would really elevate our shows:

• Hazer — We need a proper haze machine to get the most out of our lighting. Right now the beams don't pop the way they should, and a hazer would make a huge difference for the visual impact.

• Fix the Vesuvio — The Vesuvio unit is down and needs repair. It's a key piece of our effects setup, and getting it back online would add back that extra layer of production value.

• Lighting Programmer — I'd love to bring in a lighting programmer to help build out scenes in Light Jockey and get our DMX chain fully optimized. With the right programming, we could have the club looking like a proper concert venue.

To give you a sense of what I'm aiming for, here are some examples of my past shows and the level of production I'm used to delivering:

• Playboy Mansion (Los Angeles) — Multi-stage residency with full lighting design and video integration
• Winter Music Conference (Miami) — Annual festival appearances with concert-grade production
• Mynt Lounge (Miami) — High-end club residency with custom lighting scenes and video mapping
• Pulse 96.9 / 102.5 FM — Radio mixshow with branded visual content and promotional video production
• Private events & corporate functions — Full production management including lighting, video, and audio

I've attached a few photos and links to videos from these events so you can see the caliber of production I bring. With the right equipment and programming support, we can get Spearmint Rhino looking and sounding just as polished.

Let me know what you think, and if there's a good time to chat through the details. I'm happy to work within whatever budget makes sense and prioritize the items that will have the biggest impact first.

Thanks again for everything, Amanda. Looking forward to taking the club to the next level together.

Best,
Eric "ANIMAL" Mills
DJ | Producer | Musician
Spearmint Rhino — Boise, ID
[Phone] | [Email]`;

export default function AmandaEmailPage() {
  return (
    <div className="page-container">
      <Link 
        href="/spearmint-rhino" 
        className="text-sm text-gray-400 hover:text-gray-300 mb-6 inline-flex items-center gap-1"
      >
        ← Back to Spearmint Rhino
      </Link>

      <PageHeader
        title="Email to Amanda"
        subtitle="Equipment requests and show examples"
        icon="📧"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Draft */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
                Draft Email
              </h2>
              <button 
                onClick={() => navigator.clipboard.writeText(emailDraft)}
                className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {emailDraft}
            </pre>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
              Requests
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">1.</span>
                <span>Hazer machine for lighting effects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">2.</span>
                <span>Repair/fix the Vesuvio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">3.</span>
                <span>Lighting programmer for Light Jockey</span>
              </li>
            </ul>
          </div>

          {/* Show Examples */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent2)" }}>
              Show References
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Playboy Mansion (LA)</li>
              <li>• Winter Music Conference (Miami)</li>
              <li>• Mynt Lounge (Miami)</li>
              <li>• Pulse 96.9/102.5 FM</li>
              <li>• Private/Corporate events</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
              Notes
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Customize [Phone] and [Email] before sending</p>
              <p>• Attach photos/videos from past shows</p>
              <p>• Consider including specific budget estimates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
