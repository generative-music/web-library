import { makeOpenDb } from '@alexbainter/indexed-db';
import SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME from './saved-instrument-index-object-store-name';

const DB_NAME = '@generative-music/web-library::cache';
const DB_VERSION = 1;

const onUpgradeNeeded = (event) => {
  const db = event.target.result;
  db.createObjectStore(SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME);
};

export default makeOpenDb({
  dbName: DB_NAME,
  dbVersion: DB_VERSION,
  onUpgradeNeeded,
});
