const { protect, admin } = require('../middleware/auth');
const { getAdminCustomers } = require('../controllers/customerController');

const req = {
  query: {},
  headers: { authorization: 'Bearer demo_token_admin' },
  url: '/api/admin/customers',
  originalUrl: '/api/admin/customers'
};

const res = {
  status: function(code) {
    console.log('[DEBUG RES STATUS]:', code);
    return this;
  },
  json: function(data) {
    console.log('[DEBUG RES JSON]:', JSON.stringify(data, null, 2).substring(0, 500));
    return this;
  }
};

(async () => {
  console.log('Testing protect -> admin -> getAdminCustomers middleware stack...');
  try {
    await protect(req, res, async (err) => {
      if (err) return console.error('protect middleware error:', err);
      console.log('protect passed, user:', req.user);
      await admin(req, res, async (err2) => {
        if (err2) return console.error('admin middleware error:', err2);
        console.log('admin passed!');
        await getAdminCustomers(req, res);
      });
    });
  } catch (err) {
    console.error('CRASH IN STACK:', err);
  }
})();
