const CACHE_NAME = 'pwa-ui5-priteshprofile-v1.0.5';
const RESOURCES_TO_PRELOAD = [
    'index.html',
    'logo.svg',
    'register-worker.js',
    'view/',
    'controller/',
    'css/style.css',
    'i18n/',
    'icons/',
    'img/',
    'Component.js',
    'Component-preload.js',
    'favicon.ico',
    'manifest.json'
    //'offline-404.html'
];

const cdnBase = 'https://openui5.hana.ondemand.com/resources/';

const resourcesToCache = RESOURCES_TO_PRELOAD.concat([
    `${cdnBase}sap-ui-core.js`,
    `${cdnBase}sap/ui/core/library-preload.js`,
    `${cdnBase}sap/ui/core/themes/sap_fiori_3/library.css`,
    `${cdnBase}sap/ui/core/themes/base/fonts/SAP-icons.woff2`,
    `${cdnBase}sap/m/library-preload.js`,
    `${cdnBase}sap/m/themes/sap_fiori_3/library.css`
]);

// Preload some resources during install
// self.addEventListener('install', function (event) {
//     self.skipWaiting();
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(function (cache) {
//             return cache.addAll(RESOURCES_TO_PRELOAD);
//             // if any item isn't successfully added to
//             // cache, the whole operation fails.
//         }).catch(function (error) {
//             console.error(error);
//         })
//     );
// });

self.addEventListener('install', (event) => {
    // prevents the waiting, meaning the service worker activates
    // as soon as it's finished installing
    // NOTE: don't use this if you don't want your sw to control pages
    // that were loaded with an older version
    self.skipWaiting();
  
    event.waitUntil((async () => {
      try {
        // self.cacheName and self.contentToCache are imported via a script
        const cache = await caches.open(self.cacheName);
        const total = self.contentToCache.length;
        let installed = 0;
  
        await Promise.all(self.contentToCache.map(async (url) => {
          let controller;
  
          try {
            controller = new AbortController();
            const { signal } = controller;
            // the cache option set to reload will force the browser to
            // request any of these resources via the network,
            // which avoids caching older files again
            const req = new Request(url, { cache: 'reload' });
            const res = await fetch(req, { signal });
  
            if (res && res.status === 200) {
              await cache.put(req, res.clone());
              installed += 1;
            } else {
              console.info(`unable to fetch ${url} (${res.status})`);
            }
          } catch (e) {
            console.info(`unable to fetch ${url}, ${e.message}`);
            // abort request in any case
            controller.abort();
          }
        }));
  
        if (installed === total) {
          console.info(`application successfully installed (${installed}/${total} files added in cache)`);
        } else {
          console.info(`application partially installed (${installed}/${total} files added in cache)`);
        }
      } catch (e) {
        console.error(`unable to install application, ${e.message}`);
      }
    })());
  });

// Delete obsolete caches during activate
// self.addEventListener('activate', function (event) {
//     event.waitUntil(
//         caches.keys().then(function (keyList) {
//             return Promise.all(keyList.map(function (key) {
//                 if (key !== CACHE_NAME) {
//                     return caches.delete(key);
//                 }
//             }));
//         })
//     );
// });

// remove old cache if any
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const cacheNames = await caches.keys();
  
      await Promise.all(cacheNames.map(async (cacheName) => {
        if (self.cacheName !== cacheName) {
          await caches.delete(cacheName);
        }
      }));
    })());
});

// During runtime, get files from cache or -> fetch, then save to cache
self.addEventListener('fetch', function (event) {
    // only process GET requests
    if (event.request.method === 'GET') {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                if (response) {
                    return response; // There is a cached version of the resource already
                }

                let requestCopy = event.request.clone();
                return fetch(requestCopy).then(function (response) {
                    // opaque responses cannot be examined, they will just error
                    if (response.type === 'opaque') {
                        // don't cache opaque response, you cannot validate it's status/success
                        return response;
                        // response.ok => response.status == 2xx ? true : false;
                    } else if (!response.ok) {
                        console.error(response.statusText);
                    } else {
                        return caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(event.request, response.clone());
                            return response;
                            // if the response fails to cache, catch the error
                        }).catch(function (error) {
                            console.error(error);
                            return error;
                        });
                    }
                }).catch(function (error) {
                    // fetch will fail if server cannot be reached,
                    // this means that either the client or server is offline
                    console.error(error);
                    return caches.match('offline-404.html');
                });
            })
        );
    }
});