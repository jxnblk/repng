const test = require("ava");
const React = require("react");
const isStream = require("is-stream");
const repng = require("./index");

// fixture
const Grid = ({ width = 256, height = 256, size = 2 }) => {
  const rects = Array.from({ length: 32 / size }).map((n, y) =>
    Array.from({ length: 32 / size }).map((n, x) =>
      React.createElement("rect", {
        width: size,
        height: size,
        fill: x % 2 === (y % 2 ? 1 : 0) ? "black" : "transparent",
        x: size * x,
        y: size * y,
      })
    )
  );

  return React.createElement(
    "svg",
    {
      viewBox: "0 0 32 32",
      width,
      height,
    },
    rects
  );
};

test("is a function", (t) => {
  t.is(typeof repng, "function");
});

test("returns a stream", async (t) => {
  const width = 128;
  const height = width;

  const result = await repng(Grid, {
    width,
    height,
    props: {
      width,
      height,
    },
  });

  t.true(Buffer.isBuffer(result));
});
