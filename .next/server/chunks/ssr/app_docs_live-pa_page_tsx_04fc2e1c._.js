module.exports=[27366,a=>{"use strict";var b=a.i(87924),c=a.i(72131);function d(){let[a,d]=(0,c.useState)(""),[f,g]=(0,c.useState)(!0);return((0,c.useEffect)(()=>{fetch("/data/live-pa-setup.md").then(a=>a.text()).then(a=>{d(a),g(!1)}).catch(()=>{d("Unable to load Live PA setup guide."),g(!1)})},[]),f)?(0,b.jsxs)("div",{children:[(0,b.jsx)("h1",{style:{fontSize:"1.5rem",fontWeight:700,margin:"0 0 8px",color:"var(--text)"},children:"🎹 Live PA Setup"}),(0,b.jsx)("p",{style:{color:"var(--muted)"},children:"Loading..."})]}):(0,b.jsx)(e,{content:a,backHref:"/ableton",backLabel:"Back to Ableton",title:"🎹 Live PA Setup",subtitle:"Professional live performance rig documentation"})}function e({content:a,backHref:d,backLabel:e,title:f,subtitle:g}){let[h,i]=(0,c.useState)("");return(0,c.useEffect)(()=>{i('<div class="md-content"><p>'+a.replace(/^# (.*$)/gim,"<h1>$1</h1>").replace(/^## (.*$)/gim,"<h2>$1</h2>").replace(/^### (.*$)/gim,"<h3>$1</h3>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")+"</p></div>")},[a]),(0,b.jsxs)("div",{children:[(0,b.jsxs)("a",{href:d,style:{fontSize:"0.8rem",color:"var(--muted)",textDecoration:"none",marginBottom:20,display:"inline-block"},children:["← ",e]}),(0,b.jsxs)("div",{style:{marginBottom:20},children:[(0,b.jsx)("h1",{style:{fontSize:"1.5rem",fontWeight:700,margin:"0 0 8px",color:"var(--text)"},children:f}),(0,b.jsx)("p",{style:{color:"var(--muted)",margin:0,fontSize:"0.875rem"},children:g})]}),(0,b.jsxs)("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:"32px 36px",marginTop:12},children:[(0,b.jsx)("style",{children:`
          .md-content h1 { font-size: 1.6rem; font-weight: 700; color: #e8e8e8; margin: 0 0 16px; }
          .md-content h2 { font-size: 1.1rem; font-weight: 600; color: #c77dff; margin: 28px 0 10px; border-bottom: 1px solid #1e1e2e; padding-bottom: 6px; }
          .md-content h3 { font-size: 0.95rem; font-weight: 600; color: #e8e8e8; margin: 20px 0 8px; }
          .md-content p { font-size: 0.875rem; color: #b0b0c8; line-height: 1.7; margin: 0 0 12px; }
          .md-content ul, .md-content ol { font-size: 0.875rem; color: #b0b0c8; line-height: 1.8; margin: 0 0 12px; padding-left: 20px; }
          .md-content li { margin-bottom: 3px; }
          .md-content strong { color: #e8e8e8; }
          .md-content code { font-family: monospace; font-size: 0.8rem; background: #0d0d1a; color: #c77dff; padding: 2px 6px; border-radius: 4px; }
          .md-content pre { background: #0d0d1a; border: 1px solid #1e1e2e; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0; }
          .md-content pre code { background: none; padding: 0; }
          .md-content table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 12px 0; }
          .md-content th { background: #0d0d1a; color: #c77dff; padding: 8px 12px; text-align: left; border: 1px solid #1e1e2e; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
          .md-content td { padding: 8px 12px; border: 1px solid #1e1e2e; color: #b0b0c8; }
          .md-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
          .md-content hr { border: none; border-top: 1px solid #1e1e2e; margin: 24px 0; }
          .md-content blockquote { border-left: 3px solid #9b5de5; padding-left: 12px; margin: 12px 0; color: #6a6a8a; }
        `}),(0,b.jsx)("div",{className:"md-content",dangerouslySetInnerHTML:{__html:h}})]})]})}a.s(["default",()=>d])}];

//# sourceMappingURL=app_docs_live-pa_page_tsx_04fc2e1c._.js.map