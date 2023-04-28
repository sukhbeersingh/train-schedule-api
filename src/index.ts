import express, { Request, Response } from 'express';
import fs from 'fs';
import { createClient } from 'redis';
import { getDepartureSanitized } from './utils';

let client;

try {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: 6379
    }
  });
} catch (err) {
  console.log('error while initializing redis client', err);
}


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

// Enhancement: This should be a caching service like redis
const cache = {};

function cacheMiddleware(req: Request, res: Response, next) {
  const key = req.originalUrl;

  try {
    const cachedData = client.get(key);
    if (cachedData) {
      res.json(cachedData);
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
app.get('/schedule', (req: Request, res: Response<TimeTableEntry[]>) => {
  client.set(req.originalUrl, JSON.stringify(scheduleData));
  res.json(scheduleData);
});

/**
 * Returns a line schedule
 * If req.query contains departure returns matching departure time for that line
 */
app.get('/schedule/:line', (req: Request, res: Response<TimeTableEntry[] | Error>) => {
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
    client.set(req.originalUrl, JSON.stringify(scheduleData));
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
    cache[req.originalUrl] = departureRecords;
    return res.json(departureRecords);
  }
});

if (process.env.NODE_ENV !== 'test'){
  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });
}

export default app;