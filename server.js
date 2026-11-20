const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const HOST_PIN = process.env.HOST_PIN || '2026';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const seed = {
      hostConfig: {
        upiId: process.env.HOST_UPI_ID || 'draxesports@okaxis',
        merchantName: 'DRAX ESPORTS',
      },
      players: {},
      tournaments: [
        {
          id: 'm402',
          title: 'Bermuda Blitz #402',
          mode: 'BR',
          format: 'SQUAD',
          map: 'Bermuda',
          status: 'LIVE',
          timeLabel: 'Starts in 12m',
          prizePool: 1200,
          perKill: 20,
          entryFee: 20,
          slotsFilled: 44,
          slotsMax: 48,
          roomId: '88492014',
          roomPass: 'DRAX402',
        }
      ],
      depositRequests: [],
      withdrawRequests: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getOrCreatePlayer(db, uid, ign) {
  if (!db.players[uid]) {
    db.players[uid] = {
      uid,
      ign: ign || 'PLAYER_' + uid.slice(-4),
      depositBalance: 0,
      winningBalance: 0,
      tickets: 1,
      joinedMatches: [],
    };
  }
  return db.players[uid];
}

app.get('/api/public', (req, res) => {
  const db = readDB();
  res.json({
    hostConfig: db.hostConfig,
    tournaments: db.tournaments,
  });
});

app.post('/api/deposit-request', (req, res) => {
  const { uid, ign, amount, utr } = req.body;
  if (!uid || !amount || !utr) return res.status(400).json({ error: 'Missing uid, amount, or utr' });
  const db = readDB();
  getOrCreatePlayer(db, uid, ign);
  const entry = {
    id: 'dep_' + Date.now(),
    uid,
    ign: ign || uid,
    amount: Number(amount),
    utr: String(utr).trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  db.depositRequests.unshift(entry);
  writeDB(db);
  res.json({ ok: true, request: entry });
});

app.post('/api/withdraw-request', (req, res) => {
  const { uid, upiId, amount } = req.body;
  const db = readDB();
  const player = db.players[uid];
  if (!player || player.winningBalance < Number(amount)) {
    return res.status(400).json({ error: 'Insufficient winning balance' });
  }
  player.winningBalance -= Number(amount);
  const wd = {
    id: 'wd_' + Date.now(),
    uid,
    ign: player.ign,
    upiId,
    amount: Number(amount),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  db.withdrawRequests.unshift(wd);
  writeDB(db);
  res.json({ ok: true, request: wd });
});

app.post('/api/admin/approve-deposit', (req, res) => {
  const { pin, depositId } = req.body;
  if (pin !== HOST_PIN) return res.status(403).json({ error: 'Invalid Host PIN' });
  const db = readDB();
  const dep = db.depositRequests.find(d => d.id === depositId);
  if (!dep || dep.status !== 'PENDING') return res.status(404).json({ error: 'Pending deposit not found' });
  dep.status = 'APPROVED';
  const player = getOrCreatePlayer(db, dep.uid, dep.ign);
  player.depositBalance += dep.amount;
  writeDB(db);
  res.json({ ok: true, player });
});

app.post('/api/admin/mark-paid', (req, res) => {
  const { pin, withdrawId } = req.body;
  if (pin !== HOST_PIN) return res.status(403).json({ error: 'Invalid Host PIN' });
  const db = readDB();
  const wd = db.withdrawRequests.find(w => w.id === withdrawId);
  if (!wd || wd.status !== 'PENDING') return res.status(404).json({ error: 'Pending withdrawal not found' });
  wd.status = 'PAID';
  writeDB(db);
  res.json({ ok: true });
});

app.post('/api/admin/settings', (req, res) => {
  const { pin, upiId, merchantName } = req.body;
  if (pin !== HOST_PIN) return res.status(403).json({ error: 'Invalid Host PIN' });
  const db = readDB();
  if (upiId) db.hostConfig.upiId = upiId;
  if (merchantName) db.hostConfig.merchantName = merchantName;
  writeDB(db);
  res.json({ ok: true, hostConfig: db.hostConfig });
});

app.listen(PORT, () => {
  console.log(`DRAX ESPORTS server running on http://localhost:${PORT}`);
});
