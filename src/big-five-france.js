const LIGUE_1_CLUBS = {
  "angers": {
    id: "angers", name: "昂热", short: "ANG", league: "fra", stadium: "雷蒙·科帕",
    colors: ["#ffffff", "#000000"],
    players: [
      { name: "福法纳", pos: ["GK"], nat: "法国", rate: 81 },
      { name: "勒福尔", pos: ["CB"], nat: "法国", rate: 81 },
      { name: "阿卜杜利", pos: ["CM", "CDM"], nat: "法国", rate: 80 },
      { name: "阿霍卢", pos: ["CAM", "CM"], nat: "法国", rate: 80 },
      { name: "恩迪亚耶", pos: ["RW", "LW"], nat: "塞内加尔", rate: 80 },
      { name: "莱维纳", pos: ["ST"], nat: "法国", rate: 80 }
    ]
  },
  "auxerre": {
    id: "auxerre", name: "欧塞尔", short: "AJA", league: "fra", stadium: "阿贝·德尚",
    colors: ["#003f87", "#ffffff"],
    players: [
      { name: "莱昂", pos: ["GK"], nat: "法国", rate: 81 },
      { name: "尤巴", pos: ["CB"], nat: "科特迪瓦", rate: 81 },
      { name: "佩兰", pos: ["CM", "CDM"], nat: "法国", rate: 81 },
      { name: "戴", pos: ["CAM", "CM"], nat: "法国", rate: 81 },
      { name: "西纳约科", pos: ["RW", "LW"], nat: "科特迪瓦", rate: 81 },
      { name: "特拉奥雷", pos: ["ST"], nat: "马里", rate: 81 }
    ]
  },
  "brest": {
    id: "brest", name: "布雷斯特", short: "BRE", league: "fra", stadium: "弗朗西斯·勒布莱",
    colors: ["#e1000f", "#ffffff"],
    players: [
      { name: "比佐", pos: ["GK"], nat: "法国", rate: 82 },
      { name: "沙尔多内", pos: ["CB"], nat: "法国", rate: 82 },
      { name: "马格内蒂", pos: ["CM", "CDM"], nat: "瑞士", rate: 82 },
      { name: "卡斯蒂略", pos: ["CAM", "CM"], nat: "西班牙", rate: 82 },
      { name: "德尔卡斯蒂略", pos: ["RW", "LW"], nat: "法国", rate: 82 },
      { name: "阿若克", pos: ["ST"], nat: "法国", rate: 82 }
    ]
  },
  "lehavre": {
    id: "lehavre", name: "勒阿弗尔", short: "HAC", league: "fra", stadium: "海洋球场",
    colors: ["#009fe3", "#ffffff"],
    players: [
      { name: "德斯马斯", pos: ["GK"], nat: "法国", rate: 80 },
      { name: "金科埃", pos: ["CB"], nat: "法国", rate: 80 },
      { name: "库兹亚耶夫", pos: ["CM", "CDM"], nat: "俄罗斯", rate: 80 },
      { name: "索库纳", pos: ["CAM", "CM"], nat: "法国", rate: 80 },
      { name: "卡西米尔", pos: ["LW", "RW"], nat: "法国", rate: 80 },
      { name: "恩迪亚耶", pos: ["ST"], nat: "法国", rate: 80 }
    ]
  },
  "lemans": {
    id: "lemans", name: "勒芒", short: "MFC", league: "fra", stadium: "莱昂·博莱",
    colors: ["#ffd600", "#000000"],
    players: [
      { name: "杜福尔", pos: ["GK"], nat: "法国", rate: 78 },
      { name: "科内", pos: ["CB"], nat: "科特迪瓦", rate: 78 },
      { name: "恩塔蒙德", pos: ["CM", "CDM"], nat: "法国", rate: 78 },
      { name: "特劳雷", pos: ["CAM", "CM"], nat: "马里", rate: 78 },
      { name: "迪亚洛", pos: ["RW", "LW"], nat: "法国", rate: 78 },
      { name: "布阿达", pos: ["ST"], nat: "法国", rate: 78 }
    ]
  },
  "lens": {
    id: "lens", name: "朗斯", short: "RCL", league: "fra", stadium: "博拉尔特-德勒利",
    colors: ["#f5c600", "#e1000f"],
    players: [
      { name: "桑巴", pos: ["GK"], nat: "刚果民主共和国", rate: 84 },
      { name: "丹索", pos: ["CB"], nat: "奥地利", rate: 84 },
      { name: "迪乌夫", pos: ["CM", "CDM"], nat: "塞内加尔", rate: 83 },
      { name: "托马森", pos: ["CAM", "CM"], nat: "丹麦", rate: 84 },
      { name: "弗兰科夫斯基", pos: ["RW", "RM"], nat: "波兰", rate: 83 },
      { name: "恩佐拉", pos: ["ST"], nat: "刚果民主共和国", rate: 84 }
    ]
  },
  "lille": {
    id: "lille", name: "里尔", short: "LIL", league: "fra", stadium: "皮埃尔·莫鲁瓦",
    colors: ["#e01f26", "#ffffff"],
    players: [
      { name: "舍瓦利耶", pos: ["GK"], nat: "法国", rate: 86 },
      { name: "迪亚基特", pos: ["CB"], nat: "法国", rate: 84 },
      { name: "安德烈", pos: ["CDM", "CM"], nat: "法国", rate: 84 },
      { name: "热戈瓦", pos: ["CAM", "CM"], nat: "法国", rate: 84 },
      { name: "热卢", pos: ["RW", "LW"], nat: "法国", rate: 84 },
      { name: "戴维", pos: ["ST"], nat: "加拿大", rate: 87 }
    ]
  },
  "lorient": {
    id: "lorient", name: "洛里昂", short: "FCL", league: "fra", stadium: "莫斯图瓦",
    colors: ["#f17829", "#000000"],
    players: [
      { name: "姆沃戈", pos: ["GK"], nat: "法国", rate: 80 },
      { name: "塔尔比", pos: ["CB"], nat: "突尼斯", rate: 80 },
      { name: "阿贝热尔", pos: ["CM", "CDM"], nat: "法国", rate: 81 },
      { name: "蓬索", pos: ["CAM", "CM"], nat: "法国", rate: 80 },
      { name: "迪亚拉", pos: ["RW", "LW"], nat: "塞内加尔", rate: 80 },
      { name: "卡卢卢", pos: ["ST"], nat: "法国", rate: 80 }
    ]
  },
  "monaco": {
    id: "monaco", name: "摩纳哥", short: "ASM", league: "fra", stadium: "路易二世",
    colors: ["#e1000f", "#ffffff"],
    players: [
      { name: "马耶茨基", pos: ["GK"], nat: "波兰", rate: 84 },
      { name: "辛戈", pos: ["CB", "RB"], nat: "法国", rate: 84 },
      { name: "扎卡里亚", pos: ["CM", "CDM"], nat: "瑞士", rate: 86 },
      { name: "阿克利乌什", pos: ["CAM", "RW"], nat: "法国", rate: 85 },
      { name: "米纳明诺", pos: ["LW", "RW"], nat: "日本", rate: 85 },
      { name: "恩博洛", pos: ["ST", "RW"], nat: "瑞士", rate: 84 }
    ]
  },
  "nice": {
    id: "nice", name: "尼斯", short: "NIC", league: "fra", stadium: "安联里维埃拉",
    colors: ["#e1000f", "#000000"],
    players: [
      { name: "布尔卡", pos: ["GK"], nat: "波兰", rate: 85 },
      { name: "托迪博", pos: ["CB"], nat: "法国", rate: 85 },
      { name: "罗萨里奥", pos: ["CDM", "CM"], nat: "荷兰", rate: 83 },
      { name: "迪奥普", pos: ["CAM", "CM"], nat: "法国", rate: 83 },
      { name: "克雷普", pos: ["RW", "LW"], nat: "法国", rate: 83 },
      { name: "古伊里", pos: ["ST"], nat: "法国", rate: 85 }
    ]
  },
  "paris-fc": {
    id: "paris-fc", name: "巴黎FC", short: "PFC", league: "fra", stadium: "让·布安",
    colors: ["#005ca9", "#ffffff"],
    players: [
      { name: "里乌", pos: ["GK"], nat: "法国", rate: 81 },
      { name: "科莱", pos: ["CB"], nat: "法国", rate: 81 },
      { name: "马尔凯蒂", pos: ["CM", "CDM"], nat: "法国", rate: 80 },
      { name: "凯巴利", pos: ["CAM", "CM"], nat: "法国", rate: 80 },
      { name: "迪科", pos: ["RW", "LW"], nat: "法国", rate: 80 },
      { name: "哈梅尔", pos: ["ST"], nat: "法国", rate: 81 }
    ]
  },
  "rennes": {
    id: "rennes", name: "雷恩", short: "REN", league: "fra", stadium: "罗阿宗公园",
    colors: ["#e1000f", "#ffffff"],
    players: [
      { name: "曼丹达", pos: ["GK"], nat: "法国", rate: 84 },
      { name: "奥斯蒂加德", pos: ["CB"], nat: "挪威", rate: 83 },
      { name: "马图西瓦", pos: ["CM", "CDM"], nat: "法国", rate: 83 },
      { name: "布里若", pos: ["CAM", "CM"], nat: "法国", rate: 85 },
      { name: "布拉斯", pos: ["RW", "CAM"], nat: "法国", rate: 84 },
      { name: "卡利穆恩多", pos: ["ST"], nat: "法国", rate: 84 }
    ]
  },
  "strasbourg": {
    id: "strasbourg", name: "斯特拉斯堡", short: "RCS", league: "fra", stadium: "梅纳乌",
    colors: ["#009fe3", "#ffffff"],
    players: [
      { name: "彼得罗维奇", pos: ["GK"], nat: "塞尔维亚", rate: 82 },
      { name: "杜埃", pos: ["CB"], nat: "法国", rate: 81 },
      { name: "安德烈·桑托斯", pos: ["CM", "CDM"], nat: "巴西", rate: 84 },
      { name: "巴夸", pos: ["CAM", "CM"], nat: "法国", rate: 83 },
      { name: "阿卜杜拉", pos: ["RW", "LW"], nat: "法国", rate: 82 },
      { name: "埃梅加", pos: ["ST"], nat: "法国", rate: 83 }
    ]
  },
  "toulouse": {
    id: "toulouse", name: "图卢兹", short: "TFC", league: "fra", stadium: "图卢兹市政",
    colors: ["#6615a6", "#ffffff"],
    players: [
      { name: "雷斯特", pos: ["GK"], nat: "法国", rate: 82 },
      { name: "科斯塔", pos: ["CB"], nat: "葡萄牙", rate: 81 },
      { name: "西索科", pos: ["CM", "CDM"], nat: "法国", rate: 81 },
      { name: "布兰科", pos: ["CAM", "CM"], nat: "法国", rate: 81 },
      { name: "阿布赫拉尔", pos: ["RW", "LW"], nat: "摩洛哥", rate: 82 },
      { name: "马格里", pos: ["ST"], nat: "阿尔及利亚", rate: 82 }
    ]
  },
  "troyes": {
    id: "troyes", name: "特鲁瓦", short: "EST", league: "fra", stadium: "奥布",
    colors: ["#005ca9", "#ffffff"],
    players: [
      { name: "加利", pos: ["GK"], nat: "法国", rate: 79 },
      { name: "萨尔米耶", pos: ["CB"], nat: "法国", rate: 79 },
      { name: "迪亚基特", pos: ["CM", "CDM"], nat: "科特迪瓦", rate: 79 },
      { name: "穆萨·索", pos: ["CAM", "CM"], nat: "法国", rate: 79 },
      { name: "巴尔卡", pos: ["LW", "RW"], nat: "法国", rate: 79 },
      { name: "姆贝亚", pos: ["ST"], nat: "法国", rate: 79 }
    ]
  }
};

Object.assign(CLUBS, LIGUE_1_CLUBS);
