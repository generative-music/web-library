import { promisifyRequest } from '@alexbainter/indexed-db';
import save from './save';
import openDb from './indexed-db/open-db';
import SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME from './indexed-db/saved-instrument-index-object-store-name';
import getSavedIndex from './indexed-db/get-saved-index';

const clearSavedInstrumentIndex = async () => {
  const db = await openDb();
  const objectStore = db
    .transaction([SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME], 'readwrite')
    .objectStore(SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME);
  const keys = await promisifyRequest(objectStore.getAllKeys());
  return Promise.all(
    keys.map((key) => promisifyRequest(objectStore.delete(key)))
  );
};

describe('save', () => {
  beforeEach(clearSavedInstrumentIndex);
  after(clearSavedInstrumentIndex);
  it('should call provider.save with the urls and append the instruments to the saved index', async () => {
    const entries = [
      ['instrument1', ['instrument1/audioBuffer1', 'instrument1/audioBuffer2']],
      [
        'instrument2',
        {
          A: 'instrument2/audioBuffer1',
          B: 'instrument2/audioBuffer2',
        },
      ],
    ];
    const audioBufferKeyMap = new Map();
    const provider = {
      save: (urlEntries) => {
        urlEntries.forEach(([key, audioBuffer]) => {
          audioBufferKeyMap.set(audioBuffer, key);
        });
        return Promise.resolve();
      },
    };
    await save({ provider }, entries);
    const savedIndex = await getSavedIndex();
    entries.forEach(([instrumentName, audioBuffers]) => {
      const savedKeys = Array.isArray(audioBuffers)
        ? audioBuffers.map((audioBuffer) => audioBufferKeyMap.get(audioBuffer))
        : Object.keys(audioBuffers).reduce((o, note) => {
            o[note] = audioBufferKeyMap.get(audioBuffers[note]);
            return o;
          }, {});
      expect(savedIndex).to.have.deep.property(instrumentName, savedKeys);
    });
  });
});
