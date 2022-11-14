import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { Box2dWorldContext, AppContext } from './Box2dWorld';
import * as PIXI from 'pixi.js';

type DrawFunction = (obj: PIXI.Graphics) => PIXI.Graphics;
type DrawingOptions = {
  strokeWidth?: number;
  strokeColor?: string;
  strokeAplha?: number;
  fillColor?: string;
};
type SimpleShapeProps = {
  drawFunction: DrawFunction;
} & DrawingOptions &
  Partial<PIXI.DisplayObject>;


export const SimpleShape = forwardRef(
  (
    {
      drawFunction,
      strokeAplha = 1,
      strokeColor = '0x0',
      strokeWidth = 1,
      fillColor,
      ...displayProps
    }: SimpleShapeProps,
    ref
  ) => {
    const app = useContext(AppContext);
    const spriteRef = useRef<PIXI.Sprite>();

    useImperativeHandle(ref, () => ({
      getTexture: () => spriteRef.current,
    }));

    useEffect(() => {
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
      let image: HTMLImageElement | null = null;
      let sprite: PIXI.Sprite | null = null;
      if (app?.renderer) {
        image = app.renderer.plugins.extract.image(graphics);
        
        sprite = PIXI.Sprite.from(image!);
        if(ref){
            (ref as React.MutableRefObject<PIXI.Sprite|null>).current = sprite;
        }
        spriteRef.current = sprite;

        app.stage.addChild(sprite);
        Object.assign(sprite, displayProps);
        
      } else {
        console.warn('rederer a=not available', app);
      }
      if (fillColor) {
        graphics.endFill();
      }

      graphics.destroy();

      return () => {
        // if(graphics){
        //     graphics.destroy();
        // }
        //app?.renderer?.plugins?.extract?.destroy();
        if (spriteRef.current) {
          spriteRef.current.destroy(true);
        }
        if (image) {
          image.remove();
        }
      };
    }, [drawFunction, strokeAplha, strokeColor, strokeWidth, fillColor, app]);

    return null;
  }
);

type RectangleProps = {
  width: number;
  height: number;
} & Omit<SimpleShapeProps, 'drawFunction'>;

export const Rectangle = forwardRef(({ width, height, ...options }: RectangleProps, ref) => {
  const drawFunction = useCallback(
    (obj: PIXI.Graphics) => {
      return obj.drawRect(0, 0, width, height);
    },
    [width, height]
  );

  return <SimpleShape ref={ref} {...options} drawFunction={drawFunction} />;
});

type EllipseProps = {
  width: number;
  height: number;
} & Omit<SimpleShapeProps, 'drawFunction'>;

export function Ellipse({ width, height, ...options }: EllipseProps) {
  const drawFunction = useCallback(
    (obj: PIXI.Graphics) => {
      return obj.drawEllipse(0, 0, width, height);
    },
    [width, height]
  );

  return <SimpleShape {...options} drawFunction={drawFunction} />;
}

type CircleProps = {
  radius: number;
} & Omit<SimpleShapeProps, 'drawFunction'>;

export function Circle({ radius, ...options }: CircleProps) {
  return <Ellipse {...options} width={radius * 2} height={radius * 2} />;
}
