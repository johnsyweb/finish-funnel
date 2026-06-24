// ==UserScript==
// @name         parkrun Finish Funnel (beta)
// @description  Beta. Size a parkrun finish funnel for orderly finish token handover on results pages.
// @author       Pete Johns (@johnsyweb)
// @downloadURL  https://raw.githubusercontent.com/johnsyweb/finish-funnel/refs/heads/main/finish-funnel.user.js
// @grant        none
// @homepage     https://www.johnsy.com/finish-funnel/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parkrun.com.au
// @license      MIT
// @match        *://www.parkrun.ca/*/results/*
// @match        *://www.parkrun.co.at/*/results/*
// @match        *://www.parkrun.co.nl/*/results/*
// @match        *://www.parkrun.co.nz/*/results/*
// @match        *://www.parkrun.co.za/*/results/*
// @match        *://www.parkrun.com.au/*/results/*
// @match        *://www.parkrun.com.de/*/results/*
// @match        *://www.parkrun.dk/*/results/*
// @match        *://www.parkrun.fi/*/results/*
// @match        *://www.parkrun.fr/*/results/*
// @match        *://www.parkrun.ie/*/results/*
// @match        *://www.parkrun.it/*/results/*
// @match        *://www.parkrun.jp/*/results/*
// @match        *://www.parkrun.lt/*/results/*
// @match        *://www.parkrun.my/*/results/*
// @match        *://www.parkrun.no/*/results/*
// @match        *://www.parkrun.org.uk/*/results/*
// @match        *://www.parkrun.pl/*/results/*
// @match        *://www.parkrun.se/*/results/*
// @match        *://www.parkrun.sg/*/results/*
// @match        *://www.parkrun.us/*/results/*
// @namespace    https://www.johnsy.com/finish-funnel/
// @run-at       document-end
// @tag          parkrun
// @supportURL   https://github.com/johnsyweb/finish-funnel/issues
// @screenshot-url       https://www.parkrun.com.au/albertmelbourne/results/669/
// @screenshot-selector  #finish-funnel-panel
// @screenshot-timeout   12000
// @screenshot-viewport  1200x800
// @updateURL    https://raw.githubusercontent.com/johnsyweb/finish-funnel/refs/heads/main/finish-funnel.user.js
// @version      0.0.0
// ==/UserScript==

