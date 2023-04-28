# train-schedule-api
Provides a train timetable for train leaving given station

This api has the following endpoints:

## GET /schedule
Returns the entire timetable as a JSON array
```json
[ { "id": 1, "line": "Lakeshore", "departure": 800, "arrival": 900 }, ... ]
```
## GET /schedule/{line}?departure={time}
* Returns JSON array of line specified in the url route
* If departure time is present as a query parameter, this endpoint returns a one element JSON array with the record for the specified train line and departure time.

### Steps to run locally
1. ```npm install```
2. ```npm run dev``` for hot reloading, or ```npm run start```

Application will be available at http://localhost:3000

## Run app in docker container
Checkout branch `feat/docker` for code to run docker container which includes redis service for caching requests.
Once branch is checked out, just run `docker-compose up --build` and the application should be available at http://localhost:3000

### Tests
Tests are setup using jest and supertest
Use this command to run tests

```npm run test```

### Possible enhancements
1. Allow case-insensitive line names in the GET request, and flexible ways to add departure
2. Add an in memory caching service like redis for request cache
3. Add a database for storing timetable data
4. Use database models for easily extending feature to support query by arrival time
5. ~~Dockerize cache and database with the application~~ done
6. Depending on the intended use, add security features
