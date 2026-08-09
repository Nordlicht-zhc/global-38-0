const LEAGUES = [
  { id: "eng", name: "英超", country: "英格兰", code: "ENG", color: "#2563eb", accent: "#f59e0b" },
  { id: "esp", name: "西甲", country: "西班牙", code: "ESP", color: "#dc2626", accent: "#facc15" },
  { id: "ita", name: "意甲", country: "意大利", code: "ITA", color: "#15803d", accent: "#ffffff" },
  { id: "ger", name: "德甲", country: "德国", code: "GER", color: "#f59e0b", accent: "#111827" },
  { id: "fra", name: "法甲", country: "法国", code: "FRA", color: "#0f766e", accent: "#ffffff" },
  { id: "por", name: "葡超", country: "葡萄牙", code: "POR", color: "#b91c1c", accent: "#16a34a" },
  { id: "ned", name: "荷甲", country: "荷兰", code: "NED", color: "#ea580c", accent: "#ffffff" },
  { id: "bra", name: "巴甲", country: "巴西", code: "BRA", color: "#65a30d", accent: "#fde047" },
  { id: "arg", name: "阿甲", country: "阿根廷", code: "ARG", color: "#0891b2", accent: "#f8fafc" },
  { id: "usa", name: "美职联", country: "美国", code: "USA", color: "#7c3aed", accent: "#f43f5e" },
  { id: "jpn", name: "日职", country: "日本", code: "JPN", color: "#e11d48", accent: "#f5f5f4" },
  { id: "ksa", name: "沙特联", country: "沙特", code: "KSA", color: "#166534", accent: "#fbbf24" }
];

