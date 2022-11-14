

export class UserData {
    box2d: typeof Box2D;
    hashMap: Map<number, any>;
    constructor(box2d: typeof Box2D, ){
        this.box2d = box2d;
        this.hashMap = new Map<number,any>();
    }

    setData(body: Box2D.b2Body,data:any){
        this.hashMap.set(this.box2d.getPointer(body),data);
    }

    updateData(body:Box2D.b2Body, partial: any ){
        const key = this.box2d.getPointer(body);
        const oldData = this.hashMap.get(key)||{};
        this.hashMap.set(key, {...oldData, ...partial})
    }

    getData(body: Box2D.b2Body){
        return this.hashMap.get(this.box2d.getPointer(body));
    }

    deleteData(body: Box2D.b2Body){
        return this.hashMap.delete(this.box2d.getPointer(body));
    }
}