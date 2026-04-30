"use client";

import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const emailDraft = `Subject: Following Up — Raise, Booth Upgrades & Show Production Ideas

Hi Amanda and Bryan,

Hope you're both doing well! I wanted to follow up on our conversation before you left, Amanda. Thank you for taking the time that day — I really appreciated it.

I know I came across a bit manic, and I apologize for that. As I explained to Bryan, when I feel like I only have a limited window with someone, I tend to dump everything at once. So let me organize this properly:

THE RAISE TO $15/HR

A couple of things on this:

• It was mentioned during my hiring that this would happen after the probation period
• Boise is a tough market for DJs, especially without a Wed–Sat/Sun schedule that would help maximize earnings
• In return, I'll faithfully execute the responsibilities of Head DJ/AV Technician

I have extensive experience leading teams with SOPs and protocols that produce results — and more importantly, revenue.

Booth improvements completed so far:
1. Installed speakers in booth
2. Cleaned booth (amp rack and all equipment)
3. Fixed sound in all dance rooms
4. Added floor filler speakers that weren't hooked up correctly
5. Fixed the video splitter for more options
6. Swapped out the external hard drive
7. Added Beatport subscription
8. Hooked up a redundant audio system for if the main computer goes down

More to come.

SHOW PRODUCTION IDEAS

We discussed doing a "Midnight Showtime" where I introduce the girls and we do a special dance, followed by the classic "2 for..." format. I love this because it gives me time to bring up a Featured Entertainer (in-house) on Friday and Saturday nights without breaking the flow.

With my background, I like to make a big theatrical production for showtime that really gets people excited. I've attached a couple examples — these are older videos, but they'd give you a sense of what I'm talking about. I'd obviously create new ones for the Spearmint brand at a much higher level with the tools I have now.

As a side note — the intro video format is something that could scale across the entire Spearmint Rhino brand if it performs well here. Just something to keep in mind for the future.

EQUIPMENT & SUPPORT REQUESTS

1. Hazer — Here's a cost-effective option I think would work great for our space:
   https://www.sweetwater.com/store/detail/Haze1DX--chauvet-dj-hurricane-haze-1dx-haze-machine-800-cfm

2. Vesuvio Repair — We talked about getting the Chauvet Vesuvio we have fixed. Let me know if you need any specs on that unit.

Both of these would be huge for putting on a real show, which is where I naturally lean. I think this type of production value helps retain regulars and brings in new clientele.

3. Lighting Programmer — Something we didn't discuss, but would be very helpful: could I bring in a local light tech with Light Jockey experience for a couple hours? I haven't used LJ in a while and could use a refresher. I'd watch, learn, and apply that knowledge as part of my duties here.

ONE LAST THING

I just wanted to make a brief mention of the great job I think Bryan is doing. From the energy he brings to the club, to his common sense (which we all know is not plentiful these days), to his work ethic and dedication. Thankfully we worked through that initial misunderstanding and he is truly a pleasure to work for.

And no, Bryan did not pay me for that endorsement... lol.

Let me know what you think, and if there's a good time to chat through any of this. I'm happy to work within whatever budget makes sense and prioritize the items that will have the biggest impact first.

Thanks again for everything.

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
        title="Email to Amanda & Bryan"
        subtitle="Raise request, booth upgrades & show production ideas"
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
                <span>Raise to $15/hr</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">2.</span>
                <span>Hazer machine for lighting effects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">3.</span>
                <span>Repair/fix the Vesuvio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">4.</span>
                <span>Lighting programmer for Light Jockey</span>
              </li>
            </ul>
          </div>

          {/* Booth Improvements */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent2)" }}>
              Booth Improvements (8)
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Speakers installed</li>
              <li>• Booth cleaned (amp rack + equipment)</li>
              <li>• Dance room sound fixed</li>
              <li>• Floor filler speakers hooked up</li>
              <li>• Video splitter fixed</li>
              <li>• External hard drive swapped</li>
              <li>• Beatport subscription added</li>
              <li>• Redundant audio system</li>
            </ul>
          </div>

          {/* Show Ideas */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent2)" }}>
              Show Ideas
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Midnight Showtime</li>
              <li>• "2 for..." after intros</li>
              <li>• Featured Entertainer (Fri/Sat)</li>
              <li>• Theatrical production style</li>
              <li>• Scalable intro video format</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
              Notes
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Customize [Phone] and [Email] before sending</p>
              <p>• Attach show videos & flyer</p>
              <p>• Hazer link included in draft</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