const CLUBS = {
  "man-city": {
    id: "man-city", name: "曼城", short: "MCI", league: "eng", stadium: "伊蒂哈德球场",
    colors: ["#6cabdd", "#1c2c5b"],
    players: [
      { name: "埃德森", pos: ["GK"], nat: "巴西", rate: 87 },
      { name: "凯尔·沃克", pos: ["RB"], nat: "英格兰", rate: 84 },
      { name: "鲁本·迪亚斯", pos: ["CB"], nat: "葡萄牙", rate: 87 },
      { name: "罗德里", pos: ["CDM", "CM"], nat: "西班牙", rate: 91 },
      { name: "德布劳内", pos: ["CAM", "CM"], nat: "比利时", rate: 91 },
      { name: "福登", pos: ["CAM", "RW"], nat: "英格兰", rate: 87 },
      { name: "贝尔纳多·席尔瓦", pos: ["RW", "CM"], nat: "葡萄牙", rate: 88 },
      { name: "哈兰德", pos: ["ST"], nat: "挪威", rate: 93 },
      { name: "阿圭罗", pos: ["ST"], nat: "阿根廷", rate: 90 }
    ]
  },
  "liverpool": {
    id: "liverpool", name: "利物浦", short: "LIV", league: "eng", stadium: "安菲尔德",
    colors: ["#c8102e", "#00b2a9"],
    players: [
      { name: "阿利松", pos: ["GK"], nat: "巴西", rate: 89 },
      { name: "阿诺德", pos: ["RB"], nat: "英格兰", rate: 86 },
      { name: "范戴克", pos: ["CB"], nat: "荷兰", rate: 91 },
      { name: "罗伯逊", pos: ["LB"], nat: "苏格兰", rate: 85 },
      { name: "杰拉德", pos: ["CM", "CAM"], nat: "英格兰", rate: 90 },
      { name: "法比尼奥", pos: ["CDM", "CM"], nat: "巴西", rate: 86 },
      { name: "萨拉赫", pos: ["RW"], nat: "埃及", rate: 91 },
      { name: "马内", pos: ["LW"], nat: "塞内加尔", rate: 88 },
      { name: "苏亚雷斯", pos: ["ST"], nat: "乌拉圭", rate: 90 }
    ]
  },
  "arsenal": {
    id: "arsenal", name: "阿森纳", short: "ARS", league: "eng", stadium: "酋长球场",
    colors: ["#ef0107", "#ffffff"],
    players: [
      { name: "希曼", pos: ["GK"], nat: "英格兰", rate: 86 },
      { name: "亚当斯", pos: ["CB"], nat: "英格兰", rate: 88 },
      { name: "阿什利·科尔", pos: ["LB"], nat: "英格兰", rate: 87 },
      { name: "维埃拉", pos: ["CDM", "CM"], nat: "法国", rate: 90 },
      { name: "法布雷加斯", pos: ["CM", "CAM"], nat: "西班牙", rate: 89 },
      { name: "博格坎普", pos: ["CAM", "ST"], nat: "荷兰", rate: 90 },
      { name: "亨利", pos: ["ST"], nat: "法国", rate: 93 },
      { name: "萨卡", pos: ["RW", "LW"], nat: "英格兰", rate: 87 },
      { name: "厄德高", pos: ["CAM"], nat: "挪威", rate: 86 }
    ]
  },
  "chelsea": {
    id: "chelsea", name: "切尔西", short: "CHE", league: "eng", stadium: "斯坦福桥",
    colors: ["#034694", "#ffffff"],
    players: [
      { name: "切赫", pos: ["GK"], nat: "捷克", rate: 89 },
      { name: "特里", pos: ["CB"], nat: "英格兰", rate: 90 },
      { name: "伊万诺维奇", pos: ["RB", "CB"], nat: "塞尔维亚", rate: 85 },
      { name: "马克莱莱", pos: ["CDM"], nat: "法国", rate: 89 },
      { name: "兰帕德", pos: ["CM", "CAM"], nat: "英格兰", rate: 90 },
      { name: "阿扎尔", pos: ["LW", "CAM"], nat: "比利时", rate: 91 },
      { name: "德罗巴", pos: ["ST"], nat: "科特迪瓦", rate: 90 },
      { name: "帕尔默", pos: ["CAM", "RW"], nat: "英格兰", rate: 88 }
    ]
  },
  "man-united": {
    id: "man-united", name: "曼联", short: "MUN", league: "eng", stadium: "老特拉福德",
    colors: ["#da291c", "#fbe122"],
    players: [
      { name: "舒梅切尔", pos: ["GK"], nat: "丹麦", rate: 90 },
      { name: "费迪南德", pos: ["CB"], nat: "英格兰", rate: 89 },
      { name: "埃弗拉", pos: ["LB"], nat: "法国", rate: 87 },
      { name: "罗伊·基恩", pos: ["CDM", "CM"], nat: "爱尔兰", rate: 89 },
      { name: "斯科尔斯", pos: ["CM", "CAM"], nat: "英格兰", rate: 90 },
      { name: "贝克汉姆", pos: ["RM", "RW"], nat: "英格兰", rate: 89 },
      { name: "鲁尼", pos: ["ST", "CAM"], nat: "英格兰", rate: 90 },
      { name: "C.罗纳尔多", pos: ["LW", "RW", "ST"], nat: "葡萄牙", rate: 93 }
    ]
  },
  "tottenham": {
    id: "tottenham", name: "热刺", short: "TOT", league: "eng", stadium: "新白鹿巷",
    colors: ["#132257", "#ffffff"],
    players: [
      { name: "洛里", pos: ["GK"], nat: "法国", rate: 86 },
      { name: "莱德利·金", pos: ["CB"], nat: "英格兰", rate: 87 },
      { name: "丹尼·罗斯", pos: ["LB"], nat: "英格兰", rate: 83 },
      { name: "莫德里奇", pos: ["CM", "CAM"], nat: "克罗地亚", rate: 91 },
      { name: "登贝莱", pos: ["CM"], nat: "比利时", rate: 85 },
      { name: "贝尔", pos: ["RW", "LW"], nat: "威尔士", rate: 89 },
      { name: "凯恩", pos: ["ST"], nat: "英格兰", rate: 91 },
      { name: "孙兴慜", pos: ["LW", "ST"], nat: "韩国", rate: 89 }
    ]
  },

  "real-madrid": {
    id: "real-madrid", name: "皇家马德里", short: "RMA", league: "esp", stadium: "伯纳乌",
    colors: ["#febe10", "#ffffff"],
    players: [
      { name: "卡西利亚斯", pos: ["GK"], nat: "西班牙", rate: 91 },
      { name: "拉莫斯", pos: ["CB"], nat: "西班牙", rate: 90 },
      { name: "罗伯特·卡洛斯", pos: ["LB"], nat: "巴西", rate: 90 },
      { name: "莫德里奇", pos: ["CM", "CAM"], nat: "克罗地亚", rate: 91 },
      { name: "齐达内", pos: ["CAM"], nat: "法国", rate: 93 },
      { name: "克罗斯", pos: ["CM", "CDM"], nat: "德国", rate: 89 },
      { name: "C.罗纳尔多", pos: ["LW", "ST"], nat: "葡萄牙", rate: 94 },
      { name: "本泽马", pos: ["ST"], nat: "法国", rate: 91 },
      { name: "维尼修斯", pos: ["LW", "RW"], nat: "巴西", rate: 90 }
    ]
  },
  "barcelona": {
    id: "barcelona", name: "巴塞罗那", short: "BAR", league: "esp", stadium: "诺坎普",
    colors: ["#a50044", "#004d98"],
    players: [
      { name: "巴尔德斯", pos: ["GK"], nat: "西班牙", rate: 86 },
      { name: "普约尔", pos: ["CB"], nat: "西班牙", rate: 90 },
      { name: "阿尔维斯", pos: ["RB"], nat: "巴西", rate: 89 },
      { name: "哈维", pos: ["CM", "CDM"], nat: "西班牙", rate: 92 },
      { name: "伊涅斯塔", pos: ["CM", "CAM"], nat: "西班牙", rate: 92 },
      { name: "罗纳尔迪尼奥", pos: ["LW", "CAM"], nat: "巴西", rate: 93 },
      { name: "梅西", pos: ["RW", "CAM", "ST"], nat: "阿根廷", rate: 95 },
      { name: "苏亚雷斯", pos: ["ST"], nat: "乌拉圭", rate: 91 },
      { name: "内马尔", pos: ["LW", "RW"], nat: "巴西", rate: 92 }
    ]
  },
  "atletico": {
    id: "atletico", name: "马德里竞技", short: "ATM", league: "esp", stadium: "大都会球场",
    colors: ["#cb3524", "#ffffff"],
    players: [
      { name: "奥布拉克", pos: ["GK"], nat: "斯洛文尼亚", rate: 90 },
      { name: "戈丁", pos: ["CB"], nat: "乌拉圭", rate: 88 },
      { name: "费利佩·路易斯", pos: ["LB"], nat: "巴西", rate: 86 },
      { name: "科克", pos: ["CM", "CAM"], nat: "西班牙", rate: 86 },
      { name: "加比", pos: ["CDM", "CM"], nat: "西班牙", rate: 85 },
      { name: "格列兹曼", pos: ["ST", "CAM"], nat: "法国", rate: 90 },
      { name: "托雷斯", pos: ["ST"], nat: "西班牙", rate: 88 },
      { name: "萨乌尔", pos: ["CM", "LM"], nat: "西班牙", rate: 85 }
    ]
  },
  "sevilla": {
    id: "sevilla", name: "塞维利亚", short: "SEV", league: "esp", stadium: "皮斯胡安",
    colors: ["#d71920", "#ffffff"],
    players: [
      { name: "帕洛普", pos: ["GK"], nat: "西班牙", rate: 85 },
      { name: "拉莫斯", pos: ["CB", "RB"], nat: "西班牙", rate: 90 },
      { name: "拉基蒂奇", pos: ["CM", "CAM"], nat: "克罗地亚", rate: 87 },
      { name: "赫苏斯·纳瓦斯", pos: ["RW", "RB"], nat: "西班牙", rate: 85 },
      { name: "卡努特", pos: ["ST"], nat: "马里", rate: 86 },
      { name: "路易斯·法比亚诺", pos: ["ST"], nat: "巴西", rate: 87 },
      { name: "奥坎波斯", pos: ["LW", "RW"], nat: "阿根廷", rate: 84 },
      { name: "古德利", pos: ["CDM", "CM"], nat: "塞尔维亚", rate: 82 }
    ]
  },

  "juventus": {
    id: "juventus", name: "尤文图斯", short: "JUV", league: "ita", stadium: "安联竞技场",
    colors: ["#000000", "#ffffff"],
    players: [
      { name: "布冯", pos: ["GK"], nat: "意大利", rate: 92 },
      { name: "基耶利尼", pos: ["CB"], nat: "意大利", rate: 89 },
      { name: "博努奇", pos: ["CB"], nat: "意大利", rate: 88 },
      { name: "皮尔洛", pos: ["CDM", "CM"], nat: "意大利", rate: 92 },
      { name: "博格巴", pos: ["CM", "CAM"], nat: "法国", rate: 88 },
      { name: "皮耶罗", pos: ["ST", "CAM"], nat: "意大利", rate: 91 },
      { name: "特雷泽盖", pos: ["ST"], nat: "法国", rate: 88 },
      { name: "C.罗纳尔多", pos: ["LW", "ST"], nat: "葡萄牙", rate: 93 }
    ]
  },
  "ac-milan": {
    id: "ac-milan", name: "AC米兰", short: "MIL", league: "ita", stadium: "圣西罗",
    colors: ["#fb090b", "#000000"],
    players: [
      { name: "迪达", pos: ["GK"], nat: "巴西", rate: 88 },
      { name: "马尔蒂尼", pos: ["CB", "LB"], nat: "意大利", rate: 93 },
      { name: "内斯塔", pos: ["CB"], nat: "意大利", rate: 91 },
      { name: "皮尔洛", pos: ["CDM", "CM"], nat: "意大利", rate: 92 },
      { name: "西多夫", pos: ["CM", "CAM"], nat: "荷兰", rate: 89 },
      { name: "卡卡", pos: ["CAM"], nat: "巴西", rate: 92 },
      { name: "舍甫琴科", pos: ["ST"], nat: "乌克兰", rate: 91 },
      { name: "伊布拉希莫维奇", pos: ["ST"], nat: "瑞典", rate: 90 }
    ]
  },
  "inter": {
    id: "inter", name: "国际米兰", short: "INT", league: "ita", stadium: "梅阿查",
    colors: ["#0068a8", "#000000"],
    players: [
      { name: "朱利奥·塞萨尔", pos: ["GK"], nat: "巴西", rate: 88 },
      { name: "萨内蒂", pos: ["RB", "RM"], nat: "阿根廷", rate: 89 },
      { name: "马特拉齐", pos: ["CB"], nat: "意大利", rate: 86 },
      { name: "坎比亚索", pos: ["CDM", "CM"], nat: "阿根廷", rate: 87 },
      { name: "斯内德", pos: ["CAM", "CM"], nat: "荷兰", rate: 89 },
      { name: "埃托奥", pos: ["ST", "LW"], nat: "喀麦隆", rate: 90 },
      { name: "米利托", pos: ["ST"], nat: "阿根廷", rate: 88 },
      { name: "劳塔罗", pos: ["ST"], nat: "阿根廷", rate: 89 }
    ]
  },
  "napoli": {
    id: "napoli", name: "那不勒斯", short: "NAP", league: "ita", stadium: "马拉多纳球场",
    colors: ["#12a0d7", "#003d7c"],
    players: [
      { name: "奥斯皮纳", pos: ["GK"], nat: "哥伦比亚", rate: 84 },
      { name: "迪洛伦佐", pos: ["RB", "CB"], nat: "意大利", rate: 86 },
      { name: "库利巴利", pos: ["CB"], nat: "塞内加尔", rate: 88 },
      { name: "哈姆西克", pos: ["CM", "CAM"], nat: "斯洛伐克", rate: 87 },
      { name: "马拉多纳", pos: ["CAM", "ST"], nat: "阿根廷", rate: 95 },
      { name: "默滕斯", pos: ["ST", "LW"], nat: "比利时", rate: 87 },
      { name: "因西涅", pos: ["LW", "RW"], nat: "意大利", rate: 87 },
      { name: "奥西门", pos: ["ST"], nat: "尼日利亚", rate: 89 },
      { name: "克瓦拉茨赫利亚", pos: ["LW", "RW"], nat: "格鲁吉亚", rate: 88 }
    ]
  },

  "bayern": {
    id: "bayern", name: "拜仁慕尼黑", short: "BAY", league: "ger", stadium: "安联球场",
    colors: ["#dc052d", "#0066b2"],
    players: [
      { name: "诺伊尔", pos: ["GK"], nat: "德国", rate: 91 },
      { name: "拉姆", pos: ["RB", "LB"], nat: "德国", rate: 90 },
      { name: "阿拉巴", pos: ["CB", "LB"], nat: "奥地利", rate: 88 },
      { name: "施魏因施泰格", pos: ["CM", "CDM"], nat: "德国", rate: 89 },
      { name: "基米希", pos: ["CDM", "RB"], nat: "德国", rate: 89 },
      { name: "托马斯·穆勒", pos: ["CAM", "ST"], nat: "德国", rate: 89 },
      { name: "里贝里", pos: ["LW"], nat: "法国", rate: 90 },
      { name: "罗本", pos: ["RW"], nat: "荷兰", rate: 90 },
      { name: "莱万多夫斯基", pos: ["ST"], nat: "波兰", rate: 93 }
    ]
  },
  "dortmund": {
    id: "dortmund", name: "多特蒙德", short: "BVB", league: "ger", stadium: "威斯特法伦",
    colors: ["#fde100", "#000000"],
    players: [
      { name: "魏登费勒", pos: ["GK"], nat: "德国", rate: 85 },
      { name: "胡梅尔斯", pos: ["CB"], nat: "德国", rate: 88 },
      { name: "皮什切克", pos: ["RB"], nat: "波兰", rate: 85 },
      { name: "罗伊斯", pos: ["CAM", "LW"], nat: "德国", rate: 89 },
      { name: "格策", pos: ["CAM", "CM"], nat: "德国", rate: 87 },
      { name: "香川真司", pos: ["CAM", "CM"], nat: "日本", rate: 85 },
      { name: "奥巴梅扬", pos: ["ST"], nat: "加蓬", rate: 89 },
      { name: "哈兰德", pos: ["ST"], nat: "挪威", rate: 92 }
    ]
  },
  "leverkusen": {
    id: "leverkusen", name: "勒沃库森", short: "B04", league: "ger", stadium: "拜耳竞技场",
    colors: ["#e32221", "#000000"],
    players: [
      { name: "阿德勒", pos: ["GK"], nat: "德国", rate: 86 },
      { name: "卢西奥", pos: ["CB"], nat: "巴西", rate: 88 },
      { name: "巴拉克", pos: ["CM", "CAM"], nat: "德国", rate: 90 },
      { name: "施耐德", pos: ["CAM", "RM"], nat: "德国", rate: 86 },
      { name: "本德", pos: ["CDM", "CM"], nat: "德国", rate: 84 },
      { name: "贝尔巴托夫", pos: ["ST"], nat: "保加利亚", rate: 88 },
      { name: "孙兴慜", pos: ["LW", "ST"], nat: "韩国", rate: 87 },
      { name: "维尔茨", pos: ["CAM", "CM"], nat: "德国", rate: 90 }
    ]
  },

  "psg": {
    id: "psg", name: "巴黎圣日耳曼", short: "PSG", league: "fra", stadium: "王子公园",
    colors: ["#004170", "#da291c"],
    players: [
      { name: "纳瓦斯", pos: ["GK"], nat: "哥斯达黎加", rate: 86 },
      { name: "马尔基尼奥斯", pos: ["CB", "CDM"], nat: "巴西", rate: 88 },
      { name: "阿什拉夫", pos: ["RB", "RW"], nat: "摩洛哥", rate: 87 },
      { name: "维拉蒂", pos: ["CM", "CDM"], nat: "意大利", rate: 89 },
      { name: "扎伊尔-埃梅里", pos: ["CM", "CAM"], nat: "法国", rate: 85 },
      { name: "内马尔", pos: ["LW", "CAM"], nat: "巴西", rate: 92 },
      { name: "姆巴佩", pos: ["ST", "RW"], nat: "法国", rate: 94 },
      { name: "伊布拉希莫维奇", pos: ["ST"], nat: "瑞典", rate: 90 },
      { name: "卡瓦尼", pos: ["ST"], nat: "乌拉圭", rate: 88 }
    ]
  },
  "marseille": {
    id: "marseille", name: "马赛", short: "OM", league: "fra", stadium: "韦洛德罗姆",
    colors: ["#2faee0", "#ffffff"],
    players: [
      { name: "巴特兹", pos: ["GK"], nat: "法国", rate: 88 },
      { name: "德塞利", pos: ["CB", "CDM"], nat: "法国", rate: 89 },
      { name: "利扎拉祖", pos: ["LB"], nat: "法国", rate: 86 },
      { name: "卡马拉", pos: ["CDM", "CB"], nat: "法国", rate: 84 },
      { name: "帕耶", pos: ["CAM", "RW"], nat: "法国", rate: 87 },
      { name: "里贝里", pos: ["LW", "RW"], nat: "法国", rate: 89 },
      { name: "帕潘", pos: ["ST"], nat: "法国", rate: 90 },
      { name: "德罗巴", pos: ["ST"], nat: "科特迪瓦", rate: 89 }
    ]
  },
  "lyon": {
    id: "lyon", name: "里昂", short: "OL", league: "fra", stadium: "里昂公园",
    colors: ["#1c1c1c", "#da291c"],
    players: [
      { name: "库佩", pos: ["GK"], nat: "法国", rate: 86 },
      { name: "小儒尼尼奥", pos: ["CM", "CAM"], nat: "巴西", rate: 88 },
      { name: "埃辛", pos: ["CDM", "CM"], nat: "加纳", rate: 87 },
      { name: "托利索", pos: ["CM", "CAM"], nat: "法国", rate: 85 },
      { name: "戈武", pos: ["RW", "ST"], nat: "法国", rate: 85 },
      { name: "本泽马", pos: ["ST"], nat: "法国", rate: 91 },
      { name: "拉卡泽特", pos: ["ST"], nat: "法国", rate: 87 },
      { name: "费基尔", pos: ["CAM", "ST"], nat: "法国", rate: 87 }
    ]
  },

  "benfica": {
    id: "benfica", name: "本菲卡", short: "BEN", league: "por", stadium: "光明球场",
    colors: ["#e21c38", "#ffffff"],
    players: [
      { name: "爱德华多", pos: ["GK"], nat: "葡萄牙", rate: 84 },
      { name: "鲁本·迪亚斯", pos: ["CB"], nat: "葡萄牙", rate: 87 },
      { name: "鲁伊·科斯塔", pos: ["CAM"], nat: "葡萄牙", rate: 90 },
      { name: "贝尔纳多·席尔瓦", pos: ["RW", "CM"], nat: "葡萄牙", rate: 88 },
      { name: "盖坦", pos: ["LW", "CAM"], nat: "阿根廷", rate: 85 },
      { name: "艾马尔", pos: ["CAM"], nat: "阿根廷", rate: 87 },
      { name: "若昂·费利克斯", pos: ["ST", "CAM"], nat: "葡萄牙", rate: 88 },
      { name: "尤西比奥", pos: ["ST"], nat: "葡萄牙", rate: 94 },
      { name: "卡多佐", pos: ["ST"], nat: "巴拉圭", rate: 86 }
    ]
  },
  "porto": {
    id: "porto", name: "波尔图", short: "POR", league: "por", stadium: "巨龙球场",
    colors: ["#00428c", "#ffffff"],
    players: [
      { name: "拜亚", pos: ["GK"], nat: "葡萄牙", rate: 87 },
      { name: "佩佩", pos: ["CB"], nat: "葡萄牙", rate: 89 },
      { name: "卡瓦略", pos: ["CB"], nat: "葡萄牙", rate: 88 },
      { name: "德科", pos: ["CAM", "CM"], nat: "葡萄牙", rate: 90 },
      { name: "詹姆斯·罗德里格斯", pos: ["CAM", "LW"], nat: "哥伦比亚", rate: 89 },
      { name: "法尔考", pos: ["ST"], nat: "哥伦比亚", rate: 89 },
      { name: "浩克", pos: ["ST", "RW"], nat: "巴西", rate: 88 },
      { name: "路易斯·迪亚斯", pos: ["LW", "RW"], nat: "哥伦比亚", rate: 88 }
    ]
  },
  "sporting": {
    id: "sporting", name: "葡萄牙体育", short: "SPO", league: "por", stadium: "阿尔瓦拉德",
    colors: ["#005128", "#ffffff"],
    players: [
      { name: "帕特里西奥", pos: ["GK"], nat: "葡萄牙", rate: 87 },
      { name: "科茨", pos: ["CB"], nat: "乌拉圭", rate: 85 },
      { name: "佩德罗·波罗", pos: ["RB"], nat: "西班牙", rate: 85 },
      { name: "布鲁诺·费尔南德斯", pos: ["CAM", "CM"], nat: "葡萄牙", rate: 90 },
      { name: "夸雷斯马", pos: ["RW", "LW"], nat: "葡萄牙", rate: 86 },
      { name: "纳尼", pos: ["LW", "RW"], nat: "葡萄牙", rate: 86 },
      { name: "C.罗纳尔多", pos: ["LW", "ST"], nat: "葡萄牙", rate: 94 },
      { name: "菲戈", pos: ["RW", "RM"], nat: "葡萄牙", rate: 92 },
      { name: "巴斯·多斯特", pos: ["ST"], nat: "荷兰", rate: 85 }
    ]
  },

  "ajax": {
    id: "ajax", name: "阿贾克斯", short: "AJA", league: "ned", stadium: "约翰·克鲁伊夫球场",
    colors: ["#d2122e", "#ffffff"],
    players: [
      { name: "范德萨", pos: ["GK"], nat: "荷兰", rate: 90 },
      { name: "布林德", pos: ["CB", "LB", "CDM"], nat: "荷兰", rate: 86 },
      { name: "德利赫特", pos: ["CB"], nat: "荷兰", rate: 88 },
      { name: "弗伦基·德容", pos: ["CM", "CDM"], nat: "荷兰", rate: 89 },
      { name: "西多夫", pos: ["CM", "CAM"], nat: "荷兰", rate: 89 },
      { name: "范德法特", pos: ["CAM", "CM"], nat: "荷兰", rate: 87 },
      { name: "博格坎普", pos: ["CAM", "ST"], nat: "荷兰", rate: 91 },
      { name: "苏亚雷斯", pos: ["ST"], nat: "乌拉圭", rate: 90 },
      { name: "塔迪奇", pos: ["LW", "CAM", "ST"], nat: "塞尔维亚", rate: 86 }
    ]
  },
  "psv": {
    id: "psv", name: "PSV埃因霍温", short: "PSV", league: "ned", stadium: "飞利浦球场",
    colors: ["#e5202c", "#ffffff"],
    players: [
      { name: "洛德韦克", pos: ["GK"], nat: "荷兰", rate: 84 },
      { name: "范博梅尔", pos: ["CDM", "CM"], nat: "荷兰", rate: 87 },
      { name: "科库", pos: ["CM", "CDM"], nat: "荷兰", rate: 86 },
      { name: "古利特", pos: ["CM", "CAM"], nat: "荷兰", rate: 91 },
      { name: "罗马里奥", pos: ["ST"], nat: "巴西", rate: 93 },
      { name: "范尼斯特鲁伊", pos: ["ST"], nat: "荷兰", rate: 90 },
      { name: "罗纳尔多", pos: ["ST"], nat: "巴西", rate: 93 },
      { name: "德佩", pos: ["LW", "ST"], nat: "荷兰", rate: 87 }
    ]
  },
  "feyenoord": {
    id: "feyenoord", name: "费耶诺德", short: "FEY", league: "ned", stadium: "德库伊普",
    colors: ["#d2122e", "#000000"],
    players: [
      { name: "拜洛", pos: ["GK"], nat: "荷兰", rate: 85 },
      { name: "范布隆克霍斯特", pos: ["LB", "CB"], nat: "荷兰", rate: 86 },
      { name: "卡尔斯多普", pos: ["RB"], nat: "荷兰", rate: 83 },
      { name: "科库", pos: ["CM", "CDM"], nat: "荷兰", rate: 87 },
      { name: "克鲁伊夫", pos: ["CAM", "ST"], nat: "荷兰", rate: 94 },
      { name: "库伊特", pos: ["ST", "RW"], nat: "荷兰", rate: 87 },
      { name: "范佩西", pos: ["ST"], nat: "荷兰", rate: 90 },
      { name: "西尼斯特拉", pos: ["LW"], nat: "哥伦比亚", rate: 84 }
    ]
  },

  "flamengo": {
    id: "flamengo", name: "弗拉门戈", short: "FLA", league: "bra", stadium: "马拉卡纳",
    colors: ["#c8102e", "#000000"],
    players: [
      { name: "罗西", pos: ["GK"], nat: "巴西", rate: 84 },
      { name: "埃弗顿·里贝罗", pos: ["CM", "CAM"], nat: "巴西", rate: 85 },
      { name: "布鲁诺·恩里克", pos: ["LW", "ST"], nat: "巴西", rate: 85 },
      { name: "阿图尔", pos: ["CM"], nat: "巴西", rate: 86 },
      { name: "加布里埃尔·巴博萨", pos: ["ST"], nat: "巴西", rate: 87 },
      { name: "罗纳尔迪尼奥", pos: ["CAM", "LW"], nat: "巴西", rate: 92 },
      { name: "阿德里亚诺", pos: ["ST"], nat: "巴西", rate: 90 },
      { name: "济科", pos: ["CAM", "ST"], nat: "巴西", rate: 94 },
      { name: "德阿拉斯卡埃塔", pos: ["CAM"], nat: "乌拉圭", rate: 86 }
    ]
  },
  "palmeiras": {
    id: "palmeiras", name: "帕尔梅拉斯", short: "PAL", league: "bra", stadium: "安联公园",
    colors: ["#006437", "#ffffff"],
    players: [
      { name: "韦弗顿", pos: ["GK"], nat: "巴西", rate: 85 },
      { name: "马尔科斯", pos: ["GK"], nat: "巴西", rate: 87 },
      { name: "巴尔迪维亚", pos: ["CAM"], nat: "智利", rate: 86 },
      { name: "阿莱士", pos: ["CAM", "CM"], nat: "巴西", rate: 86 },
      { name: "斯卡帕", pos: ["CAM"], nat: "巴西", rate: 84 },
      { name: "杜杜", pos: ["LW", "RW"], nat: "巴西", rate: 85 },
      { name: "罗尼", pos: ["ST"], nat: "巴西", rate: 84 },
      { name: "恩德里克", pos: ["ST"], nat: "巴西", rate: 88 }
    ]
  },
  "sao-paulo": {
    id: "sao-paulo", name: "圣保罗", short: "SAO", league: "bra", stadium: "莫伦比",
    colors: ["#c8102e", "#ffffff"],
    players: [
      { name: "切尼", pos: ["GK"], nat: "巴西", rate: 89 },
      { name: "卡福", pos: ["RB"], nat: "巴西", rate: 90 },
      { name: "米兰达", pos: ["CB"], nat: "巴西", rate: 86 },
      { name: "埃尔纳内斯", pos: ["CM", "CAM"], nat: "巴西", rate: 86 },
      { name: "卡卡", pos: ["CAM"], nat: "巴西", rate: 92 },
      { name: "拉伊", pos: ["CAM", "ST"], nat: "巴西", rate: 89 },
      { name: "卡雷卡", pos: ["ST"], nat: "巴西", rate: 88 },
      { name: "路易斯·法比亚诺", pos: ["ST"], nat: "巴西", rate: 87 }
    ]
  },

  "river": {
    id: "river", name: "河床", short: "RIV", league: "arg", stadium: "纪念碑球场",
    colors: ["#ffffff", "#c8102e"],
    players: [
      { name: "阿尔马尼", pos: ["GK"], nat: "阿根廷", rate: 86 },
      { name: "奥尔特加", pos: ["CAM", "RW"], nat: "阿根廷", rate: 87 },
      { name: "艾马尔", pos: ["CAM"], nat: "阿根廷", rate: 88 },
      { name: "加拉多", pos: ["CAM"], nat: "阿根廷", rate: 89 },
      { name: "恩佐·费尔南德斯", pos: ["CM", "CDM"], nat: "阿根廷", rate: 88 },
      { name: "弗朗西斯科利", pos: ["ST", "CAM"], nat: "乌拉圭", rate: 89 },
      { name: "胡利安·阿尔瓦雷斯", pos: ["ST"], nat: "阿根廷", rate: 90 },
      { name: "伊瓜因", pos: ["ST"], nat: "阿根廷", rate: 88 }
    ]
  },
  "boca": {
    id: "boca", name: "博卡青年", short: "BOC", league: "arg", stadium: "糖果盒",
    colors: ["#003da5", "#f3c300"],
    players: [
      { name: "罗梅罗", pos: ["GK"], nat: "阿根廷", rate: 85 },
      { name: "布尔迪索", pos: ["CB"], nat: "阿根廷", rate: 84 },
      { name: "巴塔利亚", pos: ["CDM", "CM"], nat: "阿根廷", rate: 84 },
      { name: "巴内加", pos: ["CM", "CAM"], nat: "阿根廷", rate: 85 },
      { name: "马拉多纳", pos: ["CAM", "ST"], nat: "阿根廷", rate: 95 },
      { name: "里克尔梅", pos: ["CAM"], nat: "阿根廷", rate: 91 },
      { name: "帕勒莫", pos: ["ST"], nat: "阿根廷", rate: 88 },
      { name: "特维斯", pos: ["ST", "CAM"], nat: "阿根廷", rate: 88 }
    ]
  },
  "racing": {
    id: "racing", name: "竞技俱乐部", short: "RAC", league: "arg", stadium: "胡安·多明戈·佩隆",
    colors: ["#1c9cd9", "#ffffff"],
    players: [
      { name: "阿里亚斯", pos: ["GK"], nat: "哥伦比亚", rate: 84 },
      { name: "西加利", pos: ["CB"], nat: "阿根廷", rate: 83 },
      { name: "莫雷诺", pos: ["CM", "CAM"], nat: "阿根廷", rate: 84 },
      { name: "卡尔多纳", pos: ["CAM", "LW"], nat: "哥伦比亚", rate: 84 },
      { name: "劳塔罗·马丁内斯", pos: ["ST"], nat: "阿根廷", rate: 89 },
      { name: "迭戈·米利托", pos: ["ST"], nat: "阿根廷", rate: 88 },
      { name: "利桑德罗·洛佩斯", pos: ["ST"], nat: "阿根廷", rate: 86 },
      { name: "博加多", pos: ["CM"], nat: "阿根廷", rate: 82 }
    ]
  },

  "inter-miami": {
    id: "inter-miami", name: "迈阿密国际", short: "MIA", league: "usa", stadium: "大通体育场",
    colors: ["#f7b5cd", "#000000"],
    players: [
      { name: "卡伦德", pos: ["GK"], nat: "美国", rate: 83 },
      { name: "阿尔巴", pos: ["LB"], nat: "西班牙", rate: 86 },
      { name: "布斯克茨", pos: ["CDM", "CM"], nat: "西班牙", rate: 88 },
      { name: "克雷马斯基", pos: ["CM", "CAM"], nat: "美国", rate: 82 },
      { name: "鲁伊斯", pos: ["CM"], nat: "美国", rate: 81 },
      { name: "梅西", pos: ["RW", "CAM", "ST"], nat: "阿根廷", rate: 94 },
      { name: "苏亚雷斯", pos: ["ST"], nat: "乌拉圭", rate: 88 },
      { name: "坎帕纳", pos: ["ST"], nat: "厄瓜多尔", rate: 83 }
    ]
  },
  "la-galaxy": {
    id: "la-galaxy", name: "洛杉矶银河", short: "LAG", league: "usa", stadium: "尊严健康体育公园",
    colors: ["#00245d", "#ffd700"],
    players: [
      { name: "邦德", pos: ["GK"], nat: "美国", rate: 81 },
      { name: "范尼", pos: ["CB"], nat: "美国", rate: 82 },
      { name: "卡莱加里", pos: ["RB"], nat: "巴西", rate: 81 },
      { name: "普伊奇", pos: ["CM", "CAM"], nat: "西班牙", rate: 84 },
      { name: "贝克汉姆", pos: ["RM", "CM"], nat: "英格兰", rate: 89 },
      { name: "多诺万", pos: ["ST", "LW"], nat: "美国", rate: 87 },
      { name: "罗比·基恩", pos: ["ST"], nat: "爱尔兰", rate: 86 },
      { name: "伊布拉希莫维奇", pos: ["ST"], nat: "瑞典", rate: 90 }
    ]
  },
  "atlanta": {
    id: "atlanta", name: "亚特兰大联", short: "ATL", league: "usa", stadium: "梅赛德斯-奔驰体育场",
    colors: ["#a71930", "#231f20"],
    players: [
      { name: "古赞", pos: ["GK"], nat: "美国", rate: 82 },
      { name: "罗宾逊", pos: ["CB"], nat: "美国", rate: 82 },
      { name: "列侬", pos: ["RB"], nat: "英格兰", rate: 81 },
      { name: "索萨", pos: ["CDM", "CM"], nat: "乌拉圭", rate: 82 },
      { name: "罗塞托", pos: ["CM"], nat: "巴西", rate: 81 },
      { name: "阿尔米隆", pos: ["CAM", "RW"], nat: "巴拉圭", rate: 87 },
      { name: "蒂亚戈·阿尔马达", pos: ["CAM", "LW"], nat: "阿根廷", rate: 86 },
      { name: "约瑟夫·马丁内斯", pos: ["ST"], nat: "委内瑞拉", rate: 85 }
    ]
  },

  "vissel-kobe": {
    id: "vissel-kobe", name: "神户胜利船", short: "VIS", league: "jpn", stadium: "御崎公园",
    colors: ["#9a1d3e", "#ffffff"],
    players: [
      { name: "前川黛也", pos: ["GK"], nat: "日本", rate: 82 },
      { name: "佐佐木大树", pos: ["LB"], nat: "日本", rate: 81 },
      { name: "山口萤", pos: ["CDM", "CM"], nat: "日本", rate: 83 },
      { name: "伊涅斯塔", pos: ["CM", "CAM"], nat: "西班牙", rate: 90 },
      { name: "波多尔斯基", pos: ["ST", "LW"], nat: "德国", rate: 86 },
      { name: "博扬", pos: ["ST", "CAM"], nat: "西班牙", rate: 85 },
      { name: "大迫勇也", pos: ["ST"], nat: "日本", rate: 84 },
      { name: "武藤嘉纪", pos: ["ST"], nat: "日本", rate: 83 }
    ]
  },
  "kashima": {
    id: "kashima", name: "鹿岛鹿角", short: "KAS", league: "jpn", stadium: "鹿嶋足球场",
    colors: ["#c8102e", "#ffffff"],
    players: [
      { name: "土居圣真", pos: ["GK"], nat: "日本", rate: 81 },
      { name: "内田笃人", pos: ["RB"], nat: "日本", rate: 84 },
      { name: "伊藤洋辉", pos: ["CB"], nat: "日本", rate: 82 },
      { name: "远藤保仁", pos: ["CDM", "CM"], nat: "日本", rate: 86 },
      { name: "中村俊辅", pos: ["CAM", "CM"], nat: "日本", rate: 87 },
      { name: "铃木优磨", pos: ["ST"], nat: "日本", rate: 84 },
      { name: "野泽拓也", pos: ["ST"], nat: "日本", rate: 82 },
      { name: "相马勇纪", pos: ["LW", "RW"], nat: "日本", rate: 83 }
    ]
  },
  "urawa": {
    id: "urawa", name: "浦和红钻", short: "URA", league: "jpn", stadium: "埼玉2002",
    colors: ["#c8102e", "#ffffff"],
    players: [
      { name: "西川周作", pos: ["GK"], nat: "日本", rate: 83 },
      { name: "秋本真吾", pos: ["LB"], nat: "日本", rate: 81 },
      { name: "槙野智章", pos: ["CB"], nat: "日本", rate: 83 },
      { name: "柴崎岳", pos: ["CM", "CDM"], nat: "日本", rate: 84 },
      { name: "小野伸二", pos: ["CAM", "CM"], nat: "日本", rate: 86 },
      { name: "兴梠慎三", pos: ["ST"], nat: "日本", rate: 84 },
      { name: "山田直辉", pos: ["ST"], nat: "日本", rate: 82 },
      { name: "林森", pos: ["ST"], nat: "荷兰", rate: 84 }
    ]
  },

  "al-hilal": {
    id: "al-hilal", name: "利雅得新月", short: "HIL", league: "ksa", stadium: "法赫德国王",
    colors: ["#0057a8", "#ffffff"],
    players: [
      { name: "布努", pos: ["GK"], nat: "摩洛哥", rate: 87 },
      { name: "布莱希", pos: ["CB"], nat: "沙特", rate: 82 },
      { name: "坎诺", pos: ["CDM", "CM"], nat: "沙特", rate: 82 },
      { name: "迈克尔", pos: ["CAM", "RW"], nat: "巴西", rate: 83 },
      { name: "马尔科姆", pos: ["RW", "LW"], nat: "巴西", rate: 86 },
      { name: "达瓦萨里", pos: ["LW", "RW"], nat: "沙特", rate: 84 },
      { name: "米特罗维奇", pos: ["ST"], nat: "塞尔维亚", rate: 88 },
      { name: "内马尔", pos: ["LW", "CAM"], nat: "巴西", rate: 91 }
    ]
  },
  "al-nassr": {
    id: "al-nassr", name: "利雅得胜利", short: "NAS", league: "ksa", stadium: "沙特国王大学",
    colors: ["#f3c300", "#0057a8"],
    players: [
      { name: "本托", pos: ["GK"], nat: "巴西", rate: 85 },
      { name: "拉波尔特", pos: ["CB"], nat: "西班牙", rate: 87 },
      { name: "加纳姆", pos: ["RB"], nat: "沙特", rate: 82 },
      { name: "布罗佐维奇", pos: ["CDM", "CM"], nat: "克罗地亚", rate: 87 },
      { name: "奥塔维奥", pos: ["CM", "CAM"], nat: "葡萄牙", rate: 85 },
      { name: "马内", pos: ["LW", "RW"], nat: "塞内加尔", rate: 88 },
      { name: "塔利斯卡", pos: ["CAM", "ST"], nat: "巴西", rate: 86 },
      { name: "C.罗纳尔多", pos: ["ST"], nat: "葡萄牙", rate: 92 }
    ]
  },
  "al-ittihad": {
    id: "al-ittihad", name: "吉达联合", short: "ITT", league: "ksa", stadium: "阿卜杜拉国王",
    colors: ["#febe10", "#000000"],
    players: [
      { name: "马尤夫", pos: ["GK"], nat: "沙特", rate: 82 },
      { name: "赫加齐", pos: ["CB"], nat: "埃及", rate: 83 },
      { name: "奥拉扬", pos: ["RB"], nat: "沙特", rate: 81 },
      { name: "坎特", pos: ["CDM", "CM"], nat: "法国", rate: 87 },
      { name: "法比尼奥", pos: ["CDM", "CM"], nat: "巴西", rate: 86 },
      { name: "罗马里尼奥", pos: ["ST", "LW"], nat: "巴西", rate: 84 },
      { name: "哈默德", pos: ["ST"], nat: "摩洛哥", rate: 86 },
      { name: "本泽马", pos: ["ST"], nat: "法国", rate: 90 }
    ]
  }
};

