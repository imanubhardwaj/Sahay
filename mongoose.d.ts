declare module "mongoose" {
  export namespace Types {
    class ObjectId {
      constructor(id?: string | number | Buffer | unknown);
      toString(): string;
    }
  }
  export function connect(uri: string, options?: object): Promise<unknown>;
  const mongoose: {
    Types: typeof Types;
    connect: typeof connect;
    connection: object;
    Schema: new (definition?: object, options?: object) => object;
    model: (name: string, schema?: object) => object;
    models: Record<string, object>;
    [key: string]: unknown;
  };
  export = mongoose;
}
