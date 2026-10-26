import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { app } from "../src/app.mjs";

test("untrusted markup is rendered as text rather than HTML", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const name = encodeURIComponent("<b>Demo</b>");
  const response = await fetch(`http://127.0.0.1:${server.address().port}/hello?name=${name}`);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.ok(!body.includes("<b>Demo</b>"), "User-provided markup must not become an HTML element");
  assert.match(body, /&lt;b&gt;Demo&lt;\/b&gt;/u);
});
