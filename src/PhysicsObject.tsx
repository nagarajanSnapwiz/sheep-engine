import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useContext,
  forwardRef,
} from 'react';
import * as PIXI from 'pixi.js';

import { Box2dWorldContext, AppContext } from './Box2dWorld';

import { canvasToPhys } from './scale';
import {
  RectangleArgs,
  CircleArgs,
  createCircle,
  createRectangle,
} from './CreateSimpleShapeSprite';

const DEGTORAD = 0.0174532925199432957;

type PhysicsObjectArgs = {
  type: 'static' | 'dynamic' | 'kinematic';
  restitution?: number;
  bounciness?: number;
  friction?: number;
  density?: number;
  shape: 'rectangle' | 'circle';
  data?: any;
  width?: number;
  height?: number;
  radius?: number;
  strokeWidth?: number;
  bullet?: boolean;
  x?: number;
  y?: number;
  angle?: number;
  initialForce?: [number, number];
  allowSleep?: boolean;
};

export function usePhysicsObject({
  restitution = 0,
  type = 'dynamic',
  friction = 0.5,
  density = 1,
  allowSleep = true,
  strokeWidth = 0,
  shape,
  data,
  width,
  height,
  x = 0,
  y = 0,
  initialForce,
  bullet,
  radius,
  angle = 0,
}: PhysicsObjectArgs) {
  const box2dRef = useContext(Box2dWorldContext);

  const physRef = useRef<Box2D.b2Body>();
  const hostRef = useRef<PIXI.DisplayObject>();

  useEffect(() => {
    const itemsToBeDestroyed: any[] = [];
    const world = box2dRef?.current?.world!;
    const box2d = box2dRef?.current?.box2d!;
    const userDataService = box2dRef?.current?.userDataService!;
    const {
      b2BodyDef,
      LeakMitigator,
      destroy,
      b2_staticBody,
      b2_dynamicBody,
      b2_kinematicBody,
      b2FixtureDef,
      b2PolygonShape,
      b2CircleShape,
      b2Vec2,
    } = box2d;
    const leakMitigator = new LeakMitigator();
    const { freeLeaked, recordLeak } = leakMitigator;
    const bodyDef = new b2BodyDef();
    itemsToBeDestroyed.push(bodyDef);
    if (type === 'dynamic') {
      bodyDef.type = b2_dynamicBody;
    } else if (type === 'kinematic') {
      bodyDef.type = b2_kinematicBody;
    } else if (type === 'static') {
      bodyDef.type = b2_staticBody;
    }

    const fixDef = new b2FixtureDef();
    itemsToBeDestroyed.push(fixDef);
    Object.assign(fixDef, { density, friction, restitution });
    bodyDef.position.x = canvasToPhys(x);
    bodyDef.position.y = canvasToPhys(y);
    const body = world.CreateBody(bodyDef);
    if (data) {
      userDataService.setData(body, data);
    }

    if (shape === 'rectangle') {
      if (!height) {
        throw new Error('height is required for rectangle shape');
      }
      if (!width) {
        throw new Error('width is required for rectangle shape');
      }
      const shape = new b2PolygonShape();
      itemsToBeDestroyed.push(shape);
      shape.SetAsBox(
        canvasToPhys((width + strokeWidth) / 2),
        canvasToPhys((height + strokeWidth) / 2)
      );
      fixDef.shape = shape;
    } else if (shape === 'circle') {
      if (!radius) {
        throw new Error('radius is required for circle shape');
      }
      const shape = new b2CircleShape();
      itemsToBeDestroyed.push(shape);
      shape.set_m_radius(canvasToPhys(radius + strokeWidth));
      fixDef.shape = shape;
    }

    recordLeak(body.CreateFixture(fixDef));

    if (bullet) {
      body.SetBullet(true);
    }
    body.SetSleepingAllowed(allowSleep);

    if (initialForce && type === 'dynamic') {
      const forceVector = new b2Vec2(initialForce[0], initialForce[1]);
      body.ApplyForceToCenter(forceVector, true);
      destroy(forceVector);
    }
    physRef.current = body;
    userDataService.updateData(body, { hostRef });

    return () => {
      //userDataService.deleteData(body);
      itemsToBeDestroyed.forEach((x) => destroy(x));
      //world.DestroyBody(body);

      userDataService.updateData(body, { removed: true });

      freeLeaked();
    };
  }, []);

  useEffect(() => {
    if (type === 'static' && physRef.current) {
      const box2d = box2dRef?.current?.box2d!;
      const { b2Vec2, destroy } = box2d;
      const positionVector = new b2Vec2(x, y);
      physRef.current.SetTransform(positionVector, angle * DEGTORAD);
      destroy(positionVector);
    }
  }, [x, y, angle]);

  return { physRef, hostRef };
}

type SpriteProps = {
  from?: string | PIXI.Texture;
};

type SimpleShapeProps = {
  simpleShape?: boolean;
} & (Partial<RectangleArgs> & Partial<CircleArgs>);

type PhysicsObjectProps = {
  shape: 'circle' | 'rectangle';
} & (SpriteProps & SimpleShapeProps) &
  PhysicsObjectArgs;

export const PhysicsObject = forwardRef(
  ({ simpleShape, from, ...props }: Omit<PhysicsObjectProps, 'app'>, ref) => {
    const box2dRef = useContext(Box2dWorldContext);
    const { b2Vec2, destroy } = box2dRef?.current?.box2d!;
    const { physRef, hostRef } = usePhysicsObject(props);

    const { shape } = props;

    const app = useContext(AppContext)!;

    useImperativeHandle(ref, () => ({
      body: physRef,
      applyForce: ({ x, y }: { x: number; y: number }) => {
        const body = physRef.current;
        if (body) {
          const forceVector = new b2Vec2(x, y);
          body.ApplyForce(forceVector, body.GetWorldCenter(), true);
          destroy(forceVector);
        }
      },
      applyImpulse: ({ x, y }: { x: number; y: number }) => {
        const body = physRef.current;
        if (body) {
          const forceVector = new b2Vec2(x, y);
          body.ApplyLinearImpulse(forceVector, body.GetWorldCenter(), true);
          destroy(forceVector);
        }
      },
    }));

    useEffect(() => {
      let image: PIXI.Sprite | null = null;
      console.log('physObject eff', { simpleShape, shape });
      if (from) {
        image = PIXI.Sprite.from(from);
      } else if (simpleShape) {
        if (shape === 'circle') {
          //@ts-ignore
          image = createCircle({ ...props, app });
        } else if (shape === 'rectangle') {
          //@ts-ignore
          image = createRectangle({ ...props, app });
          console.log('image creating', image);
        } else {
          throw new Error('Unknown Shape');
        }
      }

      if (image) {
        console.log('image created', image);
        image.anchor.set(0.5);
        hostRef.current = image;
        app.stage.addChild(image);
      }

      return () => {
        if (image) {
          //image.destroy(true);
        }
      };
    }, []);

    return null;
  }
);
