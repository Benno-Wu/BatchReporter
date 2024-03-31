function t(t,e,n,r){return new(n||(n=Promise))((function(o,s){function i(t){try{c(r.next(t))}catch(t){s(t)}}function a(t){try{c(r.throw(t))}catch(t){s(t)}}function c(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(i,a)}c((r=r.apply(t,e||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;var e={};e.deprecate=(t,e)=>{let n=!0;return function(){return n&&(console.warn("DeprecationWarning: "+e),n=!1),t.apply(this,arguments)}};const n=e.deprecate((()=>{}),"Hook.context is deprecated and will be removed"),r=function(...t){return this.call=this._createCall("sync"),this.call(...t)},o=function(...t){return this.callAsync=this._createCall("async"),this.callAsync(...t)},s=function(...t){return this.promise=this._createCall("promise"),this.promise(...t)};let i=class{constructor(t=[],e=void 0){this._args=t,this.name=e,this.taps=[],this.interceptors=[],this._call=r,this.call=r,this._callAsync=o,this.callAsync=o,this._promise=s,this.promise=s,this._x=void 0,this.compile=this.compile,this.tap=this.tap,this.tapAsync=this.tapAsync,this.tapPromise=this.tapPromise}compile(t){throw new Error("Abstract: should be overridden")}_createCall(t){return this.compile({taps:this.taps,interceptors:this.interceptors,args:this._args,type:t})}_tap(t,e,r){if("string"==typeof e)e={name:e.trim()};else if("object"!=typeof e||null===e)throw new Error("Invalid tap options");if("string"!=typeof e.name||""===e.name)throw new Error("Missing name for tap");void 0!==e.context&&n(),e=Object.assign({type:t,fn:r},e),e=this._runRegisterInterceptors(e),this._insert(e)}tap(t,e){this._tap("sync",t,e)}tapAsync(t,e){this._tap("async",t,e)}tapPromise(t,e){this._tap("promise",t,e)}_runRegisterInterceptors(t){for(const e of this.interceptors)if(e.register){const n=e.register(t);void 0!==n&&(t=n)}return t}withOptions(t){const e=e=>Object.assign({},t,"string"==typeof e?{name:e}:e);return{name:this.name,tap:(t,n)=>this.tap(e(t),n),tapAsync:(t,n)=>this.tapAsync(e(t),n),tapPromise:(t,n)=>this.tapPromise(e(t),n),intercept:t=>this.intercept(t),isUsed:()=>this.isUsed(),withOptions:t=>this.withOptions(e(t))}}isUsed(){return this.taps.length>0||this.interceptors.length>0}intercept(t){if(this._resetCompilation(),this.interceptors.push(Object.assign({},t)),t.register)for(let e=0;e<this.taps.length;e++)this.taps[e]=t.register(this.taps[e])}_resetCompilation(){this.call=this._call,this.callAsync=this._callAsync,this.promise=this._promise}_insert(t){let e;this._resetCompilation(),"string"==typeof t.before?e=new Set([t.before]):Array.isArray(t.before)&&(e=new Set(t.before));let n=0;"number"==typeof t.stage&&(n=t.stage);let r=this.taps.length;for(;r>0;){r--;const t=this.taps[r];this.taps[r+1]=t;const o=t.stage||0;if(e){if(e.has(t.name)){e.delete(t.name);continue}if(e.size>0)continue}if(!(o>n)){r++;break}}this.taps[r]=t}};Object.setPrototypeOf(i.prototype,null);var a=i,c=class{constructor(t){this.config=t,this.options=void 0,this._args=void 0}create(t){let e;switch(this.init(t),this.options.type){case"sync":e=new Function(this.args(),'"use strict";\n'+this.header()+this.contentWithInterceptors({onError:t=>`throw ${t};\n`,onResult:t=>`return ${t};\n`,resultReturns:!0,onDone:()=>"",rethrowIfPossible:!0}));break;case"async":e=new Function(this.args({after:"_callback"}),'"use strict";\n'+this.header()+this.contentWithInterceptors({onError:t=>`_callback(${t});\n`,onResult:t=>`_callback(null, ${t});\n`,onDone:()=>"_callback();\n"}));break;case"promise":let t=!1;const n=this.contentWithInterceptors({onError:e=>(t=!0,`_error(${e});\n`),onResult:t=>`_resolve(${t});\n`,onDone:()=>"_resolve();\n"});let r="";r+='"use strict";\n',r+=this.header(),r+="return new Promise((function(_resolve, _reject) {\n",t&&(r+="var _sync = true;\n",r+="function _error(_err) {\n",r+="if(_sync)\n",r+="_resolve(Promise.resolve().then((function() { throw _err; })));\n",r+="else\n",r+="_reject(_err);\n",r+="};\n"),r+=n,t&&(r+="_sync = false;\n"),r+="}));\n",e=new Function(this.args(),r)}return this.deinit(),e}setup(t,e){t._x=e.taps.map((t=>t.fn))}init(t){this.options=t,this._args=t.args.slice()}deinit(){this.options=void 0,this._args=void 0}contentWithInterceptors(t){if(this.options.interceptors.length>0){const e=t.onError,n=t.onResult,r=t.onDone;let o="";for(let t=0;t<this.options.interceptors.length;t++){const e=this.options.interceptors[t];e.call&&(o+=`${this.getInterceptor(t)}.call(${this.args({before:e.context?"_context":void 0})});\n`)}return o+=this.content(Object.assign(t,{onError:e&&(t=>{let n="";for(let e=0;e<this.options.interceptors.length;e++)this.options.interceptors[e].error&&(n+=`${this.getInterceptor(e)}.error(${t});\n`);return n+=e(t),n}),onResult:n&&(t=>{let e="";for(let n=0;n<this.options.interceptors.length;n++)this.options.interceptors[n].result&&(e+=`${this.getInterceptor(n)}.result(${t});\n`);return e+=n(t),e}),onDone:r&&(()=>{let t="";for(let e=0;e<this.options.interceptors.length;e++)this.options.interceptors[e].done&&(t+=`${this.getInterceptor(e)}.done();\n`);return t+=r(),t})})),o}return this.content(t)}header(){let t="";return this.needContext()?t+="var _context = {};\n":t+="var _context;\n",t+="var _x = this._x;\n",this.options.interceptors.length>0&&(t+="var _taps = this.taps;\n",t+="var _interceptors = this.interceptors;\n"),t}needContext(){for(const t of this.options.taps)if(t.context)return!0;return!1}callTap(t,{onError:e,onResult:n,onDone:r,rethrowIfPossible:o}){let s="",i=!1;for(let e=0;e<this.options.interceptors.length;e++){const n=this.options.interceptors[e];n.tap&&(i||(s+=`var _tap${t} = ${this.getTap(t)};\n`,i=!0),s+=`${this.getInterceptor(e)}.tap(${n.context?"_context, ":""}_tap${t});\n`)}s+=`var _fn${t} = ${this.getTapFn(t)};\n`;const a=this.options.taps[t];switch(a.type){case"sync":o||(s+=`var _hasError${t} = false;\n`,s+="try {\n"),s+=n?`var _result${t} = _fn${t}(${this.args({before:a.context?"_context":void 0})});\n`:`_fn${t}(${this.args({before:a.context?"_context":void 0})});\n`,o||(s+="} catch(_err) {\n",s+=`_hasError${t} = true;\n`,s+=e("_err"),s+="}\n",s+=`if(!_hasError${t}) {\n`),n&&(s+=n(`_result${t}`)),r&&(s+=r()),o||(s+="}\n");break;case"async":let i="";i+=n?`(function(_err${t}, _result${t}) {\n`:`(function(_err${t}) {\n`,i+=`if(_err${t}) {\n`,i+=e(`_err${t}`),i+="} else {\n",n&&(i+=n(`_result${t}`)),r&&(i+=r()),i+="}\n",i+="})",s+=`_fn${t}(${this.args({before:a.context?"_context":void 0,after:i})});\n`;break;case"promise":s+=`var _hasResult${t} = false;\n`,s+=`var _promise${t} = _fn${t}(${this.args({before:a.context?"_context":void 0})});\n`,s+=`if (!_promise${t} || !_promise${t}.then)\n`,s+=`  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${t} + ')');\n`,s+=`_promise${t}.then((function(_result${t}) {\n`,s+=`_hasResult${t} = true;\n`,n&&(s+=n(`_result${t}`)),r&&(s+=r()),s+=`}), function(_err${t}) {\n`,s+=`if(_hasResult${t}) throw _err${t};\n`,s+=e(`_err${t}`),s+="});\n"}return s}callTapsSeries({onError:t,onResult:e,resultReturns:n,onDone:r,doneReturns:o,rethrowIfPossible:s}){if(0===this.options.taps.length)return r();const i=this.options.taps.findIndex((t=>"sync"!==t.type)),a=n||o;let c="",l=r,h=0;for(let n=this.options.taps.length-1;n>=0;n--){const o=n;l!==r&&("sync"!==this.options.taps[o].type||h++>20)&&(h=0,c+=`function _next${o}() {\n`,c+=l(),c+="}\n",l=()=>`${a?"return ":""}_next${o}();\n`);const p=l,u=t=>t?"":r(),f=this.callTap(o,{onError:e=>t(o,e,p,u),onResult:e&&(t=>e(o,t,p,u)),onDone:!e&&p,rethrowIfPossible:s&&(i<0||o<i)});l=()=>f}return c+=l(),c}callTapsLooping({onError:t,onDone:e,rethrowIfPossible:n}){if(0===this.options.taps.length)return e();const r=this.options.taps.every((t=>"sync"===t.type));let o="";r||(o+="var _looper = (function() {\n",o+="var _loopAsync = false;\n"),o+="var _loop;\n",o+="do {\n",o+="_loop = false;\n";for(let t=0;t<this.options.interceptors.length;t++){const e=this.options.interceptors[t];e.loop&&(o+=`${this.getInterceptor(t)}.loop(${this.args({before:e.context?"_context":void 0})});\n`)}return o+=this.callTapsSeries({onError:t,onResult:(t,e,n,o)=>{let s="";return s+=`if(${e} !== undefined) {\n`,s+="_loop = true;\n",r||(s+="if(_loopAsync) _looper();\n"),s+=o(!0),s+="} else {\n",s+=n(),s+="}\n",s},onDone:e&&(()=>{let t="";return t+="if(!_loop) {\n",t+=e(),t+="}\n",t}),rethrowIfPossible:n&&r}),o+="} while(_loop);\n",r||(o+="_loopAsync = true;\n",o+="});\n",o+="_looper();\n"),o}callTapsParallel({onError:t,onResult:e,onDone:n,rethrowIfPossible:r,onTap:o=((t,e)=>e())}){if(this.options.taps.length<=1)return this.callTapsSeries({onError:t,onResult:e,onDone:n,rethrowIfPossible:r});let s="";s+="do {\n",s+=`var _counter = ${this.options.taps.length};\n`,n&&(s+="var _done = (function() {\n",s+=n(),s+="});\n");for(let i=0;i<this.options.taps.length;i++){const a=()=>n?"if(--_counter === 0) _done();\n":"--_counter;",c=t=>t||!n?"_counter = 0;\n":"_counter = 0;\n_done();\n";s+="if(_counter <= 0) break;\n",s+=o(i,(()=>this.callTap(i,{onError:e=>{let n="";return n+="if(_counter > 0) {\n",n+=t(i,e,a,c),n+="}\n",n},onResult:e&&(t=>{let n="";return n+="if(_counter > 0) {\n",n+=e(i,t,a,c),n+="}\n",n}),onDone:!e&&(()=>a()),rethrowIfPossible:r})),a,c)}return s+="} while(false);\n",s}args({before:t,after:e}={}){let n=this._args;return t&&(n=[t].concat(n)),e&&(n=n.concat(e)),0===n.length?"":n.join(", ")}getTapFn(t){return`_x[${t}]`}getTap(t){return`_taps[${t}]`}getInterceptor(t){return`_interceptors[${t}]`}};const l=a,h=c,p=new class extends h{content({onError:t,onDone:e,rethrowIfPossible:n}){return this.callTapsSeries({onError:(e,n)=>t(n),onDone:e,rethrowIfPossible:n})}},u=()=>{throw new Error("tapAsync is not supported on a SyncHook")},f=()=>{throw new Error("tapPromise is not supported on a SyncHook")},_=function(t){return p.setup(this,t),p.create(t)};function d(t=[],e=void 0){const n=new l(t,e);return n.constructor=d,n.tapAsync=u,n.tapPromise=f,n.compile=_,n}d.prototype=null;var g=d;const y=a,m=c,w=new class extends m{content({onError:t,onResult:e,onDone:n}){return this.callTapsSeries({onError:(e,n,r,o)=>t(n)+o(!0),onResult:(t,e,n)=>{let r="";return r+=`if(${e} !== undefined) {\n`,r+=`${this._args[0]} = ${e};\n`,r+="}\n",r+=n(),r},onDone:()=>e(this._args[0])})}},v=function(t){return w.setup(this,t),w.create(t)};function $(t=[],e=void 0){if(t.length<1)throw new Error("Waterfall hooks must have at least one argument");const n=new y(t,e);return n.constructor=$,n.compile=v,n._call=void 0,n.call=void 0,n}$.prototype=null;var b=$;const k=e;k.deprecate((function(t,e,n){return this.for(t).tap(e,n)}),"HookMap#tap(key,…) is deprecated. Use HookMap#for(key).tap(…) instead."),k.deprecate((function(t,e,n){return this.for(t).tapAsync(e,n)}),"HookMap#tapAsync(key,…) is deprecated. Use HookMap#for(key).tapAsync(…) instead."),k.deprecate((function(t,e,n){return this.for(t).tapPromise(e,n)}),"HookMap#tapPromise(key,…) is deprecated. Use HookMap#for(key).tapPromise(…) instead.");var E=g,x=b;const I={autostart:!1,retry:3,delay:3e3};class P{cache=[];retryCount=0;config=I;constructor(t){this.config=Object.assign(I,t),this.config.autostart&&this.start()}hooks={dump:new x(["data"]),load:new x};optionalHooks={onLoadEnd:new E,onPushEnd:new E,onLoadFail:new E(["error"]),onDumpFail:new E(["data"]),onLastSyncFail:new E(["data"]),onError:new E(["error"])};lastChanceToSync=()=>{this.config.sendBeacon(this.cache)?(this.cache=[],this.tryDump()):this.optionalHooks.onLastSyncFail.call(this.cache)};start=async()=>{let t=[];try{t=await this.hooks.load.promise(),this.optionalHooks.onLoadEnd.call()}catch(t){return this.optionalHooks.onLoadFail.call(t),this.optionalHooks.onError.call(t),!1}return this.cache.push(...t),this.config.setInterval(this.intervalRequest,this.config.delay),!0};#t=()=>{};push=t=>{this.cache.push(t),this.tryDump(),this.optionalHooks.onPushEnd.call()};tryDump=async()=>this.retryCount>=this.config.retry?(this.optionalHooks.onDumpFail.call(this.cache),this.retryCount=0,!1):await this.hooks.dump.promise(this.cache)?(this.retryCount=0,!0):(this.retryCount++,this.tryDump());intervalRequest=async()=>{try{if(0===this.cache.length)return;if(!await this.config.request(this.cache))throw new Error("[core] intervalRequest fail");this.cache=[],this.tryDump()}catch(t){this.optionalHooks.onError.call(t)}}}const D={enableLastSync:!0,dumpFormatter:t=>JSON.stringify(t),loadFormatter:t=>JSON.parse(t),beaconTransform:t=>t};class R extends P{constructor(e){const n=Object.assign(D,e);super({request:n.request,sendBeacon:t=>navigator.sendBeacon(n.beaconUrl,n.beaconTransform(t)),setInterval:globalThis.setInterval}),this.webConfig=D,this.webConfig=n,e.enableLastSync&&document.addEventListener("visibilitychange",(()=>{"hidden"===document.visibilityState&&this.lastChanceToSync()})),this.hooks.dump.tapPromise("webDump",(e=>t(this,void 0,void 0,(function*(){if(!localStorage)return!1;try{return localStorage.setItem(this.webConfig.dumpKey,this.webConfig.dumpFormatter(e)),!0}catch(t){return this.optionalHooks.onError.call(t),!1}})))),this.hooks.load.tapPromise("webLoad",(()=>{var t;if(!localStorage)throw new Error("[web] localStorage is not supported");return this.webConfig.loadFormatter(null!==(t=localStorage.getItem(this.webConfig.dumpKey))&&void 0!==t?t:"[]")}))}}export{R as WebBatchReporter,R as default};