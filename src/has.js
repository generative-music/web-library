import getSavedIndex from './indexed-db/get-saved-index';
import isNull from './utils/is-null';
import sampleCollectionToUrls from './shared/sample-collection-to-urls';
import getFromIndex from './shared/get-from-index';

const getUrlsFromIndex = (sampleIndex, instrumentGroup) => {
  const [, sampleCollection] = getFromIndex(sampleIndex, instrumentGroup);
  return sampleCollectionToUrls(sampleCollection);
};

const has = async ({ sampleIndex, provider }, instruments = []) => {
  let instrumentUrls = instruments.map((instrumentGroup) =>
    getUrlsFromIndex(sampleIndex, instrumentGroup)
  );

  if (instrumentUrls.some(isNull)) {
    const cacheIndex = await getSavedIndex();
    if (typeof cacheIndex !== 'object' || cacheIndex === null) {
      return false;
    }
    instrumentUrls = instruments.map((instrumentGroup, i) => {
      const urls = instrumentUrls[i];
      if (urls === null) {
        return getUrlsFromIndex(cacheIndex, instrumentGroup);
      }
      return urls;
    });
  }

  if (instrumentUrls.some(isNull)) {
    return false;
  }

  return provider.has(instrumentUrls.flat());
};

export default has;
