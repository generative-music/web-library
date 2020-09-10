import appendSavedIndex from './indexed-db/append-saved-index';

const save = ({ provider }, entries = []) =>
  Promise.all(
    entries.map(async ([instrumentName, audioBufferCollection]) => {
      if (Array.is(audioBufferCollection)) {
        const keys = audioBufferCollection.map(
          (_, i) => `${instrumentName}/${i}`
        );
        await provider.save(
          audioBufferCollection.map((audioBuffer, i) => {
            const key = keys[i];
            return [key, audioBuffer];
          })
        );
        await appendSavedIndex({ [instrumentName]: keys });
      } else if (
        audioBufferCollection !== null &&
        typeof audioBufferCollection === 'object'
      ) {
        const notes = Object.keys(audioBufferCollection);
        const keys = notes.map((note) => `${instrumentName}/${note}`);
        await provider.save(
          notes.map((note, i) => {
            const key = keys[i];
            const audioBuffer = audioBufferCollection[note];
            return [key, audioBuffer];
          })
        );
        await appendSavedIndex({
          [instrumentName]: notes.reduce((o, note, i) => {
            const key = keys[i];
            o[note] = key;
            return o;
          }, {}),
        });
      }
    })
  );

export default save;
