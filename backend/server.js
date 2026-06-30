import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import goalsRouter from './routes/goals.js';
import tasksRouter from './routes/tasks.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/goals', goalsRouter);
app.use('/api/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.send('Goalflow API running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
