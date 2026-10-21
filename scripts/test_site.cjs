// npm install --no-save playwright; node scripts/test_site.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const server = require('node:http').createServer((req,res)=>{
    const file=path.join(__dirname,'../docs',new URL(req.url,'http://localhost').pathname);
    require('node:fs').readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}
      res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(data);});
  });
  await new Promise(resolve=>server.unref().listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
    for (const mode of ['demo','official','invalid','official-filled']) {
      const page = await browser.newPage({viewport, reducedMotion:'reduce'});
      const errors = [], posts = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', r => { if(r.method()==='POST') posts.push(r.url()); });
      await page.route('https://**/*', r => r.abort());
      await page.route('**/site-config.js', async route => {
        let body = require('node:fs').readFileSync(path.join(__dirname,'../site-config.js'),'utf8');
        body += `\nwindow.WILLOWBROOK_CONFIG.mode=${JSON.stringify(mode==='official-filled'?'official':mode)};`;
        if(mode==='official-filled') body += `\nObject.assign(window.WILLOWBROOK_CONFIG.official,{address:'测试地址（非经营资料）',hours:'测试时段',contact:'测试渠道',map:{label:'测试坐标',latitude:0,longitude:0},menu:[{title:'测试菜单',items:[{name:'<b>测试</b>',price:0}]}],booking:{status:'preview'}});`;
        await route.fulfill({body,contentType:'text/javascript'});
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await page.waitForFunction(()=>window.WillowbrookSite);
      const facts = await page.locator('[data-site="facts"]').allTextContents();
      assert.equal(facts[0],facts[1]);
      const buttons = page.locator('[data-open-booking]');
      const labels = await buttons.allTextContents(); assert.equal(new Set(labels).size,1);
      for(let i=0;i<labels.length;i++) {
        await buttons.nth(i).evaluate(el=>el.click());
        await page.waitForTimeout(180);
        assert.equal(await page.locator('#bookingForm').isVisible(),mode==='demo');
        if(mode==='demo') {
          await page.locator('input[name=name]').fill('测试访客');
          await page.locator('input[name=contact]').fill('仅测试');
          await page.locator('#bookingForm button').click();
          assert.match(await page.locator('#bookingConfirmation').textContent(),/未发送、未保存，预约未提交/);
        }
        await page.locator('#bookingClose').evaluate(el=>el.click());
      }
      if(mode!=='demo') {
        assert.doesNotMatch(await page.locator('#menuColumns').textContent(),/花园拿铁|32/);
        assert.equal(await page.locator('#bookingForm input').first().isDisabled(),true);
        if(mode==='official-filled') {
          assert.match(facts[0],/测试地址/);
          assert.match(await page.locator('#mapShell iframe').getAttribute('src'),/marker=0%2C0/);
          assert.equal(await page.locator('#menuColumns b').textContent(),'¥ 0');
          assert.equal(await page.locator('#menuColumns strong b').count(),0);
        } else assert.equal(await page.locator('#mapShell iframe').getAttribute('src'),null);
      }
      assert.deepEqual(errors,[]); assert.deepEqual(posts,[]);
      await page.close();
      console.log(`${viewport.width}px ${mode}: PASS`);
    }
  }
  await browser.close(); server.close();
})().catch(e=>{console.error(e);process.exit(1)});
