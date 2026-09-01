const https = require('https');

const fetchUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (err) => resolve({ status: 500, data: err.message }));
  });
};

(async () => {
  const rootRes = await fetchUrl(`https://customersite-psi.vercel.app/api/`);
  console.log('\n--- GET /api/ ---');
  console.log('Status Code:', rootRes.status);
  console.log('Data Snippet:', rootRes.data);
})();
