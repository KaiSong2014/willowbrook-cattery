// npm install --no-save jsdom; node scripts/test_data.cjs
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
for(const mode of ['demo','official','invalid','filled']){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only'});
  const w=dom.window,d=w.document;
  w.eval(fs.readFileSync(path.join(root,'site-config.js'),'utf8'));
  w.WILLOWBROOK_CONFIG.mode=mode==='filled'?'official':mode;
  if(mode==='filled')Object.assign(w.WILLOWBROOK_CONFIG.official,{address:'测试地址',hours:'测试时间',contact:'测试渠道',map:{label:'测试',latitude:0,longitude:0},menu:[{title:'测试',items:[{name:'<b>测试</b>',price:0}]}],booking:{status:'preview'}});
  w.eval(fs.readFileSync(path.join(root,'site-data.js'),'utf8'));
  const facts=[...d.querySelectorAll('[data-site=facts]')].map(e=>e.textContent);
  assert.equal(facts[0],facts[1]);
  assert.equal(new Set([...d.querySelectorAll('[data-open-booking]')].map(e=>e.textContent)).size,1);
  assert.equal(d.querySelector('#bookingForm').hidden,mode!=='demo');
  w.WillowbrookSite.previewBooking(new w.FormData(d.querySelector('#bookingForm')));
  assert.match(d.querySelector('#bookingConfirmation').textContent,mode==='demo'?/预约未提交/:/在线预约未开放/);
  d.querySelector('input[name=name]').value='测试';w.WillowbrookSite.resetBooking();
  assert.equal(d.querySelector('input[name=name]').value,'');assert.equal(d.querySelector('#bookingConfirmation').textContent,'');
  if(mode!=='demo'){
    assert.doesNotMatch(d.querySelector('#menuColumns').textContent,/花园拿铁/);
    assert.equal(d.querySelector('input[name=name]').disabled,true);
    if(mode==='filled'){
      assert.match(facts[0],/测试地址/);assert.match(d.querySelector('iframe').src,/marker=0%2C0/);
      assert.equal(d.querySelector('#menuColumns b').textContent,'¥ 0');assert.equal(d.querySelector('#menuColumns strong b'),null);
    }else assert.equal(d.querySelector('iframe').getAttribute('src'),null);
  }
  console.log(mode+': PASS');w.close();
}
