import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import layouts from 'express-ejs-layouts';
import db from './db/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Views & middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(layouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Put areas into header nav for every request
app.use((req, res, next) => {
  try {
    res.locals.navAreas = db.prepare('SELECT id, name FROM areas ORDER BY name').all();
  } catch (e) {
    console.error('[NAV] menu error:', e);
    res.locals.navAreas = [];
  }
  next();
});

// Home
app.get('/', (req, res, next) => {
  try {
    const featured = db.prepare(
      'SELECT * FROM listings WHERE featured=1 ORDER BY date_start LIMIT 1'
    ).get();
    const areas = db.prepare('SELECT * FROM areas ORDER BY name').all();
    res.render('home', { featured, areas });
  } catch (e) {
    next(e);
  }
});

// Area page
app.get('/area/:id', (req, res, next) => {
  try {
    const area = db.prepare('SELECT * FROM areas WHERE id=?').get(req.params.id);
    if (!area) return res.status(404).send('Area not found');

    const listings = db.prepare(
      'SELECT * FROM listings WHERE area_id=? ORDER BY date_start'
    ).all(req.params.id);

    const types = db.prepare(
      'SELECT DISTINCT type FROM listings WHERE area_id=? AND type IS NOT NULL'
    ).all(req.params.id).map(r => r.type);

    res.render('area', { area, listings, types });
  } catch (e) {
    next(e);
  }
});

// Shortcut Arts & Culture
app.get('/arts-culture', (req, res, next) => {
  try {
    const area = db.prepare('SELECT * FROM areas WHERE name=?').get('Arts & Culture');
    if (!area) return res.status(404).send('Area not found');
    const listings = db.prepare(
      'SELECT * FROM listings WHERE area_id=? ORDER BY date_start'
    ).all(area.id);
    res.render('area', { area, listings, types: [] });
  } catch (e) {
    next(e);
  }
});

// FAQ
app.get('/faq', (req, res, next) => {
  try {
    const faqs = db.prepare('SELECT id, question, answer FROM faqs ORDER BY id').all();
    res.render('faq', { faqs });
  } catch (e) {
    next(e);
  }
});

// Contact
app.get('/contact', (req, res) => res.render('contact', { ok: null, errors: [] }));

app.post('/contact', (req, res, next) => {
  const { name, email, subject, message } = req.body;
  const errors = [];
  if (!name?.trim()) errors.push('Name is required');
  if (!email?.includes('@')) errors.push('Valid email is required');
  if (!subject?.trim()) errors.push('Subject is required');
  if (!message?.trim()) errors.push('Message is required');
  if (errors.length) return res.render('contact', { ok: false, errors });

  try {
    const info = db.prepare(
      'INSERT INTO contacts (name,email,subject,message,created_at) VALUES (?,?,?,?,CURRENT_TIMESTAMP)'
    ).run(name, email, subject, message);
    console.log('[CONTACTS] inserted id=', info.lastInsertRowid, 'changes=', info.changes);
    return res.render('contact', { ok: true, errors: [] });
  } catch (e) {
    console.error('[CONTACTS] insert error:', e);
    return next(e);
  }
});

// API search (home)
app.get('/api/search', (req, res, next) => {
  try {
    const q = `%${(req.query.q || '').trim()}%`;
    const rows = db.prepare(
      `SELECT l.*, a.name AS area_name
       FROM listings l
       JOIN areas a ON a.id = l.area_id
       WHERE l.title LIKE ? OR a.name LIKE ?
       ORDER BY date_start`
    ).all(q, q);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// API listing for an area
app.get('/api/listings', (req, res, next) => {
  try {
    const areaId = Number(req.query.area_id);
    const type = (req.query.type || '').trim();
    const rows = db.prepare(
      `SELECT * FROM listings
       WHERE area_id = ?
         AND (? = '' OR type = ?)
       ORDER BY date_start`
    ).all(areaId, type, type);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

//start server
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
