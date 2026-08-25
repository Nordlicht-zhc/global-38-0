const BUNDESLIGA_CLUBS = {
  "augsburg": {
    id: "augsburg", name: "奥格斯堡", short: "FCA", league: "ger", stadium: "WWK竞技场",
    colors: ["#ba3733", "#ffffff"],
    players: [
      { name: "达门", pos: ["GK"], nat: "荷兰", rate: 82 },
      { name: "古维勒乌", pos: ["CB"], nat: "法国", rate: 82 },
      { name: "雷克斯贝卡伊", pos: ["CM", "CDM"], nat: "比利时", rate: 81 },
      { name: "詹森", pos: ["CAM", "CM"], nat: "美国", rate: 80 },
      { name: "蒂茨", pos: ["ST"], nat: "德国", rate: 82 },
      { name: "埃森德", pos: ["ST"], nat: "刚果民主共和国", rate: 81 }
    ]
  },
  "elversberg": {
    id: "elversberg", name: "埃尔弗斯贝格", short: "ELV", league: "ger", stadium: "乌尔斯拉姆",
    colors: ["#005ca9", "#ffffff"],
    players: [
      { name: "科尔克", pos: ["GK"], nat: "德国", rate: 77 },
      { name: "罗赫尔", pos: ["CB"], nat: "德国", rate: 77 },
      { name: "雅各布森", pos: ["CM", "CDM"], nat: "德国", rate: 77 },
      { name: "斯托伊洛夫", pos: ["CAM", "RW"], nat: "保加利亚", rate: 77 },
      { name: "施内尔巴赫", pos: ["LW", "RW"], nat: "德国", rate: 77 },
      { name: "阿斯拉尼", pos: ["ST"], nat: "阿尔巴尼亚", rate: 77 }
    ]
  },
  "frankfurt": {
    id: "frankfurt", name: "法兰克福", short: "SGE", league: "ger", stadium: "德意志银行公园",
    colors: ["#e1000f", "#000000"],
    players: [
      { name: "特拉普", pos: ["GK"], nat: "德国", rate: 85 },
      { name: "科赫", pos: ["CB"], nat: "德国", rate: 84 },
      { name: "拉尔森", pos: ["CM", "CDM"], nat: "挪威", rate: 83 },
      { name: "格策", pos: ["CAM", "CM"], nat: "德国", rate: 85 },
      { name: "马尔穆什", pos: ["ST", "LW"], nat: "埃及", rate: 88 },
      { name: "埃基蒂克", pos: ["ST"], nat: "法国", rate: 85 }
    ]
  },
  "freiburg": {
    id: "freiburg", name: "弗赖堡", short: "SCF", league: "ger", stadium: "欧洲公园",
    colors: ["#d71920", "#ffffff"],
    players: [
      { name: "阿图博卢", pos: ["GK"], nat: "瑞士", rate: 84 },
      { name: "金特尔", pos: ["CB"], nat: "德国", rate: 84 },
      { name: "埃格施泰因", pos: ["CM", "CDM"], nat: "德国", rate: 83 },
      { name: "格里福", pos: ["LW", "CAM"], nat: "意大利", rate: 84 },
      { name: "堂安律", pos: ["RW", "CAM"], nat: "日本", rate: 84 },
      { name: "霍勒", pos: ["ST"], nat: "德国", rate: 82 }
    ]
  },
  "gladbach": {
    id: "gladbach", name: "门兴格拉德巴赫", short: "BMG", league: "ger", stadium: "普鲁士公园",
    colors: ["#000000", "#1db954"],
    players: [
      { name: "尼科拉斯", pos: ["GK"], nat: "德国", rate: 84 },
      { name: "埃尔维迪", pos: ["CB"], nat: "瑞士", rate: 83 },
      { name: "魏格尔", pos: ["CDM", "CM"], nat: "德国", rate: 84 },
      { name: "赖茨", pos: ["CAM", "CM"], nat: "德国", rate: 84 },
      { name: "普莱亚", pos: ["ST", "CAM"], nat: "法国", rate: 84 },
      { name: "克莱因丁斯特", pos: ["ST"], nat: "德国", rate: 83 }
    ]
  },
  "hamburg": {
    id: "hamburg", name: "汉堡", short: "HSV", league: "ger", stadium: "人民公园",
    colors: ["#ffffff", "#0a3d91"],
    players: [
      { name: "拉布", pos: ["GK"], nat: "德国", rate: 82 },
      { name: "朔恩劳", pos: ["CB"], nat: "德国", rate: 82 },
      { name: "梅法姆", pos: ["CM", "CDM"], nat: "法国", rate: 81 },
      { name: "贝内斯", pos: ["CAM", "CM"], nat: "斯洛伐克", rate: 83 },
      { name: "格拉策尔", pos: ["ST"], nat: "德国", rate: 82 },
      { name: "多姆普", pos: ["ST", "RW"], nat: "德国", rate: 80 }
    ]
  },
  "hoffenheim": {
    id: "hoffenheim", name: "霍芬海姆", short: "TSG", league: "ger", stadium: "普里泽罗竞技场",
    colors: ["#1961b5", "#ffffff"],
    players: [
      { name: "鲍曼", pos: ["GK"], nat: "德国", rate: 83 },
      { name: "卡巴克", pos: ["CB"], nat: "土耳其", rate: 82 },
      { name: "比朔夫", pos: ["CM", "CAM"], nat: "德国", rate: 83 },
      { name: "斯塔赫", pos: ["CM", "CDM"], nat: "奥地利", rate: 83 },
      { name: "克拉马里奇", pos: ["ST", "CAM"], nat: "克罗地亚", rate: 85 },
      { name: "贝尔", pos: ["ST"], nat: "德国", rate: 83 }
    ]
  },
  "koln": {
    id: "koln", name: "科隆", short: "KOE", league: "ger", stadium: "莱茵能源",
    colors: ["#ed1c24", "#ffffff"],
    players: [
      { name: "施瓦博", pos: ["GK"], nat: "德国", rate: 82 },
      { name: "许伯斯", pos: ["CB"], nat: "德国", rate: 82 },
      { name: "马特尔", pos: ["CM", "CDM"], nat: "德国", rate: 82 },
      { name: "柳比西奇", pos: ["CAM", "CM"], nat: "奥地利", rate: 82 },
      { name: "迈纳", pos: ["LW", "RW"], nat: "德国", rate: 81 },
      { name: "蒂格斯", pos: ["ST"], nat: "德国", rate: 81 }
    ]
  },
  "mainz": {
    id: "mainz", name: "美因茨", short: "M05", league: "ger", stadium: "美因茨竞技场",
    colors: ["#c3141e", "#ffffff"],
    players: [
      { name: "岑特纳", pos: ["GK"], nat: "德国", rate: 83 },
      { name: "贝尔", pos: ["CB"], nat: "德国", rate: 83 },
      { name: "阿米里", pos: ["CM", "CAM"], nat: "德国", rate: 83 },
      { name: "洪仁", pos: ["CAM", "CM"], nat: "德国", rate: 82 },
      { name: "姆韦内", pos: ["LW", "RW"], nat: "赞比亚", rate: 82 },
      { name: "伯卡特", pos: ["ST"], nat: "德国", rate: 84 }
    ]
  },
  "paderborn": {
    id: "paderborn", name: "帕德博恩", short: "SCP", league: "ger", stadium: "本特勒竞技场",
    colors: ["#005ca9", "#ffffff"],
    players: [
      { name: "博埃文克", pos: ["GK"], nat: "德国", rate: 78 },
      { name: "穆勒", pos: ["CB"], nat: "德国", rate: 78 },
      { name: "克拉尔", pos: ["CM", "CDM"], nat: "捷克", rate: 78 },
      { name: "科斯蒂奇", pos: ["CAM", "RW"], nat: "塞尔维亚", rate: 78 },
      { name: "穆斯利", pos: ["LW", "ST"], nat: "德国", rate: 78 },
      { name: "格鲁伯", pos: ["ST"], nat: "德国", rate: 78 }
    ]
  },
  "rb-leipzig": {
    id: "rb-leipzig", name: "RB莱比锡", short: "RBL", league: "ger", stadium: "红牛竞技场",
    colors: ["#dd022c", "#ffffff"],
    players: [
      { name: "古拉奇", pos: ["GK"], nat: "匈牙利", rate: 85 },
      { name: "奥尔班", pos: ["CB"], nat: "匈牙利", rate: 85 },
      { name: "施拉格尔", pos: ["CM", "CDM"], nat: "奥地利", rate: 84 },
      { name: "西蒙斯", pos: ["CAM", "CM"], nat: "荷兰", rate: 87 },
      { name: "奥蓬达", pos: ["ST"], nat: "比利时", rate: 86 },
      { name: "塞斯科", pos: ["ST"], nat: "斯洛文尼亚", rate: 86 }
    ]
  },
  "schalke": {
    id: "schalke", name: "沙尔克04", short: "S04", league: "ger", stadium: "费尔廷斯",
    colors: ["#004d9d", "#ffffff"],
    players: [
      { name: "霍夫曼", pos: ["GK"], nat: "德国", rate: 80 },
      { name: "卡明斯基", pos: ["CB"], nat: "德国", rate: 80 },
      { name: "塞金", pos: ["CM", "CDM"], nat: "德国", rate: 80 },
      { name: "卡拉曼", pos: ["CAM", "ST"], nat: "德国", rate: 81 },
      { name: "穆尔金", pos: ["LW", "RW"], nat: "德国", rate: 79 },
      { name: "特罗伊", pos: ["ST"], nat: "德国", rate: 79 }
    ]
  },
  "stuttgart": {
    id: "stuttgart", name: "斯图加特", short: "VFB", league: "ger", stadium: "梅赛德斯-奔驰竞技场",
    colors: ["#ffffff", "#e30613"],
    players: [
      { name: "尼贝尔", pos: ["GK"], nat: "德国", rate: 85 },
      { name: "沙博", pos: ["CB"], nat: "法国", rate: 83 },
      { name: "施蒂勒", pos: ["CM", "CDM"], nat: "德国", rate: 85 },
      { name: "米约", pos: ["CAM", "CM"], nat: "法国", rate: 85 },
      { name: "勒韦林", pos: ["RW", "LW"], nat: "德国", rate: 82 },
      { name: "德米罗维奇", pos: ["ST"], nat: "波黑", rate: 86 }
    ]
  },
  "union-berlin": {
    id: "union-berlin", name: "柏林联合", short: "FCU", league: "ger", stadium: "老林务所",
    colors: ["#d50000", "#ffffff"],
    players: [
      { name: "伦诺", pos: ["GK"], nat: "德国", rate: 83 },
      { name: "多基", pos: ["CB"], nat: "法国", rate: 82 },
      { name: "舍费尔", pos: ["CM", "CDM"], nat: "德国", rate: 81 },
      { name: "霍勒巴赫", pos: ["CAM", "CM"], nat: "德国", rate: 81 },
      { name: "普拉特", pos: ["RW", "LW"], nat: "瑞士", rate: 81 },
      { name: "沃兰德", pos: ["ST"], nat: "德国", rate: 82 }
    ]
  },
  "werder-bremen": {
    id: "werder-bremen", name: "云达不莱梅", short: "SVW", league: "ger", stadium: "威悉",
    colors: ["#1d9053", "#ffffff"],
    players: [
      { name: "策特勒", pos: ["GK"], nat: "奥地利", rate: 83 },
      { name: "弗里德尔", pos: ["CB"], nat: "奥地利", rate: 82 },
      { name: "施塔格", pos: ["CM", "CDM"], nat: "德国", rate: 82 },
      { name: "阿古", pos: ["CAM", "CM"], nat: "德国", rate: 82 },
      { name: "恩金马", pos: ["RW", "LW"], nat: "德国", rate: 82 },
      { name: "杜克施", pos: ["ST"], nat: "德国", rate: 84 }
    ]
  }
};

Object.assign(CLUBS, BUNDESLIGA_CLUBS);
