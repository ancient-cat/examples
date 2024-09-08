import { initialize } from "./core/framework";

import console from "./core/console";
import { Scenes } from "./core/scene";

import { game_events } from "./game";

import { GameTime } from "./core/systems/gametime";
import { flux } from "flux";
import main_menu from "./scenes/main_menu";
import game from "./scenes/game";
import game_over from "./scenes/game_over";

math.randomseed(os.clock());
love.load = (arg: string[]) => {
  Scenes.switch(main_menu);

  game_events.on("quit", () => {
    love.event.quit();
  });

  game_events.on("gameover", () => {
    console.log("GAME OVER");
    Scenes.switch(game_over);
  });

  game_events.on("start", () => {
    console.log("Starting game...");
    // Start here
    Scenes.switch(game);
  });
};

// Global Update things happen here
love.update = (dt: number) => {
  GameTime.update(dt);
  Scenes.update(dt);
  flux.update(dt);
};

love.keypressed = (key, scancode, isrepeat) => {
  if (key === "escape") {
    game_events.emit("quit");
  }
};

initialize();