(function(){"use strict";function Ie(e){try{const t=new URL(e).pathname.match(/^\/([^/]+)\/results\//);return t?`/${t[1]}/`:void 0}catch{return}}function Ne(e){return`finish-funnel:settings:${e}`}const C={tokensPerMinutePerVolunteer:15,volunteerCount:1,tokenSupplyBatchSize:100,tokenSupplyFetchDelaySeconds:30},E=.75,I=5,se=5,De=2,_={maximumLaneLengthMetres:30,maximumLaneCount:1,decelerationZoneMetres:I,finisherSpacingMetres:E,cordonStakeSpacingMetres:se,tokensPerMinutePerVolunteer:C.tokensPerMinutePerVolunteer,tokenSupplyBatchSize:C.tokenSupplyBatchSize,tokenSupplyFetchDelaySeconds:C.tokenSupplyFetchDelaySeconds};function Be(e,n){const t=e.getItem(n);if(!t)return{..._};try{const i=JSON.parse(t);return{..._,...i}}catch{return{..._}}}function _e(e,n,t){e.setItem(n,JSON.stringify(t))}function He({proposedMetres:e,decelerationZoneMetres:n,finisherSpacingMetres:t}){const i=Math.max(0,e-n);return t<=0?0:Math.floor(i/t)}function H({laneLengthMetres:e,decelerationZoneMetres:n,finisherSpacingMetres:t}){return He({proposedMetres:e,decelerationZoneMetres:n,finisherSpacingMetres:t})}function Q({laneCount:e,laneLengthMetres:n,decelerationZoneMetres:t,finisherSpacingMetres:i}){return H({laneLengthMetres:n,decelerationZoneMetres:t,finisherSpacingMetres:i})*e}function Qe({peakQueueDepth:e,laneLengthMetres:n,decelerationZoneMetres:t,finisherSpacingMetres:i}){const o=H({laneLengthMetres:n,decelerationZoneMetres:t,finisherSpacingMetres:i});return o===0?e>0?Number.POSITIVE_INFINITY:0:Math.ceil(e/o)}function U({laneCount:e,laneLengthMetres:n,peakQueueDepth:t,decelerationZoneMetres:i,finisherSpacingMetres:o}){const s=Q({laneCount:e,laneLengthMetres:n,decelerationZoneMetres:i,finisherSpacingMetres:o}),a=s>=t,d=s-t;return{sufficient:a,combinedLaneCapacity:s,headroomFinishers:a?d:0,shortfallFinishers:a?0:-d}}function Ue({laneCount:e,laneLengthMetres:n,peakQueueDepth:t,decelerationZoneMetres:i,finisherSpacingMetres:o}){return{...U({laneCount:e,laneLengthMetres:n,peakQueueDepth:t,decelerationZoneMetres:i,finisherSpacingMetres:o}),minimumLanesRequired:Qe({peakQueueDepth:t,laneLengthMetres:n,decelerationZoneMetres:i,finisherSpacingMetres:o})}}function Ve(e){let n="",t=e;for(;t>=0;)n=String.fromCodePoint("A".codePointAt(0)+t%26)+n,t=Math.floor(t/26)-1;return n}function ae(e){if(e==="unnamed")return-1;let n=0;for(const t of e)n=n*26+(t.codePointAt(0)-"A".codePointAt(0)+1);return n-1}function re({arrivals:e,finisherSchedules:n,laneCount:t,laneLengthMetres:i,decelerationZoneMetres:o,finisherSpacingMetres:s}){const a=H({laneLengthMetres:i,decelerationZoneMetres:o,finisherSpacingMetres:s}),d=Array.from({length:t},()=>0),l=new Map;let r="unnamed",h=0,u=!1,S;const g=[...n.map(p=>({kind:"handover",timeSeconds:p.tokenHandoverTimeSeconds,position:p.position??-1})),...e.map(p=>({kind:"arrival",timeSeconds:p.timeSeconds,arrival:p}))].sort(ze);for(const p of g){if(p.kind==="handover"){const y=l.get(p.position);y&&y.lane!=="overflow"&&(d[y.lane-1]-=1);continue}const{arrival:m}=p,v=m.position??-1,M=S,b=Oe({currentLane:S,occupancy:d,perLaneCapacity:a});if(b===void 0){l.set(v,{position:m.position,arrivalTimeSeconds:m.timeSeconds,lane:"overflow",estimated:m.estimated});continue}const c={position:m.position,arrivalTimeSeconds:m.timeSeconds,lane:b,estimated:m.estimated};t>1&&(M!==void 0&&b!==M&&(r=Ve(h),h+=1,u=!0),c.physicalBatch=r,u&&(c.isBatchMarkerHolder=!0,c.batchMarker=r,u=!1)),l.set(v,c),d[b-1]+=1,S=b}return[...l.values()].sort((p,m)=>p.arrivalTimeSeconds!==m.arrivalTimeSeconds?p.arrivalTimeSeconds-m.arrivalTimeSeconds:(p.position??0)-(m.position??0))}function ze(e,n){if(e.timeSeconds!==n.timeSeconds)return e.timeSeconds-n.timeSeconds;if(e.kind!==n.kind)return e.kind==="handover"?-1:1;const t=e.kind==="handover"?e.position:e.arrival.position??0,i=n.kind==="handover"?n.position:n.arrival.position??0;return t-i}function Oe({currentLane:e,occupancy:n,perLaneCapacity:t}){return e!==void 0&&n[e-1]<t?e:Ze(n,t)}function Ze(e,n){for(let t=1;t<=e.length;t+=1)if(e[t-1]<n)return t}function We(e,n){for(let t=n-1;t>=0;t-=1){const i=e[t].timeSeconds;if(i!==null)return i}return null}function Ke(e,n){for(let t=n+1;t<e.length;t+=1){const i=e[t].timeSeconds;if(i!==null)return i}return null}function je(e){return e.map((n,t)=>{if(n.timeSeconds!==null)return{position:n.position,timeSeconds:n.timeSeconds,estimated:!1};const i=We(e,t),o=Ke(e,t),s=i??o??0;return{position:n.position,timeSeconds:s,estimated:s>0}})}const V={top:16,right:16,bottom:36,left:48};function le(e){if(e.length===0)throw new Error("Chart points are required");return{minTimeSeconds:e[0].timeSeconds,maxTimeSeconds:e[e.length-1].timeSeconds}}function z(e,n){return Math.min(n.maxTimeSeconds,Math.max(n.minTimeSeconds,e))}function Xe(e,n,t,i=V){const o=n-i.left-i.right,s=e-i.left,a=Math.min(1,Math.max(0,s/o)),d=t.maxTimeSeconds-t.minTimeSeconds||1;return z(t.minTimeSeconds+a*d,t)}function Ge(e,n,t){return z(e+n,t)}function ue(e,n,t,i=V){const o=n-i.left-i.right,s=t.maxTimeSeconds-t.minTimeSeconds||1,a=(e-t.minTimeSeconds)/s;return i.left+a*o}function Ye(e,n,t){const i=n.getBoundingClientRect(),o=n.clientWidth/i.width||1,s=(e-i.left)*o;return Xe(s,n.clientWidth,t)}const Je=8;function en(e){return e.filter(n=>n.batchMarker!==void 0).map(n=>({letter:n.batchMarker,momentSeconds:n.arrivalTimeSeconds})).sort((n,t)=>n.momentSeconds-t.momentSeconds)}function nn(e,n,t){const i=[...n].sort((o,s)=>o.momentSeconds-s.momentSeconds);return t==="next"?i.find(o=>o.momentSeconds>e)?.momentSeconds:[...i].reverse().find(o=>o.momentSeconds<e)?.momentSeconds}function tn(e,n,t,i,o=Je){for(const s of i){const a=ue(s.momentSeconds,n,t);if(Math.abs(e-a)<=o)return s.momentSeconds}}function on(e,n,t,i){const o=n.getBoundingClientRect(),s=n.clientWidth/o.width||1,a=(e-o.left)*s;return tn(a,n.clientWidth,t,i)}const O=.25;function ce({laneLengthMetres:e,decelerationZoneMetres:n}){return Math.max(0,e-n)}function de(e){return ce(e)}function me({finisherSpacingMetres:e,laneLengthMetres:n,decelerationZoneMetres:t,minimumFinisherSpacingMetres:i=O}){const o=de({laneLengthMetres:n,decelerationZoneMetres:t});return o<i?i:Math.min(o,Math.max(i,e))}function Z({rawValue:e,fallback:n,laneLengthMetres:t,decelerationZoneMetres:i}){const o=Number(e);return me({finisherSpacingMetres:Number.isFinite(o)&&o>0?o:n,laneLengthMetres:t,decelerationZoneMetres:i})}function sn({rawValue:e,laneLengthMetres:n,decelerationZoneMetres:t,fallback:i=E}){const o=Z({rawValue:e,fallback:i,laneLengthMetres:n,decelerationZoneMetres:t}),s=de({laneLengthMetres:n,decelerationZoneMetres:t}),a=String(Math.max(O,s));return{value:String(o),max:a,metres:o}}function an(e,n){if(e===""||e==="0")return!0;if(/^0\.$/.test(e))return!1;const t=Number(e);return!Number.isFinite(t)||t<=0||t>Number(n.max)||t>0&&t<O}function rn(e){return Math.max(0,e.tokenHandoverTimeSeconds-e.arrivalTimeSeconds)}function ln(e){if(e.length===0)return 0;const n=[...e].sort((s,a)=>s-a),t=Math.floor(n.length/2);if(n.length%2===1)return n[t]??0;const i=n[t-1]??0,o=n[t]??0;return(i+o)/2}function un(e){const n=e.map(rn);if(n.length===0)return{maxSeconds:0,meanSeconds:0,medianSeconds:0,finisherCount:0};const t=n.reduce((i,o)=>i+o,0);return{maxSeconds:Math.max(...n),meanSeconds:t/n.length,medianSeconds:ln(n),finisherCount:n.length}}function cn({publishedArrivals:e,effectiveArrivals:n}){const t=new Map(e.map(s=>[s.position??-1,s])),i=[];for(const s of n){const a=t.get(s.position??-1);if(!a)continue;const d=s.timeSeconds-a.timeSeconds;d>0&&i.push(d)}if(i.length===0)return;const o=i.reduce((s,a)=>s+a,0);return{maxDelaySeconds:Math.max(...i),averageDelaySeconds:o/i.length,delayedFinisherCount:i.length}}function dn(e){const n=e.trim();if(!n||n.toLowerCase()==="unknown")return null;const t=n.match(/^(\d+):(\d+):(\d+)$/);if(t){const a=Number(t[1]),d=Number(t[2]),l=Number(t[3]);return a*3600+d*60+l}const i=n.match(/^(\d+):(\d+)$/);if(!i)return null;const o=Number(i[1]),s=Number(i[2]);return o*60+s}function mn({queueCapacity:e,decelerationZoneMetres:n,finisherSpacingMetres:t}){const i=e*t,o=n+i;return Math.ceil(o)}function fn({laneCount:e,peakQueueDepth:n,maximumLaneLengthMetres:t,decelerationZoneMetres:i,finisherSpacingMetres:o}){if(e<=0||t<0)return;let s=mn({queueCapacity:Math.ceil(n/e),decelerationZoneMetres:i,finisherSpacingMetres:o});for(;s<=t;){if(Q({laneCount:e,laneLengthMetres:s,decelerationZoneMetres:i,finisherSpacingMetres:o})>=n)return s;s+=1}}function hn({peakQueueDepth:e,maximumLaneLengthMetres:n,maximumLaneCount:t,decelerationZoneMetres:i,finisherSpacingMetres:o}){const s=Math.max(1,t),a=Math.max(0,n);for(let r=1;r<=s;r+=1){const h=fn({laneCount:r,peakQueueDepth:e,maximumLaneLengthMetres:a,decelerationZoneMetres:i,finisherSpacingMetres:o});if(h!==void 0)return{laneCount:r,laneLengthMetres:h,...U({laneCount:r,laneLengthMetres:h,peakQueueDepth:e,decelerationZoneMetres:i,finisherSpacingMetres:o})}}const d=s,l=a;return{laneCount:d,laneLengthMetres:l,...U({laneCount:d,laneLengthMetres:l,peakQueueDepth:e,decelerationZoneMetres:i,finisherSpacingMetres:o})}}function pn(e,n){return{activeIndex:0,volunteers:Array.from({length:e},()=>({tokensRemaining:n,batchReadyAt:0}))}}function fe(e,n,t){e.tokensRemaining===0&&e.batchReadyAt<=n&&(e.tokensRemaining=t)}function gn({pool:e,timeSeconds:n,batchSize:t,fetchDelaySeconds:i,secondsPerToken:o}){const s=e.volunteers[e.activeIndex];if(s.tokensRemaining-=1,s.tokensRemaining>0)return{nextHandoverTimeSeconds:n+o};const a=e.activeIndex;e.volunteers[a].batchReadyAt=n+i,e.volunteers[a].tokensRemaining=0;for(let l=1;l<=e.volunteers.length;l+=1){const r=(a+l)%e.volunteers.length,h=e.volunteers[r];if(fe(h,n,t),h.tokensRemaining>0)return e.activeIndex=r,{nextHandoverTimeSeconds:n+o}}const d=Math.min(...e.volunteers.filter(l=>l.batchReadyAt>n).map(l=>l.batchReadyAt));for(let l=1;l<=e.volunteers.length;l+=1){const r=(a+l)%e.volunteers.length,h=e.volunteers[r];if(fe(h,d,t),h.tokensRemaining>0){e.activeIndex=r;break}}return{nextHandoverTimeSeconds:d+o,gap:{startSeconds:n,endSeconds:d}}}function Sn(e){if(e.length===0)return;const n=e.reduce((t,i)=>t+(i.endSeconds-i.startSeconds),0);return{gapCount:e.length,totalPauseSeconds:n}}function yn(e,n,t={}){const i=[...e].sort((c,y)=>c.timeSeconds-y.timeSeconds),o=60/n.tokensPerMinutePerVolunteer,s=pn(n.volunteerCount,n.tokenSupplyBatchSize),a=[],d=[],l=[];let r=0,h=Number.POSITIVE_INFINITY;const u=[],S=[],{maxQueueDepth:g}=t,p=c=>{u.push({timeSeconds:c,queueDepth:d.length})},m=c=>{const{nextHandoverTimeSeconds:y,gap:R}=gn({pool:s,timeSeconds:c,batchSize:n.tokenSupplyBatchSize,fetchDelaySeconds:n.tokenSupplyFetchDelaySeconds,secondsPerToken:o});R!==void 0&&a.push(R),h=d.length>0?y:Number.POSITIVE_INFINITY},v=c=>{const y=d.shift();y&&(S.push({position:y.position,arrivalTimeSeconds:y.arrivalTimeSeconds,tokenHandoverTimeSeconds:c,finishTokensVolunteerNumber:s.activeIndex+1,estimated:y.estimated}),p(c),m(c))},M=c=>{for(;h<=c&&d.length>0;)v(h)},b=c=>{if(g===void 0||g<=0)return c;let y=c;for(;d.length>=g;){if(h===Number.POSITIVE_INFINITY)return y;y=Math.max(y,h),M(y)}return y};for(const c of i){const y=b(c.timeSeconds);M(y),d.push({position:c.position,arrivalTimeSeconds:y,estimated:c.estimated}),l.push({position:c.position,timeSeconds:y,estimated:c.estimated}),r=Math.max(r,d.length),p(y),d.length>0&&h===Number.POSITIVE_INFINITY&&(h=y+o)}for(;d.length>0;)v(h);return{peakQueueDepth:r,queueDepthOverTime:u,funnelNotRequired:r<=De,finisherSchedules:S,effectiveArrivals:l,tokenSupplyGaps:Sn(a)}}function W(e){const n=e.finishTokensSettings??C,t=e.decelerationZoneMetres??I,i=e.finisherSpacingMetres??E,o=e.laneCount!==void 0&&e.laneLengthMetres!==void 0,s=o?Q({laneCount:e.laneCount,laneLengthMetres:e.laneLengthMetres,decelerationZoneMetres:t,finisherSpacingMetres:i}):void 0,a=s!==void 0&&s>0?s:void 0;return{...yn(e.arrivals,n,a===void 0?{}:{maxQueueDepth:a}),finishLineBackupModelled:o&&s!==void 0&&s>0}}function vn(e){const n=new Map;for(const i of e){const o=Math.floor(i.timeSeconds),s=n.get(o)??[];s.push(i),n.set(o,s)}const t=[];for(const[i,o]of n){if(o.length===1){t.push(o[0]);continue}for(let s=0;s<o.length;s+=1)t.push({...o[s],timeSeconds:i+s/o.length})}return t.sort((i,o)=>i.timeSeconds-o.timeSeconds)}function he(e){const n=[...e].sort((i,o)=>i.position-o.position),t=je(n.map(i=>({position:i.position,timeSeconds:dn(i.time)})));return vn(t.map(i=>({timeSeconds:i.timeSeconds,estimated:i.estimated,position:i.position})))}function N(e){const n=e.finishTokensSettings??C,t=e.decelerationZoneMetres??I,i=e.laneLengthMetres,o=i===void 0?e.finisherSpacingMetres??E:me({finisherSpacingMetres:e.finisherSpacingMetres??E,laneLengthMetres:i,decelerationZoneMetres:t}),s=he(e.finishers),a=W({arrivals:s,finishTokensSettings:n,decelerationZoneMetres:t,finisherSpacingMetres:o}),d=e.maximumLaneCount===void 0||e.maximumLaneLengthMetres===void 0?void 0:hn({peakQueueDepth:a.peakQueueDepth,maximumLaneLengthMetres:e.maximumLaneLengthMetres,maximumLaneCount:e.maximumLaneCount,decelerationZoneMetres:t,finisherSpacingMetres:o}),l=e.laneCount===void 0||e.laneLengthMetres===void 0?a:W({arrivals:s,finishTokensSettings:n,laneCount:e.laneCount,laneLengthMetres:e.laneLengthMetres,decelerationZoneMetres:t,finisherSpacingMetres:o}),r=l.effectiveArrivals,h=l.finishLineBackupModelled?cn({publishedArrivals:s,effectiveArrivals:r}):void 0,u=e.laneCount===void 0||e.laneLengthMetres===void 0?void 0:Ue({laneCount:e.laneCount,laneLengthMetres:e.laneLengthMetres,peakQueueDepth:a.peakQueueDepth,decelerationZoneMetres:t,finisherSpacingMetres:o}),S=e.laneCount===void 0||e.laneLengthMetres===void 0?[]:en(re({arrivals:r,finisherSchedules:l.finisherSchedules,laneCount:e.laneCount,laneLengthMetres:e.laneLengthMetres,decelerationZoneMetres:t,finisherSpacingMetres:o}));return{peakQueueDepth:a.peakQueueDepth,funnelNotRequired:a.funnelNotRequired,queueDepthOverTime:l.queueDepthOverTime,arrivals:r,recommendedFunnelLayout:d,proposedMultiLaneLayout:u,batchMarkerMoments:S,finishLineBackupModelled:l.finishLineBackupModelled,finishLineBackupDelays:h,tokenSupplyGaps:l.tokenSupplyGaps,eventQueueTimeSummary:un(l.finisherSchedules)}}function q(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Mn(e){if(e.physicalBatch===void 0)return;const n=q(e.physicalBatch);return e.isBatchMarkerHolder?`${n} <span class="finish-funnel-batch-card" aria-label="${n}, batch marker holder">card</span>`:n}function bn(e){const n=[];e.lane&&n.push(`Lane ${q(e.lane)}`);const t=Mn(e);return t&&n.push(`batch ${t}`),e.queuePosition&&n.push(`queue ${q(e.queuePosition)}`),e.timeWaiting&&n.push(`waiting ${q(e.timeWaiting)}`),e.timeUntilToken&&n.push(`token in ${q(e.timeUntilToken)}`),e.totalEstimatedQueueingTime&&n.push(`total ${q(e.totalEstimatedQueueingTime)}`),e.finishTokensVolunteer&&n.push(q(e.finishTokensVolunteer)),e.estimated&&n.push("estimated arrival"),n.join(" · ")}function kn(e){const n=q(e.status),t=bn(e);return`<div class="compact">${n}</div><div class="detailed">${t}</div>`}function pe(){return'<div class="compact"></div><div class="detailed"></div>'}function ge(e){return new Map(e.map(n=>[n.position,kn(n)]))}function F(e){const n=Math.floor(e),t=Math.floor(n/3600),i=Math.floor(n%3600/60),o=n%60,s=String(i).padStart(2,"0"),a=String(o).padStart(2,"0");return t>0?`${t}:${s}:${a}`:`${i}:${a}`}function Ln(e){return`Finish Tokens ${e}`}function Tn({publishedArrivals:e,effectiveArrivals:n,momentSeconds:t}){const i=new Map(n.map(o=>[o.position??-1,o]));return e.filter(o=>{const s=i.get(o.position??-1);return s?o.timeSeconds<=t&&s.timeSeconds>t:!1}).length}function xn({queuedPositions:e,laneAssignments:n,laneCount:t,laneLengthMetres:i,decelerationZoneMetres:o,finisherSpacingMetres:s,finishLineBlockedCount:a}){const d=new Map(n.map(u=>[u.position,u])),l=H({laneLengthMetres:i,decelerationZoneMetres:o,finisherSpacingMetres:s}),r=ce({laneLengthMetres:i,decelerationZoneMetres:o}),h=[];for(let u=1;u<=t;u+=1){const S=e.map(m=>d.get(m)).filter(m=>m!==void 0&&m.lane===u),g=new Map;for(const m of S)m.physicalBatch!==void 0&&g.set(m.physicalBatch,(g.get(m.physicalBatch)??0)+1);const p=[...g.entries()].map(([m,v])=>({label:m,count:v})).sort((m,v)=>ae(m.label)-ae(v.label));h.push({laneNumber:u,queuedCount:S.length,maxFinishers:l,occupiedMetres:S.length*s,maxMetres:r,batches:t>1?p:[]})}return{queueDepth:e.length,finishLineBlockedCount:a===void 0||a===0?void 0:a,lanes:h}}function Se(e){return e.toFixed(1)}function K(e){return F(Math.max(0,e))}function ye(e,n){if(e.length===0)return 0;const t=e.find(s=>s.queueDepth===n);if(t)return t.timeSeconds;const i=Math.max(...e.map(s=>s.queueDepth));return e.find(s=>s.queueDepth===i)?.timeSeconds??e[0].timeSeconds}function Cn(e,n){return e.arrivalTimeSeconds<=n&&e.tokenHandoverTimeSeconds>n}function Fn(e){return e==="overflow"?"Overflow":String(e)}function wn(e,n){if(!(e===void 0||n<=1))return e==="unnamed"?"unnamed":e}function $n({publishedArrivalSeconds:e,effectiveArrivalSeconds:n,tokenHandoverSeconds:t,momentSeconds:i,finishLineBackupModelled:o}){return e>i?"not-yet-finished":o&&n>i?"finish-line-blocked":t>i?"queued":"tokened"}function ve(e){return e==="finish-line-blocked"?"At finish line":e==="queued"?"In queue":""}function Me(e){const n=e.finishTokensSettings??C,t=e.decelerationZoneMetres??I,i=e.finisherSpacingMetres??E,o=e.laneCount??1,s=e.laneLengthMetres??30,a=he(e.finishers),d=new Map(a.map(c=>[c.position??-1,c])),l=W({arrivals:a,finishTokensSettings:n,laneCount:o,laneLengthMetres:s,decelerationZoneMetres:t,finisherSpacingMetres:i}),r=new Map(l.effectiveArrivals.map(c=>[c.position??-1,c])),h=new Map(l.finisherSchedules.map(c=>[c.position??-1,c])),u=re({arrivals:l.effectiveArrivals,finisherSchedules:l.finisherSchedules,laneCount:o,laneLengthMetres:s,decelerationZoneMetres:t,finisherSpacingMetres:i}),S=new Map(u.map(c=>[c.position,c])),g=l.finisherSchedules.filter(c=>Cn(c,e.momentSeconds)).sort((c,y)=>c.arrivalTimeSeconds-y.arrivalTimeSeconds),p=new Map(g.map((c,y)=>[c.position??-1,y+1])),m=l.finishLineBackupModelled?Tn({publishedArrivals:a,effectiveArrivals:l.effectiveArrivals,momentSeconds:e.momentSeconds}):void 0,v=xn({queuedPositions:g.map(c=>c.position).filter(c=>c!==void 0),laneAssignments:u,laneCount:o,laneLengthMetres:s,decelerationZoneMetres:t,finisherSpacingMetres:i,finishLineBlockedCount:m}),M=[...e.finishers].sort((c,y)=>c.position-y.position).map(c=>Pn({finisher:c,momentSeconds:e.momentSeconds,laneCount:o,finishLineBackupModelled:l.finishLineBackupModelled,publishedByPosition:d,effectiveByPosition:r,scheduleByPosition:h,laneByPosition:S,queuePositionByPosition:p}));let b=M;if(e.nameFilter){const c=e.nameFilter.toLowerCase();b=b.filter(y=>y.name.toLowerCase().includes(c))}return e.finishPositionFilter!==void 0&&(b=b.filter(c=>c.position===e.finishPositionFilter)),{selectedMomentSeconds:e.momentSeconds,queueDepth:g.length,totalCount:M.length,visibleCount:b.length,queueMomentSummary:v,finishers:b}}function Pn({finisher:e,momentSeconds:n,laneCount:t,finishLineBackupModelled:i,publishedByPosition:o,effectiveByPosition:s,scheduleByPosition:a,laneByPosition:d,queuePositionByPosition:l}){const r=o.get(e.position),h=s.get(e.position),u=a.get(e.position),S=e.time.trim().toLowerCase()==="unknown"||u?.estimated===!0;if(!r||!h||!u)throw new Error(`Simulation schedule not found for position ${e.position}`);const g=$n({publishedArrivalSeconds:r.timeSeconds,effectiveArrivalSeconds:h.timeSeconds,tokenHandoverSeconds:u.tokenHandoverTimeSeconds,momentSeconds:n,finishLineBackupModelled:i}),p=d.get(e.position);if(g==="not-yet-finished")return En(e,S);if(g==="finish-line-blocked")return{position:e.position,name:e.name,publishedFinishTime:e.time,estimated:S,state:g,status:ve(g),lane:"",queuePosition:"",timeWaiting:"",timeUntilToken:"",totalEstimatedQueueingTime:"",finishTokensVolunteer:""};const m=Fn(p?.lane??"overflow"),v=wn(p?.physicalBatch,t),M=K(u.tokenHandoverTimeSeconds-u.arrivalTimeSeconds);return g==="queued"?{position:e.position,name:e.name,publishedFinishTime:e.time,estimated:S,state:g,status:ve(g),lane:m,physicalBatch:v,isBatchMarkerHolder:p?.isBatchMarkerHolder,queuePosition:String(l.get(e.position)??""),timeWaiting:K(n-u.arrivalTimeSeconds),timeUntilToken:K(u.tokenHandoverTimeSeconds-n),totalEstimatedQueueingTime:M,finishTokensVolunteer:""}:{position:e.position,name:e.name,publishedFinishTime:e.time,estimated:S,state:g,status:"",lane:m,physicalBatch:v,isBatchMarkerHolder:p?.isBatchMarkerHolder,queuePosition:"",timeWaiting:M,timeUntilToken:"",totalEstimatedQueueingTime:M,finishTokensVolunteer:u.finishTokensVolunteerNumber===void 0?"":Ln(u.finishTokensVolunteerNumber)}}function En(e,n){return{position:e.position,name:e.name,publishedFinishTime:e.time,estimated:n,state:"not-yet-finished",status:"",lane:"",queuePosition:"",timeWaiting:"",timeUntilToken:"",totalEstimatedQueueingTime:"",finishTokensVolunteer:""}}function j(e){return e.replace(/,\s*$/,"").trim()}function qn(e){return e.filter(n=>j(n.role)==="Finish Tokens").length}function be(e){return e.some(n=>j(n.role)==="Finish Token Support")}function Rn(e,n=C){const t=qn(e);return{...n,volunteerCount:t>0?t:n.volunteerCount,tokenSupplyFetchDelaySeconds:be(e)?0:n.tokenSupplyFetchDelaySeconds}}function ke({persisted:e,volunteers:n}){const t=Rn(n,{tokensPerMinutePerVolunteer:e.tokensPerMinutePerVolunteer,volunteerCount:C.volunteerCount,tokenSupplyBatchSize:e.tokenSupplyBatchSize,tokenSupplyFetchDelaySeconds:e.tokenSupplyFetchDelaySeconds});return{tokensPerMinutePerVolunteer:e.tokensPerMinutePerVolunteer,tokenSupplyBatchSize:e.tokenSupplyBatchSize,volunteerCount:t.volunteerCount,tokenSupplyFetchDelaySeconds:t.tokenSupplyFetchDelaySeconds}}function An(e){const t=e.querySelector(".Results-table-td--time .compact")?.textContent?.trim()??"";return t.length>0?t:"Unknown"}function In(e){const n=e.querySelectorAll("tr.Results-table-row[data-position]"),t=[];for(const i of n){const o=Number(i.getAttribute("data-position"));Number.isFinite(o)&&t.push({position:o,name:i.getAttribute("data-name")??"",time:An(i)})}return t}function Nn(e){const n=e.querySelectorAll("tr.Volunteers-table-row[data-role]"),t=[];for(const i of n){const o=i.getAttribute("data-role");o&&t.push({name:i.getAttribute("data-name")??"",role:j(o)})}return t}const Dn={laneCount:1,laneLengthMetres:30};function Bn(e,{persisted:n,momentSeconds:t}){const i=e.querySelector("table.Results-table.js-ResultsTable");if(!i)return;const o=In(e);if(o.length===0)return;const s=Nn(e),a=ke({persisted:n,volunteers:s}),l=N({finishers:o,finishTokensSettings:a,decelerationZoneMetres:n.decelerationZoneMetres,finisherSpacingMetres:n.finisherSpacingMetres,maximumLaneCount:n.maximumLaneCount,maximumLaneLengthMetres:n.maximumLaneLengthMetres}).recommendedFunnelLayout??Dn,r=N({finishers:o,finishTokensSettings:a,decelerationZoneMetres:n.decelerationZoneMetres,finisherSpacingMetres:n.finisherSpacingMetres,maximumLaneCount:n.maximumLaneCount,maximumLaneLengthMetres:n.maximumLaneLengthMetres,laneCount:l.laneCount,laneLengthMetres:l.laneLengthMetres}),h=t??ye(r.queueDepthOverTime,r.peakQueueDepth),u=Me({finishers:o,finishTokensSettings:a,momentSeconds:h,laneCount:l.laneCount,laneLengthMetres:l.laneLengthMetres,decelerationZoneMetres:n.decelerationZoneMetres,finisherSpacingMetres:n.finisherSpacingMetres});return{table:i,finishers:o,volunteers:s,finishTokensSettings:a,layout:l,analysis:r,momentSeconds:h,finishFunnelMarkupByPosition:ge(u.finishers)}}const X="Results-table-th--finishFunnel",G="Results-table-td--finishFunnel";function _n(e){const n=e.querySelector("thead tr");if(!n||n.querySelector(`.${X}`))return;const t=document.createElement("th");t.className=`Results-table-th ${X}`,t.textContent="Finish funnel",n.append(t)}function Hn(e,n){let t=e.querySelector(`.${G}`);t||(t=document.createElement("td"),t.className=`Results-table-td ${G}`,e.append(t)),t.innerHTML=n}function Qn(e,n){_n(e);for(const t of e.querySelectorAll("tr.Results-table-row")){const i=Number(t.getAttribute("data-position")),o=Number.isFinite(i)?n.get(i)??pe():pe();Hn(t,o)}}function Un(e){e.querySelector(`.${X}`)?.remove();for(const n of e.querySelectorAll(`.${G}`))n.remove()}function Vn(e,n){const t=e.querySelector("tbody.js-ResultsTbody");if(!t)return()=>{};const i=new MutationObserver(()=>{n()});return i.observe(t,{childList:!0,subtree:!1}),()=>{i.disconnect()}}function zn(e,n){if(typeof ResizeObserver>"u")return()=>{};const t=new ResizeObserver(()=>{n()});return t.observe(e),()=>t.disconnect()}function On({canvas:e,getRange:n,getMoment:t,getBatchMarkerMoments:i,onMomentChange:o}){let s=!1;const a=u=>{const S=on(u,e,n(),i());o(S??Ye(u,e,n()))},d=u=>{s=!0,a(u.clientX)},l=u=>{s&&a(u.clientX)},r=()=>{s=!1},h=u=>{if(u.key==="PageUp"||u.key==="PageDown"){u.preventDefault();const g=u.key==="PageDown"?"next":"previous",p=nn(t(),i(),g);p!==void 0&&o(p);return}if(u.key!=="ArrowLeft"&&u.key!=="ArrowRight")return;u.preventDefault();const S=u.key==="ArrowLeft"?-1:1;o(Ge(t(),S,n()))};return e.addEventListener("mousedown",d),e.addEventListener("mousemove",l),window.addEventListener("mouseup",r),e.addEventListener("mouseleave",r),e.addEventListener("keydown",h),()=>{e.removeEventListener("mousedown",d),e.removeEventListener("mousemove",l),window.removeEventListener("mouseup",r),e.removeEventListener("mouseleave",r),e.removeEventListener("keydown",h)}}function Zn({laneCount:e,laneLengthMetres:n,maximumLaneCount:t,maximumLaneLengthMetres:i}){return{laneCount:Math.min(Math.max(1,e),Math.max(1,t)),laneLengthMetres:Math.min(Math.max(0,n),Math.max(0,i))}}function Le(e,n){return e.laneCount===n.laneCount&&e.laneLengthMetres===n.laneLengthMetres}function Wn({persisted:e,finisherSpacingRaw:n}){return JSON.stringify({tokensPerMinutePerVolunteer:e.tokensPerMinutePerVolunteer,tokenSupplyBatchSize:e.tokenSupplyBatchSize,tokenSupplyFetchDelaySeconds:e.tokenSupplyFetchDelaySeconds,decelerationZoneMetres:e.decelerationZoneMetres,maximumLaneLengthMetres:e.maximumLaneLengthMetres,maximumLaneCount:e.maximumLaneCount,finisherSpacingRaw:n})}function Kn(e){const{finishers:n,persisted:t,finishTokensSettings:i,layoutRaw:o,finisherSpacingRaw:s,previousSettingsStateKey:a}=e,d=Wn({persisted:t,finisherSpacingRaw:s}),l=d!==a;let r=o;if(l){const p=N({finishers:n,finishTokensSettings:i,decelerationZoneMetres:t.decelerationZoneMetres,finisherSpacingMetres:Z({rawValue:s,fallback:t.finisherSpacingMetres,laneLengthMetres:r.laneLengthMetres,decelerationZoneMetres:t.decelerationZoneMetres}),maximumLaneCount:t.maximumLaneCount,maximumLaneLengthMetres:t.maximumLaneLengthMetres,laneCount:r.laneCount,laneLengthMetres:r.laneLengthMetres});p.recommendedFunnelLayout!==void 0&&(r={laneCount:p.recommendedFunnelLayout.laneCount,laneLengthMetres:p.recommendedFunnelLayout.laneLengthMetres})}const h=Zn({...r,maximumLaneCount:t.maximumLaneCount,maximumLaneLengthMetres:t.maximumLaneLengthMetres}),u=sn({rawValue:s,laneLengthMetres:h.laneLengthMetres,decelerationZoneMetres:t.decelerationZoneMetres,fallback:E}),S=l?u.metres:Z({rawValue:s,fallback:t.finisherSpacingMetres,laneLengthMetres:h.laneLengthMetres,decelerationZoneMetres:t.decelerationZoneMetres});return{analysis:N({finishers:n,finishTokensSettings:i,decelerationZoneMetres:t.decelerationZoneMetres,finisherSpacingMetres:S,maximumLaneCount:t.maximumLaneCount,maximumLaneLengthMetres:t.maximumLaneLengthMetres,laneCount:h.laneCount,laneLengthMetres:h.laneLengthMetres}),layout:h,settingsStateKey:d,layoutResynced:l,finisherSpacingMetres:S,syncedFinisherSpacing:{value:u.value,max:u.max}}}const f={tokensPerMinute:"finish-funnel-tokens-per-minute",volunteerCount:"finish-funnel-volunteer-count",tokenSupplyBatchSize:"finish-funnel-token-supply-batch-size",tokenSupplyFetchDelay:"finish-funnel-token-supply-fetch-delay",maximumLaneLength:"finish-funnel-maximum-lane-length",maximumLaneCount:"finish-funnel-maximum-lane-count",decelerationZone:"finish-funnel-deceleration-zone",finisherSpacing:"finish-funnel-finisher-spacing",cordonStakeSpacing:"finish-funnel-cordon-stake-spacing",layoutLaneCount:"finish-funnel-layout-lane-count",layoutLaneLength:"finish-funnel-layout-lane-length",resetToModelRecommendation:"finish-funnel-reset-to-model-recommendation"};function jn({persisted:e,volunteerCount:n,fetchDelayOverridden:t}){const i=t?'readonly aria-readonly="true"':"";return`<fieldset class="finish-funnel-fieldset">
      <legend>Finish Tokens</legend>
      <div class="finish-funnel-field">
        <label for="${f.tokensPerMinute}">Tokens per minute (active volunteer)</label>
        <input id="${f.tokensPerMinute}" type="number" min="1" step="1" value="${e.tokensPerMinutePerVolunteer}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.volunteerCount}">Finish Tokens volunteers in rotation</label>
        <input id="${f.volunteerCount}" type="number" min="1" step="1" value="${n}" readonly aria-readonly="true" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.tokenSupplyBatchSize}">Token supply batch size</label>
        <input id="${f.tokenSupplyBatchSize}" type="number" min="1" step="1" value="${e.tokenSupplyBatchSize}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.tokenSupplyFetchDelay}">Token supply fetch delay (s)</label>
        <input id="${f.tokenSupplyFetchDelay}" type="number" min="0" step="1" value="${t?0:e.tokenSupplyFetchDelaySeconds}" ${i} />
      </div>
    </fieldset>`}function Xn(e){return`<fieldset class="finish-funnel-fieldset">
      <legend>Site constraints</legend>
      <div class="finish-funnel-field">
        <label for="${f.maximumLaneLength}">Maximum lane length (m)</label>
        <input id="${f.maximumLaneLength}" type="number" min="0" step="1" value="${e.maximumLaneLengthMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.maximumLaneCount}">Maximum lane count</label>
        <input id="${f.maximumLaneCount}" type="number" min="1" step="1" value="${e.maximumLaneCount}" />
      </div>
    </fieldset>`}function Gn(e){return`<fieldset class="finish-funnel-fieldset">
      <legend>Layout assumptions</legend>
      <div class="finish-funnel-field">
        <label for="${f.decelerationZone}">Deceleration zone (m)</label>
        <input id="${f.decelerationZone}" type="number" min="0" step="0.5" value="${e.decelerationZoneMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.finisherSpacing}">Finisher spacing (m)</label>
        <input id="${f.finisherSpacing}" type="number" min="0.25" step="0.05" value="${e.finisherSpacingMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.cordonStakeSpacing}">Cordon stake spacing (m)</label>
        <input id="${f.cordonStakeSpacing}" type="number" min="1" step="1" value="${e.cordonStakeSpacingMetres}" />
      </div>
    </fieldset>`}function Yn(e){return`<fieldset class="finish-funnel-fieldset">
      <legend>Layout</legend>
      <div class="finish-funnel-field">
        <label for="${f.layoutLaneLength}">Lane length (m)</label>
        <input id="${f.layoutLaneLength}" type="number" min="0" step="1" value="${e.laneLengthMetres}" />
      </div>
      <div class="finish-funnel-field">
        <label for="${f.layoutLaneCount}">Lane count</label>
        <input id="${f.layoutLaneCount}" type="number" min="1" step="1" value="${e.laneCount}" />
      </div>
      <div class="finish-funnel-field">
        <button type="button" id="${f.resetToModelRecommendation}" hidden>Reset to model recommendation</button>
      </div>
    </fieldset>`}function Jn({persisted:e,layout:n,volunteerCount:t,fetchDelayOverridden:i}){return`<section class="finish-funnel-panel-section" id="finish-funnel-settings" aria-labelledby="finish-funnel-settings-heading">
  <h3 id="finish-funnel-settings-heading">Settings</h3>
  <div class="finish-funnel-settings-row">
    ${jn({persisted:e,volunteerCount:t,fetchDelayOverridden:i})}
    ${Xn(e)}
  </div>
  <div class="finish-funnel-settings-row">
    ${Gn(e)}
    ${Yn(n)}
  </div>
</section>`}function et({persisted:e,layout:n,volunteerCount:t,fetchDelayOverridden:i}){return`<h2 class="finish-funnel-panel-heading">Finish Funnel</h2>
${Jn({persisted:e,layout:n,volunteerCount:t,fetchDelayOverridden:i})}
<div id="finish-funnel-callout" role="status" aria-live="polite" hidden></div>
<section class="metrics" id="finish-funnel-metrics" aria-live="polite" aria-atomic="true"></section>
<section class="finish-funnel-panel-section" id="finish-funnel-on-the-day" aria-live="polite">
  <h3>On the day</h3>
  <div id="finish-funnel-layout-setup-mount"></div>
</section>
<section class="finish-funnel-panel-section" id="finish-funnel-chart-section">
  <h3>Queue depth over finish time</h3>
  <p id="finish-funnel-chart-selected-moment" class="chart-selected-moment" aria-live="polite"></p>
  <div class="chart-wrap" id="finish-funnel-chart-wrap">
    <canvas
      id="finish-funnel-queue-chart"
      tabindex="0"
      role="img"
      aria-describedby="finish-funnel-chart-legend"
      aria-label="Queue depth over finish time. Click or drag to choose a moment; use arrow keys when focused; use Page Up and Page Down to jump between batch marker moments."
    ></canvas>
  </div>
  <div id="finish-funnel-chart-legend-mount" class="chart-legend-mount"></div>
</section>
<section class="finish-funnel-panel-section" id="finish-funnel-queue-moment-section" aria-live="polite">
  <h3 id="finish-funnel-queue-moment-heading">Queue at selected moment</h3>
  <div id="finish-funnel-queue-summary-mount"></div>
</section>`}const Te="finish-funnel-panel-styles",nt=`
#finish-funnel-panel {
  --ff-bg: #ffffff;
  --ff-surface: #f6f4f8;
  --ff-text: #2b223d;
  --ff-muted: #5c5470;
  --ff-accent: #ffa300;
  --ff-ok: #2d8a6e;
  --ff-warn: #c0392b;
  --ff-border: rgba(43, 34, 61, 0.14);
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--ff-border);
  border-radius: 8px;
  background: var(--ff-bg);
  color: var(--ff-text);
  line-height: 1.5;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

#finish-funnel-panel h2,
#finish-funnel-panel h3 {
  color: var(--ff-accent);
  margin: 0 0 0.75rem;
}

#finish-funnel-panel .finish-funnel-panel-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ff-border);
}

#finish-funnel-panel .metrics {
  display: grid;
  gap: 0.75rem;
}

