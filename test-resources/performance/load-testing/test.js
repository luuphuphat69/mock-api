import {loadGet, loadPost, loadPatch, loadPut, loadDelete} from '../load-testing/mock/http.js'

export const options = {
  vus: 100,
  duration: '30m',
};

export default function () {
  loadGet();
}