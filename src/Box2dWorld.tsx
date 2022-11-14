import React, {
  useEffect,
  createContext,
  useRef,
  useLayoutEffect,
  useState,
} from 'react';
//@ts-ignore
import Ticker from 'ticker-js';
import { canvasToPhys as c2p, physToCanvas as p2c } from './scale';
import { UserData } from './UserData';
import { usePixiApp } from './usePixiApp';
import * as PIXI from 'pixi.js';

type Box2dRefType = {
  world?: Box2D.b2World;
  userDataService: UserData;
  box2d: typeof Box2D & EmscriptenModule 
};

export const Box2dWorldContext =
  createContext<React.MutableRefObject<Box2dRefType | undefined> | null>(null);

export const AppContext = createContext<PIXI.Application | null>(null)

type WorldProps = {
  gravity?: [number, number];
  box2d: typeof Box2D & EmscriptenModule;
  ground?: boolean | number;
  width?: number;
  height?: number;
};

function updateGraphicsPositionFromPhysics(
  body: Box2D.b2Body,
  dataService: UserData,
  recordLeak: <Instance extends Box2D.WrapperObject>(
    instance: Instance,
    b2Class?: typeof Box2D.WrapperObject | undefined
  ) => Instance
) {
  const hostRef: React.MutableRefObject<PIXI.DisplayObject | undefined> =
    dataService.getData(body)?.hostRef;
  if (hostRef?.current) {
    const { x, y } = recordLeak(body.GetPosition());
    const rotation = body.GetAngle();
    Object.assign(hostRef.current, { x, y, rotation });
  }
}


const FRAME_RATE = 60;
const PHYSICS_STEP_DELTA = 1 / FRAME_RATE;

export function Box2dWorld({
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
    getPointer,
    NULL,
  } = box2d;

  const domRef = useRef<HTMLDivElement|null>(null);
  

  const leakMitigatorRef = useRef(new LeakMitigator());
  const box2dRef = useRef<Box2dRefType>({
    world: undefined,
    userDataService: new UserData(box2d),
    box2d
  });

  const app = usePixiApp({width,height, domRef: domRef})

  console.log('app',app);


  useEffect(()=>{
    if(box2dRef?.current?.world){
      const gravityVec = new b2Vec2(gravity[0],gravity[1]);
      box2dRef.current.world.SetGravity(gravityVec);
      destroy(gravityVec);
    }
  },[gravity[0], gravity[1]]);

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
      userDataService.setData(body, { category: '__GROUND__' });
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

    ticker.on('render', () => {
      world.Step(PHYSICS_STEP_DELTA, 8, 3);
      world.ClearForces();
      for (
        let body = recordLeak(world.GetBodyList());
        getPointer(body) !== getPointer(NULL);
        body = recordLeak(body.GetNext())
      ) {
        updateGraphicsPositionFromPhysics(body, userDataService, recordLeak);
        const data = userDataService.getData(body);
        if(data.removed){
          world.DestroyBody(body);
        }
      }
      freeLeaked();
    });

    ticker.start();

    return () => {
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
      {children}
      </>
      </AppContext.Provider>
    </Box2dWorldContext.Provider>
  );
}
