/* Rosyjski – praca bez internetu: wszystkie pliki aplikacji w pamięci podręcznej */
const CACHE="rosyjski-f2592f8464",FILES=["./", "PT_Sans-Web-Bold.ttf", "PT_Sans-Web-Regular.ttf", "PT_Serif-Web-Bold.ttf", "PT_Serif-Web-Regular.ttf", "akcenty.js", "app.js", "apple-touch-icon.png", "audio-1-michael.mp3", "audio-2-german.mp3", "audio-3-banderas.mp3", "audio-4-warhol.mp3", "audio-5-banksy.mp3", "cw.png", "czasowniki.js", "czeste.js", "czkon2.png", "drill.png", "dyktando.js", "exres.png", "gramatyka.js", "icon-192.png", "icon-512.png", "icon-maskable.png", "imieslowy.js", "imodm.png", "index.html", "kleski.js", "kultura.js", "liczebniki.js", "manifest.webmanifest", "przymiotniki.js", "reguly.js", "rzeczowniki.js", "rzzen1.png", "sad.js", "set_top.png", "typing.js", "umiem.js", "wrong.png", "wybory.js", "wybory.png", "zadania.js", "zaimki.js", "zaimos.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* Safari pyta o nagrania kawałkami (nagłówek Range) – odpowiadamy wycinkiem z pamięci (206) */
function part(req,r){const m=/bytes=(\d*)-(\d*)/.exec(req.headers.get("range")||"");if(!m)return r;
  return r.arrayBuffer().then(buf=>{const n=buf.byteLength;let a=m[1]===""?Math.max(0,n-(+m[2]||0)):+m[1],b=m[1]!==""&&m[2]!==""?Math.min(+m[2],n-1):n-1;
    if(a>=n||a>b)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+n}});
    return new Response(buf.slice(a,b+1),{status:206,statusText:"Partial Content",headers:{"Content-Type":r.headers.get("Content-Type")||"audio/mpeg","Content-Range":"bytes "+a+"-"+b+"/"+n,"Content-Length":String(b-a+1),"Accept-Ranges":"bytes"}})})}
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r?(e.request.headers.has("range")?part(e.request,r):r):fetch(e.request).catch(()=>caches.match("index.html"))))});
