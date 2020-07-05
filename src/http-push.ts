/*
 * @Author: qiansc
 * @Date: 2019-05-09 13:04:45
 * @Last Modified by: qiansc
 * @Last Modified time: 2019-05-09 19:13:40
 */

import { File } from 'gulp-util';
import { defaultCachePath, hasCache, mkdirsSync } from './cache';
import { include } from './filter';
import { Restrictor } from './restrictor';
import stream = require('readable-stream');
const Transform = stream.Transform;

export function httpPush (options: IDeployOption[], deployEndCallback: (() => void) | undefined) {
    console.log('[gulp-deploy-http-push] httpPush() is deprecated, use push() instead');
    const restrictor = new Restrictor({
        deployEndCallback
    });
    const cachePath = options[0].cachePath ? options[0].cachePath : defaultCachePath;
    mkdirsSync(cachePath);
    return new Transform({
        objectMode: true,
        transform: (file: File, enc, callback) => {
            if (!file.isDirectory()) {
                options.forEach((option) => {
                    if (!hasCache(cachePath, file) && (!option.match ||
                    (option.match && include(file.path, option.match, {
                        root: file.base })))) {
                        restrictor.add({
                            cache: !!option.cache,
                            cachePath,
                            host: option.host,
                            retry: 2,
                            to: option.to }, {
                            contents: file.contents,
                            path: file.path,
                            relative: '/' + file.relative,
                            stat: file.stat });
                        // 在match名单中
                        // console.log(option.to, file.path);
                    }
                });
            }
            callback();
        }
    });
}

interface IDeployOption {
  /** 要部署的机器HOST */
  host: string;
  /** 符合条件的文件的glob */
  match?: string;
  /** 要部署的basePath */
  to: string;
  /** 缓存存放目录 */
  cachePath?: string;
  /** 是否缓存 */
  cache?: boolean;
}
