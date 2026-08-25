const SERIE_A_CLUBS = {
  "atalanta": {
    id: "atalanta", name: "亚特兰大", short: "ATA", league: "ita", stadium: "蓝色竞技场",
    colors: ["#1e71b8", "#000000"],
    players: [
      { name: "卡尔内塞基", pos: ["GK"], nat: "意大利", rate: 85 },
      { name: "吉姆西蒂", pos: ["CB"], nat: "阿尔巴尼亚", rate: 84 },
      { name: "德容恩", pos: ["CDM", "CM"], nat: "荷兰", rate: 84 },
      { name: "埃德松", pos: ["CM", "CDM"], nat: "巴西", rate: 85 },
      { name: "卢克曼", pos: ["RW", "ST"], nat: "尼日利亚", rate: 87 },
      { name: "雷特吉", pos: ["ST"], nat: "阿根廷", rate: 86 }
    ]
  },
  "bologna": {
    id: "bologna", name: "博洛尼亚", short: "BOL", league: "ita", stadium: "达拉拉",
    colors: ["#a21c26", "#ffffff"],
    players: [
      { name: "斯科鲁普斯基", pos: ["GK"], nat: "波兰", rate: 84 },
      { name: "贝卡马", pos: ["CB"], nat: "法国", rate: 83 },
      { name: "弗罗伊勒", pos: ["CM", "CDM"], nat: "瑞士", rate: 84 },
      { name: "奥索利尼", pos: ["RW"], nat: "意大利", rate: 84 },
      { name: "恩多耶", pos: ["LW", "RW"], nat: "瑞士", rate: 84 },
      { name: "卡斯特罗", pos: ["ST", "CAM"], nat: "阿根廷", rate: 83 }
    ]
  },
  "cagliari": {
    id: "cagliari", name: "卡利亚里", short: "CAG", league: "ita", stadium: "撒丁岛竞技场",
    colors: ["#b31b34", "#006ca8"],
    players: [
      { name: "斯库费特", pos: ["GK"], nat: "罗马尼亚", rate: 82 },
      { name: "米纳", pos: ["CB"], nat: "哥伦比亚", rate: 83 },
      { name: "马林", pos: ["CM", "CDM"], nat: "罗马尼亚", rate: 82 },
      { name: "卢文博", pos: ["RW", "LW"], nat: "刚果民主共和国", rate: 81 },
      { name: "佐尔泰亚", pos: ["LW", "RW"], nat: "意大利", rate: 81 },
      { name: "皮科利", pos: ["ST"], nat: "意大利", rate: 81 }
    ]
  },
  "como": {
    id: "como", name: "科莫", short: "COM", league: "ita", stadium: "朱塞佩·西尼加利亚",
    colors: ["#005da9", "#ffffff"],
    players: [
      { name: "雷纳", pos: ["GK"], nat: "西班牙", rate: 82 },
      { name: "多塞纳", pos: ["CB"], nat: "意大利", rate: 82 },
      { name: "塞尔吉·罗贝托", pos: ["CM", "RB"], nat: "西班牙", rate: 83 },
      { name: "法布雷加斯", pos: ["CAM", "CM"], nat: "西班牙", rate: 86 },
      { name: "帕斯", pos: ["CAM", "LW"], nat: "西班牙", rate: 85 },
      { name: "贝洛蒂", pos: ["ST"], nat: "意大利", rate: 83 }
    ]
  },
  "fiorentina": {
    id: "fiorentina", name: "佛罗伦萨", short: "FIO", league: "ita", stadium: "弗兰基",
    colors: ["#582c83", "#ffffff"],
    players: [
      { name: "德赫亚", pos: ["GK"], nat: "西班牙", rate: 86 },
      { name: "科穆佐", pos: ["CB"], nat: "意大利", rate: 84 },
      { name: "博韦", pos: ["CM", "CDM"], nat: "意大利", rate: 83 },
      { name: "古德蒙德松", pos: ["RW", "ST"], nat: "冰岛", rate: 84 },
      { name: "基恩", pos: ["ST"], nat: "意大利", rate: 85 },
      { name: "科尔帕尼", pos: ["CAM", "CM"], nat: "意大利", rate: 84 }
    ]
  },
  "frosinone": {
    id: "frosinone", name: "弗罗西诺内", short: "FRO", league: "ita", stadium: "贝尼托·斯蒂佩",
    colors: ["#f2b705", "#003d7c"],
    players: [
      { name: "塞罗福利尼", pos: ["GK"], nat: "意大利", rate: 79 },
      { name: "奥科利", pos: ["CB"], nat: "意大利", rate: 80 },
      { name: "布雷夏尼尼", pos: ["CM", "CAM"], nat: "意大利", rate: 80 },
      { name: "库尼", pos: ["CAM", "CM"], nat: "阿尔巴尼亚", rate: 80 },
      { name: "吉里诺", pos: ["RW", "LW"], nat: "意大利", rate: 79 },
      { name: "萨利比亚", pos: ["ST"], nat: "意大利", rate: 79 }
    ]
  },
  "genoa": {
    id: "genoa", name: "热那亚", short: "GEN", league: "ita", stadium: "路易吉·费拉里斯",
    colors: ["#d71920", "#ffffff"],
    players: [
      { name: "莱亚利", pos: ["GK"], nat: "意大利", rate: 81 },
      { name: "巴尼", pos: ["CB"], nat: "意大利", rate: 82 },
      { name: "弗伦德卢普", pos: ["CDM", "CM"], nat: "丹麦", rate: 82 },
      { name: "马利诺夫斯基", pos: ["CAM", "CM"], nat: "乌克兰", rate: 83 },
      { name: "梅西亚斯", pos: ["RW", "CAM"], nat: "巴西", rate: 82 },
      { name: "皮纳蒙蒂", pos: ["ST"], nat: "意大利", rate: 83 }
    ]
  },
  "lazio": {
    id: "lazio", name: "拉齐奥", short: "LAZ", league: "ita", stadium: "奥林匹克",
    colors: ["#87d8f7", "#ffffff"],
    players: [
      { name: "普罗维德尔", pos: ["GK"], nat: "意大利", rate: 84 },
      { name: "罗马尼奥利", pos: ["CB"], nat: "意大利", rate: 84 },
      { name: "贡多齐", pos: ["CM", "CDM"], nat: "法国", rate: 85 },
      { name: "镰田大地", pos: ["CAM", "CM"], nat: "日本", rate: 85 },
      { name: "伊萨克森", pos: ["RW", "LW"], nat: "丹麦", rate: 83 },
      { name: "卡斯特利亚诺斯", pos: ["ST"], nat: "阿根廷", rate: 84 }
    ]
  },
  "lecce": {
    id: "lecce", name: "莱切", short: "LEC", league: "ita", stadium: "维亚德尔马雷",
    colors: ["#f5c600", "#ffffff"],
    players: [
      { name: "法尔科内", pos: ["GK"], nat: "意大利", rate: 82 },
      { name: "巴斯奇罗托", pos: ["CB"], nat: "意大利", rate: 81 },
      { name: "拉马达尼", pos: ["CM", "CDM"], nat: "北马其顿", rate: 80 },
      { name: "莫罗", pos: ["CAM", "CM"], nat: "意大利", rate: 80 },
      { name: "斯特雷费扎", pos: ["RW", "LW"], nat: "罗马尼亚", rate: 80 },
      { name: "克尔斯托维奇", pos: ["ST"], nat: "黑山", rate: 81 }
    ]
  },
  "monza": {
    id: "monza", name: "蒙扎", short: "MON", league: "ita", stadium: "布里安特奥",
    colors: ["#e30613", "#ffffff"],
    players: [
      { name: "图拉蒂", pos: ["GK"], nat: "意大利", rate: 81 },
      { name: "马里", pos: ["CB"], nat: "西班牙", rate: 81 },
      { name: "佩西纳", pos: ["CM", "CDM"], nat: "意大利", rate: 82 },
      { name: "基里亚科普洛斯", pos: ["LM", "LB"], nat: "希腊", rate: 81 },
      { name: "卡普拉里", pos: ["ST", "CAM"], nat: "意大利", rate: 81 },
      { name: "久里奇", pos: ["ST"], nat: "波黑", rate: 81 }
    ]
  },
  "parma": {
    id: "parma", name: "帕尔马", short: "PAR", league: "ita", stadium: "塔尔迪尼",
    colors: ["#f5c600", "#003d7c"],
    players: [
      { name: "铃木彩艳", pos: ["GK"], nat: "日本", rate: 82 },
      { name: "德尔普拉托", pos: ["CB"], nat: "意大利", rate: 81 },
      { name: "埃斯特维斯", pos: ["CM", "CDM"], nat: "巴西", rate: 80 },
      { name: "贝尔纳贝", pos: ["CAM", "CM"], nat: "西班牙", rate: 82 },
      { name: "米赫伊勒", pos: ["RW", "LW"], nat: "罗马尼亚", rate: 82 },
      { name: "邦尼", pos: ["ST"], nat: "科特迪瓦", rate: 82 }
    ]
  },
  "roma": {
    id: "roma", name: "罗马", short: "ROM", league: "ita", stadium: "奥林匹克",
    colors: ["#8e1f2f", "#f5c600"],
    players: [
      { name: "斯维拉尔", pos: ["GK"], nat: "塞尔维亚", rate: 85 },
      { name: "曼奇尼", pos: ["CB"], nat: "意大利", rate: 85 },
      { name: "克里斯坦特", pos: ["CM", "CDM"], nat: "意大利", rate: 84 },
      { name: "佩莱格里尼", pos: ["CAM", "CM"], nat: "意大利", rate: 86 },
      { name: "迪巴拉", pos: ["ST", "CAM"], nat: "阿根廷", rate: 88 },
      { name: "多夫比克", pos: ["ST"], nat: "乌克兰", rate: 85 }
    ]
  },
  "sassuolo": {
    id: "sassuolo", name: "萨索洛", short: "SAS", league: "ita", stadium: "马佩",
    colors: ["#006847", "#ffffff"],
    players: [
      { name: "孔西利", pos: ["GK"], nat: "意大利", rate: 83 },
      { name: "费拉里", pos: ["CB"], nat: "意大利", rate: 81 },
      { name: "博洛卡", pos: ["CM", "CDM"], nat: "罗马尼亚", rate: 81 },
      { name: "托斯特维特", pos: ["CAM", "CM"], nat: "挪威", rate: 82 },
      { name: "贝拉尔迪", pos: ["RW", "CAM"], nat: "意大利", rate: 86 },
      { name: "皮纳蒙蒂", pos: ["ST"], nat: "意大利", rate: 83 }
    ]
  },
  "torino": {
    id: "torino", name: "都灵", short: "TOR", league: "ita", stadium: "大都会",
    colors: ["#8e1f2f", "#ffffff"],
    players: [
      { name: "米林科维奇-萨维奇", pos: ["GK"], nat: "塞尔维亚", rate: 84 },
      { name: "布翁焦尔诺", pos: ["CB"], nat: "意大利", rate: 85 },
      { name: "里奇", pos: ["CM", "CDM"], nat: "意大利", rate: 84 },
      { name: "伊利奇", pos: ["CAM", "CM"], nat: "塞尔维亚", rate: 83 },
      { name: "萨纳布里亚", pos: ["ST"], nat: "巴拉圭", rate: 83 },
      { name: "卡拉莫", pos: ["RW", "ST"], nat: "科特迪瓦", rate: 82 }
    ]
  },
  "udinese": {
    id: "udinese", name: "乌迪内斯", short: "UDI", league: "ita", stadium: "达契亚竞技场",
    colors: ["#000000", "#ffffff"],
    players: [
      { name: "奥科耶", pos: ["GK"], nat: "尼日利亚", rate: 82 },
      { name: "比约尔", pos: ["CB"], nat: "斯洛文尼亚", rate: 82 },
      { name: "洛夫里奇", pos: ["CM", "CAM"], nat: "斯洛文尼亚", rate: 82 },
      { name: "埃克伦坎普", pos: ["RW", "LW"], nat: "瑞典", rate: 81 },
      { name: "图雷", pos: ["CAM", "ST"], nat: "马里", rate: 81 },
      { name: "卢卡", pos: ["ST"], nat: "克罗地亚", rate: 82 }
    ]
  },
  "venezia": {
    id: "venezia", name: "威尼斯", short: "VEN", league: "ita", stadium: "皮埃路易吉·彭佐",
    colors: ["#f3a800", "#000000"],
    players: [
      { name: "约罗宁", pos: ["GK"], nat: "芬兰", rate: 80 },
      { name: "斯沃博达", pos: ["CB"], nat: "捷克", rate: 80 },
      { name: "邓肯", pos: ["CM", "CDM"], nat: "美国", rate: 80 },
      { name: "埃勒特松", pos: ["CAM", "CM"], nat: "瑞典", rate: 80 },
      { name: "泽尔宾", pos: ["LW", "RW"], nat: "意大利", rate: 80 },
      { name: "波扬帕洛", pos: ["ST"], nat: "芬兰", rate: 81 }
    ]
  }
};

Object.assign(CLUBS, SERIE_A_CLUBS);
