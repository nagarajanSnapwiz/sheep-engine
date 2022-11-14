import * as PIXI from 'pixi.js';

type DrawFunction = (obj: PIXI.Graphics) => PIXI.Graphics;
type DrawingOptions = {
  strokeWidth?: number;
  strokeColor?: string;
  strokeAplha?: number;
  fillColor?: string;
};
type SimpleShapeArgs = {
  drawFunction: DrawFunction;
  app: PIXI.Application;
} & DrawingOptions;

function createSimpleShapeSprite({
  drawFunction,
  strokeAplha = 1,
  strokeColor = '0x0',
  strokeWidth = 1,
  fillColor,
  app
}: SimpleShapeArgs) {
  let graphics = new PIXI.Graphics();
  if (strokeWidth || strokeAplha || strokeColor) {
    graphics.lineStyle(
      strokeWidth,
      PIXI.utils.string2hex(strokeColor),
      strokeAplha
    );
  }
  if (fillColor) {
    graphics.beginFill(PIXI.utils.string2hex(fillColor));
  }
  graphics = drawFunction(graphics);
  if (fillColor) {
    graphics.endFill();
  }

  let image: HTMLImageElement | null = null;
  let sprite: PIXI.Sprite | null = null;

  image = app.renderer.plugins.extract.image(graphics);

  sprite = PIXI.Sprite.from(image!);
  graphics.destroy();

  return sprite;
}

export type RectangleArgs = {
  width: number;
  height: number;
} & Omit<SimpleShapeArgs, 'drawFunction'>;

type EllipseArgs = {
  width: number;
  height: number;
} & Omit<SimpleShapeArgs, 'drawFunction'>;

export type CircleArgs = {
  radius: number;
} & Omit<SimpleShapeArgs, 'drawFunction'>;

export function createRectangle({ width, height, ...options }: RectangleArgs) {
  return createSimpleShapeSprite({
    ...options,
    drawFunction: (obj: PIXI.Graphics) => {
      return obj.drawRect(0, 0, width, height);
    },
  });
}

export function createEllipse({ width, height, ...options }: EllipseArgs) {
  return createSimpleShapeSprite({
    drawFunction: (obj: PIXI.Graphics) => {
      return obj.drawEllipse(0, 0, width, height);
    },
    ...options,
  });
}

export function createCircle({ radius, ...options }: CircleArgs) {
  const width = radius * 2;
  const height = radius * 2;
  return createEllipse({ width, height, ...options });
}
