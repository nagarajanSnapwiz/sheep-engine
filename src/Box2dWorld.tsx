import { useEffect, createContext, useRef } from 'react';
import { useGlobalBox2d } from './Box2dContextWrapper';
import { canvasToPhys as c2p, physToCanvas as p2c } from './scale';

export const Box2dWorldContext = createContext<React.MutableRefObject<
  Box2D.b2World | undefined
> | null>(null);

type WorldProps = {
  gravity?: [number, number];
  box2d: typeof Box2D;
  ground?: boolean | number;
  width?: number;
  height?: number;
};

export function Box2dWorld ({
  children,
  gravity = [0, 9],
  box2d,
  ground = true,
  width = 800,
  height = 600,
}: React.PropsWithChildren<WorldProps>) {
  const {
    b2World,
    LeakMitigator,
    destroy,
    b2Vec2,
    b2BodyDef,
    b2FixtureDef,
    b2PolygonShape,
    b2_staticBody,
  } = box2d;

  const leakMitigatorRef = useRef(new LeakMitigator());
  const gravityRef = useRef(new b2Vec2(0, 0));
  const box2dWorldRef = useRef<Box2D.b2World>(new b2World(gravityRef.current));

  useEffect(() => {
    gravityRef.current.Set(gravity[0], gravity[1]);
    box2dWorldRef.current.SetGravity(gravityRef.current);
  }, [gravity[0], gravity[1]]);

  /**
   * managing the ground of the world 
   */
  useEffect(() => {
    let body: Box2D.b2Body | null = null;
    const { recordLeak, freeLeaked } = leakMitigatorRef.current;
    if (ground) {
      const world = box2dWorldRef.current;

      const rectangleShape = new b2PolygonShape();
      const visibleGround = typeof ground === 'number';
      const groundHeight = visibleGround ? ground : 3;
      rectangleShape.SetAsBox(c2p(width), c2p(groundHeight));
      const groundPosition = new b2Vec2(
        c2p(width / 2),
        visibleGround
          ? c2p(height - groundHeight / 2)
          : c2p(height + groundHeight / 2)
      );

      const def = new b2BodyDef();
      def.set_type(b2_staticBody);
      def.set_position(groundPosition);
      body = recordLeak(world.CreateBody(def));
      recordLeak(body.CreateFixture(rectangleShape, 1));
      destroy(rectangleShape);
      destroy(groundPosition);
      destroy(def);
    }

    return () => {
      if (body) {
        LeakMitigator.freeFromCache(body);
      }
      freeLeaked();
    };
  }, [ground, width, height]);

  useEffect(() => {
    //all cleanup
    return () => {
      destroy(gravityRef.current);
      destroy(box2dWorldRef.current);
      leakMitigatorRef.current.freeLeaked();
    };
  }, []);

  return (
    <Box2dWorldContext.Provider value={box2dWorldRef}>
      {children}
    </Box2dWorldContext.Provider>
  );
}
