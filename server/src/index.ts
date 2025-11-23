import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import moviesRouter from './routes/movies.routes';
import usersRouter from './routes/users.routes';
import searchRouter from './routes/search.routes';
import groupRouter from './routes/group.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// OMA REITTI: /api/movies → moviesRouter
app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/search', searchRouter);
app.use('/api/groups', groupRouter);

// Virheenkäsittely (jos sinulla on se erillisenä)
//app.use(errorHandler as any);

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server http://localhost:${port}`));
}

export default app;
