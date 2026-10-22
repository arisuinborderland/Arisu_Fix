'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;

// Unit-test double for sharp. Production uses the real sharp decoder declared in package.json.
Module._load = function(request, parent, isMain) {
  if (request === 'sharp') return function fakeSharp(bytes, options = {}) {
    assert.equal(options.failOn, 'error');
    const b = Buffer.from(bytes);
    let format = null;
    if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) format = 'jpeg';
    if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) format = 'png';
    if (b.length >= 12 && b.toString('ascii',0,4) === 'RIFF' && b.toString('ascii',8,12) === 'WEBP') format = 'webp';
    const malformed = b.includes(Buffer.from('BADPIXELS'));
    const isJpeg = b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const width = !malformed && isJpeg && b.length >= 16 ? b.readUInt32BE(4) || 100 : 100;
    const height = !malformed && isJpeg && b.length >= 20 ? b.readUInt32BE(8) || 100 : 100;
    const chain = {
      metadata: async () => ({ format, width, height }),
      clone: () => chain,
      rotate: () => chain,
      resize: () => chain,
      toBuffer: async () => { if (!format || b.includes(Buffer.from('BADPIXELS'))) throw new Error('decoder failed'); return Buffer.from([1]); }
    };
    return chain;
  };
  return originalLoad.call(this, request, parent, isMain);
};

process.env.SUPABASE_URL = 'https://staging.example.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'test-service-role-key';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
process.env.STORY_ADMIN_EMAIL = 'admin@example.test';
process.env.CRON_SECRET = 'test-cron-secret';
const { validateStoryImage } = require('../lib/story-image');
const storiesHandler = require('../api/stories');
const cleanupHandler = require('../api/cleanup-stories');

function response() {
  return { headers: {}, statusCode: 200, body: '', setHeader(k,v){this.headers[k]=v;}, end(v){this.body=String(v || '');}, json(){return JSON.parse(this.body);} };
}
function req(method, { headers = {}, query = {}, body = {} } = {}) { return { method, headers, query, body }; }
function fakeResponse(status, payload = {}) { return { ok: status >= 200 && status < 300, status, async text(){return typeof payload === 'string' ? payload : JSON.stringify(payload);}, async json(){return payload;} }; }
function setFetch(fn) { global.fetch = fn; }
function authResponse(email = 'admin@example.test', status = 200) { return fakeResponse(status, { id: 'admin-user-1', email }); }
function jpegBytes(size = 32) { const b = Buffer.alloc(size); b[0]=0xff; b[1]=0xd8; b[2]=0xff; return b; }
function pngBytes(size = 32) { const b = Buffer.alloc(size); Buffer.from([137,80,78,71,13,10,26,10]).copy(b); return b; }
function webpBytes(size = 32) { const b = Buffer.alloc(size); b.write('RIFF',0); b.write('WEBP',8); return b; }
function dataUrl(mime, bytes) { return `data:${mime};base64,${bytes.toString('base64')}`; }
function validStoryBody(mime='image/jpeg', bytes=jpegBytes()) { return { caption:'Test story', mimeType:mime, imageData:dataUrl(mime,bytes) }; }

