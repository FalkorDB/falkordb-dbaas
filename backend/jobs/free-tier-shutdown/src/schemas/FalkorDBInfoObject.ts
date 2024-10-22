import { type Static, Type } from '@sinclair/typebox';

export const FalkorDBInfoObjectSchema = Type.Object({
  rdb_changes_since_last_save: Type.Number(),
  rdb_bgsave_in_progress: Type.Number(),
  rdb_last_save_time: Type.Number(),
  rdb_saves: Type.Number(),
});

export type FalkorDBInfoObjectSchemaType = Static<typeof FalkorDBInfoObjectSchema>;
