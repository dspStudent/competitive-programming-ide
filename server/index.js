const express = require('express');
const cors = require('cors');
const runnerRoutes = require('./routes/runner');
const fileRoutes = require('./routes/files');
const gitRoutes = require('./routes/git');
const { initWorkspace } = require('./services/fileService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api', runnerRoutes);
app.use('/api', fileRoutes);
app.use('/api', gitRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize workspace on startup
initWorkspace();

app.listen(PORT, () => {
  console.log(`CP-IDE Server running on port ${PORT}`);
});
