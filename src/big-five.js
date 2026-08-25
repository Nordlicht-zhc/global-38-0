const BIG_FIVE_CLUBS = {
  "aston-villa": {
    id: "aston-villa", name: "阿斯顿维拉", short: "AVL", league: "eng", stadium: "维拉公园",
    colors: ["#670e36", "#95bfe5"],
    players: [
      { name: "埃米利亚诺·马丁内斯", pos: ["GK"], nat: "阿根廷", rate: 87 },
      { name: "孔萨", pos: ["CB", "RB"], nat: "英格兰", rate: 85 },
      { name: "蒂莱曼斯", pos: ["CM", "CDM"], nat: "比利时", rate: 86 },
      { name: "麦金", pos: ["CM", "LM"], nat: "苏格兰", rate: 85 },
      { name: "罗杰斯", pos: ["CAM", "LW"], nat: "英格兰", rate: 84 },
      { name: "沃特金斯", pos: ["ST"], nat: "英格兰", rate: 88 }
    ]
  },
  "bournemouth": {
    id: "bournemouth", name: "伯恩茅斯", short: "BOU", league: "eng", stadium: "活力球场",
    colors: ["#da291c", "#000000"],
    players: [
      { name: "凯帕", pos: ["GK"], nat: "西班牙", rate: 84 },
      { name: "扎巴尔尼", pos: ["CB"], nat: "乌克兰", rate: 85 },
      { name: "克里斯蒂", pos: ["CM", "CDM"], nat: "爱尔兰", rate: 83 },
      { name: "塔弗尼埃", pos: ["RM", "RW"], nat: "英格兰", rate: 82 },
      { name: "塞门约", pos: ["RW", "LW"], nat: "加纳", rate: 85 },
      { name: "埃瓦尼尔森", pos: ["ST"], nat: "巴西", rate: 84 }
    ]
  },
  "brentford": {
    id: "brentford", name: "布伦特福德", short: "BRE", league: "eng", stadium: "Gtech社区球场",
    colors: ["#e30613", "#ffffff"],
    players: [
      { name: "弗莱肯", pos: ["GK"], nat: "荷兰", rate: 84 },
      { name: "平诺克", pos: ["CB"], nat: "英格兰", rate: 84 },
      { name: "诺尔高", pos: ["CDM", "CM"], nat: "丹麦", rate: 84 },
      { name: "丹姆斯高", pos: ["CAM", "CM"], nat: "丹麦", rate: 84 },
      { name: "沙德", pos: ["RW", "ST"], nat: "德国", rate: 83 },
      { name: "维萨", pos: ["ST"], nat: "刚果民主共和国", rate: 85 }
    ]
  },
  "brighton": {
    id: "brighton", name: "布莱顿", short: "BHA", league: "eng", stadium: "美国运通球场",
    colors: ["#0057b8", "#ffffff"],
    players: [
      { name: "维尔布鲁根", pos: ["GK"], nat: "荷兰", rate: 85 },
      { name: "范赫克", pos: ["CB"], nat: "荷兰", rate: 85 },
      { name: "巴莱巴", pos: ["CM", "CDM"], nat: "喀麦隆", rate: 86 },
      { name: "明特", pos: ["RW", "LW"], nat: "冈比亚", rate: 84 },
      { name: "三笘薫", pos: ["LW"], nat: "日本", rate: 87 },
      { name: "佩德罗", pos: ["ST", "CAM"], nat: "巴西", rate: 86 }
    ]
  },
  "coventry": {
    id: "coventry", name: "考文垂", short: "COV", league: "eng", stadium: "理光球场",
    colors: ["#0f7f3f", "#ffffff"],
    players: [
      { name: "多文", pos: ["GK"], nat: "英格兰", rate: 78 },
      { name: "拉蒂博迪埃尔", pos: ["CB"], nat: "英格兰", rate: 79 },
      { name: "谢夫", pos: ["CM", "CAM"], nat: "英格兰", rate: 80 },
      { name: "鲁多尼", pos: ["RW", "CAM"], nat: "英格兰", rate: 79 },
      { name: "赖特", pos: ["ST"], nat: "苏格兰", rate: 80 },
      { name: "西姆斯", pos: ["ST"], nat: "英格兰", rate: 80 }
    ]
  },
  "crystal-palace": {
    id: "crystal-palace", name: "水晶宫", short: "CRY", league: "eng", stadium: "塞尔赫斯特公园",
    colors: ["#1b458f", "#c4122e"],
    players: [
      { name: "亨德森", pos: ["GK"], nat: "英格兰", rate: 84 },
      { name: "格伊", pos: ["CB", "CDM"], nat: "英格兰", rate: 86 },
      { name: "穆尼奥斯", pos: ["RB"], nat: "哥伦比亚", rate: 84 },
      { name: "休斯", pos: ["CM", "CDM"], nat: "英格兰", rate: 83 },
      { name: "埃泽", pos: ["CAM", "LW"], nat: "英格兰", rate: 87 },
      { name: "马特塔", pos: ["ST"], nat: "法国", rate: 84 }
    ]
  },
  "everton": {
    id: "everton", name: "埃弗顿", short: "EVE", league: "eng", stadium: "埃弗顿体育场",
    colors: ["#003399", "#ffffff"],
    players: [
      { name: "皮克福德", pos: ["GK"], nat: "英格兰", rate: 86 },
      { name: "塔科夫斯基", pos: ["CB"], nat: "英格兰", rate: 84 },
      { name: "布兰斯韦特", pos: ["CB"], nat: "英格兰", rate: 84 },
      { name: "加纳", pos: ["CDM", "CM"], nat: "英格兰", rate: 83 },
      { name: "麦克尼尔", pos: ["LW", "RM"], nat: "英格兰", rate: 83 },
      { name: "恩迪亚耶", pos: ["ST", "RW"], nat: "塞内加尔", rate: 84 }
    ]
  },
  "fulham": {
    id: "fulham", name: "富勒姆", short: "FUL", league: "eng", stadium: "克拉文农场",
    colors: ["#000000", "#ffffff"],
    players: [
      { name: "莱诺", pos: ["GK"], nat: "德国", rate: 85 },
      { name: "罗宾逊", pos: ["LB"], nat: "美国", rate: 85 },
      { name: "安德森", pos: ["CB"], nat: "丹麦", rate: 84 },
      { name: "佩雷拉", pos: ["CAM", "CM"], nat: "巴西", rate: 84 },
      { name: "伊沃比", pos: ["RW", "CAM"], nat: "尼日利亚", rate: 84 },
      { name: "希门尼斯", pos: ["ST"], nat: "墨西哥", rate: 84 }
    ]
  },
  "hull": {
    id: "hull", name: "赫尔城", short: "HUL", league: "eng", stadium: "MKM球场",
    colors: ["#f39c12", "#000000"],
    players: [
      { name: "潘杜尔", pos: ["GK"], nat: "罗马尼亚", rate: 79 },
      { name: "琼斯", pos: ["CB"], nat: "英格兰", rate: 79 },
      { name: "斯莱特", pos: ["CM", "CDM"], nat: "英格兰", rate: 80 },
      { name: "卡勒姆·埃尔德", pos: ["CAM", "CM"], nat: "英格兰", rate: 79 },
      { name: "菲洛根", pos: ["RW", "LW"], nat: "英格兰", rate: 80 },
      { name: "麦克伯尼", pos: ["ST"], nat: "苏格兰", rate: 80 }
    ]
  },
  "ipswich": {
    id: "ipswich", name: "伊普斯维奇", short: "IPS", league: "eng", stadium: "波特曼路",
    colors: ["#0033a0", "#ffffff"],
    players: [
      { name: "穆里奇", pos: ["GK"], nat: "科索沃", rate: 82 },
      { name: "格里夫斯", pos: ["CB"], nat: "英格兰", rate: 81 },
      { name: "卢昂戈", pos: ["CDM", "CM"], nat: "澳大利亚", rate: 81 },
      { name: "莫尔斯", pos: ["CAM", "CM"], nat: "英格兰", rate: 81 },
      { name: "克拉克", pos: ["LW", "RW"], nat: "爱尔兰", rate: 81 },
      { name: "德拉普", pos: ["ST"], nat: "英格兰", rate: 83 }
    ]
  },
  "leeds": {
    id: "leeds", name: "利兹联", short: "LEE", league: "eng", stadium: "埃兰路",
    colors: ["#ffffff", "#1d4289"],
    players: [
      { name: "梅利耶", pos: ["GK"], nat: "法国", rate: 83 },
      { name: "斯特鲁伊克", pos: ["CB"], nat: "荷兰", rate: 83 },
      { name: "阿姆帕杜", pos: ["CDM", "CB"], nat: "威尔士", rate: 84 },
      { name: "格农托", pos: ["RW", "CAM"], nat: "意大利", rate: 83 },
      { name: "所罗门", pos: ["LW", "RW"], nat: "以色列", rate: 83 },
      { name: "皮罗埃", pos: ["ST"], nat: "英格兰", rate: 84 }
    ]
  },
  "newcastle": {
    id: "newcastle", name: "纽卡斯尔联", short: "NEW", league: "eng", stadium: "圣詹姆斯公园",
    colors: ["#241f20", "#ffffff"],
    players: [
      { name: "波普", pos: ["GK"], nat: "英格兰", rate: 85 },
      { name: "博特曼", pos: ["CB"], nat: "荷兰", rate: 87 },
      { name: "吉马良斯", pos: ["CM", "CDM"], nat: "巴西", rate: 88 },
      { name: "托纳利", pos: ["CM", "CDM"], nat: "意大利", rate: 87 },
      { name: "伊萨克", pos: ["ST"], nat: "瑞典", rate: 90 },
      { name: "戈登", pos: ["LW", "RW"], nat: "英格兰", rate: 86 }
    ]
  },
  "nottingham-forest": {
    id: "nottingham-forest", name: "诺丁汉森林", short: "NFO", league: "eng", stadium: "城市球场",
    colors: ["#dd0000", "#ffffff"],
    players: [
      { name: "泽尔斯", pos: ["GK"], nat: "比利时", rate: 85 },
      { name: "穆里略", pos: ["CB"], nat: "巴西", rate: 85 },
      { name: "达尼洛", pos: ["CM", "CDM"], nat: "巴西", rate: 84 },
      { name: "埃兰加", pos: ["RW", "LW"], nat: "瑞典", rate: 85 },
      { name: "吉布斯-怀特", pos: ["CAM"], nat: "英格兰", rate: 86 },
      { name: "克里斯·伍德", pos: ["ST"], nat: "新西兰", rate: 84 }
    ]
  },
  "sunderland": {
    id: "sunderland", name: "桑德兰", short: "SUN", league: "eng", stadium: "光明球场",
    colors: ["#eb172b", "#ffffff"],
    players: [
      { name: "帕特森", pos: ["GK"], nat: "英格兰", rate: 81 },
      { name: "奥布莱恩", pos: ["CB"], nat: "爱尔兰", rate: 81 },
      { name: "贝尔", pos: ["CM", "CAM"], nat: "英格兰", rate: 81 },
      { name: "克拉克", pos: ["LW", "RW"], nat: "英格兰", rate: 82 },
      { name: "塞门约", pos: ["RW", "ST"], nat: "英格兰", rate: 81 },
      { name: "伊西多", pos: ["ST"], nat: "英格兰", rate: 80 }
    ]
  },

  "alaves": {
    id: "alaves", name: "阿拉维斯", short: "ALA", league: "esp", stadium: "门迪索罗萨",
    colors: ["#005daa", "#ffffff"],
    players: [
      { name: "西维拉", pos: ["GK"], nat: "西班牙", rate: 80 },
      { name: "阿布卡尔", pos: ["CB"], nat: "摩洛哥", rate: 81 },
      { name: "布兰科", pos: ["CM", "CDM"], nat: "西班牙", rate: 81 },
      { name: "文塞多尔", pos: ["CAM", "RW"], nat: "西班牙", rate: 80 },
      { name: "雷巴赫", pos: ["LW", "ST"], nat: "法国", rate: 80 },
      { name: "基克", pos: ["ST"], nat: "西班牙", rate: 81 }
    ]
  },
  "athletic-bilbao": {
    id: "athletic-bilbao", name: "毕尔巴鄂竞技", short: "ATH", league: "esp", stadium: "圣马梅斯",
    colors: ["#ee2523", "#000000"],
    players: [
      { name: "西蒙", pos: ["GK"], nat: "西班牙", rate: 87 },
      { name: "维维安", pos: ["CB"], nat: "西班牙", rate: 85 },
      { name: "德马科斯", pos: ["RB", "RM"], nat: "西班牙", rate: 84 },
      { name: "桑塞特", pos: ["CAM"], nat: "西班牙", rate: 86 },
      { name: "尼科·威廉姆斯", pos: ["LW", "RW"], nat: "西班牙", rate: 87 },
      { name: "伊纳基·威廉姆斯", pos: ["ST", "RW"], nat: "加纳", rate: 85 }
    ]
  },
  "celta": {
    id: "celta", name: "塞尔塔", short: "CEL", league: "esp", stadium: "巴莱多斯",
    colors: ["#8fcae7", "#ffffff"],
    players: [
      { name: "瓜伊塔", pos: ["GK"], nat: "西班牙", rate: 82 },
      { name: "斯塔费尔特", pos: ["CB"], nat: "瑞典", rate: 82 },
      { name: "贝尔特兰", pos: ["CDM", "CM"], nat: "西班牙", rate: 83 },
      { name: "阿斯帕斯", pos: ["ST", "CAM"], nat: "西班牙", rate: 86 },
      { name: "阿尔巴", pos: ["LW", "RW"], nat: "西班牙", rate: 83 },
      { name: "斯韦德贝里", pos: ["ST", "LW"], nat: "瑞典", rate: 82 }
    ]
  },
  "deportivo": {
    id: "deportivo", name: "拉科鲁尼亚", short: "DEP", league: "esp", stadium: "里亚索",
    colors: ["#0072ce", "#ffffff"],
    players: [
      { name: "莱特", pos: ["GK"], nat: "西班牙", rate: 79 },
      { name: "巴里奥", pos: ["CB"], nat: "西班牙", rate: 79 },
      { name: "穆希卡", pos: ["CM", "CDM"], nat: "西班牙", rate: 80 },
      { name: "卢卡斯", pos: ["CAM", "RW"], nat: "西班牙", rate: 80 },
      { name: "梅拉", pos: ["LW", "ST"], nat: "西班牙", rate: 79 },
      { name: "马尔蒂", pos: ["ST"], nat: "西班牙", rate: 80 }
    ]
  },
  "elche": {
    id: "elche", name: "埃尔切", short: "ELC", league: "esp", stadium: "曼努埃尔·马丁内斯",
    colors: ["#00843d", "#ffffff"],
    players: [
      { name: "迪图罗", pos: ["GK"], nat: "阿根廷", rate: 80 },
      { name: "比加斯", pos: ["CB"], nat: "西班牙", rate: 80 },
      { name: "古蒂", pos: ["CM", "CDM"], nat: "西班牙", rate: 81 },
      { name: "费尔南德斯", pos: ["CAM", "CM"], nat: "阿根廷", rate: 81 },
      { name: "尼科", pos: ["RW", "LW"], nat: "西班牙", rate: 80 },
      { name: "博耶", pos: ["ST"], nat: "阿根廷", rate: 81 }
    ]
  },
  "espanyol": {
    id: "espanyol", name: "西班牙人", short: "ESP", league: "esp", stadium: "科尔内亚",
    colors: ["#007fc8", "#ffffff"],
    players: [
      { name: "帕切科", pos: ["GK"], nat: "西班牙", rate: 81 },
      { name: "卡夫雷拉", pos: ["CB"], nat: "乌拉圭", rate: 81 },
      { name: "波洛", pos: ["CM", "CDM"], nat: "西班牙", rate: 81 },
      { name: "普阿多", pos: ["CAM", "ST"], nat: "西班牙", rate: 82 },
      { name: "卡雷拉斯", pos: ["LW", "RW"], nat: "西班牙", rate: 81 },
      { name: "罗德里格斯", pos: ["ST"], nat: "西班牙", rate: 81 }
    ]
  },
  "getafe": {
    id: "getafe", name: "赫塔费", short: "GET", league: "esp", stadium: "阿方索·佩雷斯",
    colors: ["#005999", "#ffffff"],
    players: [
      { name: "索里亚", pos: ["GK"], nat: "西班牙", rate: 82 },
      { name: "阿尔德雷特", pos: ["CB"], nat: "巴拉圭", rate: 82 },
      { name: "米利亚", pos: ["CM", "CDM"], nat: "西班牙", rate: 81 },
      { name: "阿兰巴里", pos: ["CDM", "CM"], nat: "乌拉圭", rate: 81 },
      { name: "格林伍德", pos: ["RW", "CAM"], nat: "英格兰", rate: 84 },
      { name: "马约拉尔", pos: ["ST"], nat: "西班牙", rate: 83 }
    ]
  },
  "levante": {
    id: "levante", name: "莱万特", short: "LEV", league: "esp", stadium: "瓦伦西亚城",
    colors: ["#9a1915", "#ffffff"],
    players: [
      { name: "费尔南德斯", pos: ["GK"], nat: "西班牙", rate: 80 },
      { name: "卡瓦略", pos: ["CB"], nat: "葡萄牙", rate: 80 },
      { name: "马丁内斯", pos: ["CM", "CAM"], nat: "西班牙", rate: 80 },
      { name: "帕布罗·马丁内斯", pos: ["CAM", "RW"], nat: "西班牙", rate: 80 },
      { name: "布罗松", pos: ["LW", "ST"], nat: "阿根廷", rate: 80 },
      { name: "罗梅罗", pos: ["ST"], nat: "西班牙", rate: 81 }
    ]
  },
  "malaga": {
    id: "malaga", name: "马拉加", short: "MGA", league: "esp", stadium: "玫瑰园",
    colors: ["#0095da", "#ffffff"],
    players: [
      { name: "索里亚", pos: ["GK"], nat: "西班牙", rate: 80 },
      { name: "埃斯库德罗", pos: ["CB"], nat: "西班牙", rate: 80 },
      { name: "路易斯米", pos: ["CM", "CDM"], nat: "西班牙", rate: 80 },
      { name: "加伊坦", pos: ["CAM", "RW"], nat: "西班牙", rate: 79 },
      { name: "安特莱", pos: ["LW", "RW"], nat: "西班牙", rate: 80 },
      { name: "巴斯蒂达", pos: ["ST"], nat: "西班牙", rate: 80 }
    ]
  },
  "osasuna": {
    id: "osasuna", name: "奥萨苏纳", short: "OSA", league: "esp", stadium: "埃尔萨达尔",
    colors: ["#d91a21", "#ffffff"],
    players: [
      { name: "埃雷拉", pos: ["GK"], nat: "西班牙", rate: 82 },
      { name: "博约莫", pos: ["CB"], nat: "西班牙", rate: 81 },
      { name: "托罗", pos: ["CDM", "CM"], nat: "西班牙", rate: 82 },
      { name: "奥罗斯", pos: ["CAM", "CM"], nat: "西班牙", rate: 83 },
      { name: "萨拉戈萨", pos: ["LW", "RW"], nat: "西班牙", rate: 82 },
      { name: "布迪米尔", pos: ["ST"], nat: "克罗地亚", rate: 84 }
    ]
  },
  "racing-santander": {
    id: "racing-santander", name: "桑坦德竞技", short: "RAC", league: "esp", stadium: "埃尔萨迪内罗",
    colors: ["#00843d", "#ffffff"],
    players: [
      { name: "埃雷拉", pos: ["GK"], nat: "西班牙", rate: 79 },
      { name: "阿尔贝托", pos: ["CB"], nat: "西班牙", rate: 79 },
      { name: "桑加利", pos: ["CM", "CDM"], nat: "阿根廷", rate: 80 },
      { name: "阿兰达", pos: ["CAM", "CM"], nat: "西班牙", rate: 80 },
      { name: "卡斯特罗", pos: ["LW", "RW"], nat: "西班牙", rate: 80 },
      { name: "佩克斯", pos: ["ST"], nat: "西班牙", rate: 79 }
    ]
  },
  "rayovallecano": {
    id: "rayovallecano", name: "巴列卡诺", short: "RAY", league: "esp", stadium: "巴列卡斯",
    colors: ["#e6192e", "#ffffff"],
    players: [
      { name: "迪米特里耶夫斯基", pos: ["GK"], nat: "北马其顿", rate: 82 },
      { name: "莱热纳", pos: ["CB"], nat: "法国", rate: 82 },
      { name: "瓦伦丁", pos: ["CDM", "CM"], nat: "阿根廷", rate: 82 },
      { name: "帕拉松", pos: ["CAM", "RW"], nat: "西班牙", rate: 83 },
      { name: "德弗鲁托斯", pos: ["RW", "LW"], nat: "西班牙", rate: 82 },
      { name: "恩特卡", pos: ["ST"], nat: "西班牙", rate: 81 }
    ]
  },
  "real-betis": {
    id: "real-betis", name: "皇家贝蒂斯", short: "BET", league: "esp", stadium: "贝尼托·比利亚马林",
    colors: ["#00954c", "#ffffff"],
    players: [
      { name: "鲁伊·席尔瓦", pos: ["GK"], nat: "葡萄牙", rate: 83 },
      { name: "巴尔特拉", pos: ["CB"], nat: "西班牙", rate: 82 },
      { name: "福尔纳尔斯", pos: ["CAM", "CM"], nat: "西班牙", rate: 85 },
      { name: "洛塞尔索", pos: ["CM", "CAM"], nat: "阿根廷", rate: 85 },
      { name: "阿约塞·佩雷斯", pos: ["ST", "RW"], nat: "西班牙", rate: 84 },
      { name: "伊斯科", pos: ["CAM"], nat: "西班牙", rate: 86 }
    ]
  },
  "real-sociedad": {
    id: "real-sociedad", name: "皇家社会", short: "RSO", league: "esp", stadium: "阿诺埃塔",
    colors: ["#0067b1", "#ffffff"],
    players: [
      { name: "雷米罗", pos: ["GK"], nat: "西班牙", rate: 85 },
      { name: "苏韦尔迪亚", pos: ["CB"], nat: "西班牙", rate: 84 },
      { name: "苏比门迪", pos: ["CDM", "CM"], nat: "西班牙", rate: 86 },
      { name: "久保建英", pos: ["RW", "CAM"], nat: "日本", rate: 86 },
      { name: "巴雷内切亚", pos: ["LW", "RW"], nat: "西班牙", rate: 83 },
      { name: "奥亚萨瓦尔", pos: ["LW", "ST"], nat: "西班牙", rate: 87 }
    ]
  },
  "valencia": {
    id: "valencia", name: "瓦伦西亚", short: "VAL", league: "esp", stadium: "梅斯塔利亚",
    colors: ["#ee3524", "#ffffff"],
    players: [
      { name: "马马达什维利", pos: ["GK"], nat: "格鲁吉亚", rate: 87 },
      { name: "莫斯克拉", pos: ["CB"], nat: "哥伦比亚", rate: 83 },
      { name: "佩佩卢", pos: ["CDM", "CM"], nat: "西班牙", rate: 84 },
      { name: "迭戈·洛佩斯", pos: ["RW", "CAM"], nat: "西班牙", rate: 83 },
      { name: "里亚德", pos: ["CB"], nat: "西班牙", rate: 82 },
      { name: "杜罗", pos: ["ST"], nat: "西班牙", rate: 83 }
    ]
  },
  "villarreal": {
    id: "villarreal", name: "比利亚雷亚尔", short: "VIL", league: "esp", stadium: "陶瓷球场",
    colors: ["#ffe500", "#005aa0"],
    players: [
      { name: "儒尼奥尔", pos: ["GK"], nat: "西班牙", rate: 83 },
      { name: "阿尔比奥尔", pos: ["CB"], nat: "西班牙", rate: 84 },
      { name: "帕雷霍", pos: ["CM", "CDM"], nat: "西班牙", rate: 85 },
      { name: "巴埃纳", pos: ["CAM", "CM"], nat: "西班牙", rate: 85 },
      { name: "皮诺", pos: ["RW", "LW"], nat: "西班牙", rate: 84 },
      { name: "赫拉德·莫雷诺", pos: ["ST"], nat: "西班牙", rate: 86 }
    ]
  }
};

Object.assign(CLUBS, BIG_FIVE_CLUBS);
