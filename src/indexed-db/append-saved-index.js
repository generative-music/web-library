import { promisifyRequest } from '@alexbainter/indexed-db';
import openDb from './open-db';
import SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME from './saved-instrument-index-object-store-name';
import INDEX_KEY from './saved-index-key';

const appendSavedIndex = async (appendObject) => {
  const db = await openDb();
  const objectStore = db
    .transaction([SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME], 'readwrite')
    .objectStore(SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME);
  const savedIndex = await promisifyRequest(objectStore.get(INDEX_KEY));
  return promisifyRequest(
    objectStore.put(Object.assign(appendObject, savedIndex), INDEX_KEY)
  );
};

export default appendSavedIndex;
