import { describe, expect, it } from "vitest";
import { renderUrl } from "./url";

describe("urls", () => {
  it("should render url with version", () => {
    const url = "https://example.com/{{version}}";
    const version = "1.0.0";
    const renderedUrl = renderUrl(url, { version });
    expect(renderedUrl).toBe("https://example.com/1.0.0");
  });
});