// 17 baseline regression scenarios plus focused validation and retry cases.
test('01 rejects unauthenticated POST', async () => {
  setFetch(async url => String(url).includes('/auth/v1/user') ? fakeResponse(401,{}) : fakeResponse(500,{}));
  const res=response(); await storiesHandler(req('POST',{body:validStoryBody()}),res); assert.equal(res.statusCode,401);
});
test('02 rejects expired admin token', async () => {
  setFetch(async () => fakeResponse(401,{})); const res=response();
  await storiesHandler(req('POST',{headers:{authorization:'Bearer expired'},body:validStoryBody()}),res); assert.equal(res.statusCode,401);
});
test('03 rejects non-admin user', async () => {
  setFetch(async () => authResponse('visitor@example.test')); const res=response();
  await storiesHandler(req('POST',{headers:{authorization:'Bearer visitor'},body:validStoryBody()}),res); assert.equal(res.statusCode,401);
});
test('04 rejects unsupported method', async () => {
  const res=response(); await storiesHandler(req('PUT'),res); assert.equal(res.statusCode,405); assert.match(res.headers.Allow,/PATCH/);
});
test('05 rejects admin listing without admin auth', async () => {
  setFetch(async () => fakeResponse(401,{})); const res=response();
  await storiesHandler(req('GET',{query:{admin:'1'},headers:{authorization:'Bearer bad'}}),res); assert.equal(res.statusCode,401);
});
test('06 rejects caption longer than 180 characters', async () => {
  setFetch(async () => authResponse()); const res=response();
  await storiesHandler(req('POST',{headers:{authorization:'Bearer admin'},body:{...validStoryBody(),caption:'x'.repeat(181)}}),res); assert.equal(res.statusCode,400);
});
test('07 rejects MIME/data URL mismatch', async () => {
  setFetch(async () => authResponse()); const res=response(); await storiesHandler(req('POST',{headers:{authorization:'Bearer admin'},body:{...validStoryBody(),mimeType:'image/png'}}),res); assert.equal(res.statusCode,400);
});
test('08 rejects empty/invalid image payload', async () => {
  const r=await validateStoryImage('image/jpeg',Buffer.alloc(0)); assert.equal(r.ok,false); assert.equal(r.status,415);
});
test('09 rejects malformed JPEG after decode attempt', async () => {
  const b=jpegBytes(); Buffer.from('BADPIXELS').copy(b,3); const r=await validateStoryImage('image/jpeg',b); assert.equal(r.ok,false); assert.equal(r.status,415);
});
test('10 rejects malformed WebP after decode attempt', async () => {
  const b=webpBytes(); Buffer.from('BADPIXELS').copy(b,12); const r=await validateStoryImage('image/webp',b); assert.equal(r.ok,false); assert.equal(r.status,415);
});
test('11 rejects payload larger than 3 MB', async () => {
  const r=await validateStoryImage('image/jpeg',Buffer.alloc(3*1024*1024+1)); assert.equal(r.ok,false); assert.equal(r.status,413);
});
test('12 rejects excessive dimensions/pixel count', async () => {
  const b=jpegBytes(20); b.writeUInt32BE(5000,4); b.writeUInt32BE(5000,8); const r=await validateStoryImage('image/jpeg',b); assert.equal(r.ok,false); assert.equal(r.status,413);
});
test('13 rejects invalid PATCH ID', async () => {
  setFetch(async () => authResponse()); const res=response();
  await storiesHandler(req('PATCH',{headers:{authorization:'Bearer admin'},body:{id:'not-a-uuid',status:'active'}}),res); assert.equal(res.statusCode,400);
});
test('14 rejects invalid status transition value', async () => {
  setFetch(async () => authResponse()); const res=response();
  await storiesHandler(req('PATCH',{headers:{authorization:'Bearer admin'},body:{id:'12345678-1234-1234-1234-123456789abc',status:'published'}}),res); assert.equal(res.statusCode,400);
});
test('15 rejects invalid sort order', async () => {
  setFetch(async () => authResponse()); const res=response();
  await storiesHandler(req('PATCH',{headers:{authorization:'Bearer admin'},body:{id:'12345678-1234-1234-1234-123456789abc',sortOrder:-1}}),res); assert.equal(res.statusCode,400);
});
test('16 rejects cleanup request with wrong secret', async () => {
  const res=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer wrong'}}),res); assert.equal(res.statusCode,401);
});
test('17 rejects cleanup unsupported method', async () => {
  const res=response(); await cleanupHandler(req('POST',{headers:{authorization:'Bearer test-cron-secret'}}),res); assert.equal(res.statusCode,405);
});
test('18 accepts valid JPEG when decoder succeeds', async () => {
  const r=await validateStoryImage('image/jpeg',jpegBytes()); assert.equal(r.ok,true); assert.equal(r.format,'jpeg');
});
test('19 accepts valid PNG when decoder succeeds', async () => {
  const r=await validateStoryImage('image/png',pngBytes()); assert.equal(r.ok,true); assert.equal(r.format,'png');
});
test('20 accepts valid WebP when decoder succeeds', async () => {
  const r=await validateStoryImage('image/webp',webpBytes()); assert.equal(r.ok,true); assert.equal(r.format,'webp');
});
test('21 cleanup removes expired DB row if storage object is already missing', async () => {
  const calls=[]; setFetch(async (url, options={}) => {
    calls.push({url:String(url),method:options.method||'GET'});
    if (String(url).includes('/rest/v1/recovery_stories?select=id,storage_path')) return fakeResponse(200,[{id:'story-1',storage_path:'stories/missing.jpg'}]);
    if (String(url).includes('/storage/v1/object/')) return fakeResponse(404,{message:'Object not found'});
    if (String(url).includes('/rest/v1/recovery_stories?id=eq.story-1')) return fakeResponse(204,'');
    return fakeResponse(500,{});
  });
  const res=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer test-cron-secret'}}),res);
  assert.equal(res.statusCode,200); assert.equal(res.json().deleted,1); assert.ok(calls.some(c=>c.url.includes('id=eq.story-1')&&c.method==='DELETE'));
});
test('22 cleanup does not delete DB row after transient storage failure', async () => {
  const calls=[]; setFetch(async (url, options={}) => {
    calls.push({url:String(url),method:options.method||'GET'});
    if (String(url).includes('/rest/v1/recovery_stories?select=id,storage_path')) return fakeResponse(200,[{id:'story-2',storage_path:'stories/one.jpg'}]);
    if (String(url).includes('/storage/v1/object/')) return fakeResponse(503,{message:'Storage unavailable'});
    return fakeResponse(204,'');
  });
  const res=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer test-cron-secret'}}),res);
  assert.equal(res.statusCode,503); assert.equal(calls.some(c=>c.url.includes('id=eq.story-2')&&c.method==='DELETE'),false);
});
test('23 cleanup returns retryable failure if DB deletion fails after object removal', async () => {
  setFetch(async (url, options={}) => {
    if (String(url).includes('/rest/v1/recovery_stories?select=id,storage_path')) return fakeResponse(200,[{id:'story-3',storage_path:'stories/three.jpg'}]);
    if (String(url).includes('/storage/v1/object/')) return fakeResponse(204,'');
    if (String(url).includes('/rest/v1/recovery_stories?id=eq.story-3')) return fakeResponse(500,{message:'DB down'});
    return fakeResponse(500,{});
  });
  const res=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer test-cron-secret'}}),res); assert.equal(res.statusCode,503);
});
test('24 cleanup skips records with unsafe storage paths', async () => {
  let dbDelete=false; setFetch(async (url, options={}) => {
    if (String(url).includes('/rest/v1/recovery_stories?select=id,storage_path')) return fakeResponse(200,[{id:'story-4',storage_path:'../private/file.jpg'}]);
    if (String(url).includes('/rest/v1/recovery_stories?id=eq.story-4') && options.method==='DELETE') dbDelete=true;
    return fakeResponse(204,'');
  });
  const res=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer test-cron-secret'}}),res); assert.equal(res.statusCode,200); assert.equal(res.json().deleted,0); assert.equal(dbDelete,false);
});
test('25 storage upload failure returns controlled service error', async () => {
  setFetch(async (url) => String(url).includes('/auth/v1/user') ? authResponse() : fakeResponse(503,{message:'storage unavailable'}));
  const res=response(); await storiesHandler(req('POST',{headers:{authorization:'Bearer admin'},body:validStoryBody()}),res); assert.equal(res.statusCode,503);
});
test('26 database insert failure attempts to remove uploaded object', async () => {
  const calls=[]; setFetch(async (url, options={}) => {
    calls.push({url:String(url),method:options.method||'GET'});
    if (String(url).includes('/auth/v1/user')) return authResponse();
    if (String(url).includes('/storage/v1/object/')) return fakeResponse(200,{});
    if (String(url).includes('/rest/v1/recovery_stories?select=id,caption,published_at')) return fakeResponse(500,{message:'database unavailable'});
    return fakeResponse(204,'');
  });
  const res=response(); await storiesHandler(req('POST',{headers:{authorization:'Bearer admin'},body:validStoryBody()}),res); assert.equal(res.statusCode,503); assert.ok(calls.some(c=>c.url.includes('/storage/v1/object/')&&c.method==='DELETE'));
});
test('27 cleanup retry succeeds after storage removal and first DB delete failure', async () => {
  let rowPresent = true; let objectPresent = true; let dbDeleteAttempts = 0;
  setFetch(async (url, options={}) => {
    const u=String(url); const method=options.method||'GET';
    if (u.includes('/rest/v1/recovery_stories?select=id,storage_path')) return fakeResponse(200,rowPresent?[{id:'story-retry',storage_path:'stories/retry.jpg'}]:[]);
    if (u.includes('/storage/v1/object/')) {
      if (!objectPresent) return fakeResponse(404,{message:'Object not found'});
      objectPresent=false; return fakeResponse(204,'');
    }
    if (u.includes('/rest/v1/recovery_stories?id=eq.story-retry') && method==='DELETE') {
      dbDeleteAttempts++;
      if (dbDeleteAttempts===1) return fakeResponse(500,{message:'temporary database failure'});
      rowPresent=false; return fakeResponse(204,'');
    }
    return fakeResponse(500,{});
  });
  const first=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer test-cron-secret'}}),first); assert.equal(first.statusCode,503); assert.equal(rowPresent,true); assert.equal(objectPresent,false);
  const second=response(); await cleanupHandler(req('GET',{headers:{authorization:'Bearer test-cron-secret'}}),second); assert.equal(second.statusCode,200); assert.equal(second.json().deleted,1); assert.equal(rowPresent,false); assert.equal(dbDeleteAttempts,2);
});
