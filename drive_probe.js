const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const { google } = require('googleapis');

async function go() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) { console.error('NO ENV'); process.exit(1); }
  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: "files(id, name, parents, shared, owners, webViewLink)",
    pageSize: 1000,
  });
  const files = res.data.files || [];
  const shared = files.filter(f => f.shared);
  console.log('total folders:', files.length, '| shared=true:', shared.length);
  const owners = {};
  shared.forEach(f => { const o = f.owners?.[0]?.emailAddress || '?'; owners[o] = (owners[o] || 0) + 1; });
  console.log('owner emails:');
  Object.entries(owners).sort((a,b) => b[1]-a[1]).forEach(([o,n]) => console.log('  ', n.toString().padStart(4), o));
  console.log('---shared sample:');
  shared.slice(0, 15).forEach(f => console.log('  -', f.name, '| parents:', JSON.stringify(f.parents)));
}
go().catch(e => { console.error(e.message); process.exit(1); });
