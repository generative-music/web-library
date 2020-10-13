const getFromIndex = (sampleIndex, instrumentGroup) => {
  if (Array.isArray(instrumentGroup)) {
    const firstIndexedInstrumentName = instrumentGroup.find((instrumentName) =>
      Boolean(sampleIndex[instrumentName])
    );
    return [
      firstIndexedInstrumentName,
      sampleIndex[firstIndexedInstrumentName],
    ];
  }
  return [instrumentGroup, sampleIndex[instrumentGroup]];
};

export default getFromIndex;
