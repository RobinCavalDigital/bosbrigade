// Bosbrigade: makes the game installable and playable offline.
var CACHE="bosbrigade-v1";
var FILES=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
  // Network first, so a new upload shows up right away; cache when offline.
  e.respondWith(fetch(req).then(function(res){
    var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy)});return res;
  }).catch(function(){
    return caches.match(req,{ignoreSearch:true}).then(function(m){return m||caches.match("index.html")});
  }));
});
