import sinon from 'sinon';
import { promisifyRequest } from '@alexbainter/indexed-db';
import has from './has';
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

describe('has', () => {
  beforeEach(clearSavedInstrumentIndex);
  after(clearSavedInstrumentIndex);

  it('should call provider.has with the specified urls and resolve with the result', async () => {
    const sampleIndex = {
      dep1: ['dep1/url1', 'dep1/url2'],
      dep2: { url1: 'dep2/url1', url2: 'dep2/url2' },
    };
    const provider = {
      has: sinon.fake.resolves(true),
    };
    const result = await has({ sampleIndex, provider }, ['dep1', 'dep2']);
    expect(result).to.be.true;
    expect(provider.has.calledOnce).to.be.true;
    expect(provider.has.firstCall.firstArg).to.have.members(
      sampleIndex.dep1.concat(Object.values(sampleIndex.dep2))
    );
  });

  it('should resolve with false if any of the required instruments are not in the sample index', async () => {
    const result = await has({ sampleIndex: {}, provider: {} }, ['nope']);
    expect(result).to.be.false;
  });

  it('should call provider.has with the required instrument urls and resolve with the result if the optional instrument is not available', async () => {
    const sampleIndex = {
      dep1: ['dep1/url1', 'dep1/url2'],
    };
    const provider = {
      has: sinon.fake.resolves(true),
    };
    const result = await has({ sampleIndex, provider }, [['nope', 'dep1']]);
    expect(result).to.be.true;
    expect(provider.has.calledOnce).to.be.true;
    expect(provider.has.firstCall.firstArg).to.have.members(sampleIndex.dep1);
  });

  it('should call provider.has with the urls specified in the saved index for matching optional instruments, and resolve with the result', async () => {
    const savedIndex = {
      dep1: ['dep1/url1', 'dep1/url2'],
      dep2: { url1: 'dep2/url1', url2: 'dep2/url2' },
    };
    await appendSavedIndex(savedIndex);
    const provider = {
      has: sinon.fake.resolves(true),
    };
    const result = await has({ sampleIndex: {}, provider }, [
      ['dep1', 'nope'],
      ['dep2', 'nope'],
    ]);
    expect(result).to.be.true;
    expect(
      provider.has.args.map(([firstArg]) => firstArg).flat()
    ).to.have.members(savedIndex.dep1.concat(Object.values(savedIndex.dep2)));
  });
});
