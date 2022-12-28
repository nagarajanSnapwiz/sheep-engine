import React, {
  useEffect,
  createContext,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
//@ts-ignore
import Ticker from 'ticker-js';
import { canvasToPhys as c2p, physToCanvas as p2c } from './scale';
import { UserData } from './UserData';
import { usePixiApp } from './usePixiApp';
import { useGlobalBox2d } from './Box2dContextWrapper';
import { Stage, Container, Sprite, render } from '@saitonakamura/react-pixi';

import * as PIXI from 'pixi.js';

type Box2dRefType = {
  world?: Box2D.b2World;
  userDataService: UserData;
  box2d: typeof Box2D & EmscriptenModule;
};

export const Box2dWorldContext =
  createContext<React.MutableRefObject<Box2dRefType | undefined> | null>(null);

export const AppContext = createContext<PIXI.Application | null>(null);

type WorldProps = {
  gravity?: [number, number];
  box2d: typeof Box2D & EmscriptenModule;
  ground?: boolean | number;
  width?: number;
  height?: number;
};

type OffsetRef = React.MutableRefObject<{
  x: number;
  y: number;
}>;

function updateGraphicsPositionFromPhysics(
  body: Box2D.b2Body,
  dataService: UserData,
  offsetRef: OffsetRef,
  recordLeak: <Instance extends Box2D.WrapperObject>(
    instance: Instance,
    b2Class?: typeof Box2D.WrapperObject | undefined
  ) => Instance
) {
  const data = dataService.getData(body);
  const hostRef: React.MutableRefObject<PIXI.DisplayObject | undefined> =
    data?.hostRef;
  const cameraOffset: { x?: number; y?: number } | null = data?.cameraOffset;
  if (hostRef?.current) {
    const { x, y } = recordLeak(body.GetPosition());
    const cx = p2c(x);
    const cy = p2c(y);
    const rotation = body.GetAngle();
    const { x: _x, y: _y } = offsetRef.current;
    if (cameraOffset) {
      //console.log('cameraOffset',{x:cameraOffset.x, diff: (cx - _x) });
      if (cameraOffset.x && cx - _x < cameraOffset.x) {
        //console.log('ofsset change req detected');
        offsetRef.current.x = -(cameraOffset.x - cx);
        //console.log('ofsset change req detected',{diff1: cameraOffset.x - cx,diff2: (cx - _x) });
      }
      if (cameraOffset.y) {
        // offsetRef.current.y = cy - cameraOffset.y;
      }
    }
    const { x: __x, y: __y } = offsetRef.current;

    Object.assign(hostRef.current, {
      x: cx - __x,
      y: cy - __y,
      rotation,
    });
  }
}

const FRAME_RATE = 60;
const PHYSICS_STEP_DELTA = 1 / FRAME_RATE;

const Box2dWorld_ = forwardRef(
  (
    {
      children,
      gravity = [0, 9],
      box2d,
      ground = true,
      width = 800,
      height = 600,
    }: React.PropsWithChildren<WorldProps>,
    ref
  ) => {
    const {
      b2World,
      LeakMitigator,
      destroy,
      b2Vec2,
      b2BodyDef,
      b2FixtureDef,
      b2PolygonShape,
      b2_staticBody,
      getPointer,
      NULL,
    } = box2d;

    const [ready, setReady] = useState(false);

    const domRef = useRef<HTMLDivElement | null>(null);

    const leakMitigatorRef = useRef(new LeakMitigator());
    const box2dRef = useRef<Box2dRefType>({
      world: undefined,
      userDataService: new UserData(box2d),
      box2d,
    });

    const offsetRef = useRef({ x: 0, y: 0 });

    useImperativeHandle(ref, () => ({
      setOffset: (_x: number, _y: number) => {
        if (_x != null) {
          offsetRef.current.x = _x;
        }
        if (_y != null) {
          offsetRef.current.y = _y;
        }
      },
      setRelativeOffset: (_x: number, _y: number) => {
        if (_x != null) {
          offsetRef.current.x += _x;
        }

        if (_y != null) {
          offsetRef.current.y += _y;
        }
      },

      getOffset: () => {
        const { x, y } = offsetRef.current;
        return { x, y };
      },
    }));

    const app = usePixiApp({ width, height, domRef: domRef });

    useEffect(() => {
      if (box2dRef?.current?.world) {
        const gravityVec = new b2Vec2(gravity[0], gravity[1]);
        box2dRef.current.world.SetGravity(gravityVec);
        destroy(gravityVec);
      }
    }, [gravity[0], gravity[1]]);

    /**
     * managing the ground of the world
     */
    useEffect(() => {
      //@ts-ignore
      // window.__box2d = box2d;
      let body: Box2D.b2Body | null = null;
      const { recordLeak, freeLeaked } = leakMitigatorRef.current;
      const gravityV = new b2Vec2(gravity[0], gravity[1]);
      box2dRef.current.world = new b2World(gravityV);
      destroy(gravityV);
      const { world, userDataService } = box2dRef.current;

      let cb: (() => void) | null = null;
      if (ground) {
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
        userDataService.setData(body, { category: '__GROUND___' });
        // body = world.CreateBody(def);
        // userDataService.setData(body, { category: '__GROUN__' });
        // console.log('body-->||==||><',body,{Number: getPointer(body)});
        // console.log('checking 12===->>> for null2',{body,createFixture: body.CreateFixture,rectangleShape, world, width, type: rectangleShape.get_m_type()})
        // recordLeak(body.CreateFixture(rectangleShape, 1));
        recordLeak(body.CreateFixture(rectangleShape, 1));

        cb = () => {
          destroy(rectangleShape);
          destroy(groundPosition);
          destroy(def);
        };
      }

      const ticker = new Ticker(FRAME_RATE);

      const velocityVector = new b2Vec2(0, 0);

      ticker.on('render', () => {
        world.Step(PHYSICS_STEP_DELTA, 8, 3);
        world.ClearForces();
        for (
          let body = recordLeak(world.GetBodyList());
          getPointer(body) !== getPointer(NULL);
          body = recordLeak(body.GetNext())
        ) {
          const data = userDataService.getData(body);

          updateGraphicsPositionFromPhysics(
            body,
            userDataService,
            offsetRef,
            recordLeak
          );

          if (data.linearVelocity) {
            const { x, y } = data.linearVelocity;
            velocityVector.Set(x, y);
            body.SetLinearVelocity(velocityVector);
          }

          if (data?.removed) {
            if (data.hostRef) {
              data.hostRef?.current?.destroy();
            }
            userDataService.deleteData(body);
            world.DestroyBody(body);
          }
        }
        app?.render();
        freeLeaked();
      });

      ticker.start();

      setReady(true);

      return () => {
        destroy(velocityVector);
        ticker.stop();
        ticker.destroy();
        if (cb) {
          cb();
        }
        if (body) {
          // console.log('destoying body..-->........', { body, world });
          //box2dRef.current.userDataService.deleteData(body);
          box2dRef.current.world?.DestroyBody(body);
          userDataService.deleteData(body);
          LeakMitigator.freeFromCache(body);
        }
        freeLeaked();
        destroy(world);
        freeLeaked();
      };
    }, [ground, width, height]);



    return (
      <Box2dWorldContext.Provider value={box2dRef}>
        <AppContext.Provider value={app}>
          <>
            <div ref={domRef}></div>
            {ready ? children : null}
          </>
        </AppContext.Provider>
      </Box2dWorldContext.Provider>
    );
  }
);

const defaultLoading = <h2>Loading...</h2>;
export const Box2dWorld = forwardRef(
  (
    {
      fallback = defaultLoading,
      ...props
    }: Omit<React.PropsWithChildren<WorldProps>, 'box2d'> & {
      fallback?: React.ReactNode;
    },
    ref
  ) => {
    const { ready, box2d } = useGlobalBox2d();
    if (!(ready && box2d)) {
      return <>{fallback}</>;
    }
    return <Box2dWorld_ {...props} box2d={box2d} ref={ref}></Box2dWorld_>;
  }
);
