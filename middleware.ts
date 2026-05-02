import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Password protection for Mission Control
const PASSWORD = 'wlp2025';

export function middleware(request: NextRequest) {
  // Skip password check for API routes (they have their own auth)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip password check for static assets
  if (request.nextUrl.pathname.startsWith('/_next/') || 
      request.nextUrl.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Allow access to /data/ files for API usage (but not direct browsing)
  if (request.nextUrl.pathname.startsWith('/data/')) {
    return NextResponse.next();
  }

  // Check for password cookie on all other routes
  const authCookie = request.cookies.get('mission-control-auth');
  
  if (!authCookie || authCookie.value !== PASSWORD) {
    // Check if password is in query params (for initial auth)
    const urlPassword = request.nextUrl.searchParams.get('password');
    if (urlPassword === PASSWORD) {
      // Set cookie and redirect to clean URL
      const response = NextResponse.redirect(new URL(request.nextUrl.pathname, request.url));
      response.cookies.set('mission-control-auth', PASSWORD, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }
    
    // Show password prompt
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Mission Control — Authentication</title>
          <style>
            body {
              background: #0a0a0a;
              color: #fff;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 2rem;
              background: linear-gradient(90deg, #00d4ff, #00ff88);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            input {
              padding: 12px 20px;
              font-size: 1rem;
              border: 1px solid #333;
              border-radius: 8px;
              background: #1a1a1a;
              color: #fff;
            }
            button {
              padding: 12px 24px;
              font-size: 1rem;
              background: linear-gradient(90deg, #00d4ff, #00ff88);
              border: none;
              border-radius: 8px;
              color: #0a0a0a;
              font-weight: bold;
              cursor: pointer;
            }
            button:hover {
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🦞 Mission Control</h1>
            <form method="GET">
              <input type="password" name="password" placeholder="Enter password" autofocus />
              <button type="submit">Enter</button>
            </form>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
