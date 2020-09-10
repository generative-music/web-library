import has from './has';
import request from './request';
import save from './save';

const createLibrary = (config) => ({
  has: has.bind(null, config),
  request: request.bind(null, config),
  save: save.bind(null, config),
});

export default createLibrary;
