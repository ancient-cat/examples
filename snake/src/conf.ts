import type { Config } from "love";

love.conf = (config: Config) => {
  config.window.title = "Snake";
  config.console = true;
  config.window.resizable = false;
};
