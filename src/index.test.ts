import { jest, beforeAll, test, expect } from "@jest/globals";
import os from "os";
import path from "path";
import fs from "fs-extra";
import execa from "execa";

jest.setTimeout(300_000);

const caxaDirectory = path.join(os.tmpdir(), "caxa");
const testsDirectory = path.join(caxaDirectory, "tests");
beforeAll(async () => {
  await fs.remove(caxaDirectory);
});

test("echo-command-line-parameters", async () => {
  const output = path.join(
    testsDirectory,
    `echo-command-line-parameters${process.platform === "win32" ? ".exe" : ""}`
  );
  await execa("ts-node", [
    "src/index.ts",
    "--input",
    "examples/echo-command-line-parameters",
    "--output",
    output,
    "--",
    "{{caxa}}/node_modules/.bin/node",
    "{{caxa}}/index.js",
    "some",
    "embedded arguments",
    "--an-option-thats-part-of-the-command",
  ]);
  expect(
    (
      await execa(output, ["and", "some arguments passed on the call"], {
        all: true,
      })
    ).all
  ).toMatchInlineSnapshot(`
    "[
      \\"some\\",
      \\"embedded arguments\\",
      \\"--an-option-thats-part-of-the-command\\",
      \\"and\\",
      \\"some arguments passed on the call\\"
    ]"
  `);
});

if (process.platform === "darwin")
  test("Echo Command Line Parameters.app", async () => {
    const output = path.join(
      testsDirectory,
      "Echo Command Line Parameters.app"
    );
    await execa("ts-node", [
      "src/index.ts",
      "--input",
      "examples/echo-command-line-parameters",
      "--output",
      output,
      "--",
      "{{caxa}}/node_modules/.bin/node",
      "{{caxa}}/index.js",
      "some",
      "embedded arguments",
    ]);
    console.log(
      `Test the macOS Application Bundle (.app) manually:\n$ open -a "${output}"`
    );
    expect(
      (
        await execa(
          path.join(output, "/Contents/Resources/Echo Command Line Parameters"),
          {
            all: true,
          }
        )
      ).all
    ).toMatchInlineSnapshot(`
      "[
        \\"some\\",
        \\"embedded arguments\\"
      ]"
    `);
  });

test("native-modules", async () => {
  const output = path.join(
    testsDirectory,
    `native-modules${process.platform === "win32" ? ".exe" : ""}`
  );
  await execa("npm", ["install"], { cwd: "examples/native-modules" });
  await execa("ts-node", [
    "src/index.ts",
    "--input",
    "examples/native-modules",
    "--output",
    output,
    "--",
    "{{caxa}}/node_modules/.bin/node",
    "{{caxa}}/index.js",
  ]);
  expect((await execa(output, { all: true })).all).toMatchInlineSnapshot(`
    "@leafac/sqlite: {
      \\"example\\": \\"caxa native modules\\"
    }
    sharp: 48"
  `);
});

test("false", async () => {
  const output = path.join(
    testsDirectory,
    `false${process.platform === "win32" ? ".exe" : ""}`
  );
  await execa("ts-node", [
    "src/index.ts",
    "--input",
    "examples/false",
    "--output",
    output,
    "--",
    "{{caxa}}/node_modules/.bin/node",
    "{{caxa}}/index.js",
  ]);
  await expect(execa(output)).rejects.toThrowError(
    "Command failed with exit code 1"
  );
});
