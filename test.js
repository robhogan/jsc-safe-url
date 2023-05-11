const { describe, test } = require("node:test");
const assert = require("node:assert");

const { normalizeUrl, toJscSafeUrl } = require("./index");

describe("normalizeUrl", () => {
  for (const [input, output] of [
    [
      "/path1/path2;&foo=bar?bar=baz#frag?",
      "/path1/path2?foo=bar&bar=baz#frag?",
    ],
    [
      "relative/path/with%3B%26/encoded;&foo=bar?bar=baz#frag?",
      "relative/path/with%3B%26/encoded?foo=bar&bar=baz#frag?",
    ],
    [
      "https://user;&:password;&@mydomain.com:8080/path1/path2;&foo=bar?bar=baz#frag?",
      "https://user%3B&:password%3B&@mydomain.com:8080/path1/path2?foo=bar&bar=baz#frag?",
    ],
    [
      "http://127.0.0.1/path1/path2;&foo=bar&bar=baz",
      "http://127.0.0.1/path1/path2?foo=bar&bar=baz",
    ],
  ]) {
    test(`rewrites urls treating ;& in paths as ? (${input} => ${output})`, () => {
      assert.strictEqual(normalizeUrl(input), output);
    });
  }

  for (const url of [
    "http://user;&:password;&@mydomain.com/foo?bar=zoo?baz=quux;&",
    "/foo?bar=zoo?baz=quux",
    "proto:arbitrary_bad_url",
    "*",
    "relative/path",
  ])
    `returns other strings exactly as given (${url})`,
      () => {
        assert.strictEqual(normalizeUrl(url), url);
      };
});

describe("toJscSafeUrl", () => {
  for (const [input, output] of [
    [
      "https://user;&:password;&@mydomain.com:8080/path1/path2?foo=bar&bar=question?#frag?",
      "https://user%3B&:password%3B&@mydomain.com:8080/path1/path2;&foo=bar&bar=question%3F#frag?",
    ],
    [
      "http://127.0.0.1/path1/path2?foo=bar",
      "http://127.0.0.1/path1/path2;&foo=bar",
    ],
    ["*", "*"],
    ["/absolute/path", "/absolute/path"],
    ["relative/path", "relative/path"],
    ["http://127.0.0.1/path1/path", "http://127.0.0.1/path1/path"],
    [
      "/path1/path2?foo=bar&bar=question?#frag?",
      "/path1/path2;&foo=bar&bar=question%3F#frag?",
    ],
    [
      "relative/path?foo=bar&bar=question?#frag?",
      "relative/path;&foo=bar&bar=question%3F#frag?",
    ],
    [
      "relative/path/with/;&/delimeter;&?foo=bar&bar=question?#frag?",
      "relative/path/with/%3B%26/delimeter%3B%26;&foo=bar&bar=question%3F#frag?",
    ],
  ]) {
    test(`replaces the first ? with a JSC-friendly delimeter, url-encodes subsequent ? (${input} => ${output})`, () => {
      assert.strictEqual(toJscSafeUrl(input), output);
    });
  }
});
