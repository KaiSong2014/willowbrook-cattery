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
const hero=$('#home'), gallery=$('#featured'), story=$('#story'), diary=$('#diary'), visit=$('#visit'), idleVideo=$('#heroIdle'), frameCanvas=$('#heroFrames'), handoffCanvas=$('#heroHandoff');
const postcards=$('#postcardStage');
const detail=$('#detailPanel'), detailBackdrop=$('#detailBackdrop');
const booking=$('#bookingModal'), bookingBackdrop=$('#bookingBackdrop');
let activeCat=2, lastFocus=null, detailCloseTimer=0, detailMode='closed';
const frameCount=180, firstScrollFrame=19, frameCache=new Map(), frameLoading=new Set(), frameContext=frameCanvas.getContext('2d',{alpha:false});
let frameTarget=0, frameShown=-1, frameQueue=[], heroProgress=0, handoffCaptured=false, handoffReady=false, introFrame=firstScrollFrame, lastHeroProgress=-1, lastDiaryProgress=-1, lastMapProgress=-1;
const handoffContext=handoffCanvas.getContext('2d',{alpha:false});
const framePath=i=>`assets/frames/frame_${String(i+1).padStart(4,'0')}.webp`;
function drawFrame(i){const image=frameCache.get(i);if(!image||i===frameShown)return;frameContext.drawImage(image,0,0,frameCanvas.width,frameCanvas.height);frameShown=i;frameCache.delete(i);frameCache.set(i,image);updateHeroHandoff()}
function pumpFrames(){
  while(frameLoading.size<(handoffCaptured?4:2)){
    const i=frameQueue.find(n=>!frameCache.has(n)&&!frameLoading.has(n));
    if(i===undefined)break;
    frameLoading.add(i);
    const image=new Image();image.decoding='async';image.src=framePath(i);
    image.decode().then(()=>{
      frameCache.set(i,image);
      while(frameCache.size>28){const oldest=frameCache.keys().next().value;if(oldest===frameShown||oldest===frameTarget){const keep=frameCache.get(oldest);frameCache.delete(oldest);frameCache.set(oldest,keep)}else frameCache.delete(oldest)}
      if(i===frameTarget||frameShown<0||Math.abs(i-frameTarget)<Math.abs(frameShown-frameTarget))drawFrame(i);
    }).catch(()=>{if(i===firstScrollFrame&&frameShown<0)frameCanvas.style.background="url('assets/video/hero-poster.webp') center/cover"}).finally(()=>{frameLoading.delete(i);pumpFrames()});
  }
}
function requestFrame(i){
  frameTarget=clamp(Math.round(i),0,frameCount-1);
  const old=frameShown;
  const direction=old<0||frameTarget>=old?1:-1;
  frameQueue=[frameTarget];
  for(let step=1;step<=7;step++){const ahead=frameTarget+direction*step,behind=frameTarget-direction*step;if(ahead>=0&&ahead<frameCount)frameQueue.push(ahead);if(behind>=0&&behind<frameCount)frameQueue.push(behind)}
  if(!handoffCaptured)for(let i=0;i<=firstScrollFrame;i++)frameQueue.push(i);
  if(frameCache.has(frameTarget))drawFrame(frameTarget);
  pumpFrames();
}
const poster=new Image();poster.src='assets/video/hero-poster.webp';poster.decode().then(()=>{if(frameShown<0)frameContext.drawImage(poster,0,0,frameCanvas.width,frameCanvas.height)}).catch(()=>{});
requestFrame(firstScrollFrame);
function updateHeroHandoff(){if(!handoffCaptured)return;if(!handoffReady&&frameShown>=0&&Math.abs(frameShown-frameTarget)<=2){handoffReady=true;frameCanvas.style.opacity='1';handoffCanvas.classList.add('is-fading')}}
function captureIntro(){if(handoffCaptured||reduced)return;handoffCaptured=true;const t=idleVideo.currentTime||0;introFrame=clamp(Math.round(Math.min(t,Math.max(0,3.125-t))*12),0,firstScrollFrame);try{if(idleVideo.readyState>=2)handoffContext.drawImage(idleVideo,0,0,handoffCanvas.width,handoffCanvas.height);else if(poster.complete)handoffContext.drawImage(poster,0,0,handoffCanvas.width,handoffCanvas.height)}catch(_){if(poster.complete)handoffContext.drawImage(poster,0,0,handoffCanvas.width,handoffCanvas.height)}handoffCanvas.style.opacity='1';idleVideo.style.opacity='0';idleVideo.pause();requestFrame(introFrame);updateHeroHandoff()}
if(reduced){idleVideo.pause();idleVideo.removeAttribute('autoplay')}
else idleVideo.play().catch(()=>{});
idleVideo.addEventListener('error',()=>{idleVideo.style.display='none';frameCanvas.style.opacity='1'});
postcards.innerHTML=cats.map((cat,i)=>`<button class="postcard" type="button" data-cat="${i}" aria-label="查看${cat.name}的资料" style="--rise:110vh"><img class="postcard-photo" src="${cat.image}" alt="${cat.name}的肖像"><span class="postcard-name">${cat.english}</span><span class="postcard-heart" aria-hidden="true">♡</span></button>`).join('');
$('#diaryImages').innerHTML=cats.map((cat,i)=>`<figure class="diary-slide"><img class="diary-backdrop" src="${cat.image}" alt="" aria-hidden="true" loading="lazy"><img class="diary-image" src="${cat.image}" alt="${cat.name}的完整照片" loading="${i<2?'eager':'lazy'}"><figcaption class="diary-static-caption">${cat.name} · ${cat.age}</figcaption></figure>`).join('');
$('#diaryTrack').innerHTML=cats.map(()=>'<span></span>').join('');
$('#mapGrid').innerHTML=Array.from({length:12},(_,i)=>`<div class="map-tile" style="--tile:${i};--col:${i%4};--row:${Math.floor(i/4)}"><img src="${cats[(i*5+Math.floor(i/4))%cats.length].image}" alt=""></div>`).join('');
const diarySlides=$$('.diary-slide'), diaryMarkers=$$('#diaryTrack span'), mapTiles=$$('.map-tile');
const diaryVisual=$('#diaryVisual'), diaryCopy=$('#diaryCopy'), visitScene=$('#visitScene'), visitArrival=$('#visitArrival'), gridWindow=$('#mapGridWindow');
function renderHero(p){
  if(Math.abs(p-lastHeroProgress)<.0005)return;lastHeroProgress=p;
  heroProgress=p;
  $('#filmProgress').style.width=`${Math.min(p/.84,1)*100}%`;
  const filmProgress=smooth(0,.82,p);
  if(p>.002)captureIntro();
  requestFrame(introFrame+filmProgress*(frameCount-1-introFrame));
  const a=1-smooth(.23,.43,p),b=smooth(.29,.46,p)*(1-smooth(.67,.81,p));
  $('#filmFirst').style.opacity=a;$('#filmFirst').style.transform=`translateY(${-38*smooth(.2,.44,p)}px)`;
  $('#filmSecond').style.opacity=b;$('#filmSecond').style.transform=`translateY(${55*(1-smooth(.3,.46,p))-30*smooth(.67,.81,p)}px)`;
  $('#filmScript').style.opacity=1-smooth(.25,.4,p);
  $('.scroll-cue').style.opacity=1-smooth(.08,.2,p);
  const zoom=smooth(.79,.97,p),bridge=smooth(.91,1,p);
  if(p<=.002){handoffCaptured=false;handoffReady=false;introFrame=firstScrollFrame;handoffCanvas.classList.remove('is-fading');handoffCanvas.style.opacity='0';frameCanvas.style.opacity=idleVideo.style.display==='none'?'1':'0';idleVideo.style.opacity='1';if(idleVideo.paused&&!document.hidden&&!reduced&&idleVideo.style.display!=='none')idleVideo.play().catch(()=>{})}
  else if(handoffReady)frameCanvas.style.opacity=String(1-bridge);
  handoffCanvas.style.visibility=bridge>.98?'hidden':'visible';
  frameCanvas.style.transform=`scale(${1+5.4*zoom})`;
  handoffCanvas.style.transform=frameCanvas.style.transform;
  $('.film-shade').style.opacity=1-bridge;
  $('#filmHangingNote').style.opacity=(1-smooth(.18,.36,p))*(1-bridge);
  $('.film-bottom').style.opacity=1-smooth(.75,.95,p);
  $('.film-progress').style.opacity=1-smooth(.8,.98,p);
  renderPortal(p,sectionProgress(gallery));
}
function renderPortal(heroProgress,galleryProgress){
  const galleryEntered=window.scrollY>=gallery.offsetTop;
  const iris=smooth(.77,.985,heroProgress);
  $('#portalIris').style.opacity=galleryEntered||heroProgress<.76?'0':'1';
  $('#portalIris').style.setProperty('--hole',`${Math.max(0,140*(1-iris))}vmax`);
  const coverage=galleryEntered?1-smooth(0,.13,galleryProgress):smooth(.88,.995,heroProgress);
  $('#portalShutters').style.visibility=coverage<=.001?'hidden':'visible';
  $('.portal-lid-top').style.transform=`translateY(${-100*(1-coverage)}%)`;
  $('.portal-lid-bottom').style.transform=`translateY(${100*(1-coverage)}%)`;
}
function renderGallery(p){
  const bg=smooth(.19,.48,p);$('.featured-bg').style.opacity=bg*.76;$('.featured-bg').style.transform=`scale(${1.08-.08*bg})`;$('.featured-vignette').style.opacity=bg*.58;
  const intro=smooth(.32,.47,p);$('#featuredIntro').style.opacity=intro;$('#featuredIntro').style.transform=`translateY(${25*(1-intro)}px)`;
  $('#featuredNote').style.opacity=smooth(.47,.59,p);$('#featuredHint').style.opacity=smooth(.36,.5,p);
  $$('.postcard').forEach((card,i)=>{
    const offset=i*.034, peek=smooth(.025+offset,.12+offset,p), settle=smooth(.11+offset,.22+offset,p);
    const rise=(1-peek)*75+peek*(1-settle)*18;
    card.style.setProperty('--rise',`${rise}vh`);
    card.style.opacity=smooth(.035+offset,.115+offset,p);
  });
  renderPortal(sectionProgress(hero),p);
}
function renderDiary(p){
  if(Math.abs(p-lastDiaryProgress)<.0005)return;
  lastDiaryProgress=p;
  const time=clamp((p-.08)/.76)*cats.length;
  const index=Math.min(cats.length-1,Math.floor(time)), phase=time-index;
  const blend=index<cats.length-1?smooth(.7,1,phase):0;
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
  // The whole composition retreats into the same centered aperture used by the next scene.
  diaryVisual.style.transform=`scale(${(.08+.92*opening)*(1-.965*closing)})`;
  diaryVisual.style.borderRadius=`${32*(1-opening+closing)}px`;
  diaryVisual.style.opacity=String(1-smooth(.982,1,p));
  for(const el of $$('.diary-top,.diary-track,.diary-caption'))el.style.opacity=String(1-smooth(.86,.94,p));
}
function renderMapGrid(p){
  // The incoming sticky scene stays invisible while its normal-flow box crosses the viewport.
  // It takes over exactly where the outgoing diary has finished shrinking, including in reverse.
  visitScene.classList.toggle('is-entered',window.scrollY>=visit.offsetTop-.5);
  if(Math.abs(p-lastMapProgress)<.0005)return;
  lastMapProgress=p;
  const opening=smooth(0,.14,p),scatter=smooth(.17,.56,p),fade=smooth(.39,.62,p),arrival=smooth(.32,.76,p);
  $('.visit-atmosphere').style.opacity=String(smooth(0,.18,p));
  gridWindow.style.transform=`scale(${.035+.965*opening})`;
  gridWindow.style.borderRadius=`${32*(1-opening)}px`;
  gridWindow.style.opacity=String(smooth(0,.018,p));
  const columns=innerWidth<=760?3:4,rows=12/columns;
  mapTiles.forEach((tile,i)=>{
    const col=i%columns,row=Math.floor(i/columns);
    const dx=(col-(columns-1)/2)*85,dy=(row-(rows-1)/2)*85;
    tile.style.transform=`translate(${dx*scatter}vw,${dy*scatter}vh) rotate(${(i%2?-1:1)*(12+i*1.9)*scatter}deg) scale(${1-.18*scatter})`;
    tile.style.opacity=String(1-fade);
  });
  // No vertical entrance: perspective and scale bring the centered map towards the viewer.
  visitArrival.style.transform=`translateZ(${-2400*(1-arrival)}px) scale(${.36+.64*arrival})`;
  visitArrival.style.opacity=String(smooth(.32,.46,p));
  visitArrival.style.filter=`blur(${8*(1-arrival)}px)`;
  visitArrival.inert=arrival<.995;
  visitScene.classList.toggle('is-map-ready',arrival>=.995);
  if(arrival<.995&&$('#mapShell').classList.contains('is-interactive'))setMapInteraction(false);
}
function sectionProgress(el){const travel=el.offsetHeight-window.innerHeight;return travel<=0?0:clamp((window.scrollY-el.offsetTop)/travel)}
function updateScroll(){if(!reduced){renderHero(sectionProgress(hero));renderGallery(sectionProgress(gallery));renderDiary(sectionProgress(diary));renderMapGrid(sectionProgress(visit))}else{visitArrival.inert=false;visitScene.classList.add('is-entered','is-map-ready')}$('#siteHeader').classList.toggle('scrolled',window.scrollY>story.offsetTop-80)}
let scrollPending=false;function scheduleScroll(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;updateScroll()})}
window.addEventListener('scroll',scheduleScroll,{passive:true});window.addEventListener('resize',()=>{lastDiaryProgress=-1;lastMapProgress=-1;scheduleScroll()});window.addEventListener('load',updateScroll);updateScroll();
const storyObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){story.classList.add('is-visible');storyObserver.disconnect()}},{threshold:.16});storyObserver.observe(story);
function setMapInteraction(enabled){$('#mapShell').classList.toggle('is-interactive',enabled);$('#mapInteract').setAttribute('aria-pressed',String(enabled));$('#mapInteract').textContent=enabled?'退出地图操作':'点击操作地图'}
$('#mapInteract').addEventListener('click',()=>setMapInteraction(!$('#mapShell').classList.contains('is-interactive')));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMapInteraction(false)});
// ScrollTrigger manages scroll progress and reverse motion when available; native scroll is the offline fallback.
if(window.gsap&&window.ScrollTrigger&&!reduced){gsap.registerPlugin(ScrollTrigger);ScrollTrigger.create({trigger:hero,start:'top top',end:'bottom bottom',onUpdate:self=>renderHero(self.progress)});ScrollTrigger.create({trigger:gallery,start:'top top',end:'bottom bottom',onUpdate:self=>renderGallery(self.progress)});ScrollTrigger.create({trigger:diary,start:'top top',end:'bottom bottom',onUpdate:self=>renderDiary(self.progress)});ScrollTrigger.create({trigger:visit,start:'top top',end:'bottom bottom',onUpdate:self=>renderMapGrid(self.progress)})}
document.addEventListener('visibilitychange',()=>{if(document.hidden)idleVideo.pause();else if(sectionProgress(hero)<.03)idleVideo.play().catch(()=>{})});
function renderDetail(cat){$('#detailImage').src=cat.image;$('#detailImage').alt=`${cat.name}的肖像`;$('#detailName').textContent=cat.name;$('#detailGender').textContent=cat.gender;$('#detailTrait').textContent=cat.tag;$('#detailHandwriting').textContent=cat.hand;$('#detailBio').textContent=cat.bio;$('#detailFacts').innerHTML=`<div><dt>年龄</dt><dd>${cat.age}</dd></div><div><dt>品种</dt><dd>${cat.breed}</dd></div><div><dt>健康</dt><dd>${cat.health}</dd></div><div><dt>医疗</dt><dd>${cat.medical}</dd></div><div><dt>性格</dt><dd>${cat.personality}</dd></div>`;$('#detailScroll').scrollTop=0}
function openDetail(index,opener){
  clearTimeout(detailCloseTimer);
  detailMode='manual';
  activeCat=index;lastFocus=document.activeElement;renderDetail(cats[index]);
  $$('.postcard').forEach((card,i)=>card.classList.toggle('is-selected',i===index));
  const card=opener?.classList.contains('postcard')?opener:$$('.postcard')[index];
  const bounds=card.getBoundingClientRect();
  detail.dataset.side=bounds.left+bounds.width/2<innerWidth/2?'right':'left';
  detailBackdrop.hidden=false;
  requestAnimationFrame(()=>{detailBackdrop.classList.add('active');detail.classList.add('active')});
  detail.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  setTimeout(()=>$('#detailClose').focus(),180);
}
function closeDetail(){
  if(detailMode!=='manual'||!detail.classList.contains('active'))return;
  detailMode='closed';
  detail.classList.remove('active');detailBackdrop.classList.remove('active');detail.setAttribute('aria-hidden','true');
  $$('.postcard').forEach(card=>card.classList.remove('is-selected'));
  detailCloseTimer=setTimeout(()=>{detailBackdrop.hidden=true;if(!booking.classList.contains('active'))document.body.style.overflow=''},420);
  lastFocus?.focus?.();
}
const wand=$('#wandCursor');if(!reduced&&matchMedia('(pointer:fine)').matches){document.documentElement.classList.add('has-wand');let targetX=-100,targetY=-100,currentX=-100,currentY=-100;document.addEventListener('pointermove',e=>{targetX=e.clientX;targetY=e.clientY;wand.classList.add('visible')},{passive:true});document.addEventListener('pointerleave',()=>wand.classList.remove('visible'));const moveWand=()=>{currentX+=(targetX-currentX)*.28;currentY+=(targetY-currentY)*.28;wand.style.transform=`translate3d(${currentX}px,${currentY}px,0) rotate(${Math.sin(performance.now()/450)*5}deg)`;requestAnimationFrame(moveWand)};moveWand()}
document.addEventListener('click',e=>{const opener=e.target.closest('[data-cat]');if(opener)openDetail(Number(opener.dataset.cat),opener)});
$('#detailClose').addEventListener('click',closeDetail);
detailBackdrop.addEventListener('click',closeDetail);
document.addEventListener('pointerdown',e=>{if(detail.classList.contains('active')&&!detail.contains(e.target)&&!booking.classList.contains('active'))closeDetail()});
$$('.postcard').forEach(card=>{let start=null;card.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY}});card.addEventListener('pointerup',e=>{if(!start)return;const dy=start.y-e.clientY;if(dy>42&&Math.abs(e.clientX-start.x)<90)openDetail(Number(card.dataset.cat),card);start=null});card.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=card.getBoundingClientRect();const dx=(e.clientX-r.left)/r.width-.5;card.style.setProperty('--wobble',`${dx*7}deg`);card.style.setProperty('--card-scale','1.055')});card.addEventListener('pointerleave',()=>{card.style.setProperty('--wobble','0deg');card.style.setProperty('--card-scale','1')})});
$$('a[href="#featured"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();const distance=gallery.offsetHeight-innerHeight;window.scrollTo({top:gallery.offsetTop+distance*.52,behavior:reduced?'instant':'smooth'});history.replaceState(null,'','#featured')}));
for(const [section,progress] of [[diary,.12],[visit,.82]]){
  $$(`a[href="#${section.id}"]`).forEach(link=>link.addEventListener('click',e=>{
    e.preventDefault();
    window.scrollTo({top:section.offsetTop+(reduced?0:(section.offsetHeight-innerHeight)*progress),behavior:reduced?'instant':'smooth'});
    history.replaceState(null,'',`#${section.id}`);
  }));
}
const bookingSelect=$('#bookingCat');bookingSelect.innerHTML='<option value="">还没有决定</option>'+cats.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
function openBooking(){lastFocus=document.activeElement;bookingSelect.value=detail.classList.contains('active')?cats[activeCat].name:'';bookingBackdrop.hidden=false;requestAnimationFrame(()=>{bookingBackdrop.classList.add('active');booking.classList.add('active')});booking.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>$('#bookingClose').focus(),150)}
function closeBooking(){booking.classList.remove('active');bookingBackdrop.classList.remove('active');booking.setAttribute('aria-hidden','true');setTimeout(()=>{bookingBackdrop.hidden=true;if(!detail.classList.contains('active'))document.body.style.overflow=''},400);lastFocus?.focus?.()}
$$('[data-open-booking]').forEach(button=>button.addEventListener('click',openBooking));$('#bookingClose').addEventListener('click',closeBooking);bookingBackdrop.addEventListener('click',closeBooking);
$('#bookingForm').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);$('#bookingConfirmation').textContent=`预览：${data.get('name')}想预约${data.get('cat')||'猫咪'}。演示页面未发送信息，请等待正式预约方式上线。`});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(booking.classList.contains('active'))closeBooking();else if(detail.classList.contains('active'))closeDetail()}});
$('#menuToggle').addEventListener('click',e=>{const menu=$('.main-nav');menu.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',menu.classList.contains('open'))});$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{$('.main-nav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}));
