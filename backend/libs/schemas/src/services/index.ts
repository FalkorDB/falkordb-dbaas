import { Provisioner } from './provisioner';
import { Organizations } from './organizations';
import { Users } from './users';
import { Auth } from './auth';
import { ImportExportRdb } from './import-export-rdb';
import { DBImporterWorker } from './db-importer-worker';

export const Services = {
  Provisioner,
  Organizations,
  Users,
  Auth,
  ImportExportRdb,
  DBImporterWorker,
};
