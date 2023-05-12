## `jsc-safe-url`

JavaScriptCore santizes source URLs in error stacks by stripping query strings and fragments. Ref: [`Webkit/Webkit#49109d`](https://github.com/WebKit/WebKit/commit/49109db4ab87a715f7a8987c7ee380e63060298b).

This package contains utility functions required to implement the proposed [React Native Community RFC0646](https://github.com/react-native-community/discussions-and-proposals/pull/646). It exports two functons:

## `function toJscSafeUrl(urlToConvert: string): string`
Accepts an absolute or relative URL, and encodes any data in the input query string (if present) into the [path component](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) of the URL, by using the reserved character sequence `;&` to separate the original path from the orignal query string. Throws if the input cannot be parsed as a URL.

```
toJscSafeUrl('https://example.com/path?foo=bar#fragment') 
// 'https://example.com/path;&foo=bar#fragment'
```


## `function normalizeUrl(urlToNormalize: string): string`
Accepts an absolute or relative URL, and replaces the first unencoded `;&` in the [path component](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) with `?`. (Effectively the reverse of `toJscSafeUrl`.) Throws if the input cannot be parsed as a URL.

```
normalizeUrl('https://example.com/path;&foo=bar#fragment') 
// 'https://example.com/path?foo=bar#fragment'
```