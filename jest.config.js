const path = require("path");

module.exports = {
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  roots: ["<rootDir>"],
  testMatch: [
    path.join("<rootDir>", "src", "**", "*.(test|spec).(js|jsx|ts|tsx)"),
  ],
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": "ts-jest" },
  transformIgnorePatterns: ["node_modules"],
  verbose: true,
};
