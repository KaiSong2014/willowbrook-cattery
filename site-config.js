// 唯一经营资料入口。mode 仅接受 demo / official；无效值按未配置处理。
// official 不继承 demo 数据，也不启用预约收集。
window.WILLOWBROOK_CONFIG = {
  mode: 'demo',
  demo: {
    address: null, hours: null, contact: null,
    map: { label: '北京 · 朝阳区', latitude: 39.925, longitude: 116.445 },
    menu: [
      { title: '饮品', english: 'DRINKS', items: [
        { name: '花园拿铁', english: 'Garden Latte', price: 32 },
        { name: '蜂蜜柚子茶', english: 'Honey Citrus Tea', price: 28 },
        { name: '热可可', english: 'Warm Cocoa', price: 30 }
      ] },
      { title: '甜点', english: 'SWEETS', items: [
        { name: '猫爪曲奇', english: 'Paw Cookies', price: 22 },
        { name: '莓果奶油蛋糕', english: 'Berry Cream Cake', price: 38 },
        { name: '午后司康', english: 'Afternoon Scone', price: 26 }
      ] }
    ],
    booking: { status: 'preview', instructions: null }
  },
  official: {
    address: null, hours: null, contact: null,
    map: null, // { label: '经核实的位置名称', latitude: 数值, longitude: 数值 }
    menu: [], // 同 demo.menu 结构；price 为非负数，另填 allergens 过敏原说明
    booking: { status: 'closed', instructions: null }
  }
};
