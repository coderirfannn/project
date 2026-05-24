import { model, models, type InferSchemaType, type Model, type Schema } from 'mongoose';

export function getOrCreateModel<TSchema extends Schema>(
  name: string,
  schema: TSchema,
  collectionName?: string,
): Model<InferSchemaType<TSchema>> {
  return (
    (models[name] as Model<InferSchemaType<TSchema>> | undefined) ??
    (model(name, schema, collectionName) as Model<InferSchemaType<TSchema>>)
  );
}
