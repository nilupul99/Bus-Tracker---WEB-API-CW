export const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
  }

  const expected = process.env.API_BEARER_TOKEN;
  if (!expected) {
    return res.status(500).json({ success: false, error: 'Server auth is not configured' });
  }

  if (token !== expected) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  next();
};

export default auth;