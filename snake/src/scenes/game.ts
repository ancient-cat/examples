import { ColorType } from "../core/color";
import console from "../core/console";
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

  const [grid_rows, grid_cols] = [20, 20];

  let grid: GridItem[] = [];

  const unit = 20;

  let fruit: GridItem;

  const draw_grid = () => {
    love.graphics.setColor(grid_color.rgb);

    grid.forEach(({ row, col }) => {
      love.graphics.rectangle("line", row * unit, col * unit, unit, unit);
    });
  };

  const draw_snake = () => {
    love.graphics.setColor(snake_color.rgb);
    snake.forEach((part) => {
      love.graphics.rectangle("fill", part.row * unit + 1, part.col * unit + 1, unit - 2, unit - 2);
    });
  };

  const spawn_fruit = () => {
    let is_empty_cell = false;
    while (!is_empty_cell) {
      const x = math.random(0, grid_rows - 1);
      const y = math.random(0, grid_cols - 1);

      console.log("Attempting spawn at", x, y);

      const match = snake.find((segment) => {
        return segment.col === y && segment.row === x;
      });

      if (match === undefined) {
        is_empty_cell = true;
        fruit = {
          row: x,
          col: y,
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
      snake = [
        {
          row: 3,
          col: 3,
        },
        {
          row: 3,
          col: 4,
        },
        {
          row: 3,
          col: 5,
        },
      ];
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

      if (has_wrapped_self()) {
        game_events.emit("gameover");
      }
      if (x < 0 || x > grid_rows - 1 || y < 0 || y > grid_cols - 1) {
        game_events.emit("gameover");
      }
    },

    draw() {
      love.graphics.setBackgroundColor(bg_color.rgb);
      love.graphics.push();
      love.graphics.translate(unit * 2, unit * 2);
      draw_grid();
      draw_snake();

      love.graphics.setColor(math.random(50, 100) / 100, math.random(50, 100) / 100, math.random(50, 100) / 100);
      love.graphics.rectangle("fill", fruit.row * unit, fruit.col * unit, unit, unit);

      love.graphics.pop();
    },

    update(dt) {},
  };
});
