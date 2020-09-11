import { promisifyRequest } from '@alexbainter/indexed-db';
import openDb from './open-db';
import SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME from './saved-instrument-index-object-store-name';
import INDEX_KEY from './saved-index-key';

const getSavedIndex = async () => {
  const db = await openDb();
  return promisifyRequest(
    db
      .transaction([SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME])
      .objectStore(SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME)
      .get(INDEX_KEY)
  );
};

export default getSavedIndex;
