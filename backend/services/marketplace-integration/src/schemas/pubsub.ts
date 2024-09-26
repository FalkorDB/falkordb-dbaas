import { type Static, Type } from '@sinclair/typebox';

export const PubSubMessageSchema = Type.Object({
  message: Type.Object({
    data: Type.String(),
  }),
});

export type PubSubMessageType = Static<typeof PubSubMessageSchema>;
