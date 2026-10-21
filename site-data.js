/* 经营资料渲染独立于动画。所有配置文本以 textContent 写入。无网络提交、存储或预约接口。 */
(() => {
  const config = window.WILLOWBROOK_CONFIG || {};
  const demo = config.mode === 'demo';
  const profile = (demo ? config.demo : config.mode === 'official' ? config.official : null) || {};
  const text = (value, fallback) => typeof value === 'string' && value.trim() ? value.trim() : fallback;
  const preview = demo && profile.booking?.status === 'preview';
  const bookingNote = preview
    ? '演示预约：仅在本页预览，不会发送或保存。请勿填写真实联系方式。'
    : '在线预约未开放，不会发送预约申请。';
  const instructions = text(profile.booking?.instructions, '预约方式待正式公布');
  const values = {
    address: text(profile.address, '正式地址待确认'),
    hours: text(profile.hours, '正式营业时间待确认'),
    contact: text(profile.contact, '正式联系方式待补充')
  };
  const fill = (key, value) => document.querySelectorAll(`[data-site="${key}"]`).forEach(el => { el.textContent = value; });
  fill('modeLabel', demo ? '© 2026 · 视觉概念演示' : '© 2026 · 门店资料（未填写项待确认）');
  fill('visitNote', `${demo ? '演示模式：地图为示意位置，并非真实门店地址。' : '门店资料以本页已填写信息为准，未填写项待确认。'}${bookingNote}`);
  document.querySelectorAll('[data-site="facts"]').forEach(dl => {
    for (const [label, value] of [['到访地址', values.address], ['营业时间', values.hours], ['联系渠道', values.contact], ['预约状态', `${bookingNote} ${instructions}`]]) {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = value; row.append(dt, dd); dl.append(row);
    }
  });
  const map = profile.map;
  const validMap = map && Number.isFinite(map.latitude) && Math.abs(map.latitude) <= 85 && Number.isFinite(map.longitude) && Math.abs(map.longitude) <= 180;
  const frame = document.querySelector('#mapShell iframe'), interact = document.querySelector('#mapInteract');
  fill('mapLabel', validMap ? text(map.label, demo ? '示意位置' : values.address) : '门店位置待确认');
  fill('mapNote', demo && validMap ? '示意位置，非真实门店地址' : validMap ? '门店位置' : '暂无正式坐标');
  interact.hidden = !validMap;
  if (validMap) {
    const lat = map.latitude, lon = map.longitude;
    const params = new URLSearchParams({ bbox: [Math.max(-180,lon-.045),Math.max(-85,lat-.035),Math.min(180,lon+.045),Math.min(85,lat+.035)].join(','), layer: 'mapnik', marker: `${lat},${lon}` });
    frame.src = `https://www.openstreetmap.org/export/embed.html?${params}`;
    frame.title = `${demo ? '示意地图，非真实门店地址' : '门店地图'}：${text(map.label, values.address)}`;
    frame.hidden = false;
  }
  const menuNote = demo ? '菜单示例 · 品项与价格为演示内容，过敏原信息待确认' : '门店菜单 · 未填写的品项、价格及过敏原信息待确认';
  fill('menuNote', menuNote); fill('menuLabel', demo ? 'WILLOWBROOK · SAMPLE MENU' : 'WILLOWBROOK · MENU');
  const board = document.querySelector('#menuColumns');
  const groups = Array.isArray(profile.menu) ? profile.menu : [];
  const element = (tag, value) => { const el = document.createElement(tag); el.textContent = value; return el; };
  for (const group of groups) {
    if (!group || !Array.isArray(group.items)) continue;
    const column = document.createElement('div'), heading = element('h3', text(group.title, '菜单'));
    heading.append(element('small', text(group.english, ''))); column.append(heading);
    for (const item of group.items) {
      if (!item) continue;
      const row = document.createElement('div'), name = document.createElement('span'); row.className = 'menu-item';
      name.append(element('strong', text(item.name, '品项待确认')), element('small', text(item.english, '')));
      if (!demo) name.append(element('small', `过敏原：${text(item.allergens, '待确认')}`));
      row.append(name, element('b', Number.isFinite(item.price) && item.price >= 0 ? `¥ ${item.price}` : '价格待确认')); column.append(row);
    }
    board.append(column);
  }
  if (!board.children.length) board.append(element('p', '正式菜单待确认'));
  document.querySelectorAll('[data-open-booking]').forEach(button => {
    button.replaceChildren(document.createTextNode(preview ? '预约预览（演示） ' : '查看预约状态 '), element('span', '↗'));
  });
  const form = document.querySelector('#bookingForm'), confirmation = document.querySelector('#bookingConfirmation');
  document.querySelector('#bookingTitle').textContent = preview ? '演示预约预览' : '在线预约未开放';
  document.querySelector('#bookingNotice').textContent = `${bookingNote} ${instructions}`;
  form.hidden = !preview;
  form.querySelectorAll('input,select,button').forEach(el => { el.disabled = !preview; });
  window.WillowbrookSite = Object.freeze({
    resetBooking() { form.reset(); confirmation.textContent = ''; },
    previewBooking(data) {
      confirmation.textContent = preview ? `仅本页预览：${data.get('name') || '访客'}想见${data.get('cat') || '猫咪'}。未发送、未保存，预约未提交。` : bookingNote;
    }
  });
})();
