import getSavedIndex from './indexed-db/get-saved-index';

const request = async (
  { sampleIndex, provider },
  audioContext,
  instruments = []
) => {
  const instrumentsWithFallbacks = [];
  const instrumentUrlPairs = [];

  instruments.forEach((instrument) => {
    if (Array.isArray(instrument)) {
      if (instrument.length >= 2) {
        instrumentsWithFallbacks.push(instrument);
      } else {
        const [instrumentName] = instrument;
        instrumentUrlPairs.push([instrumentName, sampleIndex[instrumentName]]);
      }
    } else {
      instrumentUrlPairs.push([instrument, sampleIndex[instrument]]);
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
            instrumentUrlPairs.push([
              requiredInstrument,
              sampleIndex[requiredInstrument],
            ]);
            return;
          }
          const hasOptional = await provider.has(optionalUrls);
          if (!hasOptional) {
            instrumentUrlPairs.push([
              requiredInstrument,
              sampleIndex[requiredInstrument],
            ]);
            return;
          }
          instrumentUrlPairs.push([optionalInstrument, optionalCollection]);
        }
      )
    );
  }

  const requestedUrls = [];
  const samples = {};
  const samplePaths = [];

  instrumentUrlPairs.forEach((sampleObj, [instrumentName, urlCollection]) => {
    if (Array.isArray(urlCollection)) {
      requestedUrls.push(...urlCollection);
      samples[instrumentName] = [];
      samplePaths.push(...urlCollection.map((_, i) => [instrumentName, i]));
      return;
    } else if (urlCollection !== null && typeof urlCollection === 'object') {
      const urls = Object.values(urlCollection);
      const notes = Object.keys(urlCollection);
      requestedUrls.push(...urls);
      samples[instrumentName] = {};
      samplePaths.push(...notes.map((note) => [instrumentName, note]));
      return;
    }
    throw Error(
      `Requested instrument "${instrumentName}" could not be found in the specified sample index`
    );
  }, {});

  const results = await provider.request(audioContext, requestedUrls);
  results.forEach((audioBuffer, i) => {
    const [instrumentName, propertyName] = samplePaths[i];
    samples[instrumentName][propertyName] = audioBuffer;
  });

  return samples;
};

export default request;
