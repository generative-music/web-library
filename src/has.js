import getSavedIndex from './indexed-db/get-saved-index';

const has = async ({ sampleIndex, provider }, instruments = []) => {
  const instrumentsWithFallbacks = [];
  const requiredInstruments = [];

  instruments.forEach((instrument) => {
    if (Array.isArray(instrument)) {
      if (instrument.length >= 2) {
        instrumentsWithFallbacks.push(instrument);
      } else {
        requiredInstruments.push(instrument[0]);
      }
    } else {
      requiredInstruments.push(instrument);
    }
  });

  if (instrumentsWithFallbacks.length) {
    const savedIndex = await getSavedIndex();
    await Promise.all(
      instrumentsWithFallbacks.map(
        async ([optionalInstrument, requiredInstrument]) => {
          const optionalCollection = savedIndex[optionalInstrument];
          let optionalUrls;
          if (Array.isArray(optionalCollection)) {
            optionalUrls = optionalCollection;
          } else if (
            optionalCollection !== null &&
            typeof optionalCollection === 'object'
          ) {
            optionalUrls = Object.values(optionalCollection);
          }
          if (!optionalUrls) {
            requiredInstruments.push(requiredInstrument);
            return;
          }
          const hasOptional = await provider.has(optionalUrls);
          if (!hasOptional) {
            requiredInstruments.push(requiredInstrument);
          }
        }
      )
    );
  }

  const requiredUrls = [];

  const areAllValid = requiredInstruments.every((instrumentName) => {
    const collection = sampleIndex[instrumentName];
    if (Array.isArray(collection)) {
      requiredUrls.push(...collection);
      return true;
    } else if (collection !== null && typeof collection === 'object') {
      requiredUrls.push(...Object.values(collection));
      return true;
    }
    return false;
  });

  if (!areAllValid) {
    return false;
  }

  return provider.has(requiredUrls);
};

export default has;