#finish-funnel-panel .metric {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: var(--ff-surface);
}

#finish-funnel-panel .metric span {
  display: block;
  font-size: 0.9rem;
  color: var(--ff-muted);
}

#finish-funnel-panel .metric strong {
  display: block;
  font-size: 1.25rem;
  color: var(--ff-accent);
}

#finish-funnel-panel .metric.adequacy.ok strong {
  color: var(--ff-ok);
}

#finish-funnel-panel .metric.adequacy.bad strong {
  color: var(--ff-warn);
}

#finish-funnel-panel .metric.model-recommendation strong {
  font-size: 1rem;
  color: var(--ff-text);
}

#finish-funnel-panel .metric.metric-inline {
  font-size: 1rem;
  color: var(--ff-text);
}

#finish-funnel-panel .callout {
  border-left: 4px solid var(--ff-ok);
  padding: 0.75rem 1rem;
  background: rgba(45, 138, 110, 0.1);
  margin: 0 0 1rem;
}

#finish-funnel-panel .callout.warn {
  border-left-color: var(--ff-warn);
  background: rgba(192, 57, 43, 0.08);
}

#finish-funnel-panel .layout-setup-stakes {
  margin: 0 0 0.25rem;
}

#finish-funnel-panel .layout-setup-stakes strong {
  font-size: 1.25rem;
  color: var(--ff-accent);
}

