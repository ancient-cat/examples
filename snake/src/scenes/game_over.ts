import console from "../core/console";
import { Scenes } from "../core/scene";
import { GameTime } from "../core/systems/gametime";
import { game_events } from "../game";
import { flux, type Tween } from "flux";

export default Scenes.create(() => {
  let bg = {
    r: 1,
    g: 0,
    b: 0,
    a: 0.1,
  };

  let game_over_text = {
    font: love.graphics.newFont(32),
    text: "You Died",
    x: -100,
    y: 200,
  };

  const [text_w, text_h] = love.graphics.newText(game_over_text.font, game_over_text.text).getDimensions();

  let bg_tween: Tween;
  let game_over_tween: Tween;

  let show_message = false;
  let allow_restart = false;

  return {
    name: "game_over",
    state: undefined,
    update(dt) {},
    enter: async () => {
      bg = {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      };

      bg_tween = flux.to(bg, 1, {
        a: 80,
      });

      const [w, h] = love.graphics.getDimensions();

      game_over_tween = flux.to(game_over_text, 1, {
        x: w / 2 - text_w / 2,
        y: h / 2 - text_h / 2,
      });

      GameTime.wait(500).then(() => {
        allow_restart = true;
      });

      GameTime.wait(1200).then(() => {
        show_message = true;
      });
    },

    keypressed(key) {
      if (allow_restart) {
        game_events.emit("restart");
      }
    },

    draw() {
      const [w, h] = love.graphics.getDimensions();

      love.graphics.setColor(bg.r, bg.g, bg.b, bg.a / 100);
      love.graphics.rectangle("fill", 0, 0, w, h);

      love.graphics.setColor(1, 1, 1, 1);
      love.graphics.setFont(game_over_text.font);
      love.graphics.push();
      love.graphics.translate(game_over_text.x, game_over_text.y);
      love.graphics.printf(game_over_text.text, 0, 0, text_w, "center");
      if (show_message) {
        love.graphics.setFont(love.graphics.newFont(16));
        love.graphics.printf("Press any key to retry", 0, 40, text_w, "center");
      }

      love.graphics.pop();
    },
  };
});
