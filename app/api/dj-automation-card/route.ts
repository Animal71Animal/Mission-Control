export async function GET() {
  // DJ Automation card data — single source of truth
  const djAutomationData = {
    title: "DJ AUTOMATION SOFTWARE",
    description: "AI-powered DJ management system for gentlemen's clubs. One head DJ programs the system, replacing the need for multiple DJs throughout the week.",
    
    tools: [
      { name: "ROI Calculator", desc: "See annual savings for your venue", href: "/wlp-dj-roi" },
    ],
    
    docs: [
      { name: "Product Brief", desc: "Full product spec, features, roadmap", href: "/shared/product-brief-full" },
      { name: "Competitive Positioning", desc: "vs. CoverJock, BoothPoint & others", href: "/shared/competitive-positioning" },
      { name: "Investor Pitch", desc: "Seed round deck — formatted markdown", href: "/shared/investor-pitch" },
      { name: "DJ Automation Roadmap", desc: "May–Aug 2026 · MVP May 31 · Testing June–July · ED Expo August · $100K MRR (6-month)", href: "/shared/dj-roadmap" },
    ],
    
    features: [
      { title: "Smart Playlist Generation", desc: "AI-powered track selection based on venue energy" },
      { title: "Tempo Matching", desc: "Automatic beat matching and transitions" },
      { title: "Energy Level Management", desc: "Dynamic adjustments based on crowd response" },
      { title: "Request Queue System", desc: "Dancer portal for song requests" },
      { title: "Tip Tracking Integration", desc: "Connect with SRB tip data" },
    ],
    
    techStack: ["VirtualDJ SDK", "Python", "React", "Node.js", "PostgreSQL"],
  };

  return Response.json(djAutomationData);
}
