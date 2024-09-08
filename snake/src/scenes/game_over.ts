import { Scenes } from "../core/scene";
import { game_events } from "../game";

export default Scenes.create(() => {
  return {
    name: "game_over",
    state: undefined,
    update(dt) {},

    keypressed(key) {
      game_events.emit("start");
    },

    draw() {
      const [w, h] = love.graphics.getDimensions();
      love.graphics.setBackgroundColor(0.8, 0, 0, 0.7);

      love.graphics.print("Game Over", w / 2.1, h / 2.1);
    },
  };
});