const FORMATIONS = {
  "4-3-3": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "CM", x: 34, y: 54 },
    { pos: "CM", x: 66, y: 54 },
    { pos: "CAM", x: 50, y: 42 },
    { pos: "LW", x: 20, y: 22 },
    { pos: "ST", x: 50, y: 15 },
    { pos: "RW", x: 80, y: 22 }
  ],
  "4-4-2": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "LM", x: 17, y: 46 },
    { pos: "CM", x: 40, y: 54 },
    { pos: "CM", x: 60, y: 54 },
    { pos: "RM", x: 83, y: 46 },
    { pos: "ST", x: 38, y: 22 },
    { pos: "ST", x: 62, y: 22 }
  ],
  "4-2-3-1": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "CDM", x: 40, y: 60 },
    { pos: "CDM", x: 60, y: 60 },
    { pos: "LW", x: 20, y: 32 },
    { pos: "CAM", x: 50, y: 38 },
    { pos: "RW", x: 80, y: 32 },
    { pos: "ST", x: 50, y: 14 }
  ],
  "3-5-2": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "CB", x: 30, y: 79 },
    { pos: "CB", x: 50, y: 84 },
    { pos: "CB", x: 70, y: 79 },
    { pos: "LWB", x: 12, y: 55 },
    { pos: "CM", x: 38, y: 53 },
    { pos: "CM", x: 62, y: 53 },
    { pos: "CAM", x: 50, y: 40 },
    { pos: "RWB", x: 88, y: 55 },
    { pos: "ST", x: 38, y: 21 },
    { pos: "ST", x: 62, y: 21 }
  ],
  "4-5-1": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "LM", x: 16, y: 45 },
    { pos: "CM", x: 37, y: 53 },
    { pos: "CDM", x: 50, y: 62 },
    { pos: "CM", x: 63, y: 53 },
    { pos: "RM", x: 84, y: 45 },
    { pos: "ST", x: 50, y: 15 }
  ],
  "3-4-3": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "CB", x: 30, y: 79 },
    { pos: "CB", x: 50, y: 84 },
    { pos: "CB", x: 70, y: 79 },
    { pos: "LM", x: 12, y: 54 },
    { pos: "CM", x: 38, y: 53 },
    { pos: "CM", x: 62, y: 53 },
    { pos: "RM", x: 88, y: 54 },
    { pos: "LW", x: 20, y: 22 },
    { pos: "ST", x: 50, y: 15 },
    { pos: "RW", x: 80, y: 22 }
  ],
  "5-4-1": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 33, y: 82 },
    { pos: "CB", x: 50, y: 85 },
    { pos: "CB", x: 67, y: 82 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "LM", x: 18, y: 48 },
    { pos: "CM", x: 40, y: 56 },
    { pos: "CM", x: 60, y: 56 },
    { pos: "RM", x: 82, y: 48 },
    { pos: "ST", x: 50, y: 16 }
  ],
  "4-1-2-1-2": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "CDM", x: 50, y: 63 },
    { pos: "CM", x: 34, y: 50 },
    { pos: "CM", x: 66, y: 50 },
    { pos: "CAM", x: 50, y: 36 },
    { pos: "ST", x: 36, y: 17 },
    { pos: "ST", x: 64, y: 17 }
  ],
  "4-4-1-1": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "LM", x: 17, y: 46 },
    { pos: "CM", x: 40, y: 54 },
    { pos: "CM", x: 60, y: 54 },
    { pos: "RM", x: 83, y: 46 },
    { pos: "CAM", x: 50, y: 30 },
    { pos: "ST", x: 50, y: 14 }
  ],
  "3-4-1-2": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "CB", x: 30, y: 79 },
    { pos: "CB", x: 50, y: 84 },
    { pos: "CB", x: 70, y: 79 },
    { pos: "LM", x: 13, y: 54 },
    { pos: "CM", x: 38, y: 53 },
    { pos: "CM", x: 62, y: 53 },
    { pos: "RM", x: 87, y: 54 },
    { pos: "CAM", x: 50, y: 38 },
    { pos: "ST", x: 37, y: 19 },
    { pos: "ST", x: 63, y: 19 }
  ],
  "4-2-2-2": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LB", x: 16, y: 76 },
    { pos: "CB", x: 38, y: 81 },
    { pos: "CB", x: 62, y: 81 },
    { pos: "RB", x: 84, y: 76 },
    { pos: "CDM", x: 40, y: 62 },
    { pos: "CDM", x: 60, y: 62 },
    { pos: "CAM", x: 35, y: 37 },
    { pos: "CAM", x: 65, y: 37 },
    { pos: "ST", x: 38, y: 17 },
    { pos: "ST", x: 62, y: 17 }
  ],
  "5-3-2": [
    { pos: "GK", x: 50, y: 92 },
    { pos: "LWB", x: 12, y: 58 },
    { pos: "CB", x: 30, y: 80 },
    { pos: "CB", x: 50, y: 85 },
    { pos: "CB", x: 70, y: 80 },
    { pos: "RWB", x: 88, y: 58 },
    { pos: "CM", x: 35, y: 52 },
    { pos: "CM", x: 50, y: 56 },
    { pos: "CAM", x: 65, y: 52 },
    { pos: "ST", x: 38, y: 21 },
    { pos: "ST", x: 62, y: 21 }
  ]
};

const POSITION_NAMES = {
  GK: "门将", RB: "右后卫", CB: "中后卫", LB: "左后卫", RWB: "右翼卫", LWB: "左翼卫",
  CDM: "后腰", CM: "中前卫", CAM: "前腰", RM: "右前卫", LM: "左前卫",
  RW: "右边锋", LW: "左边锋", ST: "中锋"
};

const ERA_RATING = {
  "All-Time": 0,
  "1990s": -1,
  "2000s": 0,
  "2010s": 1,
  "2020s": 1
};

const REROLL_BUDGET = { easy: 3, normal: 1, hard: 0 };
