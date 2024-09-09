import { initialize } from "./core/framework";

import console from "./core/console";
import { Scenes } from "./core/scene";

import { game_events } from "./game";

import { GameTime } from "./core/systems/gametime";
import { flux } from "flux";
import main_menu from "./scenes/main_menu";
import game from "./scenes/game";
import game_over from "./scenes/game_over";
import tween_test from "./core/test_scenes/tween_test";

math.randomseed(os.clock());
love.load = (arg: string[]) => {
  Scenes.switch(main_menu);

  game_events.on("quit", () => {
    love.event.quit();
  });

  game_events.on("gameover", () => {
    Scenes.push(game_over, {
      draw: true,
      handlers: false,
      update: false,
    });
  });

  game_events.on("start", () => {
    Scenes.switch(game);
  });

  game_events.on("win", () => {
    console.log("You win");
    // where to continue here:
    // create a won_game scene,
    // add the ability to "next level", with a larger grid size
  });

  game_events.on("restart", () => {
    Scenes.pop(); // clear game over state
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
