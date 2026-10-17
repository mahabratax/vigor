/* The MIT License (MIT)

Copyright (c) 2015-present Jason Miller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
/* Vigor portable preview · Preact MIT adapter · TypeScript 5.8.3 */
(function(){'use strict';window.__VIGOR_PORTABLE__=true;const P=(function(){// Preact, MIT License
var n,l,u,i,t,o,r={},f=[],e=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function c(e,n){for(var t in n)e[t]=n[t];return e}function s(e){var n=e.parentNode;n&&n.removeChild(e)}function a(e,n,t){var _,l,o,r=arguments,i={};for(o in n)"key"==o?_=n[o]:"ref"==o?l=n[o]:i[o]=n[o];if(arguments.length>3)for(t=[t],o=3;o<arguments.length;o++)t.push(r[o]);if(null!=t&&(i.children=t),"function"==typeof e&&null!=e.defaultProps)for(o in e.defaultProps)void 0===i[o]&&(i[o]=e.defaultProps[o]);return v(e,i,_,l,null)}function v(e,t,_,l,o){var r={type:e,props:t,key:_,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++n.__v:o};return null!=n.vnode&&n.vnode(r),r}function h(){return{current:null}}function y(e){return e.children}function p(e,n){this.props=e,this.context=n}function d(e,n){if(null==n)return e.__?d(e.__,e.__.__k.indexOf(e)+1):null;for(var t;n<e.__k.length;n++)if(null!=(t=e.__k[n])&&null!=t.__e)return t.__e;return"function"==typeof e.type?d(e):null}function _(e){var n,t;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,n=0;n<e.__k.length;n++)if(null!=(t=e.__k[n])&&null!=t.__e){e.__e=e.__c.base=t.__e;break}return _(e)}}function k(e){(!e.__d&&(e.__d=!0)&&u.push(e)&&!b.__r++||t!==n.debounceRendering)&&((t=n.debounceRendering)||i)(b)}function b(){for(var e;b.__r=u.length;)e=u.sort(function(e,n){return e.__v.__b-n.__v.__b}),u=[],e.some(function(e){var n,t,l,o,r,i;e.__d&&(r=(o=(n=e).__v).__e,(i=n.__P)&&(t=[],(l=c({},o)).__v=o.__v+1,I(i,o,l,n.__n,void 0!==i.ownerSVGElement,null!=o.__h?[r]:null,t,null==r?d(o):r,o.__h),T(t,o),o.__e!=r&&_(o)))})}function m(e,n,t,_,l,o,i,u,s,c){var p,a,h,m,k,b,C,P=_&&_.__k||f,S=P.length;for(t.__k=[],p=0;p<n.length;p++)if(null!=(m=t.__k[p]=null==(m=n[p])||"boolean"==typeof m?null:"string"==typeof m||"number"==typeof m||"bigint"==typeof m?v(null,m,null,null,m):Array.isArray(m)?v(y,{children:m},null,null,null):m.__b>0?v(m.type,m.props,m.key,null,m.__v):m)){if(m.__=t,m.__b=t.__b+1,null===(h=P[p])||h&&m.key==h.key&&m.type===h.type)P[p]=void 0;else for(a=0;a<S;a++){if((h=P[a])&&m.key==h.key&&m.type===h.type){P[a]=void 0;break}h=null}I(e,m,h=h||r,l,o,i,u,s,c),k=m.__e,(a=m.ref)&&h.ref!=a&&(C||(C=[]),h.ref&&C.push(h.ref,null,m),C.push(a,m.__c||k,m)),null!=k?(null==b&&(b=k),"function"==typeof m.type&&null!=m.__k&&m.__k===h.__k?m.__d=s=g(m,s,e):s=x(e,m,h,P,k,s),c||"option"!==t.type?"function"==typeof t.type&&(t.__d=s):e.value=""):s&&h.__e==s&&s.parentNode!=e&&(s=d(h))}for(t.__e=b,p=S;p--;)null!=P[p]&&("function"==typeof t.type&&null!=P[p].__e&&P[p].__e==t.__d&&(t.__d=d(_,p+1)),L(P[p],P[p]));if(C)for(p=0;p<C.length;p++)z(C[p],C[++p],C[++p])}function g(e,n,t){var _,l;for(_=0;_<e.__k.length;_++)(l=e.__k[_])&&(l.__=e,n="function"==typeof l.type?g(l,n,t):x(t,l,l,e.__k,l.__e,n));return n}function w(e,n){return n=n||[],null==e||"boolean"==typeof e||(Array.isArray(e)?e.some(function(e){w(e,n)}):n.push(e)),n}function x(e,n,t,_,l,o){var r,i,u;if(void 0!==n.__d)r=n.__d,n.__d=void 0;else if(null==t||l!=o||null==l.parentNode)e:if(null==o||o.parentNode!==e)e.appendChild(l),r=null;else{for(i=o,u=0;(i=i.nextSibling)&&u<_.length;u+=2)if(i==l)break e;e.insertBefore(l,o),r=o}return void 0!==r?r:l.nextSibling}function A(e,n,t,_,l){var o;for(o in t)"children"===o||"key"===o||o in n||C(e,o,null,t[o],_);for(o in n)l&&"function"!=typeof n[o]||"children"===o||"key"===o||"value"===o||"checked"===o||t[o]===n[o]||C(e,o,n[o],t[o],_)}function P(n,t,_){"-"===t[0]?n.setProperty(t,_):n[t]=null==_?"":"number"!=typeof _||e.test(t)?_:_+"px"}function C(e,n,t,_,l){var o;e:if("style"===n)if("string"==typeof t)e.style.cssText=t;else{if("string"==typeof _&&(e.style.cssText=_=""),_)for(n in _)t&&n in t||P(e.style,n,"");if(t)for(n in t)_&&t[n]===_[n]||P(e.style,n,t[n])}else if("o"===n[0]&&"n"===n[1])o=n!==(n=n.replace(/Capture$/,"")),n=n.toLowerCase()in e?n.toLowerCase().slice(2):n.slice(2),e.l||(e.l={}),e.l[n+o]=t,t?_||e.addEventListener(n,o?H:$,o):e.removeEventListener(n,o?H:$,o);else if("dangerouslySetInnerHTML"!==n){if(l)n=n.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==n&&"list"!==n&&"form"!==n&&"tabIndex"!==n&&"download"!==n&&n in e)try{e[n]=null==t?"":t;break e}catch(e){}"function"==typeof t||(null!=t&&(!1!==t||"a"===n[0]&&"r"===n[1])?e.setAttribute(n,t):e.removeAttribute(n))}}function $(e){this.l[e.type+!1](n.event?n.event(e):e)}function H(e){this.l[e.type+!0](n.event?n.event(e):e)}function I(e,t,_,l,o,r,i,u,s){var f,a,d,h,v,k,g,b,C,x,P,S=t.type;if(void 0!==t.constructor)return null;null!=_.__h&&(s=_.__h,u=t.__e=_.__e,t.__h=null,r=[u]),(f=n.__b)&&f(t);try{e:if("function"==typeof S){if(b=t.props,C=(f=S.contextType)&&l[f.__c],x=f?C?C.props.value:f.__:l,_.__c?g=(a=t.__c=_.__c).__=a.__E:("prototype"in S&&S.prototype.render?t.__c=a=new S(b,x):(t.__c=a=new p(b,x),a.constructor=S,a.render=M),C&&C.sub(a),a.props=b,a.state||(a.state={}),a.context=x,a.__n=l,d=a.__d=!0,a.__h=[]),null==a.__s&&(a.__s=a.state),null!=S.getDerivedStateFromProps&&(a.__s==a.state&&(a.__s=c({},a.__s)),c(a.__s,S.getDerivedStateFromProps(b,a.__s))),h=a.props,v=a.state,d)null==S.getDerivedStateFromProps&&null!=a.componentWillMount&&a.componentWillMount(),null!=a.componentDidMount&&a.__h.push(a.componentDidMount);else{if(null==S.getDerivedStateFromProps&&b!==h&&null!=a.componentWillReceiveProps&&a.componentWillReceiveProps(b,x),!a.__e&&null!=a.shouldComponentUpdate&&!1===a.shouldComponentUpdate(b,a.__s,x)||t.__v===_.__v){a.props=b,a.state=a.__s,t.__v!==_.__v&&(a.__d=!1),a.__v=t,t.__e=_.__e,t.__k=_.__k,t.__k.forEach(function(e){e&&(e.__=t)}),a.__h.length&&i.push(a);break e}null!=a.componentWillUpdate&&a.componentWillUpdate(b,a.__s,x),null!=a.componentDidUpdate&&a.__h.push(function(){a.componentDidUpdate(h,v,k)})}a.context=x,a.props=b,a.state=a.__s,(f=n.__r)&&f(t),a.__d=!1,a.__v=t,a.__P=e,f=a.render(a.props,a.state,a.context),a.state=a.__s,null!=a.getChildContext&&(l=c(c({},l),a.getChildContext())),d||null==a.getSnapshotBeforeUpdate||(k=a.getSnapshotBeforeUpdate(h,v)),P=null!=f&&f.type===y&&null==f.key?f.props.children:f,m(e,Array.isArray(P)?P:[P],t,_,l,o,r,i,u,s),a.base=t.__e,t.__h=null,a.__h.length&&i.push(a),g&&(a.__E=a.__=null),a.__e=!1}else null==r&&t.__v===_.__v?(t.__k=_.__k,t.__e=_.__e):t.__e=j(_.__e,t,_,l,o,r,i,s);(f=n.diffed)&&f(t)}catch(e){t.__v=null,(s||null!=r)&&(t.__e=u,t.__h=!!s,r[r.indexOf(u)]=null),n.__e(e,t,_)}}function T(e,t){n.__c&&n.__c(t,e),e.some(function(t){try{e=t.__h,t.__h=[],e.some(function(e){e.call(t)})}catch(e){n.__e(e,t.__v)}})}function j(e,n,t,_,l,o,i,u){var c,p,a,d,h=t.props,v=n.props,y=n.type,k=0;if("svg"===y&&(l=!0),null!=o)for(;k<o.length;k++)if((c=o[k])&&(c===e||(y?c.localName==y:3==c.nodeType))){e=c,o[k]=null;break}if(null==e){if(null===y)return document.createTextNode(v);e=l?document.createElementNS("http://www.w3.org/2000/svg",y):document.createElement(y,v.is&&v),o=null,u=!1}if(null===y)h===v||u&&e.data===v||(e.data=v);else{if(o=o&&f.slice.call(e.childNodes),p=(h=t.props||r).dangerouslySetInnerHTML,a=v.dangerouslySetInnerHTML,!u){if(null!=o)for(h={},d=0;d<e.attributes.length;d++)h[e.attributes[d].name]=e.attributes[d].value;(a||p)&&(a&&(p&&a.__html==p.__html||a.__html===e.innerHTML)||(e.innerHTML=a&&a.__html||""))}if(A(e,v,h,l,u),a)n.__k=[];else if(k=n.props.children,m(e,Array.isArray(k)?k:[k],n,t,_,l&&"foreignObject"!==y,o,i,e.firstChild,u),null!=o)for(k=o.length;k--;)null!=o[k]&&s(o[k]);u||("value"in v&&void 0!==(k=v.value)&&(k!==e.value||"progress"===y&&!k)&&C(e,"value",k,h.value,!1),"checked"in v&&void 0!==(k=v.checked)&&k!==e.checked&&C(e,"checked",k,h.checked,!1))}return e}function z(e,t,_){try{"function"==typeof e?e(t):e.current=t}catch(e){n.__e(e,_)}}function L(e,t,_){var l,o,r;if(n.unmount&&n.unmount(e),(l=e.ref)&&(l.current&&l.current!==e.__e||z(l,null,t)),_||"function"==typeof e.type||(_=null!=(o=e.__e)),e.__e=e.__d=void 0,null!=(l=e.__c)){if(l.componentWillUnmount)try{l.componentWillUnmount()}catch(e){n.__e(e,t)}l.base=l.__P=null}if(l=e.__k)for(r=0;r<l.length;r++)l[r]&&L(l[r],t,_);null!=o&&s(o)}function M(e,n,t){return this.constructor(e,t)}function N(e,t,_){var l,o,i;n.__&&n.__(e,t),o=(l="function"==typeof _)?null:_&&_.__k||t.__k,i=[],I(t,e=(!l&&_||t).__k=a(y,null,[e]),o||r,r,void 0!==t.ownerSVGElement,!l&&_?[_]:o?null:t.firstChild?f.slice.call(t.childNodes):null,i,!l&&_?_:o?o.__e:t.firstChild,l),T(i,e)}function O(e,n){N(e,n,O)}function S(e,n,t){var _,l,o,r=arguments,i=c({},e.props);for(o in n)"key"==o?_=n[o]:"ref"==o?l=n[o]:i[o]=n[o];if(arguments.length>3)for(t=[t],o=3;o<arguments.length;o++)t.push(r[o]);return null!=t&&(i.children=t),v(e.type,i,_||e.key,l||e.ref,null)}function q(e,n){var t={__c:n="__cC"+o++,__:e,Consumer:function(e,n){return e.children(n)},Provider:function(e){var t,_;return this.getChildContext||(t=[],(_={})[n]=this,this.getChildContext=function(){return _},this.shouldComponentUpdate=function(e){this.props.value!==e.value&&t.some(k)},this.sub=function(e){t.push(e);var n=e.componentWillUnmount;e.componentWillUnmount=function(){t.splice(t.indexOf(e),1),n&&n.call(e)}}),e.children}};return t.Provider.__=t.Consumer.contextType=t}n={__e:function(e,n){for(var t,_,l;n=n.__;)if((t=n.__c)&&!t.__)try{if((_=t.constructor)&&null!=_.getDerivedStateFromError&&(t.setState(_.getDerivedStateFromError(e)),l=t.__d),null!=t.componentDidCatch&&(t.componentDidCatch(e),l=t.__d),l)return t.__E=t}catch(n){e=n}throw e},__v:0},l=function(e){return null!=e&&void 0===e.constructor},p.prototype.setState=function(e,n){var t;t=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=c({},this.state),"function"==typeof e&&(e=e(c({},t),this.props)),e&&c(t,e),null!=e&&this.__v&&(n&&this.__h.push(n),k(this))},p.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),k(this))},p.prototype.render=y,u=[],i="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,b.__r=0,o=0;return {render:N,hydrate:O,createElement:a,h:a,Fragment:y,createRef:h,isValidElement:l,Component:p,cloneElement:S,createContext:q,toChildArray:w,options:n};})();const initializedSelects=new WeakSet();
function reactElement(type,props,...children){if(type==='option'&&(!props||props.value===undefined)){props={...(props||{}),value:children.flat(Infinity).filter(x=>typeof x==='string'||typeof x==='number').join('')};}if(type==='select'&&props&&props.defaultValue!==undefined){const p={...props};const value=p.defaultValue,ref=p.ref;delete p.defaultValue;p.ref=node=>{if(node&&!initializedSelects.has(node)){node.value=String(value);initializedSelects.add(node);}if(typeof ref==='function')ref(node);else if(ref)ref.current=node;};return P.h(type,p,...children);}return P.h(type,props,...children);}
const React={...P,createElement:reactElement,default:null,lazy:()=>()=>null,Suspense:({children})=>children};React.default=React;
const iconPaths={House:['M3 10l9-7 9 7','M5 9v11h14V9','M9 20v-7h6v7'],Sprout:['M12 22v-9','M12 13C3 14 3 6 3 6c9-1 9 7 9 7Z','M12 10s0-8 9-7c0 0 0 8-9 7Z'],Bug:['M9 3l1 3m4 0 1-3','M8 9h8v7a4 4 0 0 1-8 0V9Z','M9 9V7h6v2','M3 9l5 2m8 0 5-2M3 15h5m8 0h5M4 21l4-3m8 0 4 3','M12 10v10'],Leaf:['M20 3C2 1 0 18 9 20c9 3 13-8 11-17Z','M4 20 15 9'],Workflow:['M5 5h5v5H5zM14 14h5v5h-5z','M10 7h6v7','M7 10v6h7'],Cpu:['M6 6h12v12H6zM9 9h6v6H9z','M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3'],History:['M3 11a9 9 0 1 1 2 7','M3 4v7h7','M12 7v5l3 2'],Wallet:['M3 6h16v14H3z','M3 6V4h14v2','M15 11h6v5h-6z'],Plus:['M12 5v14M5 12h14'],ChevronRight:['m9 5 7 7-7 7'],ChevronDown:['m5 9 7 7 7-7'],ArrowUpRight:['M7 17 17 7M7 7h10v10'],ArrowDownRight:['M7 7 17 17M7 17h10V7'],ArrowRight:['M4 12h16m-6-6 6 6-6 6'],ArrowLeft:['M20 12H4m6-6-6 6 6 6'],Check:['m5 12 4 4 10-10'],TriangleAlert:['m12 3 10 18H2L12 3Z','M12 9v5m0 3v.01'],Clock:['M12 8v5l3 2'],CalendarDays:['M4 5h16v16H4zM4 10h16M8 2v6m8-6v6','M8 14h2m4 0h2m-8 4h2m4 0h2'],Play:['m7 4 14 8-14 8V4Z'],Pause:['M8 5v14M16 5v14'],Square:['M5 5h14v14H5z'],Search:['M16 16l5 5'],X:['M6 6l12 12M6 18 18 6'],Settings2:['M4 7h9m4 0h3M4 17h3m4 0h9','M13 4v6M7 14v6'],Droplets:['M12 3S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12-7-12Z'],Thermometer:['M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z','M12 9v9'],Wind:['M3 7h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h6a3 3 0 1 1-3 3'],FlaskConical:['M9 3h6M10 3v7L4 21h16l-6-11V3','M7 16h10'],Zap:['m13 2-9 12h7l-1 8 10-13h-7l0-7Z'],Wifi:['M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0','M12 20h.01'],Wrench:['M14 3a6 6 0 0 0-6 8L3 17a3 3 0 0 0 4 4l6-6a6 6 0 0 0 8-6l-4 3-4-4 3-4Z'],Camera:['M3 7h4l2-3h6l2 3h4v14H3V7Z'],Layers:['m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5'],Maximize2:['M8 3H3v5M16 3h5v5M3 16v5h5m8 0h5v-5'],Printer:['M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6z'],Download:['M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'],FileText:['M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 17h8'],SlidersHorizontal:['M3 6h18M3 12h18M3 18h18M7 3v6M16 9v6M9 15v6'],MoreHorizontal:['M4 12h.01M12 12h.01M20 12h.01'],Link:['M10 13a5 5 0 0 0 7 0l4-4a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-4 4a5 5 0 0 0 7 7l2-2'],RotateCcw:['M3 11a9 9 0 1 1 2 7M3 4v7h7'],ShieldCheck:['M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4Z','m8 12 3 3 5-5'],Users:['M3 21v-3a5 5 0 0 1 10 0v3M16 14a4 4 0 0 1 5 4v3'],Info:['M12 11v6M12 7h.01'],Menu:['M3 6h18M3 12h18M3 18h18'],LayoutGrid:['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],Sun:['M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1'],MapPin:['M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13Z'],ExternalLink:['M14 3h7v7m-9 2 9-9M10 3H3v18h18v-7'],Trash2:['M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7'],Pencil:['m4 16 12-12 4 4-12 12-5 1 1-5Z','m13 7 4 4'],Undo2:['M4 5v7h7M4 12a9 9 0 0 1 16 6'],Package:['m12 2 10 5v10l-10 5-10-5V7l10-5ZM2 7l10 5 10-5M12 12v10M7 4.5l10 5v4'],HelpCircle:['M9 8a3 3 0 1 1 4 3l-1 2m0 4h.01'],CheckCircle2:['m7 12 3 3 7-7'],Eye:['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z'],Coins:['M4 6c0-2 4-4 8-4s8 2 8 4-4 4-8 4-8-2-8-4Zm0 0v12c0 2 4 4 8 4s8-2 8-4V6M4 12c0 2 4 4 8 4s8-2 8-4']};
const circleFor={Clock:[12,12,9],Search:[10,10,6],Camera:[12,14,4],Info:[12,12,9],Sun:[12,12,4],HelpCircle:[12,12,9],CheckCircle2:[12,12,9],Eye:[12,12,3],Users:[8,7,4],MapPin:[12,9,2.5]};
const lucide={};Object.keys(iconPaths).forEach(name=>{lucide[name]=function(props){const{size=18,strokeWidth=1.7,...rest}=props||{};const parts=(iconPaths[name]||[]).map((d,i)=>P.h('path',{d,key:i}));if(circleFor[name]){const[cx,cy,r]=circleFor[name];parts.push(P.h('circle',{cx,cy,r,key:'circle'}));}return P.h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':strokeWidth,'stroke-linecap':'round','stroke-linejoin':'round',...rest},parts);};});
function createStore(){return function(initializer){let current;const listeners=new Set();const get=()=>current;const set=(partial,replace=false)=>{const prev=current;const next=typeof partial==='function'?partial(current):partial;current=replace?next:{...current,...next};listeners.forEach(fn=>fn(current,prev));};current=initializer(set,get);return{getState:get,setState:set,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};};}
const router={HashRouter:({children})=>children,Route:()=>null,Routes:({children})=>{const path=(location.hash.slice(1)||'/ringkasan').split('?')[0];const items=P.toChildArray(children);const match=items.find(x=>x?.props?.path===path)||items.find(x=>x?.props?.path==='*');return match?.props.element??null;},NavLink:({to,children,className,onClick,...rest})=>P.h('a',{href:'#'+to,className:typeof className==='function'?className({isActive:location.hash.split('?')[0]==='#'+to}):className,onClick,...rest},children),Link:({to,children,...rest})=>P.h('a',{href:'#'+to,...rest},children)};
const recharts=new Proxy({},{get:()=>()=>null});
const externals={'react':React,'react-dom/client':{createRoot:el=>({render:node=>P.render(node,el)})},'zustand/vanilla':{createStore},'lucide-react':lucide,'react-router':router,'recharts':recharts};

const modules={"app/App":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_1 = require("react-router");
const ui_1 = require("../components/ui");
const assets_1 = require("../data/assets");
const format_1 = require("../domain/format");
const Automation_1 = require("../features/automation/Automation");
const Control_1 = require("../features/control/Control");
const Costs_1 = __importDefault(require("../features/costs/Costs"));
const Devices_1 = __importDefault(require("../features/devices/Devices"));
const Greenhouse_1 = require("../features/greenhouse/Greenhouse");
const History_1 = __importDefault(require("../features/history/History"));
const Overview_1 = require("../features/overview/Overview");
const Pests_1 = require("../features/pests/Pests");
const store_1 = require("../store/store");
const Modals_1 = __importDefault(require("./Modals"));
const navItems = [{ path: '/ringkasan', label: 'Ringkasan', icon: 'home', subtitle: 'Prioritas, pengamatan, dan operasional kebun hari ini.' }, { path: '/greenhouse', label: 'Greenhouse', icon: 'greenhouse', subtitle: 'Pahami kondisi kebun, satu zona pada satu waktu.' }, { path: '/hama', label: 'Hama & inspeksi', icon: 'bug', subtitle: 'Dari bukti pengamatan ke pemeriksaan tanaman.' }, { path: '/pengendalian', label: 'Pengendalian', icon: 'shield', subtitle: 'Rencanakan tindakan, pantau pelaksanaan, dan tinjau hasilnya.' }, { path: '/otomasi', label: 'Otomasi & rutinitas', icon: 'workflow', subtitle: 'Rutinitas berjalan, Anda tetap memegang kendali.' }, { path: '/perangkat', label: 'Perangkat', icon: 'devices', subtitle: 'Pantau kondisi, pemakaian, dan biaya perangkat kebun.' }, { path: '/riwayat', label: 'Riwayat & laporan', icon: 'history', subtitle: 'Telusuri pengamatan, tindakan, dan hasil operasional.' }, { path: '/biaya', label: 'Biaya & penghematan', icon: 'wallet', subtitle: 'Pantau pengeluaran dan pahami perubahan biaya kebun.' }];
function locationInfo() { const hash = window.location.hash.replace(/^#/, '') || '/ringkasan', parts = hash.split('?'); return { path: parts[0] === '/' ? '/ringkasan' : parts[0], query: parts.slice(1).join('?') }; }
class App extends react_1.default.Component {
    state = { data: store_1.store.getState().data, ...locationInfo(), mobile: window.innerWidth < 1024, menu: false, modal: null, toast: null, resumeNotice: false };
    unsubscribe = () => { };
    timer;
    toastTimer;
    changed = () => this.setState({ ...locationInfo(), menu: false });
    resized = () => this.setState({ mobile: window.innerWidth < 1024 });
    visibility = () => {
        if (document.hidden && store_1.store.getState().data.playing) {
            store_1.store.getState().dispatch({ type: 'play', value: false });
            this.setState({ resumeNotice: true });
        }
    };
    componentDidMount() {
        if (!window.location.hash || window.location.hash === '#/')
            window.location.hash = '/ringkasan';
        this.unsubscribe = store_1.store.subscribe(s => this.setState({ data: s.data }));
        window.addEventListener('hashchange', this.changed);
        window.addEventListener('resize', this.resized);
        document.addEventListener('visibilitychange', this.visibility);
        this.timer = setInterval(() => {
            const s = store_1.store.getState().data;
            if (s.playing && !document.hidden)
                store_1.store.getState().dispatch({ type: 'tick', seconds: s.speed });
        }, 1000);
    }
    componentWillUnmount() {
        this.unsubscribe();
        window.removeEventListener('hashchange', this.changed);
        window.removeEventListener('resize', this.resized);
        document.removeEventListener('visibilitychange', this.visibility);
        if (this.timer)
            clearInterval(this.timer);
        if (this.toastTimer)
            clearTimeout(this.toastTimer);
    }
    act = (action) => {
        const result = store_1.store.getState().dispatch(action);
        if (result.message && !['tick', 'clear_notice', 'speed'].includes(action.type)) {
            if (this.toastTimer)
                clearTimeout(this.toastTimer);
            this.setState({ toast: { message: result.message, ok: result.ok } });
            this.toastTimer = setTimeout(() => this.setState({ toast: null }), 5500);
        }
        return result;
    };
    nav = (url) => { const preserve = this.state.modal?.kind === 'device-detail' && url.split('?')[0] === this.state.path; window.location.hash = url; this.setState({ ...locationInfo(), menu: false, modal: preserve ? this.state.modal : null }); };
    open = (kind, id, extra) => this.setState({ modal: { kind, id, extra } });
    render() {
        const { data: s, path, query, mobile, modal } = this.state, item = navItems.find(n => n.path === path) ?? navItems[0], active = s.runs.filter(r => (0, format_1.isActiveRun)(r.status)), ctx = { s, query: new URLSearchParams(query), mobile, nav: this.nav, open: this.open, act: this.act };
        const primary = path === '/otomasi' ? react_1.default.createElement(ui_1.Button, { icon: "plus", tone: "primary", onClick: () => this.nav('/otomasi?tab=builder') }, "Buat rutinitas") : path === '/biaya' ? react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Button, { icon: "box", onClick: () => this.open('planner') }, "Rencana perangkat"),
            react_1.default.createElement(ui_1.Button, { icon: "plus", tone: "primary", onClick: () => this.open('expense') }, "Catat pengeluaran")) : path === '/perangkat' ? react_1.default.createElement(ui_1.Button, { icon: "plus", tone: "primary", onClick: () => this.open('device-create') }, "Tambah perangkat") : path === '/hama' ? react_1.default.createElement(ui_1.Button, { icon: "plus", tone: "primary", onClick: () => this.open('inspection', ctx.query.get('case') ?? 'INS-024') }, "Catat inspeksi") : path === '/pengendalian' ? react_1.default.createElement(ui_1.Button, { icon: "plus", tone: "primary", onClick: () => this.open('plan', 'INS-024') }, "Buat rencana") : path === '/riwayat' ? react_1.default.createElement(ui_1.Button, { icon: "print", tone: "primary", onClick: () => this.open('report') }, "Buat laporan") : path === '/greenhouse' ? react_1.default.createElement(ui_1.Button, { icon: "devices", onClick: () => this.nav('/perangkat') }, "Lihat perangkat") : react_1.default.createElement(ui_1.Button, { icon: "file", onClick: () => this.open('report') }, "Lihat laporan");
        return react_1.default.createElement(react_router_1.HashRouter, null,
            react_1.default.createElement("div", { className: "app-shell" },
                react_1.default.createElement("aside", { className: `sidebar ${this.state.menu ? 'open' : ''}`, "aria-label": "Navigasi utama" },
                    react_1.default.createElement("button", { className: "brand", onClick: () => this.nav('/ringkasan'), "aria-label": "Vigor \u2014 Ringkasan" },
                        react_1.default.createElement("img", { src: assets_1.assets.logo, alt: "Vigor" })),
                    react_1.default.createElement("button", { className: "workspace-switch", onClick: () => this.open('workspace') },
                        react_1.default.createElement("span", { className: "soft-icon" },
                            react_1.default.createElement(ui_1.Icon, { name: "greenhouse" })),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, "Greenhouse 01"),
                            react_1.default.createElement("small", null, "Kebun Bogor")),
                        react_1.default.createElement(ui_1.Icon, { name: "down", size: 14 })),
                    react_1.default.createElement("span", { className: "nav-section" }, "KELOLA KEBUN"),
                    react_1.default.createElement("nav", null, navItems.map(n => react_1.default.createElement(react_router_1.NavLink, { key: n.path, to: n.path, className: `nav-item ${path === n.path ? 'selected' : ''}`, onClick: () => this.setState({ menu: false, modal: null }) },
                        react_1.default.createElement(ui_1.Icon, { name: n.icon, size: 20 }),
                        react_1.default.createElement("span", null, n.label),
                        n.path === '/hama' && s.cases.some(c => c.status === 'inspection') && react_1.default.createElement("span", { className: "nav-count" }, s.cases.filter(c => c.status === 'inspection').length)))),
                    react_1.default.createElement("div", { className: "sidebar-bottom" },
                        react_1.default.createElement("div", { className: "sidebar-helper" },
                            react_1.default.createElement("span", { className: "small-leaf" },
                                react_1.default.createElement(ui_1.Icon, { name: "leaf", size: 21 })),
                            react_1.default.createElement("strong", null, "Kebun lebih terpantau."),
                            react_1.default.createElement("p", null, "Langkah kecil, keputusan yang lebih jelas."),
                            react_1.default.createElement("button", { onClick: () => this.open('help') },
                                "Kenali Vigor ",
                                react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 }))),
                        react_1.default.createElement("button", { className: "help-link", onClick: () => this.open('help') },
                            react_1.default.createElement(ui_1.Icon, { name: "help", size: 18 }),
                            "Panduan penggunaan"),
                        react_1.default.createElement("button", { className: "operator", onClick: () => this.open('workspace') },
                            react_1.default.createElement("span", { className: "avatar" }, "BS"),
                            react_1.default.createElement("span", null,
                                react_1.default.createElement("strong", null, "Budi Santoso"),
                                react_1.default.createElement("small", null, "Operator \u00B7 akun demo")),
                            react_1.default.createElement(ui_1.Icon, { name: "more", size: 16 })))),
                this.state.menu && react_1.default.createElement("button", { className: "sidebar-backdrop", "aria-label": "Tutup menu", onClick: () => this.setState({ menu: false }) }),
                react_1.default.createElement("div", { className: "workspace" },
                    react_1.default.createElement("header", { className: "topbar" },
                        react_1.default.createElement("div", { className: "topbar-left" },
                            react_1.default.createElement(ui_1.Button, { className: "mobile-menu", icon: "menu", tone: "ghost", ariaLabel: "Buka menu", onClick: () => this.setState({ menu: !this.state.menu }) }),
                            react_1.default.createElement("span", { className: "breadcrumb" },
                                "Kebun Bogor ",
                                react_1.default.createElement("span", null, "/"),
                                " ",
                                react_1.default.createElement("strong", null, item.label))),
                        react_1.default.createElement("div", { className: "topbar-right" },
                            react_1.default.createElement("span", { className: "date-chip" },
                                react_1.default.createElement(ui_1.Icon, { name: "calendar", size: 15 }),
                                (0, format_1.dateLabel)(s.clock)),
                            react_1.default.createElement(ui_1.Badge, { tone: "green", dot: true }, "Mode demo"),
                            react_1.default.createElement(ui_1.Button, { small: true, icon: "settings", tone: "ghost", ariaLabel: "Skenario & pengaturan demo", onClick: () => this.open('scenario') }),
                            react_1.default.createElement("span", { className: "avatar small" }, "BS"))),
                    react_1.default.createElement("main", { id: "main-content" },
                        react_1.default.createElement("div", { className: "page-header" },
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("div", { className: "eyebrow" },
                                    s.greenhouse.name.toUpperCase(),
                                    " ",
                                    react_1.default.createElement("span", { className: "eyebrow-dot" }, "\u00B7"),
                                    " KEBUN BOGOR"),
                                react_1.default.createElement("h1", null, item.label),
                                react_1.default.createElement("p", null, item.subtitle)),
                            react_1.default.createElement("div", { className: "page-header-actions" }, primary)),
                        s.storageWarning && react_1.default.createElement(ui_1.Alert, { title: "Penyimpanan / sesi demo", action: react_1.default.createElement(ui_1.Button, { small: true, onClick: () => this.act({ type: 'clear_notice' }) }, "Tutup") }, s.storageWarning),
                        this.state.resumeNotice && react_1.default.createElement(ui_1.Alert, { tone: "blue", title: "Clock dijeda saat tab disembunyikan", action: react_1.default.createElement(ui_1.Button, { small: true, onClick: () => { this.act({ type: 'play', value: true }); this.setState({ resumeNotice: false }); } }, "Lanjutkan simulasi") }, "Tidak ada jadwal atau dosis yang dikejar otomatis. Lanjutkan saat siap."),
                        react_1.default.createElement(react_router_1.Routes, null,
                            react_1.default.createElement(react_router_1.Route, { path: "/", element: react_1.default.createElement(Overview_1.Overview, { ...ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/ringkasan", element: react_1.default.createElement(Overview_1.Overview, { ...ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/greenhouse", element: react_1.default.createElement(Greenhouse_1.Greenhouse, { ...ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/hama", element: react_1.default.createElement(Pests_1.Pests, { ...ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/pengendalian", element: react_1.default.createElement(Control_1.Control, { ...ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/otomasi", element: react_1.default.createElement(Automation_1.Automation, { ...ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/perangkat", element: react_1.default.createElement(Devices_1.default, { ctx: ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/riwayat", element: react_1.default.createElement(History_1.default, { ctx: ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "/biaya", element: react_1.default.createElement(Costs_1.default, { ctx: ctx }) }),
                            react_1.default.createElement(react_router_1.Route, { path: "*", element: react_1.default.createElement("div", { className: "empty" },
                                    react_1.default.createElement("h2", null, "Halaman tidak ditemukan"),
                                    react_1.default.createElement(ui_1.Button, { onClick: () => this.nav('/ringkasan') }, "Kembali ke Ringkasan")) })),
                        react_1.default.createElement("footer", { className: "page-footer" },
                            react_1.default.createElement("span", null, "Vigor \u00B7 Prototype operasional greenhouse"),
                            react_1.default.createElement("span", null, "Data sintetis \u00B7 aktuasi simulasi \u00B7 tanpa koneksi perangkat nyata"))),
                    react_1.default.createElement("div", { className: "demo-controlbar" },
                        react_1.default.createElement("div", { className: "demo-clock" },
                            react_1.default.createElement("span", { className: `clock-indicator ${s.playing ? 'playing' : ''}` }),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("span", null, "WAKTU DEMO \u00B7 WIB"),
                                react_1.default.createElement("strong", null, (0, format_1.clockTime)(s.clock, true))),
                            react_1.default.createElement("small", null, (0, format_1.dateLabel)(s.clock))),
                        react_1.default.createElement("div", { className: "clock-controls" },
                            react_1.default.createElement(ui_1.Button, { small: true, icon: s.playing ? 'pause' : 'play', tone: "primary", onClick: () => { this.act({ type: 'play', value: !s.playing }); this.setState({ resumeNotice: false }); } }, s.playing ? 'Jeda clock' : 'Putar simulasi'),
                            react_1.default.createElement("label", { className: "speed-control" },
                                react_1.default.createElement("span", { className: "sr-only" }, "Kecepatan simulasi"),
                                react_1.default.createElement("select", { "aria-label": "Kecepatan simulasi", value: s.speed, onChange: (e) => this.act({ type: 'speed', value: Number(e.currentTarget.value) }) },
                                    react_1.default.createElement("option", { value: 1 }, "1\u00D7"),
                                    react_1.default.createElement("option", { value: 10 }, "10\u00D7"),
                                    react_1.default.createElement("option", { value: 60 }, "60\u00D7"))),
                            react_1.default.createElement(ui_1.Button, { small: true, icon: "arrow", onClick: () => this.act({ type: 'next' }) }, "Ke kejadian berikutnya")),
                        react_1.default.createElement("div", { className: "demo-actions" },
                            react_1.default.createElement(ui_1.Button, { small: true, icon: "settings", tone: "ghost", onClick: () => this.open('scenario') },
                                react_1.default.createElement("span", { className: "scenario-title" }, format_1.scenarioLabels[s.scenario])),
                            active.length > 0 && react_1.default.createElement(ui_1.Button, { small: true, tone: "danger", icon: "stop", ariaLabel: "Hentikan semua simulasi", onClick: () => this.open('stop-all') },
                                active.length,
                                " aktif"),
                            react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "refresh", ariaLabel: "Reset demo", onClick: () => this.open('reset') })))),
                modal && react_1.default.createElement(Modals_1.default, { key: `${modal.kind}-${modal.id}-${modal.extra}`, ctx: ctx, spec: modal, onClose: () => this.setState({ modal: null }) }),
                " ",
                this.state.toast && react_1.default.createElement("div", { className: `toast ${this.state.toast.ok ? 'success' : 'failure'}`, role: this.state.toast.ok ? 'status' : 'alert' },
                    react_1.default.createElement(ui_1.Icon, { name: this.state.toast.ok ? 'checkcircle' : 'alert', size: 20 }),
                    react_1.default.createElement("span", null, this.state.toast.message),
                    react_1.default.createElement("button", { "aria-label": "Tutup pemberitahuan", onClick: () => this.setState({ toast: null }) },
                        react_1.default.createElement(ui_1.Icon, { name: "close", size: 15 })))));
    }
}
exports.default = App;

},
"app/Modals":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Modals;
const react_1 = __importDefault(require("react"));
const ui_1 = require("../components/ui");
const costs_1 = require("../domain/costs");
const format_1 = require("../domain/format");
const scheduler_1 = require("../domain/scheduler");
const Automation_1 = require("../features/automation/Automation");
const Costs_1 = require("../features/costs/Costs");
const Devices_1 = require("../features/devices/Devices");
const Greenhouse_1 = require("../features/greenhouse/Greenhouse");
const History_1 = require("../features/history/History");
const Pests_1 = require("../features/pests/Pests");
const context_1 = require("./context");
const requiredCheck = (text) => react_1.default.createElement("label", { className: "checkbox" },
    react_1.default.createElement("input", { type: "checkbox", required: true }),
    text);
function Modals({ ctx, spec, onClose }) {
    const { s } = ctx, { kind, id, extra } = spec;
    let title = '', description = '', content = null, wide = false, drawer = false;
    const save = (a) => {
        const r = ctx.act(a);
        if (r.ok)
            onClose();
        return r;
    };
    const foot = (label = 'Simpan') => react_1.default.createElement("div", { className: "form-footer" },
        react_1.default.createElement(ui_1.Button, { onClick: onClose }, "Batal"),
        react_1.default.createElement(ui_1.Button, { type: "submit", tone: "primary" }, label));
    const deviceOptions = react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("option", { value: "" }, "Greenhouse / tidak terkait perangkat"),
        s.devices.map(d => react_1.default.createElement("option", { key: d.id, value: d.id },
            d.id,
            " \u00B7 ",
            d.label)));
    if (kind === 'case-detail') {
        title = id ?? 'Detail kasus';
        drawer = true;
        content = react_1.default.createElement(Pests_1.CaseDetails, { ctx: ctx, id: id ?? 'INS-024' });
    }
    else if (kind === 'zone-detail') {
        title = `Detail Zona ${id}`;
        drawer = true;
        content = react_1.default.createElement(Greenhouse_1.ZoneDetails, { ctx: ctx, id: id });
    }
    else if (kind === 'device-detail') {
        title = 'Detail perangkat';
        drawer = true;
        content = react_1.default.createElement(Devices_1.DeviceDetails, { ctx: ctx, id: id ?? 'PUMP-01' });
    }
    else if (kind === 'expense-detail') {
        title = 'Detail pengeluaran';
        drawer = true;
        content = react_1.default.createElement(Costs_1.ExpenseDetails, { ctx: ctx, id: id ?? '', deviceId: extra });
    }
    else if (kind === 'event') {
        title = 'Detail aktivitas';
        drawer = true;
        content = react_1.default.createElement(History_1.EventDetails, { ctx: ctx, id: id ?? '' });
    }
    else if (kind === 'routine') {
        title = 'Detail rutinitas';
        drawer = true;
        content = react_1.default.createElement(Automation_1.RoutineDetails, { ctx: ctx, id: id ?? 'RTN-001' });
    }
    else if (kind === 'planner') {
        title = 'Rencana perangkat';
        description = 'Rencana belanja, bukan pengeluaran tercatat.';
        wide = true;
        content = react_1.default.createElement(Costs_1.Planner, { ctx: ctx, onClose: onClose });
    }
    else if (kind === 'report') {
        title = 'Laporan operasional';
        wide = true;
        content = react_1.default.createElement(History_1.Report, { ctx: ctx });
    }
    else if (kind === 'inspection') {
        const c = s.cases.find(c => c.id === id);
        title = `Catat inspeksi · ${id}`;
        description = 'Inspeksi tanaman melengkapi pengamatan perangkap.';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'inspection', inspection: { caseId: id, at: (0, context_1.value)(f, 'at') + ':00+07:00', operator: (0, context_1.value)(f, 'operator'), examined: (0, context_1.numeric)(f, 'examined'), affected: (0, context_1.numeric)(f, 'affected'), outcome: (0, context_1.value)(f, 'outcome'), notes: (0, context_1.value)(f, 'notes'), attachmentName: f.get('attachment')?.name || undefined } }) },
            react_1.default.createElement(ui_1.Alert, { tone: "blue" },
                "Zona ",
                c?.zoneId,
                " \u00B7 sumber ",
                c?.sourceDeviceId,
                ". Menyimpan inspeksi tidak otomatis menutup kasus."),
            react_1.default.createElement("div", { className: "form-grid" },
                react_1.default.createElement(ui_1.Field, { label: "Petugas" },
                    react_1.default.createElement("select", { name: "operator", defaultValue: c?.assignedTo ?? 'Budi Santoso' },
                        react_1.default.createElement("option", null, "Budi Santoso"),
                        react_1.default.createElement("option", null, "Sari Wulandari"))),
                react_1.default.createElement(ui_1.Field, { label: "Waktu inspeksi (WIB)" },
                    react_1.default.createElement("input", { name: "at", type: "datetime-local", defaultValue: (0, format_1.localDate)(s.clock) + 'T' + (0, format_1.localTime)(s.clock), required: true })),
                react_1.default.createElement(ui_1.Field, { label: "Tanaman diperiksa" },
                    react_1.default.createElement("input", { name: "examined", type: "number", min: "1", max: "432", defaultValue: "12", required: true })),
                react_1.default.createElement(ui_1.Field, { label: "Tanaman bergejala" },
                    react_1.default.createElement("input", { name: "affected", type: "number", min: "0", defaultValue: "2", required: true }))),
            react_1.default.createElement(ui_1.Field, { label: "Hasil pemeriksaan" },
                react_1.default.createElement("select", { name: "outcome" },
                    react_1.default.createElement("option", { value: "indication" }, "Ada indikasi"),
                    react_1.default.createElement("option", { value: "not_found" }, "Tidak ditemukan"),
                    react_1.default.createElement("option", { value: "inconclusive" }, "Belum dapat disimpulkan"))),
            react_1.default.createElement(ui_1.Field, { label: "Catatan inspeksi" },
                react_1.default.createElement("textarea", { name: "notes", rows: 3, minLength: 5, required: true, placeholder: "Temuan pada tanaman, lokasi, dan tindak lanjut\u2026" })),
            react_1.default.createElement(ui_1.Field, { label: "Foto lokal (opsional)", hint: "Nama lampiran dicatat. Isi file tidak dipersist, diunggah, atau dianalisis." },
                react_1.default.createElement("input", { type: "file", accept: "image/*", name: "attachment" })),
            foot('Simpan inspeksi'));
    }
    else if (kind === 'plan') {
        const c = s.cases.find(c => c.id === id) ?? s.cases.find(c => c.id === 'INS-024');
        title = 'Buat rencana pengendalian';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => {
                const result = ctx.act({ type: 'plan', plan: { caseId: c.id, zoneId: c.zoneId, title: (0, context_1.value)(f, 'title'), operator: (0, context_1.value)(f, 'operator'), kind: (0, context_1.value)(f, 'kind'), notes: (0, context_1.value)(f, 'notes'), durationSeconds: (0, context_1.numeric)(f, 'duration') } });
                if (result.ok) {
                    onClose();
                    ctx.nav(`/pengendalian?plan=${result.id}`);
                }
                return result;
            } },
            react_1.default.createElement(ui_1.Alert, { tone: "blue", title: `${c.id} · Zona ${c.zoneId}` }, "Bukti, hasil inspeksi, dan penanggung jawab ditautkan ke kasus yang sama."),
            react_1.default.createElement(ui_1.Field, { label: "Judul rencana" },
                react_1.default.createElement("input", { name: "title", defaultValue: `Tindak lanjut temuan Zona ${c.zoneId}`, required: true })),
            react_1.default.createElement(ui_1.Field, { label: "Jenis tindakan" },
                react_1.default.createElement("select", { name: "kind" },
                    react_1.default.createElement("option", { value: "manual" }, "Tugas nonkimia oleh petugas"),
                    react_1.default.createElement("option", { value: "simulator" }, "Simulasi modul uji fisik"),
                    react_1.default.createElement("option", { value: "expert_review" }, "Rencana yang memerlukan peninjauan ahli"))),
            react_1.default.createElement("div", { className: "form-grid" },
                react_1.default.createElement(ui_1.Field, { label: "Penanggung jawab" },
                    react_1.default.createElement("select", { name: "operator", defaultValue: c.assignedTo ?? 'Budi Santoso' },
                        react_1.default.createElement("option", null, "Budi Santoso"),
                        react_1.default.createElement("option", null, "Sari Wulandari"))),
                react_1.default.createElement(ui_1.Field, { label: "Durasi simulator (detik)", hint: "Hanya untuk modul uji; 10\u2013300 detik." },
                    react_1.default.createElement("input", { name: "duration", type: "number", min: "10", max: "300", defaultValue: "90", required: true }))),
            react_1.default.createElement(ui_1.Field, { label: "Alasan & catatan" },
                react_1.default.createElement("textarea", { name: "notes", rows: 3, required: true, minLength: 5, defaultValue: "Tinjau hasil inspeksi dan lakukan tindak lanjut nonkimia sesuai bukti demo." })),
            react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Tidak ada dosis, campuran pestisida, atau semprot otomatis. Modul uji virtual tidak mengklaim efektivitas pengusiran hama."),
            foot('Buat rencana untuk review'));
    }
    else if (kind === 'approve-plan' || kind === 'start-plan') {
        const p = s.plans.find(p => p.id === id);
        title = kind === 'approve-plan' ? 'Tinjau & setujui rencana' : 'Mulai simulasi pengendalian';
        content = p ? react_1.default.createElement(ui_1.FormBox, { onSubmit: () => {
                const r = ctx.act({ type: kind === 'approve-plan' ? 'approve_plan' : 'start_plan', id: p.id });
                if (r.ok) {
                    onClose();
                    if (kind === 'start-plan')
                        ctx.nav(`/otomasi?tab=executions&run=${r.id}`);
                }
                return r;
            } },
            react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Rencana / kasus', value: `${p.id} / ${p.caseId}` }, { label: 'Zona', value: p.zoneId }, { label: 'Perangkat', value: p.kind === 'simulator' ? 'Modul uji virtual pada CTRL-01' : 'Dikerjakan petugas; bukan aktuator' }, { label: 'Durasi simulasi', value: `${p.durationSeconds} detik` }, { label: 'Estimasi energi modul', value: `${(5 * p.durationSeconds / 3600 / 1000).toFixed(5)} kWh (daya contoh 5 W)` }, { label: 'Operator', value: p.operator }] }),
            react_1.default.createElement(ui_1.Alert, { title: "Tidak mengendalikan perangkat nyata" }, "Perintah dikirim, perangkat mengakui, dan pelaksanaan selesai adalah status yang berbeda."),
            requiredCheck('Saya meninjau bukti, zona, perangkat, penanggung jawab, dan batas simulasi.'),
            foot(kind === 'approve-plan' ? 'Setujui rencana' : 'Mulai simulasi')) : react_1.default.createElement(ui_1.Empty, { title: "Rencana tidak ditemukan" });
    }
    else if (kind === 'evaluate') {
        const p = s.plans.find(p => p.id === id);
        title = 'Jadwalkan / catat evaluasi';
        content = p ? react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'evaluate_plan', id: p.id, date: (0, context_1.value)(f, 'date'), notes: (0, context_1.value)(f, 'notes'), close: (0, context_1.checked)(f, 'close') }) },
            react_1.default.createElement(ui_1.Alert, { tone: "blue" },
                p.id,
                " \u00B7 ",
                p.caseId,
                ". Tindakan selesai tidak berarti hama hilang. Data sebelum\u2013sesudah harus memiliki interval setara."),
            react_1.default.createElement(ui_1.Field, { label: "Tanggal evaluasi" },
                react_1.default.createElement("input", { name: "date", type: "date", defaultValue: p.evaluationAt?.slice(0, 10) ?? '2026-10-14', required: true })),
            react_1.default.createElement(ui_1.Field, { label: "Catatan / observasi lanjutan" },
                react_1.default.createElement("textarea", { name: "notes", rows: 4, minLength: 10, required: true, defaultValue: p.evaluationNotes ?? '' })),
            react_1.default.createElement("label", { className: "checkbox" },
                react_1.default.createElement("input", { name: "close", type: "checkbox" }),
                "Hasil telah ditinjau operator dan kasus dapat ditutup. Jangan centang untuk jadwal masa depan."),
            foot('Simpan evaluasi')) : react_1.default.createElement(ui_1.Empty, { title: "Rencana tidak ditemukan" });
    }
    else if (['activate-routine', 'run-once', 'dry-run'].includes(kind)) {
        const r = s.routines.find(r => r.id === id);
        title = kind === 'dry-run' ? 'Uji dengan data demo' : kind === 'run-once' ? 'Jalankan sekali' : 'Tinjau aktivasi rutinitas';
        if (r) {
            const errors = (0, scheduler_1.validateRoutine)(s, r), guard = (0, scheduler_1.checkRoutineGuards)(s, r), at = (0, scheduler_1.nextOccurrence)(r, s.clock);
            content = react_1.default.createElement(ui_1.FormBox, { onSubmit: () => kind === 'dry-run' ? { ok: false, message: 'Uji hanya mengevaluasi data. Tidak membuat run atau command. Tutup dialog untuk kembali.' } : save({ type: kind === 'activate-routine' ? 'routine_activate' : 'run_once', id: r.id }) },
                react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Rutinitas', value: `${r.name} · v${r.version.number}` }, { label: 'Zona', value: r.version.zones.join(', ') }, { label: 'Perangkat wajib', value: r.version.requiredDevices.join(', ') }, { label: 'Sumber daya bersama', value: r.version.resource ?? 'Independen' }, { label: 'Kejadian berikutnya', value: at ? (0, format_1.dateLabel)(at) + ' ' + (0, format_1.clockTime)(at) + ' WIB' : 'Pemicu berbasis kondisi / run' }, { label: 'Batas waktu', value: `${r.version.maxDuration} detik; ${r.version.maxCyclesPerDay} siklus / hari` }] }),
                errors.length || guard ? react_1.default.createElement(ui_1.Alert, { title: "Hasil pemeriksaan" }, errors.join(' ') || guard) : react_1.default.createElement(ui_1.Alert, { tone: "green", title: "Konfigurasi dan syarat fixture lolos" }, "Syarat tetap diperiksa sebelum dan selama eksekusi. Uji ini belum mengirim perintah."),
                kind === 'dry-run' ? react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(ui_1.SourceTag, null, "Dry run \u2014 0 command, 0 perubahan inventaris"),
                    react_1.default.createElement(ui_1.Button, { onClick: onClose }, "Tutup hasil uji")) : react_1.default.createElement(react_1.default.Fragment, null,
                    requiredCheck('Saya meninjau zona, versi parameter, perangkat, dan batas operasi simulator.'),
                    react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Jalankan sekali memakai resource lock dan budget kumulatif yang sama. Aktivasi jadwal tidak memerlukan persetujuan ulang pada tiap run."),
                    foot(kind === 'activate-routine' ? 'Aktifkan versi ini' : 'Buat run manual')));
        }
        else
            content = react_1.default.createElement(ui_1.Empty, { title: "Rutinitas tidak ditemukan" });
    }
    else if (kind === 'reconcile') {
        title = 'Periksa status simulator';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'reconcile', id: id, notes: (0, context_1.value)(f, 'notes') }) },
            react_1.default.createElement(ui_1.Alert, { tone: "red", title: "Penghentian sebelumnya belum terkonfirmasi" }, "Perangkat tidak boleh dianggap mati hanya karena timer habis atau tab ditutup. Aksi ini mengonfirmasi status simulator secara manual; bukan pemeriksaan perangkat fisik."),
            react_1.default.createElement(ui_1.Field, { label: "Catatan pemeriksaan" },
                react_1.default.createElement("textarea", { name: "notes", required: true, minLength: 8, rows: 3, placeholder: "Jelaskan pemeriksaan dan status yang dikonfirmasi pada simulator\u2026" })),
            requiredCheck('Saya mengonfirmasi state simulator boleh direset dan resource dilepas, tanpa melanjutkan dosis sebelumnya.'),
            foot('Konfirmasi pemeriksaan demo'));
    }
    else if (kind === 'override') {
        title = 'Catat override sementara';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'override', id: id, notes: (0, context_1.value)(f, 'notes'), minutes: (0, context_1.numeric)(f, 'minutes') }) },
            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Cakupan: jalankan sekali dengan prioritas normal. Override ini tidak menonaktifkan sensor wajib, hard limit, atau resource lock."),
            react_1.default.createElement(ui_1.Field, { label: "Alasan" },
                react_1.default.createElement("textarea", { name: "notes", minLength: 10, required: true, rows: 3 })),
            react_1.default.createElement(ui_1.Field, { label: "Masa berlaku (menit)" },
                react_1.default.createElement("input", { type: "number", name: "minutes", min: "1", max: "60", defaultValue: "15", required: true })),
            foot('Catat override'));
    }
    else if (kind === 'nutrition-profile') {
        const p = s.nutrientProfiles.find(p => p.id === id);
        title = 'Ubah profil nutrisi demo';
        content = p ? react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'profile_review', id: p.id, demoUnits: (0, context_1.numeric)(f, 'units') }) },
            react_1.default.createElement(ui_1.Alert, { title: "Parameter simulasi, bukan resep budidaya" }, "Tidak ada formulasi pupuk atau dosis lapangan. Perubahan material membuat versi rutinitas tertaut perlu ditinjau; run aktif memakai snapshot sebelumnya."),
            react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Profil', value: p.name }, { label: 'Versi saat ini', value: p.version }, { label: 'Tanaman', value: p.crop }, { label: 'Perangkat', value: p.deviceIds.join(', ') }] }),
            react_1.default.createElement(ui_1.Field, { label: "Jumlah unit simulator", hint: "Unit netral untuk demo workflow. Bukan mL, gram, atau konsentrasi pupuk." },
                react_1.default.createElement("input", { type: "number", name: "units", min: "0.1", max: "10", step: "0.1", defaultValue: p.demoUnits, required: true })),
            requiredCheck('Saya meninjau perubahan parameter simulasi ini.'),
            foot('Simpan versi profil')) : react_1.default.createElement(ui_1.Empty, { title: "Profil tidak ditemukan" });
    }
    else if (kind === 'validate-zone') {
        title = `Validasi pemasangan Zona ${id}`;
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: () => save({ type: 'validate_zone', id: id }) },
            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Konfirmasi pemasangan, kamera perangkap, kualitas frame, dan pembacaan suhu/RH pada fixture. Perangkat online saja belum berarti cakupan pengamatan lengkap."),
            requiredCheck('Kamera dan sensor terpasang sesuai zona serta data dapat digunakan pada demo.'),
            foot('Validasi zona'));
    }
    else if (kind === 'maintenance') {
        const m = s.maintenance.find(m => m.id === extra), device = id ?? m?.deviceId ?? 'PUMP-01';
        title = m ? 'Tindak lanjut perawatan' : 'Catat perawatan';
        description = 'Pekerjaan dan pembayaran dicatat secara terpisah.';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'maintenance', id: m?.id, deviceId: (0, context_1.value)(f, 'device'), title: (0, context_1.value)(f, 'title'), operator: (0, context_1.value)(f, 'operator'), date: (0, context_1.value)(f, 'date'), notes: (0, context_1.value)(f, 'notes'), completed: (0, context_1.checked)(f, 'completed'), amount: (0, context_1.value)(f, 'amount') ? (0, context_1.numeric)(f, 'amount') : null, paid: (0, context_1.checked)(f, 'paid'), submissionKey: `maintenance|${m?.id ?? id}|${s.clock}|${s.maintenance.length}` }) },
            react_1.default.createElement("div", { className: "form-grid" },
                react_1.default.createElement(ui_1.Field, { label: "Perangkat" },
                    react_1.default.createElement("select", { name: "device", defaultValue: device, required: true }, deviceOptions)),
                react_1.default.createElement(ui_1.Field, { label: "Jadwal pekerjaan" },
                    react_1.default.createElement("input", { type: "date", name: "date", defaultValue: m?.dueAt.slice(0, 10) ?? (0, format_1.localDate)(s.clock), required: true }))),
            react_1.default.createElement(ui_1.Field, { label: "Judul pekerjaan" },
                react_1.default.createElement("input", { name: "title", defaultValue: m?.title ?? 'Servis / pemeriksaan pompa', required: true })),
            react_1.default.createElement(ui_1.Field, { label: "Petugas" },
                react_1.default.createElement("select", { name: "operator", defaultValue: m?.operator ?? 'Budi Santoso' },
                    react_1.default.createElement("option", null, "Budi Santoso"),
                    react_1.default.createElement("option", null, "Sari Wulandari"),
                    react_1.default.createElement("option", null, "Teknisi demo"))),
            react_1.default.createElement(ui_1.Field, { label: "Catatan" },
                react_1.default.createElement("textarea", { name: "notes", rows: 3, defaultValue: m?.notes ?? '' })),
            react_1.default.createElement("label", { className: "checkbox" },
                react_1.default.createElement("input", { name: "completed", type: "checkbox", defaultChecked: m?.status === 'completed' }),
                "Pekerjaan fisik sudah diselesaikan petugas."),
            react_1.default.createElement("details", { open: true },
                react_1.default.createElement("summary", null, "Biaya opsional"),
                m?.expenseId ? react_1.default.createElement(ui_1.Alert, { tone: "gray", title: `Pembayaran tertaut: ${m.expenseId}` }, "Edit catatan pembayaran yang sudah ada melalui menu Pengeluaran. Jangan memasukkan pembayaran yang sama lagi.") : null,
                react_1.default.createElement(ui_1.Field, { label: "Nominal biaya (Rp)", hint: "Kosongkan jika belum diketahui atau tidak ada biaya." },
                    react_1.default.createElement("input", { type: "number", name: "amount", min: "1", step: "1", placeholder: "Contoh: 50000", disabled: Boolean(m?.expenseId) })),
                react_1.default.createElement("label", { className: "checkbox" },
                    react_1.default.createElement("input", { type: "checkbox", name: "paid", disabled: Boolean(m?.expenseId) }),
                    "Pembayaran sudah dikonfirmasi pada tanggal demo ",
                    (0, format_1.dateLabel)(s.clock),
                    ".")),
            react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Jika dibayar, satu ExpenseRecord muncul di perangkat dan menu Biaya pada periode pembayaran. September tidak berubah saat servis dibayar Oktober."),
            foot('Simpan catatan perawatan'));
    }
    else if (kind === 'maintenance-mode' || kind === 'deactivate') {
        const d = s.devices.find(d => d.id === id);
        title = kind === 'deactivate' ? 'Ubah status aset' : 'Mode pemeliharaan';
        content = d ? react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save(kind === 'deactivate' ? { type: 'deactivate_device', id: d.id } : { type: 'maintenance_mode', id: d.id, value: !d.maintenance, stopActive: (0, context_1.checked)(f, 'stop') }) },
            react_1.default.createElement("p", null,
                react_1.default.createElement("strong", null,
                    d.label,
                    " \u00B7 ",
                    d.id)),
            react_1.default.createElement(ui_1.Alert, { title: "Perhatikan penggunaan perangkat" }, "Mode pemeliharaan memblokir run baru. Run aktif tidak dihentikan diam-diam. Penonaktifan tidak menghapus biaya historis."),
            kind === 'maintenance-mode' && !d.maintenance && react_1.default.createElement("label", { className: "checkbox" },
                react_1.default.createElement("input", { name: "stop", type: "checkbox" }),
                "Minta penghentian secara eksplisit pada run aktif yang memakai perangkat ini."),
            foot(kind === 'deactivate' ? (d.active ? 'Nonaktifkan aset' : 'Aktifkan aset') : (d.maintenance ? 'Akhiri pemeliharaan' : 'Mulai pemeliharaan'))) : react_1.default.createElement(ui_1.Empty, { title: "Perangkat tidak ditemukan" });
    }
    else if (kind === 'device-create') {
        title = 'Tambah perangkat demo';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => { const type = (0, context_1.value)(f, 'type'); const cap = type === 'camera' ? ['camera'] : type === 'sensor' ? ['temperature', 'humidity'] : ['gateway']; return save({ type: 'add_device', device: { id: (0, context_1.value)(f, 'id').toUpperCase().trim(), label: (0, context_1.value)(f, 'name'), type, zones: [(0, context_1.value)(f, 'zone')], capabilities: [...cap], connection: 'offline', maintenance: false, calibrated: false, watts: 0, lastSeen: (0, format_1.iso)(s.clock), nextMaintenance: (0, format_1.localDate)(s.clock), active: true } }); } },
            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Perangkat baru terdaftar sebagai offline dan belum divalidasi. Tidak otomatis membuat pengeluaran atau menyediakan telemetry yang belum ada."),
            react_1.default.createElement("div", { className: "form-grid" },
                react_1.default.createElement(ui_1.Field, { label: "ID unik" },
                    react_1.default.createElement("input", { name: "id", required: true, placeholder: "CAM-G-01" })),
                react_1.default.createElement(ui_1.Field, { label: "Nama perangkat" },
                    react_1.default.createElement("input", { name: "name", required: true })),
                react_1.default.createElement(ui_1.Field, { label: "Jenis" },
                    react_1.default.createElement("select", { name: "type" },
                        react_1.default.createElement("option", { value: "camera" }, "Kamera"),
                        react_1.default.createElement("option", { value: "sensor" }, "Sensor suhu/RH"),
                        react_1.default.createElement("option", { value: "controller" }, "Controller"))),
                react_1.default.createElement(ui_1.Field, { label: "Zona" },
                    react_1.default.createElement("select", { name: "zone" }, s.zones.map(z => react_1.default.createElement("option", { key: z.id }, z.id))))),
            foot('Tambahkan inventaris'));
    }
    else if (kind === 'expense') {
        const e = s.expenses.find(e => e.id === id), purchase = extra?.startsWith('purchase:');
        title = e ? 'Edit / konfirmasi pengeluaran' : 'Catat pengeluaran';
        description = 'Nominal harus dikonfirmasi pengguna. Tidak ada pembayaran sungguhan.';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => {
                let slices;
                if ((0, context_1.checked)(f, 'split')) {
                    slices = [{ period: (0, context_1.value)(f, 'period1'), amount: (0, context_1.numeric)(f, 'slice1') }, { period: (0, context_1.value)(f, 'period2'), amount: (0, context_1.numeric)(f, 'slice2') }];
                }
                const record = { id: e?.id, paidAt: (0, context_1.value)(f, 'date'), category: (0, context_1.value)(f, 'category'), amount: (0, context_1.numeric)(f, 'amount'), status: 'paid', note: (0, context_1.value)(f, 'note'), deviceId: (0, context_1.value)(f, 'device') || undefined, zoneId: (0, context_1.value)(f, 'zone') || undefined, reference: (0, context_1.value)(f, 'reference') || undefined, attachmentName: f.get('attachment')?.name || e?.attachmentName, maintenanceId: e?.maintenanceId, usageSlices: slices, submissionKey: e?.submissionKey ?? `expense|${s.clock}|${s.expenses.length}|${extra ?? ''}` };
                return save({ type: 'expense', record, allowDuplicate: (0, context_1.checked)(f, 'duplicate') });
            } },
            react_1.default.createElement("div", { className: "form-grid" },
                react_1.default.createElement(ui_1.Field, { label: "Tanggal pembayaran" },
                    react_1.default.createElement("input", { name: "date", type: "date", defaultValue: e?.paidAt ?? (0, format_1.localDate)(s.clock), required: true })),
                react_1.default.createElement(ui_1.Field, { label: "Kategori" },
                    react_1.default.createElement("select", { name: "category", defaultValue: e?.category ?? (purchase ? 'Investasi' : 'Perawatan') }, [...costs_1.OPERATING_CATEGORIES, 'Investasi'].map(c => react_1.default.createElement("option", { key: c }, c)))),
                react_1.default.createElement(ui_1.Field, { label: "Nominal Rupiah" },
                    react_1.default.createElement("input", { name: "amount", type: "number", min: "1", step: "1", required: true, placeholder: purchase ? `Rencana ${extra?.split(':')[1]} — konfirmasi nominal` : 'Nominal pembayaran', defaultValue: e?.amount || undefined })),
                react_1.default.createElement(ui_1.Field, { label: "Perangkat terkait" },
                    react_1.default.createElement("select", { name: "device", defaultValue: e?.deviceId ?? (purchase ? '' : extra ?? '') }, deviceOptions))),
            react_1.default.createElement(ui_1.Field, { label: "Catatan" },
                react_1.default.createElement("input", { name: "note", defaultValue: e?.note ?? (purchase ? 'Pembelian perangkat tambahan' : ''), required: true, placeholder: "Servis pompa, tagihan listrik, pembelian nutrisi\u2026" })),
            react_1.default.createElement(ui_1.Field, { label: "Bukti lokal (opsional)", hint: "Hanya nama lampiran disimpan. Lampiran bukan verifikasi otomatis nilai pembayaran." },
                react_1.default.createElement("input", { name: "attachment", type: "file", accept: "image/*,.pdf" })),
            react_1.default.createElement("details", { open: Boolean(e?.usageSlices) },
                react_1.default.createElement("summary", null, "Detail lanjutan & periode pemakaian"),
                react_1.default.createElement("div", { className: "form-grid" },
                    react_1.default.createElement(ui_1.Field, { label: "Zona (opsional)" },
                        react_1.default.createElement("select", { name: "zone", defaultValue: e?.zoneId ?? '' },
                            react_1.default.createElement("option", { value: "" }, "Greenhouse / aset bersama"),
                            s.zones.map(z => react_1.default.createElement("option", { key: z.id }, z.id)))),
                    react_1.default.createElement(ui_1.Field, { label: "Referensi tagihan" },
                        react_1.default.createElement("input", { name: "reference", defaultValue: e?.reference ?? '' }))),
                react_1.default.createElement("label", { className: "checkbox" },
                    react_1.default.createElement("input", { type: "checkbox", name: "split", defaultChecked: Boolean(e?.usageSlices) }),
                    "Pembelian dipakai pada dua bulan; bagi biaya operasional."),
                react_1.default.createElement("div", { className: "form-grid" },
                    react_1.default.createElement(ui_1.Field, { label: "Periode pemakaian 1" },
                        react_1.default.createElement("input", { name: "period1", type: "month", defaultValue: e?.usageSlices?.[0]?.period ?? '2026-09' })),
                    react_1.default.createElement(ui_1.Field, { label: "Bagian biaya 1 (Rp)" },
                        react_1.default.createElement("input", { name: "slice1", type: "number", min: "0", defaultValue: e?.usageSlices?.[0]?.amount ?? '' })),
                    react_1.default.createElement(ui_1.Field, { label: "Periode pemakaian 2" },
                        react_1.default.createElement("input", { name: "period2", type: "month", defaultValue: e?.usageSlices?.[1]?.period ?? '2026-10' })),
                    react_1.default.createElement(ui_1.Field, { label: "Bagian biaya 2 (Rp)" },
                        react_1.default.createElement("input", { name: "slice2", type: "number", min: "0", defaultValue: e?.usageSlices?.[1]?.amount ?? '' }))),
                react_1.default.createElement("p", { className: "micro muted" }, "Jumlah bagian harus sama dengan pembayaran. Total kas tetap penuh pada tanggal bayar."),
                react_1.default.createElement("label", { className: "checkbox" },
                    react_1.default.createElement("input", { name: "duplicate", type: "checkbox" }),
                    "Saya sudah memeriksa kemungkinan duplikat dan catatan ini benar-benar pembayaran berbeda.")),
            requiredCheck('Pembayaran telah dikonfirmasi. Saya memahami ini hanya pencatatan demo.'),
            foot(e ? 'Simpan perubahan' : 'Catat pengeluaran'));
    }
    else if (kind === 'void-expense') {
        title = 'Batalkan catatan pengeluaran';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'void_expense', id: id, reason: (0, context_1.value)(f, 'reason') }) },
            react_1.default.createElement(ui_1.Alert, { title: id }, "Catatan tetap tersedia dengan status Dibatalkan. Total hanya menjumlahkan pembayaran aktif. Pembatalan bisa dipulihkan."),
            react_1.default.createElement(ui_1.Field, { label: "Alasan pembatalan" },
                react_1.default.createElement("textarea", { name: "reason", required: true, minLength: 5, rows: 3 })),
            foot('Batalkan catatan'));
    }
    else if (kind === 'baseline') {
        title = 'Biaya acuan sebelum otomasi';
        const b = s.baseline;
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => {
                const categories = {};
                costs_1.OPERATING_CATEGORIES.forEach(c => {
                    if ((0, context_1.value)(f, c) !== '')
                        categories[c] = (0, context_1.numeric)(f, c);
                });
                return save({ type: 'baseline', value: { id: 'BASE-001', version: (b?.version ?? 0) + 1, source: (0, context_1.value)(f, 'source'), period: (0, context_1.value)(f, 'period'), days: (0, context_1.numeric)(f, 'days'), zones: s.zones.map(z => z.id), area: s.greenhouse.plantedArea, crop: s.cycle.crop, phase: s.cycle.phase, categories, normalizedDaily: (0, context_1.checked)(f, 'normalized'), appliedOn: (0, format_1.localDate)(s.clock) } });
            } },
            react_1.default.createElement(ui_1.Alert, { title: "Acuan harus memiliki cakupan yang setara" }, "6 zona \u00B7 288 m\u00B2 tanam \u00B7 paprika merah \u00B7 fase berbuah. Kosongkan kategori yang belum diketahui; jangan memasukkan nol untuk data hilang."),
            react_1.default.createElement("div", { className: "form-grid" },
                react_1.default.createElement(ui_1.Field, { label: "Sumber acuan" },
                    react_1.default.createElement("select", { name: "source", defaultValue: b?.source ?? 'assumption' },
                        react_1.default.createElement("option", { value: "assumption" }, "Asumsi manual \u2014 belum divalidasi"),
                        react_1.default.createElement("option", { value: "records" }, "Catatan sebelum pemasangan yang ditinjau operator"))),
                react_1.default.createElement(ui_1.Field, { label: "Periode acuan" },
                    react_1.default.createElement("input", { name: "period", type: "month", defaultValue: b?.period ?? '2026-09', required: true })),
                react_1.default.createElement(ui_1.Field, { label: "Hari operasi" },
                    react_1.default.createElement("input", { name: "days", type: "number", min: "1", max: "31", defaultValue: b?.days ?? 30, required: true }))),
            react_1.default.createElement("div", { className: "form-grid" }, costs_1.OPERATING_CATEGORIES.map(c => react_1.default.createElement(ui_1.Field, { key: c, label: `${c} (Rp)` },
                react_1.default.createElement("input", { name: c, type: "number", min: "0", defaultValue: b?.categories[c] ?? '', placeholder: "Belum diketahui" })))),
            react_1.default.createElement("label", { className: "checkbox" },
                react_1.default.createElement("input", { name: "normalized", type: "checkbox", defaultChecked: b?.normalizedDaily }),
                "Izinkan normalisasi per hari untuk bulan berjalan. Saya menilai cakupan, fase, dan tarif setara serta asumsi linear masuk akal."),
            react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Acuan belum tervalidasi lapangan. Perubahan setelah otomasi bukan bukti sebab-akibat Vigor."),
            foot('Simpan acuan'));
    }
    else if (kind === 'remove-baseline') {
        title = 'Hapus acuan demo?';
        content = react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("p", null, "Pengeluaran tetap tersimpan. Penghematan akan menjadi \u201CBelum dapat dibandingkan\u201D, bukan 0%."),
            react_1.default.createElement("div", { className: "form-footer" },
                react_1.default.createElement(ui_1.Button, { onClick: onClose }, "Batal"),
                react_1.default.createElement(ui_1.Button, { tone: "danger", onClick: () => save({ type: 'baseline', value: null }) }, "Hapus acuan")));
    }
    else if (kind === 'budget') {
        title = 'Anggaran periode';
        const period = id ?? ctx.query.get('period') ?? '2026-09';
        content = react_1.default.createElement(ui_1.FormBox, { onSubmit: f => save({ type: 'budget', period: (0, context_1.value)(f, 'period'), amount: (0, context_1.numeric)(f, 'amount') }) },
            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Budget adalah batas pengeluaran yang direncanakan, bukan baseline sebelum otomasi."),
            react_1.default.createElement(ui_1.Field, { label: "Periode" },
                react_1.default.createElement("input", { name: "period", type: "month", defaultValue: /\d{4}-\d{2}/.test(period) ? period : '2026-09', required: true })),
            react_1.default.createElement(ui_1.Field, { label: "Anggaran operasional (Rp)" },
                react_1.default.createElement("input", { type: "number", name: "amount", min: "0", defaultValue: s.budgets.find(b => b.period === period)?.amount ?? '', required: true })),
            foot('Simpan anggaran'));
    }
    else if (kind === 'scenario') {
        title = 'Pengaturan demo';
        content = react_1.default.createElement("div", { className: "detail-stack" },
            react_1.default.createElement(ui_1.Alert, { tone: "blue", title: "Simulator lokal, bukan perangkat nyata" }, "Waktu demo dimulai 13 Oktober 2026, 09:42 WIB. Clock berhenti saat tab disembunyikan dan tidak mengejar jadwal yang terlewat."),
            react_1.default.createElement(ui_1.Field, { label: "Profil kemampuan" },
                react_1.default.createElement("select", { value: s.profile, onChange: (e) => ctx.act({ type: 'profile', value: e.currentTarget.value }) },
                    react_1.default.createElement("option", { value: "automation" }, "Operasional otomatis \u2014 25 perangkat"),
                    react_1.default.createElement("option", { value: "monitoring" }, "Monitoring saja \u2014 12 perangkat"))),
            react_1.default.createElement(ui_1.Field, { label: "Skenario deterministik" },
                react_1.default.createElement("select", { value: s.scenario, onChange: (e) => ctx.act({ type: 'scenario', value: e.currentTarget.value }) }, Object.entries(format_1.scenarioLabels).map(([key, label]) => react_1.default.createElement("option", { key: key, value: key }, label)))),
            react_1.default.createElement("p", null, "Skenario kondisi dapat diubah sebelum jadwal atau ketika run berlangsung. Start tetap memeriksa resource lock, data sensor, dan batas kumulatif."),
            react_1.default.createElement("div", { className: "button-row" },
                react_1.default.createElement(ui_1.Button, { tone: "primary", onClick: onClose }, "Kembali ke demo"),
                react_1.default.createElement(ui_1.Button, { onClick: () => ctx.open('reset') }, "Reset seluruh demo")));
    }
    else if (kind === 'reset') {
        title = 'Reset seluruh demo?';
        content = react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Alert, { title: "Perubahan lokal akan dihapus" }, "Inspeksi, rencana, pengeluaran, rutinitas, dan riwayat yang ditambahkan pada browser ini kembali ke fixture awal. Tidak ada data atau perangkat nyata yang terpengaruh."),
            react_1.default.createElement("div", { className: "form-footer" },
                react_1.default.createElement(ui_1.Button, { onClick: onClose }, "Batal"),
                react_1.default.createElement(ui_1.Button, { tone: "danger", icon: "refresh", onClick: () => { save({ type: 'reset' }); ctx.nav('/ringkasan'); } }, "Reset demo")));
    }
    else if (kind === 'stop-all') {
        title = 'Hentikan semua simulasi aktif';
        content = react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Alert, { tone: "red" }, "Semua run aktif menerima permintaan stop. Status akhir setiap command menunggu feedback. Ini bukan tombol emergency fisik tersertifikasi."),
            react_1.default.createElement("div", { className: "form-footer" },
                react_1.default.createElement(ui_1.Button, { onClick: onClose }, "Batal"),
                react_1.default.createElement(ui_1.Button, { tone: "danger", icon: "stop", onClick: () => save({ type: 'stop_all' }) }, "Minta penghentian semua run")));
    }
    else if (kind === 'workspace') {
        title = 'Greenhouse aktif';
        content = react_1.default.createElement("div", { className: "detail-stack" },
            react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Lokasi', value: 'Kebun Bogor' }, { label: 'Greenhouse', value: 'Greenhouse 01' }, { label: 'Siklus', value: s.cycle.id }, { label: 'Tanaman', value: 'Paprika merah · fase berbuah' }, { label: 'Luas', value: '360 m² total · 288 m² tanam' }, { label: 'Zona / tanaman', value: '6 zona · 432 tanaman' }] }),
            react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Prototype memiliki satu greenhouse. Selector tidak berpura-pura menyediakan lokasi yang belum memiliki fixture."),
            react_1.default.createElement(ui_1.Button, { onClick: onClose }, "Tutup"));
    }
    else {
        title = 'Tentang prototype Vigor';
        content = react_1.default.createElement("div", { className: "detail-stack" },
            react_1.default.createElement("h3", null, "Operasional kebun dalam satu tempat."),
            react_1.default.createElement("p", null, "Ringkasan membantu memprioritaskan pekerjaan. Greenhouse memberi konteks zona. Otomasi menjalankan rutinitas pada satu demo clock, sementara perangkat dan biaya memakai record tertaut."),
            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Tidak ada backend, inferensi AI, MQTT, pembayaran, atau koneksi perangkat nyata. Seluruh operasi hanya mengubah data sintetis pada browser."),
            react_1.default.createElement("p", null, "Putar simulasi atau pilih \u201CKe kejadian berikutnya\u201D untuk mencoba penyiraman pukul 10:00 dan fertigasi pukul 10:30 WIB. Pergantian tab browser menjeda clock; muat ulang run aktif memerlukan pemeriksaan status."),
            react_1.default.createElement("p", null, "Analisis biologis, setpoint tanaman, harga perangkat, dan asumsi penghematan belum divalidasi lapangan."),
            react_1.default.createElement(ui_1.Button, { tone: "primary", onClick: onClose }, "Mulai menjelajahi"));
    }
    return react_1.default.createElement(ui_1.Modal, { key: kind + '-' + id + '-' + extra, title: title, description: description, onClose: onClose, wide: wide, drawer: drawer }, content);
}

},
"app/context":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checked = exports.numeric = exports.value = void 0;
exports.updateQuery = updateQuery;
function updateQuery(ctx, route, values) {
    const q = new URLSearchParams(ctx.query);
    for (const [k, v] of Object.entries(values)) {
        if (v === undefined || v === '')
            q.delete(k);
        else
            q.set(k, v);
    }
    ctx.nav(route + (q.size ? '?' + q.toString() : ''));
}
const value = (f, key) => String(f.get(key) ?? '');
exports.value = value;
const numeric = (f, key) => Number((0, exports.value)(f, key));
exports.numeric = numeric;
const checked = (f, key) => f.get(key) === 'on';
exports.checked = checked;

},
"components/charts":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendChart = exports.SERIES_COLORS = void 0;
exports.isPortable = isPortable;
exports.Sparkline = Sparkline;
exports.CostBars = CostBars;
const react_1 = __importDefault(require("react"));
const recharts_1 = require("recharts");
const format_1 = require("../domain/format");
exports.SERIES_COLORS = { A: '#6c9d53', B: '#e89a35', C: '#62a3a1', D: '#9ca9ba', E: '#bac3b8', F: '#cbd0c8', actual: '#244735', baseline: '#b9c8ae' };
function isPortable() {
    return typeof window !== 'undefined' && Boolean(window.__VIGOR_PORTABLE__);
}
function Sparkline({ points, tone = 'green', height = 38 }) {
    const valid = points.filter((n) => n !== null);
    if (!valid.length)
        return react_1.default.createElement("span", { className: "muted" }, "Data belum tersedia");
    const min = Math.min(...valid) - 1, max = Math.max(...valid) + 1;
    const coords = points.map((n, i) => n === null ? null : `${i * 200 / (points.length - 1)},${height - 4 - (n - min) / (max - min) * (height - 8)}`);
    const segments = [];
    let current = [];
    for (const p of coords) {
        if (p === null) {
            if (current.length)
                segments.push(current.join(' '));
            current = [];
        }
        else
            current.push(p);
    }
    if (current.length)
        segments.push(current.join(' '));
    return react_1.default.createElement("svg", { className: `sparkline ${tone}`, viewBox: `0 0 200 ${height}`, preserveAspectRatio: "none", role: "img", "aria-label": `Tren demo: ${valid.map(n => (0, format_1.number)(n, 1)).join(', ')}` }, segments.map((p, i) => react_1.default.createElement("polyline", { key: i, points: p, fill: "none", stroke: "currentColor", strokeWidth: "2", vectorEffect: "non-scaling-stroke" })));
}
class TrendChart extends react_1.default.Component {
    state = { hidden: [] };
    render() {
        const { data, height = 220 } = this.props, keys = this.props.keys ?? ['A', 'B', 'C', 'D'];
        const visible = keys.filter(k => !this.state.hidden.includes(k));
        if (!isPortable())
            return react_1.default.createElement("div", { className: "chart-native", style: { height } },
                react_1.default.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                    react_1.default.createElement(recharts_1.LineChart, { data: data, margin: { top: 10, left: -18, right: 14, bottom: 5 } },
                        react_1.default.createElement(recharts_1.CartesianGrid, { vertical: false, stroke: "#e8ede5" }),
                        react_1.default.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fill: '#7c867b', fontSize: 11 }, axisLine: false, tickLine: false }),
                        react_1.default.createElement(recharts_1.YAxis, { unit: "", allowDecimals: false, tick: { fill: '#7c867b', fontSize: 11 }, axisLine: false, tickLine: false }),
                        react_1.default.createElement(recharts_1.Tooltip, { formatter: (v, name) => [`${v} tangkapan / 24 jam`, `Zona ${name}`] }),
                        react_1.default.createElement(recharts_1.Legend, { formatter: (name) => `Zona ${name}`, onClick: entry => { const key = String(entry.dataKey ?? entry.value); this.setState({ hidden: this.state.hidden.includes(key) ? this.state.hidden.filter(x => x !== key) : [...this.state.hidden, key] }); } }),
                        keys.map(key => react_1.default.createElement(recharts_1.Line, { key: key, type: "linear", dataKey: key, name: key, hide: this.state.hidden.includes(key), stroke: exports.SERIES_COLORS[key], dot: { r: 3 }, strokeWidth: 2, connectNulls: false, isAnimationActive: false })))));
        const values = data.flatMap(d => visible.map(k => d[k]).filter((v) => typeof v === 'number'));
        const max = Math.max(30, Math.ceil(Math.max(0, ...values) / 10) * 10), W = 640, H = 205, L = 34, R = 18, T = 14, B = 32, x = (i) => L + i * (W - L - R) / (data.length - 1), y = (v) => T + (max - v) / max * (H - T - B);
        return react_1.default.createElement("div", { className: "trend-chart" },
            react_1.default.createElement("div", { className: "chart-unit" }, "Tangkapan baru / 24 jam"),
            react_1.default.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: { height: height - 28 }, role: "img", "aria-label": "Tren tangkapan baru dengan interval pengamatan 24 jam. Data Zona E dan F belum tersedia." },
                Array.from({ length: 4 }, (_, i) => i * max / 3).map(v => react_1.default.createElement("g", { key: v },
                    react_1.default.createElement("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: "#e7ece4", strokeDasharray: "3 4" }),
                    react_1.default.createElement("text", { x: L - 12, y: y(v) + 4, textAnchor: "end" }, Math.round(v)))),
                data.map((d, i) => react_1.default.createElement("text", { key: i, x: x(i), y: H - 9, textAnchor: "middle" }, d.day)),
                visible.map(key => {
                    const segments = [];
                    let segment = '';
                    data.forEach((d, i) => {
                        const value = d[key];
                        if (typeof value === 'number')
                            segment += (segment ? ' L' : 'M') + x(i) + ' ' + y(value);
                        else {
                            if (segment)
                                segments.push(segment);
                            segment = '';
                        }
                    });
                    if (segment)
                        segments.push(segment);
                    return react_1.default.createElement("g", { key: key },
                        segments.map((path, i) => react_1.default.createElement("path", { key: i, d: path, stroke: exports.SERIES_COLORS[key], strokeWidth: "2.4", fill: "none" })),
                        data.map((d, i) => typeof d[key] === 'number' ? react_1.default.createElement("circle", { key: i, cx: x(i), cy: y(d[key]), r: "3.8", fill: exports.SERIES_COLORS[key], stroke: "white", strokeWidth: "1.3" },
                            react_1.default.createElement("title", null, `Zona ${key}, ${d.day}: ${d[key]} tangkapan baru / 24 jam`)) : null));
                })),
            react_1.default.createElement("div", { className: "chart-legend" }, keys.map(k => react_1.default.createElement("button", { key: k, style: { opacity: this.state.hidden.includes(k) ? 0.4 : 1 }, onClick: () => this.setState({ hidden: this.state.hidden.includes(k) ? this.state.hidden.filter(x => x !== k) : [...this.state.hidden, k] }) },
                react_1.default.createElement("i", { style: { background: exports.SERIES_COLORS[k] } }),
                "Zona ",
                k))));
    }
}
exports.TrendChart = TrendChart;
function CostBars({ rows }) { const max = Math.max(1, ...rows.map(r => r.before ?? 0), ...rows.map(r => r.after ?? 0)); return react_1.default.createElement("div", { className: "cost-bars" },
    rows.map(r => react_1.default.createElement("div", { className: "cost-bar-row", key: r.label },
        react_1.default.createElement("span", null, r.label),
        react_1.default.createElement("div", null,
            react_1.default.createElement("div", { className: "bar-baseline", style: { width: `${(r.before ?? 0) / max * 100}%` } },
                react_1.default.createElement("title", null, r.before === null ? 'Acuan belum diisi' : (0, format_1.number)(r.before))),
            r.after === null ? react_1.default.createElement("small", null, "Belum tersedia") : react_1.default.createElement("div", { className: "bar-actual", style: { width: `${r.after / max * 100}%` } },
                react_1.default.createElement("title", null, (0, format_1.number)(r.after)))),
        react_1.default.createElement("b", null, r.after === null ? '—' : (0, format_1.number)(r.after)))),
    react_1.default.createElement("div", { className: "chart-legend static" },
        react_1.default.createElement("span", null,
            react_1.default.createElement("i", { style: { background: '#c5d1b9' } }),
            "Acuan manual"),
        react_1.default.createElement("span", null,
            react_1.default.createElement("i", { style: { background: '#244735' } }),
            "Tercatat demo"))); }

},
"components/monitoring":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraPreview = void 0;
exports.SensorCard = SensorCard;
exports.DeviceSymbol = DeviceSymbol;
const react_1 = __importDefault(require("react"));
const assets_1 = require("../data/assets");
const format_1 = require("../domain/format");
const scheduler_1 = require("../domain/scheduler");
const charts_1 = require("./charts");
const ui_1 = require("./ui");
class CameraPreview extends react_1.default.Component {
    state = { videoError: false };
    container = react_1.default.createRef();
    video = react_1.default.createRef();
    observer = null;
    visibility = () => {
        if (document.hidden)
            this.video.current?.pause();
    };
    componentDidMount() {
        document.addEventListener('visibilitychange', this.visibility);
        if (typeof IntersectionObserver !== 'undefined') {
            this.observer = new IntersectionObserver(entries => {
                if (!entries[0]?.isIntersecting)
                    this.video.current?.pause();
            });
            if (this.container.current)
                this.observer.observe(this.container.current);
        }
    }
    componentWillUnmount() { document.removeEventListener('visibilitychange', this.visibility); this.observer?.disconnect(); }
    render() {
        const { s, compact = false } = this.props;
        const d = s.devices.find(d => d.id === (this.props.deviceId ?? 'CAM-B-02'));
        const online = d?.connection === 'online', trap = d?.id === 'CAM-B-02';
        const video = assets_1.assets.cameraVideo;
        const image = trap ? assets_1.assets.camera : assets_1.assets.greenhouseReference;
        return react_1.default.createElement("div", { className: `camera-preview ${compact ? 'compact' : ''}`, ref: this.container },
            react_1.default.createElement("div", { className: "camera-media" },
                video && !this.state.videoError && online ? react_1.default.createElement("video", { ref: this.video, src: video, poster: image, muted: true, playsInline: true, controls: true, preload: "metadata", onError: () => this.setState({ videoError: true }) }) : react_1.default.createElement("img", { src: image, alt: trap ? 'Gambar perangkap dari referensi desain, bukan rekaman perangkat nyata.' : 'Ilustrasi area dari referensi desain; video kamera belum tersedia.', loading: "lazy" }),
                react_1.default.createElement("span", { className: "camera-overlay-top" },
                    react_1.default.createElement("span", null,
                        react_1.default.createElement(ui_1.Icon, { name: "camera", size: 14 }),
                        d?.label ?? 'Kamera demo'),
                    react_1.default.createElement(ui_1.Badge, { tone: online ? 'green' : 'gray', dot: true }, online ? 'Gambar demo' : 'Offline')),
                react_1.default.createElement("div", { className: "camera-overlay-bottom" },
                    react_1.default.createElement("span", null, online ? 'Media referensi desain' : `Rekaman terakhir ${d ? (0, format_1.clockTime)(d.lastSeen) : '08:10'} WIB`),
                    react_1.default.createElement("button", { "aria-label": "Tampilkan gambar layar penuh", onClick: () => {
                            const el = this.container.current;
                            if (el?.requestFullscreen)
                                void el.requestFullscreen().catch(() => this.props.onDetails?.());
                            else
                                this.props.onDetails?.();
                        } },
                        react_1.default.createElement(ui_1.Icon, { name: "fullscreen", size: 17 })))),
            !compact && react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", { className: "camera-caption" },
                    react_1.default.createElement("span", null,
                        react_1.default.createElement("strong", null, trap ? 'Kamera perangkap' : 'Kamera area'),
                        react_1.default.createElement("small", null,
                            "Zona ",
                            d?.zones.join(', '),
                            " \u00B7 ",
                            d ? (0, format_1.dateLabel)(d.lastSeen) : '13 Okt 2026',
                            " \u00B7 ",
                            d ? (0, format_1.clockTime)(d.lastSeen) : '09:42',
                            " WIB")),
                    react_1.default.createElement(ui_1.SourceTag, null, video ? 'Video demo' : 'Gambar referensi')),
                react_1.default.createElement("p", { className: "micro muted" }, "Tidak ada MP4/WebM dalam aset. Gambar ini bukan frame aktual dari perangkat. Tidak ada anotasi AI buatan."),
                react_1.default.createElement("div", { className: "button-row" },
                    react_1.default.createElement(ui_1.Button, { small: true, icon: "camera", disabled: true, title: "Snapshot memerlukan file video lokal yang tersedia." }, "Ambil snapshot"),
                    this.props.onDetails && react_1.default.createElement(ui_1.Button, { small: true, icon: "external", onClick: this.props.onDetails }, "Detail perangkat"))));
    }
}
exports.CameraPreview = CameraPreview;
function SensorCard({ s, id, humidity = false, compact = false }) { const d = (0, scheduler_1.availableDevices)(s).find(d => d.id === id); const val = humidity && d?.connection === 'online' ? s.zones.find(z => z.id === d.zones[0])?.humidity ?? null : (0, scheduler_1.sensorValue)(s, id); const kind = id.startsWith('TH-') ? (humidity ? 'RH udara' : 'Suhu udara') : id.startsWith('MEDIA') ? 'Kelembapan media' : id === 'FLOW-01' ? 'Debit aliran' : id === 'EC-01' ? 'EC larutan' : id === 'PH-01' ? 'pH larutan' : 'Level tangki'; const unit = id.startsWith('TH-') ? (humidity ? '% RH' : '°C') : id === 'EC-01' ? 'mS/cm' : id === 'PH-01' ? '' : id === 'FLOW-01' ? 'L/menit' : id.startsWith('MEDIA') ? 'indeks' : '%'; const icon = id.startsWith('TH-') && !humidity ? 'temp' : id === 'EC-01' || id === 'PH-01' ? 'flask' : 'drop'; return react_1.default.createElement("div", { className: `sensor-card ${compact ? 'compact' : ''}` },
    react_1.default.createElement("div", { className: "sensor-top" },
        react_1.default.createElement("span", { className: "soft-icon" },
            react_1.default.createElement(ui_1.Icon, { name: icon })),
        react_1.default.createElement("div", null,
            react_1.default.createElement("span", null, kind),
            react_1.default.createElement("strong", null,
                val === null ? '—' : (0, format_1.number)(val, 1),
                " ",
                react_1.default.createElement("small", null, val === null ? '' : unit)))),
    d ? react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: "sensor-foot" },
            react_1.default.createElement("span", { className: d.connection !== 'online' ? 'amber-text' : 'muted' }, d.connection === 'online' ? (0, format_1.clockTime)(s.clock) + ' WIB' : d.connection === 'stale' ? 'Data kedaluwarsa' : 'Offline'),
            react_1.default.createElement("span", null, d.calibrated ? 'Fixture demo' : 'Belum dikalibrasi')),
        !compact && react_1.default.createElement(charts_1.Sparkline, { points: val === null ? [null, null, null] : [val - 1.2, val - 1.0, val - 0.5, val - 0.9, val - 0.3, val], tone: icon === 'temp' ? 'amber' : 'green' })) : react_1.default.createElement("p", { className: "micro muted" }, "Belum terpasang")); }
function DeviceSymbol({ device }) { const name = device.type === 'camera' ? 'camera' : device.type === 'sensor' ? 'temp' : device.type === 'nutrition' ? 'flask' : device.type === 'environment' ? 'wind' : device.type === 'controller' ? 'wifi' : 'drop'; return react_1.default.createElement("span", { className: "device-symbol" },
    react_1.default.createElement(ui_1.Icon, { name: name })); }

},
"components/ui":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = exports.FormBox = void 0;
exports.Icon = Icon;
exports.Button = Button;
exports.Badge = Badge;
exports.Card = Card;
exports.Stats = Stats;
exports.Stat = Stat;
exports.Alert = Alert;
exports.Tabs = Tabs;
exports.Progress = Progress;
exports.Empty = Empty;
exports.Field = Field;
exports.Select = Select;
exports.SearchField = SearchField;
exports.Meta = Meta;
exports.FormError = FormError;
exports.SectionLabel = SectionLabel;
exports.SourceTag = SourceTag;
const lucide_react_1 = require("lucide-react");
const react_1 = __importDefault(require("react"));
const icons = { home: lucide_react_1.House, greenhouse: lucide_react_1.Sprout, bug: lucide_react_1.Bug, leaf: lucide_react_1.Leaf, workflow: lucide_react_1.Workflow, devices: lucide_react_1.Cpu, history: lucide_react_1.History, wallet: lucide_react_1.Wallet, plus: lucide_react_1.Plus, chevron: lucide_react_1.ChevronRight, down: lucide_react_1.ChevronDown, up: lucide_react_1.ArrowUpRight, lower: lucide_react_1.ArrowDownRight, arrow: lucide_react_1.ArrowRight, back: lucide_react_1.ArrowLeft, check: lucide_react_1.Check, alert: lucide_react_1.TriangleAlert, clock: lucide_react_1.Clock, calendar: lucide_react_1.CalendarDays, play: lucide_react_1.Play, pause: lucide_react_1.Pause, stop: lucide_react_1.Square, search: lucide_react_1.Search, close: lucide_react_1.X, settings: lucide_react_1.Settings2, drop: lucide_react_1.Droplets, temp: lucide_react_1.Thermometer, wind: lucide_react_1.Wind, flask: lucide_react_1.FlaskConical, bolt: lucide_react_1.Zap, wifi: lucide_react_1.Wifi, wrench: lucide_react_1.Wrench, camera: lucide_react_1.Camera, layers: lucide_react_1.Layers, fullscreen: lucide_react_1.Maximize2, print: lucide_react_1.Printer, download: lucide_react_1.Download, file: lucide_react_1.FileText, filter: lucide_react_1.SlidersHorizontal, more: lucide_react_1.MoreHorizontal, link: lucide_react_1.Link, refresh: lucide_react_1.RotateCcw, shield: lucide_react_1.ShieldCheck, users: lucide_react_1.Users, info: lucide_react_1.Info, menu: lucide_react_1.Menu, grid: lucide_react_1.LayoutGrid, sun: lucide_react_1.Sun, map: lucide_react_1.MapPin, external: lucide_react_1.ExternalLink, trash: lucide_react_1.Trash2, edit: lucide_react_1.Pencil, undo: lucide_react_1.Undo2, box: lucide_react_1.Package, help: lucide_react_1.HelpCircle, checkcircle: lucide_react_1.CheckCircle2, eye: lucide_react_1.Eye, coins: lucide_react_1.Coins };
function Icon({ name, size = 18, className = '' }) { const C = icons[name] ?? lucide_react_1.House; return react_1.default.createElement(C, { size: size, strokeWidth: 1.7, "aria-hidden": "true", className: className }); }
function Button({ children, onClick, icon, tone = 'default', small = false, disabled = false, title, type = 'button', className = '', ariaLabel }) { return react_1.default.createElement("button", { type: type, onClick: onClick, disabled: disabled, title: title, "aria-label": ariaLabel, className: `button ${tone} ${small ? 'small' : ''} ${className}` },
    icon && react_1.default.createElement(Icon, { name: icon, size: small ? 15 : 17 }),
    " ",
    children); }
function Badge({ children, tone = 'gray', dot = false }) { return react_1.default.createElement("span", { className: `badge ${tone}` },
    dot && react_1.default.createElement("span", { className: "status-dot" }),
    children); }
function Card({ children, title, subtitle, icon, tools, className = '', id }) { return react_1.default.createElement("section", { id: id, className: `card ${className}` },
    title && react_1.default.createElement("div", { className: "card-head" },
        react_1.default.createElement("div", { className: "card-heading" },
            icon && react_1.default.createElement("span", { className: "head-icon" },
                react_1.default.createElement(Icon, { name: icon })),
            react_1.default.createElement("div", null,
                react_1.default.createElement("h2", null, title),
                subtitle && react_1.default.createElement("p", null, subtitle))),
        tools && react_1.default.createElement("div", { className: "card-tools" }, tools)),
    react_1.default.createElement("div", { className: "card-body" }, children)); }
function Stats({ children }) { return react_1.default.createElement("div", { className: "stats" }, children); }
function Stat({ label, value, sub, icon, tone = 'green', onClick }) { const inner = react_1.default.createElement(react_1.default.Fragment, null,
    react_1.default.createElement("span", { className: `stat-icon ${tone}` },
        react_1.default.createElement(Icon, { name: icon, size: 23 })),
    react_1.default.createElement("span", { className: "stat-text" },
        react_1.default.createElement("span", { className: "stat-label" }, label),
        react_1.default.createElement("strong", null, value),
        react_1.default.createElement("span", { className: "stat-sub" }, sub)),
    onClick && react_1.default.createElement(Icon, { name: "chevron", size: 17, className: "stat-chevron" })); return onClick ? react_1.default.createElement("button", { className: "stat card", onClick: onClick }, inner) : react_1.default.createElement("div", { className: "stat card" }, inner); }
function Alert({ children, tone = 'amber', title, action }) { return react_1.default.createElement("div", { className: `notice ${tone}` },
    react_1.default.createElement(Icon, { name: tone === 'green' ? 'checkcircle' : tone === 'blue' || tone === 'gray' ? 'info' : 'alert', size: 18 }),
    react_1.default.createElement("div", null,
        title && react_1.default.createElement("strong", null, title),
        children && react_1.default.createElement("div", null, children)),
    action && react_1.default.createElement("div", { className: "notice-action" }, action)); }
function Tabs({ items, value, onChange }) { return react_1.default.createElement("div", { className: "tabs", role: "tablist" }, items.map(item => react_1.default.createElement("button", { key: item.id, role: "tab", "aria-selected": value === item.id, className: value === item.id ? 'active' : '', onClick: () => onChange(item.id) },
    item.label,
    item.count !== undefined && react_1.default.createElement("span", null, item.count)))); }
function Progress({ value, label }) { return react_1.default.createElement("div", { className: "progress-wrap" },
    react_1.default.createElement("div", { className: "progress", role: "progressbar", "aria-label": label ?? 'Progres', "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(value) },
        react_1.default.createElement("span", { style: { width: `${Math.max(0, Math.min(100, value))}%` } })),
    label && react_1.default.createElement("span", null, label)); }
function Empty({ title, detail, action, icon = 'leaf' }) { return react_1.default.createElement("div", { className: "empty" },
    react_1.default.createElement("span", { className: "empty-icon" },
        react_1.default.createElement(Icon, { name: icon, size: 26 })),
    react_1.default.createElement("h3", null, title),
    detail && react_1.default.createElement("p", null, detail),
    action); }
function Field({ label, children, hint, className = '' }) { return react_1.default.createElement("label", { className: `field ${className}` },
    react_1.default.createElement("span", null, label),
    children,
    hint && react_1.default.createElement("small", null, hint)); }
function Select({ value, onChange, options, label, className = '' }) { return react_1.default.createElement("label", { className: `select-wrap ${className}` },
    react_1.default.createElement("span", { className: "sr-only" }, label),
    react_1.default.createElement("select", { "aria-label": label, value: value, onChange: (e) => onChange(e.currentTarget.value) }, options.map(o => react_1.default.createElement("option", { key: o.value, value: o.value }, o.label))),
    react_1.default.createElement(Icon, { name: "down", size: 14 })); }
function SearchField({ value, onChange, placeholder = 'Cari data…' }) { return react_1.default.createElement("label", { className: "search-field" },
    react_1.default.createElement(Icon, { name: "search", size: 16 }),
    react_1.default.createElement("input", { type: "search", value: value, "aria-label": placeholder, placeholder: placeholder, onInput: (e) => onChange(e.currentTarget.value) })); }
function Meta({ items }) { return react_1.default.createElement("dl", { className: "meta-list" }, items.map(i => react_1.default.createElement("div", { key: i.label },
    react_1.default.createElement("dt", null, i.label),
    react_1.default.createElement("dd", null, i.value)))); }
function FormError({ message }) { return message ? react_1.default.createElement("div", { className: "form-error", role: "alert" },
    react_1.default.createElement(Icon, { name: "alert", size: 17 }),
    message) : null; }
class FormBox extends react_1.default.Component {
    state = { error: '', submitted: false };
    render() {
        return react_1.default.createElement("form", { className: this.props.className ?? 'form-stack', onSubmit: (e) => {
                e.preventDefault();
                if (this.state.submitted)
                    return;
                const result = this.props.onSubmit(new FormData(e.currentTarget));
                this.setState({ error: result.ok ? '' : result.message, submitted: result.ok });
            } },
            react_1.default.createElement(FormError, { message: this.state.error }),
            this.props.children);
    }
}
exports.FormBox = FormBox;
class Modal extends react_1.default.Component {
    dialog = react_1.default.createRef();
    componentDidMount() { this.dialog.current?.showModal(); }
    componentWillUnmount() { this.dialog.current?.close(); }
    render() {
        return react_1.default.createElement("dialog", { ref: this.dialog, className: `modal ${this.props.wide ? 'wide' : ''} ${this.props.drawer ? 'drawer' : ''}`, onCancel: (e) => { e.preventDefault(); this.props.onClose(); }, onClick: (e) => {
                if (e.target === this.dialog.current)
                    this.props.onClose();
            }, "aria-labelledby": "modal-title" },
            react_1.default.createElement("div", { className: "modal-inner" },
                react_1.default.createElement("header", { className: "modal-head" },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("h2", { id: "modal-title" }, this.props.title),
                        this.props.description && react_1.default.createElement("p", null, this.props.description)),
                    react_1.default.createElement(Button, { icon: "close", tone: "ghost", ariaLabel: "Tutup", onClick: this.props.onClose })),
                react_1.default.createElement("div", { className: "modal-body" }, this.props.children)));
    }
}
exports.Modal = Modal;
function SectionLabel({ children }) { return react_1.default.createElement("div", { className: "section-label" }, children); }
function SourceTag({ children = 'Tercatat' }) { return react_1.default.createElement("span", { className: "source-tag" }, children); }

},
"data/assets":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assets = void 0;
/** Cropped from the user's supplied design assets, never used as full-screen UI. */
exports.assets = {
    logo: './assets/vigor-forest.webp',
    camera: './assets/camera-trap.webp',
    evidence: './assets/inspection-evidence.webp',
    inspection: './assets/inspection-work.webp',
    greenhouseReference: './assets/greenhouse-reference.webp',
    cameraVideo: null,
    greenhouseModel: null,
};

},
"data/fixtures":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZONES = void 0;
exports.makeVersion = makeVersion;
exports.irrigationSteps = irrigationSteps;
exports.createFixture = createFixture;
const format_1 = require("../domain/format");
exports.ZONES = ['A', 'B', 'C', 'D', 'E', 'F'];
const cameraIds = ['CAM-A-01', 'CAM-B-02', 'CAM-C-01', 'CAM-D-01', 'CAM-E-01', 'CAM-F-01'];
const baseDevices = exports.ZONES.flatMap((zone, i) => [
    { id: cameraIds[i], label: `Kamera ${cameraIds[i].slice(4)}`, type: 'camera', zones: [zone], capabilities: ['camera'], connection: zone === 'E' ? 'offline' : 'online', maintenance: false, calibrated: true, watts: 5, lastSeen: zone === 'E' ? '2026-10-13T08:10:00+07:00' : '2026-10-13T09:42:00+07:00', nextMaintenance: '2026-10-20', active: true },
    { id: `TH-${zone}-01`, label: `Suhu/RH Zona ${zone}`, type: 'sensor', zones: [zone], capabilities: ['temperature', 'humidity'], connection: 'online', maintenance: false, calibrated: zone !== 'F', watts: 1, lastSeen: '2026-10-13T09:42:00+07:00', nextMaintenance: '2026-11-01', active: true }
]);
function device(id, label, type, zones, capabilities, watts, resource) { return { id, label, type, zones, capabilities, connection: 'online', maintenance: false, calibrated: true, watts, lastSeen: '2026-10-13T09:42:00+07:00', nextMaintenance: '2026-10-20', active: true, resource }; }
const additional = [device('CTRL-01', 'Gateway / controller', 'controller', exports.ZONES, ['gateway', 'test_module'], 5), device('PUMP-01', 'Pompa irigasi', 'irrigation', ['A', 'B'], ['pump'], 900, 'PUMP-01'), device('VALVE-A', 'Valve Zona A', 'irrigation', ['A'], ['valve'], 8, 'PUMP-01'), device('VALVE-B', 'Valve Zona B', 'irrigation', ['B'], ['valve'], 8, 'PUMP-01'), device('LEVEL-01', 'Level tangki air', 'irrigation', ['A', 'B'], ['level'], 1), device('FLOW-01', 'Sensor aliran', 'irrigation', ['A', 'B'], ['flow'], 1), device('MEDIA-A', 'Kelembapan media A', 'irrigation', ['A'], ['media'], 1), device('MEDIA-B', 'Kelembapan media B', 'irrigation', ['B'], ['media'], 1), device('DOSE-01', 'Injector nutrisi', 'nutrition', ['A'], ['dose'], 120, 'PUMP-01'), device('NUTRI-LEVEL-01', 'Level tangki nutrisi', 'nutrition', ['A'], ['level'], 1), device('EC-01', 'Sensor EC', 'nutrition', ['A'], ['ec'], 1), device('PH-01', 'Sensor pH', 'nutrition', ['A'], ['ph'], 1), device('FAN-01', 'Fan sirkulasi', 'environment', ['A', 'B'], ['fan'], 85, 'FAN-01')];
const step = (id, label, action, duration, deviceIds = [], zoneId) => ({ id, label, action, duration, deviceIds, zoneId });
function makeVersion(id, zones, steps, requiredDevices, resource) { return { id: `${id}-v1.2`, number: '1.2', reviewed: true, createdAt: '2026-10-12T08:00:00+07:00', zones, steps, requiredDevices, optionalDevices: [], resource, maxDuration: 900, maxCyclesPerDay: 4, cooldownSeconds: 60, maxWaterPerDay: 600, maxNutritionPerDay: 20, queueTimeout: 600, flowLpm: 16, nutrientUnits: 2 }; }
function irrigationSteps(zones, duration = 120) { return [step('precheck', 'Periksa konfigurasi & ketersediaan air', 'check', 3, ['LEVEL-01', 'FLOW-01']), ...zones.flatMap(z => [step(`start-${z}`, `Buka valve · Zona ${z}`, 'start', 3, [`VALVE-${z}`, 'PUMP-01'], z), step(`water-${z}`, `Siram Zona ${z}`, 'water', duration, ['PUMP-01', `VALVE-${z}`, 'FLOW-01'], z), step(`stop-${z}`, `Hentikan aliran · Zona ${z}`, 'stop', 3, ['PUMP-01', `VALVE-${z}`], z)]), step('verify', 'Verifikasi penghentian', 'verify', 3, ['FLOW-01'])]; }
const schedule = (times) => ({ type: 'schedule', schedule: { times, weekdays: [0, 1, 2, 3, 4, 5, 6], validFrom: '2026-10-13', timeZone: 'Asia/Jakarta' } });
function routines() {
    const water = makeVersion('RTN-001', ['A', 'B'], irrigationSteps(['A', 'B']), ['CTRL-01', 'PUMP-01', 'VALVE-A', 'VALVE-B', 'LEVEL-01', 'FLOW-01', 'MEDIA-A', 'MEDIA-B'], 'PUMP-01');
    const nutrition = makeVersion('RTN-002', ['A'], [step('precheck', 'Periksa air, nutrisi & profil aktif', 'check', 3, ['LEVEL-01', 'NUTRI-LEVEL-01', 'EC-01', 'PH-01']), step('flow', 'Bentuk aliran air', 'start', 4, ['PUMP-01', 'VALVE-A'], 'A'), step('verify-flow', 'Verifikasi aliran', 'verify_flow', 3, ['FLOW-01'], 'A'), step('dose', 'Pemberian nutrisi · profil demo', 'dose', 60, ['DOSE-01', 'FLOW-01'], 'A'), step('flush', 'Pembilasan sesuai profil demo', 'flush', 30, ['PUMP-01', 'VALVE-A'], 'A'), step('stop', 'Hentikan injector & aliran', 'stop', 3, ['DOSE-01', 'PUMP-01', 'VALVE-A'], 'A'), step('verify', 'Verifikasi hasil & penghentian', 'verify', 3, ['FLOW-01'], 'A')], ['CTRL-01', 'PUMP-01', 'VALVE-A', 'LEVEL-01', 'FLOW-01', 'DOSE-01', 'NUTRI-LEVEL-01', 'EC-01', 'PH-01'], 'PUMP-01');
    nutrition.nutrientProfileId = 'NP-001';
    return [
        { id: 'RTN-001', name: 'Penyiraman A–B', kind: 'irrigation', description: 'Satu pompa, dua zona secara bergantian.', status: 'Active', policy: 'automatic', trigger: schedule(['10:00']), version: water, skippedSlots: [] },
        { id: 'RTN-002', name: 'Fertigasi Zona A', kind: 'fertigation', description: 'Aliran terkonfirmasi sebelum nutrisi diberikan.', status: 'Active', policy: 'automatic', trigger: schedule(['10:30']), version: nutrition, skippedSlots: [] },
        { id: 'RTN-003', name: 'Sirkulasi udara', kind: 'environment', description: 'Fan independen. Suhu teramati terpisah dari status fan.', status: 'Active', policy: 'automatic', trigger: { type: 'sensor', deviceId: 'TH-A-01', direction: 'above', start: 29, recover: 28, debounceSeconds: 30, windowStart: '08:00', windowEnd: '17:00' }, version: makeVersion('RTN-003', ['A', 'B'], [step('precheck', 'Periksa sensor suhu', 'check', 3, ['TH-A-01']), step('fan', 'Sirkulasi udara', 'fan', 180, ['FAN-01']), step('stop', 'Hentikan fan', 'stop', 3, ['FAN-01']), step('verify', 'Periksa feedback fan', 'verify', 3, ['FAN-01'])], ['FAN-01', 'TH-A-01'], 'FAN-01'), skippedSlots: [] },
        { id: 'RTN-004', name: 'Pemeriksaan filter', kind: 'preventive', description: 'Tugas petugas: periksa filter dan kondisi jalur.', status: 'Active', policy: 'task', trigger: schedule(['13:00']), version: makeVersion('RTN-004', ['A', 'B'], [step('manual', 'Periksa dan bersihkan filter', 'task', 0, ['PUMP-01'])], [], null), skippedSlots: [] },
        { id: 'RTN-005', name: 'Modul preventif uji', kind: 'pest', description: 'Modul uji virtual pada controller. Efektivitas belum dievaluasi.', status: 'Active', policy: 'automatic', trigger: schedule(['16:00']), version: makeVersion('RTN-005', ['A'], [step('check', 'Periksa profil modul uji', 'check', 3, ['CTRL-01']), step('test', 'Jalankan modul uji virtual', 'test', 90, ['CTRL-01'], 'A'), step('stop', 'Hentikan modul uji', 'stop', 3, ['CTRL-01'], 'A'), step('verify', 'Verifikasi feedback simulator', 'verify', 3, ['CTRL-01'], 'A')], ['CTRL-01'], 'TEST-MODULE'), skippedSlots: [] },
        { id: 'RTN-006', name: 'Penyiraman berbasis media', kind: 'irrigation', description: 'Indeks relatif media, bukan RH udara. Memerlukan aktivasi.', status: 'Draft', policy: 'automatic', trigger: { type: 'sensor', deviceId: 'MEDIA-A', direction: 'below', start: 30, recover: 45, debounceSeconds: 60, windowStart: '08:00', windowEnd: '17:00' }, version: { ...makeVersion('RTN-006', ['A'], irrigationSteps(['A']), ['PUMP-01', 'VALVE-A', 'FLOW-01', 'LEVEL-01', 'MEDIA-A'], 'PUMP-01'), reviewed: false, cooldownSeconds: 1800 }, skippedSlots: [] }
    ];
}
function createFixture() {
    const rows = [['EXP-001', '2026-09-30', 'Air', 210000, 'Tagihan air greenhouse'], ['EXP-002', '2026-09-02', 'Nutrisi', 480000, 'Nutrisi untuk pemakaian September'], ['EXP-003', '2026-09-30', 'Listrik', 135000, 'Tagihan greenhouse · 90 kWh'], ['EXP-004', '2026-09-01', 'Internet', 45000, 'Koneksi gateway', 'CTRL-01'], ['EXP-005', '2026-09-06', 'Perawatan', 45000, 'Servis pompa', 'PUMP-01'], ['EXP-006', '2026-09-20', 'Perawatan', 65000, 'Kalibrasi sensor EC', 'EC-01'], ['EXP-007', '2026-09-28', 'Tenaga dibayar', 100000, 'Upah pekerja harian']];
    const observations = exports.ZONES.flatMap((z, i) => [8, 9, 10, 11, 12, 13].map((day, j) => ({ id: `OBS-${z}-${day}`, zoneId: z, at: `2026-10-${day.toString().padStart(2, '0')}T09:30:00+07:00`, intervalHours: 24, newCaptures: i > 3 ? null : ([[4, 5, 4, 5, 6, 6], [5, 6, 7, 12, 19, 26], [4, 4, 5, 4, 6, 5], [7, 6, 6, 5, 7, 6]][i][j]), sourceDeviceId: cameraIds[i] })));
    return structuredClone({ schemaVersion: 3, greenhouse: { id: 'GH-01', name: 'Greenhouse 01', location: 'Kebun Bogor', area: 360, plantedArea: 288 }, cycle: { id: 'PAP-2026-08', crop: 'Paprika merah', phase: 'Berbuah', plantedOn: '2026-08-10', plants: 432 }, zones: exports.ZONES.map((id, i) => ({ id, name: `Zona ${id}`, area: 48, plants: 72, validated: i < 4, temperature: [27.8, 28.4, 27.6, 28.1, 28, 27.9][i], humidity: [73, 76, 72, 74, 75, 73][i] })), devices: [...baseDevices, ...additional], cases: [{ id: 'INS-024', zoneId: 'B', title: 'Tangkapan meningkat', status: 'inspection', verified: false, assignedTo: null, createdAt: '2026-10-13T09:30:00+07:00', sourceDeviceId: 'CAM-B-02' }, { id: 'INS-023', zoneId: 'C', title: 'Tindak lanjut pengamatan', status: 'monitoring', verified: true, assignedTo: 'Budi Santoso', createdAt: '2026-10-12T10:00:00+07:00', followUpAt: '2026-10-14', sourceDeviceId: 'CAM-C-01' }, ...['A', 'D', 'B', 'A'].map((zoneId, i) => ({ id: `INS-${22 - i < 10 ? '0' : ''}${22 - i}`.replace('INS-22', 'INS-022').replace('INS-21', 'INS-021').replace('INS-20', 'INS-020').replace('INS-19', 'INS-019'), zoneId, title: 'Pengamatan ditinjau operator', status: 'closed', verified: true, assignedTo: 'Budi Santoso', createdAt: `2026-10-${String(7 - i).padStart(2, '0')}T09:00:00+07:00`, closedAt: `2026-10-${String(11 - i).padStart(2, '0')}T15:00:00+07:00`, sourceDeviceId: cameraIds[exports.ZONES.indexOf(zoneId)] }))], inspections: [{ id: 'CHK-001', caseId: 'INS-023', at: '2026-10-12T15:40:00+07:00', operator: 'Budi Santoso', examined: 12, affected: 2, outcome: 'indication', notes: 'Dua tanaman menunjukkan gejala. Periksa kembali pada 14 Oktober.' }], plans: [{ id: 'PLN-012', caseId: 'INS-023', zoneId: 'C', kind: 'manual', title: 'Perawatan perangkap & screen', operator: 'Budi Santoso', notes: 'Observasi lanjutan tetap diperlukan.', status: 'monitoring', durationSeconds: 90, tasks: [{ id: 'task-1', label: 'Periksa perangkap monitoring', done: true }, { id: 'task-2', label: 'Periksa screen dan area sekitar', done: true }, { id: 'task-3', label: 'Catat observasi lanjutan', done: false }], createdAt: '2026-10-12T16:00:00+07:00', evaluationAt: '2026-10-14' }], observations, routines: routines(), nutrientProfiles: [{ id: 'NP-001', name: 'Paprika · Berbuah', version: '1.2', crop: 'Paprika merah', zones: ['A'], reviewed: true, status: 'active', deviceIds: ['DOSE-01', 'FLOW-01', 'EC-01', 'PH-01'], ec: 1.8, ph: 6.1, demoUnits: 2, note: 'Parameter simulasi, bukan resep budidaya. Tanpa koreksi pH otomatis.' }, { id: 'NP-002', name: 'Paprika · Vegetatif', version: '0.1', crop: 'Paprika merah', zones: ['A'], reviewed: false, status: 'draft', deviceIds: ['DOSE-01'], ec: 1.6, ph: 6.2, demoUnits: 1, note: 'Draft profil demo; belum dipakai rutinitas.' }], runs: [], commands: [], locks: [], usages: Array.from({ length: 30 }, (_, i) => ({ id: `USE-SEP-${i + 1}`, runId: `HIST-SEP-${i + 1}`, routineVersionId: 'RTN-001-historic-v0.8', deviceId: 'PUMP-01', at: `2026-09-${String(i + 1).padStart(2, '0')}T10:00:00+07:00`, seconds: 3600, waterLiters: 0, nutrientUnits: 0, energyKwh: 0.9, waterSource: 'estimate', deliveryConfirmed: true })), maintenance: [{ id: 'DEV-008', deviceId: 'CAM-E-01', title: 'Kamera E-01 offline', operator: null, status: 'open', createdAt: '2026-10-13T08:25:00+07:00', dueAt: '2026-10-13', notes: 'Koneksi hilang sejak 08:10. Gangguan terdeteksi 08:20. Menunggu teknisi.' }, { id: 'MNT-005', deviceId: 'PUMP-01', title: 'Servis pompa', operator: 'Budi Santoso', status: 'completed', createdAt: '2026-09-06T09:00:00+07:00', dueAt: '2026-09-06', expenseId: 'EXP-005', notes: 'Pemeriksaan bearing dan seal · catatan demo.' }, { id: 'MNT-006', deviceId: 'EC-01', title: 'Kalibrasi sensor EC', operator: 'Budi Santoso', status: 'completed', createdAt: '2026-09-20T09:00:00+07:00', dueAt: '2026-09-20', expenseId: 'EXP-006', notes: 'Kalibrasi demo tercatat.' }], events: [{ id: 'EVT-009', at: '2026-10-13T09:30:00+07:00', type: 'observation', title: 'Tangkapan Zona B meningkat', detail: '26 tangkapan baru / 24 jam. Belum diverifikasi lewat inspeksi tanaman.', actor: 'Monitoring demo', objectId: 'INS-024', zoneId: 'B' }, { id: 'EVT-008', at: '2026-10-13T08:25:00+07:00', type: 'device', title: 'Tiket perbaikan Kamera E-01 dibuat', detail: 'DEV-008 · menunggu teknisi. Rekaman terakhir 08:10 WIB.', actor: 'Monitoring demo', objectId: 'CAM-E-01', zoneId: 'E' }, { id: 'EVT-007', at: '2026-10-12T16:00:00+07:00', type: 'plan', title: 'Rencana Zona C dipantau', detail: 'Tugas dilaksanakan; evaluasi dijadwalkan 14 Oktober.', actor: 'Budi Santoso', objectId: 'PLN-012', zoneId: 'C' }, { id: 'EVT-006', at: '2026-10-12T15:40:00+07:00', type: 'inspection', title: 'Inspeksi Zona C selesai', detail: '12 tanaman diperiksa, 2 bergejala. Kasus tetap dipantau.', actor: 'Budi Santoso', objectId: 'INS-023', zoneId: 'C' }, { id: 'EVT-005', at: '2026-10-12T08:00:00+07:00', type: 'routine', title: 'Rutinitas v1.2 ditinjau & diaktifkan', detail: 'Penyiraman terjadwal A–B otomatis. Persetujuan tidak diperlukan setiap run.', actor: 'Budi Santoso', objectId: 'RTN-001' }, { id: 'EVT-004', at: '2026-10-11T15:00:00+07:00', type: 'inspection', title: 'Kasus Zona A ditutup setelah review', detail: 'Operator meninjau hasil observasi lanjutan.', actor: 'Budi Santoso', objectId: 'INS-022', zoneId: 'A' }], expenses: rows.map(([id, paidAt, category, amount, note, deviceId]) => ({ id, paidAt, category, amount, note, deviceId, greenhouseId: 'GH-01', source: 'demo_ledger', status: 'paid', submissionKey: `fixture-${id}`, createdAt: paidAt + 'T09:00:00+07:00', ...(id === 'EXP-005' ? { maintenanceId: 'MNT-005' } : id === 'EXP-006' ? { maintenanceId: 'MNT-006' } : {}) })), allocations: [{ id: 'ALL-001', expenseId: 'EXP-003', deviceId: 'PUMP-01', amount: 40500, basis: 'estimated_power_runtime', label: '30 jam × 900 W = 27 kWh; 30% tagihan' }, { id: 'ALL-002', expenseId: 'EXP-003', deviceId: 'DOSE-01', amount: 27000, basis: 'manual', label: 'Alokasi fixture September' }, { id: 'ALL-003', expenseId: 'EXP-003', deviceId: 'CTRL-01', amount: 4500, basis: 'manual', label: 'Alokasi fixture September' }, { id: 'ALL-004', expenseId: 'EXP-003', deviceId: 'CAM-E-01', amount: 4500, basis: 'manual', label: 'Alokasi fixture September' }, { id: 'ALL-005', expenseId: 'EXP-003', amount: 58500, basis: 'manual', label: 'Perangkat lain (belum dirinci)' }], recurring: [{ id: 'REC-001', category: 'Internet', title: 'Konfirmasi biaya internet', day: 1, deviceId: 'CTRL-01', effectiveFrom: '2026-10-01' }], budgets: [{ period: '2026-09', amount: 1200000, greenhouseId: 'GH-01' }, { period: '2026-10', amount: 1200000, greenhouseId: 'GH-01' }], baseline: { id: 'BASE-001', version: 1, source: 'assumption', period: '2026-09', days: 30, zones: exports.ZONES, area: 288, crop: 'Paprika merah', phase: 'Berbuah', categories: { Air: 300000, Nutrisi: 600000, Listrik: 100000, Internet: 0, Perawatan: 100000, 'Tenaga dibayar': 300000 }, normalizedDaily: false, appliedOn: '2026-09-01' }, costs: { electricityPerKwh: 1500, waterPerLiter: 10, nutrientUnitPrice: 2500, plannerZones: 2, ownedController: false, contingencyPercent: 10 }, overrides: [], clock: format_1.START, playing: false, speed: 60, scenario: 'normal', profile: 'automation', seenTriggers: [], episodes: {}, storageWarning: null, notification: null });
}

},
"domain/actions":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAction = applyAction;
exports.transition = transition;
const fixtures_1 = require("../data/fixtures");
const costs_1 = require("./costs");
const format_1 = require("./format");
const scheduler_1 = require("./scheduler");
function applyAction(s, a) {
    let message = '', id;
    switch (a.type) {
        case 'tick':
            (0, scheduler_1.advanceInPlace)(s, a.seconds);
            break;
        case 'next':
            (0, scheduler_1.advanceInPlace)(s, (0, scheduler_1.nextEventTime)(s) - s.clock);
            break;
        case 'play':
            s.playing = a.value;
            message = a.value ? 'Clock demo berjalan. Rutinitas aktif akan dieksekusi sesuai jadwal.' : 'Clock demo dijeda. Tidak ada waktu nyata yang dikejar.';
            break;
        case 'speed':
            s.speed = a.value;
            break;
        case 'clear_notice':
            s.notification = null;
            s.storageWarning = null;
            break;
        case 'scenario':
            (0, scheduler_1.setScenario)(s, a.value);
            message = 'Skenario simulator diperbarui. Jadwal menggunakan syarat yang sama.';
            break;
        case 'profile':
            if (s.runs.some(r => (0, format_1.isActiveRun)(r.status) || r.status === 'Needs reconciliation'))
                throw new Error('Selesaikan atau periksa status run aktif sebelum mengganti profil.');
            s.profile = a.value;
            s.playing = false;
            (0, format_1.activity)(s, 'system', 'Profil demo diganti', a.value === 'automation' ? 'Operasional otomatis · 25 perangkat fixture.' : 'Monitoring saja · 12 perangkat observasi. Riwayat biaya tetap disimpan.', 'demo');
            message = 'Profil demo diubah. Tidak ada perangkat nyata yang dihubungkan.';
            break;
        case 'reset':
            Object.assign(s, (0, fixtures_1.createFixture)());
            message = 'Demo direset ke 13 Oktober 2026, 09:42 WIB.';
            break;
        case 'assign': {
            const c = s.cases.find(c => c.id === a.caseId);
            if (!c)
                throw new Error('Kasus tidak ditemukan.');
            if (!a.operator.trim())
                throw new Error('Pilih penanggung jawab.');
            c.assignedTo = a.operator;
            (0, format_1.activity)(s, 'inspection', `${c.id} ditugaskan`, a.operator, c.id, c.zoneId);
            message = `${c.id} ditugaskan kepada ${a.operator}.`;
            break;
        }
        case 'inspection': {
            const i = a.inspection, c = s.cases.find(c => c.id === i.caseId);
            if (!c)
                throw new Error('Kasus tidak ditemukan.');
            if (!Number.isInteger(i.examined) || i.examined < 1 || !Number.isInteger(i.affected) || i.affected < 0 || i.affected > i.examined)
                throw new Error('Jumlah bergejala harus 0 sampai jumlah tanaman yang diperiksa.');
            if (!i.operator.trim() || i.notes.trim().length < 5)
                throw new Error('Petugas dan catatan minimal 5 karakter wajib diisi.');
            if (Date.parse(i.at) / 1000 > s.clock)
                throw new Error('Tanggal inspeksi tidak boleh melewati waktu demo.');
            id = (0, format_1.nextId)('CHK', s.inspections);
            s.inspections.unshift({ ...i, id });
            c.assignedTo = i.operator;
            c.verified = i.outcome !== 'inconclusive';
            (0, format_1.activity)(s, 'inspection', `Inspeksi ${c.id} dicatat`, `${i.examined} tanaman diperiksa, ${i.affected} bergejala. Kasus belum ditutup.`, c.id, c.zoneId);
            message = 'Inspeksi disimpan. Kasus tidak ditutup otomatis.';
            break;
        }
        case 'plan': {
            const c = s.cases.find(c => c.id === a.plan.caseId);
            if (!c)
                throw new Error('Kasus tidak ditemukan.');
            if (!s.inspections.some(i => i.caseId === c.id))
                throw new Error('Catat inspeksi tanaman sebelum membuat rencana.');
            if (!a.plan.title.trim() || !a.plan.operator.trim())
                throw new Error('Judul dan penanggung jawab wajib diisi.');
            if (a.plan.durationSeconds < 10 || a.plan.durationSeconds > 300)
                throw new Error('Durasi simulator harus 10–300 detik.');
            if (a.plan.kind === 'simulator' && !c.verified)
                throw new Error('Kasus belum memenuhi persyaratan review.');
            id = (0, format_1.nextId)('PLN', s.plans);
            s.plans.unshift({ ...a.plan, id, createdAt: (0, format_1.iso)(s.clock), status: 'awaiting_approval', tasks: [{ id: 'task-1', label: 'Periksa perangkap dan tanaman terkait', done: false }, { id: 'task-2', label: 'Periksa screen dan bersihkan area', done: false }, { id: 'task-3', label: 'Catat observasi lanjutan', done: false }] });
            (0, format_1.activity)(s, 'plan', `${id} menunggu persetujuan`, a.plan.title, id, c.zoneId);
            message = 'Rencana dibuat dan ditautkan ke kasus sumber.';
            break;
        }
        case 'approve_plan': {
            const p = s.plans.find(p => p.id === a.id);
            if (!p)
                throw new Error('Rencana tidak ditemukan.');
            if (p.kind === 'expert_review')
                throw new Error('Rencana ini memerlukan peninjauan ahli; tidak ada aktuasi bahan dalam prototype.');
            if (p.status !== 'awaiting_approval' && p.status !== 'draft')
                throw new Error('Rencana sudah ditinjau.');
            p.status = 'approved';
            (0, format_1.activity)(s, 'plan', `${p.id} disetujui`, 'Operator meninjau zona, bukti, penanggung jawab, dan batas operasi.', p.id, p.zoneId);
            message = 'Rencana disetujui. Pelaksanaan belum dianggap selesai.';
            break;
        }
        case 'start_plan': {
            const p = s.plans.find(p => p.id === a.id);
            if (!p || p.status !== 'approved')
                throw new Error('Rencana harus disetujui terlebih dahulu.');
            if (p.kind !== 'simulator')
                throw new Error('Tugas nonkimia dikerjakan petugas, bukan aktuator.');
            if (s.runs.some(r => r.planId === p.id && ((0, format_1.isActiveRun)(r.status) || r.status === 'Needs reconciliation')))
                throw new Error('Rencana sudah memiliki run aktif atau belum terkonfirmasi.');
            const version = (0, fixtures_1.makeVersion)(p.id, [p.zoneId], [{ id: 'check', label: 'Periksa modul uji virtual', action: 'check', duration: 3, deviceIds: ['CTRL-01'], zoneId: p.zoneId }, { id: 'test', label: 'Jalankan modul uji', action: 'test', duration: p.durationSeconds, deviceIds: ['CTRL-01'], zoneId: p.zoneId }, { id: 'stop', label: 'Hentikan modul uji', action: 'stop', duration: 3, deviceIds: ['CTRL-01'], zoneId: p.zoneId }, { id: 'verify', label: 'Verifikasi feedback', action: 'verify', duration: 3, deviceIds: ['CTRL-01'], zoneId: p.zoneId }], ['CTRL-01'], 'TEST-MODULE');
            const r = { id: p.id, name: p.title, kind: 'pest', description: 'Simulasi modul uji; efektivitas belum dievaluasi.', status: 'Active', policy: 'automatic', trigger: { type: 'schedule', schedule: { times: [], weekdays: [], validFrom: (0, format_1.localDate)(s.clock), timeZone: 'Asia/Jakarta' } }, version, skippedSlots: [] };
            const run = (0, scheduler_1.createRun)(s, r, 'plan', `${p.id}|manual|${s.clock}|${s.runs.length}`, p.id);
            if (run) {
                p.runId = run.id;
                id = run.id;
                p.status = 'running';
                (0, scheduler_1.advanceInPlace)(s, 1);
                s.playing = true;
            }
            message = 'Perintah simulator dibuat. Status pelaksanaan terlihat pada Eksekusi.';
            break;
        }
        case 'plan_task': {
            const p = s.plans.find(p => p.id === a.id);
            if (!p || !['approved', 'running', 'monitoring'].includes(p.status))
                throw new Error('Setujui rencana sebelum mencatat pelaksanaan.');
            const task = p.tasks.find(t => t.id === a.taskId);
            if (task) {
                task.done = !task.done;
                (0, format_1.activity)(s, 'plan', task.label, task.done ? 'Diselesaikan oleh operator.' : 'Dibuka kembali oleh operator.', p.id, p.zoneId);
            }
            if (p.tasks.filter(t => t.id !== 'task-3').every(t => t.done)) {
                p.status = 'monitoring';
                const c = s.cases.find(c => c.id === p.caseId);
                if (c)
                    c.status = 'monitoring';
            }
            message = 'Checklist pelaksanaan diperbarui. Evaluasi tetap terpisah.';
            break;
        }
        case 'evaluate_plan': {
            const p = s.plans.find(p => p.id === a.id);
            if (!p)
                throw new Error('Rencana tidak ditemukan.');
            if (!a.date || a.notes.trim().length < 10)
                throw new Error('Tanggal dan catatan evaluasi minimal 10 karakter wajib diisi.');
            if (a.close && a.date > (0, format_1.localDate)(s.clock))
                throw new Error('Observasi di masa depan belum dapat dijadikan hasil review. Majukan clock atau jadwalkan evaluasi saja.');
            if (a.close && !['monitoring', 'completed'].includes(p.status))
                throw new Error('Pelaksanaan belum masuk pemantauan.');
            p.evaluationAt = a.date;
            p.evaluationNotes = a.notes;
            p.status = a.close ? 'completed' : 'monitoring';
            const c = s.cases.find(c => c.id === p.caseId);
            if (c) {
                c.followUpAt = a.date;
                c.status = a.close ? 'closed' : 'monitoring';
                if (a.close)
                    c.closedAt = (0, format_1.iso)(s.clock);
            }
            (0, format_1.activity)(s, 'plan', a.close ? 'Hasil ditinjau; kasus ditutup' : 'Evaluasi lanjutan dijadwalkan', a.notes, p.id, p.zoneId);
            message = a.close ? 'Kasus ditutup setelah review operator.' : 'Evaluasi dijadwalkan. Kasus tetap dipantau.';
            break;
        }
        case 'routine_toggle': {
            const r = s.routines.find(r => r.id === a.id);
            if (!r)
                throw new Error('Rutinitas tidak ditemukan.');
            if (r.status === 'Draft' || r.status === 'Needs review')
                throw new Error('Tinjau versi rutinitas sebelum aktivasi.');
            r.status = r.status === 'Active' ? 'Paused' : 'Active';
            (0, format_1.activity)(s, 'routine', `${r.name} ${r.status === 'Paused' ? 'dijeda' : 'dilanjutkan'}`, 'Perubahan berlaku pada jadwal berikutnya, tidak menghentikan run aktif.', r.id, r.version.zones[0]);
            message = 'Jadwal diperbarui. Run yang sudah berjalan tidak dihentikan.';
            break;
        }
        case 'routine_activate': {
            const r = s.routines.find(r => r.id === a.id);
            if (!r)
                throw new Error('Rutinitas tidak ditemukan.');
            const errors = (0, scheduler_1.validateRoutine)(s, r);
            if (errors.length)
                throw new Error(errors.join(' '));
            r.version.reviewed = true;
            r.status = 'Active';
            (0, format_1.activity)(s, 'routine', `${r.name} v${r.version.number} diaktifkan`, 'Konfigurasi ditinjau sekali. Eksekusi otomatis berikutnya tidak meminta persetujuan ulang.', r.id, r.version.zones[0]);
            message = 'Versi rutinitas ditinjau dan diaktifkan.';
            break;
        }
        case 'routine_save': {
            const incoming = structuredClone(a.routine), index = s.routines.findIndex(r => r.id === incoming.id);
            if (index >= 0) {
                const current = s.routines[index], minor = Number(current.version.number.split('.')[1] ?? 0) + 1;
                incoming.version.number = `1.${minor}`;
                incoming.version.id = `${incoming.id}-v1.${minor}`;
            }
            else {
                incoming.id = (0, format_1.nextId)('RTN', s.routines);
                incoming.version.id = `${incoming.id}-v1.0`;
                incoming.version.number = '1.0';
            }
            incoming.version.createdAt = (0, format_1.iso)(s.clock);
            incoming.version.reviewed = a.activate;
            incoming.status = a.activate ? 'Active' : index >= 0 ? 'Needs review' : 'Draft';
            const errors = (0, scheduler_1.validateRoutine)(s, incoming);
            if (errors.length)
                throw new Error(errors.join(' '));
            if (index >= 0)
                s.routines[index] = incoming;
            else
                s.routines.push(incoming);
            id = incoming.id;
            (0, format_1.activity)(s, 'routine', `${incoming.name} v${incoming.version.number} disimpan`, a.activate ? 'Konfigurasi ditinjau dan diaktifkan. Snapshot run lama tidak diubah.' : 'Versi baru menunggu review. Run lama tidak diubah.', incoming.id, incoming.version.zones[0]);
            message = a.activate ? 'Rutinitas disimpan dan diaktifkan.' : 'Versi baru disimpan; tinjau sebelum aktivasi.';
            break;
        }
        case 'run_once': {
            const r = s.routines.find(r => r.id === a.id);
            if (!r)
                throw new Error('Rutinitas tidak ditemukan.');
            if (!r.version.reviewed)
                throw new Error('Tinjau versi rutinitas sebelum menjalankan.');
            const run = (0, scheduler_1.createRun)(s, r, 'manual', `${r.version.id}|manual|${s.clock}|${s.runs.length}`);
            if (run) {
                id = run.id;
                (0, scheduler_1.advanceInPlace)(s, 1);
                s.playing = true;
            }
            message = 'Run sekali dibuat dengan resource lock dan batas harian yang sama.';
            break;
        }
        case 'skip_once': {
            const r = s.routines.find(r => r.id === a.id);
            if (!r)
                throw new Error('Rutinitas tidak ditemukan.');
            const at = (0, scheduler_1.nextOccurrence)(r, s.clock);
            if (at === null)
                throw new Error('Rutinitas ini tidak memakai jadwal waktu.');
            const key = (0, format_1.localDate)(at) + 'T' + (0, format_1.localTime)(at);
            if (!r.skippedSlots.includes(key))
                r.skippedSlots.push(key);
            (0, format_1.activity)(s, 'routine', `${r.name}: lewati sekali`, key + ' WIB. Slot selanjutnya tetap berjalan.', r.id, r.version.zones[0]);
            message = 'Slot berikutnya ditandai untuk dilewati sekali.';
            break;
        }
        case 'approve_run': {
            const r = s.runs.find(r => r.id === a.id);
            if (!r || r.status !== 'Scheduled')
                throw new Error('Run tidak menunggu persetujuan.');
            r.status = 'Checking';
            r.reason = 'Persetujuan operator diterima.';
            (0, format_1.activity)(s, 'run', 'Run disetujui operator', r.id, r.id);
            (0, scheduler_1.advanceInPlace)(s, 1);
            break;
        }
        case 'stop':
            (0, scheduler_1.requestStop)(s, a.id);
            message = 'Permintaan stop dibuat. Menunggu acknowledgment simulator.';
            break;
        case 'stop_all':
            for (const r of s.runs.filter(r => (0, format_1.isActiveRun)(r.status)))
                (0, scheduler_1.requestStop)(s, r.id, 'Operator menghentikan seluruh simulasi aktif.');
            s.playing = true;
            message = 'Stop diminta untuk seluruh run aktif. Bukan tombol emergency perangkat fisik.';
            break;
        case 'reconcile':
            (0, scheduler_1.reconcile)(s, a.id, a.notes);
            message = 'Status simulator diperiksa. Resource dilepas; run tidak dilanjutkan otomatis.';
            break;
        case 'profile_review': {
            const p = s.nutrientProfiles.find(p => p.id === a.id);
            if (!p)
                throw new Error('Profil tidak ditemukan.');
            if (!Number.isFinite(a.demoUnits) || a.demoUnits <= 0 || a.demoUnits > 10)
                throw new Error('Parameter simulator harus lebih dari 0 dan maksimal 10 unit demo.');
            p.demoUnits = a.demoUnits;
            p.version = `1.${Number(p.version.split('.')[1] ?? 0) + 1}`;
            p.reviewed = true;
            p.status = 'active';
            for (const r of s.routines.filter(r => r.version.nutrientProfileId === p.id)) {
                r.version = { ...r.version, number: `1.${Number(r.version.number.split('.')[1] ?? 0) + 1}`, nutrientUnits: a.demoUnits, reviewed: false };
                r.version.id = `${r.id}-v${r.version.number}`;
                r.status = 'Needs review';
            }
            (0, format_1.activity)(s, 'routine', 'Profil nutrisi diperbarui', `${p.name} v${p.version}; rutinitas tertaut perlu review. Snapshot run aktif tidak berubah.`, p.id);
            message = 'Profil disimpan. Tinjau ulang rutinitas yang memakai parameter baru.';
            break;
        }
        case 'override':
            if (a.notes.trim().length < 10 || a.minutes < 1 || a.minutes > 60)
                throw new Error('Alasan minimal 10 karakter dan durasi 1–60 menit wajib diisi.');
            s.overrides.push({ id: (0, format_1.nextId)('OVR', s.overrides), routineId: a.id, reason: a.notes, createdAt: s.clock, expiresAt: s.clock + a.minutes * 60, scope: 'Jalankan sekali dengan prioritas normal; seluruh hard limit tetap berlaku.' });
            (0, format_1.activity)(s, 'routine', 'Override sementara dicatat', a.notes, a.id);
            message = 'Override dicatat. Sensor wajib, resource lock, dan hard limit tidak dilewati.';
            break;
        case 'add_device': {
            if (!a.device.id.trim() || !a.device.label.trim() || !a.device.zones.length)
                throw new Error('ID, nama, dan zona perangkat wajib diisi.');
            if (s.devices.some(d => d.id === a.device.id))
                throw new Error('ID perangkat sudah ada. Gunakan inventaris yang sama.');
            s.devices.push(a.device);
            id = a.device.id;
            (0, format_1.activity)(s, 'device', 'Perangkat ditambahkan', a.device.label, id, a.device.zones[0]);
            message = 'Perangkat terdaftar tanpa menambahkan pembelian atau pembayaran.';
            break;
        }
        case 'heal': {
            const d = s.devices.find(d => d.id === a.id);
            if (!d)
                throw new Error('Perangkat tidak ditemukan.');
            d.connection = 'online';
            d.lastSeen = (0, format_1.iso)(s.clock);
            (0, format_1.activity)(s, 'device', `${d.label} disimulasikan pulih`, 'Riwayat gangguan dan tiket tidak dihapus. Perawatan fisik harus dicatat terpisah.', d.id, d.zones[0]);
            message = 'Koneksi demo pulih. Riwayat gangguan tetap tersimpan.';
            break;
        }
        case 'maintenance_mode': {
            const d = s.devices.find(d => d.id === a.id);
            if (!d)
                throw new Error('Perangkat tidak ditemukan.');
            const active = s.runs.filter(r => (0, format_1.isActiveRun)(r.status) && r.snapshot.requiredDevices.includes(d.id));
            if (active.length && a.value && !a.stopActive)
                throw new Error('Perangkat digunakan run aktif. Konfirmasi penghentian secara eksplisit.');
            if (a.value)
                active.forEach(r => (0, scheduler_1.requestStop)(s, r.id, `${d.id} masuk pemeliharaan.`));
            d.maintenance = a.value;
            (0, format_1.activity)(s, 'maintenance', `${d.id}: mode pemeliharaan ${a.value ? 'aktif' : 'selesai'}`, 'Run baru mengevaluasi kondisi ini; penghentian aktif menunggu feedback.', d.id, d.zones[0]);
            message = 'Mode pemeliharaan diperbarui.';
            break;
        }
        case 'deactivate_device': {
            const d = s.devices.find(d => d.id === a.id);
            if (!d)
                throw new Error('Perangkat tidak ditemukan.');
            if (s.runs.some(r => ((0, format_1.isActiveRun)(r.status) || r.status === 'Needs reconciliation') && r.snapshot.requiredDevices.includes(d.id)))
                throw new Error('Periksa atau hentikan run terkait terlebih dahulu.');
            d.active = !d.active;
            (0, format_1.activity)(s, 'device', `${d.id} ${d.active ? 'diaktifkan' : 'dinonaktifkan'}`, 'Pengeluaran historis tidak dihapus dan cakupan periode lama tidak berubah.', d.id, d.zones[0]);
            message = 'Status aset diperbarui tanpa mengubah biaya historis.';
            break;
        }
        case 'validate_zone': {
            const z = s.zones.find(z => z.id === a.id);
            if (!z)
                throw new Error('Zona tidak ditemukan.');
            const ds = s.devices.filter(d => d.zones.includes(z.id) && ['camera', 'sensor'].includes(d.type));
            if (ds.some(d => d.connection !== 'online'))
                throw new Error('Kamera dan sensor harus online sebelum validasi pemasangan.');
            z.validated = true;
            ds.forEach(d => d.calibrated = true);
            (0, format_1.activity)(s, 'device', `Pemasangan Zona ${z.id} divalidasi`, 'Operator mengonfirmasi fixture gambar dan sensor yang dapat digunakan.', z.id, z.id);
            message = `Zona ${z.id} tervalidasi pada demo.`;
            break;
        }
        case 'maintenance': {
            if (!a.title.trim() || !a.deviceId || !a.operator.trim() || !a.date)
                throw new Error('Perangkat, judul, petugas, dan tanggal wajib diisi.');
            if (a.completed && a.date > (0, format_1.localDate)(s.clock))
                throw new Error('Pekerjaan di masa depan belum dapat ditandai selesai.');
            if (a.amount !== null && (!Number.isFinite(a.amount) || a.amount <= 0))
                throw new Error('Biaya opsional harus lebih dari nol; kosongkan bila belum diketahui.');
            const ticketDupe = s.maintenance.find(m => m.submissionKey === a.submissionKey);
            const dupe = s.expenses.find(e => e.submissionKey === a.submissionKey);
            if (!a.id && (dupe || ticketDupe)) {
                id = dupe?.maintenanceId ?? ticketDupe?.id;
                message = 'Catatan ini sudah disimpan; tidak digandakan.';
                break;
            }
            id = a.id ?? (0, format_1.nextId)('MNT', s.maintenance);
            let m = s.maintenance.find(m => m.id === id);
            if (!m) {
                m = { id, submissionKey: a.submissionKey, deviceId: a.deviceId, title: a.title, operator: a.operator, status: a.completed ? 'completed' : 'scheduled', createdAt: (0, format_1.iso)(s.clock), dueAt: a.date, notes: a.notes };
                s.maintenance.push(m);
            }
            else
                Object.assign(m, { title: a.title, operator: a.operator, status: a.completed ? 'completed' : 'scheduled', dueAt: a.date, notes: a.notes });
            if (a.amount !== null && a.paid) {
                if (m.expenseId)
                    throw new Error('Perawatan sudah memiliki catatan pembayaran. Edit pengeluaran tertaut, jangan menggandakan.');
                const expense = { id: (0, format_1.nextId)('EXP', s.expenses), paidAt: (0, format_1.localDate)(s.clock), category: 'Perawatan', amount: a.amount, deviceId: a.deviceId, maintenanceId: id, greenhouseId: s.greenhouse.id, status: 'paid', source: 'operator', note: a.title, submissionKey: a.submissionKey, createdAt: (0, format_1.iso)(s.clock) };
                s.expenses.push(expense);
                m.expenseId = expense.id;
                (0, format_1.activity)(s, 'expense', `${expense.id}: biaya perawatan dicatat`, 'Satu ExpenseRecord yang sama tersedia pada Perangkat dan Biaya.', expense.id);
            }
            const device = s.devices.find(d => d.id === a.deviceId);
            if (device)
                device.nextMaintenance = a.date;
            (0, format_1.activity)(s, 'maintenance', a.title, a.completed ? 'Pekerjaan ditandai selesai oleh operator.' : 'Pekerjaan terjadwal; belum dianggap selesai.', id, device?.zones[0]);
            message = a.amount !== null && a.paid ? 'Perawatan dan satu catatan pembayaran tersimpan.' : 'Perawatan tersimpan tanpa menambahkan pembayaran.';
            break;
        }
        case 'maintenance_complete': {
            const m = s.maintenance.find(m => m.id === a.id);
            if (!m)
                throw new Error('Tugas tidak ditemukan.');
            m.status = 'completed';
            (0, format_1.activity)(s, 'maintenance', `${m.title}: selesai`, 'Diselesaikan oleh operator. Tidak membuat pengeluaran baru.', m.id);
            message = 'Tugas perawatan selesai; tidak ada pembayaran otomatis.';
            break;
        }
        case 'expense': {
            const prior = s.expenses.find(e => e.submissionKey === a.record.submissionKey);
            if (prior && !a.record.id) {
                id = prior.id;
                message = 'Catatan sudah tersimpan; tidak digandakan.';
                break;
            }
            const e = { ...a.record, id: a.record.id ?? (0, format_1.nextId)('EXP', s.expenses), greenhouseId: s.greenhouse.id, source: 'operator', createdAt: a.record.id ? s.expenses.find(e => e.id === a.record.id)?.createdAt ?? (0, format_1.iso)(s.clock) : (0, format_1.iso)(s.clock) };
            const errors = (0, costs_1.validateExpense)(s, e, a.record.id);
            if (errors.length)
                throw new Error(errors.join(' '));
            const duplicate = (0, costs_1.possibleDuplicate)(s, e);
            if (duplicate && !a.allowDuplicate)
                throw new Error(`Kemungkinan duplikat ${duplicate.id}. Periksa atau centang konfirmasi catatan berbeda.`);
            const index = s.expenses.findIndex(x => x.id === e.id);
            if (index >= 0)
                s.expenses[index] = e;
            else
                s.expenses.push(e);
            id = e.id;
            (0, format_1.activity)(s, 'expense', `${e.id} ${index >= 0 ? 'diperbarui' : 'dicatat'}`, e.note, e.id, e.zoneId);
            message = `${e.id} disimpan untuk ${e.paidAt.slice(0, 7)}. Estimasi pemakaian tidak ikut dijumlahkan.`;
            break;
        }
        case 'void_expense': {
            const e = s.expenses.find(e => e.id === a.id);
            if (!e)
                throw new Error('Catatan tidak ditemukan.');
            if (a.reason.trim().length < 5)
                throw new Error('Alasan pembatalan minimal 5 karakter.');
            e.status = 'void';
            e.voidReason = a.reason;
            (0, format_1.activity)(s, 'expense', `${e.id} dibatalkan`, a.reason, e.id, e.zoneId);
            message = 'Catatan dibatalkan, bukan dihapus. Tersedia aksi pulihkan.';
            break;
        }
        case 'undo_void': {
            const e = s.expenses.find(e => e.id === a.id);
            if (e) {
                e.status = 'paid';
                e.voidReason = undefined;
                (0, format_1.activity)(s, 'expense', `${e.id} dipulihkan`, 'Pembatalan di-undo oleh operator.', e.id, e.zoneId);
            }
            message = 'Catatan dipulihkan tanpa membuat duplikat.';
            break;
        }
        case 'baseline':
            if (a.value && (!Number.isInteger(a.value.days) || a.value.days < 1 || a.value.days > 31 || !/^\d{4}-\d{2}$/.test(a.value.period)))
                throw new Error('Periode acuan dan jumlah hari 1–31 harus valid.');
            if (a.value && Object.values(a.value.categories).some(v => !Number.isFinite(v) || v < 0))
                throw new Error('Nilai acuan tidak boleh negatif.');
            s.baseline = a.value;
            (0, format_1.activity)(s, 'expense', a.value ? 'Acuan perbandingan diperbarui' : 'Acuan perbandingan dihapus', 'Pengeluaran tidak berubah.', 'baseline');
            message = a.value ? 'Acuan disimpan dengan label sumber dan cakupan.' : 'Acuan dihapus. Penghematan tidak ditampilkan sebagai 0%.';
            break;
        case 'budget':
            if (!Number.isFinite(a.amount) || a.amount < 0)
                throw new Error('Anggaran tidak boleh negatif.');
            s.budgets = s.budgets.filter(b => b.period !== a.period).concat({ period: a.period, amount: a.amount, greenhouseId: s.greenhouse.id });
            message = 'Anggaran diperbarui. Ini terpisah dari acuan penghematan.';
            break;
        case 'planner':
            if (![2, 6].includes(a.zones))
                throw new Error('Pilih preset 2 atau 6 zona.');
            s.costs.plannerZones = a.zones;
            s.costs.ownedController = a.ownedController;
            message = 'Rencana disimpan tanpa menambah inventaris atau pengeluaran.';
            break;
        case 'recurring_drafts': {
            const period = (0, format_1.localDate)(s.clock).slice(0, 7);
            for (const r of s.recurring) {
                const key = `recurring|${r.id}|${period}`;
                if (s.expenses.some(e => e.submissionKey === key))
                    continue;
                s.expenses.push({ id: (0, format_1.nextId)('EXP', s.expenses), paidAt: period + '-' + String(r.day).padStart(2, '0'), category: r.category, amount: 0, greenhouseId: s.greenhouse.id, source: 'operator', status: 'draft', note: r.title, deviceId: r.deviceId, createdAt: (0, format_1.iso)(s.clock), submissionKey: key });
            }
            message = 'Pengingat biaya rutin dibuat sebagai draft. Isi dan konfirmasi nominal pembayaran.';
            break;
        }
    }
    if (message)
        s.notification = message;
    return { ok: true, message, id };
}
function transition(input, action) { const data = structuredClone(input); const result = applyAction(data, action); return { data, result }; }

},
"domain/costs":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATING_CATEGORIES = void 0;
exports.inPeriod = inPeriod;
exports.scopedValue = scopedValue;
exports.expenseRows = expenseRows;
exports.costSummary = costSummary;
exports.consumedCost = consumedCost;
exports.comparison = comparison;
exports.validateExpense = validateExpense;
exports.validateAllocations = validateAllocations;
exports.possibleDuplicate = possibleDuplicate;
exports.plannerItems = plannerItems;
exports.plannerTotal = plannerTotal;
exports.deviceUsage = deviceUsage;
const format_1 = require("./format");
exports.OPERATING_CATEGORIES = ['Air', 'Nutrisi', 'Listrik', 'Internet', 'Perawatan', 'Tenaga dibayar'];
function inPeriod(date, scope) {
    const d = date.slice(0, 10);
    if (scope.period === 'custom')
        return d >= (scope.from ?? '2026-09-01') && d <= (scope.to ?? '2026-09-30');
    if (scope.period === '3months')
        return d >= '2026-08-01' && d <= '2026-10-31';
    return (0, format_1.periodOf)(date) === scope.period;
}
function scopedValue(s, e, scope) {
    if (scope.category && scope.category !== e.category)
        return null;
    if (!scope.deviceId && !scope.zoneId)
        return { amount: e.amount, source: 'Tercatat' };
    if ((!scope.deviceId || e.deviceId === scope.deviceId) && (!scope.zoneId || e.zoneId === scope.zoneId))
        return { amount: e.amount, source: 'Tercatat' };
    const allocations = s.allocations.filter(a => a.expenseId === e.id && (!scope.deviceId || a.deviceId === scope.deviceId) && (!scope.zoneId || a.zoneId === scope.zoneId));
    return allocations.length ? { amount: allocations.reduce((v, a) => v + a.amount, 0), source: 'Alokasi' } : null;
}
function expenseRows(s, scope, includeVoided = false) {
    return s.expenses.filter(e => (includeVoided || e.status === 'paid') && e.greenhouseId === s.greenhouse.id && inPeriod(e.paidAt, scope)).flatMap(record => { const val = scopedValue(s, record, scope); return val ? [{ record, ...val }] : []; }).sort((a, b) => b.record.paidAt.localeCompare(a.record.paidAt) || b.record.id.localeCompare(a.record.id));
}
function costSummary(s, scope) { const rows = expenseRows(s, scope); const operating = rows.filter(e => e.record.category !== 'Investasi').reduce((a, e) => a + e.amount, 0); const investment = rows.filter(e => e.record.category === 'Investasi').reduce((a, e) => a + e.amount, 0); const budget = scope.deviceId || scope.zoneId || scope.category ? null : s.budgets.find(b => b.period === scope.period)?.amount ?? null; return { rows, operating, investment, total: operating + investment, budget, remaining: budget === null ? null : budget - operating, partial: scope.period === (0, format_1.localDate)(s.clock).slice(0, 7) }; }
function consumedCost(s, scope, category) {
    const matches = s.expenses.filter(e => e.status === 'paid' && e.category === category && e.greenhouseId === s.greenhouse.id);
    let found = false, total = 0;
    for (const record of matches) {
        const scoped = scopedValue(s, record, scope);
        if (!scoped)
            continue;
        if (record.usageSlices) {
            for (const slice of record.usageSlices) {
                if (inPeriod(slice.period + '-01', scope)) {
                    found = true;
                    total += slice.amount * (record.amount ? scoped.amount / record.amount : 0);
                }
            }
        }
        else if (inPeriod(record.paidAt, scope)) {
            found = true;
            total += scoped.amount;
        }
    }
    return found ? total : null;
}
function comparison(s, scope) {
    const values = exports.OPERATING_CATEGORIES.map(c => ({ category: c, value: consumedCost(s, scope, c) }));
    const missing = values.filter(v => v.value === null).map(v => v.category);
    const actual = values.reduce((v, x) => v + (x.value ?? 0), 0);
    const empty = (reason, baseline = null) => ({ canCompare: false, partial: missing.length > 0, reason, baseline, actual, difference: null, percent: null, missing });
    if (!s.baseline)
        return empty('Isi acuan sebelum otomasi untuk memulai perbandingan.');
    if (scope.zoneId || scope.deviceId || scope.category)
        return empty('Acuan 6 zona tidak setara dengan cakupan yang dipilih.');
    if (exports.OPERATING_CATEGORIES.some(c => s.baseline?.categories[c] === undefined))
        return empty('Kategori pada acuan belum lengkap.');
    if (s.baseline.zones.length !== s.zones.length || s.baseline.area !== s.greenhouse.plantedArea || s.baseline.crop !== s.cycle.crop || s.baseline.phase !== s.cycle.phase)
        return empty('Luas, zona, tanaman, atau fase tidak setara dengan acuan.');
    let baseline = exports.OPERATING_CATEGORIES.reduce((a, c) => a + (s.baseline?.categories[c] ?? 0), 0);
    if (scope.period !== s.baseline.period) {
        if (scope.period !== (0, format_1.localDate)(s.clock).slice(0, 7) || !s.baseline.normalizedDaily)
            return empty('Periode belum setara. Normalisasi tidak diterapkan otomatis.', baseline);
        const elapsedDays = Number((0, format_1.localDate)(s.clock).slice(8, 10));
        baseline = baseline / s.baseline.days * elapsedDays;
    }
    if (missing.length)
        return empty('Catatan belum lengkap; nominal yang belum ada tidak dianggap nol.', baseline);
    if (baseline <= 0)
        return empty('Acuan harus lebih dari nol untuk menghitung persentase.', baseline);
    const difference = baseline - actual;
    return { canCompare: true, partial: false, reason: s.baseline.source === 'assumption' ? 'Estimasi terhadap acuan manual · acuan belum divalidasi' : 'Selisih terhadap catatan acuan; bukan bukti sebab-akibat.', baseline, actual, difference, percent: difference / baseline * 100, missing };
}
function validateExpense(s, e, editingId) {
    const errors = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.paidAt) || !Number.isFinite(Date.parse(e.paidAt)))
        errors.push('Pilih tanggal pembayaran yang valid.');
    if (e.paidAt > (0, format_1.localDate)(s.clock) && e.status === 'paid')
        errors.push('Pembayaran tidak boleh di masa depan terhadap waktu demo.');
    if (!Number.isFinite(e.amount) || e.amount <= 0 || e.amount > 1000000000000)
        errors.push('Nominal harus lebih dari 0 dan tidak melebihi Rp1 triliun.');
    if (![...exports.OPERATING_CATEGORIES, 'Investasi'].includes(e.category))
        errors.push('Pilih kategori pengeluaran.');
    if (e.deviceId && !s.devices.some(d => d.id === e.deviceId))
        errors.push('Perangkat tidak ditemukan.');
    if (e.zoneId && !s.zones.some(z => z.id === e.zoneId))
        errors.push('Zona tidak ditemukan.');
    if (e.deviceId && e.zoneId && !s.devices.find(d => d.id === e.deviceId)?.zones.includes(e.zoneId))
        errors.push('Zona dan perangkat tidak cocok.');
    if (e.usageSlices) {
        if (e.usageSlices.some(a => !/^\d{4}-\d{2}$/.test(a.period) || !Number.isFinite(a.amount) || a.amount < 0))
            errors.push('Periode atau nominal pembagian tidak valid.');
        if (Math.abs(e.usageSlices.reduce((a, r) => a + r.amount, 0) - e.amount) > 0.01)
            errors.push('Total pembagian pemakaian harus sama dengan pembayaran.');
        if (new Set(e.usageSlices.map(a => a.period)).size !== e.usageSlices.length)
            errors.push('Periode pemakaian tidak boleh berulang.');
    }
    const allocated = s.allocations.filter(a => a.expenseId === editingId).reduce((a, x) => a + x.amount, 0);
    if (allocated > e.amount)
        errors.push('Nominal lebih kecil dari alokasi yang sudah tercatat. Ubah alokasi terlebih dahulu.');
    return errors;
}
function validateAllocations(record, allocations) {
    const errors = [];
    if (allocations.some(a => a.expenseId !== record.id || !Number.isFinite(a.amount) || a.amount < 0))
        errors.push('Alokasi atau nominal tidak valid.');
    if (allocations.reduce((a, x) => a + x.amount, 0) > record.amount)
        errors.push('Total alokasi tidak boleh melebihi tagihan.');
    return errors;
}
function possibleDuplicate(s, e) { return s.expenses.find(x => x.id !== e.id && x.status !== 'void' && x.category === e.category && x.paidAt === e.paidAt && x.amount === e.amount && x.deviceId === e.deviceId); }
function plannerItems(zones, ownedController) { return [{ id: 'camera', label: 'Kamera monitoring', quantity: zones, unitPrice: 300000, owned: false }, { id: 'sensor', label: 'Sensor suhu/RH', quantity: zones, unitPrice: 200000, owned: false }, { id: 'gateway', label: 'Gateway / controller', quantity: 1, unitPrice: 700000, owned: ownedController }, { id: 'power', label: 'Daya & enclosure', quantity: 1, unitPrice: 300000, owned: false }, { id: 'cable', label: 'Kabel & mounting', quantity: 1, unitPrice: 200000, owned: false }, { id: 'install', label: 'Instalasi', quantity: 1, unitPrice: 300000, owned: false }, { id: 'materials', label: 'Bahan awal', quantity: 1, unitPrice: 100000, owned: false }]; }
function plannerTotal(items, contingency = 10) { const subtotal = items.reduce((a, i) => a + (i.owned ? 0 : i.quantity * (i.unitPrice ?? 0)), 0); return { subtotal, contingency: Math.round(subtotal * contingency / 100), total: subtotal + Math.round(subtotal * contingency / 100), incomplete: items.some(i => !i.owned && i.unitPrice === null) }; }
function deviceUsage(s, id, period) { const rows = s.usages.filter(u => u.deviceId === id && (0, format_1.periodOf)(u.at) === period); return { seconds: rows.reduce((v, r) => v + r.seconds, 0), kwh: rows.reduce((v, r) => v + r.energyKwh, 0), water: rows.reduce((v, r) => v + r.waterLiters, 0), rows }; }

},
"domain/format":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csv = exports.num = exports.makeCsv = exports.scenarioLabels = exports.runLabels = exports.isActiveRun = exports.periodOf = exports.duration = exports.monthLabel = exports.iso = exports.dateLabel = exports.clockTime = exports.number = exports.money = exports.START = exports.TIME_ZONE = void 0;
exports.localDate = localDate;
exports.localTime = localTime;
exports.nextId = nextId;
exports.activity = activity;
exports.safeCsvCell = safeCsvCell;
exports.downloadCsv = downloadCsv;
exports.downloadText = downloadText;
exports.TIME_ZONE = 'Asia/Jakarta';
exports.START = Date.parse('2026-10-13T09:42:00+07:00') / 1000;
const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace(/\u00a0/g, ' ');
exports.money = money;
const number = (value, digits = 0) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(value);
exports.number = number;
const clockTime = (value, seconds = false) => new Intl.DateTimeFormat('id-ID', { timeZone: exports.TIME_ZONE, hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) }).format(new Date(typeof value === 'number' ? value * 1000 : value)).replaceAll('.', ':');
exports.clockTime = clockTime;
const dateLabel = (value, full = false) => new Intl.DateTimeFormat('id-ID', { timeZone: exports.TIME_ZONE, day: 'numeric', month: full ? 'long' : 'short', year: 'numeric' }).format(new Date(typeof value === 'number' ? value * 1000 : value));
exports.dateLabel = dateLabel;
const iso = (seconds) => new Date(seconds * 1000).toISOString();
exports.iso = iso;
function localDate(seconds) { return new Date((seconds + 7 * 3600) * 1000).toISOString().slice(0, 10); }
function localTime(seconds) { return new Date((seconds + 7 * 3600) * 1000).toISOString().slice(11, 16); }
const monthLabel = (period) => {
    if (period === '3months')
        return 'Agustus–Oktober 2026';
    if (period === 'custom')
        return 'Rentang khusus';
    return new Intl.DateTimeFormat('id-ID', { timeZone: exports.TIME_ZONE, month: 'long', year: 'numeric' }).format(new Date(period + '-01T00:00:00+07:00'));
};
exports.monthLabel = monthLabel;
const duration = (seconds) => `${Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0')}:${Math.floor(Math.max(0, seconds) % 60).toString().padStart(2, '0')}`;
exports.duration = duration;
const periodOf = (date) => date.slice(0, 7);
exports.periodOf = periodOf;
const isActiveRun = (status) => ['Checking', 'Queued', 'Running', 'Verifying'].includes(status);
exports.isActiveRun = isActiveRun;
exports.runLabels = { Scheduled: 'Menunggu persetujuan', Checking: 'Memeriksa', Queued: 'Mengantre', Running: 'Berjalan', Verifying: 'Memverifikasi', Completed: 'Selesai', Skipped: 'Dilewati', Blocked: 'Tertahan', Failed: 'Gagal', Stopped: 'Dihentikan', 'Needs reconciliation': 'Perlu pemeriksaan status' };
exports.scenarioLabels = { normal: 'Operasional normal', increasing: 'Tangkapan meningkat', device_offline: 'Pompa offline', sensor_stale: 'Sensor aliran stale', command_failed: 'Acknowledgment gagal', insufficient: 'Data belum cukup', wet_media: 'Media Zona B cukup basah', low_tank: 'Tangki rendah', no_flow: 'Aliran tidak muncul', flow_stuck: 'Aliran tidak berhenti', lost_connection: 'Koneksi terputus saat run', interrupted: 'Simulasi sesi terputus' };
function nextId(prefix, rows) { const values = rows.map(r => Number(r.id.match(/(\d+)$/)?.[1] ?? 0)); return prefix + '-' + String(Math.max(0, ...values) + 1).padStart(3, '0'); }
function activity(s, type, title, detail, objectId, zoneId, actor = 'Budi Santoso') { s.events.unshift({ id: nextId('EVT', s.events), at: (0, exports.iso)(s.clock), type, title, detail, actor, objectId, zoneId }); s.events = s.events.slice(0, 500); }
function safeCsvCell(value) {
    let s = String(value ?? '');
    if (/^\s*[=+\-@]/.test(s) || /^[\t\r]/.test(s))
        s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
}
const makeCsv = (headers, rows) => '\uFEFF' + [headers, ...rows].map(row => row.map(safeCsvCell).join(',')).join('\r\n');
exports.makeCsv = makeCsv;
function downloadCsv(filename, headers, rows) { const url = URL.createObjectURL(new Blob([(0, exports.makeCsv)(headers, rows)], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
exports.num = exports.number;
const csv = (rows) => '\uFEFF' + rows.map(row => row.map(safeCsvCell).join(',')).join('\r\n');
exports.csv = csv;
function downloadText(filename, text) { const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

},
"domain/scheduler":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availableDevices = availableDevices;
exports.nextOccurrence = nextOccurrence;
exports.nextScheduled = nextScheduled;
exports.sensorValue = sensorValue;
exports.validateRoutine = validateRoutine;
exports.guardReason = guardReason;
exports.createRun = createRun;
exports.requestStop = requestStop;
exports.advanceInPlace = advanceInPlace;
exports.nextEventTime = nextEventTime;
exports.setScenario = setScenario;
exports.reconcile = reconcile;
exports.checkRoutineGuards = checkRoutineGuards;
const format_1 = require("./format");
function availableDevices(s) { return s.devices.filter(d => d.active && (s.profile === 'automation' || ['camera', 'sensor'].includes(d.type))); }
function nextOccurrence(r, now, includeCurrent = false) {
    if (r.trigger.type !== 'schedule')
        return null;
    const schedule = r.trigger.schedule;
    const midnight = Date.parse((0, format_1.localDate)(now) + 'T00:00:00+07:00') / 1000;
    for (let offset = 0; offset < 370; offset++) {
        const day = midnight + offset * 86400, date = (0, format_1.localDate)(day), weekday = new Date((day + 7 * 3600) * 1000).getUTCDay();
        if (date < schedule.validFrom || !schedule.weekdays.includes(weekday))
            continue;
        if (schedule.validUntil && date > schedule.validUntil)
            return null;
        for (const time of [...schedule.times].sort()) {
            const [hours, minutes] = time.split(':').map(Number), slot = day + hours * 3600 + minutes * 60;
            if (slot > now || (includeCurrent && slot === now))
                return slot;
        }
    }
    return null;
}
function nextScheduled(s) {
    return s.routines.filter(r => r.status === 'Active').map(r => ({ routine: r, at: nextOccurrence(r, s.clock) })).filter((r) => r.at !== null).sort((a, b) => a.at - b.at);
}
function sensorValue(s, id) {
    const d = availableDevices(s).find(x => x.id === id);
    if (!d || d.connection !== 'online' || !d.calibrated)
        return null;
    if (s.scenario === 'insufficient' && (id === 'MEDIA-A' || id === 'TH-B-01'))
        return null;
    if (id === 'MEDIA-A')
        return s.scenario === 'increasing' ? 26 : 38;
    if (id === 'MEDIA-B')
        return s.scenario === 'wet_media' ? 78 : 44;
    if (id === 'LEVEL-01')
        return s.scenario === 'low_tank' ? 8 : 72;
    if (id === 'NUTRI-LEVEL-01')
        return 68;
    if (id === 'EC-01')
        return 1.8;
    if (id === 'PH-01')
        return 6.1;
    if (id === 'FLOW-01') {
        if (s.scenario === 'no_flow')
            return 0;
        const active = s.runs.some(r => (r.status === 'Running' || r.status === 'Verifying') && r.resource === 'PUMP-01' && ['water', 'dose', 'flush', 'verify_flow'].includes(r.steps[r.stepIndex]?.action));
        return active || s.scenario === 'flow_stuck' ? 16 : 0;
    }
    if (id.startsWith('TH-')) {
        const z = s.zones.find(z => z.id === id.slice(3, 4));
        if (!z)
            return null;
        return s.scenario === 'increasing' && id === 'TH-A-01' ? 30.2 : z.temperature;
    }
    return null;
}
function validateRoutine(s, r) {
    const e = [];
    const v = r.version;
    if (!r.name.trim())
        e.push('Nama rutinitas wajib diisi.');
    if (!v.zones.length)
        e.push('Pilih minimal satu zona.');
    if (v.steps.length === 0)
        e.push('Minimal satu langkah diperlukan.');
    if (v.steps.some(x => x.action === 'task') && r.policy !== 'task')
        e.push('Langkah tugas manusia harus memakai kebijakan Buat tugas, bukan dianggap selesai otomatis.');
    if (v.steps.some(x => !Number.isFinite(x.duration) || x.duration < 0))
        e.push('Durasi langkah tidak valid.');
    if (v.maxDuration < v.steps.reduce((a, x) => a + x.duration, 0))
        e.push('Batas maksimum harus mencakup seluruh durasi langkah.');
    if (v.maxCyclesPerDay < 1 || v.maxCyclesPerDay > 24 || !Number.isInteger(v.maxCyclesPerDay))
        e.push('Batas siklus harian harus 1–24.');
    if (v.maxWaterPerDay < 0 || v.maxNutritionPerDay < 0 || v.cooldownSeconds < 0 || v.queueTimeout <= 0)
        e.push('Batas pemakaian dan waktu tidak valid.');
    const expected = v.steps.filter(x => ['water', 'dose', 'flush'].includes(x.action)).reduce((a, x) => a + x.duration * v.flowLpm / 60, 0);
    if (v.maxWaterPerDay < expected && v.resource === 'PUMP-01')
        e.push('Batas air harian lebih kecil daripada target satu run.');
    if (v.nutrientUnits > v.maxNutritionPerDay)
        e.push('Target nutrisi melebihi batas harian.');
    if (r.trigger.type === 'schedule') {
        if (r.trigger.schedule.timeZone !== 'Asia/Jakarta' || !r.trigger.schedule.weekdays.length || r.trigger.schedule.times.some(t => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
            e.push('Jadwal WIB tidak valid.');
    }
    if (r.trigger.type === 'sensor') {
        const t = r.trigger;
        if (!v.requiredDevices.includes(t.deviceId))
            e.push('Sensor pemicu harus menjadi perangkat wajib.');
        if ((t.direction === 'below' && t.recover <= t.start) || (t.direction === 'above' && t.recover >= t.start))
            e.push('Batas mulai dan pulih harus membentuk hysteresis.');
        if (t.debounceSeconds < 1)
            e.push('Jendela evaluasi minimal 1 detik.');
    }
    if (r.trigger.type === 'after_run') {
        let id = r.trigger.routineId;
        const visited = new Set([r.id]);
        while (id) {
            if (visited.has(id)) {
                e.push('Rangkaian pemicu tidak boleh membentuk siklus.');
                break;
            }
            visited.add(id);
            const parent = s.routines.find(x => x.id === id);
            if (!parent) {
                e.push('Rutinitas sumber tidak ditemukan.');
                break;
            }
            id = parent.trigger.type === 'after_run' ? parent.trigger.routineId : '';
        }
    }
    for (const id of v.requiredDevices) {
        if (!s.devices.find(d => d.id === id))
            e.push(`${id} belum terpasang.`);
    }
    for (const z of v.zones) {
        if ((r.kind === 'irrigation' || r.kind === 'fertigation') && !s.devices.find(d => d.id === `VALVE-${z}`))
            e.push(`Valve Zona ${z} belum tersedia.`);
        if (r.kind === 'fertigation' && z !== 'A')
            e.push('Perangkat dosing demo hanya terpasang di Zona A.');
    }
    if (r.kind === 'fertigation') {
        const p = s.nutrientProfiles.find(p => p.id === v.nutrientProfileId);
        if (!p?.reviewed || p.status !== 'active')
            e.push('Profil nutrisi harus ditinjau dan aktif.');
        if (!v.requiredDevices.includes('FLOW-01'))
            e.push('Pemberian nutrisi memerlukan sensor aliran.');
    }
    return e;
}
function todayUsage(s, run) { const day = (0, format_1.localDate)(s.clock); return s.usages.filter(u => (0, format_1.localDate)(Date.parse(u.at) / 1000) === day && (run.resource === 'PUMP-01' ? u.deviceId === 'PUMP-01' : u.deviceId === run.snapshot.requiredDevices.find(id => id === 'FAN-01'))); }
function guardReason(s, run, during = false) {
    if (!run.snapshot.reviewed)
        return 'Versi rutinitas belum ditinjau.';
    const devices = availableDevices(s);
    for (const id of run.snapshot.requiredDevices) {
        const d = devices.find(d => d.id === id);
        if (!d)
            return `${id} belum terpasang pada profil ${s.profile === 'monitoring' ? 'Monitoring saja' : 'ini'}.`;
        if (!d.active)
            return `${id} dinonaktifkan.`;
        if (d.maintenance)
            return `${id} dalam pemeliharaan.`;
        if (d.connection !== 'online')
            return `${id} ${d.connection === 'stale' ? 'datanya kedaluwarsa' : 'offline'}; kondisi tidak dapat dievaluasi.`;
        if (!d.calibrated)
            return `${id} belum dikalibrasi.`;
    }
    if (run.resource === 'PUMP-01') {
        const level = sensorValue(s, 'LEVEL-01');
        if (level === null)
            return 'LEVEL-01 tidak dapat dievaluasi.';
        if (level < 20)
            return 'Level tangki air di bawah batas demo 20%.';
        if (run.kind === 'fertigation' && (sensorValue(s, 'NUTRI-LEVEL-01') ?? 0) < 20)
            return 'Reservoir nutrisi tidak mencukupi.';
        if (run.snapshot.requiredDevices.includes('MEDIA-A') && sensorValue(s, 'MEDIA-A') === null)
            return 'MEDIA-A tidak dapat dievaluasi; tidak ada fallback terkonfigurasi.';
    }
    if (!during) {
        const counts = s.runs.filter(r => r.id !== run.id && r.routineId === run.routineId && r.startedAt !== undefined && (0, format_1.localDate)(r.startedAt) === (0, format_1.localDate)(s.clock));
        if (counts.length >= run.snapshot.maxCyclesPerDay)
            return 'Batas siklus harian tercapai; run manual dihitung bersama jadwal.';
        const last = counts.reduce((a, r) => Math.max(a, r.finishedAt ?? r.startedAt ?? 0), 0);
        if (last && s.clock - last < run.snapshot.cooldownSeconds)
            return `Jeda antarsiklus belum terpenuhi (${run.snapshot.cooldownSeconds} detik).`;
    }
    const usage = todayUsage(s, run);
    if (run.resource === 'PUMP-01' && usage.reduce((a, u) => a + u.waterLiters, 0) >= run.snapshot.maxWaterPerDay)
        return 'Batas penggunaan air harian resource pompa tercapai.';
    if (run.kind === 'fertigation' && usage.reduce((a, u) => a + u.nutrientUnits, 0) >= run.snapshot.maxNutritionPerDay)
        return 'Batas nutrisi harian tercapai.';
    return null;
}
function createRun(s, r, source, key, planId) {
    if (s.seenTriggers.includes(key))
        return null;
    s.seenTriggers.push(key);
    s.seenTriggers = s.seenTriggers.slice(-5000);
    const run = { id: (0, format_1.nextId)('RUN', s.runs), routineId: r.id, routineName: r.name, kind: r.kind, routineVersionId: r.version.id, snapshot: structuredClone(r.version), triggerKey: key, source, policy: r.policy, planId, status: r.policy === 'approval' ? 'Scheduled' : 'Checking', createdAt: s.clock, steps: r.version.steps.map(x => ({ ...structuredClone(x), status: 'pending' })), stepIndex: 0, resource: r.version.resource, reason: r.policy === 'approval' ? 'Menunggu persetujuan operator.' : 'Memeriksa syarat operasi.', expiresAt: s.clock + r.version.queueTimeout };
    s.runs.unshift(run);
    (0, format_1.activity)(s, 'run', `${r.name} dijadwalkan`, `${run.id} · versi ${r.version.number} · ${source === 'manual' ? 'dijalankan sekali' : source === 'sensor' ? 'episode sensor' : 'slot WIB'} · ${run.reason}`, run.id, r.version.zones[0], 'Scheduler demo');
    return run;
}
function finish(s, run, status, reason) {
    run.status = status;
    run.reason = reason;
    run.finishedAt = s.clock;
    if (status === 'Needs reconciliation') {
        for (const lock of s.locks.filter(l => l.runId === run.id))
            lock.state = 'unknown';
        for (const u of s.usages.filter(u => u.runId === run.id))
            u.deliveryConfirmed = false;
    }
    else
        s.locks = s.locks.filter(l => l.runId !== run.id);
    if (run.planId) {
        const plan = s.plans.find(p => p.id === run.planId);
        if (plan)
            plan.status = status === 'Completed' ? 'monitoring' : status === 'Stopped' ? 'monitoring' : 'approved';
    }
    (0, format_1.activity)(s, 'run', `${run.routineName}: ${status === 'Completed' ? 'selesai' : status === 'Skipped' ? 'dilewati' : status === 'Needs reconciliation' ? 'status perlu diperiksa' : status === 'Stopped' ? 'dihentikan' : status === 'Blocked' ? 'tertahan' : 'gagal'}`, reason, run.id, run.currentZone, 'Simulator demo');
}
function queueCommand(s, run, step, kind) { const id = (0, format_1.nextId)('CMD', s.commands); s.commands.push({ id, runId: run.id, stepId: step.id, deviceIds: step.deviceIds, kind, status: 'queued', queuedAt: s.clock }); (0, format_1.activity)(s, 'run', `${id} · perintah ${kind === 'stop' ? 'stop' : 'mulai'} dikirim`, `${step.label}; menunggu respons perangkat simulasi.`, run.id, step.zoneId, 'Simulator demo'); }
function requestStop(s, runId, reason = 'Dihentikan oleh operator.', asFailure = false) {
    const run = s.runs.find(r => r.id === runId);
    if (!run || !(0, format_1.isActiveRun)(run.status) || run.stopRequestedAt !== undefined)
        return;
    if (run.status === 'Queued' || !run.startedAt) {
        finish(s, run, 'Stopped', reason);
        return;
    }
    run.stopRequestedAt = s.clock;
    run.stopResult = asFailure ? 'fail' : 'stop';
    run.reason = `Permintaan stop: ${reason} Menunggu konfirmasi.`;
    queueCommand(s, run, { ...run.steps[run.stepIndex], id: 'operator-stop', label: 'Penghentian simulator', deviceIds: run.snapshot.requiredDevices }, 'stop');
    (0, format_1.activity)(s, 'run', 'Permintaan penghentian', run.reason, run.id, run.currentZone);
}
function startStep(s, run) {
    while (run.stepIndex < run.steps.length) {
        const step = run.steps[run.stepIndex];
        if (step.zoneId && step.action === 'start' && run.kind === 'irrigation' && run.snapshot.requiredDevices.includes(`MEDIA-${step.zoneId}`)) {
            const media = sensorValue(s, `MEDIA-${step.zoneId}`);
            if (media === null) {
                requestStop(s, run.id, `MEDIA-${step.zoneId} tidak dapat dievaluasi.`, true);
                return;
            }
            if (media >= 65) {
                const zone = step.zoneId;
                for (const item of run.steps.filter(x => x.zoneId === zone && x.status === 'pending')) {
                    item.status = 'skipped';
                    item.reason = 'Media masih cukup basah (ambang demo).';
                    item.finishedAt = s.clock;
                }
                (0, format_1.activity)(s, 'run', `Zona ${zone} dilewati`, 'Media masih cukup basah. Ini bukan kegagalan.', run.id, zone, 'Scheduler demo');
                while (run.steps[run.stepIndex]?.status === 'skipped')
                    run.stepIndex++;
                continue;
            }
        }
        step.status = 'running';
        step.startedAt = s.clock;
        run.currentZone = step.zoneId;
        run.status = step.action === 'verify' ? 'Verifying' : 'Running';
        run.reason = step.label;
        if (['start', 'fan', 'dose', 'test', 'stop'].includes(step.action))
            queueCommand(s, run, step, step.action === 'stop' ? 'stop' : step.action === 'test' ? 'test' : 'start');
        (0, format_1.activity)(s, 'run', step.label, `${run.id} · langkah ${run.stepIndex + 1}/${run.steps.length}`, run.id, step.zoneId, 'Simulator demo');
        return;
    }
    const delivered = run.steps.some(x => ['water', 'dose', 'fan', 'test'].includes(x.action) && x.status === 'completed');
    finish(s, run, delivered ? 'Completed' : 'Skipped', delivered ? 'Seluruh langkah dan feedback penghentian selesai. Efektivitas biologis belum dievaluasi.' : 'Seluruh zona dilewati sesuai kondisi media.');
}
function addUsage(s, run, step) {
    const deviceId = run.resource === 'PUMP-01' ? 'PUMP-01' : run.resource === 'FAN-01' ? 'FAN-01' : 'CTRL-01';
    let u = s.usages.find(u => u.runId === run.id && u.deviceId === deviceId);
    if (!u) {
        u = { id: (0, format_1.nextId)('USE', s.usages), runId: run.id, routineVersionId: run.routineVersionId, deviceId, at: (0, format_1.iso)(s.clock), seconds: 0, waterLiters: 0, nutrientUnits: 0, energyKwh: 0, waterSource: run.snapshot.requiredDevices.includes('FLOW-01') ? 'measured_demo' : 'estimate', deliveryConfirmed: true };
        s.usages.push(u);
    }
    u.seconds++;
    u.energyKwh += (s.devices.find(d => d.id === deviceId)?.watts ?? 0) / 3600000;
    if (run.resource === 'PUMP-01')
        u.waterLiters += run.snapshot.flowLpm / 60;
    if (step.action === 'dose')
        u.nutrientUnits += run.snapshot.nutrientUnits / Math.max(1, step.duration);
}
function tickRun(s, run) {
    if (!(0, format_1.isActiveRun)(run.status))
        return;
    if (run.stopRequestedAt !== undefined) {
        const elapsed = s.clock - run.stopRequestedAt, stop = s.commands.find(c => c.runId === run.id && c.stepId === 'operator-stop');
        if (elapsed < 3)
            return;
        if (['flow_stuck', 'lost_connection', 'command_failed'].includes(s.scenario)) {
            if (stop) {
                stop.status = 'timed_out';
                stop.reason = 'Feedback penghentian tidak diterima.';
            }
            finish(s, run, 'Needs reconciliation', 'Penghentian belum terkonfirmasi. Resource tetap terkunci; jangan mengulangi aktuasi.');
            return;
        }
        if (stop) {
            stop.status = 'completed';
            stop.acknowledgedAt = s.clock;
            stop.finishedAt = s.clock;
        }
        for (const command of s.commands.filter(c => c.runId === run.id && ['queued', 'acknowledged', 'running'].includes(c.status))) {
            command.status = 'stopped';
            command.finishedAt = s.clock;
        }
        const step = run.steps[run.stepIndex];
        if (step)
            step.status = 'stopped';
        finish(s, run, run.stopResult === 'fail' ? 'Failed' : 'Stopped', 'Stop simulator terkonfirmasi. ' + run.reason.replace(' Menunggu konfirmasi.', ''));
        return;
    }
    if (run.status === 'Checking' || run.status === 'Queued') {
        if (s.clock > run.expiresAt) {
            finish(s, run, 'Blocked', 'Batas waktu antrean terlampaui; jadwal tidak dijalankan terlambat tanpa batas.');
            return;
        }
        const reason = guardReason(s, run);
        if (reason) {
            finish(s, run, 'Blocked', reason);
            return;
        }
        const lock = run.resource ? s.locks.find(l => l.id === run.resource && l.runId !== run.id) : null;
        if (lock) {
            if (run.status !== 'Queued')
                (0, format_1.activity)(s, 'run', `${run.routineName} mengantre`, `${run.resource} sedang dipakai ${lock.runId}.`, run.id, run.snapshot.zones[0], 'Scheduler demo');
            run.status = 'Queued';
            run.reason = lock.state === 'unknown' ? `${run.resource}: status belum terkonfirmasi (${lock.runId}).` : `${run.resource} sedang dipakai ${lock.runId}; batas antrean ${Math.max(0, Math.round(run.expiresAt - s.clock))} detik.`;
            return;
        }
        if (run.policy === 'task') {
            const id = (0, format_1.nextId)('MNT', s.maintenance);
            s.maintenance.push({ id, deviceId: run.snapshot.steps[0]?.deviceIds[0] ?? 'PUMP-01', title: run.routineName, operator: 'Budi Santoso', status: 'open', createdAt: (0, format_1.iso)(s.clock), dueAt: (0, format_1.localDate)(s.clock), notes: `Dibuat otomatis dari ${run.id}; pekerjaan menunggu petugas.` });
            run.steps.forEach(step => { step.status = 'completed'; step.finishedAt = s.clock; });
            finish(s, run, 'Completed', `Tugas ${id} dibuat. Pekerjaan fisik belum selesai.`);
            return;
        }
        if (run.resource)
            s.locks.push({ id: run.resource, runId: run.id, state: 'locked', acquiredAt: s.clock });
        run.startedAt = s.clock;
        startStep(s, run);
        return;
    }
    const reason = guardReason(s, run, true);
    if (reason) {
        requestStop(s, run.id, reason, true);
        return;
    }
    if (s.clock - (run.startedAt ?? s.clock) > run.snapshot.maxDuration) {
        requestStop(s, run.id, 'Batas maksimum durasi tercapai.', true);
        return;
    }
    const step = run.steps[run.stepIndex];
    if (!step)
        return;
    const elapsed = s.clock - (step.startedAt ?? s.clock);
    const command = s.commands.find(c => c.runId === run.id && c.stepId === step.id);
    if (command && command.status === 'queued' && elapsed >= 1) {
        if (s.scenario === 'command_failed') {
            if (elapsed >= 5) {
                command.status = 'timed_out';
                command.reason = 'Acknowledgment tidak diterima.';
                step.status = 'failed';
                finish(s, run, 'Needs reconciliation', 'Perintah tidak diakui. Hasil aktuasi belum pasti; tidak diulang otomatis.');
            }
            return;
        }
        command.status = 'acknowledged';
        command.acknowledgedAt = s.clock;
        (0, format_1.activity)(s, 'run', `${command.id} diakui perangkat`, `${step.label}; respons simulasi diterima.`, run.id, step.zoneId, 'Simulator demo');
    }
    if (command && command.status === 'acknowledged' && elapsed >= 2)
        command.status = 'running';
    if (s.scenario === 'lost_connection' && elapsed >= 6 && ['water', 'dose', 'test', 'fan'].includes(step.action)) {
        requestStop(s, run.id, 'Koneksi terputus saat aktuasi; status perangkat belum pasti.', true);
        return;
    }
    if (['water', 'dose', 'flush', 'verify_flow'].includes(step.action) && run.resource === 'PUMP-01' && (sensorValue(s, 'FLOW-01') ?? 0) <= 0) {
        step.reason = 'Aliran tidak terkonfirmasi.';
        requestStop(s, run.id, 'FLOW-01 tidak mendeteksi aliran; dosing tidak dilanjutkan.', true);
        return;
    }
    if (['water', 'dose', 'flush', 'fan', 'test'].includes(step.action) && elapsed > 0 && elapsed <= step.duration)
        addUsage(s, run, step);
    if (elapsed < step.duration)
        return;
    if ((step.action === 'stop' || step.action === 'verify') && s.scenario === 'flow_stuck' && run.resource === 'PUMP-01') {
        step.status = 'failed';
        if (command)
            command.status = 'timed_out';
        finish(s, run, 'Needs reconciliation', 'FLOW-01 tetap menunjukkan aliran setelah stop. Periksa jalur secara manual dalam demo.');
        return;
    }
    step.status = 'completed';
    step.finishedAt = s.clock;
    if (command) {
        command.status = 'completed';
        command.finishedAt = s.clock;
    }
    run.stepIndex++;
    startStep(s, run);
}
function scheduleTick(s) {
    for (const r of s.routines) {
        if (r.trigger.type === 'schedule') {
            if (s.clock % 60 !== 0)
                continue;
            const slot = nextOccurrence(r, s.clock, true);
            if (slot !== s.clock)
                continue;
            const slotKey = (0, format_1.localDate)(s.clock) + 'T' + (0, format_1.localTime)(s.clock), key = r.version.id + '|' + slotKey + '|' + r.version.zones.join(',');
            if (s.seenTriggers.includes(key))
                continue;
            if (r.status !== 'Active' || r.skippedSlots.includes(slotKey)) {
                s.seenTriggers.push(key);
                (0, format_1.activity)(s, 'routine', `${r.name}: jadwal dilewati`, r.skippedSlots.includes(slotKey) ? 'Slot ini dilewati sekali. Jadwal berikutnya tidak berubah.' : 'Rutinitas tidak aktif; tidak ada backlog yang dijalankan saat dilanjutkan.', r.id, r.version.zones[0], 'Scheduler demo');
                continue;
            }
            createRun(s, r, 'schedule', key);
        }
        else if (r.trigger.type === 'sensor' && r.status === 'Active') {
            const t = r.trigger, time = (0, format_1.localTime)(s.clock);
            if (time < t.windowStart || time > t.windowEnd)
                continue;
            const value = sensorValue(s, t.deviceId);
            let ep = s.episodes[r.id];
            if (!ep)
                ep = s.episodes[r.id] = { activeSince: null, latched: false, sequence: 0 };
            if (value === null) {
                ep.activeSince = null;
                continue;
            }
            const breach = t.direction === 'below' ? value < t.start : value > t.start, recovered = t.direction === 'below' ? value >= t.recover : value <= t.recover;
            if (recovered) {
                ep.activeSince = null;
                ep.latched = false;
                continue;
            }
            if (!breach || ep.latched)
                continue;
            if (ep.activeSince === null)
                ep.activeSince = s.clock;
            if (s.clock - ep.activeSince >= t.debounceSeconds) {
                ep.latched = true;
                ep.sequence++;
                createRun(s, r, 'sensor', r.version.id + '|episode-' + ep.sequence + '|' + (0, format_1.localDate)(s.clock));
            }
        }
        else if (r.trigger.type === 'after_run' && r.status === 'Active') {
            const parentId = r.trigger.routineId;
            for (const parent of s.runs.filter(x => x.routineId === parentId && x.status === 'Completed' && x.finishedAt === s.clock - 1))
                createRun(s, r, 'after_run', r.version.id + '|after|' + parent.id);
        }
    }
}
/** Every crossed second is processed. No wall-clock catch-up, random telemetry, or external calls. */
function advanceInPlace(s, seconds) {
    if (!Number.isFinite(seconds) || seconds < 0)
        throw new Error('Durasi clock tidak valid.');
    const count = Math.min(Math.floor(seconds), 86400);
    for (let i = 0; i < count; i++) {
        s.clock++;
        scheduleTick(s);
        const ordered = [...s.runs].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
        for (const run of ordered)
            tickRun(s, run);
    }
    s.runs = s.runs.filter(r => (0, format_1.isActiveRun)(r.status) || r.status === 'Needs reconciliation').concat(s.runs.filter(r => !(0, format_1.isActiveRun)(r.status) && r.status !== 'Needs reconciliation').slice(0, 180)).sort((a, b) => b.createdAt - a.createdAt);
    return s;
}
function nextEventTime(s) {
    const possibilities = nextScheduled(s).map(x => x.at);
    for (const r of s.runs.filter(r => (0, format_1.isActiveRun)(r.status))) {
        if (r.stopRequestedAt !== undefined)
            possibilities.push(r.stopRequestedAt + 3);
        else if (r.status === 'Checking' || r.status === 'Queued')
            possibilities.push(s.clock + 3);
        else {
            const step = r.steps[r.stepIndex];
            if (step?.startedAt !== undefined)
                possibilities.push(step.startedAt + Math.max(1, step.duration));
        }
    }
    return Math.max(s.clock + 1, Math.min(...possibilities.filter(x => x > s.clock), s.clock + 86400));
}
function setScenario(s, scenario) {
    s.scenario = scenario;
    for (const id of ['PUMP-01', 'CTRL-01', 'FLOW-01']) {
        const d = s.devices.find(d => d.id === id);
        if (d)
            d.connection = scenario === 'device_offline' && (id === 'PUMP-01' || id === 'CTRL-01') ? 'offline' : scenario === 'sensor_stale' && id === 'FLOW-01' ? 'stale' : 'online';
    }
    if (scenario === 'interrupted') {
        s.playing = false;
        for (const r of s.runs.filter(r => (0, format_1.isActiveRun)(r.status))) {
            r.status = 'Needs reconciliation';
            r.reason = 'Sesi terputus. Konfirmasi status simulator sebelum melanjutkan.';
            for (const l of s.locks.filter(l => l.runId === r.id))
                l.state = 'unknown';
        }
    }
    (0, format_1.activity)(s, 'system', 'Skenario demo diubah', scenario, 'demo');
}
function reconcile(s, id, notes) {
    const r = s.runs.find(r => r.id === id);
    if (!r || r.status !== 'Needs reconciliation')
        return;
    if (notes.trim().length < 8)
        throw new Error('Catat hasil pemeriksaan minimal 8 karakter.');
    for (const c of s.commands.filter(c => c.runId === r.id && c.status !== 'completed')) {
        c.status = 'stopped';
        c.finishedAt = s.clock;
        c.reason = 'Status penghentian diperiksa oleh operator demo.';
    }
    finish(s, r, 'Stopped', 'Operator mengonfirmasi simulator sudah berhenti. ' + notes);
    s.playing = false;
}
/** Evaluate guards without registering a run or issuing commands. */
function checkRoutineGuards(s, r) { const run = { id: 'PREVIEW', routineId: r.id, routineName: r.name, kind: r.kind, routineVersionId: r.version.id, snapshot: r.version, triggerKey: 'preview', source: 'manual', policy: r.policy, status: 'Checking', createdAt: s.clock, steps: r.version.steps.map(st => ({ ...st, status: 'pending' })), stepIndex: 0, resource: r.version.resource, reason: 'Dry run', expiresAt: s.clock + r.version.queueTimeout }; return guardReason(s, run); }

},
"domain/selectors":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kpis = kpis;
exports.zoneStatus = zoneStatus;
exports.todayUsage = todayUsage;
exports.trendData = trendData;
exports.deviceActivity = deviceActivity;
const format_1 = require("./format");
const scheduler_1 = require("./scheduler");
function kpis(s) { const observation = (0, scheduler_1.availableDevices)(s).filter(d => ['camera', 'sensor'].includes(d.type)); const validated = s.zones.filter(z => z.validated && observation.filter(d => d.zones.includes(z.id)).every(d => d.connection === 'online' && d.calibrated)); return { inspection: s.cases.filter(c => c.status === 'inspection').length, monitoring: s.cases.filter(c => c.status === 'monitoring').length, coverage: validated.length, observationsOnline: observation.filter(d => d.connection === 'online').length, observationsTotal: observation.length, closed: s.cases.filter(c => c.status === 'closed' && c.closedAt && Date.parse(c.closedAt) / 1000 >= s.clock - 7 * 86400 && Date.parse(c.closedAt) / 1000 <= s.clock).length, devices: (0, scheduler_1.availableDevices)(s).length, online: (0, scheduler_1.availableDevices)(s).filter(d => d.connection === 'online').length, routines: s.routines.filter(r => r.status === 'Active').length, active: s.runs.filter(r => (0, format_1.isActiveRun)(r.status)), exceptions: s.runs.filter(r => ['Blocked', 'Failed', 'Needs reconciliation'].includes(r.status)), next: (0, scheduler_1.nextScheduled)(s)[0] ?? null }; }
function zoneStatus(s, z) {
    const zone = s.zones.find(x => x.id === z);
    const camera = s.devices.find(d => d.type === 'camera' && d.zones.includes(z));
    if (!camera?.active || camera.connection !== 'online')
        return { label: 'Kamera offline', tone: 'amber' };
    if (!zone?.validated)
        return { label: 'Belum divalidasi', tone: 'gray' };
    if (s.cases.some(c => c.zoneId === z && c.status === 'inspection'))
        return { label: 'Perlu inspeksi', tone: 'amber' };
    if (s.cases.some(c => c.zoneId === z && c.status === 'monitoring'))
        return { label: 'Dipantau', tone: 'blue' };
    return { label: 'Terpantau', tone: 'green' };
}
function todayUsage(s) { const rows = s.usages.filter(u => (0, format_1.localDate)(Date.parse(u.at) / 1000) === (0, format_1.localDate)(s.clock)); return { water: rows.reduce((a, r) => a + r.waterLiters, 0), nutrition: rows.reduce((a, r) => a + r.nutrientUnits, 0), energy: rows.reduce((a, r) => a + r.energyKwh, 0), measured: rows.some(r => r.waterSource === 'measured_demo'), uncertain: rows.some(r => !r.deliveryConfirmed) }; }
function trendData(s) {
    return [8, 9, 10, 11, 12, 13].map(day => {
        const row = { day: `${day} Okt` };
        for (const z of s.zones) {
            const value = s.observations.find(o => o.zoneId === z.id && o.at.slice(8, 10) === String(day).padStart(2, '0'))?.newCaptures ?? null;
            row[z.id] = s.scenario === 'insufficient' && z.id === 'B' && day === 13 ? null : s.scenario === 'increasing' && z.id === 'B' && day === 13 ? 34 : value;
        }
        return row;
    });
}
function deviceActivity(s, id) {
    const uncertain = s.runs.find(r => r.status === 'Needs reconciliation' && r.snapshot.requiredDevices.includes(id));
    if (uncertain)
        return { label: 'Belum terkonfirmasi', runId: uncertain.id, tone: 'red' };
    const run = s.runs.find(r => (0, format_1.isActiveRun)(r.status) && r.steps[r.stepIndex]?.deviceIds.includes(id));
    return run ? { label: run.status === 'Queued' ? 'Mengantre' : 'Digunakan', runId: run.id, tone: 'green' } : { label: 'Siaga', runId: null, tone: 'gray' };
}

},
"domain/storage":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hydrate = hydrate;
const fixtures_1 = require("../data/fixtures");
const format_1 = require("./format");
function isValid(data) {
    if (!data || typeof data !== 'object')
        return false;
    const d = data;
    return typeof d.playing === 'boolean' && typeof d.costs === 'object' && Number.isFinite(d.costs?.electricityPerKwh) && Number.isFinite(d.costs?.plannerZones) && !!d.episodes && ['automation', 'monitoring'].includes(d.profile ?? '') && d.schemaVersion === 3 && typeof d.clock === 'number' && Number.isFinite(d.clock) && !!d.greenhouse?.id && !!d.cycle?.id && Array.isArray(d.zones) && d.zones.length === 6 && d.zones.every(z => typeof z.id === 'string') && Array.isArray(d.devices) && d.devices.every(x => typeof x.id === 'string' && Array.isArray(x.capabilities) && Array.isArray(x.zones)) && Array.isArray(d.routines) && d.routines.every(r => !!r.trigger?.type && !!r.version?.id && Array.isArray(r.version.steps) && Array.isArray(r.version.requiredDevices)) && Array.isArray(d.runs) && d.runs.every(r => Array.isArray(r.steps) && !!r.snapshot?.id) && Array.isArray(d.expenses) && d.expenses.every(e => Number.isFinite(e.amount) && typeof e.paidAt === 'string') && ['commands', 'locks', 'usages', 'maintenance', 'events', 'allocations', 'budgets', 'plans', 'cases', 'inspections', 'observations', 'nutrientProfiles', 'recurring', 'overrides', 'seenTriggers'].every(k => Array.isArray(d[k]));
}
function hydrate(serialized) {
    const base = (0, fixtures_1.createFixture)();
    if (!serialized)
        return base;
    try {
        const parsed = JSON.parse(serialized);
        if (!isValid(parsed))
            throw new Error('Invalid schema');
        const s = parsed;
        s.playing = false;
        s.notification = null;
        let interrupted = false;
        for (const r of s.runs.filter(r => (0, format_1.isActiveRun)(r.status))) {
            r.status = 'Needs reconciliation';
            r.reason = 'Sesi terputus atau halaman dimuat ulang. Penghentian belum terkonfirmasi; tidak melanjutkan otomatis.';
            for (const l of s.locks.filter(l => l.runId === r.id))
                l.state = 'unknown';
            for (const u of s.usages.filter(u => u.runId === r.id))
                u.deliveryConfirmed = false;
            interrupted = true;
        }
        if (interrupted) {
            s.storageWarning = 'Sesi sebelumnya memiliki run aktif. Periksa statusnya di Otomasi sebelum melepas resource.';
            (0, format_1.activity)(s, 'system', 'Sesi sebelumnya terputus', 'Run aktif ditandai Perlu pemeriksaan status; tidak dilanjutkan otomatis.', 'demo');
        }
        return s;
    }
    catch {
        base.storageWarning = 'Data tersimpan tidak terbaca. Fixture demo dipulihkan agar halaman tetap dapat digunakan.';
        return base;
    }
}

},
"domain/types":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},
"features/automation/Automation":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerLabel = exports.routineStatus = void 0;
exports.RoutineDetails = RoutineDetails;
exports.RunDetails = RunDetails;
exports.Automation = Automation;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const monitoring_1 = require("../../components/monitoring");
const ui_1 = require("../../components/ui");
const format_1 = require("../../domain/format");
const scheduler_1 = require("../../domain/scheduler");
const selectors_1 = require("../../domain/selectors");
const Builder_1 = require("./Builder");
const kindLabels = { irrigation: 'Irigasi', fertigation: 'Nutrisi', environment: 'Lingkungan', preventive: 'Preventif', pest: 'Modul uji hama' };
const kindIcons = { irrigation: 'drop', fertigation: 'flask', environment: 'wind', preventive: 'wrench', pest: 'shield' };
const routineStatus = (r) => r.status === 'Active' ? 'Aktif' : r.status === 'Paused' ? 'Dijeda' : r.status === 'Draft' ? 'Draft' : 'Perlu ditinjau';
exports.routineStatus = routineStatus;
const triggerLabel = (r) => r.trigger.type === 'schedule' ? r.trigger.schedule.times.join(', ') + ' WIB' : r.trigger.type === 'sensor' ? `${r.trigger.deviceId} ${r.trigger.direction === 'below' ? '<' : '>'} ${r.trigger.start}` : `Setelah ${r.trigger.routineId} selesai`;
exports.triggerLabel = triggerLabel;
function RoutineDetails({ ctx, id }) {
    const { s } = ctx, r = s.routines.find(r => r.id === id);
    if (!r)
        return react_1.default.createElement(ui_1.Empty, { title: "Rutinitas tidak ditemukan" });
    const next = (0, scheduler_1.nextOccurrence)(r, s.clock), devices = (0, scheduler_1.availableDevices)(s), missing = r.version.requiredDevices.filter(id => !devices.some(d => d.id === id && d.connection === 'online' && d.calibrated && !d.maintenance));
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "detail-title" },
            react_1.default.createElement("span", { className: "big-soft-icon" },
                react_1.default.createElement(ui_1.Icon, { name: kindIcons[r.kind], size: 27 })),
            react_1.default.createElement("div", null,
                react_1.default.createElement("h2", null, r.name),
                react_1.default.createElement("p", null,
                    r.id,
                    " \u00B7 versi ",
                    r.version.number)),
            react_1.default.createElement(ui_1.Badge, { tone: r.status === 'Active' ? 'green' : r.status === 'Needs review' ? 'amber' : 'gray', dot: true }, (0, exports.routineStatus)(r))),
        react_1.default.createElement("p", { className: "muted" }, r.description),
        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Zona', value: r.version.zones.map(z => 'Zona ' + z).join(', ') }, { label: 'Pemicu', value: (0, exports.triggerLabel)(r) }, { label: 'Kebijakan', value: r.policy === 'automatic' ? 'Otomatis setelah aktivasi' : r.policy === 'approval' ? 'Minta persetujuan per kejadian' : 'Buat tugas petugas' }, { label: 'Berikutnya', value: next ? `${(0, format_1.dateLabel)(next)} · ${(0, format_1.clockTime)(next)} WIB` : 'Dipicu kondisi sensor / run lain' }, { label: 'Resource bersama', value: r.version.resource ?? 'Tidak ada aktuator' }, { label: 'Batas harian', value: `${r.version.maxCyclesPerDay} siklus · ${r.version.maxWaterPerDay} L (demo)` }] }),
        react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Urutan proses"),
            react_1.default.createElement("div", { className: "compact-steps" }, r.version.steps.map((step, i) => react_1.default.createElement("div", { key: step.id },
                react_1.default.createElement("span", null, i + 1),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("strong", null, step.label),
                    react_1.default.createElement("small", null,
                        step.duration ? (0, format_1.duration)(step.duration) + ' menit' : 'Tugas petugas',
                        " \u00B7 ",
                        step.deviceIds.join(', ') || 'Pemeriksaan lokal')))))),
        react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Perangkat yang digunakan"),
            react_1.default.createElement("div", { className: "chip-list" }, r.version.requiredDevices.map(id => react_1.default.createElement("button", { key: id, onClick: () => ctx.nav(`/perangkat?device=${id}`), className: missing.includes(id) ? 'warning' : '' },
                id,
                react_1.default.createElement(ui_1.Icon, { name: "external", size: 12 }))))),
        missing.length > 0 ? react_1.default.createElement(ui_1.Alert, { title: "Syarat operasi belum tersedia" },
            missing.join(', '),
            ". Run akan ditahan, bukan berjalan tanpa data.") : react_1.default.createElement(ui_1.Alert, { tone: "green", title: "Syarat awal tersedia" }, "Feedback aliran dan batas operasi tetap diperiksa selama eksekusi."),
        react_1.default.createElement("div", { className: "button-row wrap" },
            react_1.default.createElement(ui_1.Button, { tone: "primary", small: true, icon: r.status === 'Active' ? 'pause' : 'play', onClick: () => r.status === 'Active' || r.status === 'Paused' ? ctx.act({ type: 'routine_toggle', id: r.id }) : ctx.open('activate-routine', r.id) }, r.status === 'Active' ? 'Jeda rutinitas' : r.status === 'Paused' ? 'Lanjutkan' : 'Tinjau & aktifkan'),
            react_1.default.createElement(ui_1.Button, { small: true, icon: "edit", onClick: () => ctx.nav(`/otomasi?tab=builder&routine=${r.id}`) }, "Ubah"),
            react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.open('dry-run', r.id) }, "Uji aturan")),
        react_1.default.createElement("div", { className: "button-row" },
            react_1.default.createElement(ui_1.Button, { small: true, icon: "play", disabled: !r.version.reviewed, title: !r.version.reviewed ? 'Tinjau versi rutinitas terlebih dahulu.' : undefined, onClick: () => ctx.open('run-once', r.id) }, "Jalankan sekali"),
            r.trigger.type === 'schedule' && react_1.default.createElement(ui_1.Button, { small: true, icon: "clock", onClick: () => ctx.act({ type: 'skip_once', id: r.id }) }, "Lewati sekali")));
}
function RunDetails({ ctx, id }) {
    const { s } = ctx, r = s.runs.find(r => r.id === id);
    if (!r)
        return react_1.default.createElement(ui_1.Empty, { title: "Run tidak ditemukan" });
    const step = r.steps[r.stepIndex], active = (0, format_1.isActiveRun)(r.status), done = r.steps.filter(x => x.status === 'completed' || x.status === 'skipped').length, elapsed = step?.startedAt !== undefined ? Math.min(s.clock - step.startedAt, step.duration) : 0, usage = s.usages.filter(u => u.runId === r.id), water = usage.reduce((a, u) => a + u.waterLiters, 0), nutrition = usage.reduce((a, u) => a + u.nutrientUnits, 0), energy = usage.reduce((a, u) => a + u.energyKwh, 0), exception = ['Blocked', 'Failed', 'Needs reconciliation'].includes(r.status), next = (0, scheduler_1.nextScheduled)(s)[0];
    return react_1.default.createElement("div", { className: "page-stack run-detail" },
        react_1.default.createElement(ui_1.Card, null,
            react_1.default.createElement("div", { className: "run-heading" },
                react_1.default.createElement("span", { className: "big-soft-icon" },
                    react_1.default.createElement(ui_1.Icon, { name: kindIcons[r.kind], size: 29 })),
                react_1.default.createElement("div", { className: "grow" },
                    react_1.default.createElement("div", { className: "inline-wrap" },
                        react_1.default.createElement("h2", null, r.routineName),
                        react_1.default.createElement(ui_1.Badge, { tone: exception ? 'amber' : active ? 'green' : 'gray', dot: true }, format_1.runLabels[r.status])),
                    react_1.default.createElement("p", null,
                        r.id,
                        " \u00B7 ",
                        r.routineVersionId,
                        " \u00B7 ",
                        r.source === 'schedule' ? 'Otomatis sesuai jadwal' : r.source === 'sensor' ? 'Episode sensor' : r.source === 'plan' ? 'Rencana pengendalian' : 'Dijalankan sekali')),
                react_1.default.createElement("div", { className: "button-row wrap" },
                    react_1.default.createElement(ui_1.Button, { small: true, icon: "file", onClick: () => ctx.nav(r.planId ? `/pengendalian?plan=${r.planId}` : `/otomasi?tab=routines&routine=${r.routineId}`) }, r.planId ? 'Lihat rencana' : 'Lihat rutinitas'),
                    active && react_1.default.createElement(ui_1.Button, { small: true, tone: "danger", icon: "stop", disabled: r.stopRequestedAt !== undefined, onClick: () => ctx.act({ type: 'stop', id: r.id }) }, r.stopRequestedAt !== undefined ? 'Menunggu stop…' : 'Hentikan proses')))),
        exception && react_1.default.createElement(ui_1.Alert, { tone: r.status === 'Needs reconciliation' ? 'red' : 'amber', title: format_1.runLabels[r.status], action: react_1.default.createElement(ui_1.Button, { small: true, onClick: () => r.status === 'Needs reconciliation' ? ctx.open('reconcile', r.id) : ctx.nav(`/perangkat?device=${r.snapshot.requiredDevices.find(id => s.devices.find(d => d.id === id)?.connection !== 'online') ?? 'FLOW-01'}`) }, r.status === 'Needs reconciliation' ? 'Periksa status' : 'Periksa perangkat') }, r.reason),
        react_1.default.createElement("div", { className: "run-layout" },
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, null,
                    react_1.default.createElement("div", { className: "run-countdown" },
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("span", { className: "eyebrow" }, active ? 'LANGKAH SAAT INI' : 'HASIL EKSEKUSI'),
                            react_1.default.createElement("h3", null, active ? step?.label ?? r.reason : format_1.runLabels[r.status]),
                            react_1.default.createElement("div", { className: "timer" },
                                react_1.default.createElement("strong", null, active ? (0, format_1.duration)(elapsed) : (0, format_1.duration)((r.finishedAt ?? s.clock) - (r.startedAt ?? r.createdAt))),
                                react_1.default.createElement("span", null,
                                    "/ ",
                                    (0, format_1.duration)(active ? step?.duration ?? 0 : r.snapshot.steps.reduce((a, x) => a + x.duration, 0)),
                                    " menit"))),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("small", null, active ? 'Batas langkah' : 'Selesai / dihentikan'),
                            react_1.default.createElement("strong", null,
                                (0, format_1.clockTime)(active ? (step?.startedAt ?? s.clock) + (step?.duration ?? 0) : r.finishedAt ?? s.clock),
                                " WIB"))),
                    react_1.default.createElement(ui_1.Progress, { value: active && step?.duration ? elapsed / step.duration * 100 : done / r.steps.length * 100, label: `${done}/${r.steps.length} langkah selesai / dilewati` }),
                    react_1.default.createElement("div", { className: "run-steps" }, r.steps.map((st, i) => react_1.default.createElement("div", { key: st.id, className: `run-step ${st.status}` },
                        react_1.default.createElement("span", { className: "step-dot" }, st.status === 'completed' ? react_1.default.createElement(ui_1.Icon, { name: "check", size: 13 }) : st.status === 'failed' ? react_1.default.createElement(ui_1.Icon, { name: "alert", size: 13 }) : st.status === 'skipped' ? '–' : i + 1),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("strong", null, st.label),
                            react_1.default.createElement("small", null, st.status === 'pending' ? 'Menunggu giliran' : st.status === 'running' ? 'Sedang berjalan' : st.status === 'completed' ? 'Selesai' : st.status === 'skipped' ? st.reason : 'Dihentikan / gagal')),
                        react_1.default.createElement("span", null, st.startedAt ? (0, format_1.clockTime)(st.startedAt, true) : (0, format_1.duration)(st.duration)))))),
                react_1.default.createElement("div", { className: "stats three compact-stats" },
                    react_1.default.createElement(ui_1.Stat, { icon: "drop", label: "Air tersalurkan", value: `${(0, format_1.number)(water, 1)} L`, sub: usage.some(u => u.waterSource === 'measured_demo') ? 'Terukur demo' : 'Belum ada feedback pemakaian' }),
                    react_1.default.createElement(ui_1.Stat, { icon: "flask", label: "Nutrisi simulator", value: usage.some(u => !u.deliveryConfirmed) ? 'Belum pasti' : `${(0, format_1.number)(nutrition, 2)} unit`, sub: "Unit demo, bukan dosis budidaya" }),
                    react_1.default.createElement(ui_1.Stat, { icon: "bolt", label: "Energi estimasi", value: `${(0, format_1.number)(energy, 3)} kWh`, sub: "Daya contoh \u00D7 runtime" })),
                react_1.default.createElement(ui_1.Card, { title: "Skema perangkat", icon: "devices" },
                    react_1.default.createElement("div", { className: "device-flow" }, (r.resource === 'PUMP-01' ? [{ id: 'LEVEL-01', label: 'Tangki air', icon: 'drop' }, { id: 'PUMP-01', label: 'Pompa', icon: 'devices' }, ...(r.kind === 'fertigation' ? [{ id: 'DOSE-01', label: 'Injector demo', icon: 'flask' }] : []), { id: `VALVE-${r.currentZone ?? r.snapshot.zones[0]}`, label: `Zona ${r.currentZone ?? r.snapshot.zones[0]}`, icon: 'leaf' }] : r.resource === 'FAN-01' ? [{ id: 'TH-A-01', label: 'Sensor suhu', icon: 'temp' }, { id: 'FAN-01', label: 'Fan', icon: 'wind' }] : [{ id: 'CTRL-01', label: 'Modul uji virtual', icon: 'shield' }]).map((d, i) => react_1.default.createElement(react_1.default.Fragment, { key: d.id },
                        i > 0 && react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 21 }),
                        react_1.default.createElement("button", { onClick: () => ctx.nav(`/perangkat?device=${d.id}`), className: active ? 'active' : '' },
                            react_1.default.createElement(ui_1.Icon, { name: d.icon, size: 26 }),
                            react_1.default.createElement("strong", null, d.label),
                            react_1.default.createElement("small", null, d.id))))),
                    react_1.default.createElement("p", { className: "micro muted" }, "Diagram status simulator, bukan simulasi aliran fisik. Status koneksi dan feedback aktuasi adalah informasi yang berbeda.")),
                react_1.default.createElement(ui_1.Card, { title: "Catatan proses", icon: "history", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.nav(`/riwayat?search=${r.id}`) },
                        "Riwayat lengkap ",
                        react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 })) },
                    react_1.default.createElement("div", { className: "process-log" }, s.events.filter(e => e.objectId === r.id).slice(0, 10).map(e => react_1.default.createElement("div", { key: e.id },
                        react_1.default.createElement("span", { className: "tiny-dot" }),
                        react_1.default.createElement("time", null, (0, format_1.clockTime)(e.at, true)),
                        react_1.default.createElement("strong", null, e.title),
                        react_1.default.createElement("small", null, e.detail)))))),
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Giliran berikutnya", icon: "clock" },
                    r.snapshot.zones.includes('B') && r.steps.some(st => st.zoneId === 'B' && st.status === 'pending') && react_1.default.createElement("div", { className: "next-queue" },
                        react_1.default.createElement("span", { className: "soft-icon" },
                            react_1.default.createElement(ui_1.Icon, { name: "drop" })),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, "Zona B"),
                            react_1.default.createElement("small", null, "Menunggu pompa yang sama."))),
                    s.runs.filter(x => x.status === 'Queued' && x.id !== r.id).map(x => react_1.default.createElement("button", { className: "plain-row", key: x.id, onClick: () => (0, context_1.updateQuery)(ctx, '/otomasi', { run: x.id }) },
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, x.routineName),
                            react_1.default.createElement("small", null, x.reason)),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 14 }))),
                    next && react_1.default.createElement("button", { className: "plain-row", onClick: () => ctx.nav(`/otomasi?tab=routines&routine=${next.routine.id}`) },
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null,
                                (0, format_1.clockTime)(next.at),
                                " WIB"),
                            react_1.default.createElement("small", null, next.routine.name)),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 14 }))),
                react_1.default.createElement(ui_1.Card, { title: "Batas operasi", icon: "settings" },
                    react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Durasi maksimum', value: (0, format_1.duration)(r.snapshot.maxDuration) + ' menit / run' }, { label: 'Siklus harian', value: `Maksimal ${r.snapshot.maxCyclesPerDay}` }, { label: 'Batas air', value: `${r.snapshot.maxWaterPerDay} L / hari / resource` }, { label: 'Batas nutrisi', value: `${r.snapshot.maxNutritionPerDay} unit demo / hari` }, { label: 'Jeda antarsiklus', value: (0, format_1.duration)(r.snapshot.cooldownSeconds) }, { label: 'Batas antrean', value: (0, format_1.duration)(r.snapshot.queueTimeout) }] }),
                    react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Hard limit dan sensor wajib tidak dapat dilewati oleh override."),
                    react_1.default.createElement(ui_1.Button, { small: true, icon: "file", onClick: () => ctx.open('override', r.routineId) }, "Catat override sementara")),
                r.resource === 'PUMP-01' && react_1.default.createElement(ui_1.Card, { title: "Feedback perangkat", icon: "eye" },
                    react_1.default.createElement("div", { className: "page-stack tight" },
                        react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "FLOW-01", compact: true }),
                        react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "LEVEL-01", compact: true }),
                        r.kind === 'fertigation' && react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "EC-01", compact: true }))),
                react_1.default.createElement(ui_1.Alert, { tone: "green", title: "Satu pompa, satu giliran" }, "Run manual menggunakan lock dan anggaran kumulatif yang sama. Tidak memotong run aktif."))));
}
function Automation(ctx) {
    const { s } = ctx, tab = ctx.query.get('tab') ?? 'schedule', k = (0, selectors_1.kpis)(s), selected = s.routines.find(r => r.id === ctx.query.get('routine')) ?? s.routines[0], run = s.runs.find(r => r.id === ctx.query.get('run')) ?? s.runs.find(r => (0, format_1.isActiveRun)(r.status)) ?? s.runs[0], search = ctx.query.get('search') ?? '', kind = ctx.query.get('kind') ?? 'all';
    if (tab === 'builder')
        return react_1.default.createElement(Builder_1.RoutineBuilder, { key: ctx.query.get('routine') ?? 'new', ctx: ctx });
    const list = s.routines.filter(r => (kind === 'all' || r.kind === kind) && r.name.toLowerCase().includes(search.toLowerCase()));
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "stats" },
            react_1.default.createElement(ui_1.Stat, { icon: "workflow", label: "Rutinitas aktif", value: k.routines, sub: `${s.routines.length} rutinitas terkonfigurasi` }),
            react_1.default.createElement(ui_1.Stat, { icon: "play", label: "Berjalan / antre", value: k.active.length, sub: "Semua aktuasi berupa simulasi" }),
            react_1.default.createElement(ui_1.Stat, { icon: "calendar", label: "Jadwal berikutnya", value: k.next ? (0, format_1.clockTime)(k.next.at) : '—', sub: k.next?.routine.name ?? 'Tidak ada jadwal aktif' }),
            react_1.default.createElement(ui_1.Stat, { icon: "alert", tone: "amber", label: "Pengecualian", value: k.exceptions.length, sub: "Tertahan, gagal, atau belum pasti", onClick: () => (0, context_1.updateQuery)(ctx, '/otomasi', { tab: 'executions', run: k.exceptions[0]?.id }) })),
        react_1.default.createElement(ui_1.Tabs, { value: tab, onChange: v => (0, context_1.updateQuery)(ctx, '/otomasi', { tab: v }), items: [{ id: 'schedule', label: 'Jadwal' }, { id: 'routines', label: 'Rutinitas' }, { id: 'executions', label: 'Eksekusi', count: k.active.length || undefined }, { id: 'nutrition', label: 'Profil nutrisi' }] }),
        tab === 'schedule' && react_1.default.createElement("div", { className: "schedule-layout" },
            react_1.default.createElement(ui_1.Card, { title: "Jadwal hari ini", icon: "calendar", subtitle: `${(0, format_1.dateLabel)(s.clock, true)} · Semua waktu WIB`, tools: react_1.default.createElement(ui_1.Select, { label: "Tampilan jadwal", value: ctx.query.get('agenda') ?? 'day', onChange: v => (0, context_1.updateQuery)(ctx, '/otomasi', { agenda: v }), options: [{ value: 'day', label: 'Timeline 24 jam' }, { value: 'week', label: 'Agenda 7 hari' }] }) },
                ctx.query.get('agenda') === 'week' ? react_1.default.createElement("div", { className: "weekly-agenda" }, Array.from({ length: 7 }, (_, i) => { const date = (0, format_1.localDate)(s.clock + i * 86400); return react_1.default.createElement("div", { key: date },
                    react_1.default.createElement("strong", null, (0, format_1.dateLabel)(date)),
                    react_1.default.createElement("div", null, s.routines.filter(r => r.trigger.type === 'schedule' && r.status === 'Active').map(r => react_1.default.createElement("button", { key: r.id, onClick: () => ctx.open('routine', r.id) },
                        react_1.default.createElement("span", { className: `tiny-dot ${r.kind}` }),
                        (0, exports.triggerLabel)(r),
                        " \u00B7 ",
                        r.name)))); })) : react_1.default.createElement("div", { className: "schedule-chart" },
                    react_1.default.createElement("div", { className: "schedule-hours" },
                        react_1.default.createElement("span", null, "Rutinitas"),
                        react_1.default.createElement("div", null, [0, 6, 12, 18, 24].map(h => react_1.default.createElement("span", { key: h },
                            String(h).padStart(2, '0'),
                            ":00")))),
                    s.routines.filter(r => r.status === 'Active').map(r => { const hour = r.trigger.type === 'schedule' ? Number(r.trigger.schedule.times[0]?.split(':')[0] ?? 0) : 8; const current = s.runs.find(x => x.routineId === r.id && (0, format_1.localDate)(x.createdAt) === (0, format_1.localDate)(s.clock)); return react_1.default.createElement("div", { className: "schedule-row", key: r.id },
                        react_1.default.createElement("button", { onClick: () => ctx.open('routine', r.id) },
                            react_1.default.createElement(ui_1.Icon, { name: kindIcons[r.kind], size: 16 }),
                            react_1.default.createElement("span", null,
                                r.name,
                                react_1.default.createElement("small", null, r.policy === 'task' ? 'Tugas petugas' : 'Otomatis'))),
                        react_1.default.createElement("div", { className: "schedule-track" },
                            react_1.default.createElement("span", { className: "now-line", style: { left: `${((s.clock + 7 * 3600) % 86400) / 86400 * 100}%` } }),
                            react_1.default.createElement("button", { className: `schedule-event ${r.kind} ${current?.status === 'Running' ? 'running' : ''}`, style: { left: `${hour / 24 * 100}%`, width: r.trigger.type === 'sensor' ? '38%' : undefined }, onClick: () => current ? ctx.nav(`/otomasi?tab=executions&run=${current.id}`) : ctx.open('routine', r.id) }, current ? format_1.runLabels[current.status] : r.trigger.type === 'sensor' ? 'Jendela kondisi' : r.trigger.type === 'schedule' ? r.trigger.schedule.times[0] : ''))); }),
                    react_1.default.createElement("div", { className: "schedule-legend" },
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("i", { className: "green" }),
                            "Otomatis"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("i", { className: "amber" }),
                            "Nutrisi demo"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("i", { className: "purple" }),
                            "Tugas petugas"))),
                react_1.default.createElement("div", { className: "section-label" }, "Agenda berikutnya"),
                react_1.default.createElement("div", { className: "agenda-list" }, (0, scheduler_1.nextScheduled)(s).slice(0, 5).map(x => react_1.default.createElement("div", { key: x.routine.id },
                    react_1.default.createElement("time", null, (0, format_1.clockTime)(x.at)),
                    react_1.default.createElement("span", { className: `soft-icon ${x.routine.kind === 'fertigation' ? 'amber' : ''}` },
                        react_1.default.createElement(ui_1.Icon, { name: kindIcons[x.routine.kind] })),
                    react_1.default.createElement("span", { className: "grow" },
                        react_1.default.createElement("strong", null, x.routine.name),
                        react_1.default.createElement("small", null,
                            "Zona ",
                            x.routine.version.zones.join(', '),
                            " \u00B7 ",
                            x.routine.policy === 'task' ? 'Menjadi tugas petugas' : 'Otomatis, tanpa approval per run')),
                    react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.open('routine', x.routine.id) },
                        "Lihat detail ",
                        react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 })))))),
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Berjalan sekarang", icon: "play" }, k.active.length ? k.active.map(r => react_1.default.createElement("button", { key: r.id, className: "live-run-tile", onClick: () => ctx.nav(`/otomasi?tab=executions&run=${r.id}`) },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement(ui_1.Icon, { name: kindIcons[r.kind], size: 24 }),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, r.routineName),
                            react_1.default.createElement("small", null,
                                r.id,
                                " \u00B7 ",
                                format_1.runLabels[r.status])),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 16 })),
                    react_1.default.createElement("p", null, r.steps[r.stepIndex]?.label ?? r.reason),
                    react_1.default.createElement(ui_1.Progress, { value: r.stepIndex / r.steps.length * 100 }))) : react_1.default.createElement(ui_1.Empty, { title: "Belum ada run aktif", detail: "Majukan demo clock ke 10:00 untuk memulai penyiraman secara otomatis.", icon: "clock", action: react_1.default.createElement(ui_1.Button, { small: true, tone: "primary", icon: "play", onClick: () => { ctx.act({ type: 'next' }); ctx.nav('/otomasi?tab=executions'); } }, "Ke kejadian berikutnya") })),
                react_1.default.createElement(ui_1.Card, { title: "Yang perlu diperhatikan", icon: "alert" }, k.exceptions.length ? k.exceptions.slice(0, 3).map(r => react_1.default.createElement("button", { className: "exception-tile", key: r.id, onClick: () => ctx.nav(`/otomasi?tab=executions&run=${r.id}`) },
                    react_1.default.createElement(ui_1.Badge, { tone: "amber" }, format_1.runLabels[r.status]),
                    react_1.default.createElement("strong", null, r.routineName),
                    react_1.default.createElement("small", null, r.reason))) : react_1.default.createElement("p", { className: "muted" }, "Tidak ada pengecualian otomasi. Kamera E-01 offline tidak memblokir irigasi dengan sensor independen.")),
                react_1.default.createElement(ui_1.Alert, { tone: "blue", title: "Rutinitas berjalan selama halaman aktif" }, "Clock demo dijeda saat tab disembunyikan. Instalasi nyata memerlukan controller; tidak ada koneksi perangkat pada prototype."))),
        tab === 'routines' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "filter-bar" },
                react_1.default.createElement(ui_1.SearchField, { value: search, onChange: v => (0, context_1.updateQuery)(ctx, '/otomasi', { search: v }), placeholder: "Cari rutinitas\u2026" }),
                react_1.default.createElement(ui_1.Select, { label: "Jenis rutinitas", value: kind, onChange: v => (0, context_1.updateQuery)(ctx, '/otomasi', { kind: v }), options: [{ value: 'all', label: 'Semua jenis' }, ...Object.entries(kindLabels).map(([value, label]) => ({ value, label }))] }),
                react_1.default.createElement("span", { className: "micro muted" }, "Aktivasi ditinjau sekali per versi.")),
            react_1.default.createElement("div", { className: "routine-layout" },
                react_1.default.createElement(ui_1.Card, { title: "Rutinitas kebun", subtitle: `${list.length} rutinitas · konfigurasi dan batas operasi` },
                    react_1.default.createElement("div", { className: "table-scroll" },
                        react_1.default.createElement("table", null,
                            react_1.default.createElement("thead", null,
                                react_1.default.createElement("tr", null,
                                    react_1.default.createElement("th", null, "Rutinitas"),
                                    react_1.default.createElement("th", null, "Zona / pemicu"),
                                    react_1.default.createElement("th", null, "Kebijakan"),
                                    react_1.default.createElement("th", null, "Status"),
                                    react_1.default.createElement("th", null))),
                            react_1.default.createElement("tbody", null, list.map(r => react_1.default.createElement("tr", { key: r.id, className: selected.id === r.id ? 'selected' : '' },
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement("button", { className: "device-name", onClick: () => (0, context_1.updateQuery)(ctx, '/otomasi', { routine: r.id }) },
                                        react_1.default.createElement("span", { className: "soft-icon" },
                                            react_1.default.createElement(ui_1.Icon, { name: kindIcons[r.kind] })),
                                        react_1.default.createElement("span", null,
                                            react_1.default.createElement("strong", null, r.name),
                                            react_1.default.createElement("small", null,
                                                kindLabels[r.kind],
                                                " \u00B7 v",
                                                r.version.number)))),
                                react_1.default.createElement("td", null,
                                    "Zona ",
                                    r.version.zones.join(', '),
                                    react_1.default.createElement("small", { className: "cell-sub" }, (0, exports.triggerLabel)(r))),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(ui_1.Badge, { tone: r.policy === 'task' ? 'purple' : 'gray' }, r.policy === 'automatic' ? 'Otomatis' : r.policy === 'task' ? 'Buat tugas' : 'Persetujuan')),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement("button", { className: `switch ${r.status === 'Active' ? 'on' : ''}`, role: "switch", "aria-checked": r.status === 'Active', "aria-label": `${r.status === 'Active' ? 'Jeda' : 'Aktifkan'} ${r.name}`, onClick: () => r.status === 'Active' || r.status === 'Paused' ? ctx.act({ type: 'routine_toggle', id: r.id }) : ctx.open('activate-routine', r.id) },
                                        react_1.default.createElement("span", null)),
                                    react_1.default.createElement("small", { className: "cell-sub" }, (0, exports.routineStatus)(r))),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "chevron", ariaLabel: `Detail ${r.name}`, onClick: () => {
                                            (0, context_1.updateQuery)(ctx, '/otomasi', { routine: r.id });
                                            if (ctx.mobile)
                                                ctx.open('routine', r.id);
                                        } }))))))),
                    !list.length && react_1.default.createElement(ui_1.Empty, { title: "Tidak ada rutinitas sesuai filter" })),
                react_1.default.createElement(ui_1.Card, { className: "inspector desktop-detail" },
                    react_1.default.createElement(RoutineDetails, { ctx: ctx, id: selected.id })))),
        tab === 'executions' && react_1.default.createElement(react_1.default.Fragment, null,
            s.runs.length > 0 && react_1.default.createElement("div", { className: "filter-bar" },
                react_1.default.createElement(ui_1.Select, { label: "Pilih run", value: run?.id ?? '', onChange: v => (0, context_1.updateQuery)(ctx, '/otomasi', { run: v }), options: s.runs.map(r => ({ value: r.id, label: `${r.id} · ${r.routineName} · ${format_1.runLabels[r.status]}` })) }),
                react_1.default.createElement("span", { className: "micro muted" },
                    s.runs.length,
                    " run dalam histori demo \u00B7 klik untuk menelusuri langkah."),
                react_1.default.createElement(ui_1.Button, { small: true, icon: "download", onClick: () => ctx.nav('/riwayat?type=run') }, "Laporan otomasi")),
            run ? react_1.default.createElement(RunDetails, { ctx: ctx, id: run.id }) : react_1.default.createElement(ui_1.Card, null,
                react_1.default.createElement(ui_1.Empty, { title: "Eksekusi akan muncul di sini", detail: "Tidak ada run palsu yang dianggap selesai. Majukan demo clock; scheduler menjalankan rutinitas secara otomatis.", icon: "workflow", action: react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "play", onClick: () => ctx.act({ type: 'next' }) }, "Ke kejadian berikutnya") }))),
        tab === 'nutrition' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Alert, { title: "Parameter simulasi, bukan resep budidaya" }, "EC/pH adalah pembacaan fixture. Tidak ada formulasi pupuk, koreksi pH otomatis, atau rekomendasi konsentrasi dari gambar tanaman."),
            react_1.default.createElement("div", { className: "nutrition-layout" },
                react_1.default.createElement(ui_1.Card, { title: "Profil nutrisi" },
                    react_1.default.createElement("div", { className: "routine-list" }, s.nutrientProfiles.map(p => react_1.default.createElement("button", { key: p.id, className: `routine-item ${(ctx.query.get('profile') ?? 'NP-001') === p.id ? 'selected' : ''}`, onClick: () => (0, context_1.updateQuery)(ctx, '/otomasi', { profile: p.id }) },
                        react_1.default.createElement("span", { className: "soft-icon" },
                            react_1.default.createElement(ui_1.Icon, { name: "flask" })),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, p.name),
                            react_1.default.createElement("small", null,
                                "v",
                                p.version,
                                " \u00B7 Zona ",
                                p.zones.join(', ')),
                            react_1.default.createElement(ui_1.Badge, { tone: p.status === 'active' ? 'green' : 'gray' }, p.status === 'active' ? 'Aktif' : p.status === 'draft' ? 'Draft' : 'Perlu ditinjau')))))),
                react_1.default.createElement(ui_1.Card, { title: s.nutrientProfiles.find(p => p.id === (ctx.query.get('profile') ?? 'NP-001'))?.name ?? 'Profil nutrisi', icon: "flask", tools: react_1.default.createElement(ui_1.Button, { small: true, icon: "edit", onClick: () => ctx.open('nutrition-profile', ctx.query.get('profile') ?? 'NP-001') }, "Ubah profil") },
                    react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Tanaman / fase', value: 'Paprika merah · profil demo' }, { label: 'Zona target', value: 'Zona A' }, { label: 'Profil aktif', value: `${ctx.query.get('profile') ?? 'NP-001'} v${(s.nutrientProfiles.find(p => p.id === (ctx.query.get('profile') ?? 'NP-001')) ?? s.nutrientProfiles[0]).version}` }, { label: 'Target simulator', value: `${(s.nutrientProfiles.find(p => p.id === (ctx.query.get('profile') ?? 'NP-001')) ?? s.nutrientProfiles[0]).demoUnits} unit demo — bukan dosis lapangan` }] }),
                    react_1.default.createElement("h3", null, "Urutan fertigasi"),
                    react_1.default.createElement("div", { className: "compact-steps" }, s.routines.find(r => r.id === 'RTN-002')?.version.steps.map((st, i) => react_1.default.createElement("div", { key: st.id },
                        react_1.default.createElement("span", null, i + 1),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("strong", null, st.label),
                            react_1.default.createElement("small", null, st.deviceIds.join(', ')))))),
                    react_1.default.createElement(ui_1.Alert, { tone: "green", title: "Dosing membutuhkan aliran terkonfirmasi" }, "Aliran hilang menghentikan dosing. Pembilasan tidak dipaksa saat air tidak tersedia atau jalur bermasalah."),
                    react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.nav('/otomasi?tab=routines&routine=RTN-002') },
                        "Lihat rutinitas fertigasi ",
                        react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 }))),
                react_1.default.createElement("div", { className: "page-stack" },
                    react_1.default.createElement(ui_1.Card, { title: "Pembacaan larutan", icon: "eye" },
                        react_1.default.createElement("div", { className: "page-stack tight" },
                            react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "EC-01" }),
                            react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "PH-01" }),
                            react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "NUTRI-LEVEL-01", compact: true }))),
                    react_1.default.createElement(ui_1.Card, { title: "Jadwal berikutnya", icon: "calendar" },
                        react_1.default.createElement("h3", null, "10:30 WIB"),
                        react_1.default.createElement("p", null, "Fertigasi Zona A \u00B7 RTN-002"),
                        react_1.default.createElement(ui_1.SourceTag, null, "Profil versi tersimpan pada setiap run"))))));
}

},
"features/automation/Builder":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineBuilder = void 0;
const react_1 = __importDefault(require("react"));
const ui_1 = require("../../components/ui");
const fixtures_1 = require("../../data/fixtures");
const format_1 = require("../../domain/format");
const scheduler_1 = require("../../domain/scheduler");
const titles = ['Identitas', 'Pemicu', 'Syarat jalan', 'Langkah', 'Batas operasi', 'Tinjau & aktifkan'];
class RoutineBuilder extends react_1.default.Component {
    constructor(props) {
        super(props);
        const existing = props.ctx.s.routines.find(r => r.id === props.ctx.query.get('routine'));
        const draft = structuredClone(existing ?? props.ctx.s.routines[0]);
        if (!existing) {
            draft.id = '';
            draft.name = 'Penyiraman terjadwal baru';
            draft.status = 'Draft';
            draft.version.reviewed = false;
        }
        this.state = { draft, step: 0, error: '', review: false };
    }
    update(patch) { this.setState({ draft: { ...this.state.draft, ...patch }, review: false, error: '' }); }
    version(patch) { this.update({ version: { ...this.state.draft.version, ...patch } }); }
    changeTemplate(kind) {
        const source = this.props.ctx.s.routines.find(r => r.kind === kind);
        if (!source)
            return;
        const template = structuredClone(source);
        template.id = this.state.draft.id;
        template.name = source.name;
        template.status = 'Draft';
        template.version.reviewed = false;
        this.setState({ draft: template, error: '', review: false });
    }
    changeTrigger(type) {
        const r = this.state.draft;
        if (type === 'schedule')
            this.update({ trigger: { type, schedule: { times: ['10:00'], weekdays: [0, 1, 2, 3, 4, 5, 6], validFrom: '2026-10-13', timeZone: 'Asia/Jakarta' } } });
        else if (type === 'sensor') {
            const deviceId = r.kind === 'environment' ? 'TH-A-01' : 'MEDIA-A';
            this.update({ trigger: { type, deviceId, direction: r.kind === 'environment' ? 'above' : 'below', start: r.kind === 'environment' ? 29 : 30, recover: r.kind === 'environment' ? 28 : 45, debounceSeconds: 60, windowStart: '08:00', windowEnd: '17:00' }, version: { ...r.version, requiredDevices: Array.from(new Set([...r.version.requiredDevices, deviceId])) } });
        }
        else
            this.update({ trigger: { type, routineId: this.props.ctx.s.routines.find(x => x.id !== r.id)?.id ?? 'RTN-001' } });
    }
    save(activate) {
        const result = this.props.ctx.act({ type: 'routine_save', routine: this.state.draft, activate });
        if (result.ok)
            this.props.ctx.nav(`/otomasi?tab=routines&routine=${result.id}`);
        else
            this.setState({ error: result.message });
    }
    render() {
        const { ctx } = this.props, { s } = ctx, { draft: r, step, error } = this.state, v = r.version, t = r.trigger, next = (0, scheduler_1.nextOccurrence)(r, s.clock), devices = (0, scheduler_1.availableDevices)(s), errors = (0, scheduler_1.validateRoutine)(s, r);
        return react_1.default.createElement("div", { className: "page-stack builder-page" },
            react_1.default.createElement("div", { className: "builder-heading" },
                react_1.default.createElement(ui_1.Button, { small: true, icon: "back", onClick: () => ctx.nav('/otomasi?tab=routines') }, "Kembali"),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h2", null, r.id ? 'Ubah rutinitas' : 'Buat rutinitas'),
                    react_1.default.createElement("p", null, "Konfigurasi satu kali, eksekusi otomatis sesuai batas operasi.")),
                react_1.default.createElement(ui_1.SourceTag, null, r.id ? `${r.id} · versi baru setelah disimpan` : 'Draft baru')),
            react_1.default.createElement("div", { className: "builder-rail card" }, titles.map((title, i) => react_1.default.createElement("button", { key: title, className: i === step ? 'active' : i < step ? 'done' : '', onClick: () => this.setState({ step: i, error: '' }) },
                react_1.default.createElement("span", null, i < step ? react_1.default.createElement(ui_1.Icon, { name: "check", size: 14 }) : i + 1),
                react_1.default.createElement("div", null,
                    title,
                    react_1.default.createElement("small", null, ['Nama, jenis, zona', 'Waktu / kondisi', 'Perangkat & data', 'Urutan proses', 'Batas & respons', 'Review versi'][i]))))),
            react_1.default.createElement(ui_1.FormError, { message: error }),
            react_1.default.createElement("div", { className: "builder-layout" },
                react_1.default.createElement(ui_1.Card, { title: titles[step], subtitle: `Langkah ${step + 1} dari 6` },
                    step === 0 && react_1.default.createElement("div", { className: "form-stack" },
                        react_1.default.createElement(ui_1.Field, { label: "Nama rutinitas" },
                            react_1.default.createElement("input", { value: r.name, onInput: (e) => this.update({ name: e.currentTarget.value }) })),
                        react_1.default.createElement("div", { className: "form-grid" },
                            react_1.default.createElement(ui_1.Field, { label: "Template rutinitas" },
                                react_1.default.createElement("select", { value: r.kind, onChange: (e) => this.changeTemplate(e.currentTarget.value) },
                                    react_1.default.createElement("option", { value: "irrigation" }, "Penyiraman terjadwal"),
                                    react_1.default.createElement("option", { value: "fertigation" }, "Pemberian nutrisi / fertigasi"),
                                    react_1.default.createElement("option", { value: "environment" }, "Pengaturan lingkungan"),
                                    react_1.default.createElement("option", { value: "preventive" }, "Pemeriksaan preventif petugas"),
                                    react_1.default.createElement("option", { value: "pest" }, "Modul preventif uji"))),
                            react_1.default.createElement(ui_1.Field, { label: "Siklus tanam" },
                                react_1.default.createElement("input", { readOnly: true, value: `${s.cycle.id} · Paprika merah` }))),
                        react_1.default.createElement(ui_1.Field, { label: "Zona target", hint: "Pilihan aktuasi mengikuti perangkat yang memang tersedia." },
                            react_1.default.createElement("div", { className: "zone-checkboxes" }, s.zones.map(z => { const disabled = (r.kind === 'irrigation' && !['A', 'B'].includes(z.id)) || (r.kind === 'fertigation' && z.id !== 'A') || (r.kind === 'environment' && !['A', 'B'].includes(z.id)); return react_1.default.createElement("label", { key: z.id, className: disabled ? 'disabled' : '' },
                                react_1.default.createElement("input", { type: "checkbox", checked: v.zones.includes(z.id), disabled: disabled, onChange: () => { const zones = v.zones.includes(z.id) ? v.zones.filter(x => x !== z.id) : [...v.zones, z.id]; this.version({ zones, ...(r.kind === 'irrigation' ? { steps: (0, fixtures_1.irrigationSteps)(zones), requiredDevices: ['CTRL-01', 'PUMP-01', 'LEVEL-01', 'FLOW-01', ...zones.flatMap(z => [`VALVE-${z}`, `MEDIA-${z}`])] } : {}) }); } }),
                                react_1.default.createElement("span", null,
                                    "Zona ",
                                    z.id,
                                    react_1.default.createElement("small", null, disabled ? 'Aktuator belum tersedia' : `${z.area} m²`))); }))),
                        react_1.default.createElement(ui_1.Field, { label: "Kebijakan eksekusi" },
                            react_1.default.createElement("select", { value: r.policy, onChange: (e) => this.update({ policy: e.currentTarget.value }) },
                                react_1.default.createElement("option", { value: "automatic" }, "Otomatis setelah konfigurasi diaktifkan"),
                                react_1.default.createElement("option", { value: "approval" }, "Minta persetujuan per kejadian"),
                                react_1.default.createElement("option", { value: "task" }, "Buat tugas petugas"))),
                        react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Penyiraman dan fertigasi terkonfigurasi tidak perlu persetujuan setiap run. Tugas manusia tidak dianggap selesai otomatis.")),
                    step === 1 && react_1.default.createElement("div", { className: "form-stack" },
                        react_1.default.createElement(ui_1.Field, { label: "Jenis pemicu" },
                            react_1.default.createElement("select", { value: t.type, onChange: (e) => this.changeTrigger(e.currentTarget.value) },
                                react_1.default.createElement("option", { value: "schedule" }, "Jadwal harian / mingguan"),
                                react_1.default.createElement("option", { value: "sensor" }, "Kondisi sensor"),
                                react_1.default.createElement("option", { value: "after_run" }, "Setelah run lain selesai"))),
                        t.type === 'schedule' && react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement("div", { className: "form-grid" },
                                react_1.default.createElement(ui_1.Field, { label: "Jam jalan (WIB)", hint: "Pisahkan beberapa waktu dengan koma. Contoh: 10:00, 15:00" },
                                    react_1.default.createElement("input", { value: t.schedule.times.join(', '), onInput: (e) => this.update({ trigger: { ...t, schedule: { ...t.schedule, times: e.currentTarget.value.split(',').map(x => x.trim()) } } }) })),
                                react_1.default.createElement(ui_1.Field, { label: "Berlaku mulai" },
                                    react_1.default.createElement("input", { type: "date", value: t.schedule.validFrom, onChange: (e) => this.update({ trigger: { ...t, schedule: { ...t.schedule, validFrom: e.currentTarget.value } } }) }))),
                            react_1.default.createElement(ui_1.Field, { label: "Hari aktif" },
                                react_1.default.createElement("div", { className: "weekdays" }, ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => react_1.default.createElement("button", { key: day, className: t.schedule.weekdays.includes(i) ? 'active' : '', onClick: () => this.update({ trigger: { ...t, schedule: { ...t.schedule, weekdays: t.schedule.weekdays.includes(i) ? t.schedule.weekdays.filter(x => x !== i) : [...t.schedule.weekdays, i] } } }) }, day)))),
                            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Zona waktu disimpan sebagai Asia/Jakarta. Jam lokal browser tidak digunakan untuk menjadwalkan.")),
                        t.type === 'sensor' && react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(ui_1.Field, { label: "Sensor pemicu" },
                                react_1.default.createElement("select", { value: t.deviceId, onChange: (e) => this.update({ trigger: { ...t, deviceId: e.currentTarget.value }, version: { ...v, requiredDevices: Array.from(new Set([...v.requiredDevices, e.currentTarget.value])) } }) }, devices.filter(d => r.kind === 'environment' ? d.capabilities.includes('temperature') : d.capabilities.includes('media')).map(d => react_1.default.createElement("option", { key: d.id, value: d.id },
                                    d.label,
                                    " \u00B7 ",
                                    d.id)))),
                            react_1.default.createElement("div", { className: "form-grid" },
                                react_1.default.createElement(ui_1.Field, { label: "Mulai ketika di bawah / di atas" },
                                    react_1.default.createElement("input", { type: "number", value: t.start, onInput: (e) => this.update({ trigger: { ...t, start: Number(e.currentTarget.value) } }) })),
                                react_1.default.createElement(ui_1.Field, { label: "Batas pulih (hysteresis)" },
                                    react_1.default.createElement("input", { type: "number", value: t.recover, onInput: (e) => this.update({ trigger: { ...t, recover: Number(e.currentTarget.value) } }) })),
                                react_1.default.createElement(ui_1.Field, { label: "Debounce (detik)" },
                                    react_1.default.createElement("input", { type: "number", min: "1", value: t.debounceSeconds, onInput: (e) => this.update({ trigger: { ...t, debounceSeconds: Number(e.currentTarget.value) } }) })),
                                react_1.default.createElement(ui_1.Field, { label: "Awal jendela" },
                                    react_1.default.createElement("input", { type: "time", value: t.windowStart, onChange: (e) => this.update({ trigger: { ...t, windowStart: e.currentTarget.value } }) })),
                                react_1.default.createElement(ui_1.Field, { label: "Akhir jendela" },
                                    react_1.default.createElement("input", { type: "time", value: t.windowEnd, onChange: (e) => this.update({ trigger: { ...t, windowEnd: e.currentTarget.value } }) }))),
                            react_1.default.createElement(ui_1.Alert, { title: "Satuan sensor harus jelas" }, "Media memakai indeks relatif fixture, bukan % kadar air universal. RH udara tidak dipakai untuk kebutuhan air akar.")),
                        t.type === 'after_run' && react_1.default.createElement(ui_1.Field, { label: "Rutinitas sumber" },
                            react_1.default.createElement("select", { value: t.routineId, onChange: (e) => this.update({ trigger: { ...t, routineId: e.currentTarget.value } }) }, s.routines.filter(x => x.id !== r.id).map(x => react_1.default.createElement("option", { key: x.id, value: x.id }, x.name))))),
                    step === 2 && react_1.default.createElement("div", { className: "page-stack" },
                        react_1.default.createElement(ui_1.Alert, { tone: "green", title: "Periksa sebelum dan selama proses" }, "Data wajib harus online, segar, dan terkalibrasi. Tidak ada fallback sensor yang diasumsikan."),
                        react_1.default.createElement("div", { className: "guard-grid" }, v.requiredDevices.map(id => { const d = devices.find(d => d.id === id), ok = d?.connection === 'online' && d.calibrated && !d.maintenance; return react_1.default.createElement("div", { className: "guard-card", key: id },
                            react_1.default.createElement(ui_1.Icon, { name: ok ? 'checkcircle' : 'alert', size: 21 }),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", null, id),
                                react_1.default.createElement("small", null, d?.label ?? 'Belum terpasang')),
                            react_1.default.createElement(ui_1.Badge, { tone: ok ? 'green' : 'amber' }, ok ? 'Siap' : 'Tidak dapat dievaluasi')); })),
                        react_1.default.createElement("label", { className: "check-row" },
                            react_1.default.createElement("input", { type: "checkbox", checked: true, readOnly: true }),
                            " Tahan jika reservoir tidak cukup."),
                        react_1.default.createElement("label", { className: "check-row" },
                            react_1.default.createElement("input", { type: "checkbox", checked: true, readOnly: true }),
                            " Jangan gunakan perangkat dalam pemeliharaan."),
                        react_1.default.createElement("label", { className: "check-row" },
                            react_1.default.createElement("input", { type: "checkbox", checked: true, readOnly: true }),
                            " Gunakan resource lock dan batas kumulatif bersama.")),
                    step === 3 && react_1.default.createElement("div", { className: "page-stack" },
                        react_1.default.createElement("p", { className: "muted" }, "Urutan ini disimpan sebagai snapshot saat run dimulai."),
                        react_1.default.createElement("div", { className: "builder-step-list" }, v.steps.map((item, i) => react_1.default.createElement("div", { key: item.id },
                            react_1.default.createElement("span", { className: "step-index" }, i + 1),
                            react_1.default.createElement("span", { className: "soft-icon" },
                                react_1.default.createElement(ui_1.Icon, { name: item.action === 'dose' ? 'flask' : item.action === 'water' ? 'drop' : item.action === 'stop' ? 'stop' : 'checkcircle' })),
                            react_1.default.createElement("div", { className: "grow" },
                                react_1.default.createElement("strong", null, item.label),
                                react_1.default.createElement("small", null, item.deviceIds.join(', ') || 'Pemeriksaan lokal')),
                            react_1.default.createElement("label", null,
                                react_1.default.createElement("input", { type: "number", min: "0", max: "900", value: item.duration, "aria-label": `Durasi ${item.label}`, onInput: (e) => this.version({ steps: v.steps.map(x => x.id === item.id ? { ...x, duration: Number(e.currentTarget.value) } : x) }) }),
                                react_1.default.createElement("small", null, "detik"))))),
                        react_1.default.createElement(ui_1.Button, { small: true, icon: "plus", onClick: () => this.version({ steps: [...v.steps, { id: `wait-${v.steps.length}`, label: 'Tunggu dengan pemantauan batas', action: 'check', duration: 10, deviceIds: [] }] }) }, "Tambah langkah tunggu"),
                        r.kind === 'fertigation' && react_1.default.createElement(ui_1.Alert, { title: "Tidak ada racikan pupuk otomatis" }, "Nutrisi mengikuti profil demo yang telah ditinjau. Dosing hanya setelah aliran terkonfirmasi.")),
                    step === 4 && react_1.default.createElement("div", { className: "form-stack" },
                        react_1.default.createElement("div", { className: "form-grid" }, [{ key: 'maxDuration', label: 'Maksimum durasi run (detik)' }, { key: 'maxCyclesPerDay', label: 'Maksimum siklus per hari' }, { key: 'cooldownSeconds', label: 'Jeda antarsiklus (detik)' }, { key: 'queueTimeout', label: 'Maksimum antrean (detik)' }, { key: 'maxWaterPerDay', label: 'Batas air harian resource (L)' }, { key: 'maxNutritionPerDay', label: 'Batas nutrisi harian (unit demo)' }].map(field => react_1.default.createElement(ui_1.Field, { key: field.key, label: field.label },
                            react_1.default.createElement("input", { type: "number", min: "0", value: v[field.key], onInput: (e) => this.version({ [field.key]: Number(e.currentTarget.value) }) })))),
                        react_1.default.createElement(ui_1.Alert, { title: "Respons perubahan kondisi" }, "Gangguan meminta penghentian sesuai profil. Jika stop tidak terkonfirmasi, resource dikunci sampai operator memeriksa statusnya."),
                        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Prioritas', value: 'Stop / hard limit → run aktif → antrean FIFO.' }, { label: 'Run manual', value: 'Batas dan lock sama; tidak memotong run aktif.' }, { label: 'Jadwal terlewat', value: 'Dilewati. Tidak menjalankan backlog sekaligus.' }] })),
                    step === 5 && react_1.default.createElement("div", { className: "page-stack" },
                        react_1.default.createElement("div", { className: "review-heading" },
                            react_1.default.createElement("span", { className: "big-soft-icon" },
                                react_1.default.createElement(ui_1.Icon, { name: "shield", size: 31 })),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("h2", null, r.name),
                                react_1.default.createElement("p", null, "Review berlaku untuk versi yang akan disimpan."))),
                        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Zona', value: v.zones.map(z => 'Zona ' + z).join(', ') }, { label: 'Pemicu berikutnya', value: next ? `${(0, format_1.dateLabel)(next)} · ${(0, format_1.clockTime)(next)} WIB` : 'Kondisi sensor / penyelesaian run' }, { label: 'Urutan', value: `${v.steps.length} langkah · ${(0, format_1.duration)(v.steps.reduce((a, x) => a + x.duration, 0))} menit` }, { label: 'Kebijakan', value: r.policy === 'automatic' ? 'Otomatis' : r.policy === 'task' ? 'Buat tugas' : 'Minta persetujuan per kejadian' }, { label: 'Resource', value: v.resource ?? 'Tugas petugas' }] }),
                        errors.length ? react_1.default.createElement(ui_1.Alert, { tone: "red", title: "Konfigurasi perlu diperbaiki" }, errors.map(e => react_1.default.createElement("p", { key: e }, e))) : react_1.default.createElement(ui_1.Alert, { tone: "green", title: "Validasi struktur lolos" }, "Feedback perangkat dan batas kumulatif tetap diperiksa saat runtime."),
                        react_1.default.createElement("label", { className: "check-row review-check" },
                            react_1.default.createElement("input", { type: "checkbox", checked: this.state.review, onChange: (e) => this.setState({ review: e.currentTarget.checked }) }),
                            react_1.default.createElement("span", null, "Saya telah meninjau jadwal, zona, perangkat, parameter demo, dan batas operasi. Tidak mengendalikan perangkat nyata.")))),
                react_1.default.createElement("div", { className: "page-stack" },
                    react_1.default.createElement(ui_1.Card, { title: "Ringkasan rutinitas", icon: "file" },
                        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Nama', value: r.name }, { label: 'Zona', value: v.zones.join(', ') || 'Belum dipilih' }, { label: 'Langkah', value: `${v.steps.length} langkah` }, { label: 'Durasi target', value: (0, format_1.duration)(v.steps.reduce((a, x) => a + x.duration, 0)) }, { label: 'Batas maksimum', value: (0, format_1.duration)(v.maxDuration) }] }),
                        react_1.default.createElement(ui_1.SourceTag, null, "Parameter simulasi")),
                    react_1.default.createElement(ui_1.Card, { title: "Jadwal berikutnya", icon: "calendar" },
                        react_1.default.createElement("h3", null, next ? (0, format_1.clockTime)(next) + ' WIB' : 'Berbasis pemicu'),
                        react_1.default.createElement("p", null, next ? (0, format_1.dateLabel)(next) : 'Dievaluasi oleh satu demo clock.')),
                    react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Perubahan material membuat versi baru. Run aktif tetap memakai snapshot versi sebelumnya."))),
            react_1.default.createElement("div", { className: "builder-footer card" },
                react_1.default.createElement(ui_1.Button, { icon: "back", disabled: step === 0, onClick: () => this.setState({ step: Math.max(0, step - 1) }) }, "Sebelumnya"),
                react_1.default.createElement("span", { className: "grow" }),
                react_1.default.createElement(ui_1.Button, { onClick: () => this.save(false) }, "Simpan draft"),
                step < 5 ? react_1.default.createElement(ui_1.Button, { tone: "primary", onClick: () => this.setState({ step: step + 1, error: '' }) },
                    "Lanjut ",
                    react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 })) : react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "check", disabled: !this.state.review || errors.length > 0, onClick: () => this.save(true) }, "Simpan & aktifkan")));
    }
}
exports.RoutineBuilder = RoutineBuilder;

},
"features/control/Control":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = Control;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const ui_1 = require("../../components/ui");
const assets_1 = require("../../data/assets");
const format_1 = require("../../domain/format");
const labels = { draft: 'Draft', awaiting_approval: 'Menunggu persetujuan', approved: 'Disetujui', running: 'Sedang dilakukan', monitoring: 'Dipantau', completed: 'Selesai', cancelled: 'Dibatalkan' };
function Control(ctx) {
    const { s } = ctx, tab = ctx.query.get('tab') ?? 'plans', p = s.plans.find(p => p.id === ctx.query.get('plan')) ?? s.plans[0];
    const run = p?.runId ? s.runs.find(r => r.id === p.runId) : null;
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "stats three" },
            react_1.default.createElement(ui_1.Stat, { icon: "alert", tone: "amber", label: "Menunggu persetujuan", value: s.plans.filter(p => p.status === 'awaiting_approval').length, sub: "Rencana yang perlu ditinjau" }),
            react_1.default.createElement(ui_1.Stat, { icon: "shield", label: "Dalam pelaksanaan / pemantauan", value: s.plans.filter(p => ['running', 'monitoring'].includes(p.status)).length, sub: "Hasil belum dianggap efektif" }),
            react_1.default.createElement(ui_1.Stat, { icon: "checkcircle", label: "Selesai setelah evaluasi", value: s.plans.filter(p => p.status === 'completed').length, sub: "Ditutup oleh operator" })),
        react_1.default.createElement(ui_1.Tabs, { value: tab, onChange: v => (0, context_1.updateQuery)(ctx, '/pengendalian', { tab: v }), items: [{ id: 'plans', label: 'Rencana tindakan' }, { id: 'simulator', label: 'Perangkat pengendali' }, { id: 'evaluation', label: 'Evaluasi' }] }),
        tab === 'plans' && react_1.default.createElement("div", { className: "control-grid" },
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Kasus aktif", icon: "bug" },
                    react_1.default.createElement("div", { className: "case-list" }, s.cases.filter(c => c.status !== 'closed').map(c => react_1.default.createElement("button", { className: "case-item compact", key: c.id, onClick: () => ctx.nav(`/hama?case=${c.id}`) },
                        react_1.default.createElement("img", { src: c.zoneId === 'B' ? assets_1.assets.evidence : assets_1.assets.camera, alt: "Gambar referensi desain" }),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null,
                                "Zona ",
                                c.zoneId),
                            react_1.default.createElement("small", null, c.id),
                            react_1.default.createElement(ui_1.Badge, { tone: c.verified ? 'green' : 'amber' }, c.verified ? 'Terverifikasi operator' : 'Perlu inspeksi')),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 14 }))))),
                react_1.default.createElement(ui_1.Card, { title: "Rencana pengendalian", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "plus", ariaLabel: "Buat rencana", onClick: () => ctx.open('plan', 'INS-024') }) },
                    react_1.default.createElement("div", { className: "routine-list" }, s.plans.map(plan => react_1.default.createElement("button", { key: plan.id, className: `routine-item ${p?.id === plan.id ? 'selected' : ''}`, onClick: () => (0, context_1.updateQuery)(ctx, '/pengendalian', { plan: plan.id }) },
                        react_1.default.createElement("span", { className: "soft-icon" },
                            react_1.default.createElement(ui_1.Icon, { name: plan.kind === 'simulator' ? 'devices' : 'leaf' })),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, plan.title),
                            react_1.default.createElement("small", null,
                                plan.id,
                                " \u00B7 Zona ",
                                plan.zoneId),
                            react_1.default.createElement(ui_1.Badge, { tone: plan.status === 'awaiting_approval' ? 'amber' : 'green' }, labels[plan.status]))))))),
            p ? react_1.default.createElement(ui_1.Card, { title: `Rencana Zona ${p.zoneId}`, subtitle: `${p.id} · ${p.caseId}`, tools: react_1.default.createElement(ui_1.Badge, { tone: p.status === 'awaiting_approval' ? 'amber' : 'green' }, labels[p.status]) },
                react_1.default.createElement("div", { className: "stage-track" }, ['Inspeksi', 'Rencana', 'Pelaksanaan', 'Evaluasi'].map((x, i) => react_1.default.createElement("div", { key: x, className: i < (['approved', 'running', 'monitoring', 'completed'].includes(p.status) ? 3 : 2) ? 'done' : '' },
                    react_1.default.createElement("span", null, i < 2 ? react_1.default.createElement(ui_1.Icon, { name: "check", size: 12 }) : i + 1),
                    react_1.default.createElement("small", null, x)))),
                react_1.default.createElement("h3", null, p.title),
                react_1.default.createElement("p", { className: "muted" }, p.notes),
                react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Metode', value: p.kind === 'manual' ? 'Tugas nonkimia oleh petugas' : p.kind === 'simulator' ? 'Modul uji virtual pada CTRL-01' : 'Rencana peninjauan ahli' }, { label: 'Penanggung jawab', value: p.operator }, { label: 'Bukti asal', value: react_1.default.createElement("button", { className: "text-link", onClick: () => ctx.nav(`/hama?case=${p.caseId}`) },
                                p.caseId,
                                react_1.default.createElement(ui_1.Icon, { name: "external", size: 13 })) }] }),
                p.kind === 'manual' ? react_1.default.createElement("div", { className: "task-list" }, p.tasks.map(t => react_1.default.createElement("label", { key: t.id, className: `task ${t.done ? 'done' : ''}` },
                    react_1.default.createElement("input", { type: "checkbox", checked: t.done, disabled: ['draft', 'awaiting_approval', 'completed'].includes(p.status), onChange: () => ctx.act({ type: 'plan_task', id: p.id, taskId: t.id }) }),
                    react_1.default.createElement("span", null,
                        react_1.default.createElement("strong", null, t.label),
                        react_1.default.createElement("small", null, t.done ? 'Dicatat selesai oleh operator' : 'Tugas fisik · tidak selesai hanya karena waktu berlalu'))))) : react_1.default.createElement("div", { className: "simulation-profile" },
                    react_1.default.createElement("span", { className: "big-soft-icon" },
                        react_1.default.createElement(ui_1.Icon, { name: "shield", size: 30 })),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("h3", null, "Modul pengusir hama \u2014 simulator"),
                        react_1.default.createElement("p", null, "Mekanisme belum dipilih / modul uji."),
                        react_1.default.createElement("div", { className: "inline-wrap" },
                            react_1.default.createElement(ui_1.SourceTag, null,
                                (0, format_1.duration)(p.durationSeconds),
                                " menit"),
                            react_1.default.createElement(ui_1.SourceTag, null, "Efektivitas belum dievaluasi")))),
                run && react_1.default.createElement(ui_1.Alert, { tone: run.status === 'Needs reconciliation' ? 'red' : 'blue', title: `${run.id} · ${format_1.runLabels[run.status]}`, action: react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.nav(`/otomasi?tab=executions&run=${run.id}`) }, "Lihat run") }, run.reason),
                p.status === 'awaiting_approval' && react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "shield", className: "full-width", onClick: () => ctx.open('approve-plan', p.id) }, "Tinjau dan setujui rencana"),
                p.status === 'approved' && p.kind === 'simulator' && react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "play", className: "full-width", onClick: () => ctx.open('start-plan', p.id) }, "Mulai simulasi"),
                react_1.default.createElement("div", { className: "detail-actions" },
                    react_1.default.createElement(ui_1.Button, { icon: "calendar", onClick: () => ctx.open('evaluate', p.id) }, "Jadwalkan / catat evaluasi"),
                    react_1.default.createElement(ui_1.Button, { icon: "history", tone: "ghost", onClick: () => ctx.nav(`/riwayat?search=${p.id}`) }, "Lihat riwayat"))) : react_1.default.createElement(ui_1.Card, null,
                react_1.default.createElement(ui_1.Empty, { title: "Belum ada rencana", detail: "Mulai dari inspeksi tanaman pada kasus terkait.", action: react_1.default.createElement(ui_1.Button, { onClick: () => ctx.nav('/hama') }, "Buka inspeksi") })),
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Evaluasi berikutnya", icon: "calendar" }, p?.evaluationAt ? react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("div", { className: "next-evaluation" },
                        react_1.default.createElement("strong", null, (0, format_1.dateLabel)(p.evaluationAt, true)),
                        react_1.default.createElement("span", null, p.operator)),
                    react_1.default.createElement("div", { className: "task-list" },
                        react_1.default.createElement("div", { className: "task" },
                            react_1.default.createElement(ui_1.Icon, { name: "check", size: 16 }),
                            react_1.default.createElement("span", null, "Gunakan interval pengamatan yang setara.")),
                        react_1.default.createElement("div", { className: "task" },
                            react_1.default.createElement(ui_1.Icon, { name: "eye", size: 16 }),
                            react_1.default.createElement("span", null, "Bandingkan bukti perangkap dan inspeksi tanaman."))),
                    react_1.default.createElement(ui_1.Button, { small: true, className: "full-width", onClick: () => ctx.open('evaluate', p.id) }, "Catat evaluasi")) : react_1.default.createElement(ui_1.Empty, { title: "Belum dijadwalkan", icon: "calendar" })),
                react_1.default.createElement(ui_1.Alert, { tone: "blue", title: "Pelaksanaan bukan hasil akhir" }, "Tindakan selesai tidak membuktikan hama hilang. Kasus ditutup setelah review hasil."),
                react_1.default.createElement(ui_1.Card, { title: "Rutinitas preventif", icon: "workflow" },
                    react_1.default.createElement("p", { className: "muted" }, "Tindakan perangkat yang sudah ditinjau dapat berjalan otomatis tanpa persetujuan setiap run."),
                    react_1.default.createElement(ui_1.Button, { small: true, icon: "arrow", onClick: () => ctx.nav('/otomasi?tab=routines&routine=RTN-005') }, "Buka rutinitas tertaut")))),
        tab === 'simulator' && react_1.default.createElement("div", { className: "two-column" },
            react_1.default.createElement(ui_1.Card, { title: "Modul pengusir hama \u2014 simulator", icon: "shield", tools: react_1.default.createElement(ui_1.Badge, { tone: s.devices.find(d => d.id === 'CTRL-01')?.connection === 'online' ? 'green' : 'amber', dot: true }, s.devices.find(d => d.id === 'CTRL-01')?.connection === 'online' ? 'Controller online' : 'Controller offline') },
                react_1.default.createElement("div", { className: "simulation-profile" },
                    react_1.default.createElement("span", { className: "device-illustration" },
                        react_1.default.createElement(ui_1.Icon, { name: "devices", size: 72 })),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("h3", null, "Profil perangkat uji"),
                        react_1.default.createElement("p", null,
                            "CTRL-01 \u00B7 capability virtual ",
                            react_1.default.createElement("code", null, "test_module")),
                        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Mekanisme', value: 'Belum dipilih / modul uji' }, { label: 'Daya fixture controller', value: '5 W · estimasi' }, { label: 'Hama sasaran', value: 'Belum ditentukan' }, { label: 'Efektivitas', value: 'Belum dievaluasi' }] }))),
                react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Tidak mengendalikan perangkat nyata. Tidak ada penyemprotan pestisida atau klaim mekanisme universal."),
                react_1.default.createElement("div", { className: "detail-actions" },
                    react_1.default.createElement(ui_1.Button, { onClick: () => ctx.nav('/perangkat?device=CTRL-01'), icon: "devices" }, "Detail controller"),
                    react_1.default.createElement(ui_1.Button, { onClick: () => ctx.nav('/otomasi?tab=routines&routine=RTN-005'), icon: "workflow" }, "Rutinitas preventif"))),
            react_1.default.createElement(ui_1.Card, { title: "Rencana siap disimulasikan", icon: "play" }, s.plans.filter(p => p.kind === 'simulator' && p.status === 'approved').length ? s.plans.filter(p => p.kind === 'simulator' && p.status === 'approved').map(p => react_1.default.createElement("div", { className: "action-row", key: p.id },
                react_1.default.createElement("span", null,
                    react_1.default.createElement("strong", null, p.title),
                    react_1.default.createElement("small", null,
                        p.id,
                        " \u00B7 ",
                        p.caseId,
                        " \u00B7 Zona ",
                        p.zoneId)),
                react_1.default.createElement(ui_1.Button, { tone: "primary", small: true, onClick: () => ctx.open('start-plan', p.id) }, "Tinjau & mulai"))) : react_1.default.createElement(ui_1.Empty, { title: "Belum ada rencana yang disetujui", detail: "Catat inspeksi, buat rencana modul uji, lalu tinjau persetujuannya.", action: react_1.default.createElement(ui_1.Button, { onClick: () => ctx.nav('/hama?case=INS-024') }, "Buka kasus Zona B") }))),
        tab === 'evaluation' && react_1.default.createElement("div", { className: "two-column" },
            react_1.default.createElement(ui_1.Card, { title: "Evaluasi hasil pengendalian", icon: "eye" }, s.plans.filter(p => p.evaluationAt).map(p => react_1.default.createElement("div", { className: "action-row", key: p.id },
                react_1.default.createElement("span", null,
                    react_1.default.createElement("strong", null, p.title),
                    react_1.default.createElement("small", null,
                        p.id,
                        " \u00B7 ",
                        p.evaluationAt ? (0, format_1.dateLabel)(p.evaluationAt) : 'Belum dijadwalkan',
                        " \u00B7 ",
                        p.operator)),
                react_1.default.createElement(ui_1.Button, { small: true, icon: "file", onClick: () => ctx.open('evaluate', p.id) }, "Catat hasil")))),
            react_1.default.createElement(ui_1.Card, { title: "Sebelum & sesudah", icon: "bug" },
                react_1.default.createElement(ui_1.Empty, { title: "Menunggu observasi lanjutan", detail: "Grafik perbandingan tidak dibuat dari rentang yang tidak setara atau data yang belum tersedia.", icon: "history" }),
                react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Penurunan tangkapan tidak langsung membuktikan penyebabnya adalah tindakan Vigor."))));
}

},
"features/costs/Costs":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planner = void 0;
exports.scopeFrom = scopeFrom;
exports.visibleExpenseRows = visibleExpenseRows;
exports.exportCosts = exportCosts;
exports.ExpenseDetails = ExpenseDetails;
exports.default = Costs;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const charts_1 = require("../../components/charts");
const ui_1 = require("../../components/ui");
const costs_1 = require("../../domain/costs");
const format_1 = require("../../domain/format");
function scopeFrom(ctx) { return { period: ctx.query.get('period') ?? '2026-09', deviceId: ctx.query.get('device') ?? undefined, zoneId: ctx.query.get('zone') || undefined, category: ctx.query.get('category') || undefined, from: ctx.query.get('from') ?? undefined, to: ctx.query.get('to') ?? undefined }; }
/** Table rows and CSV use the same search, status and relational filters. */
function visibleExpenseRows(ctx) {
    const scope = scopeFrom(ctx), status = ctx.query.get('status') ?? 'paid';
    const search = (ctx.query.get('search') ?? '').toLowerCase();
    return (0, costs_1.expenseRows)(ctx.s, scope, status !== 'paid').filter(r => (status === 'all' || r.record.status === status) &&
        `${r.record.id} ${r.record.note} ${r.record.deviceId ?? ''}`.toLowerCase().includes(search));
}
function exportCosts(ctx) {
    const scope = scopeFrom(ctx), rows = visibleExpenseRows(ctx);
    const paid = rows.filter(r => r.record.status === 'paid').reduce((t, r) => t + r.amount, 0);
    (0, format_1.downloadText)(`Vigor-pengeluaran-${scope.period}.csv`, (0, format_1.csv)([
        ['Data sintetis Vigor — bukan laporan pembayaran nyata'],
        ['Periode', scope.period, 'Perangkat', scope.deviceId ?? 'Semua', 'Zona', scope.zoneId ?? 'Semua'],
        ['ID', 'Tanggal bayar', 'Kategori', 'Catatan', 'Perangkat', 'Nilai sesuai filter (Rp)', 'Sumber', 'Status'],
        ...rows.map(r => [r.record.id, r.record.paidAt, r.record.category, r.record.note, r.record.deviceId ?? '', r.amount, r.source, r.record.status]),
        ['TOTAL TERCATAT — draft / void tidak dihitung', '', '', '', '', paid]
    ]));
}
function ExpenseDetails({ ctx, id, deviceId }) {
    const { s } = ctx, e = s.expenses.find(e => e.id === id);
    if (!e)
        return react_1.default.createElement(ui_1.Empty, { title: "Pengeluaran tidak ditemukan" });
    const allocations = s.allocations.filter(a => a.expenseId === id), allocated = allocations.reduce((t, a) => t + a.amount, 0), period = ctx.query.get('period') ?? e.paidAt.slice(0, 7), device = deviceId ?? e.deviceId;
    return react_1.default.createElement("div", { className: "detail-stack" },
        react_1.default.createElement("div", { className: "expense-detail-title" },
            react_1.default.createElement("span", { className: "soft-icon large" },
                react_1.default.createElement(ui_1.Icon, { name: e.category === 'Perawatan' ? 'wrench' : e.category === 'Listrik' ? 'bolt' : 'wallet', size: 27 })),
            react_1.default.createElement("div", null,
                react_1.default.createElement(ui_1.Badge, { tone: e.status === 'void' ? 'red' : e.status === 'draft' ? 'amber' : 'green' }, e.status === 'void' ? 'Dibatalkan' : e.status === 'draft' ? 'Draft · belum dibayar' : 'Tercatat demo'),
                react_1.default.createElement("h2", null, e.note),
                react_1.default.createElement("p", null,
                    e.id,
                    " \u00B7 ",
                    (0, format_1.dateLabel)(e.paidAt)))),
        react_1.default.createElement("div", { className: "cost-total" },
            react_1.default.createElement("span", null, e.status === 'draft' ? 'Nominal belum dikonfirmasi' : 'Nominal catatan'),
            react_1.default.createElement("strong", null, e.status === 'draft' && !e.amount ? 'Belum diisi' : (0, format_1.money)(e.amount)),
            react_1.default.createElement("small", null, allocations.length ? 'Satu tagihan — pembagian di bawah bukan pengeluaran tambahan.' : 'Catatan sintetis atau input operator pada browser ini.')),
        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Kategori', value: e.category }, { label: 'Greenhouse', value: s.greenhouse.name }, { label: 'Tanggal pembayaran', value: (0, format_1.dateLabel)(e.paidAt) }, { label: 'Periode pemakaian', value: e.usageSlices ? e.usageSlices.map(a => `${(0, format_1.monthLabel)(a.period)}: ${(0, format_1.money)(a.amount)}`).join('; ') : (0, format_1.monthLabel)(e.paidAt.slice(0, 7)) }, { label: 'Sumber', value: e.source === 'demo_ledger' ? 'Fixture ledger demo' : 'Dicatat operator pada prototype' }, { label: 'Referensi', value: e.reference ?? 'Tidak diisi' }, { label: 'Lampiran', value: e.attachmentName ? `${e.attachmentName} · nama saja, file hanya sesi lokal` : 'Belum ada lampiran' }] }),
        device && react_1.default.createElement("button", { className: "linked-asset", onClick: () => ctx.nav(`/perangkat?device=${device}&period=${period}&detailTab=cost`) },
            react_1.default.createElement("span", { className: "soft-icon" },
                react_1.default.createElement(ui_1.Icon, { name: "devices" })),
            react_1.default.createElement("span", null,
                react_1.default.createElement("small", null, "Perangkat terkait"),
                react_1.default.createElement("strong", null, s.devices.find(d => d.id === device)?.label ?? device),
                react_1.default.createElement("small", null,
                    device,
                    " \u00B7 lihat kondisi dan biaya periode yang sama")),
            react_1.default.createElement(ui_1.Icon, { name: "arrow" })),
        e.maintenanceId && react_1.default.createElement("button", { className: "text-link", onClick: () => ctx.open('maintenance', e.deviceId, e.maintenanceId) },
            "Lihat catatan perawatan ",
            e.maintenanceId,
            " ",
            react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 })),
        allocations.length > 0 && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("h3", null, "Alokasi tagihan"),
            react_1.default.createElement("div", { className: "table-scroll" },
                react_1.default.createElement("table", null,
                    react_1.default.createElement("thead", null,
                        react_1.default.createElement("tr", null,
                            react_1.default.createElement("th", null, "Tujuan"),
                            react_1.default.createElement("th", null, "Dasar pembagian"),
                            react_1.default.createElement("th", null, "Nominal"))),
                    react_1.default.createElement("tbody", null, allocations.map(a => react_1.default.createElement("tr", { key: a.id },
                        react_1.default.createElement("td", null, a.deviceId ? react_1.default.createElement("button", { className: "text-link", onClick: () => ctx.nav(`/perangkat?device=${a.deviceId}&period=${period}&detailTab=cost`) }, a.deviceId) : a.label),
                        react_1.default.createElement("td", null, a.basis === 'estimated_power_runtime' ? 'Estimasi daya × runtime' : a.basis === 'submeter' ? 'Pembacaan submeter' : 'Pembagian manual'),
                        react_1.default.createElement("td", null, (0, format_1.money)(a.amount))))),
                    react_1.default.createElement("tfoot", null,
                        react_1.default.createElement("tr", null,
                            react_1.default.createElement("td", { colSpan: 2 }, "Total alokasi"),
                            react_1.default.createElement("td", null, (0, format_1.money)(allocated))),
                        react_1.default.createElement("tr", null,
                            react_1.default.createElement("td", { colSpan: 2 }, "Belum dialokasikan"),
                            react_1.default.createElement("td", null, (0, format_1.money)(e.amount - allocated)))))),
            react_1.default.createElement(ui_1.Alert, { tone: "gray" },
                "Alokasi perangkat adalah bagian dari ",
                e.id,
                ". Total pengeluaran hanya menghitung tagihan ",
                (0, format_1.money)(e.amount),
                " satu kali.")),
        e.usageSlices && react_1.default.createElement(ui_1.Alert, { tone: "blue", title: "Pembayaran dan biaya periode berbeda" }, "Kas dicatat penuh pada tanggal bayar. Pembanding operasional memakai bagian periode yang Anda catat, tanpa menggandakan pembayaran."),
        e.status === 'void' && react_1.default.createElement(ui_1.Alert, { tone: "red", title: "Catatan dibatalkan" }, e.voidReason),
        react_1.default.createElement("div", { className: "button-row" }, e.status === 'void' ? react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "undo", onClick: () => ctx.act({ type: 'undo_void', id }) }, "Pulihkan catatan") : react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "edit", onClick: () => ctx.open('expense', id) }, e.status === 'draft' ? 'Lengkapi & konfirmasi' : 'Edit catatan'),
            react_1.default.createElement(ui_1.Button, { icon: "trash", tone: "danger", onClick: () => ctx.open('void-expense', id) }, "Batalkan"))),
        react_1.default.createElement("p", { className: "micro muted" }, "Mencatat biaya tidak menyelesaikan pekerjaan perawatan secara otomatis. Tidak ada transaksi uang nyata."));
}
class Planner extends react_1.default.Component {
    constructor(p) { super(p); this.state = { zones: p.ctx.s.costs.plannerZones, owned: p.ctx.s.costs.ownedController, saved: false }; }
    render() { const { ctx } = this.props, items = (0, costs_1.plannerItems)(this.state.zones, this.state.owned), total = (0, costs_1.plannerTotal)(items, ctx.s.costs.contingencyPercent); return react_1.default.createElement("div", { className: "detail-stack" },
        react_1.default.createElement(ui_1.Alert, { tone: "blue", title: "Rencana tambahan monitoring" }, "Greenhouse diasumsikan sudah tersedia. Ini bukan paket lengkap otomasi dan bukan harga pasar yang diverifikasi."),
        react_1.default.createElement("div", { className: "form-grid" },
            react_1.default.createElement("label", { className: "field" },
                react_1.default.createElement("span", null, "Preset cakupan"),
                react_1.default.createElement("select", { value: this.state.zones, onChange: (e) => this.setState({ zones: Number(e.currentTarget.value), saved: false }) },
                    react_1.default.createElement("option", { value: 2 }, "Monitoring 2 zona"),
                    react_1.default.createElement("option", { value: 6 }, "Monitoring 6 zona"))),
            react_1.default.createElement("div", { className: "field" },
                react_1.default.createElement("span", null, "Inventaris yang sudah dimiliki"),
                react_1.default.createElement("label", { className: "checkbox" },
                    react_1.default.createElement("input", { type: "checkbox", checked: this.state.owned, onChange: (e) => this.setState({ owned: e.currentTarget.checked, saved: false }) }),
                    "Controller tersedia (CTRL-01)"))),
        react_1.default.createElement("div", { className: "table-scroll" },
            react_1.default.createElement("table", null,
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("th", null, "Komponen"),
                        react_1.default.createElement("th", null, "Jumlah"),
                        react_1.default.createElement("th", null, "Status"),
                        react_1.default.createElement("th", null, "Rencana"))),
                react_1.default.createElement("tbody", null, items.map(i => react_1.default.createElement("tr", { key: i.id },
                    react_1.default.createElement("td", null, i.label),
                    react_1.default.createElement("td", null, i.quantity),
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(ui_1.Badge, { tone: i.owned ? 'green' : 'gray' }, i.owned ? 'Tersedia' : 'Perlu dibeli')),
                    react_1.default.createElement("td", null, i.owned ? 'Tidak dibeli lagi' : (0, format_1.money)(i.quantity * (i.unitPrice ?? 0)))))),
                react_1.default.createElement("tfoot", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("td", { colSpan: 3 }, "Subtotal"),
                        react_1.default.createElement("td", null, (0, format_1.money)(total.subtotal))),
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("td", { colSpan: 3 },
                            "Cadangan ",
                            ctx.s.costs.contingencyPercent,
                            "%"),
                        react_1.default.createElement("td", null, (0, format_1.money)(total.contingency))),
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("td", { colSpan: 3 }, "Total rencana"),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("strong", null, (0, format_1.money)(total.total))))))),
        react_1.default.createElement(ui_1.SourceTag, null, "Proyeksi belanja \u00B7 belum masuk pengeluaran"),
        react_1.default.createElement(ui_1.Alert, { tone: "gray", title: "Tambahan irigasi / fertigasi" }, "PUMP-01, DOSE-01 dan sensor otomasi sudah terdaftar pada profil operasional. Harga pembelian tambahan belum disediakan; tidak dianggap Rp0 dan tidak dimasukkan ke total preset monitoring."),
        react_1.default.createElement("p", null, "Biaya rutin bergantung pada profil penggunaan dan tarif. Pada fixture September, pompa menggunakan estimasi 27 kWh \u00D7 Rp1.500 = Rp40.500 yang sudah menjadi bagian tagihan."),
        this.state.saved && react_1.default.createElement(ui_1.Alert, { tone: "green" }, "Rencana tersimpan. Jumlah perangkat dan pengeluaran belum berubah."),
        react_1.default.createElement("div", { className: "button-row" },
            react_1.default.createElement(ui_1.Button, { tone: "primary", onClick: () => { ctx.act({ type: 'planner', zones: this.state.zones, ownedController: this.state.owned }); this.setState({ saved: true }); } }, "Simpan rencana"),
            react_1.default.createElement(ui_1.Button, { icon: "plus", onClick: () => ctx.open('expense', undefined, `purchase:${total.total}`) }, "Catat pembelian yang sudah dibayar")),
        react_1.default.createElement("p", { className: "micro muted" }, "Konfirmasi pembelian membuka pencatatan terpisah. Nominal harus dikonfirmasi operator; tidak ada pemesanan atau pembayaran otomatis.")); }
}
exports.Planner = Planner;
function Costs({ ctx }) {
    const { s } = ctx, tab = ctx.query.get('tab') ?? 'summary', scope = scopeFrom(ctx), summary = (0, costs_1.costSummary)(s, scope), comp = (0, costs_1.comparison)(s, scope), search = ctx.query.get('search') ?? '', status = ctx.query.get('status') ?? 'paid', allRows = visibleExpenseRows(ctx), categories = costs_1.OPERATING_CATEGORIES.map(c => ({ category: c, before: s.baseline?.categories[c] ?? null, after: (0, costs_1.consumedCost)(s, scope, c) })), global = !scope.deviceId && !scope.zoneId && !scope.category, complete = comp.missing.length === 0;
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "filter-bar scope-filter" },
            react_1.default.createElement("span", { className: "scope-label" },
                react_1.default.createElement(ui_1.Icon, { name: "greenhouse", size: 16 }),
                s.greenhouse.name),
            react_1.default.createElement(ui_1.Select, { label: "Periode pengeluaran", value: scope.period, onChange: v => (0, context_1.updateQuery)(ctx, '/biaya', { period: v }), options: [{ value: '2026-09', label: 'September 2026' }, { value: '2026-10', label: 'Oktober 2026 · belum selesai' }, { value: '3months', label: '3 bulan · Agustus–Oktober' }, { value: 'custom', label: 'Rentang khusus' }] }),
            react_1.default.createElement(ui_1.Select, { label: "Cakupan zona biaya", value: scope.zoneId ?? '', onChange: v => (0, context_1.updateQuery)(ctx, '/biaya', { zone: v, device: undefined }), options: [{ value: '', label: 'Semua zona' }, ...s.zones.map(z => ({ value: z.id, label: z.name }))] }),
            scope.deviceId && react_1.default.createElement("button", { className: "filter-chip", onClick: () => (0, context_1.updateQuery)(ctx, '/biaya', { device: undefined }) },
                scope.deviceId,
                react_1.default.createElement(ui_1.Icon, { name: "close", size: 13 })),
            scope.period === 'custom' && react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("input", { "aria-label": "Tanggal awal biaya", type: "date", value: scope.from ?? '2026-09-01', onChange: (e) => (0, context_1.updateQuery)(ctx, '/biaya', { from: e.currentTarget.value }) }),
                react_1.default.createElement("span", null, "\u2013"),
                react_1.default.createElement("input", { "aria-label": "Tanggal akhir biaya", type: "date", value: scope.to ?? '2026-09-30', onChange: (e) => (0, context_1.updateQuery)(ctx, '/biaya', { to: e.currentTarget.value }) })),
            react_1.default.createElement("span", { className: "micro muted scope-description" }, scope.period === '2026-09' ? '30 hari · periode selesai' : `Sampai ${(0, format_1.dateLabel)((0, format_1.localDate)(s.clock))} · data belum lengkap`)),
        react_1.default.createElement(ui_1.Stats, null,
            react_1.default.createElement(ui_1.Stat, { icon: "wallet", label: "Operasional tercatat", value: summary.rows.length ? (0, format_1.money)(summary.operating) : 'Belum tercatat', sub: `${summary.rows.filter(r => r.record.category !== 'Investasi').length} catatan · bukan estimasi runtime` }),
            react_1.default.createElement(ui_1.Stat, { icon: "lower", label: comp.difference !== null && comp.difference < 0 ? 'Biaya meningkat' : 'Selisih terhadap acuan', value: comp.difference !== null ? (0, format_1.money)(Math.abs(comp.difference)) : 'Belum dapat dibandingkan', sub: comp.percent !== null ? `${(0, format_1.num)(Math.abs(comp.percent), 1)}% · estimasi terhadap acuan manual` : comp.missing.length ? `${comp.missing.length} kategori belum lengkap` : 'Acuan / cakupan belum setara', tone: comp.difference !== null && comp.difference < 0 ? 'amber' : 'green', onClick: () => (0, context_1.updateQuery)(ctx, '/biaya', { tab: 'savings' }) }),
            react_1.default.createElement(ui_1.Stat, { icon: "coins", label: "Sisa anggaran periode", value: summary.remaining !== null ? (0, format_1.money)(summary.remaining) : 'Belum tersedia', sub: summary.budget !== null ? `Dari anggaran ${(0, format_1.money)(summary.budget)}` : 'Anggaran tidak dibagi otomatis per aset', onClick: () => ctx.open('budget', scope.period) }),
            react_1.default.createElement(ui_1.Stat, { icon: "file", label: "Kelengkapan catatan", value: `${costs_1.OPERATING_CATEGORIES.length - comp.missing.length}/6 kategori`, sub: complete ? 'Fixture September; bukan verifikasi nota' : `${comp.missing.length} kategori belum ada`, tone: complete ? 'green' : 'amber' })),
        (summary.partial || !complete) && react_1.default.createElement(ui_1.Alert, { title: "Periode atau catatan belum lengkap" },
            "Yang belum dicatat tidak dianggap Rp0. ",
            summary.partial ? 'Realisasi bulan berjalan tidak dibandingkan dengan satu bulan penuh. ' : '',
            comp.missing.length ? `Belum tersedia: ${comp.missing.join(', ')}.` : ''),
        react_1.default.createElement(ui_1.Tabs, { value: tab, onChange: v => (0, context_1.updateQuery)(ctx, '/biaya', { tab: v }), items: [{ id: 'summary', label: 'Ringkasan' }, { id: 'expenses', label: 'Pengeluaran', count: summary.rows.length }, { id: 'savings', label: 'Penghematan' }] }),
        tab === 'summary' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "costs-layout" },
                react_1.default.createElement("div", { className: "page-stack" },
                    react_1.default.createElement(ui_1.Card, { title: "Biaya operasional kebun", subtitle: `${(0, format_1.monthLabel)(scope.period)} · pengeluaran dan acuan pada cakupan yang sama`, tools: react_1.default.createElement(ui_1.SourceTag, null, "Tercatat demo") },
                        react_1.default.createElement("div", { className: "cost-chart-key" },
                            react_1.default.createElement("span", null,
                                react_1.default.createElement("i", { className: "sage" }),
                                "Acuan manual"),
                            react_1.default.createElement("span", null,
                                react_1.default.createElement("i", { className: "green" }),
                                "Sesudah diterapkan")),
                        react_1.default.createElement(charts_1.CostBars, { rows: categories.map(c => ({ label: c.category, before: c.before, after: c.after })) }),
                        react_1.default.createElement("div", { className: "table-scroll" },
                            react_1.default.createElement("table", { className: "cost-comparison" },
                                react_1.default.createElement("thead", null,
                                    react_1.default.createElement("tr", null,
                                        react_1.default.createElement("th", null, "Kategori"),
                                        react_1.default.createElement("th", null, "Acuan manual"),
                                        react_1.default.createElement("th", null, "Periode dipilih"),
                                        react_1.default.createElement("th", null, "Selisih"))),
                                react_1.default.createElement("tbody", null, categories.map(c => { const delta = c.before !== null && c.after !== null ? c.before - c.after : null; return react_1.default.createElement("tr", { key: c.category },
                                    react_1.default.createElement("td", null,
                                        react_1.default.createElement("button", { className: "text-link", onClick: () => (0, context_1.updateQuery)(ctx, '/biaya', { tab: 'expenses', category: c.category }) }, c.category)),
                                    react_1.default.createElement("td", null, c.before !== null ? (0, format_1.money)(c.before) : 'Belum diisi'),
                                    react_1.default.createElement("td", null, c.after !== null ? (0, format_1.money)(c.after) : 'Belum tercatat'),
                                    react_1.default.createElement("td", null,
                                        react_1.default.createElement("span", { className: delta !== null && delta < 0 ? 'text-amber' : 'text-green' }, delta === null ? '—' : `${(0, format_1.money)(Math.abs(delta))} ${delta >= 0 ? 'lebih rendah' : 'lebih tinggi'}`))); })),
                                react_1.default.createElement("tfoot", null,
                                    react_1.default.createElement("tr", null,
                                        react_1.default.createElement("td", null, "Total operasional"),
                                        react_1.default.createElement("td", null, comp.baseline !== null ? (0, format_1.money)(comp.baseline) : 'Belum setara'),
                                        react_1.default.createElement("td", null, (0, format_1.money)(summary.operating)),
                                        react_1.default.createElement("td", null, comp.difference === null ? 'Belum dibandingkan' : (0, format_1.money)(comp.difference)))))),
                        react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Acuan manual belum divalidasi. Selisih sebelum\u2013sesudah tidak membuktikan seluruh perubahan disebabkan Vigor.")),
                    react_1.default.createElement(ui_1.Card, { title: "Perangkat & pengeluaran terkait", subtitle: "Aset bersama tidak dibebankan penuh pada setiap zona.", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.nav(`/perangkat?period=${scope.period}`) },
                            "Lihat perangkat ",
                            react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 })) },
                        react_1.default.createElement("div", { className: "device-cost-strip" }, ['PUMP-01', 'DOSE-01', 'CTRL-01', 'EC-01'].map(id => { const rows = (0, costs_1.expenseRows)(s, { period: scope.period, deviceId: id }); return react_1.default.createElement("button", { key: id, onClick: () => ctx.nav(`/perangkat?device=${id}&period=${scope.period}&detailTab=cost`) },
                            react_1.default.createElement("span", { className: "soft-icon" },
                                react_1.default.createElement(ui_1.Icon, { name: id === 'PUMP-01' ? 'drop' : id === 'CTRL-01' ? 'devices' : 'flask' })),
                            react_1.default.createElement("strong", null, id),
                            react_1.default.createElement("span", null, rows.length ? (0, format_1.money)(rows.reduce((t, r) => t + r.amount, 0)) : 'Belum tercatat'),
                            react_1.default.createElement("small", null, "Tercatat / alokasi")); })))),
                react_1.default.createElement("div", { className: "page-stack" },
                    react_1.default.createElement(ui_1.Card, { title: "Yang berubah", icon: "wallet" },
                        react_1.default.createElement("div", { className: "change-item" },
                            react_1.default.createElement(ui_1.Icon, { name: "lower" }),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", null, "Tenaga dibayar lebih rendah"),
                                react_1.default.createElement("p", null, "Rp200.000 di bawah acuan demo. Jam kerja pemilik tidak dihitung lagi sebagai uang."))),
                        react_1.default.createElement("div", { className: "change-item" },
                            react_1.default.createElement(ui_1.Icon, { name: "up" }),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", null, "Biaya operasional baru ikut dihitung"),
                                react_1.default.createElement("p", null, "Listrik, internet, dan perawatan tidak dikeluarkan dari pembanding."))),
                        !global || scope.period !== '2026-09' ? react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Catatan di atas menjelaskan fixture September, bukan hasil otomatis untuk filter saat ini.") : null),
                    react_1.default.createElement(ui_1.Card, { title: "Tindakan berikutnya", icon: "arrow" },
                        react_1.default.createElement("div", { className: "action-list" },
                            react_1.default.createElement("button", { onClick: () => ctx.nav(`/perangkat?device=PUMP-01&period=${scope.period}&detailTab=usage`) },
                                react_1.default.createElement("span", { className: "soft-icon" },
                                    react_1.default.createElement(ui_1.Icon, { name: "drop" })),
                                react_1.default.createElement("span", null,
                                    react_1.default.createElement("strong", null, "Periksa runtime pompa"),
                                    react_1.default.createElement("small", null, "Telusuri penggunaan dan alokasi listrik")),
                                react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 16 })),
                            react_1.default.createElement("button", { onClick: () => ctx.open('baseline') },
                                react_1.default.createElement("span", { className: "soft-icon amber" },
                                    react_1.default.createElement(ui_1.Icon, { name: "file" })),
                                react_1.default.createElement("span", null,
                                    react_1.default.createElement("strong", null, "Validasi biaya acuan"),
                                    react_1.default.createElement("small", null, "Acuan manual masih berupa asumsi")),
                                react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 16 })),
                            react_1.default.createElement("button", { onClick: () => ctx.nav(`/biaya?tab=expenses&period=${scope.period}&category=Perawatan`) },
                                react_1.default.createElement("span", { className: "soft-icon" },
                                    react_1.default.createElement(ui_1.Icon, { name: "wrench" })),
                                react_1.default.createElement("span", null,
                                    react_1.default.createElement("strong", null, "Tinjau catatan servis"),
                                    react_1.default.createElement("small", null, "Pekerjaan dan pembayaran terpisah")),
                                react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 16 })))),
                    react_1.default.createElement(ui_1.Card, { title: "Anggaran periode", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "edit", ariaLabel: "Ubah anggaran", onClick: () => ctx.open('budget', scope.period) }) }, summary.budget !== null ? react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("div", { className: "budget-line" },
                            react_1.default.createElement("strong", null, (0, format_1.money)(summary.operating)),
                            react_1.default.createElement("span", null,
                                "dari ",
                                (0, format_1.money)(summary.budget))),
                        react_1.default.createElement(ui_1.Progress, { value: summary.budget ? summary.operating / summary.budget * 100 : 0 }),
                        react_1.default.createElement("p", { className: summary.remaining !== null && summary.remaining < 0 ? 'text-amber' : 'text-green' },
                            summary.remaining !== null && summary.remaining < 0 ? 'Melebihi anggaran ' : 'Tersisa ',
                            (0, format_1.money)(Math.abs(summary.remaining ?? 0))),
                        react_1.default.createElement("small", { className: "muted" }, "Sisa anggaran bukan penghematan terhadap baseline.")) : react_1.default.createElement(ui_1.Empty, { title: "Anggaran belum tersedia" })))),
            summary.investment > 0 && react_1.default.createElement(ui_1.Alert, { tone: "blue", title: `Investasi tambahan: ${(0, format_1.money)(summary.investment)}` },
                "Total uang keluar ",
                (0, format_1.money)(summary.total),
                ". Investasi dipisahkan dari operasional berulang dan tidak dimasukkan dua kali.")),
        tab === 'expenses' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "filter-bar" },
                react_1.default.createElement(ui_1.SearchField, { value: search, onChange: v => (0, context_1.updateQuery)(ctx, '/biaya', { search: v }), placeholder: "Cari catatan, perangkat, atau ID\u2026" }),
                react_1.default.createElement(ui_1.Select, { label: "Kategori pengeluaran", value: scope.category ?? '', onChange: v => (0, context_1.updateQuery)(ctx, '/biaya', { category: v }), options: [{ value: '', label: 'Semua kategori' }, ...[...costs_1.OPERATING_CATEGORIES, 'Investasi'].map(c => ({ value: c, label: c }))] }),
                react_1.default.createElement(ui_1.Select, { label: "Status catatan", value: status, onChange: v => (0, context_1.updateQuery)(ctx, '/biaya', { status: v }), options: [{ value: 'paid', label: 'Tercatat' }, { value: 'draft', label: 'Draft' }, { value: 'void', label: 'Dibatalkan' }, { value: 'all', label: 'Semua status' }] }),
                react_1.default.createElement(ui_1.Button, { small: true, icon: "download", onClick: () => exportCosts(ctx) }, "Ekspor CSV")),
            react_1.default.createElement(ui_1.Card, { title: "Catatan pengeluaran", subtitle: `${(0, format_1.monthLabel)(scope.period)} · nominal dibaca sesuai cakupan yang dipilih`, tools: react_1.default.createElement(ui_1.Button, { small: true, icon: "plus", tone: "primary", onClick: () => ctx.open('expense', undefined, scope.deviceId) }, "Catat pengeluaran") },
                react_1.default.createElement("div", { className: "table-scroll" },
                    react_1.default.createElement("table", null,
                        react_1.default.createElement("thead", null,
                            react_1.default.createElement("tr", null,
                                react_1.default.createElement("th", null, "Tanggal / ID"),
                                react_1.default.createElement("th", null, "Catatan"),
                                react_1.default.createElement("th", null, "Kategori"),
                                react_1.default.createElement("th", null, "Terkait"),
                                react_1.default.createElement("th", null, "Nominal"),
                                react_1.default.createElement("th", null, "Status"),
                                react_1.default.createElement("th", null))),
                        react_1.default.createElement("tbody", null, allRows.map(r => react_1.default.createElement("tr", { key: r.record.id, className: r.record.status === 'void' ? 'void-row' : '' },
                            react_1.default.createElement("td", null,
                                (0, format_1.dateLabel)(r.record.paidAt),
                                react_1.default.createElement("small", { className: "cell-sub" }, r.record.id)),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement("button", { className: "text-link", onClick: () => ctx.open('expense-detail', r.record.id, scope.deviceId) }, r.record.note),
                                r.record.usageSlices && react_1.default.createElement("small", { className: "cell-sub" }, "Pemakaian lintasbulan")),
                            react_1.default.createElement("td", null, r.record.category),
                            react_1.default.createElement("td", null, r.record.deviceId ? react_1.default.createElement("button", { className: "asset-chip", onClick: () => ctx.nav(`/perangkat?device=${r.record.deviceId}&period=${scope.period}&detailTab=cost`) },
                                react_1.default.createElement(ui_1.Icon, { name: "link", size: 12 }),
                                r.record.deviceId) : r.source === 'Alokasi' ? react_1.default.createElement(ui_1.SourceTag, null, "Alokasi perangkat") : s.greenhouse.name),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement("strong", null, r.record.status === 'draft' && !r.amount ? 'Belum diisi' : (0, format_1.money)(r.amount)),
                                react_1.default.createElement("small", { className: "cell-sub" }, r.source)),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement(ui_1.Badge, { tone: r.record.status === 'paid' ? 'green' : r.record.status === 'void' ? 'red' : 'amber' }, r.record.status === 'paid' ? 'Tercatat' : r.record.status === 'void' ? 'Dibatalkan' : 'Draft')),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "chevron", ariaLabel: `Detail ${r.record.id}`, onClick: () => ctx.open('expense-detail', r.record.id, scope.deviceId) }))))),
                        react_1.default.createElement("tfoot", null,
                            react_1.default.createElement("tr", null,
                                react_1.default.createElement("td", { colSpan: 4 }, "Total tercatat pada baris yang ditampilkan"),
                                react_1.default.createElement("td", null, (0, format_1.money)(allRows.filter(r => r.record.status === 'paid').reduce((t, r) => t + r.amount, 0))),
                                react_1.default.createElement("td", { colSpan: 2 },
                                    react_1.default.createElement(ui_1.SourceTag, null, "Tanpa estimasi/proyeksi")))))),
                !allRows.length && react_1.default.createElement(ui_1.Empty, { title: "Belum ada catatan sesuai filter", detail: "Catat pembayaran yang telah dikonfirmasi. Nominal yang belum diketahui tidak dianggap nol.", action: react_1.default.createElement(ui_1.Button, { onClick: () => ctx.open('expense', undefined, scope.deviceId) }, "Catat pengeluaran") })),
            react_1.default.createElement("div", { className: "button-row" },
                react_1.default.createElement(ui_1.Button, { small: true, icon: "calendar", onClick: () => { ctx.act({ type: 'recurring_drafts' }); (0, context_1.updateQuery)(ctx, '/biaya', { period: (0, format_1.localDate)(s.clock).slice(0, 7), status: 'draft' }); } }, "Buat draft biaya rutin periode ini"),
                react_1.default.createElement("p", { className: "micro muted" }, "Draft tidak dijumlahkan sebagai pembayaran. Nama file bukti tidak memverifikasi nominal."))),
        tab === 'savings' && react_1.default.createElement("div", { className: "savings-layout" },
            react_1.default.createElement(ui_1.Card, { title: "Sebelum & sesudah diterapkan", subtitle: "Perbandingan yang bisa diperiksa, bukan janji penghematan.", tools: react_1.default.createElement(ui_1.Button, { small: true, icon: "edit", onClick: () => ctx.open('baseline') }, s.baseline ? 'Ubah acuan' : 'Isi acuan') },
                react_1.default.createElement("div", { className: "comparison-hero" },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("span", null, "Sebelum otomasi"),
                        react_1.default.createElement("strong", null, comp.baseline !== null ? (0, format_1.money)(comp.baseline) : 'Belum tersedia'),
                        react_1.default.createElement(ui_1.SourceTag, null, "Acuan estimasi")),
                    react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 25 }),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("span", null, "Operasional periode"),
                        react_1.default.createElement("strong", null, summary.rows.length ? (0, format_1.money)(comp.actual) : 'Belum tercatat'),
                        react_1.default.createElement(ui_1.SourceTag, null, "Tercatat demo"))),
                comp.canCompare ? react_1.default.createElement("div", { className: `saving-result ${comp.difference < 0 ? 'increase' : ''}` },
                    react_1.default.createElement(ui_1.Icon, { name: comp.difference < 0 ? 'up' : 'lower', size: 26 }),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("span", null, comp.difference < 0 ? 'Biaya meningkat' : 'Estimasi selisih operasional bersih'),
                        react_1.default.createElement("strong", null,
                            (0, format_1.money)(Math.abs(comp.difference)),
                            " ",
                            react_1.default.createElement("small", null,
                                "(",
                                (0, format_1.num)(Math.abs(comp.percent), 1),
                                "%)")),
                        react_1.default.createElement("small", null, comp.reason))) : react_1.default.createElement(ui_1.Alert, { title: "Belum dapat dibandingkan" }, comp.reason),
                react_1.default.createElement("h3", null, "Dasar perbandingan"),
                react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Versi / sumber acuan', value: s.baseline ? `v${s.baseline.version} · ${s.baseline.source === 'assumption' ? 'Asumsi manual — belum divalidasi' : 'Catatan sebelum pemasangan'}` : 'Belum tersedia' }, { label: 'Periode acuan', value: s.baseline ? `${(0, format_1.monthLabel)(s.baseline.period)} · ${s.baseline.days} hari` : 'Belum tersedia' }, { label: 'Cakupan acuan', value: s.baseline ? `${s.baseline.zones.length} zona · ${s.baseline.area} m² tanam · ${s.baseline.crop}` : 'Belum tersedia' }, { label: 'Fase', value: s.baseline?.phase ?? 'Belum tersedia' }, { label: 'Normalisasi', value: s.baseline?.normalizedDaily ? 'Per hari, dipilih secara eksplisit oleh operator' : 'Tidak diterapkan otomatis' }, { label: 'Kategori belum dicatat', value: comp.missing.length ? comp.missing.join(', ') : 'Tidak ada pada fixture periode ini' }] }),
                react_1.default.createElement("details", { open: true },
                    react_1.default.createElement("summary", null, "Rumus & batas perbandingan"),
                    react_1.default.createElement("div", { className: "formula-box" },
                        react_1.default.createElement("p", null, "Selisih operasional bersih = acuan setara \u2212 biaya periode yang sebanding."),
                        react_1.default.createElement("p", null, "Persentase = selisih \u00F7 acuan setara \u00D7 100, hanya saat acuan > 0."),
                        react_1.default.createElement("p", null, "Listrik, internet, dan perawatan baru sudah termasuk biaya sesudah. Tidak dikurangkan lagi."))),
                react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Perubahan fase, musim, luas, tarif, atau produksi tidak otomatis setara dengan membagi biaya per hari. Data yang belum sebanding hanya menunjukkan selisih pengeluaran.")),
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Manfaat waktu", icon: "clock" },
                    react_1.default.createElement(ui_1.Empty, { title: "Waktu terbantu belum diisi", detail: "Jam kerja pemilik dipisahkan dari penghematan kas. Tidak dihitung ulang bila sudah tercermin dalam biaya tenaga dibayar." })),
                react_1.default.createElement(ui_1.Card, { title: "Investasi & balik modal", icon: "coins" },
                    react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Investasi tercatat periode', value: summary.investment ? (0, format_1.money)(summary.investment) : 'Belum ada pembelian tercatat' }, { label: 'Skenario balik modal', value: 'Belum dapat diperkirakan' }] }),
                    react_1.default.createElement("p", { className: "muted" }, "Rencana Rp2.860.000 bukan investasi yang sudah dibayar. Dibutuhkan investasi tambahan dan basis selisih bulanan yang memadai."),
                    react_1.default.createElement(ui_1.Button, { small: true, icon: "box", onClick: () => ctx.open('planner') }, "Buka rencana perangkat")),
                react_1.default.createElement(ui_1.Card, { title: "Kelola acuan" },
                    react_1.default.createElement("p", null, "Pengeluaran tetap bisa digunakan tanpa baseline. Penghematan tidak akan ditampilkan sebagai 0% saat acuan dihapus."),
                    react_1.default.createElement(ui_1.Button, { small: true, tone: "danger", icon: "trash", disabled: !s.baseline, onClick: () => ctx.open('remove-baseline') }, "Hapus acuan demo")))));
}

},
"features/devices/Devices":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceDetails = DeviceDetails;
exports.default = Devices;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const monitoring_1 = require("../../components/monitoring");
const ui_1 = require("../../components/ui");
const costs_1 = require("../../domain/costs");
const format_1 = require("../../domain/format");
const scheduler_1 = require("../../domain/scheduler");
const selectors_1 = require("../../domain/selectors");
const types = { camera: 'Kamera', sensor: 'Sensor', irrigation: 'Irigasi', nutrition: 'Nutrisi', environment: 'Lingkungan', controller: 'Controller' };
function DeviceDetails({ ctx, id }) {
    const { s } = ctx, d = s.devices.find(x => x.id === id);
    if (!d)
        return react_1.default.createElement(ui_1.Empty, { title: "Perangkat tidak ditemukan" });
    const period = ctx.query.get('period') ?? '2026-09', scope = { period, deviceId: id }, cost = (0, costs_1.costSummary)(s, scope), usage = (0, costs_1.deviceUsage)(s, id, period), tab = ctx.query.get('detailTab') ?? 'condition', related = s.routines.filter(r => r.version.requiredDevices.includes(id)), rows = (0, costs_1.expenseRows)(s, scope), ticket = s.maintenance.find(m => m.deviceId === id && m.status !== 'completed'), activity = (0, selectors_1.deviceActivity)(s, id);
    return react_1.default.createElement("div", { className: "detail-stack" },
        react_1.default.createElement("div", { className: "detail-device-head" },
            react_1.default.createElement("span", { className: "device-hero" },
                react_1.default.createElement(monitoring_1.DeviceSymbol, { device: d })),
            react_1.default.createElement("div", null,
                react_1.default.createElement("h2", null, d.label),
                react_1.default.createElement("p", null,
                    d.id,
                    " \u00B7 ",
                    d.zones.length > 1 ? 'Perangkat bersama' : `Zona ${d.zones[0] ?? '—'}`)),
            react_1.default.createElement(ui_1.Badge, { tone: d.connection === 'online' ? 'green' : d.connection === 'stale' ? 'amber' : 'red', dot: true }, d.connection === 'online' ? 'Online' : d.connection === 'stale' ? 'Data lama' : 'Offline')),
        react_1.default.createElement(ui_1.Tabs, { items: [{ id: 'condition', label: 'Kondisi' }, { id: 'usage', label: 'Pemakaian' }, { id: 'cost', label: 'Biaya terkait' }], value: tab, onChange: v => (0, context_1.updateQuery)(ctx, '/perangkat', { device: id, detailTab: v, period }) }),
        tab === 'condition' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Koneksi saat ini', value: 'Snapshot demo · ' + (0, format_1.dateLabel)(s.clock, true) }, { label: 'Zona', value: d.zones.join(', ') || 'Greenhouse' }, { label: 'Kalibrasi', value: d.calibrated ? 'Tervalidasi pada fixture' : 'Belum dikalibrasi / divalidasi' }, { label: 'Resource', value: d.resource ?? 'Independen' }, { label: 'Aktivitas', value: activity.label }, { label: 'Daya contoh', value: `${d.watts} W · estimasi` }, { label: 'Jadwal perawatan', value: (0, format_1.dateLabel)(d.nextMaintenance) }] }),
            d.type === 'camera' ? react_1.default.createElement(monitoring_1.CameraPreview, { s: s, deviceId: d.id }) : ['sensor', 'nutrition'].includes(d.type) && d.capabilities.some(c => ['temperature', 'media', 'flow', 'level', 'ec', 'ph'].includes(c)) ? react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: id }) : null,
            ticket && react_1.default.createElement(ui_1.Alert, { title: ticket.id + ' · ' + ticket.title, action: react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.open('maintenance', id, ticket.id) }, "Catat tindak lanjut") },
                ticket.operator ?? 'Belum ada petugas',
                " \u00B7 ",
                (0, format_1.dateLabel)(ticket.dueAt)),
            react_1.default.createElement("h3", null, "Digunakan oleh"),
            related.length ? react_1.default.createElement("div", { className: "link-list" }, related.map(r => react_1.default.createElement("button", { key: r.id, onClick: () => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`) },
                react_1.default.createElement(ui_1.Icon, { name: "workflow", size: 16 }),
                react_1.default.createElement("span", null,
                    r.name,
                    react_1.default.createElement("small", null,
                        "v",
                        r.version.number,
                        " \u00B7 ",
                        r.version.zones.join(', '))),
                react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 15 })))) : react_1.default.createElement("p", { className: "muted" }, "Perangkat observasi; tidak menjadi syarat aktuasi secara otomatis."),
            react_1.default.createElement("div", { className: "capability-list" }, d.capabilities.map(c => react_1.default.createElement("span", { key: c }, c))),
            react_1.default.createElement("div", { className: "button-row" },
                d.connection !== 'online' && react_1.default.createElement(ui_1.Button, { small: true, icon: "refresh", tone: "primary", onClick: () => ctx.act({ type: 'heal', id }) }, "Simulasikan pulih"),
                react_1.default.createElement(ui_1.Button, { small: true, icon: "wrench", onClick: () => ctx.open('maintenance', id) }, "Catat perawatan"),
                react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.open('maintenance-mode', id) }, d.maintenance ? 'Akhiri pemeliharaan' : 'Mode pemeliharaan')),
            react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.open('deactivate', id) }, d.active ? 'Nonaktifkan aset' : 'Aktifkan aset kembali')),
        tab === 'usage' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ui_1.Alert, { tone: "gray", title: `Pemakaian ${(0, format_1.monthLabel)(period)}` }, "Terpisah dari snapshot koneksi saat ini. Pemakaian tidak otomatis menjadi pembayaran."),
            react_1.default.createElement("div", { className: "mini-metrics" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", null, "Runtime"),
                    react_1.default.createElement("strong", null,
                        (0, format_1.num)(usage.seconds / 3600, 1),
                        " ",
                        react_1.default.createElement("small", null, "jam"))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("span", null, "Energi estimasi"),
                    react_1.default.createElement("strong", null,
                        (0, format_1.num)(usage.kwh, 1),
                        " ",
                        react_1.default.createElement("small", null, "kWh")))),
            usage.rows.length ? react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Sumber', value: period === '2026-09' ? 'Fixture histori September · versi rutinitas saat itu' : 'Feedback simulator pada periode ini' }, { label: 'Dasar energi', value: `${d.watts} W × durasi operasi` }, { label: 'Air', value: usage.water > 0 ? `${(0, format_1.num)(usage.water, 1)} L · ${usage.rows.some(u => u.waterSource === 'measured_demo') ? 'terukur demo' : 'estimasi'}` : 'Tidak ada volume terukur untuk histori ini' }, { label: 'Catatan penggunaan', value: usage.rows.length }] }),
                react_1.default.createElement("details", null,
                    react_1.default.createElement("summary", null,
                        "Lihat rincian runtime (",
                        usage.rows.length,
                        ")"),
                    react_1.default.createElement("div", { className: "table-scroll usage-history" },
                        react_1.default.createElement("table", null,
                            react_1.default.createElement("thead", null,
                                react_1.default.createElement("tr", null,
                                    react_1.default.createElement("th", null, "Tanggal"),
                                    react_1.default.createElement("th", null, "Run / versi"),
                                    react_1.default.createElement("th", null, "Runtime"))),
                            react_1.default.createElement("tbody", null, usage.rows.map(u => react_1.default.createElement("tr", { key: u.id },
                                react_1.default.createElement("td", null, (0, format_1.dateLabel)(u.at)),
                                react_1.default.createElement("td", null,
                                    u.runId,
                                    react_1.default.createElement("small", { className: "cell-sub" }, u.routineVersionId)),
                                react_1.default.createElement("td", null,
                                    (0, format_1.num)(u.seconds / 60),
                                    " menit")))))))) : react_1.default.createElement(ui_1.Empty, { title: "Belum ada catatan pemakaian", detail: "Tidak dianggap nol pemakaian untuk seluruh periode." }),
            react_1.default.createElement(ui_1.Button, { small: true, icon: "workflow", onClick: () => ctx.nav('/otomasi?tab=executions') }, "Lihat eksekusi otomasi")),
        tab === 'cost' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "period-note" },
                react_1.default.createElement(ui_1.Icon, { name: "calendar", size: 16 }),
                (0, format_1.monthLabel)(period),
                " \u00B7 biaya mengikuti periode, bukan koneksi saat ini"),
            react_1.default.createElement("div", { className: "cost-total" },
                react_1.default.createElement("span", null, "Biaya terkait perangkat"),
                react_1.default.createElement("strong", null, rows.length ? (0, format_1.money)(cost.total) : 'Belum tercatat'),
                react_1.default.createElement(ui_1.SourceTag, null, "Tercatat + alokasi, bukan tagihan tambahan")),
            rows.map(row => react_1.default.createElement("button", { className: "expense-source", key: row.record.id, onClick: () => ctx.open('expense-detail', row.record.id, id) },
                react_1.default.createElement("span", { className: "soft-icon" },
                    react_1.default.createElement(ui_1.Icon, { name: row.record.category === 'Listrik' ? 'bolt' : 'wrench' })),
                react_1.default.createElement("span", { className: "grow" },
                    react_1.default.createElement("strong", null, row.record.category === 'Listrik' ? 'Alokasi tagihan listrik' : row.record.note),
                    react_1.default.createElement("small", null,
                        row.record.id,
                        " \u00B7 ",
                        (0, format_1.dateLabel)(row.record.paidAt)),
                    react_1.default.createElement(ui_1.SourceTag, null, row.source)),
                react_1.default.createElement("strong", null, (0, format_1.money)(row.amount)),
                react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 16 }))),
            id === 'PUMP-01' && period === '2026-09' && react_1.default.createElement(ui_1.Alert, { tone: "gray", title: "30 jam \u00D7 900 W = 27 kWh estimasi" }, "Bagian pompa 30% dari tagihan 90 kWh: Rp40.500. Servis Rp45.000. Tagihan greenhouse tetap Rp135.000, tidak dihitung dua kali."),
            !rows.length && react_1.default.createElement(ui_1.Empty, { title: "Belum ada pengeluaran terkait", detail: "Biaya tingkat greenhouse tidak dibebankan penuh ke perangkat tanpa alokasi." }),
            react_1.default.createElement("div", { className: "button-row" },
                react_1.default.createElement(ui_1.Button, { small: true, tone: "primary", icon: "wallet", onClick: () => ctx.nav(`/biaya?tab=expenses&period=${period}&device=${id}`) }, "Lihat pengeluaran"),
                react_1.default.createElement(ui_1.Button, { small: true, icon: "plus", onClick: () => ctx.open('maintenance', id) }, "Catat perawatan")),
            d.acquiredAmount !== undefined && react_1.default.createElement("p", { className: "micro muted" },
                "Harga perolehan: ",
                (0, format_1.money)(d.acquiredAmount),
                " \u00B7 bukan biaya rutin periode.")));
}
function Devices({ ctx }) {
    const { s } = ctx, tab = ctx.query.get('tab') ?? 'inventory', period = ctx.query.get('period') ?? '2026-09', search = ctx.query.get('search') ?? '', group = ctx.query.get('group') ?? 'all', status = ctx.query.get('status') ?? 'all', zone = ctx.query.get('zone') ?? 'all';
    const devices = (0, scheduler_1.availableDevices)(s), filtered = devices.filter(d => (group === 'all' || group === 'observation' ? group === 'all' || ['camera', 'sensor'].includes(d.type) : d.type === group) && (status === 'all' || d.connection === status) && (zone === 'all' || d.zones.includes(zone)) && `${d.id} ${d.label}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.id === 'PUMP-01' ? -1 : b.id === 'PUMP-01' ? 1 : a.id.localeCompare(b.id)), selected = ctx.query.get('device') ?? 'PUMP-01', page = Math.max(1, Number(ctx.query.get('page') ?? 1)), shown = filtered.slice((page - 1) * 10, page * 10), camera = ctx.query.get('camera') ?? 'CAM-B-02', tickets = s.maintenance.filter(m => zone === 'all' || s.devices.find(d => d.id === m.deviceId)?.zones.includes(zone));
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement(ui_1.Stats, null,
            react_1.default.createElement(ui_1.Stat, { icon: "devices", label: "Perangkat terpasang", value: devices.length, sub: `${s.profile === 'automation' ? '12 observasi + 13 otomasi' : 'Profil monitoring saja'}` }),
            react_1.default.createElement(ui_1.Stat, { icon: "wifi", label: "Online", value: `${devices.filter(d => d.connection === 'online').length}/${devices.length}`, sub: "Koneksi snapshot waktu demo" }),
            react_1.default.createElement(ui_1.Stat, { icon: "alert", tone: "amber", label: "Perlu diperiksa", value: devices.filter(d => d.connection !== 'online' || !d.calibrated).length, sub: "Koneksi atau validasi pemasangan" }),
            react_1.default.createElement(ui_1.Stat, { icon: "wrench", label: "Tugas perawatan", value: s.maintenance.filter(m => m.status !== 'completed').length, sub: "Menunggu tindakan petugas" })),
        react_1.default.createElement(ui_1.Tabs, { items: [{ id: 'inventory', label: 'Inventaris' }, { id: 'cameras', label: 'Kamera & sensor' }, { id: 'maintenance', label: 'Pemeliharaan' }], value: tab, onChange: v => (0, context_1.updateQuery)(ctx, '/perangkat', { tab: v, page: undefined }) }),
        react_1.default.createElement("div", { className: "filter-bar" },
            react_1.default.createElement(ui_1.SearchField, { value: search, onChange: v => (0, context_1.updateQuery)(ctx, '/perangkat', { search: v, page: undefined }), placeholder: "Cari nama atau ID perangkat\u2026" }),
            react_1.default.createElement(ui_1.Select, { label: "Zona perangkat", value: zone, onChange: v => (0, context_1.updateQuery)(ctx, '/perangkat', { zone: v, page: undefined }), options: [{ value: 'all', label: 'Semua zona' }, ...s.zones.map(z => ({ value: z.id, label: z.name }))] }),
            react_1.default.createElement(ui_1.Select, { label: "Periode biaya perangkat", value: period, onChange: v => (0, context_1.updateQuery)(ctx, '/perangkat', { period: v }), options: [{ value: '2026-09', label: 'Biaya: September 2026' }, { value: '2026-10', label: 'Biaya: Oktober 2026' }] }),
            react_1.default.createElement("span", { className: "micro muted" },
                "Status ",
                (0, format_1.dateLabel)(s.clock),
                " \u00B7 biaya ",
                (0, format_1.monthLabel)(period))),
        tab === 'inventory' && react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "devices-layout" },
                react_1.default.createElement(ui_1.Card, { title: "Inventaris perangkat", subtitle: `${filtered.length} perangkat sesuai filter`, tools: react_1.default.createElement(ui_1.Select, { label: "Jenis perangkat", value: group, onChange: v => (0, context_1.updateQuery)(ctx, '/perangkat', { group: v, page: undefined }), options: [{ value: 'all', label: 'Semua jenis' }, { value: 'observation', label: 'Kamera & suhu/RH' }, ...Object.entries(types).map(([value, label]) => ({ value, label }))] }) },
                    react_1.default.createElement("div", { className: "table-scroll" },
                        react_1.default.createElement("table", null,
                            react_1.default.createElement("thead", null,
                                react_1.default.createElement("tr", null,
                                    react_1.default.createElement("th", null, "Perangkat"),
                                    react_1.default.createElement("th", null, "Zona"),
                                    react_1.default.createElement("th", null, "Status"),
                                    react_1.default.createElement("th", null, "Biaya terkait periode"),
                                    react_1.default.createElement("th", null))),
                            react_1.default.createElement("tbody", null, shown.map(d => {
                                const rows = (0, costs_1.expenseRows)(s, { period, deviceId: d.id });
                                return react_1.default.createElement("tr", { key: d.id, className: selected === d.id ? 'selected' : '' },
                                    react_1.default.createElement("td", null,
                                        react_1.default.createElement("button", { className: "device-name", onClick: () => {
                                                (0, context_1.updateQuery)(ctx, '/perangkat', { device: d.id });
                                                if (ctx.mobile)
                                                    ctx.open('device-detail', d.id);
                                            } },
                                            react_1.default.createElement("span", { className: "soft-icon" },
                                                react_1.default.createElement(monitoring_1.DeviceSymbol, { device: d })),
                                            react_1.default.createElement("span", null,
                                                react_1.default.createElement("strong", null, d.label),
                                                react_1.default.createElement("small", null,
                                                    d.id,
                                                    " \u00B7 ",
                                                    types[d.type])))),
                                    react_1.default.createElement("td", null, d.zones.length > 2 ? 'Semua zona' : d.zones.join(', ')),
                                    react_1.default.createElement("td", null,
                                        react_1.default.createElement(ui_1.Badge, { tone: d.connection === 'online' ? 'green' : d.connection === 'stale' ? 'amber' : 'red', dot: true }, d.connection === 'online' ? 'Online' : d.connection === 'stale' ? 'Data lama' : 'Offline'),
                                        d.maintenance && react_1.default.createElement("small", { className: "cell-sub" }, "Pemeliharaan")),
                                    react_1.default.createElement("td", null,
                                        react_1.default.createElement("strong", null, rows.length ? (0, format_1.money)(rows.reduce((t, r) => t + r.amount, 0)) : 'Belum tercatat'),
                                        react_1.default.createElement("small", { className: "cell-sub" }, rows.some(r => r.source === 'Alokasi') ? 'Tercatat / alokasi' : rows.length ? 'Tercatat' : 'Tidak dianggap Rp0')),
                                    react_1.default.createElement("td", null,
                                        react_1.default.createElement(ui_1.Button, { small: true, icon: "chevron", tone: "ghost", ariaLabel: `Detail ${d.id}`, onClick: () => {
                                                (0, context_1.updateQuery)(ctx, '/perangkat', { device: d.id });
                                                if (ctx.mobile)
                                                    ctx.open('device-detail', d.id);
                                            } })));
                            })))),
                    !shown.length && react_1.default.createElement(ui_1.Empty, { title: "Tidak ada perangkat sesuai filter", action: react_1.default.createElement(ui_1.Button, { onClick: () => ctx.nav('/perangkat') }, "Hapus filter") }),
                    react_1.default.createElement("div", { className: "table-footer" },
                        react_1.default.createElement("span", null,
                            filtered.length ? `${(page - 1) * 10 + 1}–${Math.min(page * 10, filtered.length)}` : '0',
                            " dari ",
                            filtered.length,
                            " perangkat"),
                        react_1.default.createElement("div", { className: "button-row" },
                            react_1.default.createElement(ui_1.Button, { small: true, disabled: page <= 1, onClick: () => (0, context_1.updateQuery)(ctx, '/perangkat', { page: String(page - 1) }) }, "Sebelumnya"),
                            react_1.default.createElement(ui_1.Button, { small: true, disabled: page * 10 >= filtered.length, onClick: () => (0, context_1.updateQuery)(ctx, '/perangkat', { page: String(page + 1) }) }, "Berikutnya")))),
                react_1.default.createElement(ui_1.Card, { className: "inspector desktop-detail" },
                    react_1.default.createElement(DeviceDetails, { ctx: ctx, id: selected }))),
            react_1.default.createElement(ui_1.Alert, { tone: "gray", title: "Satu perangkat, satu sumber catatan" }, "Biaya perawatan dan alokasi diambil dari pengeluaran yang sama. Pembelian perangkat lama tidak dimasukkan kembali sebagai pengeluaran baru.")),
        tab === 'cameras' && react_1.default.createElement("div", { className: "camera-layout" },
            react_1.default.createElement(ui_1.Card, { title: "Kamera monitoring", subtitle: "Rekaman ilustratif dari aset desain \u00B7 bukan stream langsung" },
                react_1.default.createElement(monitoring_1.CameraPreview, { s: s, deviceId: camera }),
                react_1.default.createElement("div", { className: "camera-picker" }, devices.filter(d => d.type === 'camera' && (zone === 'all' || d.zones.includes(zone))).map(d => react_1.default.createElement("button", { key: d.id, className: camera === d.id ? 'selected' : '', onClick: () => (0, context_1.updateQuery)(ctx, '/perangkat', { camera: d.id }) },
                    react_1.default.createElement(ui_1.Icon, { name: "camera" }),
                    react_1.default.createElement("strong", null, d.id.replace('CAM-', '')),
                    react_1.default.createElement("small", null,
                        "Zona ",
                        d.zones[0]),
                    react_1.default.createElement(ui_1.Badge, { tone: d.connection === 'online' ? 'green' : 'red' }, d.connection === 'online' ? 'Online' : 'Offline')))),
                react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Video MP4/WebM belum tersedia pada arsip. Poster digunakan tanpa badge LIVE dan tanpa snapshot palsu.")),
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Kondisi lingkungan", subtitle: `Zona ${zone === 'all' ? 'B' : zone}`, icon: "temp" },
                    react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: `TH-${zone === 'all' ? 'B' : zone}-01` }),
                    react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: `TH-${zone === 'all' ? 'B' : zone}-01`, humidity: true })),
                react_1.default.createElement(ui_1.Card, { title: "Sensor budidaya", subtitle: "Tersedia sesuai kemampuan perangkat" },
                    react_1.default.createElement("div", { className: "sensor-grid" },
                        react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "MEDIA-A", compact: true }),
                        react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "LEVEL-01", compact: true }),
                        react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "EC-01", compact: true }),
                        react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "PH-01", compact: true }))))),
        tab === 'maintenance' && react_1.default.createElement(ui_1.Card, { title: "Perawatan & tindak lanjut", subtitle: "Pekerjaan tidak dianggap selesai hanya karena jadwalnya lewat.", tools: react_1.default.createElement(ui_1.Button, { small: true, icon: "plus", onClick: () => ctx.open('maintenance', 'PUMP-01') }, "Catat perawatan") },
            react_1.default.createElement("div", { className: "table-scroll" },
                react_1.default.createElement("table", null,
                    react_1.default.createElement("thead", null,
                        react_1.default.createElement("tr", null,
                            react_1.default.createElement("th", null, "Tiket / pekerjaan"),
                            react_1.default.createElement("th", null, "Perangkat"),
                            react_1.default.createElement("th", null, "Petugas"),
                            react_1.default.createElement("th", null, "Jadwal"),
                            react_1.default.createElement("th", null, "Status"),
                            react_1.default.createElement("th", null))),
                    react_1.default.createElement("tbody", null, tickets.filter(m => `${m.id} ${m.title}`.toLowerCase().includes(search.toLowerCase())).map(m => react_1.default.createElement("tr", { key: m.id },
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("strong", null, m.title),
                            react_1.default.createElement("small", { className: "cell-sub" }, m.id)),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement("button", { className: "text-link", onClick: () => ctx.nav(`/perangkat?device=${m.deviceId}&period=${period}`) }, m.deviceId)),
                        react_1.default.createElement("td", null, m.operator ?? 'Belum ditugaskan'),
                        react_1.default.createElement("td", null, (0, format_1.dateLabel)(m.dueAt)),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement(ui_1.Badge, { tone: m.status === 'completed' ? 'green' : 'amber' }, m.status === 'completed' ? 'Selesai' : m.status === 'scheduled' ? 'Terjadwal' : 'Terbuka'),
                            m.expenseId && react_1.default.createElement("button", { className: "cell-sub text-link", onClick: () => ctx.open('expense-detail', m.expenseId) }, m.expenseId)),
                        react_1.default.createElement("td", null,
                            react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.open('maintenance', m.deviceId, m.id) }, "Tindak lanjut")))))))));
}

},
"features/greenhouse/Greenhouse":function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneMap = ZoneMap;
exports.ZoneDetails = ZoneDetails;
exports.Greenhouse = Greenhouse;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const charts_1 = require("../../components/charts");
const monitoring_1 = require("../../components/monitoring");
const ui_1 = require("../../components/ui");
const format_1 = require("../../domain/format");
const selectors_1 = require("../../domain/selectors");
const Scene = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('./Scene'))));
class SceneBoundary extends react_1.default.Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function ZoneMap({ s, selected, onSelect, layer = 'coverage' }) {
    const running = s.runs.some(r => (0, format_1.isActiveRun)(r.status) && r.resource === 'PUMP-01');
    return react_1.default.createElement("div", { className: "zone-map" },
        react_1.default.createElement("svg", { viewBox: "0 0 760 480", role: "img", "aria-label": "Diagram greenhouse enam zona A sampai F. Pilih zona dengan klik atau keyboard." },
            react_1.default.createElement("defs", null,
                react_1.default.createElement("pattern", { id: "floor-grid", width: "24", height: "24", patternUnits: "userSpaceOnUse" },
                    react_1.default.createElement("path", { d: "M 24 0 L 0 0 0 24", fill: "none", stroke: "#dce4d5", strokeWidth: "0.6" })),
                react_1.default.createElement("pattern", { id: "unvalidated", width: "8", height: "8", patternUnits: "userSpaceOnUse" },
                    react_1.default.createElement("path", { d: "M0 8L8 0", stroke: "#d9ddd5", strokeWidth: "1" }))),
            react_1.default.createElement("rect", { x: "18", y: "12", width: "724", height: "441", rx: "23", fill: "#eef1e7" }),
            react_1.default.createElement("rect", { x: "31", y: "24", width: "698", height: "415", rx: "16", fill: "url(#floor-grid)", stroke: "#c9d4c1" }),
            react_1.default.createElement("path", { d: "M40 225 H720", stroke: "#fbfcf7", strokeWidth: "32" }),
            react_1.default.createElement("path", { d: "M255 36V421M491 36V421", stroke: "#fbfcf7", strokeWidth: "27" }),
            react_1.default.createElement("text", { x: "47", y: "48", className: "map-label" }, "GREENHOUSE 01"),
            react_1.default.createElement("text", { x: "698", y: "48", textAnchor: "end", className: "map-label" }, "UTARA \u2191"),
            s.zones.map((z, i) => {
                const x = 58 + (i % 3) * 232, y = i < 3 ? 70 : 263;
                const st = (0, selectors_1.zoneStatus)(s, z.id), selectedZone = z.id === selected, bad = !z.validated || st.tone === 'amber';
                const tone = layer === 'temperature' ? (z.validated ? '#daead2' : '#e6e8e0') : layer === 'pests' ? (s.cases.some(c => c.zoneId === z.id && c.status === 'inspection') ? '#f7dfad' : '#dbe7cf') : (bad ? '#ececdb' : '#dbe7cf');
                return react_1.default.createElement("g", { key: z.id, className: "map-zone", tabIndex: 0, role: "button", "aria-label": `${z.name}: ${st.label}`, "aria-pressed": selectedZone, onClick: () => onSelect(z.id), onKeyDown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(z.id);
                        }
                    } },
                    react_1.default.createElement("rect", { x: x - 4, y: y - 4, width: "194", height: "150", rx: "12", fill: selectedZone ? '#d8e7ca' : '#f9fbf5', stroke: selectedZone ? '#244735' : '#c5d0bf', strokeWidth: selectedZone ? 2.5 : 1 }),
                    react_1.default.createElement("rect", { x: x + 4, y: y + 4, width: "178", height: "90", rx: "6", fill: tone }),
                    !z.validated && react_1.default.createElement("rect", { x: x + 4, y: y + 4, width: "178", height: "90", rx: "6", fill: "url(#unvalidated)" }),
                    Array.from({ length: 12 }, (_, j) => react_1.default.createElement("g", { key: j, transform: `translate(${x + 24 + (j % 6) * 27},${y + 28 + Math.floor(j / 6) * 43})`, opacity: z.validated ? 1 : 0.5 },
                        react_1.default.createElement("ellipse", { cx: "-3", cy: "0", rx: "7", ry: "12", transform: "rotate(-32)", fill: z.id === 'B' ? '#8daa62' : '#709b57' }),
                        react_1.default.createElement("ellipse", { cx: "5", cy: "-1", rx: "6", ry: "11", transform: "rotate(30)", fill: "#9cb876" }),
                        react_1.default.createElement("circle", { cx: "0", cy: "1", r: "2.7", fill: j % 3 === 0 ? '#c56e46' : '#bad28e' }))),
                    react_1.default.createElement("rect", { x: x + 12, y: y + 103, width: "66", height: "26", rx: "7", fill: selectedZone ? '#244735' : 'white' }),
                    react_1.default.createElement("text", { x: x + 45, y: y + 121, textAnchor: "middle", fill: selectedZone ? 'white' : '#244735', fontWeight: "650", fontSize: "13" },
                        "Zona ",
                        z.id),
                    react_1.default.createElement("text", { x: x + 172, y: y + 119, textAnchor: "end", fill: "#6e7e65", fontSize: "12" }, layer === 'temperature' ? `${z.temperature.toString().replace('.', ',')} °C` : '72 tanaman'),
                    react_1.default.createElement("circle", { cx: x + 164, cy: y + 16, r: "10", fill: z.id === 'E' && st.tone === 'amber' ? '#fcf0d5' : '#f7fbf3', stroke: "#b8c9aa" }),
                    react_1.default.createElement("rect", { x: x + 159, y: y + 13, width: "8", height: "6", rx: "1.5", fill: z.id === 'E' && st.tone === 'amber' ? '#c69334' : '#547745' }),
                    react_1.default.createElement("path", { d: `M${x + 167} ${y + 14}l3 -1v6l-3 -1`, fill: "#547745" }),
                    s.runs.some(r => (0, format_1.isActiveRun)(r.status) && r.currentZone === z.id) && react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("circle", { cx: x + 176, cy: y + 121, r: "4", fill: "#2b805b" }),
                        react_1.default.createElement("text", { x: x + 18, y: y - 13, fontSize: "11", fill: "#244735" }, "\u25CF Rutinitas berjalan")));
            }),
            react_1.default.createElement("path", { className: running ? 'map-pipe running' : 'map-pipe', d: "M144 436V451H378V241H151V214M378 241V214", fill: "none" }),
            react_1.default.createElement("rect", { x: "284", y: "214", width: "178", height: "29", rx: "9", fill: "white", stroke: "#d5dfcd" }),
            react_1.default.createElement("circle", { cx: "301", cy: "228", r: "5", fill: running ? '#588f5a' : '#b9c6b2' }),
            react_1.default.createElement("text", { x: "316", y: "233", fontSize: "11", fill: "#53654b" },
                "PUMP-01 \u00B7 ",
                running ? 'Digunakan' : 'Siaga',
                " \u00B7 A\u2013B"),
            react_1.default.createElement("text", { x: "380", y: "473", textAnchor: "middle", fontSize: "11", fill: "#88947f" }, "Diagram skematik \u00B7 bukan skala konstruksi")));
}
function ZoneDetails({ ctx, id }) {
    const { s } = ctx, z = s.zones.find(z => z.id === id);
    if (!z)
        return null;
    const st = (0, selectors_1.zoneStatus)(s, id), camera = s.devices.find(d => d.type === 'camera' && d.zones.includes(id)), c = s.cases.find(c => c.zoneId === id && c.status !== 'closed');
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "detail-title" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("span", { className: "eyebrow" }, "DETAIL ZONA"),
                react_1.default.createElement("h2", null,
                    "Zona ",
                    id),
                react_1.default.createElement("p", null, "Paprika merah \u00B7 fase berbuah")),
            react_1.default.createElement("span", { className: "plant-detail-icon" },
                react_1.default.createElement(ui_1.Icon, { name: "greenhouse", size: 32 }))),
        react_1.default.createElement(ui_1.Badge, { tone: st.tone, dot: true }, st.label),
        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Luas tanam', value: '48 m²' }, { label: 'Tanaman tercatat', value: '72 tanaman' }, { label: 'Tanggal tanam', value: '10 Agustus 2026' }, { label: 'Siklus tanam', value: s.cycle.id }] }),
        react_1.default.createElement("div", { className: "two-sensors" },
            react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: `TH-${id}-01`, compact: true }),
            react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: `TH-${id}-01`, humidity: true, compact: true })),
        camera && react_1.default.createElement(monitoring_1.CameraPreview, { s: s, deviceId: camera.id, compact: true, onDetails: () => ctx.nav(`/perangkat?device=${camera.id}`) }),
        react_1.default.createElement("div", { className: "linked-items" },
            c && react_1.default.createElement("button", { onClick: () => ctx.nav(`/hama?case=${c.id}`) },
                react_1.default.createElement(ui_1.Icon, { name: "bug", size: 15 }),
                c.id,
                " \u00B7 ",
                c.status === 'inspection' ? 'Perlu inspeksi' : 'Dipantau',
                react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 })),
            id === 'E' && react_1.default.createElement("button", { onClick: () => ctx.nav('/perangkat?device=CAM-E-01') },
                react_1.default.createElement(ui_1.Icon, { name: "wrench", size: 15 }),
                "DEV-008 \u00B7 Kamera E-01",
                react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 }))),
        !z.validated && react_1.default.createElement(ui_1.Alert, { title: "Validasi pengamatan diperlukan" },
            "Perangkat online saja belum cukup. Konfirmasi pemasangan dan kualitas data.",
            react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.open('validate-zone', id) }, "Tinjau pemasangan")),
        react_1.default.createElement("div", null,
            react_1.default.createElement("h3", null, "Rutinitas zona"),
            s.routines.filter(r => r.version.zones.includes(id)).slice(0, 3).map(r => react_1.default.createElement("button", { className: "plain-row", key: r.id, onClick: () => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`) },
                react_1.default.createElement("span", null,
                    r.name,
                    react_1.default.createElement("small", null, r.status === 'Active' ? 'Aktif' : r.status === 'Paused' ? 'Dijeda' : 'Perlu ditinjau')),
                react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 14 }))),
            !s.routines.some(r => r.version.zones.includes(id)) && react_1.default.createElement("p", { className: "micro muted" }, "Belum ada aktuator atau rutinitas untuk zona ini.")),
        react_1.default.createElement(ui_1.Button, { className: "full-width", icon: "devices", onClick: () => ctx.nav(`/perangkat?zone=${id}`) }, "Lihat perangkat zona"));
}
function Greenhouse(ctx) {
    const { s } = ctx, selected = (ctx.query.get('zone') ?? 'B'), layer = ctx.query.get('layer') ?? 'coverage', view = ctx.query.get('view') ?? (ctx.mobile || (0, charts_1.isPortable)() ? '2d' : '3d');
    const select = (id) => {
        (0, context_1.updateQuery)(ctx, '/greenhouse', { zone: id });
        if (ctx.mobile)
            ctx.open('zone-detail', id);
    };
    const map = react_1.default.createElement(ZoneMap, { s: s, selected: selected, onSelect: select, layer: layer });
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "farm-summary card" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("span", { className: "big-soft-icon" },
                    react_1.default.createElement(ui_1.Icon, { name: "greenhouse", size: 27 })),
                react_1.default.createElement("span", null,
                    react_1.default.createElement("strong", null, "Kebun Bogor / Greenhouse 01"),
                    react_1.default.createElement("small", null, "Paprika merah \u00B7 fase berbuah"))),
            react_1.default.createElement("div", null,
                react_1.default.createElement(ui_1.Icon, { name: "grid" }),
                react_1.default.createElement("span", null,
                    react_1.default.createElement("small", null, "Luas total"),
                    react_1.default.createElement("strong", null, "360 m\u00B2"))),
            react_1.default.createElement("div", null,
                react_1.default.createElement(ui_1.Icon, { name: "leaf" }),
                react_1.default.createElement("span", null,
                    react_1.default.createElement("small", null, "Luas tanam"),
                    react_1.default.createElement("strong", null, "288 m\u00B2"))),
            react_1.default.createElement("div", null,
                react_1.default.createElement(ui_1.Icon, { name: "greenhouse" }),
                react_1.default.createElement("span", null,
                    react_1.default.createElement("small", null, "Tanaman"),
                    react_1.default.createElement("strong", null, "432"))),
            react_1.default.createElement(ui_1.SourceTag, null, s.cycle.id)),
        react_1.default.createElement("div", { className: "greenhouse-layout" },
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Denah greenhouse", icon: "layers", tools: react_1.default.createElement("div", { className: "button-row" },
                        react_1.default.createElement("div", { className: "segmented" },
                            react_1.default.createElement("button", { className: view === '2d' ? 'active' : '', onClick: () => (0, context_1.updateQuery)(ctx, '/greenhouse', { view: '2d' }) }, "2D"),
                            react_1.default.createElement("button", { className: view === '3d' ? 'active' : '', onClick: () => (0, context_1.updateQuery)(ctx, '/greenhouse', { view: '3d' }) }, "3D")),
                        react_1.default.createElement(ui_1.Button, { small: true, icon: "refresh", ariaLabel: "Reset kamera", onClick: () => (0, context_1.updateQuery)(ctx, '/greenhouse', { reset: String(Number(ctx.query.get('reset') ?? 0) + 1) }) })) },
                    react_1.default.createElement("div", { className: "map-toolbar" },
                        react_1.default.createElement("div", { className: "layer-pills" }, [{ id: 'coverage', label: 'Monitoring', icon: 'eye' }, { id: 'pests', label: 'Temuan hama', icon: 'bug' }, { id: 'temperature', label: 'Suhu', icon: 'temp' }].map(x => react_1.default.createElement("button", { className: layer === x.id ? 'active' : '', key: x.id, onClick: () => (0, context_1.updateQuery)(ctx, '/greenhouse', { layer: x.id }) },
                            react_1.default.createElement(ui_1.Icon, { name: x.icon, size: 14 }),
                            x.label))),
                        react_1.default.createElement(ui_1.SourceTag, null, "Model skematik")),
                    view === '3d' && !(0, charts_1.isPortable)() ? react_1.default.createElement(SceneBoundary, { key: ctx.query.get('reset') ?? '0', fallback: react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "WebGL tidak tersedia. Diagram 2D tetap dapat digunakan."),
                            map) },
                        react_1.default.createElement(react_1.default.Suspense, { fallback: react_1.default.createElement("div", { className: "scene-loading" },
                                react_1.default.createElement("span", { className: "loader" }),
                                "Memuat model skematik\u2026") },
                            react_1.default.createElement(Scene, { s: s, selected: selected, onSelect: select, layer: layer }))) : react_1.default.createElement(react_1.default.Fragment, null,
                        view === '3d' && react_1.default.createElement(ui_1.Alert, { tone: "blue" }, "Preview portabel menggunakan diagram 2D. Scene Three.js tersedia pada source React/Vite setelah dependensi dipasang."),
                        map),
                    react_1.default.createElement("div", { className: "map-legend" },
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("i", { className: "green" }),
                            "Terpantau"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("i", { className: "amber" }),
                            "Perlu perhatian"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("i", { className: "gray" }),
                            "Belum tervalidasi"),
                        react_1.default.createElement("small", null, layer === 'temperature' ? 'Suhu fixture, bukan penilaian kesehatan.' : 'Pilih zona untuk melihat perangkat & tindak lanjut.'))),
                react_1.default.createElement(ui_1.Card, { title: "Daftar zona", subtitle: "Enam zona, satu sumber data monitoring.", tools: react_1.default.createElement("span", { className: "micro muted" },
                        "Dipilih: Zona ",
                        selected) },
                    react_1.default.createElement("div", { className: "table-scroll" },
                        react_1.default.createElement("table", null,
                            react_1.default.createElement("thead", null,
                                react_1.default.createElement("tr", null,
                                    react_1.default.createElement("th", null, "Zona"),
                                    react_1.default.createElement("th", null, "Tanaman"),
                                    react_1.default.createElement("th", null, "Monitoring"),
                                    react_1.default.createElement("th", null, "Perangkat observasi"),
                                    react_1.default.createElement("th", null))),
                            react_1.default.createElement("tbody", null, s.zones.map(z => { const st = (0, selectors_1.zoneStatus)(s, z.id); return react_1.default.createElement("tr", { className: selected === z.id ? 'selected' : '', key: z.id },
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement("button", { className: "text-link", onClick: () => select(z.id) }, z.name)),
                                react_1.default.createElement("td", null,
                                    z.plants,
                                    " \u00B7 ",
                                    z.area,
                                    " m\u00B2"),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(ui_1.Badge, { tone: st.tone, dot: true }, st.label)),
                                react_1.default.createElement("td", null,
                                    s.devices.filter(d => d.zones.includes(z.id) && ['camera', 'sensor'].includes(d.type) && d.connection === 'online').length,
                                    " / 2 online"),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "chevron", ariaLabel: `Detail Zona ${z.id}`, onClick: () => select(z.id) }))); })))))),
            react_1.default.createElement(ui_1.Card, { className: "inspector desktop-detail" },
                react_1.default.createElement(ZoneDetails, { ctx: ctx, id: selected }))));
}

},
"features/greenhouse/Scene":function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Scene;
const drei_1 = require("@react-three/drei");
const fiber_1 = require("@react-three/fiber");
const react_1 = __importStar(require("react"));
const THREE = __importStar(require("three"));
const format_1 = require("../../domain/format");
const selectors_1 = require("../../domain/selectors");
function Plants() {
    const ref = (0, react_1.useRef)(null);
    const geometry = (0, react_1.useMemo)(() => new THREE.ConeGeometry(.16, .45, 5), []);
    const material = (0, react_1.useMemo)(() => new THREE.MeshStandardMaterial({ color: '#88a863', roughness: 1 }), []);
    (0, react_1.useLayoutEffect)(() => {
        if (!ref.current)
            return;
        const temp = new THREE.Object3D();
        let k = 0;
        for (let bed = 0; bed < 6; bed++)
            for (let j = 0; j < 12; j++) {
                temp.position.set((bed % 3 - 1) * 3 + (j % 4 - .5 * 3) * .52, .56, (Math.floor(bed / 3) - .5) * 4 + (Math.floor(j / 4) - 1) * .72);
                temp.updateMatrix();
                ref.current.setMatrixAt(k++, temp.matrix);
            }
        ref.current.instanceMatrix.needsUpdate = true;
        return () => { geometry.dispose(); material.dispose(); };
    }, [geometry, material]);
    return react_1.default.createElement("instancedMesh", { ref: ref, args: [geometry, material, 72] });
}
function Model({ s, selected, onSelect, layer }) { return react_1.default.createElement(react_1.default.Fragment, null,
    react_1.default.createElement("ambientLight", { intensity: 1.3 }),
    react_1.default.createElement("directionalLight", { position: [4, 10, 6], intensity: 2 }),
    react_1.default.createElement("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, -.04, 0] },
        react_1.default.createElement("planeGeometry", { args: [13, 11] }),
        react_1.default.createElement("meshStandardMaterial", { color: "#e4e7da" })),
    react_1.default.createElement("gridHelper", { args: [12, 24, '#ccd7be', '#dbe1d2'], position: [0, -.025, 0] }),
    s.zones.map((z, i) => { const x = (i % 3 - 1) * 3, y = (Math.floor(i / 3) - .5) * 4, st = (0, selectors_1.zoneStatus)(s, z.id); const selectedZone = z.id === selected, color = selectedZone ? '#b1c78c' : st.tone === 'amber' ? '#d8ca96' : !z.validated ? '#bdc3b4' : '#9eb57e'; return react_1.default.createElement("group", { key: z.id, position: [x, 0, y] },
        react_1.default.createElement("mesh", { position: [0, .13, 0], onClick: () => onSelect(z.id) },
            react_1.default.createElement("boxGeometry", { args: [2.45, .26, 3.0] }),
            react_1.default.createElement("meshStandardMaterial", { color: color })),
        react_1.default.createElement("mesh", { position: [0, .275, 0] },
            react_1.default.createElement("boxGeometry", { args: [2.2, .05, 2.75] }),
            react_1.default.createElement("meshStandardMaterial", { color: "#807858" })),
        react_1.default.createElement(drei_1.Html, { center: true, position: [0, .95, 0], distanceFactor: 14 },
            react_1.default.createElement("button", { className: `scene-zone-label ${selectedZone ? 'selected' : ''}`, onClick: () => onSelect(z.id) },
                "Zona ",
                z.id,
                react_1.default.createElement("small", null, layer === 'temperature' ? `${z.temperature} °C` : st.label)))); }),
    react_1.default.createElement(Plants, null),
    [-5, 5].map(x => [-4, 0, 4].map(z => react_1.default.createElement("mesh", { key: `${x}-${z}`, position: [x, 1.8, z] },
        react_1.default.createElement("cylinderGeometry", { args: [.035, .035, 3.6, 6] }),
        react_1.default.createElement("meshStandardMaterial", { color: "#8c9c8b" })))),
    [-4, 0, 4].map(z => react_1.default.createElement("group", { key: z },
        react_1.default.createElement("mesh", { position: [-2.5, 4.1, z], rotation: [0, 0, -.18] },
            react_1.default.createElement("boxGeometry", { args: [5.1, .065, .065] }),
            react_1.default.createElement("meshStandardMaterial", { color: "#8c9c8b" })),
        react_1.default.createElement("mesh", { position: [2.5, 4.1, z], rotation: [0, 0, .18] },
            react_1.default.createElement("boxGeometry", { args: [5.1, .065, .065] }),
            react_1.default.createElement("meshStandardMaterial", { color: "#8c9c8b" })))),
    react_1.default.createElement("mesh", { position: [0, 4.35, 0] },
        react_1.default.createElement("boxGeometry", { args: [10, .03, 8] }),
        react_1.default.createElement("meshStandardMaterial", { color: "#b5d1bc", transparent: true, opacity: .13, depthWrite: false })),
    ['A', 'B'].map((z, i) => { const active = s.runs.some(r => (0, format_1.isActiveRun)(r.status) && r.currentZone === z); return react_1.default.createElement("mesh", { key: z, position: [-3 + i * 3, .36, -.26], onClick: () => onSelect(z) },
        react_1.default.createElement("sphereGeometry", { args: [.14, 10, 8] }),
        react_1.default.createElement("meshStandardMaterial", { color: active ? '#39825d' : '#9ba7a2', emissive: active ? '#16422b' : '#000000', emissiveIntensity: .25 })); }),
    react_1.default.createElement(drei_1.OrbitControls, { makeDefault: true, enablePan: false, minPolarAngle: Math.PI / 6, maxPolarAngle: Math.PI / 2.6, minZoom: 28, maxZoom: 75, enableDamping: true })); }
function Scene(props) { return react_1.default.createElement("div", { className: "greenhouse-scene" },
    react_1.default.createElement(fiber_1.Canvas, { orthographic: true, camera: { position: [12, 13, 15], zoom: 42, near: .1, far: 100 }, frameloop: "demand", dpr: [1, 1.5], gl: { antialias: true, alpha: true } },
        react_1.default.createElement(Model, { ...props })),
    react_1.default.createElement("p", null, "Geser untuk orbit \u00B7 scroll untuk zoom \u00B7 model skematik")); }

},
"features/history/History":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relatedUrl = relatedUrl;
exports.EventDetails = EventDetails;
exports.Report = Report;
exports.default = HistoryPage;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const ui_1 = require("../../components/ui");
const costs_1 = require("../../domain/costs");
const format_1 = require("../../domain/format");
const selectors_1 = require("../../domain/selectors");
const Costs_1 = require("../costs/Costs");
const eventTypes = { observation: { label: 'Pengamatan', icon: 'eye', tone: 'green' }, inspection: { label: 'Inspeksi', icon: 'bug', tone: 'amber' }, plan: { label: 'Pengendalian', icon: 'shield', tone: 'green' }, routine: { label: 'Rutinitas', icon: 'workflow', tone: 'blue' }, run: { label: 'Eksekusi', icon: 'play', tone: 'green' }, device: { label: 'Perangkat', icon: 'devices', tone: 'amber' }, maintenance: { label: 'Pemeliharaan', icon: 'wrench', tone: 'amber' }, expense: { label: 'Pengeluaran', icon: 'wallet', tone: 'purple' }, system: { label: 'Sistem demo', icon: 'info', tone: 'gray' } };
function relatedUrl(id) {
    if (id.startsWith('INS-'))
        return `/hama?case=${id}`;
    if (id.startsWith('RUN-'))
        return `/otomasi?tab=executions&run=${id}`;
    if (id.startsWith('RTN-'))
        return `/otomasi?tab=routines&routine=${id}`;
    if (id.startsWith('PLN-'))
        return `/pengendalian?plan=${id}`;
    if (id.startsWith('EXP-'))
        return '/biaya?tab=expenses';
    if (id.startsWith('MNT-') || id.startsWith('DEV-'))
        return '/perangkat?tab=maintenance';
    return `/perangkat?device=${id}`;
}
function EventDetails({ ctx, id }) {
    const e = ctx.s.events.find(e => e.id === id);
    if (!e)
        return react_1.default.createElement(ui_1.Empty, { title: "Aktivitas tidak ditemukan" });
    return react_1.default.createElement("div", { className: "detail-stack" },
        react_1.default.createElement(ui_1.Badge, { tone: eventTypes[e.type].tone }, eventTypes[e.type].label),
        react_1.default.createElement("h2", null, e.title),
        react_1.default.createElement("p", null, e.detail),
        react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Waktu', value: `${(0, format_1.dateLabel)(e.at, true)} · ${(0, format_1.clockTime)(e.at, true)} WIB` }, { label: 'Aktor', value: e.actor }, { label: 'Objek sumber', value: e.objectId }, { label: 'Zona', value: e.zoneId ? `Zona ${e.zoneId}` : 'Greenhouse' }, { label: 'Status sebelumnya', value: e.before ?? 'Tidak direkam pada event ini' }, { label: 'Status sesudah', value: e.after ?? 'Lihat objek tertaut' }] }),
        react_1.default.createElement(ui_1.Button, { icon: "link", tone: "primary", onClick: () => e.type === 'expense' && e.objectId.startsWith('EXP-') ? ctx.open('expense-detail', e.objectId) : ctx.nav(relatedUrl(e.objectId)) }, "Buka objek terkait"),
        react_1.default.createElement(ui_1.Alert, { tone: "gray" }, "Riwayat lokal hanya untuk demonstrasi. localStorage bukan audit trail aman untuk produksi."));
}
function Report({ ctx }) { const { s } = ctx, scope = (0, Costs_1.scopeFrom)(ctx), cost = (0, costs_1.costSummary)(s, scope), comp = (0, costs_1.comparison)(s, scope), usage = (0, selectors_1.todayUsage)(s), complete = s.runs.filter(r => r.status === 'Completed').length, skipped = s.runs.filter(r => r.status === 'Skipped').length, terminal = s.runs.filter(r => ['Completed', 'Skipped', 'Blocked', 'Failed', 'Stopped', 'Needs reconciliation'].includes(r.status)); return react_1.default.createElement("article", { className: "print-report" },
    react_1.default.createElement("div", { className: "report-heading" },
        react_1.default.createElement("div", null,
            react_1.default.createElement("h1", null, "Vigor \u00B7 Laporan operasional"),
            react_1.default.createElement("p", null,
                s.greenhouse.name,
                " \u00B7 ",
                s.greenhouse.location)),
        react_1.default.createElement(ui_1.Badge, null, "Data demo")),
    react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Snapshot operasi', value: `${(0, format_1.dateLabel)(s.clock, true)} ${(0, format_1.clockTime)(s.clock)} WIB` }, { label: 'Periode pengeluaran', value: scope.period }, { label: 'Cakupan', value: scope.deviceId ?? (scope.zoneId ? `Zona ${scope.zoneId}` : '6 zona · 288 m² tanam') }] }),
    react_1.default.createElement("h2", null, "Pengamatan & tindak lanjut"),
    react_1.default.createElement("p", null,
        s.cases.filter(c => c.status === 'inspection').length,
        " kasus perlu inspeksi; ",
        s.cases.filter(c => c.status === 'monitoring').length,
        " dipantau. Kamera E-01 dan validasi Zona F mengikuti kondisi perangkat saat laporan dibuat."),
    react_1.default.createElement("h2", null, "Otomasi"),
    react_1.default.createElement("p", null,
        complete,
        " run selesai dari ",
        terminal.length,
        " run berstatus akhir; ",
        skipped,
        " dilewati secara sah. Run yang dilewati karena media cukup basah tidak diperlakukan sebagai kegagalan."),
    react_1.default.createElement("table", null,
        react_1.default.createElement("thead", null,
            react_1.default.createElement("tr", null,
                react_1.default.createElement("th", null, "Run"),
                react_1.default.createElement("th", null, "Rutinitas"),
                react_1.default.createElement("th", null, "Status"),
                react_1.default.createElement("th", null, "Alasan / hasil"))),
        react_1.default.createElement("tbody", null, s.runs.map(r => react_1.default.createElement("tr", { key: r.id },
            react_1.default.createElement("td", null, r.id),
            react_1.default.createElement("td", null, r.routineName),
            react_1.default.createElement("td", null, format_1.runLabels[r.status]),
            react_1.default.createElement("td", null, r.reason))))),
    react_1.default.createElement("p", null,
        "Pemakaian demo hari ini: ",
        (0, format_1.num)(usage.water, 1),
        " L air, ",
        (0, format_1.num)(usage.nutrition, 2),
        " unit nutrisi demo, ",
        (0, format_1.num)(usage.energy, 3),
        " kWh estimasi energi. ",
        usage.uncertain ? 'Ada delivery belum terkonfirmasi.' : '',
        " Volume berdasarkan feedback fixture atau debit asumsi, bukan runtime pompa semata."),
    react_1.default.createElement("h2", null, "Pengeluaran"),
    react_1.default.createElement("p", null,
        "Operasional ",
        (0, format_1.money)(cost.operating),
        "; investasi ",
        (0, format_1.money)(cost.investment),
        "; total uang keluar ",
        (0, format_1.money)(cost.total),
        ". Alokasi tidak dijumlahkan lagi sebagai tagihan. Budget ",
        cost.budget === null ? 'belum tersedia' : (0, format_1.money)(cost.budget),
        "."),
    react_1.default.createElement("table", null,
        react_1.default.createElement("thead", null,
            react_1.default.createElement("tr", null,
                react_1.default.createElement("th", null, "ID"),
                react_1.default.createElement("th", null, "Kategori / catatan"),
                react_1.default.createElement("th", null, "Sumber"),
                react_1.default.createElement("th", null, "Nominal"))),
        react_1.default.createElement("tbody", null, cost.rows.map(r => react_1.default.createElement("tr", { key: r.record.id },
            react_1.default.createElement("td", null, r.record.id),
            react_1.default.createElement("td", null,
                r.record.category,
                " \u00B7 ",
                r.record.note),
            react_1.default.createElement("td", null, r.source),
            react_1.default.createElement("td", null, (0, format_1.money)(r.amount)))))),
    react_1.default.createElement("p", null,
        comp.difference === null ? 'Penghematan belum dapat dibandingkan.' : `Estimasi selisih ${(0, format_1.money)(comp.difference)} (${(0, format_1.num)(comp.percent ?? 0, 1)}%).`,
        " ",
        comp.reason,
        " Kategori belum tercatat: ",
        comp.missing.join(', ') || 'tidak ada pada fixture ini',
        "."),
    react_1.default.createElement("h2", null, "Batas laporan"),
    react_1.default.createElement("p", null, "Data sintetis. Analisis AI telah disiapkan sebagai fixture; tidak ada inferensi, koneksi perangkat, atau transaksi pembayaran nyata. Selisih sebelum\u2013sesudah bukan bukti efektivitas biologis atau efisiensi yang disebabkan Vigor. Angka nutrisi bukan resep budidaya."),
    react_1.default.createElement(ui_1.Button, { className: "no-print", icon: "print", tone: "primary", onClick: () => window.print() }, "Cetak / simpan melalui browser")); }
function HistoryPage({ ctx }) {
    const { s } = ctx, type = ctx.query.get('type') ?? 'all', zone = ctx.query.get('zone') ?? 'all', search = ctx.query.get('search') ?? '', date = ctx.query.get('date') ?? '', actor = ctx.query.get('actor') ?? 'all', tab = ctx.query.get('tab') ?? 'timeline';
    const rows = s.events.filter(e => (type === 'all' || e.type === type) && (zone === 'all' || e.zoneId === zone) && (!date || (0, format_1.localDate)(Date.parse(e.at) / 1000) === date) && (actor === 'all' || e.actor === actor) && `${e.id} ${e.title} ${e.detail} ${e.objectId}`.toLowerCase().includes(search.toLowerCase())), selected = ctx.query.get('event') ?? rows[0]?.id;
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement(ui_1.Stats, null,
            react_1.default.createElement(ui_1.Stat, { icon: "history", label: "Aktivitas tersimpan", value: s.events.length, sub: "Ringkasan event, bukan telemetry per detik" }),
            react_1.default.createElement(ui_1.Stat, { icon: "checkcircle", label: "Run selesai", value: s.runs.filter(r => r.status === 'Completed').length, sub: "Pelaksanaan simulator terverifikasi" }),
            react_1.default.createElement(ui_1.Stat, { icon: "alert", tone: "amber", label: "Perlu pemeriksaan status", value: s.runs.filter(r => r.status === 'Needs reconciliation').length, sub: "Tidak dianggap berhenti terkonfirmasi" }),
            react_1.default.createElement(ui_1.Stat, { icon: "file", label: "Catatan biaya September", value: s.expenses.filter(e => e.status === 'paid' && e.paidAt.startsWith('2026-09')).length, sub: "Sumber yang sama dengan menu Biaya" })),
        react_1.default.createElement(ui_1.Tabs, { value: tab, onChange: v => (0, context_1.updateQuery)(ctx, '/riwayat', { tab: v }), items: [{ id: 'timeline', label: 'Linimasa aktivitas' }, { id: 'report', label: 'Laporan operasional' }] }),
        tab === 'report' ? react_1.default.createElement(ui_1.Card, null,
            react_1.default.createElement(Report, { ctx: ctx })) : react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "filter-bar" },
                react_1.default.createElement(ui_1.SearchField, { value: search, onChange: v => (0, context_1.updateQuery)(ctx, '/riwayat', { search: v }), placeholder: "Cari aktivitas atau ID sumber\u2026" }),
                react_1.default.createElement(ui_1.Select, { label: "Jenis aktivitas", value: type, onChange: v => (0, context_1.updateQuery)(ctx, '/riwayat', { type: v, event: undefined }), options: [{ value: 'all', label: 'Semua aktivitas' }, ...Object.entries(eventTypes).map(([value, x]) => ({ value, label: x.label }))] }),
                react_1.default.createElement(ui_1.Select, { label: "Zona riwayat", value: zone, onChange: v => (0, context_1.updateQuery)(ctx, '/riwayat', { zone: v, event: undefined }), options: [{ value: 'all', label: 'Semua zona' }, ...s.zones.map(z => ({ value: z.id, label: z.name }))] }),
                react_1.default.createElement(ui_1.Select, { label: "Petugas aktivitas", value: actor, onChange: v => (0, context_1.updateQuery)(ctx, '/riwayat', { actor: v }), options: [{ value: 'all', label: 'Semua aktor' }, ...Array.from(new Set(s.events.map(e => e.actor))).map(a => ({ value: a, label: a }))] }),
                react_1.default.createElement("input", { type: "date", "aria-label": "Tanggal riwayat", value: date, onChange: (e) => (0, context_1.updateQuery)(ctx, '/riwayat', { date: e.currentTarget.value }) }),
                react_1.default.createElement(ui_1.Button, { small: true, icon: "download", onClick: () => (0, format_1.downloadText)('Vigor-aktivitas.csv', (0, format_1.csv)([['DATA DEMO — ' + s.greenhouse.name], ['ID', 'Waktu WIB', 'Jenis', 'Aktor', 'Objek', 'Zona', 'Aktivitas', 'Rincian'], ...rows.map(e => [e.id, (0, format_1.dateLabel)(e.at) + ' ' + (0, format_1.clockTime)(e.at, true), e.type, e.actor, e.objectId, e.zoneId ?? '', e.title, e.detail])])) }, "Ekspor CSV")),
            react_1.default.createElement("div", { className: "history-layout" },
                react_1.default.createElement(ui_1.Card, { title: "Aktivitas kebun", subtitle: `${rows.length} event sesuai filter · riwayat lokal demo` },
                    react_1.default.createElement("div", { className: "timeline-list" }, rows.map((e, i) => react_1.default.createElement(react_1.default.Fragment, { key: e.id },
                        (i === 0 || (0, format_1.dateLabel)(rows[i - 1].at) !== (0, format_1.dateLabel)(e.at)) && react_1.default.createElement("div", { className: "timeline-day" }, (0, format_1.dateLabel)(e.at, true)),
                        react_1.default.createElement("button", { className: `timeline-event ${selected === e.id ? 'selected' : ''}`, onClick: () => {
                                (0, context_1.updateQuery)(ctx, '/riwayat', { event: e.id });
                                if (ctx.mobile)
                                    ctx.open('event', e.id);
                            } },
                            react_1.default.createElement("time", null, (0, format_1.clockTime)(e.at)),
                            react_1.default.createElement("span", { className: `timeline-icon ${eventTypes[e.type].tone}` },
                                react_1.default.createElement(ui_1.Icon, { name: eventTypes[e.type].icon, size: 17 })),
                            react_1.default.createElement("span", { className: "grow" },
                                react_1.default.createElement("strong", null, e.title),
                                react_1.default.createElement("small", null, e.detail),
                                react_1.default.createElement("span", { className: "event-meta" },
                                    e.actor,
                                    " \u00B7 ",
                                    e.objectId,
                                    e.zoneId ? ` · Zona ${e.zoneId}` : '')),
                            react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 16 }))))),
                    !rows.length && react_1.default.createElement(ui_1.Empty, { title: "Belum ada aktivitas sesuai filter", action: react_1.default.createElement(ui_1.Button, { onClick: () => ctx.nav('/riwayat') }, "Hapus filter") })),
                react_1.default.createElement(ui_1.Card, { className: "inspector desktop-detail", title: "Detail aktivitas" }, selected ? react_1.default.createElement(EventDetails, { ctx: ctx, id: selected }) : react_1.default.createElement(ui_1.Empty, { title: "Pilih aktivitas" })))));
}

},
"features/overview/Overview":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overview = Overview;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const charts_1 = require("../../components/charts");
const monitoring_1 = require("../../components/monitoring");
const ui_1 = require("../../components/ui");
const costs_1 = require("../../domain/costs");
const format_1 = require("../../domain/format");
const selectors_1 = require("../../domain/selectors");
function Overview(ctx) {
    const { s } = ctx, k = (0, selectors_1.kpis)(s), u = (0, selectors_1.todayUsage)(s), run = k.active.find(r => r.status === 'Running' || r.status === 'Verifying') ?? k.active[0], step = run?.steps[run.stepIndex], elapsed = step?.startedAt === undefined ? 0 : s.clock - step.startedAt;
    const p = s.cases.find(c => c.id === 'INS-024');
    const zone = ctx.query.get('chartZone') ?? 'all', period = ctx.query.get('chartPeriod') ?? '6', costPeriod = ctx.query.get('period') ?? '2026-09', cost = (0, costs_1.costSummary)(s, { period: costPeriod }), comp = (0, costs_1.comparison)(s, { period: costPeriod });
    const data = (0, selectors_1.trendData)(s).slice(-Number(period));
    return react_1.default.createElement("div", { className: "page-stack overview-page" },
        react_1.default.createElement(ui_1.Stats, null,
            react_1.default.createElement(ui_1.Stat, { icon: "alert", tone: "amber", label: "Perlu inspeksi", value: `${k.inspection} kasus`, sub: k.inspection ? 'Prioritas hari ini' : 'Tidak ada inspeksi tertunda', onClick: () => ctx.nav('/hama?status=inspection') }),
            react_1.default.createElement(ui_1.Stat, { icon: "leaf", label: "Zona terpantau", value: react_1.default.createElement(react_1.default.Fragment, null,
                    k.coverage,
                    react_1.default.createElement("span", { className: "denominator" }, " / 6")), sub: "Pengamatan hama tervalidasi", onClick: () => ctx.nav('/greenhouse?layer=coverage') }),
            react_1.default.createElement(ui_1.Stat, { icon: "camera", label: "Kamera & suhu/RH", value: react_1.default.createElement(react_1.default.Fragment, null,
                    k.observationsOnline,
                    react_1.default.createElement("span", { className: "denominator" },
                        " / ",
                        k.observationsTotal)), sub: `${k.observationsTotal - k.observationsOnline} perangkat offline`, onClick: () => ctx.nav('/perangkat?group=observation') }),
            react_1.default.createElement(ui_1.Stat, { icon: "checkcircle", label: "Kasus selesai", value: k.closed, sub: "Setelah review \u00B7 7 hari terakhir", onClick: () => ctx.nav('/hama?status=closed') })),
        react_1.default.createElement("div", { className: "overview-grid" },
            react_1.default.createElement(ui_1.Card, { title: "Tren tangkapan", icon: "bug", subtitle: "Tangkapan baru, bukan hitungan kumulatif.", tools: react_1.default.createElement("div", { className: "button-row" },
                    react_1.default.createElement(ui_1.Select, { label: "Filter zona grafik", value: zone, onChange: v => (0, context_1.updateQuery)(ctx, '/ringkasan', { chartZone: v }), options: [{ value: 'all', label: 'Semua zona' }, ...s.zones.map(z => ({ value: z.id, label: z.name }))] }),
                    react_1.default.createElement(ui_1.Select, { label: "Periode pengamatan", value: period, onChange: v => (0, context_1.updateQuery)(ctx, '/ringkasan', { chartPeriod: v }), options: [{ value: '6', label: '6 pengamatan' }, { value: '3', label: '3 pengamatan' }] })) },
                react_1.default.createElement(charts_1.TrendChart, { data: data, keys: zone === 'all' ? ['A', 'B', 'C', 'D'] : [zone], height: 240 }),
                react_1.default.createElement("p", { className: "chart-note" }, "Interval setara: 24 jam. Zona E/F belum memiliki data yang dapat dibandingkan."),
                react_1.default.createElement(ui_1.Alert, { title: p?.verified ? 'Inspeksi Zona B sudah dicatat' : 'Zona B perlu diperiksa', action: react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.nav('/hama?case=INS-024'), icon: "arrow" }, "Buka kasus") }, p?.verified ? 'Lanjutkan ke rencana dan evaluasi, bukan penutupan otomatis.' : 'Tangkapan meningkat pada tiga pengamatan terakhir. Verifikasi pada tanaman.')),
            react_1.default.createElement(ui_1.Card, { title: "Prioritas hari ini", icon: "leaf", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.nav('/hama') },
                    "Lihat semua ",
                    react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 })) },
                react_1.default.createElement("div", { className: "priorities" },
                    react_1.default.createElement("button", { className: "priority", onClick: () => ctx.nav('/hama?case=INS-024') },
                        react_1.default.createElement("span", { className: "priority-number amber" }, "1"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, p?.verified ? 'Tinjau tindak lanjut Zona B' : 'Periksa Zona B'),
                            react_1.default.createElement("small", null,
                                p?.assignedTo ?? 'Belum ada petugas',
                                " \u00B7 INS-024"),
                            react_1.default.createElement(ui_1.Badge, { tone: p?.verified ? 'green' : 'amber' }, p?.verified ? 'Sudah diinspeksi' : 'Belum diverifikasi')),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron" })),
                    react_1.default.createElement("button", { className: "priority", onClick: () => ctx.nav('/perangkat?device=CAM-E-01') },
                        react_1.default.createElement("span", { className: "priority-number amber" }, "2"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, s.devices.find(d => d.id === 'CAM-E-01')?.connection === 'online' ? 'Tinjau perbaikan Kamera E-01' : 'Pulihkan Kamera E-01'),
                            react_1.default.createElement("small", null, "DEV-008 \u00B7 Rekaman terakhir 08:10 WIB"),
                            react_1.default.createElement(ui_1.Badge, { tone: "amber" }, "Tiket perangkat")),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron" })),
                    react_1.default.createElement("button", { className: "priority", onClick: () => ctx.nav('/greenhouse?zone=F') },
                        react_1.default.createElement("span", { className: "priority-number gray" }, "3"),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, s.zones.find(z => z.id === 'F')?.validated ? 'Lihat hasil validasi Zona F' : 'Validasi Zona F'),
                            react_1.default.createElement("small", null, "Online belum berarti data tervalidasi."),
                            react_1.default.createElement(ui_1.Badge, { tone: s.zones.find(z => z.id === 'F')?.validated ? 'green' : 'gray' }, s.zones.find(z => z.id === 'F')?.validated ? 'Tervalidasi' : 'Validasi pemasangan')),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron" })))),
            react_1.default.createElement(ui_1.Card, { title: "Operasional otomatis", icon: "workflow", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.nav('/otomasi') },
                    "Lihat semua ",
                    react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 })) },
                run ? react_1.default.createElement("div", { className: "active-run-widget" },
                    react_1.default.createElement("div", { className: "run-widget-icon" },
                        react_1.default.createElement(ui_1.Icon, { name: run.kind === 'fertigation' ? 'flask' : 'drop', size: 27 })),
                    react_1.default.createElement("div", { className: "grow" },
                        react_1.default.createElement("div", { className: "inline-wrap" },
                            react_1.default.createElement("h3", null, run.routineName),
                            react_1.default.createElement(ui_1.Badge, { tone: "green", dot: true }, format_1.runLabels[run.status])),
                        react_1.default.createElement("p", null,
                            step?.label ?? run.reason,
                            " \u00B7 ",
                            run.id),
                        react_1.default.createElement(ui_1.Progress, { value: step?.duration ? elapsed / step.duration * 100 : 0, label: `${(0, format_1.duration)(elapsed)} / ${(0, format_1.duration)(step?.duration ?? 0)}` }),
                        run.currentZone === 'A' && run.snapshot.zones.includes('B') && react_1.default.createElement("small", { className: "muted" },
                            react_1.default.createElement(ui_1.Icon, { name: "clock", size: 13 }),
                            " Zona B menunggu pompa yang sama.")),
                    react_1.default.createElement("div", { className: "vertical-buttons" },
                        react_1.default.createElement(ui_1.Button, { small: true, tone: "danger", icon: "stop", onClick: () => ctx.act({ type: 'stop', id: run.id }) }, "Hentikan"),
                        react_1.default.createElement(ui_1.Button, { small: true, icon: "arrow", onClick: () => ctx.nav(`/otomasi?tab=executions&run=${run.id}`) }, "Lihat run"))) : react_1.default.createElement("div", { className: "next-run-hero" },
                    react_1.default.createElement("span", { className: "big-soft-icon" },
                        react_1.default.createElement(ui_1.Icon, { name: "drop", size: 29 })),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("span", { className: "eyebrow" }, "JADWAL BERIKUTNYA"),
                        react_1.default.createElement("h3", null, k.next?.routine.name ?? 'Tidak ada jadwal aktif'),
                        react_1.default.createElement("p", null, k.next ? `${(0, format_1.clockTime)(k.next.at)} WIB · Zona ${k.next.routine.version.zones.join(' → ')}` : 'Aktifkan rutinitas untuk memulai.')),
                    react_1.default.createElement(ui_1.Button, { small: true, icon: "play", tone: "primary", onClick: () => { ctx.act({ type: 'next' }); ctx.nav('/otomasi?tab=executions'); } }, "Ke kejadian berikutnya")),
                react_1.default.createElement("div", { className: "mini-schedules" }, s.routines.filter(r => r.trigger.type === 'schedule' && r.status === 'Active').slice(0, 4).map(r => react_1.default.createElement("button", { key: r.id, onClick: () => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`) },
                    react_1.default.createElement(ui_1.Icon, { name: r.kind === 'fertigation' ? 'flask' : r.policy === 'task' ? 'file' : r.kind === 'pest' ? 'shield' : 'drop' }),
                    react_1.default.createElement("span", null,
                        react_1.default.createElement("strong", null, r.trigger.type === 'schedule' ? r.trigger.schedule.times[0] : ''),
                        react_1.default.createElement("small", null, r.name))))),
                react_1.default.createElement("div", { className: "card-footer" },
                    react_1.default.createElement("span", null,
                        react_1.default.createElement(ui_1.Icon, { name: "workflow", size: 14 }),
                        " ",
                        k.routines,
                        " rutinitas aktif \u00B7 ",
                        k.active.length,
                        " berjalan/antre"),
                    react_1.default.createElement("button", { className: "text-link", onClick: () => ctx.nav('/otomasi?tab=routines') },
                        "Kelola rutinitas ",
                        react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 14 })))),
            react_1.default.createElement(ui_1.Card, { title: "Lingkungan Zona B", icon: "leaf", tools: react_1.default.createElement(ui_1.Button, { tone: "ghost", small: true, icon: "chevron", ariaLabel: "Detail Zona B", onClick: () => ctx.nav('/greenhouse?zone=B') }) },
                react_1.default.createElement("div", { className: "two-sensors" },
                    react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "TH-B-01" }),
                    react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: "TH-B-01", humidity: true })),
                react_1.default.createElement("div", { className: "usage-strip" },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("span", { className: "soft-icon blue" },
                            react_1.default.createElement(ui_1.Icon, { name: "drop" })),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("small", null, "Air dalam simulasi"),
                            react_1.default.createElement("strong", null,
                                (0, format_1.number)(u.water, 1),
                                " L"),
                            react_1.default.createElement("small", null, u.measured ? 'Terukur demo' : 'Belum ada run pemakaian'))),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("span", { className: "soft-icon" },
                            react_1.default.createElement(ui_1.Icon, { name: "flask" })),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("small", null, "Nutrisi berikutnya"),
                            react_1.default.createElement("strong", null,
                                "10:30 ",
                                react_1.default.createElement("small", null, "WIB")),
                            react_1.default.createElement("small", null, "Profil demo Zona A")))))),
        react_1.default.createElement("div", { className: "overview-bottom" },
            react_1.default.createElement(ui_1.Card, { title: "Status zona", icon: "grid", subtitle: "Status pengamatan, bukan skor kesehatan kebun.", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", onClick: () => ctx.nav('/greenhouse') },
                    "Buka greenhouse ",
                    react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 })) },
                react_1.default.createElement("div", { className: "table-scroll" },
                    react_1.default.createElement("table", null,
                        react_1.default.createElement("thead", null,
                            react_1.default.createElement("tr", null,
                                react_1.default.createElement("th", null, "Zona"),
                                react_1.default.createElement("th", null, "Monitoring"),
                                react_1.default.createElement("th", null, "Temuan aktif"),
                                react_1.default.createElement("th", null, "Pembaruan demo"),
                                react_1.default.createElement("th", null))),
                        react_1.default.createElement("tbody", null, s.zones.map(z => { const st = (0, selectors_1.zoneStatus)(s, z.id); return react_1.default.createElement("tr", { key: z.id, className: "clickable", onClick: () => ctx.nav(`/greenhouse?zone=${z.id}`) },
                            react_1.default.createElement("td", null,
                                react_1.default.createElement("strong", null, z.name),
                                react_1.default.createElement("small", { className: "cell-sub" },
                                    z.area,
                                    " m\u00B2 \u00B7 ",
                                    z.plants,
                                    " tanaman")),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement(ui_1.Badge, { tone: st.tone, dot: true }, st.label)),
                            react_1.default.createElement("td", null, s.cases.find(c => c.zoneId === z.id && c.status !== 'closed')?.id ?? 'Tidak ada kasus aktif'),
                            react_1.default.createElement("td", null,
                                (0, format_1.clockTime)(s.clock),
                                " WIB"),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "chevron", ariaLabel: `Buka ${z.name}`, onClick: () => ctx.nav(`/greenhouse?zone=${z.id}`) }))); }))))),
            react_1.default.createElement("div", { className: "page-stack" },
                react_1.default.createElement(ui_1.Card, { title: "Bukti terbaru Zona B", icon: "camera", tools: react_1.default.createElement(ui_1.Button, { small: true, tone: "ghost", icon: "external", ariaLabel: "Buka bukti Zona B", onClick: () => ctx.nav('/hama?case=INS-024') }) },
                    react_1.default.createElement(monitoring_1.CameraPreview, { s: s, compact: true, onDetails: () => ctx.nav('/perangkat?tab=cameras&camera=CAM-B-02') }),
                    react_1.default.createElement("p", { className: "micro muted" }, "Gambar referensi desain \u00B7 video belum tersedia.")),
                react_1.default.createElement(ui_1.Card, { title: "Biaya periode", icon: "wallet", tools: react_1.default.createElement(ui_1.SourceTag, null, (0, format_1.monthLabel)(costPeriod)) },
                    react_1.default.createElement("div", { className: "period-expense" },
                        react_1.default.createElement("span", null, "Operasional tercatat"),
                        react_1.default.createElement("strong", null, (0, format_1.money)(cost.operating)),
                        react_1.default.createElement("p", null,
                            "Sisa anggaran ",
                            react_1.default.createElement("b", null, cost.remaining === null ? 'Belum tersedia' : (0, format_1.money)(cost.remaining)))),
                    comp.canCompare && react_1.default.createElement("small", { className: "green-text" },
                        (0, format_1.money)(comp.difference ?? 0),
                        " lebih rendah \u00B7 estimasi terhadap acuan manual."),
                    react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.nav(`/biaya?period=${costPeriod}`), className: "full-width" },
                        "Lihat biaya & penghematan ",
                        react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 }))))));
}

},
"features/pests/Pests":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseDetails = CaseDetails;
exports.Pests = Pests;
const react_1 = __importDefault(require("react"));
const context_1 = require("../../app/context");
const charts_1 = require("../../components/charts");
const monitoring_1 = require("../../components/monitoring");
const ui_1 = require("../../components/ui");
const assets_1 = require("../../data/assets");
const format_1 = require("../../domain/format");
const selectors_1 = require("../../domain/selectors");
function CaseDetails({ ctx, id }) {
    const { s } = ctx, c = s.cases.find(c => c.id === id);
    if (!c)
        return react_1.default.createElement(ui_1.Empty, { title: "Kasus tidak ditemukan" });
    const inspections = s.inspections.filter(i => i.caseId === c.id);
    const plans = s.plans.filter(p => p.caseId === c.id);
    return react_1.default.createElement("div", { className: "page-stack case-details" },
        react_1.default.createElement("div", { className: "detail-title" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("div", { className: "inline-wrap" },
                    react_1.default.createElement("span", { className: "eyebrow" },
                        c.id,
                        " \u00B7 ZONA ",
                        c.zoneId),
                    react_1.default.createElement(ui_1.Badge, { tone: c.status === 'closed' ? 'green' : c.status === 'monitoring' ? 'blue' : 'amber' }, c.status === 'closed' ? 'Selesai' : c.status === 'monitoring' ? 'Dipantau' : 'Perlu inspeksi')),
                react_1.default.createElement("h2", null, c.title),
                react_1.default.createElement("p", null,
                    (0, format_1.dateLabel)(c.createdAt),
                    " \u00B7 ",
                    (0, format_1.clockTime)(c.createdAt),
                    " WIB \u00B7 ",
                    c.sourceDeviceId)),
            react_1.default.createElement(ui_1.Button, { small: true, icon: "devices", onClick: () => ctx.nav(`/perangkat?device=${c.sourceDeviceId}`) }, "Perangkat asal")),
        react_1.default.createElement("div", { className: "evidence-grid" },
            react_1.default.createElement("div", null,
                react_1.default.createElement(monitoring_1.CameraPreview, { s: s, deviceId: c.sourceDeviceId, compact: true }),
                react_1.default.createElement("div", { className: "inline-wrap top-gap" },
                    react_1.default.createElement(ui_1.SourceTag, null, "Gambar referensi desain"),
                    react_1.default.createElement(ui_1.SourceTag, null, "Bukan hasil inference"),
                    react_1.default.createElement(ui_1.SourceTag, null, "Penanda pada thumbnail berasal dari desain"))),
            react_1.default.createElement(ui_1.Card, { title: "Tren pengamatan", subtitle: "Interval setara: 24 jam.", className: "flat-card" },
                react_1.default.createElement(charts_1.TrendChart, { data: (0, selectors_1.trendData)(s), keys: [c.zoneId], height: 200 }),
                react_1.default.createElement("p", { className: "micro muted" }, "Perangkap adalah indikator pengamatan, bukan diagnosis tunggal."))),
        react_1.default.createElement(ui_1.Alert, { tone: c.verified ? 'green' : 'amber', title: c.verified ? 'Hasil inspeksi sudah dicatat' : 'Dugaan AI · belum diverifikasi' }, c.verified ? 'Keputusan pengendalian tetap mengacu pada bukti dan review operator.' : 'Analisis adalah fixture demo. Serangga tertangkap belum tentu hama tanaman.'),
        react_1.default.createElement("div", { className: "analysis-grid" },
            react_1.default.createElement(ui_1.Card, { title: "Ringkasan pengamatan", icon: "eye" },
                react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Yang diamati', value: c.zoneId === 'B' ? 'Tangkapan meningkat pada 3 interval terakhir.' : 'Pengamatan memerlukan tindak lanjut sesuai kasus.' }, { label: 'Bukti pendukung', value: `Foto referensi perangkap, interval 24 jam, ${c.sourceDeviceId}.` }, { label: 'Belum tersedia', value: c.verified ? 'Evaluasi efektivitas setelah tindakan.' : 'Verifikasi jenis serangga dan inspeksi tanaman.' }, { label: 'Langkah berikutnya', value: c.verified ? 'Tinjau rencana dan jadwalkan observasi lanjutan.' : 'Tetapkan petugas dan periksa tanaman.' }] })),
            react_1.default.createElement(ui_1.Card, { title: "Tindak lanjut", icon: "users" },
                react_1.default.createElement(ui_1.Meta, { items: [{ label: 'Penanggung jawab', value: c.assignedTo ?? 'Belum ditetapkan' }, { label: 'Inspeksi tercatat', value: `${inspections.length} inspeksi` }, { label: 'Evaluasi berikutnya', value: c.followUpAt ? (0, format_1.dateLabel)(c.followUpAt) : 'Belum dijadwalkan' }] }),
                !c.assignedTo && react_1.default.createElement(ui_1.Button, { small: true, onClick: () => ctx.act({ type: 'assign', caseId: c.id, operator: 'Budi Santoso' }), icon: "users" }, "Tugaskan Budi Santoso"),
                react_1.default.createElement("div", { className: "two-sensors top-gap" },
                    react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: `TH-${c.zoneId}-01`, compact: true }),
                    react_1.default.createElement(monitoring_1.SensorCard, { s: s, id: `TH-${c.zoneId}-01`, humidity: true, compact: true })))),
        inspections.length > 0 && react_1.default.createElement(ui_1.Card, { title: "Hasil inspeksi tanaman", icon: "file" }, inspections.map(i => react_1.default.createElement("div", { className: "inspection-result", key: i.id },
            react_1.default.createElement("div", null,
                react_1.default.createElement("strong", null, i.operator),
                react_1.default.createElement("small", null,
                    (0, format_1.dateLabel)(i.at),
                    " \u00B7 ",
                    (0, format_1.clockTime)(i.at),
                    " WIB \u00B7 ",
                    i.id)),
            react_1.default.createElement(ui_1.Badge, { tone: "blue" },
                i.examined,
                " diperiksa \u00B7 ",
                i.affected,
                " bergejala"),
            react_1.default.createElement("p", null, i.notes),
            react_1.default.createElement("span", { className: "micro muted" },
                "Keputusan: ",
                i.outcome === 'indication' ? 'Ada indikasi' : i.outcome === 'not_found' ? 'Tidak ditemukan' : 'Belum dapat disimpulkan'),
            i.attachmentName && react_1.default.createElement("small", null,
                "Lampiran sesi: ",
                i.attachmentName)))),
        plans.length > 0 && react_1.default.createElement("div", { className: "linked-items" }, plans.map(p => react_1.default.createElement("button", { key: p.id, onClick: () => ctx.nav(`/pengendalian?plan=${p.id}`) },
            react_1.default.createElement(ui_1.Icon, { name: "link", size: 16 }),
            p.id,
            " \u00B7 ",
            p.title,
            react_1.default.createElement(ui_1.Icon, { name: "arrow", size: 15 })))),
        react_1.default.createElement("div", { className: "detail-actions" },
            react_1.default.createElement(ui_1.Button, { tone: "primary", icon: "file", onClick: () => ctx.open('inspection', c.id) }, "Catat inspeksi"),
            react_1.default.createElement(ui_1.Button, { icon: "leaf", disabled: !inspections.length, title: !inspections.length ? 'Catat inspeksi tanaman terlebih dahulu.' : undefined, onClick: () => ctx.open('plan', c.id) }, "Buat rencana pengendalian")));
}
function Pests(ctx) {
    const { s } = ctx, k = (0, selectors_1.kpis)(s), status = ctx.query.get('status') ?? 'all', zone = ctx.query.get('zone') ?? 'all', search = ctx.query.get('search') ?? '';
    const cases = s.cases.filter(c => (status === 'all' || c.status === status) && (zone === 'all' || c.zoneId === zone) && `${c.id} ${c.title} ${c.zoneId}`.toLowerCase().includes(search.toLowerCase()));
    const selected = cases.find(c => c.id === ctx.query.get('case')) ?? cases[0];
    return react_1.default.createElement("div", { className: "page-stack" },
        react_1.default.createElement("div", { className: "stats three" },
            react_1.default.createElement(ui_1.Stat, { label: "Perlu inspeksi", value: k.inspection, icon: "alert", tone: "amber", sub: "Menunggu pemeriksaan tanaman" }),
            react_1.default.createElement(ui_1.Stat, { label: "Dalam pemantauan", value: k.monitoring, icon: "eye", sub: "Observasi lanjutan diperlukan" }),
            react_1.default.createElement(ui_1.Stat, { label: "Selesai setelah review", value: k.closed, icon: "checkcircle", sub: "7 hari terakhir" })),
        react_1.default.createElement("div", { className: "filter-bar" },
            react_1.default.createElement(ui_1.SearchField, { value: search, onChange: v => (0, context_1.updateQuery)(ctx, '/hama', { search: v }), placeholder: "Cari kasus, zona, atau temuan\u2026" }),
            react_1.default.createElement(ui_1.Select, { label: "Status kasus", value: status, onChange: v => (0, context_1.updateQuery)(ctx, '/hama', { status: v }), options: [{ value: 'all', label: 'Semua status' }, { value: 'inspection', label: 'Perlu inspeksi' }, { value: 'monitoring', label: 'Dipantau' }, { value: 'closed', label: 'Selesai' }] }),
            react_1.default.createElement(ui_1.Select, { label: "Zona kasus", value: zone, onChange: v => (0, context_1.updateQuery)(ctx, '/hama', { zone: v }), options: [{ value: 'all', label: 'Semua zona' }, ...s.zones.map(z => ({ value: z.id, label: z.name }))] }),
            react_1.default.createElement("span", { className: "micro muted" }, "Jenis serangga: belum teridentifikasi")),
        react_1.default.createElement("div", { className: "master-detail" },
            react_1.default.createElement(ui_1.Card, { title: "Daftar kasus", tools: react_1.default.createElement("span", { className: "count-pill" }, cases.length), className: "master-list" },
                react_1.default.createElement("div", { className: "case-list" },
                    cases.map(c => react_1.default.createElement("button", { key: c.id, className: `case-item ${selected?.id === c.id ? 'selected' : ''}`, onClick: () => {
                            (0, context_1.updateQuery)(ctx, '/hama', { case: c.id });
                            if (ctx.mobile)
                                ctx.open('case-detail', c.id);
                        } },
                        react_1.default.createElement("img", { src: c.zoneId === 'B' ? assets_1.assets.evidence : assets_1.assets.camera, alt: "Gambar referensi desain" }),
                        react_1.default.createElement("span", null,
                            react_1.default.createElement("strong", null, c.title),
                            react_1.default.createElement("small", null,
                                c.id,
                                " \u00B7 Zona ",
                                c.zoneId),
                            react_1.default.createElement(ui_1.Badge, { tone: c.status === 'closed' ? 'green' : c.status === 'monitoring' ? 'blue' : 'amber' }, c.status === 'closed' ? 'Selesai' : c.status === 'monitoring' ? 'Dipantau' : 'Perlu inspeksi')),
                        react_1.default.createElement(ui_1.Icon, { name: "chevron", size: 15 }))),
                    !cases.length && react_1.default.createElement(ui_1.Empty, { title: "Tidak ada kasus sesuai filter", detail: "Ubah filter untuk melihat kasus lain." }))),
            react_1.default.createElement(ui_1.Card, { className: "desktop-detail" }, selected ? react_1.default.createElement(CaseDetails, { ctx: ctx, id: selected.id }) : react_1.default.createElement(ui_1.Empty, { title: "Pilih kasus untuk melihat bukti", icon: "bug" }))));
}

},
"main":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./app/App"));
require("./styles/index.css");
const root = document.getElementById('root');
if (!root)
    throw new Error('Elemen root tidak ditemukan.');
(0, client_1.createRoot)(root).render(react_1.default.createElement(App_1.default, null));

},
"store/store":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const vanilla_1 = require("zustand/vanilla");
const fixtures_1 = require("../data/fixtures");
const actions_1 = require("../domain/actions");
const storage_1 = require("../domain/storage");
const STORAGE_KEY = 'vigor-demo-v3';
function load() {
    try {
        return (0, storage_1.hydrate)(localStorage.getItem(STORAGE_KEY));
    }
    catch {
        const s = (0, fixtures_1.createFixture)();
        s.storageWarning = 'Penyimpanan browser tidak tersedia. Perubahan hanya berlaku untuk sesi ini.';
        return s;
    }
}
exports.store = (0, vanilla_1.createStore)()((set, get) => ({ data: typeof window === 'undefined' ? (0, fixtures_1.createFixture)() : load(), dispatch(action) {
        try {
            const { data, result } = (0, actions_1.transition)(get().data, action);
            set({ data });
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
            catch {
                if (!data.storageWarning)
                    set({ data: { ...data, storageWarning: 'Penyimpanan penuh atau tidak tersedia. Perubahan terakhir hanya di sesi ini.' } });
            }
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Perubahan tidak dapat disimpan.';
            return { ok: false, message };
        }
    } }));

}};const cache={};function load(id){if(externals[id])return externals[id];if(cache[id])return cache[id].exports;if(!modules[id])throw Error('Portable module unavailable: '+id);const m={exports:{}};cache[id]=m;const req=name=>{if(name.endsWith('.css'))return {};if(!name.startsWith('.'))return load(name);const parts=id.split('/');parts.pop();for(const p of name.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}return load(parts.join('/').replace(/\.tsx?$/,''));};modules[id](req,m,m.exports);return m.exports;}load('main');if(location.search.includes('test=1'))window.__VIGOR_TEST__={store:load('store/store').store,fixture:load('data/fixtures').createFixture,scheduler:load('domain/scheduler'),costs:load('domain/costs'),format:load('domain/format')};})();