#finish-funnel-panel .layout-setup-context {
  margin: 0 0 0.75rem;
  color: var(--ff-muted);
}

#finish-funnel-panel .layout-setup-batch-cards {
  margin: 0;
}

#finish-funnel-panel .chart-wrap {
  position: relative;
  height: 280px;
}

#finish-funnel-panel #finish-funnel-queue-chart {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

#finish-funnel-panel .chart-selected-moment {
  margin: 0 0 0.75rem;
  color: var(--ff-muted);
  font-size: 0.95rem;
}

#finish-funnel-panel .chart-legend-mount {
  margin-top: 0.75rem;
}

#finish-funnel-panel .chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ff-muted);
  font-size: 0.9rem;
}

#finish-funnel-panel .chart-legend li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

#finish-funnel-panel .chart-legend-swatch {
  display: inline-block;
  flex-shrink: 0;
}

#finish-funnel-panel .chart-legend-swatch--queue-depth {
  width: 1.5rem;
  height: 0;
  border-top: 2px solid var(--ff-accent);
}

#finish-funnel-panel .chart-legend-swatch--peak-capacity {
  width: 1.5rem;
  height: 0;
  border-top: 2px dashed var(--ff-warn);
}

#finish-funnel-panel .chart-legend-swatch--layout-capacity {
  width: 1.5rem;
  height: 0;
  border-top: 2px dashed var(--ff-ok);
}

