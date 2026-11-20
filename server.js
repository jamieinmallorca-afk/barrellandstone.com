const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');

const app = express();
// Changes on every deploy so browsers fetch fresh CSS, JS and images.
const ASSET_V = process.env.RAILWAY_GIT_COMMIT_SHA ? process.env.RAILWAY_GIT_COMMIT_SHA.slice(0, 8) : Date.now().toString(36);
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://www.barrelandstone.co.uk').replace(/\/$/, '');

const load = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf8'));
const site = load('site.json');
const menu = load('menu.json');
const venues = load('venues.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(compression());
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));
app.use('/fonts/anton', express.static(path.join(__dirname, 'node_modules', '@fontsource', 'anton', 'files'), { maxAge: '365d' }));
app.use('/fonts/archivo', express.static(path.join(__dirname, 'node_modules', '@fontsource-variable', 'archivo', 'files'), { maxAge: '365d' }));
app.use('/vendor/leaflet', express.static(path.join(__dirname, 'node_modules', 'leaflet', 'dist'), { maxAge: '30d' }));

// Image slots: drop a file named <slot>.jpg|jpeg|png|webp into public/img
// and it replaces the labelled placeholder automatically.
const IMG_DIR = path.join(__dirname, 'public', 'img');
const EXTS = ['webp', 'jpg', 'jpeg', 'png', 'svg'];
function findImage(slot) {
  for (const ext of EXTS) {
    if (fs.existsSync(path.join(IMG_DIR, `${slot}.${ext}`))) return `/img/${slot}.${ext}?v=${ASSET_V}`;
  }
  return null;
}

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  res.locals.site = site;
  res.locals.siteUrl = SITE_URL;
  res.locals.path = req.path;
  res.locals.findImage = findImage;
  res.locals.v = ASSET_V;
  next();
});

const tagLabels = { V: 'Vegetarian', VG: 'Vegan', N: 'Contains nuts', GF: 'Gluten-free base available' };

app.get('/', (req, res) => {
  const signature = menu.pizzas.filter((p) => p.signature);
  res.render('index', {
    title: 'Stone-baked pizza at your local pub | Barrel & Stone',
    description: 'Thin, crispy stone-baked pizza made fresh behind the bar at pubs across the UK. Find your nearest Barrel & Stone or bring it to your pub.',
    signature,
    tagLabels,
    venues: venues.slice(0, 3),
  });
});

app.get('/menu', (req, res) => {
  res.render('menu', {
    title: 'Menu | Barrel & Stone stone-baked pizza',
    description: 'Our stone-baked pizza menu: classics, signatures, vegetarian, vegan and gluten-free bases, with full allergen information.',
    menu,
    tagLabels,
  });
});

app.get('/find', (req, res) => {
  const q = (req.query.q || '').toString().trim().slice(0, 60);
  res.render('find', {
    title: 'Find a Barrel & Stone pub near you',
    description: 'Every pub serving Barrel & Stone pizza, with addresses, opening times, directions and delivery links.',
    venues,
    q,
  });
});

app.get('/for-pubs', (req, res) => {
  res.render('for-pubs', {
    title: 'Pizza for pubs: a turnkey stone-baked pizza menu | Barrel & Stone',
    description: 'Add a stone-baked pizza menu your whole team can make. Ovens, ingredients, training, menus and delivery set-up, all from Barrel & Stone.',
    sent: req.query.sent === '1',
    error: req.query.error || null,
  });
});

app.post('/enquiry', async (req, res) => {
  const { name = '', pub = '', email = '', phone = '', town = '', message = '', website = '' } = req.body;
  if (website) return res.redirect(303, '/for-pubs?sent=1#talk'); // honeypot
  if (!name.trim() || !pub.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.redirect(303, '/for-pubs?error=missing#talk');
  }
  const enquiry = { name, pub, email, phone, town, message, at: new Date().toISOString() };
  console.log('[enquiry]', JSON.stringify(enquiry));

  if (process.env.RESEND_API_KEY && process.env.ENQUIRY_TO) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.ENQUIRY_FROM || 'Barrel & Stone <onboarding@resend.dev>',
          to: process.env.ENQUIRY_TO.split(','),
          reply_to: email,
          subject: `New pub enquiry: ${pub} (${town || 'no town given'})`,
          text: Object.entries(enquiry).map(([k, v]) => `${k}: ${v}`).join('\n'),
        }),
      });
      if (!r.ok) console.error('[enquiry] email failed', r.status, await r.text());
    } catch (e) {
      console.error('[enquiry] email error', e.message);
    }
  }
  res.redirect(303, '/for-pubs?sent=1#talk');
});

app.get('/partners', (req, res) => {
  res.render('partners', {
    title: 'Partner login | Barrel & Stone',
    description: 'Sign in to the Barrel & Stone partner area.',
    notice: false,
    noindex: true,
  });
});
app.post('/partners', (req, res) => {
  res.render('partners', {
    title: 'Partner login | Barrel & Stone',
    description: 'Sign in to the Barrel & Stone partner area.',
    notice: true,
    noindex: true,
  });
});

// Old WordPress URLs → new pages
const redirects = {
  '/menu/': '/menu',
  '/contact': '/for-pubs#talk',
  '/contact/': '/for-pubs#talk',
  '/our-story': '/',
  '/our-story/': '/',
  '/my-account': '/partners',
  '/my-account/': '/partners',
};
Object.entries(redirects).forEach(([from, to]) => app.get(from, (req, res) => res.redirect(301, to)));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /partners\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});
app.get('/sitemap.xml', (req, res) => {
  const urls = ['/', '/menu', '/find', '/for-pubs'];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n') +
      `\n</urlset>\n`
  );
});
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page not found | Barrel & Stone', description: '', noindex: true });
});

app.listen(PORT, () => console.log(`Barrel & Stone running on :${PORT}`));
