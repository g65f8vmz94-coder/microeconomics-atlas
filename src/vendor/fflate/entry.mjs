// Small synchronous reader for single-file downloads opened from disk.
import {gunzipSync} from 'fflate';
const utf8 = new TextDecoder();
window.atlasUnpack = bytes => utf8.decode(gunzipSync(bytes));