#finish-funnel-panel .chart-legend-swatch--model-recommendation-capacity {
  width: 1.5rem;
  height: 0;
  border-top: 2px dashed #7c5cbf;
}

#finish-funnel-panel .chart-legend-swatch--batch-marker-moment {
  width: 0;
  height: 1rem;
  border-left: 2px solid var(--ff-accent);
}

#finish-funnel-panel .queue-moment-summary {
  display: grid;
  gap: 0.5rem 1rem;
  margin: 0;
}

@media (min-width: 640px) {
  #finish-funnel-panel .queue-moment-summary {
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }
}

#finish-funnel-panel .queue-moment-summary dt {
  font-weight: 600;
  color: var(--ff-text);
}

#finish-funnel-panel .queue-moment-summary dd {
  margin: 0.15rem 0 0;
  color: var(--ff-muted);
}

#finish-funnel-panel .queue-finish-line-blocked {
  margin: 0.75rem 0 0;
  color: var(--ff-warn);
}

#finish-funnel-panel .finish-funnel-settings-row {
  display: grid;
  gap: 1rem;
}

#finish-funnel-panel .finish-funnel-settings-row + .finish-funnel-settings-row {
  margin-top: 1rem;
}

@media (min-width: 720px) {
  #finish-funnel-panel .finish-funnel-settings-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

#finish-funnel-panel .finish-funnel-fieldset {
  margin: 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ff-border);
  border-radius: 6px;
  background: var(--ff-surface);
  min-width: 0;
}

