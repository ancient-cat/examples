import { ColorType } from "../core/color";
import { Scenes } from "../core/scene";
import { game_events } from "../game";

type GridItem = {
  row: number;
  col: number;
};

type SnakePart = {
  row: number;
  col: number;
};

export default Scenes.create(() => {
  const bg_color = new ColorType(0, 0, 0);
  const grid_color = new ColorType(0, 0, 70);
  const snake_color = new ColorType(0, 0, 100);

  let snake: SnakePart[] = [];

  const [grid_rows, grid_cols] = [6, 6];

  let grid: GridItem[] = [];

  const unit = 20;
  let collected_fruit: number = 0;
  let max_fruit = 0;
  let has_won = false;

  let fruit: GridItem & { color: ColorType };

  const draw_grid = () => {
    love.graphics.setColor(...grid_color.rgb);

    grid.forEach(({ row, col }) => {
      love.graphics.rectangle("line", row * unit, col * unit, unit, unit);
    });
  };

  const draw_snake = () => {
    love.graphics.setColor(...snake_color.rgb);
    snake.forEach((part, i) => {
      const c: [number, number, number, number] = [...snake_color.rgb];
      c[3] = math.max(0.5, snake.length / i);
      love.graphics.setColor(...c);
      love.graphics.rectangle("fill", part.row * unit + 1, part.col * unit + 1, unit - 2, unit - 2);
    });
  };

  const spawn_fruit = () => {
    let is_empty_cell = false;

    // this while loop would crash it if we won
    // rewriting it to not randomly find an empty spot endlessly is preferred, tbh
    // but being lazy
    if (snake.length === max_fruit) {
      return;
    }

    while (!is_empty_cell) {
      const x = math.random(0, grid_rows - 1);
      const y = math.random(0, grid_cols - 1);

      const match = snake.find((segment) => {
        return segment.col === y && segment.row === x;
      });

      if (match === undefined) {
        is_empty_cell = true;
        fruit = {
          row: x,
          col: y,
          color: new ColorType(math.random(0, 360), 90, 60),
        };
      }
    }
  };

  const move_snake = (x: number = 0, y: number = 0): readonly [row: number, col: number] => {
    const head = snake.at(0)!;

    const new_snake = snake.map((part, i) => {
      const segment = { ...part };
      if (i === 0) {
        segment.row = head.row + x;
        segment.col = head.col + y;
      } else {
        const prior = snake[i - 1];
        segment.row = prior.row;
        segment.col = prior.col;
      }
      return segment;
    });

    const new_head = new_snake.at(0)!;

    let should_spawn_fruit = false;
    if (new_head.row === fruit.row && new_head.col === fruit.col) {
      collected_fruit += 1;

      if (collected_fruit === max_fruit) {
        has_won = true;
      }

      should_spawn_fruit = true;
      const last_piece = snake.at(-1);
      if (last_piece) {
        new_snake.push({ ...last_piece });
      }
    }

    snake = new_snake;

    if (should_spawn_fruit) {
      spawn_fruit();
    }

    return [new_head.row, new_head.col];
  };

  const has_wrapped_self = () => {
    const head = snake.at(0)!;

    const overlaps =
      snake.find((segment, i) => segment !== head && segment.row === head.row && segment.col === head.col) !==
      undefined;

    return overlaps;
  };

  return {
    name: "game",

    state: undefined,

    init: () => {
      for (let row_index = 0; row_index < grid_rows; row_index++) {
        for (let col_index = 0; col_index < grid_cols; col_index++) {
          grid.push({
            row: row_index,
            col: col_index,
          });
        }
      }
    },

    enter: () => {
      has_won = false;
      collected_fruit = 0;
      snake = [
        {
          row: 3,
          col: 0,
        },
        {
          row: 2,
          col: 0,
        },
        {
          row: 1,
          col: 0,
        },
      ];
      max_fruit = grid_rows * grid_cols - snake.length;
      spawn_fruit();
    },

    keypressed(key, scancode, isrepeat) {
      const pressed = {
        up: key === "up",
        down: key === "down",
        left: key === "left",
        right: key === "right",
      };

      let x: number, y: number;
      if (pressed.up) {
        [x, y] = move_snake(0, -1);
      } else if (pressed.down) {
        [x, y] = move_snake(0, 1);
      } else if (pressed.left) {
        [x, y] = move_snake(-1, 0);
      } else if (pressed.right) {
        [x, y] = move_snake(1, 0);
      } else {
        return;
      }

      if (has_won) {
        game_events.emit("win");
        return;
      }

      if (has_wrapped_self()) {
        game_events.emit("gameover");
      }
      if (x < 0 || x > grid_rows - 1 || y < 0 || y > grid_cols - 1) {
        game_events.emit("gameover");
      }
    },

    draw() {
      love.graphics.setBackgroundColor(...bg_color.rgb);
      love.graphics.push();
      const grid_width = grid_rows * unit;
      const grid_height = grid_cols * unit;
      const [w, h] = love.graphics.getDimensions();
      const x_margin = (w - grid_width) / 2;
      const y_margin = (h - grid_height) / 2;
      love.graphics.translate(x_margin, y_margin);
      draw_grid();
      draw_snake();

      love.graphics.setColor(...fruit.color.rgb);

      love.graphics.rectangle("fill", fruit.row * unit + 2, fruit.col * unit + 2, unit - 4, unit - 4);

      love.graphics.pop();
    },

    update(dt) {},
  };
});
