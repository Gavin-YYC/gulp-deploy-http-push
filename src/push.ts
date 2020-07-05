import { File } from 'gulp-util';
import { Transform } from 'readable-stream';
import { defaultCachePath, hasCache, mkdirsSync } from './cache';
import { include } from './filter';
import { Restrictor } from './restrictor';
export function push (options: PushOptions, deployEndCallback: (() => void) | undefined) {
    const restrictor = new Restrictor({
        deployEndCallback
    });
    const cachePath = options.cachePath ? options.cachePath : defaultCachePath;
    mkdirsSync(cachePath);
    return new Transform({
        objectMode: true,
        transform: (file: File, enc, callback) => {
            if (!file.isDirectory() && !hasCache(cachePath, file)) {
                restrictor.add({
                    cache: !!options.cache,
                    cachePath,
                    host: options.host,
                    retry: 2,
                    to: options.to }, {
                    contents: file.contents,
                    path: file.path,
                    relative: '/' + file.relative,
                    stat: file.stat });
            }
            callback();
        } });
}

interface PushOptions {
  /** 要部署的机器HOST */
  host: string;
  /** 要部署的basePath */
  to: string;
  /** 缓存存放目录 */
  cachePath?: string;
  /** 是否缓存 */
  cache?: boolean;
}
