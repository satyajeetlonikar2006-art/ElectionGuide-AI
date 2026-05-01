/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-5a5d9309'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "index.html",
    "revision": "186054889a53f92ede8b565f4affd39c"
  }, {
    "url": "assets/zap-Do3cLGyW.js",
    "revision": null
  }, {
    "url": "assets/trash-2-DUpOwFAD.js",
    "revision": null
  }, {
    "url": "assets/Timeline-CdiIyyw9.js",
    "revision": null
  }, {
    "url": "assets/stateData-Bn20AuLn.js",
    "revision": null
  }, {
    "url": "assets/SavedAnswers-CYuW94oo.js",
    "revision": null
  }, {
    "url": "assets/Quiz-CbAyQGsS.js",
    "revision": null
  }, {
    "url": "assets/info-4zMJDtvk.js",
    "revision": null
  }, {
    "url": "assets/index-Bc4e35Kf.js",
    "revision": null
  }, {
    "url": "assets/index-BaSioKWB.css",
    "revision": null
  }, {
    "url": "assets/FindInfo-Zx6DkwNB.js",
    "revision": null
  }, {
    "url": "assets/Dashboard-DdF2t2WN.js",
    "revision": null
  }, {
    "url": "assets/confetti.module-Jh1KP-Hv.js",
    "revision": null
  }, {
    "url": "assets/clock-ByIW7wyE.js",
    "revision": null
  }, {
    "url": "assets/circle-check-big-DQC1GImW.js",
    "revision": null
  }, {
    "url": "assets/Checklist-Ch-uWFJN.js",
    "revision": null
  }, {
    "url": "assets/Chat-tbOR5MsJ.js",
    "revision": null
  }, {
    "url": "assets/bookmark-DH1Lai0y.js",
    "revision": null
  }, {
    "url": "manifest.webmanifest",
    "revision": "23cebb65e811303d01d686479ad98e20"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
