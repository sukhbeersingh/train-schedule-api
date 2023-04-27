import request from "supertest";
import app from "../index";

describe("GET /schedule", () => {
  it("should return the entire timetable", async () => {
    const response = await request(app).get("/schedule");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(17);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("line");
    expect(response.body[0]).toHaveProperty("departure");
    expect(response.body[0]).toHaveProperty("arrival");
  });
});

describe("GET /schedule/:line", () => {
  it("should return the timetable for the specified line", async () => {
    const response = await request(app).get("/schedule/Lakeshore");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(5);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("line");
    expect(response.body[0].line).toBe("Lakeshore");
    expect(response.body[0]).toHaveProperty("departure");
    expect(response.body[0]).toHaveProperty("arrival");
  });

  it("should return 404 if the line does not exist", async () => {
    const response = await request(app).get("/schedule/InvalidLine");
    expect(response.status).toBe(404);
  });
});

describe("GET /schedule/:line?departure=:time", () => {
  it("should return the record for the specified line and departure time", async () => {
    const response = await request(app).get("/schedule/Kitchener?departure=1215");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty("id", 15);
    expect(response.body[0]).toHaveProperty("line", "Kitchener");
    expect(response.body[0]).toHaveProperty("departure", 1215);
    expect(response.body[0]).toHaveProperty("arrival", 1300);
  });
  it("should return the record for the specified line and departure time in 12 hours format", async () => {
    const response = await request(app).get("/schedule/Lakeshore?departure=4:00pm");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty("id", 5);
    expect(response.body[0]).toHaveProperty("line", "Lakeshore");
    expect(response.body[0]).toHaveProperty("departure", 1600);
    expect(response.body[0]).toHaveProperty("arrival", 1700);
  });

  it("should return an empty array if no trains depart at the specified time", async () => {
    const response = await request(app).get("/schedule/Lakeshore?departure=0700");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it("should return 404 if the line does not exist", async () => {
    const response = await request(app).get("/schedule/InvalidLine?departure=1215");
    expect(response.status).toBe(404);
  });

  it("should return 400 if the departure time is invalid", async () => {
    const response = await request(app).get("/schedule/Lakeshore?departure=invalid");
    expect(response.status).toBe(400);
  });
});
