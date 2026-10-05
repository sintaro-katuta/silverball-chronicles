export const FLOOR_ONE = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `tsukikage-${i + 1}`,
    name: '月影機関',
    unit: i + 1,
    pegSeed: 101 + i,
    model: '月影機関',
    kind: 'main',
    note: '遊技試作あり・個体ごとに釘配置を調整'
  })),
  { id: 'dummy-06', name: '月影の境界', unit: 6, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-07', name: '星渡りの旅人', unit: 7, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-08', name: '蒼天の航路', unit: 8, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-09', name: '紅蓮の守護者', unit: 9, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-10', name: '銀河鉄道X', unit: 10, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-11', name: '海鳴りの巫女', unit: 11, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-12', name: '電脳忍法帖', unit: 12, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-13', name: '黄金航海記', unit: 13, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-14', name: '怪盗ミッドナイト', unit: 14, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-15', name: '天翔ける竜', unit: 15, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-16', name: '夢幻の花札', unit: 16, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-17', name: '深海の王冠', unit: 17, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-18', name: '忍びの月影', unit: 18, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-19', name: '爆走銀河便', unit: 19, model: 'ダミー機種', kind: 'dummy', note: '仮機種' },
  { id: 'dummy-20', name: '氷華の剣', unit: 20, model: 'ダミー機種', kind: 'dummy', note: '仮機種' }
];
