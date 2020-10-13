import { promisifyRequest } from '@alexbainter/indexed-db';
import request from './request';
import openDb from './indexed-db/open-db';
import SAVED_INSTRUMENT_INDEX_OBJECT_STORE_NAME from './indexed-db/saved-instrument-index-object-store-name';
import appendSavedIndex from './indexed-db/append-saved-index';

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

const markUrlRequested = (url) => `REQUESTED::${url}`;

describe('request', () => {
  beforeEach(clearSavedInstrumentIndex);
  after(clearSavedInstrumentIndex);

  it('should return a map with the same structure as sampleIndex with results from provider.request', async () => {
    const savedIndex = {
      saved: {
        A: 'saved/url1',
        B: 'saved/url2',
      },
      unsaved: ['unsaved/ur1', 'unsaved/url2'],
    };

    await appendSavedIndex(savedIndex);

    const sampleIndex = {
      required: {
        C: 'required/url1',
        D: 'required/url2',
      },
      fallback1: ['fallback1/url1', 'fallback1/url2'],
      fallback2: {
        E: 'fallback2/url1',
        F: 'fallback2/url2',
      },
      indexed: ['indexed/url1', 'indexed/url2'],
    };

    const provider = {
      has: (urls = []) => urls.every((url) => !url.includes('unsaved')),
      request: (audioContext, urls = []) => urls.map(markUrlRequested),
    };

    const result = await request({ provider, sampleIndex }, null, [
      'required',
      ['saved', 'unused'],
      ['unsaved', 'fallback1'],
      ['nonexistant', 'fallback2'],
      ['indexed', 'unused'],
    ]);

    expect(result).to.have.deep.property(
      'required',
      Object.keys(sampleIndex.required).reduce((o, key) => {
        o[key] = markUrlRequested(sampleIndex.required[key]);
        return o;
      }, {})
    );

    expect(result).to.have.deep.property(
      'saved',
      Object.keys(savedIndex.saved).reduce((o, key) => {
        o[key] = markUrlRequested(savedIndex.saved[key]);
        return o;
      }, {})
    );

    expect(result)
      .to.have.property('fallback1')
      .with.members(sampleIndex.fallback1.map(markUrlRequested));

    expect(result).to.have.deep.property(
      'fallback2',
      Object.keys(sampleIndex.fallback2).reduce((o, key) => {
        o[key] = markUrlRequested(sampleIndex.fallback2[key]);
        return o;
      }, {})
    );

    expect(result)
      .to.have.deep.property('indexed')
      .with.members(sampleIndex.indexed.map(markUrlRequested));
  });
});
