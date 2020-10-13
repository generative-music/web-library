const sampleCollectionToUrls = (sampleCollection) => {
  if (Array.isArray(sampleCollection)) {
    return sampleCollection;
  }
  if (typeof sampleCollection === 'object' && sampleCollection !== null) {
    return Object.values(sampleCollection);
  }
  return null;
};

export default sampleCollectionToUrls;
