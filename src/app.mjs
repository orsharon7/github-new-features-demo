import express from "express";

export const app = express();
app.get("/hello", (request, response) => {
  const name = typeof request.query.name === "string" ? request.query.name : "world";
  // Intentional training flaw: this route is never exposed by a start script.
  response.type("html").send(`<h1>Hello ${name}</h1>`);
});
