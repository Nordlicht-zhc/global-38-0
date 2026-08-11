(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const STORAGE_GAME = "g38-game-state-v4";
  const STORAGE_RUNS = "g38-runs-v2";
  const CURRENT_DATA_SEASON = "2025-26";
  const EUROPE_ALLOCATION_SEASON = "2026-27";
  const BIG_FIVE_IDS = new Set(["eng", "esp", "ita", "ger", "fra"]);
  const WING_POSITIONS = ["LM", "RM", "LW", "RW"];
  const MIDFIELD_CENTRE_POSITIONS = ["CM", "CDM", "CAM"];
  const FORCED_FIT_PENALTY = 6;
  const TRANSFER_UNIT_POSITIONS = {
    GK: ["GK"],
    DEF: ["RB", "CB", "LB", "RWB", "LWB"],
    MID: ["CDM", "CM", "CAM", "RM", "LM"],
    ATT: ["ST", "LW", "RW"]
  };
  const SECOND_TRANSFER_MODE_KEYS = ["free", "mystery"];
  const TRANSFER_CHEMISTRY_LOSS = 0.03;
  const TRANSFER_CHEMISTRY_RECOVERY = 0.01;
  const CHEMISTRY_RATING_FLOOR = 60;
  const COACHES = {
    highPress: {
      id: "highPress",
      name: "高位压迫教练",
      nameEn: "High-Press Coach",
      style: "主动压迫",
      styleEn: "Aggressive Pressing",
      description: "以前场压迫和中场覆盖换取更高的进攻强度。",
      descriptionEn: "Trade defensive stability for stronger front-foot pressure and midfield coverage.",
      effects: { attack: 1.5, midfield: 1, defense: -0.5, goalkeeper: 0 }
    },
    balanced: {
      id: "balanced",
      name: "均衡管理教练",
      nameEn: "Balanced Coach",
      style: "全面管理",
      styleEn: "All-Round Management",
      description: "以稳定的结构提升所有比赛环节，适合没有明显战术偏好的阵容。",
      descriptionEn: "A steady all-round lift for squads without a pronounced tactical preference.",
      effects: { attack: 0.5, midfield: 0.5, defense: 0.5, goalkeeper: 0.5 }
    },
    possession: {
      id: "possession",
      name: "传控教练",
      nameEn: "Possession Coach",
      style: "控球主导",
      styleEn: "Possession Control",
      description: "通过中场控制和出球体系提升比赛掌控力，但牺牲部分终结直接性。",
      descriptionEn: "Strengthen midfield control and build-up play at the cost of some direct attacking edge.",
      effects: { attack: -0.5, midfield: 2, defense: 0.5, goalkeeper: 0 }
    },
    counterAttack: {
      id: "counterAttack",
      name: "防守反击教练",
      nameEn: "Counter-Attack Coach",
      style: "快速转换",
      styleEn: "Rapid Transition",
      description: "强化防守后的快速推进与终结，代价是中场控制下降。",
      descriptionEn: "Boost defensive transitions and finishing while conceding midfield control.",
      effects: { attack: 1.5, midfield: -1, defense: 1.5, goalkeeper: 0.5 }
    },
    lowBlock: {
      id: "lowBlock",
      name: "低位防守教练",
      nameEn: "Low-Block Coach",
      style: "稳守优先",
      styleEn: "Defensive Security",
      description: "优先收紧防线和保护门将，适合保分与对抗强敌。",
      descriptionEn: "Prioritize compact defending and goalkeeper protection, ideal for protecting points.",
      effects: { attack: -1.5, midfield: 0, defense: 2, goalkeeper: 1 }
    },
    wingPlay: {
      id: "wingPlay",
      name: "边路进攻教练",
      nameEn: "Wide-Play Coach",
      style: "边路冲击",
      styleEn: "Wide Attacking",
      description: "加强边路推进和传中威胁，为进攻与中场提供额外宽度。",
      descriptionEn: "Create more threat through wide progression and crossing, adding width to attack and midfield.",
      effects: { attack: 1.5, midfield: 0.5, defense: 0, goalkeeper: 0 }
    }
  };
  const DOMESTIC_CUP_STAGES = ["32强", "16强", "八强", "半决赛", "决赛"];
  const DOMESTIC_CUPS = {
    eng: { name: "英格兰足总杯", nameEn: "FA Cup", champion: "足总杯冠军", championEn: "FA Cup Champion", lowerTeams: ["伯明翰城", "布莱克本", "布里斯托尔城", "卡迪夫城", "德比郡", "赫尔城", "米德尔斯堡", "米尔沃尔", "诺维奇", "谢菲尔德联", "斯托克城", "西布朗"] },
    esp: { name: "西班牙国王杯", nameEn: "Copa del Rey", champion: "国王杯冠军", championEn: "Copa del Rey Champion", lowerTeams: ["阿尔巴塞特", "阿尔梅里亚", "布尔戈斯", "加的斯", "拉科鲁尼亚", "埃瓦尔", "格拉纳达", "韦斯卡", "米兰德斯", "桑坦德竞技", "萨拉戈萨", "希洪竞技"] },
    ita: { name: "意大利杯", nameEn: "Coppa Italia", champion: "意大利杯冠军", championEn: "Coppa Italia Champion", lowerTeams: ["巴里", "卡坦扎罗", "切塞纳", "弗罗西诺内", "曼托瓦", "摩德纳", "巴勒莫", "桑普多利亚", "斯佩齐亚", "南蒂罗尔", "威尼斯", "萨勒尼塔纳"] },
    ger: { name: "德国杯", nameEn: "DFB-Pokal", champion: "德国杯冠军", championEn: "DFB-Pokal Champion", lowerTeams: ["波鸿", "杜塞尔多夫", "汉诺威96", "柏林赫塔", "荷尔斯泰因基尔", "凯泽斯劳滕", "卡尔斯鲁厄", "马格德堡", "纽伦堡", "帕德博恩", "普鲁士明斯特", "沙尔克04", "艾禾斯堡", "布伦瑞克"] },
    fra: { name: "法国杯", nameEn: "Coupe de France", champion: "法国杯冠军", championEn: "Coupe de France Champion", lowerTeams: ["亚眠", "阿讷西", "巴斯蒂亚", "卡昂", "克莱蒙", "敦刻尔克", "格勒诺布尔", "甘冈", "拉瓦勒", "蒙彼利埃", "波城", "红星", "罗德兹", "特鲁瓦"] }
  };
  const EUROPE_LIST_VERSION = "2025-26-v3";
  const SIM_VERSION = "2026-v3";
  const LANG_KEY = "g38-lang";
  let currentLang = "zh";
  try {
    currentLang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "zh";
  } catch { currentLang = "zh"; }
  const staticOriginals = new WeakMap();
  const uiText = (zh, en) => currentLang === "en" ? en : zh;

  const STATIC_TRANSLATIONS = [
    { sel: "#historyBtnText", en: "History" },
    { sel: "#newGameBtnText", en: "New Draft" },
    { sel: ".brand-text strong", en: "Global All-Stars" },
    { sel: ".hero-copy .eyebrow", en: "1992-93 to 2025-26 seasons" },
    { sel: ".hero-copy h1", en: "All Five Leagues. Build Your Ultimate XI." },
    { sel: ".hero-sub", en: "Spin separate season and club reels, pick players from that real squad, assign positions, then test your team over a full league season. Covers England, Spain, Italy, Germany and France." },
    { sel: ".league-panel .eyebrow", en: "Database" },
    { sel: ".league-panel h2", en: "Select Leagues" },
    { sel: "#toggleAllLeagues", en: "All / Clear" },
    { sel: ".setup-panel .eyebrow", en: "New Season" },
    { sel: ".setup-panel h2", en: "Draft Setup" },
    { sel: ".setup-panel label.field:nth-of-type(1) > span", en: "Season Range" },
    { sel: ".setup-panel label.field:nth-of-type(2) > span", en: "Difficulty" },
    { sel: "#difficultySelect option[value='easy']", en: "Easy: 3 rerolls" },
    { sel: "#difficultySelect option[value='normal']", en: "Normal: 1 reroll" },
    { sel: "#difficultySelect option[value='hard']", en: "Hard: 0 rerolls" },
    { sel: ".setup-panel label.field:nth-of-type(3) > span", en: "Rating Mode" },
    { sel: "#hideRatingsSelect option[value='0']", en: "Show ratings" },
    { sel: "#hideRatingsSelect option[value='1']", en: "Hide ratings" },
    { sel: ".setup-panel label.field:nth-of-type(4) > span", en: "Formation" },
    { sel: "#startBtn", en: "Start Global Draft" },
    { sel: ".hint", en: "Your save is stored locally and survives a page refresh." },
    { sel: ".history-home .eyebrow", en: "Recent Results" },
    { sel: ".history-home h2", en: "Local Season History" },
    { sel: "#backSetupBtn", en: "Back to Setup" },
    { sel: "#backGameBtn", en: "Back to Home" },
    { sel: "#shareBtn", en: "Copy Report" },
    { sel: ".league-choice .eyebrow", en: "Season Sim" },
    { sel: ".league-choice h2", en: "Choose Your League" },
    { sel: "#coachTrialEyebrow", en: "Coaching Trial" },
    { sel: "#coachTrialTitle", en: "Choose Your Coach" },
    { sel: ".simulation-panel .eyebrow", en: "Match-by-Match Sim" },
    { sel: ".simulation-panel h2", en: "Season In Progress" },
    { sel: ".achievement-heading .eyebrow", en: "Season Honors" },
    { sel: ".achievement-heading h3", en: "Achievements" },
    { sel: ".transfer-panel .eyebrow", en: "Mid-Season Transfer Window" },
    { sel: "#transferTitle", en: "Transfer Window" },
    { sel: "#enterTransferBtn", en: "Enter Transfer Window" },
    { sel: "#skipTransferBtn", en: "Skip Transfer Window" },
    { sel: ".pitch-panel .eyebrow", en: "Squad" },
    { sel: "#slotMachineTitle", en: "Season & Club Draw" },
    { sel: "#seasonReelLabel", en: "Season" },
    { sel: "#clubReelLabel", en: "Club" },
    { sel: "#spinBtn", en: "Start Draw" },
    { sel: "#rerollBtn", en: "Use Reroll" },
    { sel: "#resultBadge", en: "Season Result" },
    { sel: "#resultMatchEyebrow", en: "38 Matches" },
    { sel: ".matches-panel h2", en: "Fixtures" },
    { sel: ".result-lineup-panel .eyebrow", en: "Squad Review" },
    { sel: ".result-table-panel .eyebrow", en: "Final Standings" },
    { sel: ".result-table-panel h2", en: "League Table" },
    { sel: ".europe-panel .eyebrow", en: "Europe" },
    { sel: "#europeStartBtn", en: "Start European Competition" },
    { sel: "footer span:nth-child(1)", en: "Global 38-0 ? Independent fan project" },
    { sel: "footer span:nth-child(2)", en: "Historical season ratings from FIFA / EA FC public data and authoritative sources" }
  ];

  const EXACT_PHRASES = [
    ["中文", "Chinese"],
    ["欧洲冠军联赛", "Champions League"],
    ["欧冠冠军", "Champions League Champion"],
    ["欧冠亚军", "Champions League Runner-Up"],
    ["欧联杯", "Europa League"],
    ["欧联杯冠军", "Europa League Champion"],
    ["欧联杯亚军", "Europa League Runner-Up"],
    ["欧协联", "Conference League"],
    ["欧协联冠军", "Conference League Champion"],
    ["欧协联亚军", "Conference League Runner-Up"],
    ["我的球队", "My Team"],
    ["2025-26 五大联赛 23 人名单", "2025-26 Big Five 23-man squads"],
    ["至", "to"],
    ["大联赛", "Leagues"],
    ["本季球队", "Clubs"],
    ["本季球员", "Players"],
    ["可抽球员", "Draft Pool"],
    ["还没有赛季记录，先开始一场选秀吧。", "No season records yet. Start a new draft."],
    ["请至少选择一个联赛。", "Select at least one league."],
    ["新选秀已开始，请抽取赛季和球队。", "New draft started. Draw a season and club."],
    ["已选择加入", "Joined "],
    ["赛前预测：", "Prediction: "],
    ["预计", "Expected"],
    ["场拿到", " matches to earn "],
    ["阵容", " Squad"],
    ["待定", "TBD"],
    ["最佳球员", "Best Player"],
    ["金靴", "Golden Boot"],
    ["最多助攻", "Most Assists"],
    ["球员赛季数据", "Player Season Stats"],
    ["这个位置已经有球员，请先选择空位。", "This slot already has a player. Choose an empty slot."],
    ["不能踢", "cannot play"],
    ["换位失败：两名球员都必须能踢对方的新位置。", "Swap failed: both players must be able to play the new positions."],
    ["换位成功。", "Swap successful."],
    ["阵容完成，请选择参赛联赛。", "Squad complete. Choose your league."],
    ["开始抽取赛季和球队。", "Draw a season and club."],
    ["没有抽到球队，请重新开始抽取。", "No club drawn. Start the draw again."],
    ["先完成抽取，再从抽中的俱乐部挑选球员。", "Complete the draw first, then pick players from the drawn club."],
    ["正在抽取球队...", "Drawing a club..."],
    ["已选择球员，正在抽取下一队...", "Player selected. Drawing the next club..."],
    ["这家俱乐部的候选球员已经被选完了。", "This club candidate pool is exhausted."],
    ["这名球员已经被选中。", "This player is already selected."],
    ["这名球员没有可放的空位。", "No empty slot available for this player."],
    ["可强放，但会降低总评", "Forced placement will lower overall"],
    ["点击球场上可踢的空位", "Click a compatible slot"],
    ["请先开始一场选秀。", "Start a draft first."],
    ["这个赛季没有可抽球队，请换一个赛季。", "No clubs available for this season. Pick another season."],
    ["抽中", "Drew "],
    ["没有可用重转次数。", "No rerolls available."],
    ["这名球员已经不能被选中。", "This player can no longer be selected."],
    ["这名球员没有可踢的空位，请先腾出兼容位置。", "No compatible slot for this player. Free up a slot first."],
    ["先填满 11 个位置。", "Fill all 11 slots first."],
    ["模拟正在进行中。", "Simulation in progress."],
    ["先选择你要加入的联赛。", "Choose your league first."],
    ["赛程生成异常，请刷新后重新开始模拟。", "Schedule generation failed. Refresh and restart the simulation."],
    ["对手", "Opponent"],
    ["未获得欧战资格", "No European qualification"],
    ["欧洲联队", "Europe XI"],
    ["南美全明星", "South America All-Stars"],
    ["非洲联队", "Africa XI"],
    ["亚洲明星队", "Asia All-Stars"],
    ["北美联队", "North America XI"],
    ["世界联队", "World XI"],
    ["传奇十一人", "Legends XI"],
    ["青年军", "Young Guns"],
    ["冠军联队", "Champions XI"],
    ["欧陆豪门", "European Giants"],
    ["美洲冠军", "Americas Champions"],
    ["海湾之星", "Gulf Stars"],
    ["太平洋联队", "Pacific XI"],
    ["伊比利亚明星", "Iberian Stars"],
    ["地中海联队", "Mediterranean XI"],
    ["大西洋联队", "Atlantic XI"],
    ["北欧劲旅", "Nordic Side"],
    ["东欧联队", "Eastern Europe XI"],
    ["中东联队", "Middle East XI"],
    ["无名英雄", "Unknown Hero"],
    ["阵容评分", "Squad Rating"],
    ["球队", "Team"],
    ["队内最佳球员", "Team Best Player"],
    ["名额分配：", "Allocation: "],
    ["我的赛果", "My Results"],
    ["战报已复制", "Report copied"],
    ["复制失败，可以手动复制。", "Copy failed. Copy it manually."],
    ["请选择联赛", "Select League"],
    ["赛季球队老虎机", "Season and Club Slot Machine"],
    ["欧洲赛事", "European Competition"],
    ["欧战结束", "Europe Finished"],
    ["本队", "My Team "],
    ["最终成绩", "Final Result"],
    ["36 队联赛阶段积分表", "36-team League Phase Table"],
    ["最佳射手：", "Top Scorer: "],
    ["联赛第", "League #"],
    ["联赛阶段第", "League Stage R"],
    ["出局", " Eliminated"],
    ["点球", "Penalties"],
    ["加时", "Extra Time"],
    ["晋级", " advance"],
    ["半决赛", "Semifinals"],
    ["已选中", "Selected "],
    ["Global 38-0：", "Global 38-0: "],
    ["我用了", "I used "],
    ["阵容，", " lineup, "],
    ["名。敢来挑战吗？", " Can you beat it?"],
    ["敢来挑战吗？", "Can you beat it?"],
    ["赛季结果", "Season Result"],
    ["已完成", "Completed"],
    ["覆盖 2025-26 赛季五大联赛全部俱乐部和每队 23 人名单，选人组队并模拟完整赛季的足球选秀游戏。", "A football draft game covering all 2025-26 Big Five clubs and 23-man squads. Build a team and simulate a full season."],

    ["五大联赛", "Big Five"],
    ["赛季阵容", "Season Squad"],
    ["世界级阵容", "World-Class Squad"],
    ["队内最佳球员", "Team Best Player"],
    ["联赛阶段出局", "Eliminated in League Phase"],
    ["全球全明星赛季", "Global All-Stars Season"],
    ["请至少选择一个联赛。", "Select at least one league."],
    ["阵容完成，请选择参赛联赛。", "Squad complete. Choose your league."],

    ["欧冠", "UCL"],
    ["欧联", "UEL"],
    ["英格兰", "England"],
    ["西班牙", "Spain"],
    ["意大利", "Italy"],
    ["德国", "Germany"],
    ["法国", "France"],
    ["进入欧冠区", "Champions League Places"],

    ["曼城", "Manchester City"],
    ["利物浦", "Liverpool"],
    ["阿森纳", "Arsenal"],
    ["切尔西", "Chelsea"],
    ["曼联", "Manchester United"],
    ["热刺", "Tottenham Hotspur"],
    ["阿斯顿维拉", "Aston Villa"],
    ["伯恩茅斯", "Bournemouth"],
    ["布伦特福德", "Brentford"],
    ["布莱顿", "Brighton"],
    ["考文垂", "Coventry City"],
    ["水晶宫", "Crystal Palace"],
    ["埃弗顿", "Everton"],
    ["富勒姆", "Fulham"],
    ["赫尔城", "Hull City"],
    ["伊普斯维奇", "Ipswich Town"],
    ["利兹联", "Leeds United"],
    ["纽卡斯尔联", "Newcastle United"],
    ["诺丁汉森林", "Nottingham Forest"],
    ["桑德兰", "Sunderland"],
    ["皇家马德里", "Real Madrid"],
    ["巴塞罗那", "Barcelona"],
    ["马德里竞技", "Atletico Madrid"],
    ["塞维利亚", "Sevilla"],
    ["阿拉维斯", "Alaves"],
    ["毕尔巴鄂竞技", "Athletic Bilbao"],
    ["塞尔塔", "Celta Vigo"],
    ["拉科鲁尼亚", "Deportivo La Coruna"],
    ["埃尔切", "Elche"],
    ["西班牙人", "Espanyol"],
    ["赫塔费", "Getafe"],
    ["莱万特", "Levante"],
    ["马拉加", "Malaga"],
    ["奥萨苏纳", "Osasuna"],
    ["桑坦德竞技", "Racing Santander"],
    ["巴列卡诺", "Rayo Vallecano"],
    ["皇家贝蒂斯", "Real Betis"],
    ["皇家社会", "Real Sociedad"],
    ["瓦伦西亚", "Valencia"],
    ["比利亚雷亚尔", "Villarreal"],
    ["AC米兰", "AC Milan"],
    ["尤文图斯", "Juventus"],
    ["国际米兰", "Inter Milan"],
    ["那不勒斯", "Napoli"],
    ["亚特兰大", "Atalanta"],
    ["博洛尼亚", "Bologna"],
    ["卡利亚里", "Cagliari"],
    ["科莫", "Como"],
    ["佛罗伦萨", "Fiorentina"],
    ["弗罗西诺内", "Frosinone"],
    ["热那亚", "Genoa"],
    ["拉齐奥", "Lazio"],
    ["莱切", "Lecce"],
    ["蒙扎", "Monza"],
    ["帕尔马", "Parma"],
    ["罗马", "Roma"],
    ["萨索洛", "Sassuolo"],
    ["都灵", "Torino"],
    ["乌迪内斯", "Udinese"],
    ["威尼斯", "Venezia"],
    ["拜仁慕尼黑", "Bayern Munich"],
    ["多特蒙德", "Borussia Dortmund"],
    ["勒沃库森", "Bayer Leverkusen"],
    ["奥格斯堡", "Augsburg"],
    ["埃尔弗斯贝格", "Elversberg"],
    ["法兰克福", "Eintracht Frankfurt"],
    ["弗赖堡", "Freiburg"],
    ["门兴格拉德巴赫", "Borussia Monchengladbach"],
    ["汉堡", "Hamburg"],
    ["霍芬海姆", "Hoffenheim"],
    ["科隆", "Cologne"],
    ["美因茨", "Mainz"],
    ["帕德博恩", "Paderborn"],
    ["RB莱比锡", "RB Leipzig"],
    ["沙尔克04", "Schalke 04"],
    ["斯图加特", "Stuttgart"],
    ["柏林联合", "Union Berlin"],
    ["云达不莱梅", "Werder Bremen"],
    ["巴黎圣日耳曼", "Paris Saint-Germain"],
    ["马赛", "Marseille"],
    ["里昂", "Lyon"],
    ["昂热", "Angers"],
    ["欧塞尔", "Auxerre"],
    ["布雷斯特", "Brest"],
    ["勒阿弗尔", "Le Havre"],
    ["勒芒", "Le Mans"],
    ["朗斯", "Lens"],
    ["里尔", "Lille"],
    ["洛里昂", "Lorient"],
    ["摩纳哥", "Monaco"],
    ["尼斯", "Nice"],
    ["巴黎FC", "Paris FC"],
    ["雷恩", "Rennes"],
    ["斯特拉斯堡", "Strasbourg"],
    ["图卢兹", "Toulouse"],
    ["特鲁瓦", "Troyes"],

    ["英超", "Premier League"],
    ["西甲", "La Liga"],
    ["意甲", "Serie A"],
    ["德甲", "Bundesliga"],
    ["法甲", "Ligue 1"],
    ["门将", "GK"],
    ["右后卫", "RB"],
    ["中后卫", "CB"],
    ["左后卫", "LB"],
    ["右翼卫", "RWB"],
    ["左翼卫", "LWB"],
    ["后腰", "CDM"],
    ["中前卫", "CM"],
    ["前腰", "CAM"],
    ["右前卫", "RM"],
    ["左前卫", "LM"],
    ["右边锋", "RW"],
    ["左边锋", "LW"],
    ["中锋", "ST"],
    ["历史战绩", "History"],
    ["新选秀", "New Draft"],
    ["转会窗", "Transfer Window"],
    ["冬季转会窗", "Winter Transfer Window"],
    ["半程转会窗", "Mid-Season Transfer Window"],
    ["进入转会窗", "Enter Transfer Window"],
    ["跳过转会窗", "Skip Transfer Window"],
    ["弱项补强", "Weak-Area"],
    ["自由签约", "Free Signing"],
    ["盲盒签约", "Mystery Signing"],
    ["稳健选择", "Safe Pick"],
    ["未知新援", "Unknown Signing"],
    ["高风险目标", "High-Risk Target"],
    ["打开盲盒", "Open Mystery Box"],
    ["已锁定，必须签下这名球员", "Locked in — this player must be signed"],
    ["随机候选名单", "Random Candidate List"],
    ["重新抽取", "Redraw"],
    ["转会记录", "Transfer Log"],
    ["未进行转会", "No transfers made"],
    ["本次转会窗已跳过。", "Transfer window skipped."],
    ["点击球场上的兼容位置完成转会", "Click a compatible slot to complete the transfer"],
    ["没有可签球员，请重新抽取。", "No eligible player. Redraw."],
    ["没有足够的合格球员完成本次转会。", "Not enough eligible players for this transfer."],
  ];

  const DYNAMIC_RULES = [
    [/(\d+) 分/g, "$1 pts"],
    [/第 (\d+) 名/g, "Rank #$1"],
    [/(\d+) 场/g, "$1 matches"],
    [/(\d+) 球/g, "$1 goals"],
    [/(\d+) 助/g, "$1 assists"],
    [/重转 (\d+) 次/g, "Rerolls: $1"],
    [/使用 (\d+) 次重转/g, "Use $1 reroll(s)"],
    [/模拟 (\d+) 场赛季/g, "Simulate $1-match season"],
    [/模拟赛季/g, "Simulate Season"],
    [/五大联赛/g, "Big Five"],
    [/进球：/g, "Goals: "],
    [/无进球/g, "No goals"],
    [/主队/g, "Home"],
    [/客队/g, "Away"],
    [/可放这里/g, "Place here"],
    [/强放 -/g, "Forced -"],
    [/进攻/g, "Attack"],
    [/中场/g, "Midfield"],
    [/防守/g, "Defense"],
    [/门将/g, "Goalkeeper"],
    [/总评/g, "Overall"],
    [/赛季阵容/g, "Season Squad"],
    [/待定/g, "TBD"],
    [/最佳球员/g, "Best Player"],
    [/金靴/g, "Golden Boot"],
    [/最多助攻/g, "Most Assists"],
    [/球员赛季数据/g, "Player Season Stats"],
    [/进球破百/g, "100 Goals"],
    [/钢铁防线/g, "Iron Defense"],
    [/铁幕防守/g, "Iron Curtain Defense"],
    [/黑马夺冠/g, "Cinderella Champion"],
    [/世界级阵容/g, "World-Class Squad"],
    [/完美赛季/g, "Perfect Season"],
    [/不败赛季/g, "Undefeated Season"],
    [/联赛冠军/g, "League Champion"],
    [/进入欧冠区/g, "Champions League Places"],
    [/排名/g, "Rank"],
    [/积分/g, "Pts"],
    [/净胜球/g, "Goal Diff"],
    [/净胜/g, "GD"],
    [/最佳射手/g, "Top Scorer"],
    [/完成赛季/g, "Season Complete"],
    [/进入附加赛/g, "Knockout Playoff"],
    [/直接进入16强/g, "Direct to Round of 16"],
    [/联赛阶段出局/g, "Eliminated in League Phase"],
    [/进行中/g, "In Progress"],
    [/已完成/g, "Completed"],
    [/未参赛/g, "Not Entered"],
    [/欧洲冠军/g, "European Champion"],
    [/亚军/g, "Runner-Up"],
    [/附加赛/g, "Playoff"],
    [/十六强/g, "Round of 16"],
    [/八强/g, "Quarterfinals"],
    [/四强/g, "Semifinals"],
    [/决赛/g, "Final"],
    [/赛程明细/g, "Fixtures"],
    [/当赛季积分表/g, "League Table"],
    [/最终排名/g, "Final Standings"],
    [/阵容复盘/g, "Squad Review"],
    [/欧洲赛场/g, "Europe"],
    [/欧洲比赛资格/g, "European Qualification"],
    [/冠军/g, "Champion"],
    [/进球/g, "Goals"],
    [/失球/g, "Against"],
    [/场次/g, "P"],
    [/进/g, "GF"],
    [/失/g, "GA"],
    [/胜/g, "W"],
    [/平/g, "D"],
    [/负/g, "L"],
    [/评分/g, "Rating"],
    [/主 vs/g, "Home vs"],
    [/客 vs/g, "Away vs"],
    [/主/g, "Home"],
    [/客/g, "Away"],
    [/(\d+)场/g, "$1 matches"],
    [/(\d+)球/g, "$1 goals"],
    [/(\d+)助/g, "$1 assists"],
    [/(\d+)分/g, "$1 pts"],
    [/(\d+) 场比赛/g, "$1 matches"],
    [/预计 (\d+) 场拿到 (\d+) 分/g, "Expected $1 matches to earn $2 pts"],
    [/联赛第 (\d+) 名/g, "League #$1"],
    [/联赛阶段第 (\d+) 轮/g, "League Stage R$1"],
    [/(\d+\/\d+) 组/g, "$1"],
    [/资格/g, " Qualification"],
    [/(\d+) 净胜/g, "$1 GD"],
    [/(\d+) 分，第 (\d+) 名/g, "$1 pts, Rank #$2"],
    [/名/g, ""],
    [/轮/g, ""],
    [/组/g, ""],
    [/(\d+) 队/g, "$1 teams"],
    [/(\d+)净胜/g, "$1 GD"],
    [/([\w-]+)阵容/g, "$1 Squad"],
    [/第 (\d+)\/2 次转会/g, "Transfer $1/2"],
    [/本次转会方式已抽中：/g, "Transfer method: "],
    [/当前最弱位置：/g, "Weakest area: "],
    [/目标位置：/g, "Target area: "],
    [/转会将替换/g, "This transfer replaces "],
    [/，/g, ", "],
    [/第 (\d+)/g, "Rank #$1"]
  ];

  const translateText = (text) => {
    if (currentLang !== "en" || !text) return text;
    let out = String(text);
    const exactSorted = EXACT_PHRASES.slice().sort((a, b) => b[0].length - a[0].length);
    for (const [zh, en] of exactSorted) out = out.split(zh).join(en);
    const rules = DYNAMIC_RULES.slice().sort((a, b) => String(b[0]).length - String(a[0]).length);
    for (const [pattern, replacement] of rules) out = out.replace(pattern, replacement);
    return out;
  };

  const translateDom = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (currentLang === "en") {
        if (!staticOriginals.has(node)) staticOriginals.set(node, node.nodeValue);
        const translated = translateText(staticOriginals.get(node));
        if (node.nodeValue !== translated) node.nodeValue = translated;
      } else if (staticOriginals.has(node)) {
        node.nodeValue = staticOriginals.get(node);
      }
    });
  };

  const applyLanguage = () => {
    document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
    if (ui.langToggle) ui.langToggle.textContent = currentLang === "en" ? "中文" : "EN";
    document.title = currentLang === "en" ? "Global 38-0 | Global All-Stars" : "Global 38-0 | 全球全明星赛季";
    STATIC_TRANSLATIONS.forEach((item) => {
      const node = document.querySelector(item.sel);
      if (!node) return;
      if (!staticOriginals.has(node)) staticOriginals.set(node, node.textContent);
      node.textContent = currentLang === "en" ? item.en : staticOriginals.get(node);
    });
    translateDom();
  };


  const EUROPE_COMPETITIONS = {
    UCL: { name: "欧洲冠军联赛", champion: "欧冠冠军", runnerUp: "欧冠亚军" },
    UEL: { name: "欧联杯", champion: "欧联杯冠军", runnerUp: "欧联杯亚军" },
    UECL: { name: "欧协联", champion: "欧协联冠军", runnerUp: "欧协联亚军" }
  };
  const PROMOTED_TEAMS = {
    eng: ["Burnley", "Leeds United", "Sunderland"],
    esp: ["Elche CF", "Levante UD", "R. Oviedo"],
    ita: ["Cremonese", "Pisa", "Sassuolo"],
    ger: ["1. FC Köln", "Hamburger SV"],
    fra: ["FC Lorient", "FC Metz", "Paris FC"]
  };
  const ACHIEVEMENT_DETAILS = {
    "完美赛季": ["🏆", "赢下全部联赛比赛", "Win every league match"],
    "不败赛季": ["🛡️", "整个联赛赛季保持不败", "Finish the league season unbeaten"],
    "联赛冠军": ["👑", "以联赛第一名结束赛季", "Finish first in the league"],
    "进入欧冠区": ["⭐", "以联赛排名获得欧冠资格", "Qualify for the Champions League through the league"],
    "进球破百": ["⚽", "联赛进球达到 100 个", "Score at least 100 league goals"],
    "钢铁防线": ["🧱", "联赛失球不超过 20 个", "Concede no more than 20 league goals"],
    "铁幕防守": ["🔒", "联赛失球不超过 10 个", "Concede no more than 10 league goals"],
    "黑马夺冠": ["🐎", "阵容评分不高于 84 时夺冠", "Win the league with a squad rating of 84 or lower"],
    "世界级阵容": ["🌍", "阵容评分达到 90", "Build a squad rated 90 or higher"],
    "国内杯赛冠军": ["🏆", "赢得所属联赛的国内杯赛", "Win the domestic cup for your league"]
  };
  const HISTORICAL_CLUB_IDS = {
    "arsenal": ["arsenal-fc", "arsenal"],
    "chelsea": ["chelsea-fc", "chelsea"],
    "coventry": ["coventry-city"],
    "crystal-palace": ["crystal-palace", "crystal-palace-fc"],
    "everton": ["everton-fc", "everton"],
    "fulham": ["fulham-fc", "fulham"],
    "ipswich": ["ipswich-town"],
    "leeds": ["leeds-united"],
    "liverpool": ["liverpool-fc", "liverpool"],
    "man-city": ["manchester-city", "manchester-city-fc"],
    "man-united": ["manchester-united", "man-utd", "manchester-united-fc"],
    "newcastle": ["newcastle-united", "newcastle-utd", "newcastle-united-fc"],
    "nottingham-forest": ["nottingham-forest", "nott-m-forest", "nottingham-forest-fc"],
    "sunderland": ["sunderland", "sunderland-afc"],
    "tottenham": ["tottenham-hotspur", "spurs", "tottenham-hotspur-fc"],
    "athletic-bilbao": ["athletic-bilbao", "athletic-club"],
    "atletico": ["atl-tico-de-madrid", "atletico-de-madrid", "club-atletico-de-madrid"],
    "barcelona": ["fc-barcelona"],
    "celta": ["celta-de-vigo", "rc-celta-de-vigo"],
    "deportivo": ["deportivo-de-la-coru-a"],
    "espanyol": ["rcd-espanyol-barcelona", "rcd-espanyol"],
    "getafe": ["getafe"],
    "levante": ["levante"],
    "malaga": ["m-laga-cf", "malaga-cf"],
    "osasuna": ["ca-osasuna", "osasuna"],
    "racing-santander": ["racing-santander"],
    "real-betis": ["real-betis-balompi", "real-betis", "real-betis-balompie"],
    "real-madrid": ["real-madrid", "real-madrid-cf"],
    "real-sociedad": ["real-sociedad", "real-sociedad-de-futbol"],
    "sevilla": ["sevilla-fc", "sevilla"],
    "valencia": ["valencia-cf", "valencia"],
    "villarreal": ["villarreal-cf", "villarreal"],
    "ac-milan": ["ac-milan"],
    "atalanta": ["atalanta-bc", "bergamo-calcio"],
    "bologna": ["bologna-fc-1909", "bologna"],
    "cagliari": ["cagliari", "cagliari-calcio"],
    "fiorentina": ["firenze", "fiorentina", "acf-fiorentina"],
    "inter": ["inter-milan", "lombardia-fc", "fc-internazionale-milano"],
    "juventus": ["juventus-fc", "juventus"],
    "lazio": ["ss-lazio", "lazio"],
    "lecce": ["us-lecce", "lecce"],
    "napoli": ["ssc-napoli"],
    "parma": ["ac-parma", "parma", "parma-calcio-1913"],
    "roma": ["as-roma"],
    "udinese": ["udinese-calcio", "udinese"],
    "bayern": ["bayern-munich", "fc-bayern-munchen"],
    "dortmund": ["borussia-dortmund"],
    "frankfurt": ["eintracht-frankfurt"],
    "freiburg": ["sc-freiburg", "sport-club-freiburg"],
    "gladbach": ["borussia-m-nchengladbach", "monchengladbach"],
    "hamburg": ["hamburger-sv", "hamburger-sport-verein"],
    "koln": ["1-fc-k-ln"],
    "leverkusen": ["bayer-04-leverkusen", "bayer-leverkusen"],
    "mainz": ["1-fsv-mainz-05"],
    "schalke": ["fc-schalke-04"],
    "stuttgart": ["vfb-stuttgart"],
    "werder-bremen": ["sv-werder-bremen"],
    "auxerre": ["aj-auxerre"],
    "lemans": ["le-mans-union-club-72"],
    "lens": ["rc-lens"],
    "lille": ["losc-lille", "lille-osc"],
    "lyon": ["olympique-lyon", "ol", "olympique-lyonnais"],
    "marseille": ["olympique-marseille", "marseille", "om", "olympique-de-marseille"],
    "monaco": ["as-monaco", "as-monaco-fc"],
    "nice": ["ogc-nice"],
    "psg": ["paris-saint-germain", "paris-sg"],
    "rennes": ["stade-rennais-fc", "rennes", "stade-rennais"],
    "strasbourg": ["rc-strasbourg-alsace"],
    "toulouse": ["fc-toulouse"]
  };

  const ELITE_STRENGTH = {
    "man-city": 89,
    "liverpool": 88,
    "arsenal": 86,
    "chelsea": 85,
    "man-united": 84,
    "tottenham": 83,
    "newcastle": 82,
    "real-madrid": 89,
    "barcelona": 91,
    "atletico": 86,
    "sevilla": 82,
    "athletic-bilbao": 81,
    "real-sociedad": 80,
    "villarreal": 80,
    "valencia": 79,
    "inter": 88,
    "juventus": 87,
    "ac-milan": 86,
    "napoli": 85,
    "roma": 83,
    "lazio": 82,
    "atalanta": 83,
    "bayern": 89,
    "leverkusen": 86,
    "dortmund": 86,
    "rb-leipzig": 84,
    "stuttgart": 82,
    "frankfurt": 82,
    "psg": 88,
    "monaco": 84,
    "marseille": 82,
    "lille": 81,
    "lyon": 81,
    "nice": 81
  };
  const state = {
    selectedLeagues: new Set(["eng", "esp", "ita", "ger", "fra"]),
    game: null,
    viewingRun: null,
    selectedSlotIndex: null,
    pendingDraftPlayerId: null,
    autoSpinPending: false,
    spinning: false,
    transfer: null
  };

  const ui = {
    leagueGrid: $("#leagueGrid"),
    heroStats: $("#heroStats"),
    homeHistoryList: $("#homeHistoryList"),
    seasonRangeStart: $("#seasonRangeStart"),
    seasonRangeEnd: $("#seasonRangeEnd"),
    seasonRangeStartLabel: $("#seasonRangeStartLabel"),
    seasonRangeEndLabel: $("#seasonRangeEndLabel"),
    seasonRangeFill: $("#seasonRangeFill"),
    difficultySelect: $("#difficultySelect"),
    langToggle: $("#langToggle"),
    hideRatingsSelect: $("#hideRatingsSelect"),
    formationSelect: $("#formationSelect"),
    leagueChoice: $("#leagueChoice"),
    leagueChoiceOptions: $("#leagueChoiceOptions"),
    seasonPrediction: $("#seasonPrediction"),
    coachChoice: $("#coachChoice"),
    simulationPanel: $("#simulationPanel"),
    simulationProgress: $("#simulationProgress"),
    simulationCurrent: $("#simulationCurrent"),
    simulationLatest: $("#simulationLatest"),
    transferPanel: $("#transferPanel"),
    transferTitle: $("#transferTitle"),
    transferProgress: $("#transferProgress"),
    transferIntro: $("#transferIntro"),
    transferContent: $("#transferContent"),
    transferWeakText: $("#transferWeakText"),
    transferHalfSummary: $("#transferHalfSummary"),
    transferModeText: $("#transferModeText"),
    transferStatus: $("#transferStatus"),
    transferLog: $("#transferLog"),
    enterTransferBtn: $("#enterTransferBtn"),
    skipTransferBtn: $("#skipTransferBtn"),
    resultLineupPanel: $("#resultLineupPanel"),
    resultLineupTitle: $("#resultLineupTitle"),
    resultLineupRating: $("#resultLineupRating"),
    resultLineupField: $("#resultLineupField"),
    resultLineupInfo: $("#resultLineupInfo"),
    resultTablePanel: $("#resultTablePanel"),
    resultTableLeague: $("#resultTableLeague"),
    leagueTable: $("#leagueTable"),
    domesticCupPanel: $("#domesticCupPanel"),
    domesticCupTitle: $("#domesticCupTitle"),
    domesticCupStatus: $("#domesticCupStatus"),
    domesticCupResults: $("#domesticCupResults"),
    resultStarsPanel: $("#resultStarsPanel"),
    awardStats: $("#awardStats"),
    playerStats: $("#playerStats"),
    europePanel: $("#europePanel"),
    europeTitle: $("#europeTitle"),
    europeStatus: $("#europeStatus"),
    europeStartBtn: $("#europeStartBtn"),
    europeResults: $("#europeResults"),
    pitchField: $("#pitchField"),
    formationTitle: $("#formationTitle"),
    gameProgress: $("#gameProgress"),
    gameLeagueLabel: $("#gameLeagueLabel"),
    rerollChip: $("#rerollChip"),
    teamRating: $("#teamRating"),
    unitRatings: $("#unitRatings"),
    simulateBtn: $("#simulateBtn"),
    spinBtn: $("#spinBtn"),
    rerollBtn: $("#rerollBtn"),
    spinResult: $("#spinResult"),
    candidates: $("#candidates"),
    toast: $("#toast")
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = translateText(text);
    return node;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const leagueTeamCount = (leagueId) => (leagueId === "ger" || leagueId === "fra" ? 18 : 20);
  const leagueMatchCount = (leagueId) => (leagueTeamCount(leagueId) - 1) * 2;
  const expectedPointsForRating = (rating, played) => {
    const base = rating >= 80 ? 71 + (rating - 80) * 4.8 : 42 + (rating - 76) * 7.25;
    return clamp(Math.round(base), 18, Math.max(18, played * 3 - 8));
  };
  const rankFromPoints = (points, size) => {
    const topPoints = size >= 20 ? 85 : 80;
    const step = size >= 20 ? 4.2 : 4.5;
    return clamp(1 + Math.round((topPoints - points) / step), 1, size);
  };
  const getLeagueTeams = (game) => {
    const season = simulationSeason(game);
    const real = clubsForLeague(game?.league, season).map((club) => club.name);
    if (!real.length) return ["我的球队"];
    const rng = makeRng(hashSeed(`replace-${game?.id}-${game?.league}`));
    const promoted = (PROMOTED_TEAMS[game?.league] || []).filter((name) => real.includes(name));
    const replaceName = promoted.length
      ? promoted[Math.floor(rng() * promoted.length)]
      : real[Math.floor(rng() * real.length)];
    return real.map((name) => (name === replaceName ? "我的球队" : name));
  };

  const uid = () => {
    if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const createRandomSeed = (value = uid()) => {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      return crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
    }
    return hashSeed(`${value}|${Date.now()}|${Math.random()}`);
  };

  function ensureGameRandomState(game) {
    if (!game) return 0;
    if (!Number.isInteger(game.randomSeed)) game.randomSeed = hashSeed(`game-rng|${game.id || game.createdAt || "legacy"}`);
    if (!Number.isInteger(game.randomState)) game.randomState = game.randomSeed >>> 0;
    return game.randomState >>> 0;
  }

  function nextGameRandom(game) {
    const stateValue = ensureGameRandomState(game);
    game.randomState = G38SimulationCore.nextRandomState(stateValue);
    game.randomDraws = Number(game.randomDraws || 0) + 1;
    return game.randomState / 4294967296;
  }

  const gameRng = (game) => () => nextGameRandom(game);

  const getLeague = (id) => LEAGUES.find((l) => l.id === id);
  const getSeasonData = (season) => {
    const targetSeason = season || CURRENT_DATA_SEASON;
    if (typeof SEASON_PLAYERS !== "undefined" && SEASON_PLAYERS[targetSeason]) return SEASON_PLAYERS[targetSeason];
    if (typeof LEGACY_SEASONS !== "undefined" && LEGACY_SEASONS[targetSeason]) return LEGACY_SEASONS[targetSeason];
    if (typeof SEASON_PLAYERS !== "undefined" && SEASON_PLAYERS[CURRENT_DATA_SEASON]) return SEASON_PLAYERS[CURRENT_DATA_SEASON];
    return { source: `${CURRENT_DATA_SEASON} 五大联赛球员数据`, clubs: Object.values(CLUBS) };
  };
  const findClubInSeason = (id, season) => {
    const data = getSeasonData(season);
    const direct = data.clubs.find((club) => club.id === id);
    if (direct) return direct;
    const aliases = HISTORICAL_CLUB_IDS[id] || [];
    for (const alias of aliases) {
      const historical = data.clubs.find((club) => club.id === alias);
      if (historical) return historical;
    }
    const current = CLUBS[id];
    if (!current) return null;
    const byShort = data.clubs.filter((club) => club.league === current.league && club.short === current.short);
    return byShort.length === 1 ? byShort[0] : null;
  };
  const getClub = (id, season) => {
    const data = getSeasonData(season);
    const seasonal = findClubInSeason(id, season);
    if (seasonal) return seasonal;
    const current = CLUBS[id];
    const aliases = HISTORICAL_CLUB_IDS[id] || [];
    if (season && season !== CURRENT_DATA_SEASON) {
      const targetYear = Number(String(season).slice(0, 4)) || 0;
      const ids = new Set([id, ...aliases]);
      const matches = [];
      const sources = [];
      if (typeof LEGACY_SEASONS !== "undefined") sources.push(LEGACY_SEASONS);
      if (typeof SEASON_PLAYERS !== "undefined") sources.push(SEASON_PLAYERS);
      sources.forEach((source) => {
        Object.entries(source).forEach(([key, entry]) => {
          if (key === CURRENT_DATA_SEASON || !entry?.clubs) return;
          const club = entry.clubs.find((c) => ids.has(c.id));
          if (club) matches.push({ year: Number(String(key).slice(0, 4)) || 0, club });
        });
      });
      matches.sort((a, b) => Math.abs(a.year - targetYear) - Math.abs(b.year - targetYear) || a.year - b.year);
      if (matches.length) return matches[0].club;
    }
    return current || data.clubs[0];
  };
  const clubsForLeague = (id, season = CURRENT_DATA_SEASON) => getSeasonData(season).clubs.filter((c) => c.league === id);
  const allClubs = (season) => getSeasonData(season).clubs;
  const simulationSeason = () => CURRENT_DATA_SEASON;
  const isRatingsHidden = (game) => Boolean(game?.hideRatings && game.draftedPlayers.length < game.slots.length);

  const pruneData = () => {
    LEAGUES.splice(0, LEAGUES.length, ...LEAGUES.filter((league) => BIG_FIVE_IDS.has(league.id)));
    Object.keys(CLUBS).forEach((id) => {
      if (!BIG_FIVE_IDS.has(CLUBS[id].league)) delete CLUBS[id];
    });
  };

  const SEASON_KEYS = [];
  for (let start = 1992; start <= 2025; start += 1) {
    const end = start + 1;
    SEASON_KEYS.push(`${start}-${String(end % 100).padStart(2, "0")}`);
  }
  const seasonIndexToKey = (index) => SEASON_KEYS[clamp(index, 0, SEASON_KEYS.length - 1)];
  const seasonKeyToIndex = (key) => Math.max(0, SEASON_KEYS.indexOf(key));
  const randomSeasonInRange = (range, rng) => {
    const start = range
      ? seasonKeyToIndex(range.start)
      : Number(ui.seasonRangeStart.value || 0);
    const end = range
      ? seasonKeyToIndex(range.end)
      : Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1);
    return seasonIndexToKey(start + Math.floor(rng() * (Math.max(0, end - start) + 1)));
  };
  const seasonsInRange = (range) => {
    const start = range ? seasonKeyToIndex(range.start) : 0;
    const end = range ? seasonKeyToIndex(range.end) : SEASON_KEYS.length - 1;
    return SEASON_KEYS.slice(Math.min(start, end), Math.max(start, end) + 1);
  };
  const seasonRangeText = () => `${seasonIndexToKey(Number(ui.seasonRangeStart.value || 0))} 至 ${seasonIndexToKey(Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1))}`;

  const initSeasonRange = () => {
    const max = SEASON_KEYS.length - 1;
    ui.seasonRangeStart.min = "0";
    ui.seasonRangeStart.max = String(max);
    ui.seasonRangeStart.value = "0";
    ui.seasonRangeEnd.min = "0";
    ui.seasonRangeEnd.max = String(max);
    ui.seasonRangeEnd.value = String(max);
    updateSeasonRangeLabels();
  };

  const updateSeasonRangeLabels = (active = null) => {
    const max = SEASON_KEYS.length - 1;
    let start = Number(ui.seasonRangeStart.value || 0);
    let end = Number(ui.seasonRangeEnd.value || max);
    if (active === "start" && start > end) {
      ui.seasonRangeStart.value = String(end);
      start = end;
    }
    if (active === "end" && end < start) {
      ui.seasonRangeEnd.value = String(start);
      end = start;
    }
    ui.seasonRangeStartLabel.textContent = seasonIndexToKey(start);
    ui.seasonRangeEndLabel.textContent = seasonIndexToKey(end);
    if (ui.seasonRangeFill) {
      const total = Math.max(1, max);
      ui.seasonRangeFill.style.left = String((start / total) * 100) + "%";
      ui.seasonRangeFill.style.width = String(((end - start) / total) * 100) + "%";
    }
    renderHeroStats();
  };

  let memoryStore = {};
  let dbPromise = null;

  function openStorageDB() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('no indexedDB'));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('g38-storage', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  function persistValue(key, value) {
    openStorageDB()
      .then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }))
      .catch(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore localStorage quota errors; IndexedDB is the primary store.
        }
      });
  }

  async function loadStorage() {
    try {
      const db = await openStorageDB();
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();
      const keys = await new Promise((resolve, reject) => {
        keysRequest.onsuccess = () => resolve(keysRequest.result || []);
        keysRequest.onerror = () => reject(keysRequest.error);
      });
      const values = await new Promise((resolve, reject) => {
        valuesRequest.onsuccess = () => resolve(valuesRequest.result || []);
        valuesRequest.onerror = () => reject(valuesRequest.error);
      });
      keys.forEach((key, index) => {
        if (index < values.length) memoryStore[key] = values[index];
      });
    } catch {
      // IndexedDB unavailable: fall back to old localStorage data below.
    }
    [STORAGE_GAME, STORAGE_RUNS].forEach((key) => {
      if (key in memoryStore) return;
      try {
        const value = localStorage.getItem(key);
        if (value) memoryStore[key] = JSON.parse(value);
      } catch {
        // Ignore missing or corrupt legacy entries.
      }
    });
  }

  const safeGet = (key) => (key in memoryStore ? memoryStore[key] : null);

  const safeSet = (key, value) => {
    memoryStore[key] = value;
    persistValue(key, value);
    return true;
  };

  function isSelfMatch(match) {
    if (!match) return false;
    if (match.opponent === "我的球队") return true;
    return String(match.home || "") === "我的球队" && String(match.away || "") === "我的球队";
  }

  function isBadRun(run) {
    const result = run?.result;
    if (!result || !Array.isArray(result.matches)) return false;
    return result.matches.some(isSelfMatch);
  }

  function isStaleSimulationResult(run) {
    return Boolean(run?.result && run.result.simVersion !== SIM_VERSION);
  }

  function isStaleEuropeResult(run) {
    return Boolean(run?.europeResult && run.europeResult.listVersion !== EUROPE_LIST_VERSION);
  }

  function clearStaleEuropeResult(run) {
    if (isStaleEuropeResult(run)) {
      run.europeResult = null;
      run.europeSim = null;
    }
  }

  const toast = (message) => {
    ui.toast.textContent = translateText(message);
    ui.toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => ui.toast.classList.remove("show"), 2600);
  };


  function toggleLanguage() {
    currentLang = currentLang === "en" ? "zh" : "en";
    localStorage.setItem(LANG_KEY, currentLang);
    applyLanguage();
    renderLeagueGrid();
    renderHeroStats();
    renderHomeHistory();
    if (state.game) {
      renderGame();
      renderPitch();
      renderCandidates();
      renderTeamRating();
      if (state.transfer) {
        const directMode = state.transfer.mode === "free" || state.transfer.mode === "mystery";
        ui.transferPanel.classList.remove("hidden");
        ui.simulationPanel.classList.add("hidden");
        document.querySelector(".wheel-card")?.classList.toggle("hidden", directMode);
        ui.rerollBtn.classList.toggle("hidden", directMode);
        renderTransferIntro();
        renderTransferHeader();
        renderTransferSpinResult();
      }
    }
    if (state.viewingRun) renderResult(state.viewingRun);
    setTimeout(translateDom, 0);
  }

  async function init() {
    await loadStorage();
    pruneData();
    initSeasonRange();
    renderLeagueGrid();
    renderHeroStats();
    renderHomeHistory();
    applyLanguage();
    if (typeof MutationObserver !== "undefined") {
      new MutationObserver(() => {
        if (currentLang === "en") {
          clearTimeout(window.__g38LangTimer);
          window.__g38LangTimer = setTimeout(translateDom, 0);
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    bindEvents();
    loadSavedGame();
    if (state.game) renderGame();
    drawWheel();
  }

  function bindEvents() {
    ui.langToggle.addEventListener("click", toggleLanguage);
    $("#startBtn").addEventListener("click", startGame);
    $("#newGameBtn").addEventListener("click", showNewGameSetup);
    $("#historyBtn").addEventListener("click", showHomeHistory);
    $("#backSetupBtn").addEventListener("click", () => showView("setup"));
    $("#backGameBtn").addEventListener("click", goBackFromResult);
    $("#enterTransferBtn").addEventListener("click", enterTransferWindow);
    $("#skipTransferBtn").addEventListener("click", skipTransferWindow);
    $("#toggleAllLeagues").addEventListener("click", toggleAllLeagues);
    $("#spinBtn").addEventListener("click", spinWheel);
    $("#rerollBtn").addEventListener("click", reroll);
    $("#simulateBtn").addEventListener("click", simulateSeason);
    $("#shareBtn").addEventListener("click", shareResult);
    $("#europeStartBtn").addEventListener("click", startEuropeanTournament);
    $("#formationSelect").addEventListener("change", () => {
      const inGameView = !document.querySelector("#gameView").classList.contains("hidden");
      if (state.game && state.game.draftedPlayers.length === 0 && inGameView) {
        rebuildGameSlots();
      }
    });
    ui.seasonRangeStart.addEventListener("input", () => updateSeasonRangeLabels("start"));
    ui.seasonRangeEnd.addEventListener("input", () => updateSeasonRangeLabels("end"));
    document.querySelector(".brand").addEventListener("click", (e) => {
      e.preventDefault();
      showView("setup");
      renderHomeHistory();
    });
  }

  function renderLeagueGrid() {
    ui.leagueGrid.innerHTML = "";
    LEAGUES.forEach((league) => {
      const button = el("button", "league-option", "");
      button.type = "button";
      button.dataset.league = league.id;
      const code = el("span", "league-code", league.code);
      code.style.background = league.color;
      const copy = el("span", "", "");
      copy.appendChild(el("strong", "", league.name));
      copy.appendChild(el("small", "", `${league.country} · ${clubsForLeague(league.id).length} 队`));
      const input = el("input", "", "");
      input.type = "checkbox";
      input.checked = state.selectedLeagues.has(league.id);
      button.append(input, code, copy);
      button.addEventListener("click", () => toggleLeague(league.id));
      ui.leagueGrid.appendChild(button);
    });
    syncLeagueButtons();
  }

  function toggleLeague(id) {
    if (state.selectedLeagues.has(id)) {
      state.selectedLeagues.delete(id);
    } else {
      state.selectedLeagues.add(id);
    }
    syncLeagueButtons();
    drawWheel();
  }

  function toggleAllLeagues() {
    if (state.selectedLeagues.size === LEAGUES.length) {
      state.selectedLeagues.clear();
    } else {
      state.selectedLeagues = new Set(LEAGUES.map((l) => l.id));
    }
    syncLeagueButtons();
    drawWheel();
  }

  function syncLeagueButtons() {
    document.querySelectorAll(".league-option").forEach((button) => {
      const id = button.dataset.league;
      button.classList.toggle("active", state.selectedLeagues.has(id));
      button.querySelector("input").checked = state.selectedLeagues.has(id);
    });
  }

  function renderHeroStats() {
    const bigFive = ["eng", "esp", "ita", "ger", "fra"];
    const season = seasonIndexToKey(Number(ui.seasonRangeEnd?.value || SEASON_KEYS.length - 1));
    const bigClubs = bigFive.flatMap((id) => clubsForLeague(id, season));
    const bigPlayers = new Set(bigClubs.flatMap((c) => c.players.map((p) => `${c.id}-${p.name}`)));
    const allPlayers = new Set(allClubs(season).flatMap((c) => c.players.map((p) => `${c.id}-${p.name}`)));
    ui.heroStats.innerHTML = "";
    [
      [5, "大联赛"],
      [bigClubs.length, "本季球队"],
      [bigPlayers.size, "本季球员"],
      [allPlayers.size, "可抽球员"]
    ].forEach(([value, label]) => {
      const item = el("div", "", "");
      item.appendChild(el("strong", "", String(value)));
      item.appendChild(el("span", "", label));
      ui.heroStats.appendChild(item);
    });
  }

  function renderHomeHistory() {
    const runs = loadRuns();
    ui.homeHistoryList.innerHTML = "";
    if (!runs.length) {
      ui.homeHistoryList.appendChild(el("div", "history-empty", "还没有赛季记录，先开始一场选秀吧。"));
      return;
    }
    runs.slice(0, 8).forEach((run) => {
      const card = el("button", "history-card", "");
      card.type = "button";
      card.appendChild(el("strong", "", run.formation));
      const res = run.result || {};
      card.appendChild(el("span", "record-line", `${res.wins ?? 0}-${res.draws ?? 0}-${res.losses ?? 0} · ${res.points ?? 0} 分`));
      card.appendChild(el("span", "", `第 ${res.finish ?? "-"} 名 · 评分 ${res.teamRating ?? "--"}`));
      card.appendChild(el("span", "", new Date(run.createdAt).toLocaleString("zh-CN")));
      card.addEventListener("click", () => viewRun(run));
      ui.homeHistoryList.appendChild(card);
    });
  }

  function showHomeHistory() {
    showView("setup");
    renderHomeHistory();
    setTimeout(() => {
      const panel = document.querySelector(".history-home");
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function showNewGameSetup() {
    state.transfer = null;
    showView("setup");
    renderHomeHistory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadSavedGame() {
    const saved = safeGet(STORAGE_GAME);
    if (
      saved
      && saved.slots
      && saved.phase === "drafting"
      && getSeasonData(saved.season).clubs.length
    ) {
      ensureGameRandomState(saved);
      if (!saved.seasonRange) {
        saved.seasonRange = { start: "1992-93", end: "2025-26" };
      }
      if (isBadRun(saved)) {
        saved.result = null;
        saved.simulation = null;
        safeSet(STORAGE_GAME, saved);
      }
      if (isStaleEuropeResult(saved)) {
        saved.europeResult = null;
        saved.europeSim = null;
        safeSet(STORAGE_GAME, saved);
      }
      if (isStaleSimulationResult(saved)) {
        saved.result = null;
        saved.simulation = null;
        saved.europeResult = null;
        saved.europeSim = null;
        safeSet(STORAGE_GAME, saved);
      }
      state.game = saved;
      state.selectedSlotIndex = null;
      state.pendingDraftPlayerId = null;
    }
  }

  function saveGame() {
    if (state.game) safeSet(STORAGE_GAME, state.game);
  }

  function startGame() {
    if (!state.selectedLeagues.size) {
      toast("请至少选择一个联赛。");
      return;
    }
    const formation = ui.formationSelect.value;
    const slots = FORMATIONS[formation].map((slot, index) => ({
      ...slot,
      id: `slot-${index}`,
      player: null
    }));
    const gameId = uid();
    const randomSeed = createRandomSeed(gameId);
    state.game = {
      id: gameId,
      createdAt: Date.now(),
      leagues: [...state.selectedLeagues],
      seasonRange: {
        start: seasonIndexToKey(Number(ui.seasonRangeStart.value || 0)),
        end: seasonIndexToKey(Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1))
      },
      season: null,
      league: null,
      difficulty: ui.difficultySelect.value,
      hideRatings: ui.hideRatingsSelect.value === "1",
      formation,
      slots,
      draftedPlayers: [],
      currentSpin: null,
      candidates: [],
      rerolls: REROLL_BUDGET[ui.difficultySelect.value],
      coachId: null,
      coachCandidates: [],
      randomSeed,
      randomState: randomSeed,
      randomDraws: 0,
      selectedSlotIndex: null,
      phase: "drafting",
      result: null
    };
    const rng = gameRng(state.game);
    state.game.season = randomSeasonInRange(state.game.seasonRange, rng);
    state.game.coachCandidates = shuffleWithRng(Object.keys(COACHES), rng).slice(0, 3);
    state.selectedSlotIndex = null;
    state.pendingDraftPlayerId = null;
    state.autoSpinPending = false;
    state.viewingRun = null;
    state.transfer = null;
    saveGame();
    renderGame();
    toast("新选秀已开始，请抽取赛季和球队。");
  }

  function rebuildGameSlots() {
    if (!state.game) return;
    const formation = ui.formationSelect.value;
    state.game.formation = formation;
    state.game.slots = FORMATIONS[formation].map((slot, index) => ({
      ...slot,
      id: `slot-${index}`,
      player: null
    }));
    state.game.draftedPlayers = [];
    state.game.candidates = [];
    state.game.league = null;
    state.selectedSlotIndex = null;
    state.pendingDraftPlayerId = null;
    state.autoSpinPending = false;
    state.game.coachId = null;
    saveGame();
    renderGame();
  }

  function showView(name) {
    ["setupView", "gameView", "resultView"].forEach((id) => {
      document.getElementById(id).classList.toggle("hidden", id !== `${name}View`);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderGame() {
    const game = state.game;
    if (!game) return;
    ui.formationTitle.textContent = game.formation;
    ui.gameProgress.textContent = `${game.draftedPlayers.length}/${game.slots.length}`;
    const rangeText = game.seasonRange
      ? `${game.seasonRange.start} - ${game.seasonRange.end}`
      : game.season;
    ui.gameLeagueLabel.textContent = game.leagues.length === LEAGUES.length
      ? `五大联赛 · ${rangeText}`
      : `${game.leagues.map((id) => getLeague(id)?.name).filter(Boolean).join(" / ")} · ${rangeText}`;
    document.querySelector(".game-layout")?.classList.remove("hidden");
    ui.rerollChip.textContent = `重转 ${game.rerolls} 次`;
    ui.simulateBtn.disabled = game.draftedPlayers.length < 11 || !game.league;
    ui.simulateBtn.textContent = game.league
      ? `模拟 ${leagueMatchCount(game.league)} 场赛季`
      : "模拟赛季";
    ui.simulationPanel.classList.add("hidden");
    ui.transferPanel.classList.add("hidden");
    ui.rerollBtn.classList.remove("hidden");
    ui.rerollBtn.textContent = uiText("使用 1 次重转", "Use Reroll");
    updateSpinControls();
    ui.leagueChoice.classList.toggle("hidden", game.draftedPlayers.length < game.slots.length);
    if (game.draftedPlayers.length >= game.slots.length) {
      renderLeagueChoice();
    }
    if (!game.currentSpin) drawWheel();
    renderPitch();
    renderSpinResult();
    renderCandidates();
    renderTeamRating();
    showView("game");
  }

  function updateSpinControls() {
    const game = state.game;
    if (state.transfer) {
      const transfer = state.transfer;
      if (transfer.mode === "free" || transfer.mode === "mystery") {
        ui.spinBtn.disabled = true;
        ui.rerollBtn.disabled = true;
        return;
      }
      const hasSpin = Boolean(transfer.currentSpin);
      const selected = Boolean(transfer.selectedCandidateId);
      ui.spinBtn.disabled = Boolean(state.spinning) || hasSpin;
      ui.rerollBtn.disabled = Boolean(state.spinning) || !hasSpin || transfer.candidates.length > 0 || selected;
      ui.rerollBtn.textContent = uiText("重新抽取", "Redraw");
      return;
    }
    const locked = Boolean(
      game
      && game.currentSpin
      && !game.currentSpin.drafted
      && game.candidates.length
    );
    ui.spinBtn.disabled = locked || Boolean(state.spinning);
    ui.rerollBtn.disabled = game?.rerolls <= 0 || Boolean(state.spinning);
    if (state.autoSpinPending) {
      ui.spinBtn.disabled = true;
      ui.rerollBtn.disabled = true;
    }
  }

  function renderLeagueChoice() {
    const game = state.game;
    if (!game || !ui.leagueChoiceOptions) return;
    ui.leagueChoiceOptions.innerHTML = "";
    LEAGUES.forEach((league) => {
      const button = el("button", "league-choice-option", "");
      button.type = "button";
      if (game.league === league.id) button.classList.add("active");
      button.appendChild(el("span", "league-code", league.code));
      button.appendChild(el("strong", "", league.name));
      button.appendChild(el("small", "", league.country));
      button.addEventListener("click", () => {
        game.league = league.id;
        ui.simulateBtn.textContent = `模拟 ${leagueMatchCount(game.league)} 场赛季`;
        saveGame();
        renderLeagueChoice();
        toast(`已选择加入 ${league.name}`);
      });
      ui.leagueChoiceOptions.appendChild(button);
    });
    renderSeasonPrediction();
    renderCoachChoice();
  }

  function getCoach(game) {
    return game?.coachId ? COACHES[game.coachId] || null : null;
  }

  function ensureCoachCandidates(game) {
    const validIds = Object.keys(COACHES);
    const existing = Array.isArray(game?.coachCandidates)
      ? [...new Set(game.coachCandidates.filter((id) => validIds.includes(id)))].slice(0, 3)
      : [];
    if (existing.length === 3 && (!game.coachId || existing.includes(game.coachId))) return existing;
    const selected = game.coachId && validIds.includes(game.coachId) ? [game.coachId] : [];
    const remaining = shuffleWithRng(validIds.filter((id) => !selected.includes(id)), gameRng(game));
    game.coachCandidates = [...selected, ...remaining].slice(0, 3);
    saveGame();
    return game.coachCandidates;
  }

  function renderCoachChoice() {
    const game = state.game;
    if (!ui.coachChoice) return;
    ui.coachChoice.innerHTML = "";
    const head = el("div", "coach-choice-head", "");
    head.appendChild(el("p", "eyebrow", uiText("教练试用", "Coaching Trial")));
    head.appendChild(el("h3", "", uiText("选择主教练", "Choose Your Coach")));
    ui.coachChoice.appendChild(head);
    if (!game?.league) {
      ui.coachChoice.appendChild(el("p", "coach-choice-note", uiText("请先选择参赛联赛，再聘请试用教练。", "Choose a league before appointing the trial coach.")));
      return;
    }
    const cards = el("div", "coach-cards", "");
    const selectCoach = (coachId) => {
      game.coachId = coachId;
      saveGame();
      renderCoachChoice();
      renderSeasonPrediction();
      ui.simulateBtn.disabled = false;
      const coach = getCoach(game);
      toast(coach
        ? uiText(`已聘请${coach.name}。`, `${coach.nameEn} appointed.`)
        : uiText("本赛季将不聘请教练。", "No coach appointed for this season."));
    };
    const noCoach = el("button", "coach-card coach-card-none", "");
    noCoach.type = "button";
    noCoach.classList.toggle("selected", !game.coachId);
    noCoach.appendChild(el("span", "coach-style", uiText("自由执教", "Independent Setup")));
    noCoach.appendChild(el("strong", "", uiText("不选择教练", "No Coach")));
    noCoach.appendChild(el("small", "", uiText("以现有阵容直接开始赛季。", "Start the season with the squad as it is.")));
    noCoach.appendChild(el("span", "coach-action", !game.coachId
      ? uiText("当前选择 · 可开始赛季", "Current choice · Ready for season")
      : uiText("以无教练开始", "Start without a coach")));
    noCoach.addEventListener("click", () => selectCoach(null));
    cards.appendChild(noCoach);
    ensureCoachCandidates(game).map((id) => COACHES[id]).filter(Boolean).forEach((coach) => {
      const card = el("button", "coach-card", "");
      card.type = "button";
      const selected = game.coachId === coach.id;
      card.classList.toggle("selected", selected);
      card.appendChild(el("span", "coach-style", uiText(coach.style, coach.styleEn)));
      card.appendChild(el("strong", "", uiText(coach.name, coach.nameEn)));
      card.appendChild(el("small", "", uiText(coach.description, coach.descriptionEn)));
      card.appendChild(el("span", "coach-action", selected
        ? uiText("已聘请 · 可开始赛季", "Appointed · Ready for season")
        : uiText("聘请这名教练", "Appoint this coach")));
      card.addEventListener("click", () => selectCoach(coach.id));
      cards.appendChild(card);
    });
    ui.coachChoice.appendChild(cards);
  }

  function renderSeasonPrediction() {
    const game = state.game;
    ui.seasonPrediction.innerHTML = "";
    if (!game?.league) return;
    const rating = applyCoachToProfile(calcTeamProfile(game), getCoach(game)).overall || 80;
    const matches = leagueMatchCount(game.league);
    const predictedPoints = expectedPointsForRating(rating, matches);
    const predictedRank = clamp(Math.round(1 + (matches * 3 * 0.88 - predictedPoints) / 6.5), 1, leagueTeamCount(game.league));
    const box = el("div", "prediction-card", "");
    box.appendChild(el("strong", "", `赛前预测：第 ${predictedRank} 名`));
    box.appendChild(el("span", "", `预计 ${matches} 场拿到 ${predictedPoints} 分`));
    ui.seasonPrediction.appendChild(box);
  }

  function renderPitch() {
    const game = state.game;
    const hidden = isRatingsHidden(game);
    ui.pitchField.innerHTML = "";
    const pending = game.candidates.find((p) => p.id === state.pendingDraftPlayerId) || null;
    const selectedSlot = state.selectedSlotIndex !== null ? game.slots[state.selectedSlotIndex] : null;
    const swapMode = Boolean(!pending && selectedSlot && selectedSlot.player);
    const transfer = state.transfer;
    const transferCandidate = transfer?.selectedCandidateId
      ? transfer.candidates.find((p) => p.id === transfer.selectedCandidateId)
      : null;
    game.slots.forEach((slot, index) => {
      const button = el("button", "slot", "");
      button.type = "button";
      button.style.left = `${slot.x}%`;
      button.style.top = `${slot.y}%`;
      button.classList.toggle("empty", !slot.player);
      button.classList.toggle("selected", state.selectedSlotIndex === index);
      if (transferCandidate) {
        const canReplace = canTransferReplace(transferCandidate, slot, transfer);
        button.classList.toggle("compatible", canReplace);
        button.classList.toggle("incompatible", Boolean(slot.player) && !canReplace);
        if (canReplace) button.appendChild(el("span", "slot-hint", uiText("可替换", "Replace")));
      } else if (pending) {
        const normalFit = canPlaySlot(pending, slot.pos);
        const forcedFit = !normalFit && canForcePlace(pending, slot.pos);
        button.classList.toggle("compatible", !slot.player && normalFit);
        button.classList.toggle("forced-compatible", !slot.player && forcedFit);
        button.classList.toggle("incompatible", !slot.player && !normalFit && !forcedFit);
      } else if (swapMode && index !== state.selectedSlotIndex) {
        const canSwap = canPlaySlot(selectedSlot.player, slot.pos)
          && canPlaySlot(slot.player, selectedSlot.pos);
        button.classList.toggle("swap-compatible", canSwap);
      }
      const pos = el("span", "slot-pos", POSITION_NAMES[slot.pos] || slot.pos);
      button.appendChild(pos);
      if (slot.player) {
        button.appendChild(el("span", "slot-name", slot.player.name));
        button.appendChild(el("span", "slot-rate", hidden ? "?" : String(slot.player.rate)));
      } else if (pending) {
        const normalFit = canPlaySlot(pending, slot.pos);
        const forcedFit = !normalFit && canForcePlace(pending, slot.pos);
        if (normalFit) {
          button.appendChild(el("span", "slot-hint", "可放这里"));
        } else if (forcedFit) {
          button.appendChild(el("span", "slot-hint", "强放 -" + FORCED_FIT_PENALTY));
        }
      }
      button.addEventListener("click", () => selectSlot(index));
      ui.pitchField.appendChild(button);
    });
    renderUnitRatings();
  }

  function appendAbilityRating(parent, label, value) {
    const item = el("div", "unit-rating", "");
    const track = el("div", "rating-track", "");
    const fill = el("span", "", "");
    const numeric = Number(value);
    fill.style.width = `${Number.isFinite(numeric) ? clamp(numeric, 0, 100) : 0}%`;
    track.appendChild(fill);
    item.append(el("span", "", label), track, el("strong", "", String(value)));
    parent.appendChild(item);
  }

  function renderUnitRatings() {
    const game = state.game;
    if (!game || !ui.unitRatings) return;
    const groups = { ATT: [], MID: [], DEF: [] };
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      const unit = positionUnit(slot.pos);
      if (unit === "GK") return;
      if (groups[unit]) groups[unit].push(Number(slot.player.rate || 0));
    });
    const avg = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : "--";
    ui.unitRatings.innerHTML = "";
    const hidden = isRatingsHidden(game);
    [
      ["进攻", hidden ? "--" : avg(groups.ATT)],
      ["中场", hidden ? "--" : avg(groups.MID)],
      ["防守", hidden ? "--" : avg(groups.DEF)]
    ].forEach(([label, value]) => appendAbilityRating(ui.unitRatings, label, value));
  }

  function renderResultLineup(run) {
    if (!run?.slots?.length) {
      ui.resultLineupPanel.classList.add("hidden");
      return;
    }
    ui.resultLineupPanel.classList.remove("hidden");
    const profile = calcTeamProfile(run);
    const teamRating = run.result?.teamRating || calcTeamRating(run) || profile.overall || "--";
    ui.resultLineupTitle.textContent = `${run.formation || "赛季"}阵容`;
    ui.resultLineupRating.textContent = String(teamRating);
    ui.resultLineupField.innerHTML = "";
    run.slots.forEach((slot) => {
      const node = el("div", "slot result-slot", "");
      node.style.left = `${slot.x}%`;
      node.style.top = `${slot.y}%`;
      node.appendChild(el("span", "slot-pos", POSITION_NAMES[slot.pos] || slot.pos));
      if (slot.player) {
        node.appendChild(el("span", "slot-name", slot.player.name));
        node.appendChild(el("span", "slot-rate", String(slot.player.rate)));
      } else {
        node.appendChild(el("span", "slot-name", "待定"));
      }
      ui.resultLineupField.appendChild(node);
    });
    ui.resultLineupInfo.innerHTML = "";
    const head = el("div", "lineup-info-head", "");
    head.appendChild(el("strong", "", run.formation || "赛季阵容"));
    head.appendChild(el("span", "", `总评 ${teamRating}`));
    ui.resultLineupInfo.appendChild(head);
    const coach = getCoach(run);
    if (coach) {
      const coachBlock = el("div", "lineup-coach", "");
      coachBlock.appendChild(el("span", "", uiText("主教练", "Head Coach")));
      coachBlock.appendChild(el("strong", "", uiText(coach.name, coach.nameEn)));
      coachBlock.appendChild(el("small", "", uiText(coach.style, coach.styleEn)));
      ui.resultLineupInfo.appendChild(coachBlock);
    }
    const bars = el("div", "lineup-info-bars", "");
    [
      ["进攻", profile.attack],
      ["中场", profile.midfield],
      ["防守", profile.defense],
      ["门将", profile.goalkeeper]
    ].forEach(([label, value]) => appendAbilityRating(bars, label, value));
    ui.resultLineupInfo.appendChild(bars);
    renderResultTransferLog(run);
    const playerStats = Array.isArray(run.result?.playerStats) ? run.result.playerStats : [];
    if (playerStats.length) {
      const teamBest = playerStats[0];
      const goldenBoot = [...playerStats].sort((a, b) => b.goals - a.goals)[0];
      const mostAssists = [...playerStats].sort((a, b) => b.assists - a.assists)[0];
      const awards = el("div", "lineup-awards", "");
      [
        ["最佳球员", teamBest ? `${teamBest.name} · ${teamBest.goals}球 ${teamBest.assists}助` : "--"],
        ["金靴", goldenBoot ? `${goldenBoot.name} · ${goldenBoot.goals}球` : "--"],
        ["最多助攻", mostAssists ? `${mostAssists.name} · ${mostAssists.assists}助` : "--"]
      ].forEach(([label, value]) => {
        const item = el("div", "lineup-award", "");
        item.appendChild(el("span", "", label));
        item.appendChild(el("strong", "", value));
        awards.appendChild(item);
      });
      ui.resultLineupInfo.appendChild(awards);
      const statsHead = el("div", "lineup-stats-head", "");
      statsHead.appendChild(el("strong", "", "球员赛季数据"));
      ui.resultLineupInfo.appendChild(statsHead);
      const statsList = el("div", "lineup-player-stats", "");
      playerStats.slice(0, run.slots.length).forEach((stat) => {
        const row = el("div", "lineup-player-stat", "");
        row.appendChild(el("strong", "", stat.name));
        row.appendChild(el("span", "", `${stat.apps ?? 0}场`));
        row.appendChild(el("span", "", `${stat.goals ?? 0}球`));
        row.appendChild(el("span", "", `${stat.assists ?? 0}助`));
        statsList.appendChild(row);
      });
      ui.resultLineupInfo.appendChild(statsList);
    }
  }

  function renderResultTransferLog(run) {
    const entries = Array.isArray(run.transferLog) ? run.transferLog : [];
    if (!entries.length && !run.transferSkipped) return;
    const block = el("div", "lineup-transfer", "");
    block.appendChild(el("strong", "", uiText("转会记录", "Transfer Log")));
    if (entries.length) {
      entries.forEach((entry) => {
        const row = el("div", "lineup-transfer-row", "");
        row.appendChild(el("span", "", uiText(`第 ${entry.step}/2 次转会`, `Transfer ${entry.step}/2`)));
        row.appendChild(el("span", "transfer-log-mode", transferModeName(entry.mode)));
        row.appendChild(el("strong", "", `${entry.outgoing || "--"} -> ${entry.incoming}`));
        row.appendChild(el("span", "", entry.club || ""));
        block.appendChild(row);
      });
    } else {
      block.appendChild(el("span", "", uiText("未进行转会", "No transfers made")));
    }
    ui.resultLineupInfo.appendChild(block);
  }

  function selectSlot(index) {
    const game = state.game;
    if (state.transfer) {
      selectTransferSlot(index);
      return;
    }
    if (!game) return;
    const slot = game.slots[index];
    const pendingId = state.pendingDraftPlayerId;
    const pending = pendingId ? game.candidates.find((p) => p.id === pendingId) : null;

    if (pending) {
      if (slot.player) {
        toast("这个位置已经有球员，请先选择空位。");
        return;
      }
      if (!canPlaySlot(pending, slot.pos) && !canForcePlace(pending, slot.pos)) {
        toast(`${pending.name} 不能踢 ${POSITION_NAMES[slot.pos]}。`);
        return;
      }
      draftPlayerToSlot(pending, index);
      return;
    }

    if (!slot.player) {
      state.selectedSlotIndex = state.selectedSlotIndex === index ? null : index;
      renderPitch();
      return;
    }

    if (state.selectedSlotIndex !== null && state.selectedSlotIndex !== index) {
      trySwapSlots(state.selectedSlotIndex, index);
      return;
    }

    state.selectedSlotIndex = state.selectedSlotIndex === index ? null : index;
    renderPitch();
  }

  function canPlaySlot(player, slotPos) {
    if (!player || !Array.isArray(player.pos)) return false;
    if (player.pos.includes(slotPos)) return true;
    if ((slotPos === "LM" || slotPos === "LW") && player.pos.some((pos) => pos === "LM" || pos === "LW")) return true;
    if ((slotPos === "RM" || slotPos === "RW") && player.pos.some((pos) => pos === "RM" || pos === "RW")) return true;
    if (slotPos === "CM" && player.pos.some((pos) => MIDFIELD_CENTRE_POSITIONS.includes(pos))) return true;
    if (player.pos.includes("CM") && (slotPos === "CDM" || slotPos === "CAM")) return true;
    return false;
  }

  function isForceableMidfielder(player) {
    return Boolean(player && Array.isArray(player.pos) && player.pos.some((pos) => MIDFIELD_CENTRE_POSITIONS.includes(pos) || pos === "LM" || pos === "RM"));
  }

  function hasNormalPlacement() {
    const game = state.game;
    if (!game) return false;
    return game.candidates.some((candidate) => !isDrafted(candidate.id) && game.slots.some((slot) => !slot.player && canPlaySlot(candidate, slot.pos)));
  }

  function canForcePlace(player, slotPos) {
    const game = state.game;
    if (!game || !player || !slotPos) return false;
    const slot = game.slots.find((item) => item.pos === slotPos);
    if (!slot || slot.player) return false;
    if (!isForceableMidfielder(player)) return false;
    return !hasNormalPlacement();
  }

  function trySwapSlots(firstIndex, secondIndex) {
    const game = state.game;
    const first = game.slots[firstIndex];
    const second = game.slots[secondIndex];
    if (!first.player || !second.player) return;
    if (!canPlaySlot(first.player, second.pos) || !canPlaySlot(second.player, first.pos)) {
      toast("换位失败：两名球员都必须能踢对方的新位置。");
      state.selectedSlotIndex = null;
      renderPitch();
      return;
    }
    const firstPlayer = { ...first.player };
    const secondPlayer = { ...second.player };
    first.player = secondPlayer;
    second.player = firstPlayer;
    first.player.rate = clamp(Number(first.player.baseRate || first.player.rate) + fitBonus(first.pos, first.player.pos), 40, 99);
    second.player.rate = clamp(Number(second.player.baseRate || second.player.rate) + fitBonus(second.pos, second.player.pos), 40, 99);
    state.selectedSlotIndex = null;
    saveGame();
    renderPitch();
    renderTeamRating();
    toast("换位成功。");
  }

  function draftPlayerToSlot(candidate, index) {
    const game = state.game;
    const slot = game.slots[index];
    if (slot.player) {
      toast("这个位置已经有球员，请先选择空位。");
      return;
    }
    const forced = !canPlaySlot(candidate, slot.pos) && canForcePlace(candidate, slot.pos);
    const baseRate = Number(candidate.baseRate || candidate.rate);
    const drafted = {
      ...candidate,
      baseRate,
      forced,
      rate: clamp(baseRate + fitBonus(slot.pos, candidate.pos, forced), 40, 99)
    };
    slot.player = drafted;
    game.draftedPlayers.push(drafted);
    game.candidates = [];
    if (game.currentSpin) game.currentSpin.drafted = true;
    state.pendingDraftPlayerId = null;
    state.selectedSlotIndex = null;
    saveGame();
    renderPitch();
    renderCandidates();
    renderTeamRating();
    updateSpinControls();
    ui.gameProgress.textContent = `${game.draftedPlayers.length}/${game.slots.length}`;
    if (game.draftedPlayers.length === game.slots.length) {
      ui.simulateBtn.disabled = false;
      ui.leagueChoice.classList.remove("hidden");
      renderLeagueChoice();
      toast("阵容完成，请选择参赛联赛。");
      document.querySelector("#leagueChoice")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      state.autoSpinPending = true;
      updateSpinControls();
      setTimeout(() => {
        state.autoSpinPending = false;
        if (
          state.game
          && state.game.draftedPlayers.length < state.game.slots.length
          && !state.spinning
        ) {
          spinWheel();
        }
      }, 500);
    }
  }

  function renderSpinResult() {
    if (state.transfer) {
      renderTransferSpinResult();
      return;
    }
    const game = state.game;
    ui.spinResult.innerHTML = "";
    if (state.spinning) {
      ui.spinResult.appendChild(el("p", "slot-drawing-status", uiText("赛季与球队正在抽取中…", "Drawing season and club…")));
      return;
    }
    if (!game.currentSpin) {
      ui.spinResult.appendChild(el("p", "", "开始抽取赛季和球队。"));
      return;
    }
    const league = getLeague(game.currentSpin.leagueId);
    const club = getClub(game.currentSpin.clubId, game.currentSpin.season);
    if (!league || !club) {
      ui.spinResult.appendChild(el("p", "history-empty", "没有抽到球队，请重新开始抽取。"));
      return;
    }
    const box = el("div", "result-club", "");
    const copy = el("div", "", "");
    copy.appendChild(el("div", "result-league", `${league.name} · ${league.country}`));
    copy.appendChild(el("strong", "", club.name));
    copy.appendChild(el("span", "", `${club.stadium ? `${club.stadium} · ` : ""}${game.currentSpin.season}`));
    const badge = el("span", "league-code", club.short.slice(0, 3));
    badge.style.background = club.colors?.[0] || league.color || "#0f766e";
    box.append(copy, badge);
    ui.spinResult.appendChild(box);
  }

  function renderCandidates() {
    if (state.transfer) {
      renderTransferCandidates();
      return;
    }
    const game = state.game;
    ui.candidates.innerHTML = "";
    if (state.spinning) {
      ui.candidates.appendChild(el("p", "history-empty", uiText("滚轴停止后将生成候选球员。", "Candidates will appear after both reels stop.")));
      return;
    }
    if (!game.currentSpin) {
      ui.candidates.appendChild(el("p", "history-empty", "先完成抽取，再从抽中的俱乐部挑选球员。"));
      return;
    }
    if (!game.candidates.length) {
      ui.candidates.appendChild(el(
        "p",
        "history-empty",
        state.spinning
          ? "正在抽取球队..."
          : state.autoSpinPending || game.currentSpin?.drafted
          ? "已选择球员，正在抽取下一队..."
          : "这家俱乐部的候选球员已经被选完了。"
      ));
      return;
    }
    const hidden = isRatingsHidden(game);
    const canPlace = (candidate) => game.slots.some((slot) => !slot.player && canPlaySlot(candidate, slot.pos));
    const canForce = (candidate) => game.slots.some((slot) => !slot.player && canForcePlace(candidate, slot.pos));
    const sortFn = hidden ? () => 0 : (a, b) => b.rate - a.rate;
    const ordered = [
      ...game.candidates.filter((candidate) => canPlace(candidate)).sort(sortFn),
      ...game.candidates.filter((candidate) => canForce(candidate)).sort(sortFn),
      ...game.candidates.filter((candidate) => !canPlace(candidate) && !canForce(candidate)).sort(sortFn)
    ];
    ordered.forEach((candidate) => {
      const button = el("button", "candidate", "");
      button.type = "button";
      button.classList.toggle("used", isDrafted(candidate.id));
      button.classList.toggle("pending", candidate.id === state.pendingDraftPlayerId);
      button.classList.toggle("forced", canForce(candidate) && !canPlace(candidate));
      button.classList.toggle("unavailable", !canPlace(candidate) && !canForce(candidate));
      button.appendChild(el("strong", "", candidate.name));
      const forced = canForce(candidate) && !canPlace(candidate);
      button.appendChild(el("small", "", `${candidate.nat} · ${candidate.pos.map((p) => POSITION_NAMES[p]).join("/")}${forced ? " · 强放 -" + FORCED_FIT_PENALTY : ""}`));
      button.appendChild(el("span", "rate", hidden ? "?" : String(candidate.rate)));
      button.addEventListener("click", () => {
        if (isDrafted(candidate.id)) {
          toast("这名球员已经被选中。");
          return;
        }
        if (!canPlace(candidate) && !canForce(candidate)) {
          toast("这名球员没有可放的空位。");
          return;
        }
        state.pendingDraftPlayerId = candidate.id;
        state.selectedSlotIndex = null;
        renderPitch();
        renderCandidates();
        toast(`已选中 ${candidate.name}，${canForce(candidate) && !canPlace(candidate) ? "可强放，但会降低总评" : "点击球场上可踢的空位"}。`);
        document.querySelector(".pitch-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      ui.candidates.appendChild(button);
    });
  }

  function isDrafted(playerId) {
    return (state.game?.draftedPlayers || []).some((p) => p.id === playerId);
  }

  function spinWheel() {
    const game = state.game;
    if (!game) {
      toast("请先开始一场选秀。");
      return;
    }
    if (state.transfer) {
      spinTransferWheel();
      return;
    }
    if (state.spinning) return;
    if (!state.selectedLeagues.size) {
      toast("请至少选择一个联赛。");
      return;
    }
    if (state.spinning) return;
    state.pendingDraftPlayerId = null;
    state.selectedSlotIndex = null;
    const leagueIds = game.leagues.length ? game.leagues : [...state.selectedLeagues];
    const rng = gameRng(game);
    const leagueId = leagueIds[Math.floor(rng() * leagueIds.length)];
    const season = randomSeasonInRange(game.seasonRange, rng);
    game.season = season;
    const pool = clubsForLeague(leagueId, season);
    if (!pool.length) {
      toast("这个赛季没有可抽球队，请换一个赛季。");
      return;
    }
    const club = pool[Math.floor(rng() * pool.length)];
    const seasonOptions = seasonsInRange(game.seasonRange);
    const clubOptions = leagueIds.flatMap((id) => clubsForLeague(id, season));
    game.currentSpin = {
      leagueId,
      clubId: club.id,
      season,
      drafted: false
    };
    game.candidates = [];
    saveGame();
    animateWheel(season, club, seasonOptions, clubOptions, () => {
      game.candidates = buildCandidates(club, game);
      saveGame();
      renderSpinResult();
      renderCandidates();
      updateSpinControls();
      toast(`抽中 ${season} · ${club.name}`);
      ui.spinResult.scrollIntoView({ behavior: "smooth", block: "center" });
      if (state.autoSpinPending) {
        state.autoSpinPending = false;
        spinWheel();
      }
    });
    renderSpinResult();
    renderCandidates();
    updateSpinControls();
  }

  function animateWheel(targetSeason, targetClub, seasonOptions, clubOptions, done) {
    state.spinning = true;
    ui.spinBtn.disabled = true;
    const seasons = seasonOptions.map((season) => ({
      primary: season,
      meta: uiText("赛季", "SEASON")
    }));
    const clubs = clubOptions.map((club) => ({
      primary: club.name,
      meta: `${getLeague(club.league)?.code || "CLB"} · ${club.short || "---"}`
    }));
    const seasonTarget = Math.max(0, seasonOptions.indexOf(targetSeason));
    const clubTarget = Math.max(0, clubOptions.findIndex((club) => club.id === targetClub.id && club.league === targetClub.league));
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reducedMotion) {
      renderSlotReel("season", seasons, seasonTarget, true);
      renderSlotReel("club", clubs, clubTarget, true);
      finishSlotAnimation(done);
      return;
    }
    Promise.all([
      animateSlotReel("season", seasons, seasonTarget, 1350),
      animateSlotReel("club", clubs, clubTarget, 2250)
    ]).then(() => finishSlotAnimation(done));
  }

  function animateSlotReel(type, items, targetIndex, duration) {
    return new Promise((resolve) => {
      if (!items.length) {
        renderSlotReel(type, items, 0, true);
        resolve();
        return;
      }
      const reel = $(`#${type}Reel`);
      reel?.classList.remove("landed");
      reel?.classList.add("spinning");
      let index = Math.floor(Math.random() * items.length);
      let lastStep = 0;
      const startedAt = performance.now();
      const frame = (now) => {
        const elapsed = now - startedAt;
        const progress = clamp(elapsed / duration, 0, 1);
        const interval = 48 + Math.pow(progress, 2.6) * 190;
        if (now - lastStep >= interval) {
          index = (index + 1 + Math.floor(Math.random() * Math.min(3, items.length))) % items.length;
          renderSlotReel(type, items, index, false);
          lastStep = now;
        }
        if (progress < 1) {
          requestAnimationFrame(frame);
          return;
        }
        reel?.classList.remove("spinning");
        renderSlotReel(type, items, targetIndex, true);
        resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  function renderSlotReel(type, items, index, landed = false) {
    const reel = $(`#${type}Reel`);
    const value = $(`#${type}ReelValue`);
    const previous = $(`#${type}ReelPrev`);
    const next = $(`#${type}ReelNext`);
    const meta = $(`#${type}ReelMeta`);
    if (!reel || !value || !previous || !next || !meta) return;
    const safeItems = items.length ? items : [{
      primary: type === "season" ? "????-??" : uiText("等待抽取", "READY"),
      meta: type === "season" ? "SEASON" : "CLUB"
    }];
    const safeIndex = ((index % safeItems.length) + safeItems.length) % safeItems.length;
    const current = safeItems[safeIndex];
    const before = safeItems[(safeIndex - 1 + safeItems.length) % safeItems.length];
    const after = safeItems[(safeIndex + 1) % safeItems.length];
    previous.textContent = before.primary;
    value.textContent = current.primary;
    next.textContent = after.primary;
    meta.textContent = current.meta || (type === "season" ? "SEASON" : "CLUB");
    reel.classList.toggle("landed", landed);
  }

  function finishSlotAnimation(done) {
    state.spinning = false;
    ui.spinBtn.disabled = false;
    done();
    updateSpinControls();
  }

  function buildCandidates(club, game) {
    const spinSeason = game.currentSpin?.season || game.season || "2025-26";
    const pool = getClub(club.id, spinSeason)?.players || club.players || [];
    const rng = gameRng(game);
    const mapped = pool
      .map((player) => ({
        ...player,
        id: `${spinSeason}|${club.id}|${player.name}`,
        rate: clamp(calibrateRate(Number(player.rate || 80), spinSeason) + Math.floor(rng() * 3) - 1, 40, 99)
      }))
      .filter((player) => !isDrafted(player.id));
    if (!game.hideRatings) {
      return mapped.sort((a, b) => b.rate - a.rate);
    }
    return shuffleWithRng(mapped, makeRng(hashSeed(`hidden-${spinSeason}-${club.id}-${game.draftedPlayers.length}`)));
  }

  function calibrateRate(rate, season) {
    if (season === "2025-26") {
      if (rate >= 88) return rate - 1;
      if (rate >= 82) return rate - 2;
      if (rate >= 76) return rate - 3;
      return rate - 2;
    }
    if (typeof LEGACY_SEASONS !== "undefined" && LEGACY_SEASONS[season]) {
      return rate + 2;
    }
    return rate;
  }

  function reroll() {
    if (state.transfer) {
      spinWheel();
      return;
    }
    const game = state.game;
    if (!game || game.rerolls <= 0) {
      toast("没有可用重转次数。");
      return;
    }
    game.rerolls -= 1;
    ui.rerollChip.textContent = `重转 ${game.rerolls} 次`;
    ui.rerollBtn.disabled = true;
    saveGame();
    spinWheel();
  }

  function getWeakestUnit(game) {
    const groups = { GK: [], DEF: [], MID: [], ATT: [] };
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      const unit = positionUnit(slot.pos);
      groups[unit].push(Number(slot.player.rate || 0));
    });
    const avg = (list) => list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 99;
    return Object.keys(groups).sort((a, b) => avg(groups[a]) - avg(groups[b]))[0];
  }

  function openTransferWindow(sim) {
    if (sim.transferState?.resolved) return false;
    const transfer = {
      sim,
      step: 1,
      mode: "weak",
      targetUnit: getWeakestUnit(sim.game),
      currentSpin: null,
      candidates: [],
      selectedCandidateId: null,
      revealedCandidateId: null,
      completed: 0,
      log: [],
      resolved: false,
      skipped: false
    };
    state.transfer = transfer;
    sim.transferState = transfer;
    ui.transferPanel.classList.remove("hidden");
    ui.simulationPanel.classList.add("hidden");
    document.querySelector(".game-layout")?.classList.add("hidden");
    ui.transferIntro.classList.remove("hidden");
    ui.transferContent.classList.add("hidden");
    renderTransferIntro();
    renderTransferHeader();
    renderPitch();
    renderSpinResult();
    renderCandidates();
    updateSpinControls();
    return true;
  }

  function renderTransferIntro() {
    if (!state.transfer) return;
    renderTransferHalfSummary();
    const unit = state.transfer.targetUnit || getWeakestUnit(state.game);
    ui.transferWeakText.innerHTML = "";
    ui.transferWeakText.appendChild(el("strong", "", uiText(`当前最弱位置：${unit}`, `Weakest area: ${unit}`)));
    ui.transferWeakText.appendChild(el("span", "", uiText(
      "第一次只会提供能够提升弱项位置评分的球员；第 2 次转会方式将随机抽取。",
      "The first transfer only offers players who improve a weak-area slot; the second transfer method is randomized."
    )));
  }

  function renderTransferHalfSummary() {
    const transfer = state.transfer;
    const container = ui.transferHalfSummary;
    if (!transfer?.sim?.table || !container) return;
    const sim = transfer.sim;
    const table = Object.values(sim.table)
      .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    const positionIndex = table.findIndex((row) => row.name === "我的球队");
    const row = positionIndex >= 0 ? table[positionIndex] : null;
    if (!row) {
      container.classList.add("hidden");
      return;
    }
    container.classList.remove("hidden");
    const position = positionIndex + 1;
    const league = getLeague(sim.game.league);
    const allocation = getEuropeanQualification(sim.game, position).allocation;
    const uclCutoff = table[Math.min(allocation.ucl - 1, table.length - 1)];
    const safetyCutoff = table[Math.max(0, table.length - 4)];
    const leaderGap = Math.max(0, Number(table[0]?.points || 0) - row.points);
    let situation;
    if (position === 1) {
      const second = table[1];
      const lead = Math.max(0, row.points - Number(second?.points || row.points));
      situation = uiText(`当前领跑${lead ? `，领先第 2 名 ${lead} 分` : "，榜首竞争激烈"}`, `Currently top${lead ? `, ${lead} pts clear of second` : ", with a tight title race"}`);
    } else if (position <= allocation.ucl) {
      situation = uiText(`目前位于欧冠区，距离榜首 ${leaderGap} 分`, `Currently in the Champions League places, ${leaderGap} pts off top`);
    } else if (position > table.length - 3) {
      const safetyGap = Math.max(0, Number(safetyCutoff?.points || 0) - row.points);
      situation = uiText(`目前处于降级区，距离安全区 ${safetyGap} 分`, `Currently in the relegation zone, ${safetyGap} pts from safety`);
    } else {
      const uclGap = Math.max(0, Number(uclCutoff?.points || 0) - row.points);
      situation = uiText(`距离欧冠区 ${uclGap} 分，距离榜首 ${leaderGap} 分`, `${uclGap} pts from the Champions League places and ${leaderGap} pts off top`);
    }
    container.innerHTML = "";
    const head = el("div", "transfer-half-head", "");
    const title = el("div", "", "");
    title.appendChild(el("span", "eyebrow", uiText("前半程战绩", "First-Half Record")));
    title.appendChild(el("strong", "", `${league?.name || ""} · ${uiText(`已赛 ${row.played} 场`, `${row.played} played`)}`));
    head.appendChild(title);
    head.appendChild(el("span", "transfer-rank-badge", uiText(`第 ${position}/${table.length} 名`, `#${position} of ${table.length}`)));
    container.appendChild(head);
    const goalDiff = Number(row.goalDiff || 0);
    const stats = [
      [row.points, uiText("积分", "Points")],
      [`${row.wins}-${row.draws}-${row.losses}`, uiText("胜-平-负", "W-D-L")],
      [`${row.goalsFor}-${row.goalsAgainst}`, uiText("进球-失球", "GF-GA")],
      [goalDiff > 0 ? `+${goalDiff}` : String(goalDiff), uiText("净胜球", "Goal Diff")]
    ];
    const grid = el("div", "transfer-half-grid", "");
    stats.forEach(([value, label]) => {
      const card = el("div", "transfer-half-stat", "");
      card.appendChild(el("strong", "", String(value)));
      card.appendChild(el("span", "", label));
      grid.appendChild(card);
    });
    container.appendChild(grid);
    const context = el("div", "transfer-half-context", "");
    context.appendChild(el("span", "", situation));
    const form = el("div", "transfer-form", "");
    form.appendChild(el("small", "", uiText("近 5 场", "Last 5")));
    const recent = sim.matches.slice(-5);
    if (!recent.length) {
      form.appendChild(el("span", "transfer-form-empty", "--"));
    } else {
      recent.forEach((match) => {
        const item = el("span", `transfer-form-result form-${match.result.toLowerCase()}`, match.result);
        item.title = `${match.opponent} ${match.gf}-${match.ga}`;
        form.appendChild(item);
      });
    }
    context.appendChild(form);
    container.appendChild(context);
  }

  function renderTransferHeader() {
    if (!state.transfer) return;
    renderTransferHalfSummary();
    const transfer = state.transfer;
    const stepText = transfer.step === 1
      ? uiText("第 1/2 次转会 · 弱项补强", "Transfer 1/2 · Weak-Area")
      : uiText(`第 2/2 次转会 · ${transferModeName(transfer.mode)}`, `Transfer 2/2 · ${transferModeName(transfer.mode)}`);
    ui.transferProgress.textContent = `${transfer.completed}/2`;
    ui.transferTitle.textContent = uiText("冬季转会窗", "Winter Transfer Window");
    ui.transferModeText.innerHTML = "";
    ui.transferModeText.appendChild(el("strong", "", stepText));
    ui.transferStatus.innerHTML = "";
    const target = transfer.mode === "weak" ? transfer.targetUnit || getWeakestUnit(state.game) : null;
    if (target) ui.transferStatus.appendChild(el("span", "", uiText(`目标位置：${target}`, `Target area: ${target}`)));
    const instruction = transfer.mode === "free"
      ? uiText("从 5 名完全随机的候选人中选择一人，再点击球场上的兼容位置。", "Choose one of five fully random candidates, then click a compatible slot.")
      : transfer.mode === "mystery"
        ? transfer.revealedCandidateId
          ? uiText("盲盒已经锁定，点击球场上的兼容位置完成签约。", "The box is locked in. Click a compatible slot to complete the signing.")
          : uiText("三个盲盒只能打开一个；揭晓后必须签下这名球员。", "Only one of the three boxes can be opened; the revealed player must be signed.")
        : uiText("候选球员必须比被替换球员评分更高；点击可补强的位置完成转会。", "The candidate must be rated higher than the outgoing player. Click an upgradeable slot to complete the transfer.");
    ui.transferStatus.appendChild(el("span", "", instruction));
    renderTransferLog();
  }

  function transferModeName(mode) {
    return mode === "weak" ? uiText("弱项补强", "Weak-Area")
      : mode === "free" ? uiText("自由签约", "Free Signing")
      : mode === "mystery" ? uiText("盲盒签约", "Mystery Signing")
      : mode === "random" ? uiText("随机引援", "Random Signing")
      : mode === "swap" ? uiText("球员交换", "Player Swap")
      : uiText("转会", "Transfer");
  }

  function renderTransferLog() {
    const transfer = state.transfer;
    if (!transfer) return;
    ui.transferLog.innerHTML = "";
    if (!transfer.log.length) {
      ui.transferLog.appendChild(el("span", "", uiText("转会记录", "Transfer Log")));
      return;
    }
    const head = el("strong", "", uiText("转会记录", "Transfer Log"));
    ui.transferLog.appendChild(head);
    transfer.log.forEach((entry, index) => {
      const row = el("div", "transfer-log-row", "");
      row.appendChild(el("span", "", uiText(`第 ${entry.step}/2 次转会`, `Transfer ${entry.step}/2`)));
      row.appendChild(el("span", "transfer-log-mode", transferModeName(entry.mode)));
      row.appendChild(el("strong", "", `${entry.incoming} ${entry.club}`));
      row.appendChild(el("span", "", uiText(`转会将替换 ${entry.outgoing}`, `This transfer replaces ${entry.outgoing}`)));
      ui.transferLog.appendChild(row);
    });
  }

  function enterTransferWindow() {
    const transfer = state.transfer;
    if (!transfer) return;
    ui.transferIntro.classList.add("hidden");
    ui.transferContent.classList.remove("hidden");
    document.querySelector(".game-layout")?.classList.remove("hidden");
    ui.rerollBtn.classList.remove("hidden");
    document.querySelector(".wheel-card")?.classList.remove("hidden");
    prepareTransferStep(transfer);
  }

  function skipTransferWindow() {
    const transfer = state.transfer;
    if (!transfer) return;
    transfer.skipped = true;
    transfer.resolved = true;
    transfer.log = [];
    toast(uiText("本次转会窗已跳过。", "Transfer window skipped."));
    resumeAfterTransfer(transfer.sim);
  }

  function prepareTransferStep(transfer) {
    const rng = gameRng(transfer.sim.game);
    if (transfer.step === 2) {
      transfer.mode = SECOND_TRANSFER_MODE_KEYS[Math.floor(rng() * SECOND_TRANSFER_MODE_KEYS.length)];
    }
    if (transfer.mode === "weak") transfer.targetUnit = getWeakestUnit(transfer.sim.game);
    transfer.currentSpin = null;
    transfer.candidates = [];
    transfer.selectedCandidateId = null;
    transfer.revealedCandidateId = null;
    const directMode = transfer.mode === "free" || transfer.mode === "mystery";
    document.querySelector(".wheel-card")?.classList.toggle("hidden", directMode);
    ui.rerollBtn.classList.toggle("hidden", directMode);
    if (directMode) prepareDirectTransferCandidates(transfer);
    saveGame();
    renderTransferHeader();
    renderPitch();
    renderSpinResult();
    renderCandidates();
    updateSpinControls();
  }

  function buildDirectTransferPool(transfer, game) {
    const seasons = seasonsInRange(game.seasonRange);
    const leagueIds = game.leagues.length ? game.leagues : [...state.selectedLeagues];
    const currentIds = new Set(game.slots.map((slot) => slot.player?.id).filter(Boolean));
    return seasons.flatMap((season) => leagueIds.flatMap((leagueId) => (
      allClubs(season)
        .filter((club) => club.league === leagueId)
        .flatMap((club) => (club.players || []).map((player) => ({
          ...player,
          id: `${season}|${club.id}|${player.name}`,
          rate: clamp(calibrateRate(Number(player.rate || 80), season), 40, 99),
          sourceClubId: club.id,
          sourceClubName: club.name,
          sourceSeason: season
        })))
    )))
      .filter((player) => !currentIds.has(player.id))
      .filter((player) => game.slots.some((slot) => slot.player && canPlaySlot(player, slot.pos)));
  }

  function prepareDirectTransferCandidates(transfer) {
    const game = transfer.sim.game;
    const rng = gameRng(game);
    const pool = buildDirectTransferPool(transfer, game);
    transfer.currentSpin = {
      seasonRange: { ...transfer.sim.game.seasonRange },
      direct: true,
      drafted: false
    };
    if (transfer.mode === "free") {
      transfer.candidates = shuffleWithRng(pool, rng).slice(0, 5);
      return;
    }
    transfer.candidates = buildMysteryCandidates(pool, rng);
  }

  function takeRandomCandidate(pool, excludedIds, fallbackPool, rng) {
    const available = pool.filter((player) => !excludedIds.has(player.id));
    const fallback = fallbackPool.filter((player) => !excludedIds.has(player.id));
    const source = available.length ? available : fallback;
    if (!source.length) return null;
    const picked = source[Math.floor(rng() * source.length)];
    excludedIds.add(picked.id);
    return picked;
  }

  function buildMysteryCandidates(pool, rng) {
    if (!pool.length) return [];
    const ordered = [...pool].sort((a, b) => a.rate - b.rate);
    const band = (start, end) => ordered.slice(
      Math.floor(ordered.length * start),
      Math.max(Math.floor(ordered.length * start) + 1, Math.ceil(ordered.length * end))
    );
    const excludedIds = new Set();
    const safePool = band(0.45, 0.72);
    const safe = takeRandomCandidate(safePool, excludedIds, safePool, rng);
    const standard = takeRandomCandidate(pool, excludedIds, pool, rng);
    const lowRiskPool = band(0, 0.28);
    const highRewardPool = band(0.85, 1);
    const riskyPool = rng() < 0.5 ? lowRiskPool : highRewardPool;
    const risky = takeRandomCandidate(riskyPool, excludedIds, riskyPool, rng);
    return [
      safe && { ...safe, mysteryRisk: "safe" },
      standard && { ...standard, mysteryRisk: "standard" },
      risky && { ...risky, mysteryRisk: "risky" }
    ].filter(Boolean);
  }

  function spinTransferWheel() {
    const transfer = state.transfer;
    if (!transfer || state.spinning) return;
    if (transfer.currentSpin && transfer.candidates.length) return;
    const game = state.game;
    const leagueIds = game.leagues.length ? game.leagues : [...state.selectedLeagues];
    if (!leagueIds.length) {
      toast(uiText("请至少选择一个联赛。", "Select at least one league."));
      return;
    }
    const rng = gameRng(game);
    const leagueId = leagueIds[Math.floor(rng() * leagueIds.length)];
    const season = randomSeasonInRange(game.seasonRange, rng);
    const pool = allClubs(season).filter((club) => club.league === leagueId);
    if (!pool.length) {
      toast(uiText("没有可抽球队，请换一个赛季。", "No clubs available for this season."));
      return;
    }
    const club = pool[Math.floor(rng() * pool.length)];
    const seasonOptions = seasonsInRange(game.seasonRange);
    const seasonClubs = allClubs(season);
    const clubOptions = leagueIds.flatMap((id) => seasonClubs.filter((item) => item.league === id));
    transfer.currentSpin = { leagueId, clubId: club.id, season, drafted: false };
    transfer.candidates = [];
    transfer.selectedCandidateId = null;
    animateWheel(season, club, seasonOptions, clubOptions, () => {
      transfer.candidates = buildTransferCandidates(club, transfer, game);
      saveGame();
      renderSpinResult();
      renderCandidates();
      updateSpinControls();
    });
    renderSpinResult();
    renderCandidates();
    updateSpinControls();
  }

  function buildTransferCandidates(club, transfer, game) {
    const season = transfer.currentSpin?.season || simulationSeason(game);
    const pool = getClub(club.id, season)?.players || club.players || [];
    const allowedPositions = transfer.mode === "weak"
      ? (TRANSFER_UNIT_POSITIONS[transfer.targetUnit] || [])
      : null;
    const rng = gameRng(game);
    return pool
      .map((player) => ({
        ...player,
        id: `${season}|${club.id}|${player.name}`,
        rate: clamp(calibrateRate(Number(player.rate || 80), season) + Math.floor(rng() * 3) - 1, 40, 99)
      }))
      .filter((player) => !game.slots.some((slot) => slot.player?.id === player.id))
      .filter((player) => !allowedPositions || player.pos.some((pos) => allowedPositions.includes(pos)))
      .filter((player) => game.slots.some((slot) => canTransferReplace(player, slot, transfer)))
      .sort((a, b) => b.rate - a.rate);
  }

  function transferRateForSlot(player, slotPos) {
    const baseRate = Number(player?.baseRate || player?.rate || 0);
    return clamp(baseRate + fitBonus(slotPos, player?.pos || []), 40, 99);
  }

  function canTransferReplace(candidate, slot, transfer) {
    if (!candidate || !slot?.player || !canPlaySlot(candidate, slot.pos)) return false;
    if (transfer?.mode !== "weak") return true;
    if (positionUnit(slot.pos) !== transfer.targetUnit) return false;
    return transferRateForSlot(candidate, slot.pos) > Number(slot.player.rate || 0);
  }

  function renderTransferSpinResult() {
    const transfer = state.transfer;
    ui.spinResult.innerHTML = "";
    if (transfer?.mode === "free") {
      const box = el("div", "direct-transfer-summary", "");
      box.appendChild(el("strong", "", uiText("随机候选名单", "Random Candidate List")));
      box.appendChild(el("span", "", uiText(
        "以下球员从合格球员池中等概率随机产生，未按评分排序。",
        "These players were drawn uniformly from the eligible pool and are not sorted by rating."
      )));
      ui.spinResult.appendChild(box);
      return;
    }
    if (transfer?.mode === "mystery") {
      const box = el("div", "direct-transfer-summary mystery-summary", "");
      box.appendChild(el("strong", "", uiText("选择一个盲盒", "Choose One Mystery Box")));
      box.appendChild(el("span", "", transfer.revealedCandidateId
        ? uiText("球员已经揭晓并锁定，请在球场上选择替换位置。", "The player is revealed and locked in. Choose a replacement slot on the pitch.")
        : uiText("每个盲盒都来自真实球员数据，打开后不能更换。", "Every box contains a real player and cannot be changed after opening.")));
      ui.spinResult.appendChild(box);
      return;
    }
    if (state.spinning) {
      ui.spinResult.appendChild(el("p", "slot-drawing-status", uiText("赛季与转会目标正在抽取中…", "Drawing season and transfer target…")));
      return;
    }
    if (!transfer?.currentSpin) {
      ui.spinResult.appendChild(el("p", "", uiText("开始抽取赛季与转会目标俱乐部。", "Draw a season and transfer club.")));
      return;
    }
    const league = getLeague(transfer.currentSpin.leagueId);
    const club = getClub(transfer.currentSpin.clubId, transfer.currentSpin.season);
    if (!league || !club) {
      ui.spinResult.appendChild(el("p", "history-empty", uiText("没有抽到球队，请重新抽取。", "No club drawn. Redraw.")));
      return;
    }
    const box = el("div", "result-club", "");
    const copy = el("div", "", "");
    copy.appendChild(el("div", "result-league", `${league.name} · ${league.country}`));
    copy.appendChild(el("strong", "", club.name));
    copy.appendChild(el("span", "", transfer.currentSpin.season));
    const badge = el("span", "league-code", club.short.slice(0, 3));
    badge.style.background = club.colors?.[0] || league.color || "#0f766e";
    box.append(copy, badge);
    ui.spinResult.appendChild(box);
  }

  function renderTransferCandidates() {
    const transfer = state.transfer;
    ui.candidates.innerHTML = "";
    if (state.spinning) {
      ui.candidates.appendChild(el("p", "history-empty", uiText("滚轴停止后将生成候选球员。", "Candidates will appear after both reels stop.")));
      return;
    }
    if (!transfer?.currentSpin) {
      ui.candidates.appendChild(el("p", "history-empty", uiText("先完成抽取，再选择要签入的球员。", "Complete the draw first, then choose a player to sign.")));
      return;
    }
    if (!transfer.candidates.length) {
      const message = transfer.mode === "free" || transfer.mode === "mystery"
        ? uiText("没有足够的合格球员完成本次转会。", "Not enough eligible players for this transfer.")
        : uiText("没有可签球员，请重新抽取。", "No eligible player. Redraw.");
      ui.candidates.appendChild(el("p", "history-empty", message));
      return;
    }
    if (transfer.mode === "mystery") {
      renderMysteryCandidates(transfer);
      return;
    }
    transfer.candidates.forEach((candidate) => {
      const button = el("button", "candidate", "");
      button.type = "button";
      button.classList.toggle("pending", candidate.id === transfer.selectedCandidateId);
      button.appendChild(el("strong", "", candidate.name));
      const sourceBits = [candidate.sourceSeason, candidate.sourceClubName].filter(Boolean);
      const clubLine = sourceBits.length ? `${sourceBits.join(" · ")} · ` : "";
      button.appendChild(el("small", "", `${clubLine}${candidate.nat} · ${candidate.pos.map((p) => POSITION_NAMES[p]).join("/")}`));
      button.appendChild(el("span", "rate", String(candidate.rate)));
      button.addEventListener("click", () => {
        transfer.selectedCandidateId = candidate.id;
        renderPitch();
        renderCandidates();
        updateSpinControls();
        document.querySelector(".pitch-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      ui.candidates.appendChild(button);
    });
  }

  function mysteryRiskName(risk) {
    return risk === "safe" ? uiText("稳健选择", "Safe Pick")
      : risk === "risky" ? uiText("高风险目标", "High-Risk Target")
      : uiText("未知新援", "Unknown Signing");
  }

  function transferUnitName(unit) {
    return {
      GK: uiText("门将", "Goalkeeper"),
      DEF: uiText("后卫", "Defender"),
      MID: uiText("中场", "Midfielder"),
      ATT: uiText("前锋", "Forward")
    }[unit] || unit;
  }

  function renderMysteryCandidates(transfer) {
    const revealedId = transfer.revealedCandidateId;
    transfer.candidates.forEach((candidate, index) => {
      if (revealedId && candidate.id !== revealedId) return;
      const revealed = candidate.id === revealedId;
      const button = el("button", `candidate mystery-box${revealed ? " revealed pending" : ""}`, "");
      button.type = "button";
      if (revealed) {
        button.appendChild(el("span", "mystery-risk", mysteryRiskName(candidate.mysteryRisk)));
        button.appendChild(el("strong", "", candidate.name));
        button.appendChild(el("small", "", [candidate.sourceSeason, candidate.sourceClubName, candidate.nat].filter(Boolean).join(" · ")));
        button.appendChild(el("small", "", candidate.pos.map((pos) => POSITION_NAMES[pos] || pos).join("/")));
        button.appendChild(el("span", "rate", String(candidate.rate)));
        button.appendChild(el("span", "mystery-locked", uiText("已锁定，必须签下这名球员", "Locked in — this player must be signed")));
      } else {
        const unit = positionUnit(candidate.pos[0]);
        button.appendChild(el("span", "mystery-number", `0${index + 1}`));
        button.appendChild(el("strong", "", mysteryRiskName(candidate.mysteryRisk)));
        button.appendChild(el("small", "", [candidate.sourceSeason, candidate.sourceClubName, candidate.nat].filter(Boolean).join(" · ")));
        button.appendChild(el("span", "mystery-unit", transferUnitName(unit)));
        button.appendChild(el("span", "mystery-open", uiText("打开盲盒", "Open Mystery Box")));
      }
      button.addEventListener("click", () => {
        if (transfer.revealedCandidateId) return;
        transfer.revealedCandidateId = candidate.id;
        transfer.selectedCandidateId = candidate.id;
        renderTransferHeader();
        renderTransferSpinResult();
        renderPitch();
        renderCandidates();
        updateSpinControls();
        toast(uiText(`盲盒揭晓：${candidate.name}，请为他选择位置。`, `Revealed: ${candidate.name}. Choose his slot.`));
        document.querySelector(".pitch-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      ui.candidates.appendChild(button);
    });
  }

  function selectTransferSlot(index) {
    const transfer = state.transfer;
    const game = state.game;
    if (!transfer?.selectedCandidateId) return;
    const candidate = transfer.candidates.find((p) => p.id === transfer.selectedCandidateId);
    const slot = game.slots[index];
    if (!candidate || !slot?.player || !canTransferReplace(candidate, slot, transfer)) {
      const message = transfer.mode === "weak"
        ? uiText("这名球员无法提高该位置的评分，请选择标记为可补强的位置。", "This player would not improve that slot. Choose a slot marked as an upgrade.")
        : uiText("这名球员不能放到这个位置。", "This player cannot replace that slot.");
      toast(message);
      return;
    }
    const outgoing = slot.player;
    game.draftedPlayers = game.draftedPlayers.filter((p) => p.id !== outgoing.id);
    const baseRate = Number(candidate.baseRate || candidate.rate);
    const incoming = {
      ...candidate,
      baseRate,
      forced: false,
      rate: clamp(baseRate + fitBonus(slot.pos, candidate.pos), 40, 99)
    };
    slot.player = incoming;
    game.draftedPlayers.push(incoming);
    const club = candidate.sourceClubName
      ? null
      : getClub(transfer.currentSpin.clubId, transfer.currentSpin.season);
    const clubName = candidate.sourceClubName || club?.name || "";
    const transferSeason = candidate.sourceSeason || transfer.currentSpin.season;
    transfer.log.push({
      step: transfer.step,
      mode: transfer.mode,
      club: clubName,
      season: transferSeason,
      incoming: incoming.name,
      outgoing: outgoing.name,
      slot: slot.pos,
      rate: incoming.rate
    });
    transfer.completed += 1;
    transfer.currentSpin = null;
    transfer.candidates = [];
    transfer.selectedCandidateId = null;
    renderPitch();
    renderTeamRating();
    if (transfer.completed >= 2) {
      finishTransferWindow();
      return;
    }
    transfer.step = 2;
    prepareTransferStep(transfer);
  }

  function finishTransferWindow() {
    const transfer = state.transfer;
    if (!transfer) return;
    transfer.resolved = true;
    resumeAfterTransfer(transfer.sim);
  }

  function resumeAfterTransfer(sim) {
    const transfer = state.transfer;
    if (transfer && transfer.log?.length) {
      const previousProfile = sim.profileMap["我的球队"] || sim.profile;
      const previousStrength = teamStrength(previousProfile);
      const currentElo = Number.isFinite(sim.eloMap["我的球队"])
        ? sim.eloMap["我的球队"]
        : 1000 + Math.round((previousStrength - 75) * 25);
      sim.teamRating = calcTeamRating(sim.game);
      sim.profile = calcTeamProfile(sim.game);
      const startFactor = clamp(1 - transfer.log.length * TRANSFER_CHEMISTRY_LOSS, 0.9, 1);
      sim.chemistry = {
        factor: startFactor,
        startFactor,
        matchesPlayed: 0
      };
      const coachedProfile = applyCoachToProfile(sim.profile, getCoach(sim.game));
      const effectiveProfile = applyChemistryToProfile(coachedProfile, startFactor);
      sim.profileMap["我的球队"] = effectiveProfile;
      sim.eloMap["我的球队"] = currentElo + Math.round((teamStrength(effectiveProfile) - previousStrength) * 25);
      syncDomesticCupUserProfile(sim, effectiveProfile);
      transfer.chemistryStart = startFactor;
      sim.game.transferChemistry = { startFactor };
    }
    state.transfer = null;
    ui.transferPanel.classList.add("hidden");
    ui.transferIntro.classList.remove("hidden");
    ui.transferContent.classList.add("hidden");
    ui.rerollBtn.classList.add("hidden");
    document.querySelector(".wheel-card")?.classList.remove("hidden");
    document.querySelector(".game-layout")?.classList.add("hidden");
    ui.simulationPanel.classList.remove("hidden");
    renderSimulationStep(sim);
    setTimeout(() => simulateNextMatch(sim), 450);
  }

  function draftPlayer(playerId) {
    const game = state.game;
    const candidate = game.candidates.find((p) => p.id === playerId);
    if (!candidate || isDrafted(playerId)) {
      toast("这名球员已经不能被选中。");
      return;
    }
    const compatible = game.slots.some((slot) => !slot.player && (canPlaySlot(candidate, slot.pos) || canForcePlace(candidate, slot.pos)));
    if (!compatible) {
      toast("这名球员没有可踢的空位，请先腾出兼容位置。");
      return;
    }
    state.pendingDraftPlayerId = candidate.id;
    state.selectedSlotIndex = null;
    renderPitch();
    renderCandidates();
  }

  function fitBonus(slotPos, playerPositions, forced) {
    if (canPlaySlot({ pos: playerPositions }, slotPos)) return 0;
    const unit = (p) => {
      if (p === "GK") return "gk";
      if (["RB", "CB", "LB", "RWB", "LWB"].includes(p)) return "def";
      if (["CDM", "CM", "CAM", "RM", "LM"].includes(p)) return "mid";
      return "att";
    };
    const base = unit(slotPos) === unit(playerPositions[0]) ? -1 : -4;
    return forced ? base - FORCED_FIT_PENALTY : base;
  }

  function renderTeamRating() {
    if (isRatingsHidden(state.game)) {
      ui.teamRating.textContent = "?";
      return;
    }
    const rating = calcTeamRating(state.game);
    ui.teamRating.textContent = rating ? String(rating) : "--";
  }

  function calcTeamRating(game) {
    if (!game) return null;
    const weights = { GK: 1, DEF: 1.2, MID: 1.1, ATT: 1.15 };
    let sum = 0;
    let total = 0;
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      const unit = positionUnit(slot.pos);
      const weight = weights[unit] || 1;
      sum += slot.player.rate * weight;
      total += weight;
    });
    return total ? Math.round(sum / total) : null;
  }

  function calcTeamProfile(game) {
    if (!game) return { attack: 80, midfield: 80, defense: 80, goalkeeper: 80, overall: 80 };
    const units = { ATT: [], MID: [], DEF: [], GK: [] };
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      units[positionUnit(slot.pos)].push(Number(slot.player.rate || 0));
    });
    const avg = (list) => list.length ? Math.round(list.reduce((sum, value) => sum + value, 0) / list.length) : 80;
    const attCount = units.ATT.length;
    const midCount = units.MID.length;
    const attack = avg(units.ATT) * 0.75 + avg([...units.ATT, ...units.MID]) * 0.25;
    const midfield = avg([...units.MID, ...units.ATT.slice(0, 1)]) + (midCount - 3) * 0.8;
    const defense = avg(units.DEF) + (units.DEF.length - 4) * 1.2;
    const goalkeeper = avg(units.GK);
    return {
      attack: clamp(Math.round(attack), 40, 99),
      midfield: clamp(Math.round(midfield), 40, 99),
      defense: clamp(Math.round(defense), 40, 99),
      goalkeeper: clamp(Math.round(goalkeeper), 40, 99),
      overall: clamp(Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14), 40, 99)
    };
  }

  function applyCoachToProfile(profile, coach) {
    if (!coach?.effects) return { ...profile };
    const effects = coach.effects;
    const attack = clamp(Number(profile.attack || 80) + Number(effects.attack || 0), 40, 96);
    const midfield = clamp(Number(profile.midfield || 80) + Number(effects.midfield || 0), 40, 96);
    const defense = clamp(Number(profile.defense || 80) + Number(effects.defense || 0), 40, 96);
    const goalkeeper = clamp(Number(profile.goalkeeper || 80) + Number(effects.goalkeeper || 0), 40, 96);
    return {
      attack,
      midfield,
      defense,
      goalkeeper,
      overall: clamp(Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14), 40, 96)
    };
  }

  function positionUnit(pos) {
    if (pos === "GK") return "GK";
    if (["RB", "CB", "LB", "RWB", "LWB"].includes(pos)) return "DEF";
    if (["CDM", "CM", "CAM", "RM", "LM"].includes(pos)) return "MID";
    return "ATT";
  }

  function teamStrength(profile) {
    return G38SimulationCore.teamStrength(profile);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const phases = [
      profile.attack || 78,
      profile.midfield || 78,
      profile.defense || 78,
      profile.goalkeeper || profile.defense || 78
    ];
    const mean = phases.reduce((sum, value) => sum + value, 0) / phases.length;
    const min = Math.min(...phases);
    const blended = mean * 0.82 + min * 0.18;
    const overall = profile.overall || mean;
    const anchored = overall * 0.75 + blended * 0.25;
    return clamp(anchored, 40, 99);
  }

  function applyChemistryToProfile(profile, factor = 1) {
    const chemistry = clamp(Number(factor) || 1, 0.9, 1);
    const adjust = (value) => {
      const rating = Number(value || 75);
      return clamp(CHEMISTRY_RATING_FLOOR + (rating - CHEMISTRY_RATING_FLOOR) * chemistry, 40, 99);
    };
    return {
      attack: adjust(profile.attack),
      midfield: adjust(profile.midfield),
      defense: adjust(profile.defense),
      goalkeeper: adjust(profile.goalkeeper),
      overall: adjust(profile.overall)
    };
  }

  function advanceTransferChemistry(sim) {
    if (!sim?.chemistry || sim.chemistry.factor >= 1) return;
    const previousProfile = sim.profileMap["我的球队"] || sim.profile;
    const previousStrength = teamStrength(previousProfile);
    sim.chemistry.matchesPlayed += 1;
    sim.chemistry.factor = clamp(sim.chemistry.factor + TRANSFER_CHEMISTRY_RECOVERY, 0.9, 1);
    const coachedProfile = applyCoachToProfile(sim.profile, getCoach(sim.game));
    const effectiveProfile = applyChemistryToProfile(coachedProfile, sim.chemistry.factor);
    sim.profileMap["我的球队"] = effectiveProfile;
    const currentElo = Number(sim.eloMap["我的球队"] || 1000);
    sim.eloMap["我的球队"] = currentElo + Math.round((teamStrength(effectiveProfile) - previousStrength) * 25);
    syncDomesticCupUserProfile(sim, effectiveProfile);
  }

  function createLeagueSchedule(names) {
    return G38SimulationCore.createLeagueSchedule(names);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const order = names.slice();
    const size = order.length;
    const firstRounds = [];
    const secondRounds = [];
    for (let round = 0; round < size - 1; round += 1) {
      const first = [];
      const second = [];
      for (let index = 0; index < size / 2; index += 1) {
        let home = order[index];
        let away = order[size - 1 - index];
        if (!home || !away || home === away) continue;
        first.push({ home, away });
        second.push({ home: away, away: home });
      }
      firstRounds.push(first);
      secondRounds.push(second);
      const last = order.pop();
      order.splice(1, 0, last);
    }
    const applyFlips = (rounds, baseRound) => {
      rounds.forEach((round, r) => {
        const actualRound = baseRound + r;
        const originalUserHome = round.some((match) => match.home === "我的球队");
        const desiredHome = actualRound % 2 === 0;
        if (originalUserHome !== desiredHome) {
          round.forEach((match) => {
            const swap = match.home;
            match.home = match.away;
            match.away = swap;
          });
        }
      });
    };
    applyFlips(firstRounds, 0);
    applyFlips(secondRounds, size - 1);
    return [...firstRounds.flat(), ...secondRounds.flat()];
  }

  function createLeagueTable(names) {
    return G38SimulationCore.createLeagueTable(names);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const table = {};
    names.forEach((name) => {
      table[name] = {
        name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        isUser: name === "我的球队"
      };
    });
    return table;
  }

  function buildProfileMap(game, names) {
    const profiles = buildLeagueProfileMap(game, names);
    const map = {};
    names.forEach((name) => {
      if (name === "我的球队") {
        const userProfile = applyCoachToProfile(calcTeamProfile(game), getCoach(game));
        map[name] = {
          ...userProfile,
          attack: clamp(userProfile.attack, 40, 99),
          midfield: clamp(userProfile.midfield, 40, 99),
          defense: clamp(userProfile.defense, 40, 99),
          goalkeeper: clamp(userProfile.goalkeeper, 40, 99),
          overall: clamp(userProfile.overall, 40, 99)
        };
        return;
      }
      map[name] = profiles[name] || { attack: 78, midfield: 78, defense: 78, goalkeeper: 78, overall: 78 };
    });
    return map;
  }

  function eloExpected(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  function createEloMap(profileMap) {
    return G38SimulationCore.createEloMap(profileMap);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const map = {};
    Object.entries(profileMap).forEach(([name, profile]) => {
      map[name] = 1000 + Math.round((teamStrength(profile) - 75) * 25);
    });
    return map;
  }
  function simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway) {
    return G38SimulationCore.simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const hasElo = Number.isFinite(eloHome) && Number.isFinite(eloAway);
    const homeStrength = teamStrength(homeProfile);
    const awayStrength = teamStrength(awayProfile);
    const baseDiff = homeStrength - awayStrength + 1;
    const strengthExpected = clamp(1 / (1 + Math.pow(10, -baseDiff / 8)), 0.06, 0.88);
    const expectedHome = hasElo
      ? clamp(eloExpected(eloHome, eloAway) * 0.7 + strengthExpected * 0.3, 0.06, 0.94)
      : strengthExpected;
    const diff = hasElo ? eloHome - eloAway : baseDiff;
    const winChance = clamp(expectedHome, 0.06, 0.88);
    const drawChance = clamp(0.3 - Math.abs(diff) * 0.008, 0.15, 0.34);
    const roll = (rng() + rng()) / 2;
    const result = roll < winChance ? "H" : roll < winChance + drawChance ? "D" : "A";
    const expectedFor = clamp(
      0.85
        + (homeProfile.attack - awayProfile.defense) * 0.055
        + (homeProfile.midfield - awayProfile.midfield) * 0.02,
      0.4,
      2.8
    );
    const expectedAgainst = clamp(
      0.8
        + (awayProfile.attack - homeProfile.defense) * 0.05
        + (awayProfile.midfield - homeProfile.midfield) * 0.02
        - (homeProfile.goalkeeper - 80) * 0.018,
      0.35,
      2.6
    );
    let gf = clamp(poisson(expectedFor, rng), 0, 7);
    let ga = clamp(poisson(expectedAgainst, rng), 0, 7);
    if (result === "D") {
      const avg = Math.round((gf + ga) / 2);
      gf = avg;
      ga = avg;
    } else if (result === "H" && gf <= ga) {
      gf = ga + 1;
    } else if (result === "A" && ga <= gf) {
      ga = gf + 1;
    }
    let newEloHome = eloHome;
    let newEloAway = eloAway;
    if (hasElo) {
      const actualHome = result === "H" ? 1 : result === "D" ? 0.5 : 0;
      const k = 18;
      newEloHome = eloHome + k * (actualHome - expectedHome);
      newEloAway = eloAway + k * ((1 - actualHome) - (1 - expectedHome));
    }
    return { homeName, gf, ga, result, newEloHome, newEloAway };
  }

  function applyLeagueResult(table, homeName, awayName, gf, ga) {
    G38SimulationCore.applyLeagueResult(table, homeName, awayName, gf, ga);
    return;
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const home = table[homeName];
    const away = table[awayName];
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += gf;
    home.goalsAgainst += ga;
    away.goalsFor += ga;
    away.goalsAgainst += gf;
    if (gf > ga) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (gf === ga) {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    } else {
      home.losses += 1;
      away.wins += 1;
      away.points += 3;
    }
    home.goalDiff = home.goalsFor - home.goalsAgainst;
    away.goalDiff = away.goalsFor - away.goalsAgainst;
  }

  function simulateAIMatches(schedule, profileMap, rng, table, eloMap) {
    schedule.forEach((match) => {
      if (match.home === "我的球队" || match.away === "我的球队") return;
      const result = simulateLeagueResult(
        profileMap[match.home],
        profileMap[match.away],
        rng,
        match.home,
        eloMap[match.home],
        eloMap[match.away]
      );
      eloMap[match.home] = result.newEloHome;
      eloMap[match.away] = result.newEloAway;
      applyLeagueResult(table, match.home, match.away, result.gf, result.ga);
    });
  }

  function simulateSeason() {
    const game = state.game;
    if (!game || game.draftedPlayers.length < 11) {
      toast("先填满 11 个位置。");
      return;
    }
    if (game.simulation) {
      toast("模拟正在进行中。");
      return;
    }
    if (!game.league) {
      renderLeagueChoice();
      toast("先选择你要加入的联赛。");
      document.querySelector("#leagueChoice")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const teamRating = calcTeamRating(game);
    const profile = calcTeamProfile(game);
    const teamNames = [...new Set(getLeagueTeams(game))];
    const profileMap = buildProfileMap(game, teamNames);
    const schedule = createLeagueSchedule(teamNames);
    const table = createLeagueTable(teamNames);
    const eloMap = createEloMap(profileMap);
    const seed = hashSeed(`${game.id}|${game.slots.map((s) => s.player.id).join(",")}`);
    const rng = makeRng(seed);
    const userMatches = schedule.filter((match) => match.home === "我的球队" || match.away === "我的球队");
    if (userMatches.some((match) => match.home === match.away)) {
      toast("赛程生成异常，请刷新后重新开始模拟。");
      return;
    }
    const simulation = {
      game,
      teamRating,
      profile,
      profileMap,
      eloMap,
      schedule,
      table,
      userMatches,
      rng,
      matchCount: userMatches.length,
      index: 0,
      allIndex: 0,
      transferPoint: Math.floor(schedule.length / 2),
      transferState: null,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      matches: [],
      scorers: new Map(),
      playerStats: new Map()
    };
    simulation.domesticCup = createDomesticCupSimulation(simulation);
    game.simulation = simulation;
    ui.leagueChoice.classList.add("hidden");
    document.querySelector(".game-layout")?.classList.add("hidden");
    ui.simulationPanel.classList.remove("hidden");
    ui.simulateBtn.disabled = true;
    renderSimulationStep(simulation);
    simulateNextMatch(simulation);
  }

  function simulateNextMatch(sim) {
    if (shouldPlayDomesticCupRound(sim)) {
      simulateDomesticCupRound(sim);
      renderSimulationStep(sim);
      setTimeout(() => simulateNextMatch(sim), 600);
      return;
    }
    const transferResolved = Boolean(sim.transferState?.resolved);
    while (
      sim.allIndex < sim.schedule.length
      && (transferResolved || sim.allIndex < sim.transferPoint)
      && sim.schedule[sim.allIndex].home !== "我的球队"
      && sim.schedule[sim.allIndex].away !== "我的球队"
    ) {
      simulateAIFixture(sim, sim.schedule[sim.allIndex]);
      sim.allIndex += 1;
    }

    if (sim.allIndex >= sim.schedule.length) {
      finishSimulation(sim);
      return;
    }

    if (sim.allIndex >= sim.transferPoint && openTransferWindow(sim)) {
      return;
    }

    const fixture = sim.schedule[sim.allIndex];
    const match = simulateOneMatch(sim);
    sim.allIndex += 1;
    applyLeagueResult(sim.table, fixture.home, fixture.away, match.homeGoals, match.awayGoals);
    sim.matches.push(match);
    sim.wins += match.result === "W" ? 1 : 0;
    sim.draws += match.result === "D" ? 1 : 0;
    sim.losses += match.result === "L" ? 1 : 0;
    sim.goalsFor += match.gf;
    sim.goalsAgainst += match.ga;
    (match.scorerStats || match.scorers || []).forEach((scorer) => {
      if (!scorer || typeof scorer === "string") return;
      const stat = sim.playerStats.get(scorer.id) || { id: scorer.id, name: scorer.name, apps: 0, goals: 0, assists: 0 };
      stat.goals += 1;
      sim.playerStats.set(scorer.id, stat);
      sim.scorers.set(scorer.name, (sim.scorers.get(scorer.name) || 0) + 1);
    });
    (match.assists || []).forEach((assist) => {
      if (!assist) return;
      const stat = sim.playerStats.get(assist.id) || { id: assist.id, name: assist.name, apps: 0, goals: 0, assists: 0 };
      stat.assists += 1;
      sim.playerStats.set(assist.id, stat);
    });
    sim.game.slots.forEach((slot) => {
      if (!slot.player) return;
      const stat = sim.playerStats.get(slot.player.id) || { id: slot.player.id, name: slot.player.name, apps: 0, goals: 0, assists: 0 };
      stat.apps += 1;
      sim.playerStats.set(slot.player.id, stat);
    });
    advanceTransferChemistry(sim);
    renderSimulationStep(sim);
    if (sim.allIndex >= sim.transferPoint && openTransferWindow(sim)) {
      return;
    }
    setTimeout(() => simulateNextMatch(sim), 600);
  }

  function simulateAIFixture(sim, fixture) {
    const result = simulateLeagueResult(
      sim.profileMap[fixture.home],
      sim.profileMap[fixture.away],
      sim.rng,
      fixture.home,
      sim.eloMap[fixture.home],
      sim.eloMap[fixture.away]
    );
    sim.eloMap[fixture.home] = result.newEloHome;
    sim.eloMap[fixture.away] = result.newEloAway;
    applyLeagueResult(sim.table, fixture.home, fixture.away, result.gf, result.ga);
  }

  function simulateOneMatch(sim) {
    const index = sim.index;
    const fixture = sim.userMatches[index];
    const homeIsUser = fixture.home === "我的球队";
    const opponentName = homeIsUser ? fixture.away : fixture.home;
    const userProfile = sim.profileMap["我的球队"] || sim.profile;
    const opponentProfile = sim.profileMap[opponentName] || { attack: 78, midfield: 78, defense: 78, goalkeeper: 78, overall: 78 };
    const raw = simulateLeagueResult(
      homeIsUser ? userProfile : opponentProfile,
      homeIsUser ? opponentProfile : userProfile,
      sim.rng,
      fixture.home,
      sim.eloMap[fixture.home],
      sim.eloMap[fixture.away]
    );
    sim.eloMap[fixture.home] = raw.newEloHome;
    sim.eloMap[fixture.away] = raw.newEloAway;
    const gf = homeIsUser ? raw.gf : raw.ga;
    const ga = homeIsUser ? raw.ga : raw.gf;
    const result = homeIsUser
      ? (raw.result === "H" ? "W" : raw.result === "D" ? "D" : "L")
      : (raw.result === "H" ? "L" : raw.result === "D" ? "D" : "W");
    const scorerStats = assignScorers(gf, sim.game.slots, sim.rng);
    const assistStats = assignAssists(
      gf,
      sim.game.slots,
      sim.rng,
      scorerStats.map((scorer) => scorer.id)
    );
    sim.index += 1;
    return {
      round: index + 1,
      opponent: opponentName,
      opponentStrength: teamStrength(opponentProfile),
      home: homeIsUser,
      homeGoals: raw.gf,
      awayGoals: raw.ga,
      gf,
      ga,
      result,
      scorers: scorerStats.map((scorer) => scorer.name),
      scorerStats,
      assists: assistStats.map((assist) => assist ? { id: assist.id, name: assist.name } : null)
    };
  }

  function renderSimulationStep(sim) {
    ui.simulationProgress.textContent = `${sim.matches.length}/${sim.matchCount}`;
    ui.simulationCurrent.innerHTML = "";
    if (sim.matches.length) {
      const match = sim.matches[sim.matches.length - 1];
      const box = el("div", "sim-match-current", "");
      box.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
      box.appendChild(el("span", "match-round", `R${match.round}`));
      box.appendChild(el("strong", "", `${match.home ? "主队" : "客队"} vs ${match.opponent}`));
      box.appendChild(el("span", "match-score", `${match.gf}-${match.ga}`));
      box.appendChild(el("small", "", match.scorers.length ? `进球：${match.scorers.join("、")}` : "无进球"));
      ui.simulationCurrent.appendChild(box);
    }
    const cup = sim.domesticCup;
    const userStillInCup = cup?.currentTeams?.some((team) => team.isUser);
    if (cup && !cup.finished && userStillInCup) {
      const stage = DOMESTIC_CUP_STAGES[cup.roundIndex] || "决赛";
      ui.simulationCurrent.appendChild(el("span", "cup-status", uiText(`${cup.name} · ${stage}`, `${cup.nameEn} · ${domesticCupStageText(stage)}`)));
    }
    ui.simulationLatest.innerHTML = "";
    sim.matches.slice(-8).reverse().forEach((match) => {
      const row = el("div", "sim-match-row", "");
      row.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
      row.appendChild(el("span", "match-round", `R${match.round}`));
      row.appendChild(el("span", "", `${match.home ? "主" : "客"} ${match.gf}-${match.ga} ${match.opponent}`));
      ui.simulationLatest.appendChild(row);
    });
  }

  function finishSimulation(sim) {
    while (sim.domesticCup && !sim.domesticCup.finished) simulateDomesticCupRound(sim);
    const game = sim.game;
    const points = sim.wins * 3 + sim.draws;
    const maxFinish = leagueTeamCount(game.league);
    let finish = rankFromPoints(points, maxFinish);
    const topScorer = [...sim.scorers.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    const playerStats = buildPlayerStats(sim);
    const leagueTable = buildLeagueTable(game, {
      wins: sim.wins,
      draws: sim.draws,
      losses: sim.losses,
      goalsFor: sim.goalsFor,
      goalsAgainst: sim.goalsAgainst,
      points,
      finish
    }, sim);
    finish = leagueTable.find((row) => row.isUser)?.position || finish;
    const europeQualification = getEuropeanQualification(game, finish);
    const achievements = collectAchievements({
      wins: sim.wins,
      draws: sim.draws,
      losses: sim.losses,
      goalsFor: sim.goalsFor,
      goalsAgainst: sim.goalsAgainst,
      points,
      finish,
      teamRating: sim.teamRating,
      uclPlaces: europeQualification.allocation.ucl,
      domesticCupChampion: Boolean(sim.domesticCup?.champion?.isUser)
    });
    game.result = {
      matches: sim.matches,
      wins: sim.wins,
      draws: sim.draws,
      losses: sim.losses,
      goalsFor: sim.goalsFor,
      goalsAgainst: sim.goalsAgainst,
      points,
      finish,
      teamRating: sim.teamRating,
      seed: hashSeed(`${game.id}|${game.slots.map((s) => s.player.id).join(",")}`),
      simVersion: SIM_VERSION,
      topScorer,
      achievements,
      playerStats,
      leagueTable,
      domesticCup: domesticCupResult(sim.domesticCup),
      europeQualification,
      transferLog: sim.transferState?.log || [],
      transferSkipped: Boolean(sim.transferState?.skipped),
      transferChemistry: sim.transferState?.chemistryStart
        ? { startFactor: sim.transferState.chemistryStart }
        : null
    };
    game.transferLog = sim.transferState?.log || [];
    game.transferSkipped = Boolean(sim.transferState?.skipped);
    game.phase = "complete";
    game.simulation = null;
    saveGame();
    addRun(game);
    renderHomeHistory();
    renderResult(game);
  }

  function buildPlayerStats(sim) {
    const rateById = new Map();
    sim.game.slots.forEach((slot) => {
      if (slot.player) rateById.set(slot.player.id, slot.player.rate || 0);
    });
    return [...sim.playerStats.values()]
      .map((stat) => ({
        ...stat,
        rate: rateById.get(stat.id) || 0,
        score: stat.goals * 5 + stat.assists * 2 + stat.apps * 0.12 + (rateById.get(stat.id) || 0) / 10
      }))
      .sort((a, b) => b.score - a.score);
  }

  function buildLeagueTable(game, summary, sim) {
    if (sim?.table) {
      return Object.values(sim.table)
        .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
        .map((row, index) => ({ ...row, position: index + 1 }));
    }
    const size = leagueTeamCount(game.league);
    const played = (size - 1) * 2;
    const rng = makeRng(hashSeed(`table-${game.id}`));
    const pool = getLeagueTeams(game).filter((name) => name !== "我的球队");
    while (pool.length < size - 1) pool.push(`对手 ${pool.length + 1}`);
    const profiles = buildLeagueProfileMap(game, getLeagueTeams(game));
    const rated = pool.map((name) => {
      const profile = profiles[name] || { overall: 78 };
      return { name, rating: profile.overall || 78 };
    }).sort((a, b) => b.rating - a.rating);
    const finish = summary.finish || rankFromPoints(summary.points, size);
    const aboveCount = Math.max(0, finish - 1);
    const belowCount = Math.max(0, size - finish);
    const rows = [];
    for (let index = 0; index < aboveCount; index += 1) {
      const gap = (aboveCount - index) * 4;
      const points = clamp(summary.points + gap + (rng() * 2 - 1), 20, played * 3);
      rows.push(makeTableRow(rated[index].name, points, played, rng, rated[index].rating));
    }
    for (let index = 0; index < belowCount; index += 1) {
      const gap = (index + 1) * 4;
      const points = clamp(summary.points - gap + (rng() * 2 - 1), 10, played * 3);
      rows.push(makeTableRow(rated[aboveCount + index].name, points, played, rng, rated[aboveCount + index].rating));
    }
    rows.push({
      name: "我的球队",
      played,
      wins: summary.wins,
      draws: summary.draws,
      losses: summary.losses,
      goalsFor: summary.goalsFor,
      goalsAgainst: summary.goalsAgainst,
      goalDiff: summary.goalsFor - summary.goalsAgainst,
      points: summary.points,
      isUser: true,
      rating: calcTeamProfile(game).overall
    });
    rows.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    return rows.map((row, index) => ({ ...row, position: index + 1 }));
  }

  function makeTableRow(name, points, played, rng, strength) {
    points = clamp(points, 0, played * 3);
    const draws = clamp(5 + Math.floor(rng() * 8), 3, Math.max(3, played - 1));
    let wins = clamp(Math.round((points - draws) / 3), 0, played - draws);
    if (wins * 3 + draws > points) wins = Math.max(0, wins - 1);
    const losses = played - wins - draws;
    points = wins * 3 + draws;
    const goalsFor = clamp(Math.round((wins * 2.3 + draws * 1.0) + (strength - 75) * 0.25 + rng() * 12), 18, 95);
    const goalsAgainst = clamp(Math.round((losses * 1.6 + draws * 0.9) + (82 - strength) * 0.18 + rng() * 10), 18, 90);
    return {
      name,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      points,
      isUser: false,
      rating: strength
    };
  }

  function getEuropeanQualification(game, finish) {
    const allocations = {
      eng: { ucl: 5, uel: 2, uecl: 1 },
      esp: { ucl: 5, uel: 2, uecl: 1 },
      ita: { ucl: 4, uel: 2, uecl: 1 },
      ger: { ucl: 4, uel: 2, uecl: 1 },
      fra: { ucl: 3, uel: 2, uecl: 1 }
    };
    const allocation = allocations[game.league] || { ucl: 0, uel: 0, uecl: 0 };
    let competition = null;
    if (finish <= allocation.ucl) competition = "UCL";
    else if (finish <= allocation.ucl + allocation.uel) competition = "UEL";
    else if (finish <= allocation.ucl + allocation.uel + allocation.uecl) competition = "UECL";
    const names = { UCL: "欧洲冠军联赛", UEL: "欧联杯", UECL: "欧协联" };
    return {
      qualified: Boolean(competition),
      competition,
      competitionName: competition ? names[competition] : "未获得欧战资格",
      finish,
      allocation,
      allocationSeason: EUROPE_ALLOCATION_SEASON
    };
  }

  function buildOpponents(game) {
    const season = simulationSeason(game);
    const pool = getLeagueTeams(game).filter((name) => name !== "我的球队");
    const filler = [
      "欧洲联队", "南美全明星", "非洲联队", "亚洲明星队", "北美联队", "世界联队",
      "传奇十一人", "青年军", "冠军联队", "欧陆豪门", "美洲冠军", "海湾之星",
      "太平洋联队", "伊比利亚明星", "地中海联队", "大西洋联队", "北欧劲旅", "东欧联队", "中东联队"
    ];
    const opponentCount = leagueTeamCount(game.league) - 1;
    while (pool.length < opponentCount) pool.push(filler[pool.length % filler.length]);
    const rng = makeRng(hashSeed(`opponents-${game.id}`));
    return shuffleWithRng([...new Set(pool)].slice(0, 60), rng).slice(0, opponentCount)
      .map((name) => {
        const club = clubsForLeague(game.league, season).find((item) => item.name === name);
        const profile = club ? calcClubProfile(club) : { attack: 78, defense: 78, overall: 78 };
        return {
          name,
          strength: profile.overall || 78,
          attack: profile.attack || 78,
          defense: profile.defense || 78
        };
      });
  }

  function calcClubProfile(club) {
    const units = { ATT: [], MID: [], DEF: [], GK: [] };
    (club.players || []).forEach((player) => {
      const pos = Array.isArray(player.pos) ? player.pos[0] : player.pos;
      const unit = pos === "GK" ? "GK" : ["RB", "CB", "LB", "RWB", "LWB"].includes(pos) ? "DEF" : ["CDM", "CM", "CAM", "RM", "LM"].includes(pos) ? "MID" : "ATT";
      units[unit].push(Number(player.rate || 0));
    });
    const topAvg = (list, count) => {
      const values = list.slice().sort((a, b) => b - a).slice(0, count);
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 78;
    };
    const attack = topAvg([...units.ATT, ...units.MID], 5);
    const midfield = topAvg(units.MID, 4);
    const defense = topAvg([...units.DEF, ...units.GK], 5);
    const goalkeeper = topAvg(units.GK, 1);
    return {
      attack: clamp(attack, 40, 99),
      midfield: clamp(midfield, 40, 99),
      defense: clamp(defense, 40, 99),
      goalkeeper: clamp(goalkeeper, 40, 99),
      overall: clamp(Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14), 40, 99)
    };
  }

  function buildLeagueProfileMap(game, names) {
    const season = simulationSeason(game);
    const clubs = clubsForLeague(game.league, season).filter((club) => names.includes(club.name));
    const eliteStrength = (club) => {
      if (ELITE_STRENGTH[club.id]) return ELITE_STRENGTH[club.id];
      const canonicalId = Object.keys(ELITE_STRENGTH)
        .find((id) => (HISTORICAL_CLUB_IDS[id] || []).includes(club.id));
      return canonicalId ? ELITE_STRENGTH[canonicalId] : 0;
    };
    const rows = clubs.map((club) => ({ club, profile: calcClubProfile(getClub(club.id, season)) }))
      .sort((a, b) => eliteStrength(b.club) - eliteStrength(a.club) || b.profile.overall - a.profile.overall);
    const count = rows.length;
    rows.forEach((item, index) => {
      const elite = eliteStrength(item.club);
      const fallback = count > 1 ? Math.round(82 - (index / (count - 1)) * 12) : 78;
      let normalized = elite
        ? clamp(Math.round(elite * 0.65 + item.profile.overall * 0.35), 70, 94)
        : fallback;
      if (game.league === "fra" && item.club.id !== "paris-sg") {
        normalized = clamp(normalized - 2, 68, 94);
      }
      const delta = normalized - item.profile.overall;
      item.profile.attack = clamp(item.profile.attack + Math.round(delta * 0.35), 40, 99);
      item.profile.midfield = clamp(item.profile.midfield + Math.round(delta * 0.25), 40, 99);
      item.profile.defense = clamp(item.profile.defense + Math.round(delta * 0.25), 40, 99);
      item.profile.goalkeeper = clamp(item.profile.goalkeeper + Math.round(delta * 0.15), 40, 99);
      item.profile.overall = normalized;
    });
    return Object.fromEntries(rows.map((item) => [item.club.name, item.profile]));
  }

    function runSeason(game, teamRating, opponents, seed) {
    const rng = makeRng(seed);
    const matches = [];
    const scorers = new Map();
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (let index = 0; index < 38; index += 1) {
      const opponent = opponents[index % opponents.length];
      const home = index % 2 === 0;
      const delta = teamRating - opponent.strength + (home ? 2 : -2);
      const winProb = clamp(0.35 + delta * 0.045, 0.06, 0.93);
      const drawProb = clamp(0.22 - Math.abs(delta) * 0.01, 0.08, 0.3);
      const roll = rng();
      const result = roll < winProb ? "W" : roll < winProb + drawProb ? "D" : "L";
      const expectedFor = clamp(0.78 + (teamRating - 78) * 0.08 + (home ? 0.25 : 0) - (opponent.strength - 80) * 0.03, 0.35, 2.6);
      const expectedAgainst = clamp(0.9 - (teamRating - 78) * 0.06 + (opponent.strength - 80) * 0.035 + (home ? -0.15 : 0.15), 0.3, 2.4);
      let gf = clamp(poisson(expectedFor, rng), 0, 7);
      let ga = clamp(poisson(expectedAgainst, rng), 0, 7);
      if (result === "D") {
        const avg = Math.round((gf + ga) / 2);
        gf = avg;
        ga = avg;
      } else if (result === "W" && gf <= ga) {
        gf = ga + 1;
      } else if (result === "L" && ga <= gf) {
        ga = gf + 1;
      }
      const scorerNames = assignScorers(gf, game.slots, rng);
      scorerNames.forEach((player) => scorers.set(player.name, (scorers.get(player.name) || 0) + 1));
      wins += result === "W" ? 1 : 0;
      draws += result === "D" ? 1 : 0;
      losses += result === "L" ? 1 : 0;
      goalsFor += gf;
      goalsAgainst += ga;
      matches.push({
        round: index + 1,
        opponent: opponent.name,
        opponentStrength: opponent.strength,
        home,
        gf,
        ga,
        result,
        scorers: scorerNames.map((player) => player.name)
      });
    }

    const points = wins * 3 + draws;
    const finish = clamp(Math.round(1 + (100 - points) / 5.5 + (rng() * 2 - 1)), 1, 20);
    const topScorer = [...scorers.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    const achievements = collectAchievements({ wins, draws, losses, goalsFor, goalsAgainst, points, finish, teamRating });

    return {
      matches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      points,
      finish,
      teamRating,
      seed,
      topScorer,
      achievements
    };
  }

  function poisson(lambda, rng) {
    if (lambda <= 0) return 0;
    const limit = Math.exp(-lambda);
    let p = 1;
    let k = 0;
    do {
      k += 1;
      p *= rng();
    } while (p > limit);
    return k - 1;
  }

  function assignScorers(goalCount, slots, rng) {
    const candidates = slots
      .filter((slot) => slot.player)
      .map((slot) => {
        const unit = positionUnit(slot.pos);
        const weight = unit === "ATT" ? 2.2 : unit === "MID" ? 0.85 : unit === "DEF" ? 0.06 : 0.02;
        return { id: slot.player.id, name: slot.player.name, weight: weight * (slot.player.rate / 85) };
      });
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    const scorers = [];
    for (let i = 0; i < goalCount; i += 1) {
      if (!candidates.length || totalWeight <= 0) {
        scorers.push({ id: "unknown", name: "无名英雄" });
        continue;
      }
      let roll = rng() * totalWeight;
      let scorerIndex = candidates.length - 1;
      for (let index = 0; index < candidates.length; index += 1) {
        roll -= candidates[index].weight;
        if (roll <= 0) {
          scorerIndex = index;
          break;
        }
      }
      scorers.push(candidates[scorerIndex]);
    }
    return scorers;
  }

  function assignAssists(goalCount, slots, rng, scorerIds) {
    const candidates = slots
      .filter((slot) => slot.player && !scorerIds.includes(slot.player.id))
      .map((slot) => {
        const unit = positionUnit(slot.pos);
        const weight = unit === "MID" ? 1.5 : unit === "ATT" ? 1.2 : unit === "DEF" ? 0.25 : 0.02;
        return { id: slot.player.id, name: slot.player.name, weight: weight * (slot.player.rate / 85) };
      });
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    const assists = [];
    for (let i = 0; i < goalCount; i += 1) {
      if (rng() < 0.38 || !candidates.length || totalWeight <= 0) {
        assists.push(null);
        continue;
      }
      let roll = rng() * totalWeight;
      let assistIndex = candidates.length - 1;
      for (let index = 0; index < candidates.length; index += 1) {
        roll -= candidates[index].weight;
        if (roll <= 0) {
          assistIndex = index;
          break;
        }
      }
      assists.push(candidates[assistIndex]);
    }
    return assists;
  }

  function collectAchievements(result) {
    const list = [];
    const played = Array.isArray(result.matches)
      ? result.matches.length
      : Number(result.wins || 0) + Number(result.draws || 0) + Number(result.losses || 0);
    if (played > 0 && result.wins === played) list.push("完美赛季");
    if (played > 0 && result.losses === 0 && result.wins < played) list.push("不败赛季");
    if (result.finish === 1) list.push("联赛冠军");
    if (result.finish <= Number(result.uclPlaces || 4)) list.push("进入欧冠区");
    if (result.goalsFor >= 100) list.push("进球破百");
    if (result.goalsAgainst <= 20) list.push("钢铁防线");
    if (result.goalsAgainst <= 10) list.push("铁幕防守");
    if (result.finish === 1 && result.teamRating <= 84) list.push("黑马夺冠");
    if (result.teamRating >= 90) list.push("世界级阵容");
    if (result.domesticCupChampion) list.push("国内杯赛冠军");
    return list;
  }

  function renderResult(game) {
    const run = game || state.game;
    if (!run || !run.result) return;
    const result = run.result;
    const leagueName = getLeague(run.league)?.name || run.league || "";
    const seasonText = run.season || run.seasonRange?.end || "";
    $("#resultMatchEyebrow").textContent = `${result.matches.length} 场比赛`;
    $("#resultBadge").textContent = `${run.formation} · ${leagueName || seasonText}`;
    $("#resultRecord").textContent = `${result.wins}-${result.draws}-${result.losses}`;
    $("#resultPoints").textContent = `${result.points} 分`;
    $("#resultScore").textContent = `${result.points} 分 · 第 ${result.finish} 名`;

    const stats = [
      [result.wins, "胜"],
      [result.draws, "平"],
      [result.losses, "负"],
      [result.goalsFor, "进球"],
      [result.goalsAgainst, "失球"],
      [result.goalsFor - result.goalsAgainst, "净胜球"],
      [result.teamRating, "阵容评分"]
    ];
    const statsBox = $("#resultStats");
    statsBox.innerHTML = "";
    stats.forEach(([value, label]) => {
      const item = el("div", "summary-stat", "");
      item.appendChild(el("strong", "", String(value)));
      item.appendChild(el("span", "", label));
      statsBox.appendChild(item);
    });

    const achievements = $("#achievements");
    achievements.innerHTML = "";
    const unlocked = Array.isArray(result.achievements) ? result.achievements : [];
    const honorCount = unlocked.length;
    const achievementCount = $("#achievementCount");
    if (achievementCount) achievementCount.textContent = uiText(`${honorCount} 项解锁`, `${honorCount} unlocked`);
    unlocked.forEach((name) => {
      const detail = ACHIEVEMENT_DETAILS[name] || ["🎖️", "完成特殊赛季目标", "Complete a special season objective"];
      const card = el("div", "achievement-card", "");
      card.appendChild(el("span", "achievement-icon", detail[0]));
      const copy = el("div", "achievement-copy", "");
      copy.appendChild(el("strong", "", name));
      copy.appendChild(el("small", "", uiText(detail[1], detail[2])));
      card.appendChild(copy);
      achievements.appendChild(card);
    });
    if (!honorCount) {
      const empty = el("div", "achievement-empty", "");
      empty.appendChild(el("strong", "", uiText("赛季已完成", "Season complete")));
      empty.appendChild(el("small", "", uiText("继续挑战更高排名与特殊赛季目标。", "Aim for a higher finish and special season objectives next time.")));
      achievements.appendChild(empty);
    }
    renderLeagueTable(result, leagueName, run.league);
    renderDomesticCup(result.domesticCup);
    renderResultLineup(run);
    renderEurope(result, run);

    const list = $("#matchList");
    list.innerHTML = "";
    result.matches.forEach((match) => {
      const row = el("div", "match-row", "");
      row.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
      row.appendChild(el("span", "match-round", `R${match.round}`));
      const teams = el("div", "match-teams", "");
      teams.appendChild(el("span", "", `${match.home ? "主" : "客"} vs ${match.opponent}`));
      teams.appendChild(el("span", "", match.scorers.length ? `进球：${match.scorers.join("、")}` : "无进球"));
      const score = el("div", "match-score", `${match.gf}-${match.ga}`);
      const resultLabel = match.result === "W" ? "胜" : match.result === "D" ? "平" : "负";
      score.appendChild(el("small", "", resultLabel));
      row.append(teams, score);
      list.appendChild(row);
    });
    showView("result");
  }

  function renderLeagueTable(result, leagueName, leagueId) {
    if (!result.leagueTable || !result.leagueTable.length) {
      ui.resultTablePanel.classList.add("hidden");
      return;
    }
    ui.resultTablePanel.classList.remove("hidden");
    ui.resultTableLeague.textContent = leagueName;
    ui.leagueTable.innerHTML = "";
    const allocation = result.europeQualification?.allocation || { ucl: 0, uel: 0, uecl: 0 };
    const legend = el("div", "league-table-legend", "");
    [
      ["zone-ucl", uiText(`前 ${allocation.ucl}：欧冠`, `Top ${allocation.ucl}: Champions League`), allocation.ucl > 0],
      ["zone-uel", uiText(`接下来 ${allocation.uel} 席：欧联`, `Next ${allocation.uel}: Europa League`), allocation.uel > 0],
      ["zone-uecl", uiText(`接下来 ${allocation.uecl} 席：欧协联`, `Next ${allocation.uecl}: Conference League`), allocation.uecl > 0],
      ["zone-playoff", uiText("保级附加赛", "Relegation play-off"), leagueId === "ger"],
      ["zone-relegation", uiText("降级区", "Relegation zone"), true]
    ].filter(([, , visible]) => visible).forEach(([className, label]) => {
      const item = el("span", "", "");
      item.appendChild(el("i", className, ""));
      item.appendChild(el("span", "", label));
      legend.appendChild(item);
    });
    ui.leagueTable.appendChild(legend);
    const scroll = el("div", "league-table-scroll", "");
    const body = el("div", "league-table-grid", "");
    const headers = ["排名", "球队", "场次", "胜", "平", "负", "进", "失", "净胜", "积分"];
    const head = el("div", "table-row table-head league-table-row", "");
    headers.forEach((text) => head.appendChild(el("span", "", text)));
    body.appendChild(head);
    result.leagueTable.forEach((row) => {
      const tr = el("div", "table-row league-table-row", "");
      tr.classList.toggle("user-row", row.isUser);
      const uelEnd = allocation.ucl + allocation.uel;
      const ueclEnd = uelEnd + allocation.uecl;
      const teamCount = result.leagueTable.length;
      if (row.position <= allocation.ucl) tr.classList.add("league-zone-ucl");
      else if (row.position <= uelEnd) tr.classList.add("league-zone-uel");
      else if (row.position <= ueclEnd) tr.classList.add("league-zone-uecl");
      else if (leagueId === "ger" && row.position === teamCount - 2) tr.classList.add("league-zone-playoff");
      else if (row.position > teamCount - (leagueId === "ger" ? 2 : 3)) tr.classList.add("league-zone-relegation");
      const goalDiff = Number(row.goalDiff || 0);
      [row.position, row.name, row.played, row.wins, row.draws, row.losses, row.goalsFor, row.goalsAgainst, goalDiff > 0 ? `+${goalDiff}` : goalDiff, row.points]
        .forEach((value) => tr.appendChild(el("span", "", String(value))));
      body.appendChild(tr);
    });
    scroll.appendChild(body);
    ui.leagueTable.appendChild(scroll);
  }

  function domesticCupProfile(strength) {
    return europeProfileFromStrength(strength);
  }

  function createDomesticCupSimulation(sim) {
    const info = DOMESTIC_CUPS[sim.game.league];
    if (!info) return null;
    const teams = Object.entries(sim.profileMap).map(([name, profile]) => ({
      name,
      profile,
      strength: teamStrength(profile),
      isUser: name === "我的球队",
      lowerLeague: false
    }));
    const needed = Math.max(0, 32 - teams.length);
    info.lowerTeams.slice(0, needed).forEach((name, index) => {
      const strength = Math.max(64, 75 - index);
      const profile = domesticCupProfile(strength);
      teams.push({ name, profile, strength: teamStrength(profile), isUser: false, lowerLeague: true });
    });
    const matchCount = sim.matchCount;
    return {
      name: info.name,
      nameEn: info.nameEn,
      championLabel: info.champion,
      championLabelEn: info.championEn,
      teams,
      currentTeams: teams,
      roundIndex: 0,
      milestones: [0.15, 0.35, 0.6, 0.8, 0.95].map((ratio) => Math.max(1, Math.round(matchCount * ratio))),
      rounds: [],
      userStage: "32强",
      champion: null,
      finished: false
    };
  }

  function shouldPlayDomesticCupRound(sim) {
    const cup = sim?.domesticCup;
    return Boolean(cup && !cup.finished && sim.matches.length >= cup.milestones[cup.roundIndex]);
  }

  function syncDomesticCupUserProfile(sim, profile = sim?.profileMap?.["我的球队"]) {
    const user = sim?.domesticCup?.teams?.find((team) => team.isUser);
    if (!user || !profile) return;
    user.profile = profile;
    user.strength = teamStrength(profile);
  }

  function simulateDomesticCupRound(sim) {
    const cup = sim.domesticCup;
    if (!cup || cup.finished) return;
    const stage = DOMESTIC_CUP_STAGES[cup.roundIndex] || "决赛";
    const shuffled = shuffleWithRng(cup.currentTeams, sim.rng);
    const ties = [];
    const winners = [];
    for (let index = 0; index < shuffled.length; index += 2) {
      const home = shuffled[index];
      const away = shuffled[index + 1];
      const tie = createEuropeanTie(home, away, false);
      tie.legs.push(simulateEuropeanTie(home, away, sim.rng, stage === "决赛"));
      finalizeEuropeanTie(tie, sim.rng);
      const result = {
        home: home.name,
        away: away.name,
        homeGoals: tie.aggregateA,
        awayGoals: tie.aggregateB,
        winner: tie.winner.name,
        isUser: home.isUser || away.isUser,
        extraTime: tie.extraTime ? { ...tie.extraTime } : null,
        penalties: tie.penalties ? { ...tie.penalties } : null
      };
      ties.push(result);
      winners.push(tie.winner);
      if (result.isUser) {
        cup.userStage = tie.winner.isUser
          ? (stage === "决赛" ? cup.championLabel : `晋级${DOMESTIC_CUP_STAGES[cup.roundIndex + 1]}`)
          : `${stage}出局`;
      }
    }
    cup.rounds.push({ name: stage, ties });
    cup.currentTeams = winners;
    cup.roundIndex += 1;
    if (winners.length === 1) {
      cup.champion = winners[0];
      cup.finished = true;
      if (winners[0].isUser) cup.userStage = cup.championLabel;
    }
  }

  function domesticCupResult(cup) {
    if (!cup) return null;
    return {
      name: cup.name,
      nameEn: cup.nameEn,
      championLabel: cup.championLabel,
      championLabelEn: cup.championLabelEn,
      userStage: cup.userStage,
      champion: cup.champion?.name || null,
      rounds: cup.rounds
    };
  }

  function domesticCupTieText(tie) {
    let text = `${tie.home} ${tie.homeGoals}-${tie.awayGoals} ${tie.away}`;
    if (tie.extraTime) text += uiText(`（加时 ${tie.extraTime.homeGoals}-${tie.extraTime.awayGoals}）`, ` (AET ${tie.extraTime.homeGoals}-${tie.extraTime.awayGoals})`);
    if (tie.penalties) text += uiText(`（点球 ${tie.penalties.home}-${tie.penalties.away}）`, ` (Pens ${tie.penalties.home}-${tie.penalties.away})`);
    return text;
  }

  function domesticCupStageText(stage) {
    const names = {
      "32强": "Round of 32",
      "16强": "Round of 16",
      "八强": "Quarter-finals",
      "半决赛": "Semi-finals",
      "决赛": "Final"
    };
    return uiText(stage, names[stage] || stage);
  }

  function domesticCupUserStageText(cup) {
    if (cup.userStage === cup.championLabel) return uiText(cup.championLabel, cup.championLabelEn || cup.championLabel);
    const qualified = String(cup.userStage || "").match(/^晋级(.+)$/);
    if (qualified) return uiText(cup.userStage, `Qualified for ${domesticCupStageText(qualified[1])}`);
    const eliminated = String(cup.userStage || "").match(/^(.+)出局$/);
    if (eliminated) return uiText(cup.userStage, `Eliminated in the ${domesticCupStageText(eliminated[1])}`);
    return domesticCupStageText(cup.userStage);
  }

  function renderDomesticCup(cup) {
    if (!cup?.rounds?.length) {
      ui.domesticCupPanel.classList.add("hidden");
      return;
    }
    ui.domesticCupPanel.classList.remove("hidden");
    ui.domesticCupTitle.textContent = uiText(cup.name, cup.nameEn || cup.name);
    ui.domesticCupStatus.innerHTML = "";
    const summary = el("div", "cup-summary", "");
    summary.appendChild(el("span", "", uiText("本队国内杯赛成绩", "Domestic cup result")));
    summary.appendChild(el("strong", "", domesticCupUserStageText(cup)));
    summary.appendChild(el("small", "", uiText(`${cup.championLabel}：${cup.champion || "--"}`, `${cup.championLabelEn || cup.championLabel}: ${cup.champion || "--"}`)));
    ui.domesticCupStatus.appendChild(summary);
    ui.domesticCupResults.innerHTML = "";
    [...cup.rounds].reverse().forEach((round) => {
      const block = el("details", "cup-round", "");
      block.open = round.name === "决赛" || round.ties.some((tie) => tie.isUser);
      block.appendChild(el("summary", "", domesticCupStageText(round.name)));
      round.ties.forEach((tie) => {
        const row = el("div", "cup-team-row", domesticCupTieText(tie));
        if (tie.isUser) row.classList.add("user-row");
        block.appendChild(row);
      });
      ui.domesticCupResults.appendChild(block);
    });
  }

  function renderAwards(result) {
    if (!result.playerStats || !result.playerStats.length) {
      ui.resultStarsPanel.classList.add("hidden");
      return;
    }
    ui.resultStarsPanel.classList.remove("hidden");
    const teamBest = result.playerStats[0];
    const goldenBoot = [...result.playerStats].sort((a, b) => b.goals - a.goals)[0];
    const mostAssists = [...result.playerStats].sort((a, b) => b.assists - a.assists)[0];
    const awards = [
      ["队内最佳球员", teamBest ? `${teamBest.name} · ${teamBest.goals}球 ${teamBest.assists}助` : "--"],
      ["金靴", goldenBoot ? `${goldenBoot.name} · ${goldenBoot.goals}球` : "--"],
      ["最多助攻", mostAssists ? `${mostAssists.name} · ${mostAssists.assists}助` : "--"]
    ];
    ui.awardStats.innerHTML = "";
    awards.forEach(([label, value]) => {
      const card = el("div", "award-card", "");
      card.appendChild(el("span", "", label));
      card.appendChild(el("strong", "", value));
      ui.awardStats.appendChild(card);
    });
    ui.playerStats.innerHTML = "";
    result.playerStats.slice(0, 11).forEach((stat, index) => {
      const row = el("div", "player-stat-row", "");
      row.appendChild(el("span", "player-rank", String(index + 1)));
      row.appendChild(el("strong", "", stat.name));
      row.appendChild(el("span", "", `${stat.apps} 场`));
      row.appendChild(el("span", "", `${stat.goals} 球`));
      row.appendChild(el("span", "", `${stat.assists} 助`));
      ui.playerStats.appendChild(row);
    });
  }

  function renderEurope(result, run) {
    const qual = result.europeQualification;
    if (!qual || !qual.qualified) {
      ui.europePanel.classList.add("hidden");
      return;
    }
    ui.europePanel.classList.remove("hidden");
    ui.europeTitle.textContent = `${qual.competitionName}资格`;
    ui.europeStatus.innerHTML = "";
    const status = el("div", "europe-status-text", "");
    status.appendChild(el("span", "", `联赛第 ${qual.finish} 名`));
    status.appendChild(el("strong", "", qual.competitionName));
    status.appendChild(el("small", "", `${uiText(`${qual.allocationSeason || EUROPE_ALLOCATION_SEASON} 名额分配`, `${qual.allocationSeason || EUROPE_ALLOCATION_SEASON} allocation`)}：欧冠 ${qual.allocation.ucl} · 欧联 ${qual.allocation.uel} · 欧协联 ${qual.allocation.uecl}`));
    ui.europeStatus.appendChild(status);
    if (run.europeResult) {
      ui.europeStartBtn.classList.add("hidden");
      renderEuropeanResult(run.europeResult);
    } else {
      ui.europeStartBtn.classList.remove("hidden");
      ui.europeResults.innerHTML = "";
    }
  }

  function startEuropeanTournament() {
    const run = state.viewingRun || state.game;
    const result = run?.result;
    const qual = result?.europeQualification;
    if (!run || !qual || !qual.qualified) return;
    if (run.europeResult) {
      renderEuropeanResult(run.europeResult);
      return;
    }
    ui.europeStartBtn.classList.add("hidden");
    ui.europeResults.innerHTML = "";
    const sim = createEuropeanSimulation(run, qual.competition);
    run.europeSim = sim;
    if (run === state.game) saveGame();
    simulateNextEuropeanStep(sim);
  }

  function buildEuropeanTeam(entry, rng) {
    const club = entry.id ? findClubInSeason(entry.id, CURRENT_DATA_SEASON) : null;
    if (club) {
      const profile = calcClubProfile(club);
      return {
        name: club.name,
        strength: teamStrength(profile),
        profile,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        isUser: false
      };
    }
    const profileName = entry.profile || entry.name;
    const fallback = europeProfileFromStrength(70 + Math.floor(rng() * 16));
    const profile = (typeof EUROPEAN_CLUB_PROFILES !== "undefined" && EUROPEAN_CLUB_PROFILES[profileName])
      || fallback;
    const strength = teamStrength(profile);
    return {
      name: entry.name,
      strength,
      profile,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      isUser: false
    };
  }

  function createEuropeanSimulation(run, competition) {
    const rng = makeRng(hashSeed(`europe-${run.id}-${competition}`));
    const entries = (typeof EUROPE_2025_26 !== "undefined" && EUROPE_2025_26[competition]) || null;
    const teams = [];
    if (entries && entries.length) {
      const nonBigFive = entries.filter((entry) => !(
        entry.id
        && typeof CLUBS !== "undefined"
        && CLUBS[entry.id]
        && BIG_FIVE_IDS.has(CLUBS[entry.id].league)
      ));
      const replaced = nonBigFive.length ? shuffleWithRng(nonBigFive, rng)[0] : null;
      entries.filter((entry) => entry !== replaced).forEach((entry) => {
        teams.push(buildEuropeanTeam(entry, rng));
      });
    } else {
      const pool = [
        "Ajax", "PSV", "Feyenoord", "FC Porto", "Benfica", "Sporting CP", "Celtic", "Rangers",
        "Club Brugge", "Anderlecht", "Galatasaray", "Fenerbahçe", "Beşiktaş", "Olympiacos", "PAOK",
        "Red Star", "Dinamo Zagreb", "Salzburg", "Shakhtar", "Dynamo Kyiv", "Copenhagen", "Malmö",
        "Slavia Prague", "Sparta Prague", "Young Boys", "Basel", "Partizan", "APOEL", "Ferencváros",
        "Midtjylland", "Bodø/Glimt", "Ludogorets", "AZ Alkmaar", "Braga", "Trabzonspor", "Slovan Bratislava"
      ];
      const replaced = shuffleWithRng(pool, rng).slice(0, 35);
      replaced.forEach((name) => {
        const fallback = europeProfileFromStrength(72 + Math.floor(rng() * 16));
        const profile = (typeof EUROPEAN_CLUB_PROFILES !== "undefined" && EUROPEAN_CLUB_PROFILES[name])
          || fallback;
        teams.push({
          name,
          strength: teamStrength(profile),
          profile,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          isUser: false
        });
      });
    }
    const userProfile = calcTeamProfile(run);
    teams.push({
      name: "\u6211\u7684\u7403\u961f",
      strength: teamStrength(userProfile),
      profile: userProfile,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      isUser: true
    });
    const matchdays = competition === "UECL" ? 6 : 8;
    return {
      run,
      competition,
      rng,
      teams,
      matchdays,
      leagueRounds: buildEuropeanLeagueRounds(teams, matchdays),
      roundIndex: 0,
      matchIndex: 0,
      phase: "league",
      logs: [],
      rounds: [],
      currentStage: null,
      leagueTable: null,
      userStage: "\u8fdb\u884c\u4e2d",
      userAlive: true,
      finished: false
    };
  }

  function buildEuropeanLeagueRounds(teams, matchdays) {
    const rounds = [];
    const order = teams.slice();
    for (let round = 0; round < matchdays; round += 1) {
      const matches = [];
      for (let index = 0; index < order.length / 2; index += 1) {
        matches.push({
          home: order[index],
          away: order[order.length - 1 - index]
        });
      }
      rounds.push({ round: round + 1, matches });
      const last = order.pop();
      order.splice(1, 0, last);
    }
    return rounds;
  }

  function simulateNextEuropeanStep(sim) {
    if (sim.finished) return;
    const delay = 24;
    if (sim.phase === "league") {
      const round = sim.leagueRounds[sim.roundIndex];
      const match = round.matches[sim.matchIndex];
      const played = simulateEuropeanTie(match.home, match.away, sim.rng, false);
      updateEuropeanStats(match.home, played.homeGoals, played.awayGoals);
      updateEuropeanStats(match.away, played.awayGoals, played.homeGoals);
      const log = {
        stage: `联赛阶段第 ${round.round} 轮`,
        text: `${match.home.name} ${played.homeGoals}-${played.awayGoals} ${match.away.name}`,
        userMatch: match.home.isUser || match.away.isUser
      };
      sim.logs.push(log);
      if (log.userMatch) renderEuropeanStep(sim, log);
      sim.matchIndex += 1;
      if (sim.matchIndex >= round.matches.length) {
        sim.matchIndex = 0;
        sim.roundIndex += 1;
        if (sim.roundIndex >= sim.leagueRounds.length) {
          prepareEuropeanKnockout(sim);
        }
      }
    } else if (sim.phase === "knockout") {
      if (!sim.currentStage) {
        finishEuropeanSimulation(sim);
        return;
      }
      const stage = sim.currentStage;
      const tie = stage.ties[stage.tieIndex];
      if (!tie) {
        finishEuropeanSimulation(sim);
        return;
      }
      if (stage.twoLeg && tie.legs.length >= 2) {
        finalizeEuropeanTie(tie, sim.rng);
        logEuropeanTieResolution(sim, stage, tie);
        stage.tieIndex += 1;
        if (stage.tieIndex >= stage.ties.length) {
          advanceEuropeanStage(sim, stage);
        }
      } else {
        const home = tie.legs.length === 0 ? tie.teamA : tie.teamB;
        const away = tie.legs.length === 0 ? tie.teamB : tie.teamA;
        const played = simulateEuropeanTie(home, away, sim.rng, false);
        tie.legs.push(played);
        const log = {
          stage: stage.name,
          text: `${home.name} ${played.homeGoals}-${played.awayGoals} ${away.name}`,
          userMatch: home.isUser || away.isUser
        };
        sim.logs.push(log);
        if (log.userMatch) renderEuropeanStep(sim, log);
        if (tie.legs.length >= (stage.twoLeg ? 2 : 1)) {
          finalizeEuropeanTie(tie, sim.rng);
          logEuropeanTieResolution(sim, stage, tie);
          stage.tieIndex += 1;
          if (stage.tieIndex >= stage.ties.length) {
            advanceEuropeanStage(sim, stage);
          }
        }
      }
    }
    setTimeout(() => simulateNextEuropeanStep(sim), delay);
  }

  function prepareEuropeanKnockout(sim) {
    const table = [...sim.teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
    table.forEach((team, index) => { team.position = index + 1; });
    sim.leagueTable = table;
    const user = table.find((team) => team.isUser);
    if (user && user.position > 24) {
      sim.userStage = "联赛阶段出局";
      sim.userAlive = false;
    } else if (user && user.position > 8) {
      sim.userStage = "进入附加赛";
    } else if (user) {
      sim.userStage = "直接进入16强";
    }
    const playoffTies = [];
    for (let index = 0; index < 8; index += 1) {
      playoffTies.push(createEuropeanTie(table[8 + index], table[23 - index], true));
    }
    sim.currentStage = { name: "附加赛", ties: playoffTies, tieIndex: 0, twoLeg: true };
    sim.phase = "knockout";
  }

  function createEuropeanTie(teamA, teamB, twoLeg) {
    return { teamA, teamB, legs: [], winner: null, twoLeg, aggregateA: 0, aggregateB: 0 };
  }

  function finalizeEuropeanTie(tie, rng) {
    if (tie.twoLeg) {
      tie.aggregateA = tie.legs[0].homeGoals + tie.legs[1].awayGoals;
      tie.aggregateB = tie.legs[0].awayGoals + tie.legs[1].homeGoals;
    } else {
      tie.aggregateA = tie.legs[0].homeGoals;
      tie.aggregateB = tie.legs[0].awayGoals;
    }
    if (tie.aggregateA !== tie.aggregateB) {
      tie.winner = tie.aggregateA > tie.aggregateB ? tie.teamA : tie.teamB;
      return;
    }
    const home = tie.twoLeg ? tie.teamB : tie.teamA;
    const away = tie.twoLeg ? tie.teamA : tie.teamB;
    const extraTime = simulateEuropeanExtraTime(home, away, rng);
    tie.extraTime = extraTime;
    if (extraTime.homeGoals !== extraTime.awayGoals) {
      tie.winner = extraTime.homeGoals > extraTime.awayGoals ? home : away;
      return;
    }
    const penalties = simulateEuropeanPenalties(home, away, rng);
    tie.penalties = penalties;
    tie.winner = penalties.winner;
  }

  function simulateEuropeanExtraTime(teamA, teamB, rng) {
    const ratingDiff = teamA.strength - teamB.strength;
    return {
      homeGoals: clamp(poisson(Math.max(0.15, 0.3 + ratingDiff * 0.025), rng), 0, 3),
      awayGoals: clamp(poisson(Math.max(0.12, 0.25 - ratingDiff * 0.02), rng), 0, 3)
    };
  }

  function simulateEuropeanPenalties(teamA, teamB, rng) {
    let home = 0;
    let away = 0;
    for (let index = 0; index < 5; index += 1) {
      home += rng() < 0.76 ? 1 : 0;
      away += rng() < 0.72 ? 1 : 0;
    }
    while (home === away) {
      home += rng() < 0.76 ? 1 : 0;
      away += rng() < 0.72 ? 1 : 0;
    }
    return {
      home,
      away,
      winner: home > away ? teamA : teamB
    };
  }

  function logEuropeanTieResolution(sim, stage, tie) {
    if (!tie.extraTime && !tie.penalties) return;
    const text = tie.penalties
      ? `点球 ${tie.penalties.home}-${tie.penalties.away}，${tie.winner.name}晋级`
      : `加时 ${tie.extraTime.homeGoals}-${tie.extraTime.awayGoals}，${tie.winner.name}晋级`;
    sim.logs.push({
      stage: stage.name,
      text,
      userMatch: tie.teamA.isUser || tie.teamB.isUser
    });
    if (sim.logs[sim.logs.length - 1].userMatch) renderEuropeanStep(sim, sim.logs[sim.logs.length - 1]);
  }

  function advanceEuropeanStage(sim, completedStage) {
    sim.rounds.push({
      name: completedStage.name,
      ties: completedStage.ties.map((tie) => ({
        home: tie.teamA,
        away: tie.teamB,
        homeGoals: tie.aggregateA,
        awayGoals: tie.aggregateB,
        winner: tie.winner,
        extraTime: tie.extraTime,
        penalties: tie.penalties
      }))
    });
    let winners = completedStage.ties.map((tie) => tie.winner);
    const userTie = completedStage.ties.find((tie) => tie.teamA?.isUser || tie.teamB?.isUser);
    if (userTie && completedStage.name === "决赛") {
      const info = EUROPE_COMPETITIONS[sim.competition] || { champion: "欧洲冠军", runnerUp: "欧战亚军" };
      sim.userStage = userTie.winner?.isUser ? info.champion : info.runnerUp;
      sim.userAlive = Boolean(userTie.winner?.isUser);
    } else if (userTie && !userTie.winner?.isUser) {
      sim.userAlive = false;
      sim.userStage = `${europeStageLabel(completedStage.name)}出局`;
    }
    if (completedStage.name === "附加赛") {
      const r16Ties = sim.leagueTable.slice(0, 8).map((team, index) => createEuropeanTie(team, winners[index], true));
      sim.currentStage = { name: "1/8决赛", ties: r16Ties, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "1/8决赛") {
      winners = shuffleWithRng(winners, sim.rng);
      const qfTies = [];
      for (let index = 0; index < winners.length; index += 2) qfTies.push(createEuropeanTie(winners[index], winners[index + 1], true));
      sim.currentStage = { name: "1/4决赛", ties: qfTies, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "1/4决赛") {
      winners = shuffleWithRng(winners, sim.rng);
      const sfTies = [];
      for (let index = 0; index < winners.length; index += 2) sfTies.push(createEuropeanTie(winners[index], winners[index + 1], true));
      sim.currentStage = { name: "半决赛", ties: sfTies, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "半决赛") {
      sim.currentStage = { name: "决赛", ties: [createEuropeanTie(winners[0], winners[1], false)], tieIndex: 0, twoLeg: false };
    } else if (completedStage.name === "决赛") {
      sim.currentStage = null;
      finishEuropeanSimulation(sim);
    }
  }

  function finishEuropeanSimulation(sim) {
    const user = sim.teams.find((team) => team.isUser);
    const finalStage = sim.rounds[sim.rounds.length - 1];
    const champion = finalStage?.ties?.[0]?.winner || null;
    const info = EUROPE_COMPETITIONS[sim.competition] || { name: sim.competitionName || sim.competition || "欧洲赛事", champion: "欧洲冠军", runnerUp: "欧战结束" };
    if (sim.userStage === "进行中") {
      const userRound = [...sim.rounds].reverse().find((round) => round.ties.some((tie) => tie.home?.isUser || tie.away?.isUser));
      if (champion?.isUser) sim.userStage = info.champion;
      else if (userRound) sim.userStage = `${europeStageLabel(userRound.name)}出局`;
      else if (user) sim.userStage = "联赛阶段出局";
      else sim.userStage = "未参赛";
    }
    sim.run.europeResult = {
      competition: sim.competition,
      competitionName: info.name,
      stage: "决赛",
      userStage: sim.userStage,
      finalResult: sim.userStage,
      champion: champion?.name || null,
      listVersion: EUROPE_LIST_VERSION,
      leagueTable: sim.leagueTable,
      rounds: sim.rounds,
      logs: sim.logs
    };
    sim.run.europeSim = null;
    sim.finished = true;
    if (sim.run === state.game) saveGame();
    updateRun(sim.run);
    renderHomeHistory();
    renderEuropeanResult(sim.run.europeResult);
  }

  function europeStageLabel(stage) {
    return {
      "1/8决赛": "十六强",
      "1/4决赛": "八强",
      "半决赛": "四强",
      "决赛": "决赛",
      "附加赛": "附加赛"
    }[stage] || stage;
  }

  function renderEuropeanStep(sim, step) {
    ui.europeResults.innerHTML = "";
    const current = el("div", "europe-summary", "");
    current.appendChild(el("strong", "", step.stage));
    current.appendChild(el("span", "", step.text));
    ui.europeResults.appendChild(current);
    const latest = el("div", "simulation-latest", "");
    const visibleLogs = sim.logs.filter((log) => log.userMatch);
    visibleLogs.slice(-14).reverse().forEach((log) => {
      const row = el("div", "sim-match-row", "");
      row.classList.toggle("user-row", Boolean(log.userMatch));
      row.appendChild(el("span", "", log.stage));
      row.appendChild(el("span", "", log.text));
      latest.appendChild(row);
    });
    ui.europeResults.appendChild(latest);
  }

  function simulateEuropeanTie(teamA, teamB, rng, neutral) {
    const homeProfile = teamA.profile || europeProfileFromStrength(teamA.strength);
    const awayProfile = teamB.profile || europeProfileFromStrength(teamB.strength);
    const result = simulateLeagueResult(homeProfile, awayProfile, rng, teamA.name);
    return {
      home: teamA,
      away: teamB,
      homeGoals: result.gf,
      awayGoals: result.ga,
      winner: result.result === "H" ? teamA : result.result === "A" ? teamB : null,
      neutral
    };
  }

  function europeProfileFromStrength(strength) {
    return {
      attack: clamp(strength - 1, 40, 99),
      midfield: clamp(strength, 40, 99),
      defense: clamp(strength - 1, 40, 99),
      goalkeeper: clamp(strength - 1, 40, 99),
      overall: clamp(strength, 40, 99)
    };
  }

  function simulateTwoLegTie(teamA, teamB, rng) {
    const first = simulateEuropeanTie(teamA, teamB, rng, false);
    const second = simulateEuropeanTie(teamB, teamA, rng, false);
    const aggregateA = first.homeGoals + second.awayGoals;
    const aggregateB = first.awayGoals + second.homeGoals;
    let winner = null;
    if (aggregateA > aggregateB) winner = teamA;
    else if (aggregateB > aggregateA) winner = teamB;
    else winner = rng() < 0.5 ? teamA : teamB;
    return {
      home: teamA,
      away: teamB,
      homeGoals: aggregateA,
      awayGoals: aggregateB,
      winner,
      legs: [first, second]
    };
  }

  function updateEuropeanStats(team, goalsFor, goalsAgainst) {
    if (!team) return;
    team.played = Number(team.played || 0) + 1;
    if (goalsFor > goalsAgainst) team.wins = Number(team.wins || 0) + 1;
    else if (goalsFor === goalsAgainst) team.draws = Number(team.draws || 0) + 1;
    else team.losses = Number(team.losses || 0) + 1;
    team.points += goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
    team.goalsFor += goalsFor;
    team.goalsAgainst += goalsAgainst;
  }

  function renderEuropeanResult(europeResult) {
    ui.europeResults.innerHTML = "";
    const info = EUROPE_COMPETITIONS[europeResult.competition] || { name: europeResult.competitionName || "欧洲赛事", champion: "欧洲冠军", runnerUp: "欧战结束" };
    const summary = el("div", "europe-summary europe-final", "");
    summary.appendChild(el("span", "europe-final-label", `本队${info.name}最终成绩`));
    summary.appendChild(el("strong", "", europeResult.userStage || europeResult.stage || "已完成"));
    if (europeResult.champion) summary.appendChild(el("span", "europe-champion", `${info.name}冠军：${europeResult.champion}`));
    ui.europeResults.appendChild(summary);
    if (europeResult.leagueTable) {
      const details = el("details", "europe-block europe-collapse", "");
      details.open = true;
      const heading = el("summary", "europe-table-summary", "");
      heading.appendChild(el("h3", "", `${info.name} 36 队联赛阶段积分表`));
      details.appendChild(heading);
      const legend = el("div", "europe-table-legend", "");
      [
        ["zone-direct", uiText("前 8：直接晋级 16 强", "Top 8: Round of 16")],
        ["zone-playoff", uiText("第 9–24：淘汰赛附加赛", "9–24: Knockout play-offs")],
        ["zone-out", uiText("第 25–36：出局", "25–36: Eliminated")]
      ].forEach(([className, label]) => {
        const item = el("span", "", "");
        item.appendChild(el("i", className, ""));
        item.appendChild(el("span", "", label));
        legend.appendChild(item);
      });
      details.appendChild(legend);
      const scroll = el("div", "europe-table-scroll", "");
      const body = el("div", "europe-league-table", "");
      const header = el("div", "table-row table-head europe-table-row", "");
      ["排名", "球队", "场次", "胜", "平", "负", "进球", "失球", "净胜球", "积分"]
        .forEach((label) => header.appendChild(el("span", "", label)));
      body.appendChild(header);
      europeResult.leagueTable.forEach((team) => {
        const row = el("div", "table-row europe-table-row", "");
        row.classList.toggle("user-row", Boolean(team.isUser));
        if (team.isUser) row.classList.add("europe-user-highlight");
        row.classList.add(team.position <= 8 ? "europe-zone-direct" : team.position <= 24 ? "europe-zone-playoff" : "europe-zone-out");
        const goalDiff = Number(team.goalsFor || 0) - Number(team.goalsAgainst || 0);
        const values = [
          team.position,
          team.name,
          team.played ?? "-",
          team.wins ?? "-",
          team.draws ?? "-",
          team.losses ?? "-",
          team.goalsFor,
          team.goalsAgainst,
          goalDiff > 0 ? `+${goalDiff}` : goalDiff,
          team.points
        ];
        values.forEach((value) => row.appendChild(el("span", "", String(value))));
        body.appendChild(row);
      });
      scroll.appendChild(body);
      details.appendChild(scroll);
      ui.europeResults.appendChild(details);
    }
    const userLogs = (europeResult.logs || []).filter((log) => log.userMatch);
    if (userLogs.length) {
      const block = el("div", "europe-round", "");
      block.appendChild(el("h3", "", "我的赛果"));
      userLogs.forEach((log) => {
        const row = el("div", "europe-team-row", "");
        row.appendChild(el("span", "", `${log.stage} · ${log.text}`));
        block.appendChild(row);
      });
      ui.europeResults.appendChild(block);
    }
  }

  function addRun(game) {
    const runs = loadRuns();
    runs.unshift({ ...game });
    safeSet(STORAGE_RUNS, runs.slice(0, 20));
  }

  function updateRun(game) {
    const runs = loadRuns();
    const index = runs.findIndex((run) => run.id === game.id);
    const saved = { ...game, europeSim: null };
    if (index >= 0) runs[index] = saved;
    else runs.unshift(saved);
    safeSet(STORAGE_RUNS, runs.slice(0, 20));
  }

  function loadRuns() {
    const raw = Array.isArray(safeGet(STORAGE_RUNS)) ? safeGet(STORAGE_RUNS) : [];
    const clean = raw.filter((run) => !isBadRun(run) && !isStaleSimulationResult(run));
    let changed = clean.length !== raw.length;
    clean.forEach((run) => {
      if (isStaleEuropeResult(run)) {
        run.europeResult = null;
        run.europeSim = null;
        changed = true;
      }
    });
    if (clean.length !== raw.length || changed) safeSet(STORAGE_RUNS, clean);
    return clean;
  }

  function viewRun(run) {
    if (!run?.result || isBadRun(run)) return;
    clearStaleEuropeResult(run);
    state.viewingRun = run;
    renderResult(run);
  }

  function goBackFromResult() {
    state.viewingRun = null;
    showView("setup");
    renderHomeHistory();
  }

  function shareResult() {
    const run = state.viewingRun || state.game;
    if (!run?.result) return;
    const result = run.result;
    const text = `Global 38-0：我用了 ${run.formation} 阵容，${result.wins}-${result.draws}-${result.losses}，${result.points} 分，第 ${result.finish} 名。敢来挑战吗？`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("战报已复制")).catch(() => toast("复制失败，可以手动复制。"));
    } else {
      toast(text);
    }
  }

  function drawWheel() {
    const game = state.game;
    const spin = state.transfer?.currentSpin || game?.currentSpin;
    if (!spin) {
      renderSlotReel("season", [], 0, false);
      renderSlotReel("club", [], 0, false);
      return;
    }
    const club = getClub(spin.clubId, spin.season);
    const seasonOptions = seasonsInRange(game?.seasonRange).map((season) => ({
      primary: season,
      meta: uiText("赛季", "SEASON")
    }));
    const seasonIndex = Math.max(0, seasonOptions.findIndex((item) => item.primary === spin.season));
    const clubItem = {
      primary: club?.name || uiText("未知球队", "Unknown Club"),
      meta: `${getLeague(spin.leagueId)?.code || "CLB"} · ${club?.short || "---"}`
    };
    renderSlotReel("season", seasonOptions, seasonIndex, true);
    renderSlotReel("club", [clubItem], 0, true);
  }

  function hashSeed(value) {
    return G38SimulationCore.hashSeed(value);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function makeRng(seed) {
    return G38SimulationCore.makeRng(seed);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    let value = seed >>> 0;
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function shuffleWithRng(items, rng) {
    return G38SimulationCore.shuffleWithRng(items, rng);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  init();
})();
