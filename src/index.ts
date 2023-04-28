import express, { Request, Response } from 'express';
import fs from 'fs';
import { getDepartureSanitized } from './utils';
import { client } from './redis';

interface TimeTableEntry {
  id: number;
  line: string;
  departure: number;
  arrival: number;
}

interface Error {
  message: string; 
}

const scheduleData: TimeTableEntry[] = JSON.parse(fs.readFileSync('data/timetable.json', 'utf8'));

const app = express();

async function cacheMiddleware(req: Request, res: Response, next) {
  const key = req.originalUrl;
  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      res.json(JSON.parse(cachedData));
    } else {
      next();
    }
  } catch (err) {
    console.log('there was an error getting key from redis client', err);
  }
  
}

app.use(cacheMiddleware);

/**
 * Returns entire timetable
 */
app.get('/schedule', async (req: Request, res: Response<TimeTableEntry[]>) => {
  await client.set(req.originalUrl, JSON.stringify(scheduleData));
  res.json(scheduleData);
});

/**
 * Returns a line schedule
 * If req.query contains departure returns matching departure time for that line
 */
app.get('/schedule/:line', async (req: Request, res: Response<TimeTableEntry[] | Error>) => {
  // Enhancement: allow case-insensitive line names
  const line = req.params.line;
  const departureParam = req.query.departure as string;

  const lineSchedule = scheduleData.filter(
    (record) => record.line === line
  );
  if (lineSchedule.length === 0) {
    return res.status(404).json({ message: 'Line not found' });
  }
  if (!departureParam){
    await client.set(req.originalUrl, JSON.stringify(scheduleData));
    return res.json(lineSchedule);
  } else {
    const departure = getDepartureSanitized(departureParam);
    if (departure === null) {
      return res.status(400).json({ message:'Invalid departure time format' });
    }
    const departureRecords = lineSchedule.filter(
      (record) => record.departure === departure,
    );
    if (departureRecords.length === 0) {
      return res.status(200).json([]);
    }
    await client.set(req.originalUrl, JSON.stringify(departureRecords));
    return res.json(departureRecords);
  }
});

if (process.env.NODE_ENV !== 'test'){
  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });
}

export default app;