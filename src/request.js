import getSavedIndex from './indexed-db/get-saved-index';
import isNull from './utils/is-null';
import sampleCollectionToUrls from './shared/sample-collection-to-urls';
import getFromIndex from './shared/get-from-index';

const createInstrumentRequest = (instrumentName, sampleCollection) => {
  const urls = sampleCollectionToUrls(sampleCollection);
  const attach = (samples, audioBuffers) => {
    if (Array.isArray(sampleCollection)) {
      samples[instrumentName] = audioBuffers;
      return samples;
    }
    if (typeof sampleCollection === 'object' && sampleCollection !== null) {
      const keys = Object.keys(sampleCollection);
      const audioBufferCollection = audioBuffers.reduce(
        (collection, audioBuffer, i) => {
          const key = keys[i];
          collection[key] = audioBuffer;
          return collection;
        },
        {}
      );
      samples[instrumentName] = audioBufferCollection;
      return samples;
    }
    samples[instrumentName] = null;
    return samples;
  };

  return {
    urls,
    attach,
  };
};

const getRequestsFromIndex = (sampleIndex, instrumentGroup) => {
  const [instrumentName, sampleCollection] = getFromIndex(
    sampleIndex,
    instrumentGroup
  );
  return createInstrumentRequest(instrumentName, sampleCollection);
};

const request = async (
  { sampleIndex, provider },
  audioContext,
  instruments = []
) => {
  let instrumentRequests = instruments.map((instrumentGroup) =>
    getRequestsFromIndex(sampleIndex, instrumentGroup)
  );

  if (instrumentRequests.some(({ urls }) => isNull(urls))) {
    const cacheIndex = await getSavedIndex();
    instrumentRequests = instruments.map((instrumentGroup, i) => {
      const instrumentRequest = instrumentRequests[i];
      if (instrumentRequest.urls === null) {
        return getRequestsFromIndex(cacheIndex, instrumentGroup);
      }
      return instrumentRequest;
    });
  }

  const instrumentRequestsWithUrls = instrumentRequests.filter(
    ({ urls }) => urls !== null
  );

  const allUrls = instrumentRequestsWithUrls.map(({ urls }) => urls).flat();
  const allAudioBuffers = await provider.request(audioContext, allUrls);
  const samples = instrumentRequestsWithUrls.reduce((o, { urls, attach }) => {
    if (urls === null) {
      return samples;
    }
    const instrumentAudioBuffers = allAudioBuffers.splice(0, urls.length);
    return attach(o, instrumentAudioBuffers);
  }, {});

  return samples;
};

export default request;