#finish-funnel-panel .finish-funnel-fieldset legend {
  padding: 0 0.35rem;
  color: var(--ff-accent);
  font-weight: 600;
}

#finish-funnel-panel .finish-funnel-field {
  margin: 0.5rem 0 0;
}

#finish-funnel-panel .finish-funnel-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: var(--ff-muted);
}

#finish-funnel-panel .finish-funnel-field input[type="number"] {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--ff-border);
  border-radius: 4px;
  background: var(--ff-bg);
  color: var(--ff-text);
  font: inherit;
}

#finish-funnel-panel .finish-funnel-field input[type="number"]:focus-visible,
#finish-funnel-panel .finish-funnel-field button:focus-visible,
#finish-funnel-panel #finish-funnel-queue-chart:focus-visible {
  outline: 2px solid var(--ff-accent);
  outline-offset: 2px;
}

#finish-funnel-panel .finish-funnel-field input[readonly] {
  background: rgba(43, 34, 61, 0.06);
  color: var(--ff-muted);
}

#finish-funnel-panel .finish-funnel-field button {
  margin-top: 0.25rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--ff-border);
  border-radius: 4px;
  background: var(--ff-bg);
  color: var(--ff-text);
  font: inherit;
  cursor: pointer;
}

#finish-funnel-panel .finish-funnel-field button:hover {
  border-color: var(--ff-accent);
}
`;function tt(e){if(e.getElementById(Te))return;const n=e.createElement("style");n.id=Te,n.textContent=nt,e.head.append(n)}function it(e,n){return Math.ceil(e/n)+1}function xe(e){return e+1}function ot({laneCount:e,laneLengthMetres:n,cordonStakeSpacingMetres:t}){return xe(e)*it(n,t)}function Ce(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function st(e){return e===1?"Batch marker cards needed: 1":`Batch marker cards needed: ${e}`}function at({laneCount:e,laneLengthMetres:n,cordonStakeSpacingMetres:t,batchMarkerCardsNeeded:i}){const o=xe(e),s=ot({laneCount:e,laneLengthMetres:n,cordonStakeSpacingMetres:t}),l=`${e} ${e===1?"lane":"lanes"} × ${n} m, ${o} ${o===1?"cordon line":"cordon lines"}, stakes every ${t} m (both ends staked)`,r=i===void 0?"":`<p class="layout-setup-batch-cards"><strong>${Ce(st(i))}</strong></p>`;return`<p class="layout-setup-stakes"><strong>Cordon stakes needed: ${s}</strong></p>
<p class="layout-setup-context">${Ce(l)}</p>${r}`}function rt(e){return`Queue time: ${F(e.maxSeconds)} max · ${F(e.meanSeconds)} mean · ${F(e.medianSeconds)} median`}function lt(e){return`Peak queue capacity: ${e} finishers`}function ut(e){return e.sufficient?`Sufficient (${e.headroomFinishers} finisher headroom)`:`Short by ${e.shortfallFinishers} finishers`}function Fe(e,n,t){return`${e} lanes × ${n} m · ${ut(t)}`}function ct({peakQueueDepth:e,eventQueueTimeSummary:n,layout:t,modelRecommendation:i,layoutMatchesModelRecommendation:o,finishLineBackupDelays:s,tokenSupplyGaps:a}){const d=s===void 0?"":`
    <div class="metric">
      <span>Finish-line backup delay</span>
      <strong>${F(s.maxDelaySeconds)}</strong>
      max · ${F(s.averageDelaySeconds)} avg
      (${s.delayedFinisherCount} finishers)
    </div>`,l=a===void 0?"":`
    <div class="metric">
      <span>Token supply gaps</span>
      <strong>${F(a.totalPauseSeconds)}</strong>
      total · ${a.gapCount} gaps
    </div>`,r=o?"":`
    <div class="metric model-recommendation">
      <span>Model recommendation</span>
      <strong>${Fe(i.laneCount,i.laneLengthMetres,i)}</strong>
    </div>`;return`
    <div class="metric metric-inline">${lt(e)}</div>
    <div class="metric metric-inline">${rt(n)}</div>
    <div class="metric adequacy ${t.sufficient?"ok":"bad"}">
      <span>Layout</span>
      <strong>${Fe(t.laneCount,t.laneLengthMetres,t)}</strong>
    </div>${r}${d}${l}
  `}const dt={"queue-depth":"Solid orange line","peak-capacity":"Red dashed horizontal line","layout-capacity":"Green dashed horizontal line","model-recommendation-capacity":"Purple dashed horizontal line","batch-marker-moment":"Orange vertical line"};function mt({layoutQueueCapacity:e,modelRecommendationQueueCapacity:n,batchMarkerMomentCount:t}){const i=[{label:"Queue depth",swatch:"queue-depth"},{label:"Peak queue capacity",swatch:"peak-capacity"}];return e!==void 0&&i.push({label:"Layout capacity",swatch:"layout-capacity"}),n!==void 0&&i.push({label:"Model recommendation capacity",swatch:"model-recommendation-capacity"}),t>0&&i.push({label:"Batch marker moment",swatch:"batch-marker-moment"}),i}function ft(e,{legendId:n="queue-chart-legend"}={}){if(e.length===0)return"";const t=e.map(i=>{const o=dt[i.swatch];return`
    <li>
      <span class="chart-legend-swatch chart-legend-swatch--${i.swatch}" role="img" aria-label="${o}"></span>
      <span>${i.label}</span>
    </li>`}).join("");return`<ul id="${n}" class="chart-legend" aria-label="Chart legend">${t}
  </ul>`}function we(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ht(e){return e==="unnamed"?"unnamed":e}function pt(e){if(e.length===0)return"";const n=e.map(({label:t,count:i})=>`${ht(t)} ${i}`).join(", ");return`<span class="queue-lane-batches">${we(n)}</span>`}function gt(e){const n=e.lanes.map(i=>{const o=`${i.queuedCount} / ${i.maxFinishers} finishers · ${Se(i.occupiedMetres)} / ${Se(i.maxMetres)} m`,s=pt(i.batches);return`<div>
      <dt>Lane ${i.laneNumber}</dt>
      <dd>${we(o)}${s?` ${s}`:""}</dd>
    </div>`}).join(""),t=e.finishLineBlockedCount===void 0?"":`<p class="queue-finish-line-blocked">At finish line (not yet in funnel): ${e.finishLineBlockedCount} finishers</p>`;return`<dl class="queue-moment-summary">${n}</dl>${t}`}function St(e){return`Queue at selected moment (${e})`}function $e(e,n,t,i,o){e.strokeStyle=o,e.setLineDash([6,6]),e.beginPath(),e.moveTo(t.left,i),e.lineTo(n-t.right,i),e.stroke(),e.setLineDash([])}function yt(e,n,t){const i=e.getContext("2d");if(!i||n.length===0)return;const o=e.clientWidth,s=e.clientHeight;e.width=o,e.height=s;const a=V,d=s-a.top-a.bottom,l=le(n),r=l.minTimeSeconds,h=l.maxTimeSeconds,u=Math.max(t.peakQueueDepth,t.layoutQueueCapacity??0,t.modelRecommendationQueueCapacity??0,1),S=m=>ue(m,o,l,a),g=m=>a.top+d-m/u*d;i.fillStyle="#1f182e",i.fillRect(0,0,o,s),i.strokeStyle="rgba(255, 255, 255, 0.12)",i.lineWidth=1;for(let m=0;m<=4;m+=1){const v=u*m/4,M=g(v);i.beginPath(),i.moveTo(a.left,M),i.lineTo(o-a.right,M),i.stroke(),i.fillStyle="#b8b8c8",i.font="12px sans-serif",i.textAlign="right",i.fillText(String(Math.round(v)),a.left-8,M+4)}i.strokeStyle="#ffa300",i.lineWidth=2,i.beginPath();for(const[m,v]of n.entries()){const M=S(v.timeSeconds),b=g(v.queueDepth);m===0?i.moveTo(M,b):i.lineTo(M,b)}i.stroke(),t.layoutQueueCapacity!==void 0&&$e(i,o,a,g(t.layoutQueueCapacity),"#53ba9d"),t.modelRecommendationQueueCapacity!==void 0&&$e(i,o,a,g(t.modelRecommendationQueueCapacity),"#a78bfa");const p=g(t.peakQueueDepth);if(i.strokeStyle="#ff6b6b",i.setLineDash([4,4]),i.beginPath(),i.moveTo(a.left,p),i.lineTo(o-a.right,p),i.stroke(),i.setLineDash([]),t.batchMarkerMoments!==void 0)for(const m of t.batchMarkerMoments){const v=S(m.momentSeconds);i.strokeStyle="#ffa300",i.lineWidth=1,i.beginPath(),i.moveTo(v,a.top),i.lineTo(v,s-a.bottom),i.stroke(),i.fillStyle="#ffa300",i.font="12px sans-serif",i.textAlign="center",i.fillText(m.letter,v,a.top-4)}if(t.selectedMomentSeconds!==void 0){const m=S(t.selectedMomentSeconds),v=F(t.selectedMomentSeconds);i.strokeStyle="#e8e8e8",i.lineWidth=2,i.setLineDash([]),i.beginPath(),i.moveTo(m,a.top),i.lineTo(m,s-a.bottom),i.stroke(),i.fillStyle="#e8e8e8",i.font="12px sans-serif",i.textAlign="center",i.fillText(v,m,a.top-4)}i.fillStyle="#b8b8c8",i.font="12px sans-serif",i.textAlign="center",i.fillText(F(r),a.left,s-10),i.fillText(F(h),o-a.right,s-10),i.fillText("Finish time",o/2,s-10)}function vt({funnelNotRequired:e,combinedLaneCapacity:n,peakQueueDepth:t,finishLineBackupModelled:i=!1}){return e?{hidden:!1,className:"callout",text:"A roped-off funnel may not be needed for this event."}:!i&&n<t?{hidden:!1,className:"callout warn",text:"The queue would back over the finish line at peak. Finish-line backup is not yet modelled."}:{hidden:!0}}function Mt(e,n){const{analysis:t,persisted:i,finishTokensSettings:o,layout:s,finishers:a,momentSeconds:d}=n,l=le(t.queueDepthOverTime),r=z(d,l),h=t.recommendedFunnelLayout??{laneCount:s.laneCount,laneLengthMetres:s.laneLengthMetres,sufficient:!0,combinedLaneCapacity:0,headroomFinishers:0,shortfallFinishers:0},u=t.proposedMultiLaneLayout??{sufficient:!0,combinedLaneCapacity:0,headroomFinishers:0,shortfallFinishers:0},S=Le(s,h),g=vt({funnelNotRequired:t.funnelNotRequired,combinedLaneCapacity:u.combinedLaneCapacity,peakQueueDepth:t.peakQueueDepth,finishLineBackupModelled:t.finishLineBackupModelled}),p=e.querySelector("#finish-funnel-callout");p&&(g.hidden?p.hidden=!0:(p.hidden=!1,p.className=g.className,p.textContent=g.text));const m=e.querySelector("#finish-funnel-metrics");m&&(m.innerHTML=ct({peakQueueDepth:t.peakQueueDepth,eventQueueTimeSummary:t.eventQueueTimeSummary,layout:{laneCount:s.laneCount,laneLengthMetres:s.laneLengthMetres,sufficient:u.sufficient,combinedLaneCapacity:u.combinedLaneCapacity,headroomFinishers:u.headroomFinishers,shortfallFinishers:u.shortfallFinishers},modelRecommendation:h,layoutMatchesModelRecommendation:S,finishLineBackupDelays:t.finishLineBackupDelays,tokenSupplyGaps:t.tokenSupplyGaps}));const v=s.laneCount>1?t.batchMarkerMoments.length:void 0,M=e.querySelector("#finish-funnel-layout-setup-mount");M&&(M.innerHTML=at({laneCount:s.laneCount,laneLengthMetres:s.laneLengthMetres,cordonStakeSpacingMetres:i.cordonStakeSpacingMetres,batchMarkerCardsNeeded:v}));const b=e.querySelector("#finish-funnel-chart-selected-moment");b&&(b.textContent=`Selected moment: ${F(r)}`);const c=S?void 0:h.combinedLaneCapacity,y=e.querySelector("#finish-funnel-queue-chart");y&&yt(y,t.queueDepthOverTime,{peakQueueDepth:t.peakQueueDepth,layoutQueueCapacity:u.combinedLaneCapacity,modelRecommendationQueueCapacity:c,selectedMomentSeconds:r,batchMarkerMoments:t.batchMarkerMoments});const R=e.querySelector("#finish-funnel-chart-legend-mount");R&&(R.innerHTML=ft(mt({layoutQueueCapacity:u.combinedLaneCapacity,modelRecommendationQueueCapacity:c,batchMarkerMomentCount:t.batchMarkerMoments.length}),{legendId:"finish-funnel-chart-legend"}));const x=Me({finishers:a,finishTokensSettings:o,momentSeconds:r,laneCount:s.laneCount,laneLengthMetres:s.laneLengthMetres,decelerationZoneMetres:i.decelerationZoneMetres,finisherSpacingMetres:i.finisherSpacingMetres}),D=e.querySelector("#finish-funnel-queue-moment-heading");D&&(D.textContent=St(x.queueDepth));const B=e.querySelector("#finish-funnel-queue-summary-mount");return B&&(B.innerHTML=gt(x.queueMomentSummary)),{chartTimeRange:l,momentSeconds:r,finishFunnelMarkupByPosition:ge(x.finishers)}}function w(e,n){const t=Number(e.value);return Number.isFinite(t)?t:n}function T(e,n){const t=e.querySelector(`#${n}`);if(!t)throw new Error(`Userscript panel input not found: ${n}`);return t}function Pe(e){const n=w(T(e,f.tokensPerMinute),C.tokensPerMinutePerVolunteer),t=w(T(e,f.tokenSupplyBatchSize),C.tokenSupplyBatchSize),i=w(T(e,f.tokenSupplyFetchDelay),C.tokenSupplyFetchDelaySeconds),o=w(T(e,f.maximumLaneLength),30),s=w(T(e,f.maximumLaneCount),1),a=w(T(e,f.decelerationZone),I),d=w(T(e,f.finisherSpacing),E),l=Math.max(1,w(T(e,f.cordonStakeSpacing),se));return{persisted:{tokensPerMinutePerVolunteer:n,tokenSupplyBatchSize:t,tokenSupplyFetchDelaySeconds:i,maximumLaneLengthMetres:o,maximumLaneCount:s,decelerationZoneMetres:a,finisherSpacingMetres:d,cordonStakeSpacingMetres:l},layoutRaw:{laneCount:w(T(e,f.layoutLaneCount),1),laneLengthMetres:w(T(e,f.layoutLaneLength),30)},finisherSpacingRaw:T(e,f.finisherSpacing).value}}function Ee(e,n){T(e,f.layoutLaneCount).value=String(n.laneCount),T(e,f.layoutLaneLength).value=String(n.laneLengthMetres)}function bt(e,n){const t=T(e,f.finisherSpacing);t.max=n.max,t.value=n.value}function kt(e,n){const t=e.querySelector(`#${f.resetToModelRecommendation}`);t&&(t.hidden=!n)}function Lt(e,n){T(e,f.finisherSpacing).max=n}function Tt(e,n){T(e,f.volunteerCount).value=String(n)}function xt(e,{seconds:n,overridden:t}){const i=T(e,f.tokenSupplyFetchDelay);i.value=String(n),i.readOnly=t,t?i.setAttribute("aria-readonly","true"):i.removeAttribute("aria-readonly")}const Y="finish-funnel-panel";function J(e,n){return ke({persisted:e,volunteers:n})}function Ct({analysis:e,persisted:n,finishTokensSettings:t,layout:i,finishers:o,momentSeconds:s}){return{analysis:e,persisted:n,finishTokensSettings:t,layout:i,finishers:o,momentSeconds:s}}function Ft(e){const{document:n,table:t,finishers:i,volunteers:o,storage:s,storageKey:a}=e;tt(n);const d=be(o),l=J(e.persisted,o);let r=n.querySelector(`#${Y}`);r||(r=n.createElement("section"),r.id=Y,r.className="finish-funnel-panel",r.innerHTML=et({persisted:e.persisted,layout:e.layout,volunteerCount:l.volunteerCount,fetchDelayOverridden:d}),t.parentElement?.insertAdjacentElement("beforebegin",r));let h={minTimeSeconds:0,maxTimeSeconds:0},u=e.momentSeconds??0,S=new Map,g=!1,p="",m,v=e.layout,M=e.persisted,b=l;const c=[],y=()=>{if(!g){g=!0;try{Qn(t,S)}finally{g=!1}}},R=k=>{s&&a&&_e(s,a,k)},x=({resetMoment:k=!1,forceSyncFinisherSpacing:L=!1,preserveLayoutAssumptions:$=!1}={})=>{const A=Pe(r);M=A.persisted,b=J(M,o),Tt(r,b.volunteerCount),xt(r,{seconds:b.tokenSupplyFetchDelaySeconds,overridden:d});const P=Kn({finishers:i,persisted:M,finishTokensSettings:b,layoutRaw:A.layoutRaw,finisherSpacingRaw:A.finisherSpacingRaw,previousSettingsStateKey:p});p=P.settingsStateKey,m=P.analysis,v=P.layout,Ee(r,v);const Ae=r.querySelector(`#${f.finisherSpacing}`);Ae&&(Lt(r,P.syncedFinisherSpacing.max),$||(L||P.layoutResynced||an(Ae.value,P.syncedFinisherSpacing))&&(bt(r,P.syncedFinisherSpacing),M={...M,finisherSpacingMetres:P.finisherSpacingMetres}));const Dt=m.recommendedFunnelLayout??{laneCount:v.laneCount,laneLengthMetres:v.laneLengthMetres};kt(r,!Le(v,Dt)),(k||P.layoutResynced)&&(u=ye(m.queueDepthOverTime,m.peakQueueDepth));const oe=Mt(r,Ct({analysis:m,persisted:M,finishTokensSettings:b,layout:v,finishers:i,momentSeconds:u}));h=oe.chartTimeRange,u=oe.momentSeconds,S=oe.finishFunnelMarkupByPosition,R(M),y()};x({resetMoment:e.momentSeconds===void 0});const D=r.querySelector("#finish-funnel-queue-chart"),B=r.querySelector("#finish-funnel-chart-wrap");c.push(D?On({canvas:D,getRange:()=>h,getMoment:()=>u,getBatchMarkerMoments:()=>m?.batchMarkerMoments??[],onMomentChange:k=>{u=k,x()}}):()=>{}),c.push(B instanceof HTMLElement?zn(B,()=>{x()}):()=>{}),c.push(Vn(t,()=>{y()}));const Nt=[f.tokensPerMinute,f.tokenSupplyBatchSize,f.tokenSupplyFetchDelay,f.decelerationZone,f.finisherSpacing,f.maximumLaneLength,f.maximumLaneCount];for(const k of Nt){const L=r.querySelector(`#${k}`);if(!L||L.readOnly)continue;const $=()=>x({resetMoment:!0});L.addEventListener("input",$),c.push(()=>L.removeEventListener("input",$))}const ne=r.querySelector(`#${f.cordonStakeSpacing}`);if(ne){const k=()=>x();ne.addEventListener("input",k),c.push(()=>ne.removeEventListener("input",k))}const te=r.querySelector(`#${f.finisherSpacing}`);if(te){const k=()=>x({forceSyncFinisherSpacing:!0});te.addEventListener("blur",k),c.push(()=>te.removeEventListener("blur",k))}for(const k of[f.layoutLaneCount,f.layoutLaneLength]){const L=r.querySelector(`#${k}`);if(!L)continue;const $=()=>x({preserveLayoutAssumptions:!0});L.addEventListener("input",$),c.push(()=>L.removeEventListener("input",$))}const ie=r.querySelector(`#${f.resetToModelRecommendation}`);if(ie){const k=()=>{const L=Pe(r),$=J(L.persisted,o),A=N({finishers:i,finishTokensSettings:$,decelerationZoneMetres:L.persisted.decelerationZoneMetres,finisherSpacingMetres:L.persisted.finisherSpacingMetres,maximumLaneCount:L.persisted.maximumLaneCount,maximumLaneLengthMetres:L.persisted.maximumLaneLengthMetres,laneCount:L.layoutRaw.laneCount,laneLengthMetres:L.layoutRaw.laneLengthMetres});A.recommendedFunnelLayout!==void 0&&Ee(r,{laneCount:A.recommendedFunnelLayout.laneCount,laneLengthMetres:A.recommendedFunnelLayout.laneLengthMetres}),x()};ie.addEventListener("click",k),c.push(()=>ie.removeEventListener("click",k))}return{momentSeconds:u,setMomentSeconds:k=>{u=k,x()},disconnect:()=>{for(const k of c)k()}}}function wt(e){return e.querySelector("table.Results-table.js-ResultsTable")!==null}function $t(e){try{const n=new URL(e);return/parkrun/i.test(n.hostname)&&/\/results\/[^/]+\/?$/i.test(n.pathname)}catch{return!1}}function Pt(e,n){return $t(e)&&wt(n)}const qe="finish-funnel-analyse-button",ee="Hide Finish Funnel",Re="Analyse finish funnel";function Et(e,{onActivate:n,onDeactivate:t,isActive:i=!1,pageUrl:o=e.location.href}){if(!Pt(o,e))return;const s=e.querySelector("table.Results-table.js-ResultsTable");if(!s)return;let a=e.querySelector(`#${qe}`);return a||(a=e.createElement("button"),a.id=qe,a.type="button",a.className="finish-funnel-analyse-button",s.parentElement?.insertAdjacentElement("beforebegin",a)),a.textContent=i?ee:Re,a.onclick=()=>{a?.textContent===ee?t():n()},a}function qt(e,{persisted:n,momentSeconds:t,storage:i,storageKey:o}){const s=Bn(e,{persisted:n,momentSeconds:t});if(!s)return;const{table:a,finishers:d,volunteers:l,layout:r,analysis:h,momentSeconds:u}=s,S=Ft({document:e,table:a,finishers:d,volunteers:l,persisted:n,layout:r,storage:i,storageKey:o,momentSeconds:u}),g=e.querySelector("#finish-funnel-analyse-button");return g&&(g.textContent=ee),{finishers:d,volunteers:l,analysis:h,momentSeconds:S.momentSeconds,disconnect:()=>{S.disconnect()}}}function Rt(e,{pageUrl:n,storage:t,momentSeconds:i}){const o=Ie(n),s=o?Ne(o):void 0,a=s?Be(t,s):{..._};return qt(e,{persisted:a,momentSeconds:i,storage:t,storageKey:s})}function At(e){const n=e.querySelector("table.Results-table.js-ResultsTable");n&&Un(n),e.querySelector(`#${Y}`)?.remove();const t=e.querySelector("#finish-funnel-analyse-button");t&&(t.textContent=Re)}function It(e,{pageUrl:n=e.location.href,storage:t=window.localStorage}={}){let i;Et(e,{pageUrl:n,isActive:!1,onActivate:()=>{i=Rt(e,{pageUrl:n,storage:t})},onDeactivate:()=>{i?.disconnect(),At(e),i=void 0}})}It(document)})();
