import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { app } from "../src/app.mjs";

test("greeting retains its expected text", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/hello?name=Demo`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "<h1>Hello Demo</h1>");
});
