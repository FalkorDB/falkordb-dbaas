import { type Static, Type } from '@sinclair/typebox';

export const ImportRDBRequestUploadURLRequestBodySchema = Type.Object({
  instanceId: Type.String(),
  username: Type.Optional(Type.String({
    pattern: "^[a-zA-Z0-9._-]+$",
  })),
  password: Type.Optional(Type.String({
    pattern: "^[a-zA-Z0-9._!\@\#\$\%\^\&\*]+$"
  })),
});

export type ImportRDBRequestUploadURLRequestBody = Static<typeof ImportRDBRequestUploadURLRequestBodySchema>;

export const ImportRDBRequestUploadURLResponseBodySchema = Type.Object({
  taskId: Type.String(),
  uploadUrl: Type.String(),
});
export type ImportRDBRequestUploadURLResponseBody = Static<typeof ImportRDBRequestUploadURLResponseBodySchema>;


export const ImportRDBConfirmUploadRequestBodySchema = Type.Object({
  instanceId: Type.String(),
  taskId: Type.String(),
});

export type ImportRDBConfirmUploadRequestBody = Static<typeof ImportRDBConfirmUploadRequestBodySchema>;

export const ImportRDBConfirmUploadResponseBodySchema = Type.Object({
  taskId: Type.String(),
});
export type ImportRDBConfirmUploadResponseBody = Static<typeof ImportRDBConfirmUploadResponseBodySchema>;