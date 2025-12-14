import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import moviesRouter from './routes/movies.routes';
import usersRouter from './routes/users.routes';
import searchRouter from './routes/search.routes';
import groupRouter from './routes/group.routes';
import peopleRouter from './routes/people.routes';
import userRouter from './routes/user.routes';
import docsRouter from './routes/docs.routes';

const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,    //allows cookie sending
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/movies', moviesRouter);
app.use('/api/people', peopleRouter);
app.use('/api/users', usersRouter);
app.use('/api/search', searchRouter);
app.use('/api/groups', groupRouter);
app.use('/api/auth/', userRouter);
app.use('/api/docs', docsRouter);
//app.use/('/api/reviews')
//app.use('/api/user')

// Virheenkäsittely (jos sinulla on se erillisenä)
//app.use(errorHandler as any);

if (process.env.NODE_ENV !== 'test') {
  const port: number = Number(process.env.PORT) || 4000;

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}


export default app;
