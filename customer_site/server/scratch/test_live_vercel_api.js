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
  console.log('Testing live Vercel API endpoints with cache bust...');

  const timestamp = Date.now();
  const custRes = await fetchUrl(`https://customersite-psi.vercel.app/api/admin/customers?nocache=${timestamp}`);
  console.log('\n--- GET /api/admin/customers ---');
  console.log('Status Code:', custRes.status);
  console.log('Data Snippet:', custRes.data.substring(0, 300));

  const ordRes = await fetchUrl(`https://customersite-psi.vercel.app/api/admin/orders?nocache=${timestamp}`);
  console.log('\n--- GET /api/admin/orders ---');
  console.log('Status Code:', ordRes.status);
  console.log('Data Snippet:', ordRes.data.substring(0, 300));
})();
