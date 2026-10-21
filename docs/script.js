const cats = [
  {name:'小橘',english:'Ginger',image:'assets/cats/ginger.webp',tag:'活泼好奇 · 元气满满',age:'2 个月',breed:'英国短毛猫',health:'示例：健康档案待确认',medical:'疫苗与驱虫记录待确认',personality:'喜欢探索 · 亲人友善',bio:'小橘总是第一个发现窗边的新阳光。它喜欢玩毛线，也喜欢把每一次靠近都变成一场小小的冒险。',gender:'♂',hand:'Sunny Days ♡'},
  {name:'云朵',english:'Cloud',image:'assets/cats/cloud.webp',tag:'安静优雅 · 治愈系',age:'3 个月',breed:'布偶猫',health:'示例：健康档案待确认',medical:'疫苗与驱虫记录待确认',personality:'温柔安静 · 喜欢陪伴',bio:'云朵有一双像清晨天空一样的蓝眼睛。它喜欢安静地靠在身边，把普通的午后变得柔软。',gender:'♀',hand:'Gentle Soul ♡'},
  {name:'露娜',english:'Luna',image:'assets/cats/luna.webp',tag:'温柔亲人 · 好奇心强',age:'3 个月',breed:'英国短毛猫',health:'示例：健康档案待确认',medical:'疫苗与驱虫记录待确认',personality:'亲人 · 爱探索',bio:'露娜会认真观察每一片摇晃的叶子，也会用圆圆的眼睛回应你的呼唤。认识它，从一个轻轻的招呼开始。',gender:'♀',hand:'Pure Joy ♡'},
  {name:'奥利',english:'Ollie',image:'assets/cats/ollie.webp',tag:'聪明勇敢 · 小小探险家',age:'2 个月',breed:'家猫',health:'示例：健康档案待确认',medical:'疫苗与驱虫记录待确认',personality:'活泼独立 · 爱玩耍',bio:'奥利对世界充满好奇。每一扇门、每一束光，都能成为它的新发现；玩累了，也愿意在你身边安静下来。',gender:'♂',hand:'Garden Friend ♡'},
  {name:'米米',english:'Mimi',image:'assets/cats/mimi.webp',tag:'甜美爱笑 · 喜欢撒娇',age:'3 个月',breed:'家猫',health:'示例：健康档案待确认',medical:'疫苗与驱虫记录待确认',personality:'亲人 · 爱撒娇',bio:'米米喜欢躺在篮子里听风吹过花丛。它的小呼噜声，总能让人不自觉地放慢脚步。',gender:'♀',hand:'Cozy Heart ♡'},
  {name:'摩卡',english:'Mocha',image:'assets/cats/mocha.webp',tag:'安静黏人 · 蓝眼睛',age:'3 个月',breed:'布偶猫',health:'示例：健康档案待确认',medical:'疫苗与驱虫记录待确认',personality:'安静 · 喜欢陪伴',bio:'摩卡像一杯暖暖的奶咖。它喜欢靠在窗帘旁晒太阳，也喜欢在你读书时偷偷坐到身边。',gender:'♂',hand:'Soft Morning ♡'}
];
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopMotion=window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
const hero=$('#home'), gallery=$('#featured'), story=$('#story'), diary=$('#diary'), visit=$('#visit');
const postcards=$('#postcardStage');
const detail=$('#detailPanel'), detailBackdrop=$('#detailBackdrop');
const booking=$('#bookingModal'), bookingBackdrop=$('#bookingBackdrop');
$('#detailScroll').setAttribute('data-lenis-prevent','');
booking.setAttribute('data-lenis-prevent','');
let activeCat=2, detailReturnFocus=null, bookingReturnFocus=null, detailCloseTimer=0, bookingCloseTimer=0, detailMode='closed';
let heroProgress=0, galleryProgress=0, visitLead=0;
let lastHeroProgress=-1, lastGalleryProgress=-1, lastDiaryProgress=-1, lastMapProgress=-1;
const finishOpening=()=>document.body.classList.remove('hero-intro');
let openingTimer=0;
const heroMedia=new HeroMedia({
  canvas:$('#heroFrames'),handoff:$('#heroHandoff'),video:$('#heroIdle'),endVideo:$('#heroEnd'),reduced,
  onIdleReady:()=>{
    document.body.classList.add('hero-video-ready');
    if(document.body.classList.contains('hero-intro'))openingTimer=setTimeout(finishOpening,1100);
  }
});
if(!desktopMotion.matches||scrollY>8||(location.hash&&location.hash!=='#home'))finishOpening();
else{
  window.addEventListener('scroll',()=>{if(scrollY>8){clearTimeout(openingTimer);finishOpening()}},{passive:true});
}
const heroLayers=$$('.film-frames,.film-handoff,.film-idle,.film-end');
const heroScene=$('.film-sticky'), filmFirst=$('#filmFirst'), filmSecond=$('#filmSecond');
const filmScript=$('#filmScript'), filmCue=$('.scroll-cue'), filmShade=$('.film-shade');
const filmNote=$('#filmHangingNote'), filmBottom=$('.film-bottom'), filmProgress=$('#filmProgress');
const portalIris=$('#portalIris'), portalShutters=$('#portalShutters');
const portalTop=$('.portal-lid-top'), portalBottom=$('.portal-lid-bottom');
const galleryScene=$('.featured-sticky'), galleryBg=$('.featured-bg'), galleryVignette=$('.featured-vignette');
const galleryIntro=$('#featuredIntro'), galleryNote=$('#featuredNote'), galleryHint=$('#featuredHint');
postcards.innerHTML=cats.map((cat,i)=>`<button class="postcard" type="button" data-cat="${i}" aria-label="查看${cat.name}的资料" style="--rise:110vh"><img class="postcard-photo" src="${cat.image}" alt="${cat.name}的肖像"><span class="postcard-name">${cat.english}</span><span class="postcard-heart" aria-hidden="true">♡</span></button>`).join('');
$('#diaryImages').innerHTML=cats.map((cat,i)=>`<figure class="diary-slide"><img class="diary-backdrop" src="${cat.image}" alt="" aria-hidden="true" loading="lazy"><img class="diary-image" src="${cat.image}" alt="${cat.name}的完整照片" loading="${i<2?'eager':'lazy'}"><figcaption class="diary-static-caption">${cat.name} · ${cat.age}</figcaption></figure>`).join('');
$('#diaryTrack').innerHTML=cats.map(()=>'<span></span>').join('');
$('#mapGrid').innerHTML=Array.from({length:12},(_,i)=>`<div class="map-tile" style="--tile:${i};--col:${i%4};--row:${Math.floor(i/4)}"><img src="${cats[(i*5+Math.floor(i/4))%cats.length].image}" alt=""></div>`).join('');
const diarySlides=$$('.diary-slide'), diaryMarkers=$$('#diaryTrack span'), mapTiles=$$('.map-tile');
const diaryVisual=$('#diaryVisual'), diaryCopy=$('#diaryCopy'), visitScene=$('#visitScene'), visitArrival=$('#visitArrival'), gridWindow=$('#mapGridWindow');
const postcardCards=$$('.postcard'), diaryFurniture=$$('.diary-top,.diary-track,.diary-caption');
const visitAtmosphere=$('.visit-atmosphere'), mapShell=$('#mapShell');
function renderHero(p){
  if(p===lastHeroProgress)return;lastHeroProgress=p;
  heroProgress=p;
  heroMedia.update(p);
  filmProgress.style.transform=`scaleX(${Math.min(p/.80,1)})`;
  const a=1-smooth(.23,.43,p),b=smooth(.29,.46,p)*(1-smooth(.67,.81,p));
  filmFirst.style.opacity=a;filmFirst.style.transform=`translateY(${-38*smooth(.2,.44,p)}px)`;
  filmFirst.inert=a<.05;
  filmSecond.style.opacity=b;filmSecond.style.transform=`translateY(${55*(1-smooth(.3,.46,p))-30*smooth(.67,.81,p)}px)`;
  filmScript.style.opacity=1-smooth(.25,.4,p);
  filmCue.style.opacity=1-smooth(.08,.2,p);
  const zoom=smooth(.84,1,p),bridge=smooth(.9,1,p);
  for(const layer of heroLayers)layer.style.transform=`scale(${1+5.4*zoom})`;
  heroScene.style.setProperty('--hero-scene-opacity',1-bridge);
  filmShade.style.opacity=1-bridge;
  filmNote.style.opacity=(1-smooth(.18,.36,p))*(1-bridge);
  filmBottom.style.opacity=1-smooth(.75,.95,p);
  filmProgress.parentElement.style.opacity=1-smooth(.8,.98,p);
  renderPortal();
}
function renderPortal(){
  // The same garden is visible through both scenes; the aperture shades the edges only.
  const entrance=smooth(.84,1,heroProgress),exit=1-smooth(0,.16,galleryProgress);
  const shade=entrance*exit;
  portalIris.style.opacity=String(shade*.16);
  portalIris.style.setProperty('--hole',`${140-105*entrance}vmax`);
  portalShutters.style.visibility=shade<.001?'hidden':'visible';
  portalShutters.style.opacity=String(shade*.14);
  const coverage=.18*shade;
  portalTop.style.transform=`translateY(${-100*(1-coverage)}%)`;
  portalBottom.style.transform=`translateY(${100*(1-coverage)}%)`;
}
function renderGallery(p){
  if(p===lastGalleryProgress)return;lastGalleryProgress=p;galleryProgress=p;
  galleryScene.style.opacity=String(smooth(0,.10,p));
  const bg=smooth(.02,.5,p);
  galleryBg.style.opacity=bg*.76;galleryBg.style.transform=`scale(${1.08-.08*bg-.018*smooth(.5,1,p)})`;
  galleryVignette.style.opacity=bg*.58;
  const intro=smooth(.05,.24,p);galleryIntro.style.opacity=intro;galleryIntro.style.transform=`translateY(${25*(1-intro)}px)`;
  galleryNote.style.opacity=smooth(.43,.64,p);galleryHint.style.opacity=smooth(.36,.55,p);
  galleryScene.style.setProperty('--cats-scene-color',`rgba(16,24,18,${.16*smooth(.72,1,p)})`);
  postcardCards.forEach((card,i)=>{
    const offset=i*.043, peek=smooth(.025+offset,.18+offset,p), settle=smooth(.13+offset,.4+offset,p);
    const rise=(1-peek)*75+peek*(1-settle)*18;
    card.style.setProperty('--rise',`${rise}vh`);
    const opacity=smooth(.035+offset,.16+offset,p);
    card.style.opacity=opacity;card.inert=opacity<.9;
  });
  renderPortal();
}
function renderDiary(p){
  if(p===lastDiaryProgress)return;
  lastDiaryProgress=p;
  const time=clamp((p-.08)/.76)*cats.length;
  const index=Math.min(cats.length-1,Math.floor(time)), phase=time-index;
  const blend=index<cats.length-1?smooth(.6,1,phase):0;
  diarySlides.forEach((slide,i)=>{
    slide.style.opacity=i===index?'1':i===index+1?String(blend):'0';
    slide.style.zIndex=i===index+1?'2':'1';
    slide.style.transform=`scale(${i===index+1?.97+.03*blend:1})`;
  });
  const labelIndex=blend>.5?index+1:index;
  const opening=smooth(0,.08,p),closing=smooth(.87,1,p);
  const copyVisibility=smooth(.055,.09,p)*(1-smooth(.85,.93,p))*(1-.8*Math.sin(blend*Math.PI));
  diaryCopy.style.opacity=String(copyVisibility);
  diaryCopy.style.transform=`translateY(${12*(1-opening)}px)`;
  diaryCopy.inert=copyVisibility<.15;
  if(Number(diaryCopy.dataset.index)!==labelIndex){
    diaryCopy.dataset.index=labelIndex;
    $('#diaryTitle').textContent=cats[labelIndex].name;
    $('#diaryAge').textContent=`${cats[labelIndex].age} · ${cats[labelIndex].english}`;
    $('#diaryCount').textContent=`${String(labelIndex+1).padStart(2,'0')} / ${String(cats.length).padStart(2,'0')}`;
    $('#diaryDetail').dataset.cat=labelIndex;
  }
  diaryMarkers.forEach((dot,i)=>dot.classList.toggle('active',i===labelIndex));
  // A small camera retreat carries the portrait into the incoming photo grid.
  diaryVisual.style.transform=`scale(${(.94+.06*opening)*(1-.12*closing)})`;
  diaryVisual.style.borderRadius=`${18*closing}px`;
  diaryVisual.style.opacity='1';
  for(const el of diaryFurniture)el.style.opacity=String(1-smooth(.86,.96,p));
}
function renderVisitLead(lead){
  visitLead=lead;
  const active=lead>0||lastMapProgress>0;
  visitScene.classList.toggle('is-entered',active);
  // Cancel only the incoming box's normal-flow offset, never transform its sticky ancestor.
  visitScene.style.transform=`translate3d(0,${-.72*innerHeight*(1-lead)}px,0)`;
  visitScene.style.opacity=String(smooth(.08,1,lead));
}
function renderMapGrid(p){
  if(p===lastMapProgress)return;
  lastMapProgress=p;
  const opening=smooth(0,.14,p),scatter=smooth(.17,.63,p),fade=smooth(.43,.69,p),arrival=smooth(.36,.84,p);
  visitAtmosphere.style.opacity=String(smooth(0,.22,p));
  gridWindow.style.transform=`scale(${.88+.12*opening})`;
  gridWindow.style.borderRadius=`${18*(1-opening)}px`;
  gridWindow.style.opacity=String(1-smooth(.69,.74,p));
  const columns=innerWidth<=760?3:4,rows=12/columns;
  mapTiles.forEach((tile,i)=>{
    const col=i%columns,row=Math.floor(i/columns);
    const dx=(col-(columns-1)/2)*85,dy=(row-(rows-1)/2)*85;
    tile.style.transform=`translate(${dx*scatter}vw,${dy*scatter}vh) rotate(${(i%2?-1:1)*(12+i*1.9)*scatter}deg) scale(${1-.18*scatter})`;
    tile.style.opacity=String(1-fade);
  });
  // No vertical entrance: perspective and scale bring the centered map towards the viewer.
  visitArrival.style.transform=`translateZ(${-2400*(1-arrival)}px) scale(${.36+.64*arrival})`;
  visitArrival.style.opacity=String(smooth(.36,.55,p));
  visitArrival.style.filter=`blur(${5*(1-arrival)}px)`;
  visitArrival.inert=arrival<.995;
  visitScene.classList.toggle('is-map-ready',arrival>=.995);
  if(arrival<.995&&mapShell.classList.contains('is-interactive'))setMapInteraction(false);
}
const sceneBounds=new Map(),header=$('#siteHeader');
let lenis=null,scrollPending=false;
const hasScrollTrigger=!!(window.gsap&&window.ScrollTrigger&&!reduced);
function measureScenes(){
  for(const section of [hero,gallery,story,diary,visit]){
    sceneBounds.set(section,{top:section.offsetTop,travel:Math.max(1,section.offsetHeight-innerHeight)});
  }
  lastHeroProgress=lastGalleryProgress=lastDiaryProgress=lastMapProgress=-1;
}
function sectionProgress(el){const bounds=sceneBounds.get(el);return clamp((scrollY-bounds.top)/bounds.travel)}
function updateHeader(){header.classList.toggle('scrolled',scrollY>sceneBounds.get(story).top-80)}
function updateScroll(){
  if(!reduced){
    renderHero(sectionProgress(hero));renderGallery(sectionProgress(gallery));
    renderDiary(sectionProgress(diary));renderMapGrid(sectionProgress(visit));
    renderVisitLead(clamp((scrollY-sceneBounds.get(visit).top+innerHeight*.72)/(innerHeight*.72)));
  }else{
    visitArrival.inert=false;visitScene.classList.add('is-entered','is-map-ready');
  }
  updateHeader();
}
function scheduleScroll(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;updateScroll()})}
measureScenes();
if(hasScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.addEventListener('refreshInit',measureScenes);
  // CSS sticky owns the pin. A second GSAP pin would add spacers and break the overlaps.
  // scrub:true is intentional: Lenis supplies damping once; scenes have no catch-up tween.
  for(const [section,render] of [[hero,renderHero],[gallery,renderGallery],[diary,renderDiary],[visit,renderMapGrid]]){
    const playhead={progress:0};
    gsap.to(playhead,{progress:1,ease:'none',onUpdate:()=>render(playhead.progress),scrollTrigger:{
      id:`scene-${section.id}`,trigger:section,start:'top top',
      end:()=>`+=${Math.max(1,section.offsetHeight-innerHeight)}`,
      pin:false,scrub:true,invalidateOnRefresh:true,
      onRefresh:self=>render(self.progress)
    }});
  }
  const arrival={progress:0};
  gsap.to(arrival,{progress:1,ease:'none',onUpdate:()=>renderVisitLead(arrival.progress),scrollTrigger:{
    id:'diary-visit-bridge',trigger:visit,start:'top 72%',end:'top top',scrub:true,
    invalidateOnRefresh:true,onRefresh:self=>renderVisitLead(self.progress)
  }});
  ScrollTrigger.create({id:'header-tone',start:0,end:'max',onUpdate:updateHeader,onRefresh:updateHeader});
  if(desktopMotion.matches){
    story.classList.add('is-visible');
    gsap.fromTo('.story-copy > *',{opacity:0,y:26},{opacity:1,y:0,stagger:.08,ease:'none',scrollTrigger:{
      id:'story-reveal',trigger:story,start:'top 85%',end:'top 20%',scrub:true
    }});
    gsap.fromTo('.story-image img',{scale:1.055},{scale:1,ease:'none',scrollTrigger:{
      id:'story-camera',trigger:story,start:'top bottom',end:'bottom top',scrub:true
    }});
  }
}else{
  // The native renderer is a fallback, never a second writer alongside ScrollTrigger.
  window.addEventListener('scroll',scheduleScroll,{passive:true});
  window.addEventListener('resize',()=>{measureScenes();scheduleScroll()});
  updateScroll();
}
function syncSmoothScroll(){
  if(lenis){lenis.destroy();lenis=null}
  if(!desktopMotion.matches||!window.Lenis)return;
  lenis=new Lenis({
    autoRaf:false,smoothWheel:true,syncTouch:false,lerp:.18,wheelMultiplier:1,
    prevent:node=>node instanceof Element&&!!node.closest('[data-lenis-prevent]'),
    // Keep horizontal trackpad gestures native; vertical wheel travel is not scaled or capped.
    virtualScroll:({event,deltaX,deltaY})=>!event.ctrlKey&&!event.shiftKey&&Math.abs(deltaY)>=Math.abs(deltaX)
  });
  lenis.on('scroll',()=>{if(hasScrollTrigger)ScrollTrigger.update();else scheduleScroll()});
  if(detail.classList.contains('active')||booking.classList.contains('active'))lenis.stop();
}
syncSmoothScroll();
desktopMotion.addEventListener('change',syncSmoothScroll);
if(window.gsap){gsap.ticker.lagSmoothing(0);gsap.ticker.add(time=>lenis?.raf(time*1000))}
else{const tick=time=>{lenis?.raf(time);requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function refreshScroll(){measureScenes();lenis?.resize();if(hasScrollTrigger)ScrollTrigger.refresh();else updateScroll()}
window.addEventListener('load',refreshScroll,{once:true});
document.fonts?.ready.then(refreshScroll);
if(hasScrollTrigger)ScrollTrigger.refresh();
if(!desktopMotion.matches||!hasScrollTrigger){
  const storyObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){story.classList.add('is-visible');storyObserver.disconnect()}},{threshold:.16});storyObserver.observe(story);
}
function setMapInteraction(enabled){mapShell.classList.toggle('is-interactive',enabled);mapShell.toggleAttribute('data-lenis-prevent',enabled);$('#mapInteract').setAttribute('aria-pressed',String(enabled));$('#mapInteract').textContent=enabled?'退出地图操作':'点击操作地图'}
$('#mapInteract').addEventListener('click',()=>setMapInteraction(!$('#mapShell').classList.contains('is-interactive')));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMapInteraction(false)});
function renderDetail(cat){$('#detailImage').src=cat.image;$('#detailImage').alt=`${cat.name}的肖像`;$('#detailName').textContent=cat.name;$('#detailGender').textContent=cat.gender;$('#detailTrait').textContent=cat.tag;$('#detailHandwriting').textContent=cat.hand;$('#detailBio').textContent=cat.bio;$('#detailFacts').innerHTML=`<div><dt>年龄</dt><dd>${cat.age}</dd></div><div><dt>品种</dt><dd>${cat.breed}</dd></div><div><dt>健康</dt><dd>${cat.health}</dd></div><div><dt>医疗</dt><dd>${cat.medical}</dd></div><div><dt>性格</dt><dd>${cat.personality}</dd></div>`;$('#detailScroll').scrollTop=0}
function lockPageScroll(){lenis?.stop()}
function unlockPageScroll(){if(!detail.classList.contains('active')&&!booking.classList.contains('active'))lenis?.start()}
document.addEventListener('wheel',event=>{
  if((detail.classList.contains('active')||booking.classList.contains('active'))
    &&!event.target.closest('#detailScroll,#bookingModal'))event.preventDefault();
},{passive:false,capture:true});
document.addEventListener('keydown',event=>{
  const panel=booking.classList.contains('active')?booking:detail.classList.contains('active')?$('#detailScroll'):null;
  if(!panel||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable]'))return;
  if(event.code==='Space'&&event.target.closest('button,a'))return;
  const amount=event.code==='PageDown'||event.code==='Space'?panel.clientHeight*.8:
    event.code==='PageUp'?-panel.clientHeight*.8:event.code==='ArrowDown'?48:event.code==='ArrowUp'?-48:null;
  if(amount!==null){event.preventDefault();panel.scrollBy({top:event.shiftKey&&event.code==='Space'?-amount:amount,behavior:'instant'})}
  else if(event.code==='Home'||event.code==='End'){event.preventDefault();panel.scrollTop=event.code==='Home'?0:panel.scrollHeight}
},{capture:true});
function openDetail(index,opener){
  clearTimeout(detailCloseTimer);
  detailMode='manual';
  activeCat=index;detailReturnFocus=document.activeElement;renderDetail(cats[index]);
  $$('.postcard').forEach((card,i)=>card.classList.toggle('is-selected',i===index));
  const card=opener?.classList.contains('postcard')?opener:$$('.postcard')[index];
  const bounds=card.getBoundingClientRect();
  detail.dataset.side=bounds.left+bounds.width/2<innerWidth/2?'right':'left';
  detailBackdrop.hidden=false;
  requestAnimationFrame(()=>{detailBackdrop.classList.add('active');detail.classList.add('active')});
  detail.setAttribute('aria-hidden','false');lockPageScroll();
  setTimeout(()=>$('#detailClose').focus({preventScroll:true}),180);
}
function closeDetail(){
  if(detailMode!=='manual'||!detail.classList.contains('active'))return;
  detailMode='closed';
  detail.classList.remove('active');detailBackdrop.classList.remove('active');detail.setAttribute('aria-hidden','true');
  $$('.postcard').forEach(card=>{card.classList.remove('is-selected');card.style.setProperty('--wobble','0deg');card.style.setProperty('--card-scale','1')});
  detailCloseTimer=setTimeout(()=>{detailBackdrop.hidden=true;unlockPageScroll()},420);
  detailReturnFocus?.focus?.({preventScroll:true});
}
document.addEventListener('click',e=>{const opener=e.target.closest('[data-cat]');if(opener)openDetail(Number(opener.dataset.cat),opener)});
$('#detailClose').addEventListener('click',closeDetail);
detailBackdrop.addEventListener('click',closeDetail);
document.addEventListener('pointerdown',e=>{if(detail.classList.contains('active')&&!detail.contains(e.target)&&!booking.classList.contains('active'))closeDetail()});
$$('.postcard').forEach(card=>{let start=null;card.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY}});card.addEventListener('pointerup',e=>{if(!start)return;const dy=start.y-e.clientY;if(dy>42&&Math.abs(e.clientX-start.x)<90)openDetail(Number(card.dataset.cat),card);start=null});card.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=card.getBoundingClientRect();const dx=(e.clientX-r.left)/r.width-.5;card.style.setProperty('--wobble',`${dx*7}deg`);card.style.setProperty('--card-scale','1.055')});card.addEventListener('pointerleave',()=>{card.style.setProperty('--wobble','0deg');card.style.setProperty('--card-scale','1')})});
const anchorProgress=new Map([[hero,0],[gallery,.66],[diary,.12],[visit,.88]]);
$$('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const section=document.getElementById(link.hash.slice(1));if(!section)return;
  event.preventDefault();
  const progress=reduced?0:(anchorProgress.get(section)||0);
  const top=section.offsetTop+Math.max(0,section.offsetHeight-innerHeight)*progress;
  if(lenis)lenis.scrollTo(top,{duration:Math.min(2,Math.max(.65,Math.abs(top-scrollY)/5500)),lerp:0});
  else window.scrollTo({top,behavior:reduced?'instant':'smooth'});
  history.replaceState(null,'',link.hash);
}));
const bookingSelect=$('#bookingCat');bookingSelect.innerHTML='<option value="">还没有决定</option>'+cats.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
function openBooking(){window.WillowbrookSite.resetBooking();clearTimeout(bookingCloseTimer);bookingReturnFocus=document.activeElement;bookingSelect.value=detail.classList.contains('active')?cats[activeCat].name:'';bookingBackdrop.hidden=false;requestAnimationFrame(()=>{bookingBackdrop.classList.add('active');booking.classList.add('active')});booking.setAttribute('aria-hidden','false');lockPageScroll();setTimeout(()=>$('#bookingClose').focus({preventScroll:true}),150)}
function closeBooking(){booking.classList.remove('active');bookingBackdrop.classList.remove('active');booking.setAttribute('aria-hidden','true');bookingCloseTimer=setTimeout(()=>{bookingBackdrop.hidden=true;unlockPageScroll()},400);bookingReturnFocus?.focus?.({preventScroll:true})}
$$('[data-open-booking]').forEach(button=>button.addEventListener('click',openBooking));$('#bookingClose').addEventListener('click',closeBooking);bookingBackdrop.addEventListener('click',closeBooking);
$('#bookingForm').addEventListener('submit',e=>{e.preventDefault();window.WillowbrookSite.previewBooking(new FormData(e.currentTarget))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(booking.classList.contains('active'))closeBooking();else if(detail.classList.contains('active'))closeDetail()}});
$('#menuToggle').addEventListener('click',e=>{const menu=$('.main-nav');menu.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',menu.classList.contains('open'))});$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{$('.main-nav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}));
