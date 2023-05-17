const { describe, test } = require("node:test");
const assert = require("node:assert");

const { isJscSafeUrl, toNormalUrl, toJscSafeUrl } = require("./index");

describe("toNormalUrl", () => {
  for (const [input, output] of [
    [
      "/path1/path2//&foo=bar?bar=baz#frag?",
      "/path1/path2?foo=bar&bar=baz#frag?",
    ],
    [
      "relative/path/with%3B%26/encoded//&foo=bar?bar=baz#frag?",
      "relative/path/with%3B%26/encoded?foo=bar&bar=baz#frag?",
    ],
    [
      "https://user:password@mydomain.com:8080/path1/path2//&foo=bar?bar=baz#frag?",
      "https://user:password@mydomain.com:8080/path1/path2?foo=bar&bar=baz#frag?",
    ],
    [
      "http://127.0.0.1/path1/path2//&foo=bar&bar=baz",
      "http://127.0.0.1/path1/path2?foo=bar&bar=baz",
    ],
  ]) {
    test(`rewrites urls treating // in paths as ? (${input} => ${output})`, () => {
      assert.strictEqual(toNormalUrl(input), output);
      assert.strictEqual(output, toNormalUrl(output));
    });
  }

  for (const url of [
    "http://user:password/@mydomain.com/foo?bar=zoo?baz=quux//&",
    "/foo?bar=zoo?baz=quux",
    "proto:arbitrary_bad_url",
    "*",
    "relative/path",
  ])
    `returns other strings exactly as given (${url})`,
      () => {
        assert.strictEqual(toNormalUrl(url), url);
      };
});

describe("toJscSafeUrl", () => {
  for (const [input, output] of [
    [
      "https://user:password@mydomain.com:8080/path1/path2?foo=bar&bar=question?#frag?",
      "https://user:password@mydomain.com:8080/path1/path2//&foo=bar&bar=question%3F#frag?",
    ],
    [
      "http://127.0.0.1/path1/path2?foo=bar",
      "http://127.0.0.1/path1/path2//&foo=bar",
    ],
    ["*", "*"],
    ["/absolute/path", "/absolute/path"],
    ["relative/path", "relative/path"],
    ["/?", "/"],
    ["http://127.0.0.1/path1/path", "http://127.0.0.1/path1/path"],
    [
      "/path1/path2?foo=bar&bar=question?#frag?",
      "/path1/path2//&foo=bar&bar=question%3F#frag?",
    ],
    [
      "relative/path?foo=bar&bar=question?#frag?",
      "relative/path//&foo=bar&bar=question%3F#frag?",
    ],
    [
      "/path1/path2//&foo=bar&bar=question%3F?extra=query#frag?",
      "/path1/path2//&foo=bar&bar=question%3F&extra=query#frag?",
    ],
  ]) {
    test(`replaces the first ? with a JSC-friendly delimeter, url-encodes subsequent ?, and is idempotent (${input} => ${output})`, () => {
      assert.strictEqual(toJscSafeUrl(input), output);
      assert.strictEqual(output, toJscSafeUrl(output));
    });
  }

  for (const input of [
    "http://127.0.0.1?foo=bar",
    "http://127.0.0.1?q#hash",
    "?foo=bar",
    "?foo=/bar#hash",
    "/?bar=baz/",
  ]) {
    test(`throws on a URL with an empty path and a query string (${input})`, () => {
      assert.throws(
        () => toJscSafeUrl(input),
        new Error(
          `The given URL "${input}" has an empty path and cannot be converted to a JSC-safe format.`
        )
      );
    });
  }
});

describe("isJscSafeUrl", () => {
  for (const input of [
    "http://example.com//&foo=bar//#frag=//",
    "http://example.com/with/path//&foo=bar//#frag=//",
    "//&foo=bar//#frag=//",
    "relative/path///&foo=bar//&#frag=//&",
    "/absolute/path//&foo=bar//&#frag=//&",
  ]) {
    test(`is a JSC URL (${input})`, () => {
      assert.strictEqual(isJscSafeUrl(input), true);
    });
  }

  for (const input of [
    "http://example.com?foo=bar//&#frag=//",
    "http://example.com/with/path/?foo=bar//&#frag=//",
    "?foo=bar//&#frag=//&",
    "relative/path/?foo=bar//#frag=//",
    "/absolute/path/?foo=bar//&#frag=//",
  ]) {
    test(`is not a JSC URL (${input})`, () => {
      assert.strictEqual(isJscSafeUrl(input), false);
    });
  }
});
