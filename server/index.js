const express = require('express');
const cors = require('cors');
const runnerRoutes = require('./routes/runner');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api', runnerRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`CP-IDE Server running on port ${PORT}`);
});
