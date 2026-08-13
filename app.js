(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const STORAGE_GAME = "g38-game-state-v4";
  const STORAGE_RUNS = "g38-runs-v2";
  const CURRENT_DATA_SEASON = "2025-26";
  const EUROPE_ALLOCATION_SEASON = "2026-27";
  const BIG_FIVE_IDS = new Set(["eng", "esp", "ita", "ger", "fra"]);
  const { canPlaySlot, isForceableMidfielder, midfielderForcedPenalty } = G38PositionFit;
  const SECOND_TRANSFER_MODE_KEYS = ["free", "mystery", "deadline"];
  const TRANSFER_CHEMISTRY_LOSS = 0.03;
  const TRANSFER_CHEMISTRY_RECOVERY = 0.01;
  const CHEMISTRY_RATING_FLOOR = 60;
  const HOME_ELO_ADVANTAGE = 45;
  const CHALLENGES = Array.isArray(window.G38Challenges) ? window.G38Challenges : [];
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
  const EUROPE_LIST_VERSION = "2025-26-v4";
  const SIM_VERSION = "2026-v5";
  const LANG_KEY = "g38-lang";
  let currentLang = "zh";
  try {
    currentLang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "zh";
  } catch { currentLang = "zh"; }
  const staticOriginals = new WeakMap();
  const uiText = (zh, en) => currentLang === "en" ? en : zh;

  const STATIC_TRANSLATIONS = [
    { sel: "#historyBtnText", en: "History" },
    { sel: "#newGameBtnText", en: "New Game" },
    { sel: ".brand-text strong", en: "Global All-Stars" },
    { sel: ".hero-copy .eyebrow", en: "1994-95 to 2025-26 seasons" },
    { sel: ".hero-copy h1", en: "All Five Leagues. Build Your Ultimate XI." },
    { sel: ".hero-sub", en: "Spin separate season and club reels, pick players from that real squad, assign positions, then test your team over a full league season. Covers England, Spain, Italy, Germany and France." },
    { sel: ".league-panel .eyebrow", en: "Database" },
    { sel: ".league-panel h2", en: "Select Leagues" },
    { sel: "#toggleAllLeagues", en: "All / Clear" },
    { sel: ".setup-panel .eyebrow", en: "New Season" },
    { sel: ".setup-panel h2", en: "Draft Setup" },
    { sel: "#playModeSwitch [data-play-mode='classic']", en: "Classic" },
    { sel: "#playModeSwitch [data-play-mode='challenge']", en: "Challenges" },
    { sel: "#playModeSwitch [data-play-mode='dynasty']", en: "Dynasty" },
    { sel: "#dynastySeasonField > span", en: "Dynasty Start Season" },
    { sel: "#dynastySeasonHint", en: "Manage exactly 3 consecutive seasons. Start no later than 2023-24." },
    { sel: "#nextDynastySeasonBtn", en: "Start Next Season" },
    { sel: ".challenge-picker-head strong", en: "Choose a Challenge" },
    { sel: ".setup-panel label.field:nth-of-type(2) > span", en: "Season Range" },
    { sel: ".setup-panel label.field:nth-of-type(3) > span", en: "Difficulty" },
    { sel: "#difficultySelect option[value='easy']", en: "Easy: 3 rerolls" },
    { sel: "#difficultySelect option[value='normal']", en: "Normal: 1 reroll" },
    { sel: "#difficultySelect option[value='hard']", en: "Hard: 0 rerolls" },
    { sel: ".setup-panel label.field:nth-of-type(4) > span", en: "Rating Mode" },
    { sel: "#hideRatingsSelect option[value='0']", en: "Show ratings" },
    { sel: "#hideRatingsSelect option[value='1']", en: "Hide ratings" },
    { sel: ".setup-panel label.field:nth-of-type(5) > span", en: "Formation" },
    { sel: "#startBtn", en: "Start Game" },
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
    setupMode: "classic",
    selectedChallengeId: CHALLENGES[0]?.id || null,
    difficultyBeforeIron: null,
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
    dynastySeasonField: $("#dynastySeasonField"),
    dynastyStartSeason: $("#dynastyStartSeason"),
    dynastySeasonHint: $("#dynastySeasonHint"),
    difficultySelect: $("#difficultySelect"),
    langToggle: $("#langToggle"),
    hideRatingsSelect: $("#hideRatingsSelect"),
    formationSelect: $("#formationSelect"),
    playModeSwitch: $("#playModeSwitch"),
    challengePicker: $("#challengePicker"),
    challengeCards: $("#challengeCards"),
    challengeRules: $("#challengeRules"),
    challengeBest: $("#challengeBest"),
    challengeResult: $("#challengeResult"),
    challengeGameBanner: $("#challengeGameBanner"),
    leagueChoice: $("#leagueChoice"),
    leagueChoiceOptions: $("#leagueChoiceOptions"),
    seasonPrediction: $("#seasonPrediction"),
    seasonReview: $("#seasonReview"),
    nextDynastySeasonBtn: $("#nextDynastySeasonBtn"),
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
  const dynastyStandings = (season, leagueId) => (
    typeof HISTORICAL_STANDINGS !== "undefined" && HISTORICAL_STANDINGS[season]?.[leagueId]
  ) || [];
  const leagueTeamCount = (leagueOrGame) => {
    const game = typeof leagueOrGame === "object" ? leagueOrGame : null;
    const leagueId = game?.league || leagueOrGame;
    const historicalCount = game?.mode === "dynasty"
      ? dynastyStandings(simulationSeason(game), leagueId).length
      : 0;
    return historicalCount || (leagueId === "ger" || leagueId === "fra" ? 18 : 20);
  };
  const leagueMatchCount = (leagueOrGame) => (leagueTeamCount(leagueOrGame) - 1) * 2;
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
    const historical = game?.mode === "dynasty" ? dynastyStandings(season, game.league) : [];
    const real = historical.length
      ? [...historical]
      : clubsForLeague(game?.league, season).map((club) => club.name);
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
  const getSeasonData = (season) => G38SeasonData.getSeasonData(season || CURRENT_DATA_SEASON);
  const loadSeasonData = (season) => G38SeasonData.loadSeasonData(season || CURRENT_DATA_SEASON);
  const loadSeasonRange = (seasons) => G38SeasonData.loadSeasonRange(seasons);
  const hasSeasonData = (season) => G38SeasonData.hasSeasonData(season || CURRENT_DATA_SEASON);
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
    return CLUBS[id] || data.clubs[0];
  };
  const clubsForLeague = (id, season = CURRENT_DATA_SEASON) => getSeasonData(season).clubs.filter((c) => c.league === id);
  const allClubs = (season) => getSeasonData(season).clubs;
  const simulationSeason = (game) => game?.mode === "dynasty"
    ? game.dynasty?.currentSeason || game.season || CURRENT_DATA_SEASON
    : CURRENT_DATA_SEASON;
  const isRatingsHidden = (game) => Boolean(game?.hideRatings && game.draftedPlayers.length < game.slots.length);

  const pruneData = () => {
    LEAGUES.splice(0, LEAGUES.length, ...LEAGUES.filter((league) => BIG_FIVE_IDS.has(league.id)));
    Object.keys(CLUBS).forEach((id) => {
      if (!BIG_FIVE_IDS.has(CLUBS[id].league)) delete CLUBS[id];
    });
  };

  const SEASON_KEYS = [];
  for (let start = 1994; start <= 2025; start += 1) {
    const end = start + 1;
    SEASON_KEYS.push(`${start}-${String(end % 100).padStart(2, "0")}`);
  }
  const DYNASTY_START_SEASON_KEYS = SEASON_KEYS.filter((season) => season <= "2023-24");
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

  function initDynastySeasonSelect() {
    if (!ui.dynastyStartSeason) return;
    ui.dynastyStartSeason.innerHTML = "";
    DYNASTY_START_SEASON_KEYS.forEach((season) => {
      const option = document.createElement("option");
      option.value = season;
      option.textContent = season;
      ui.dynastyStartSeason.appendChild(option);
    });
    ui.dynastyStartSeason.value = "2023-24";
    updateDynastySeasonHint();
  }

  function dynastySeasonsFrom(startSeason) {
    const startIndex = Math.max(0, SEASON_KEYS.indexOf(startSeason));
    return SEASON_KEYS.slice(startIndex, startIndex + 3);
  }

  function updateDynastySeasonHint() {
    if (!ui.dynastySeasonHint || !ui.dynastyStartSeason) return;
    const seasons = dynastySeasonsFrom(ui.dynastyStartSeason.value);
    ui.dynastySeasonHint.textContent = uiText(
      `固定连续执教 3 个赛季：${seasons[0]} 至 ${seasons[seasons.length - 1]}。`,
      `Manage exactly 3 consecutive seasons: ${seasons[0]} to ${seasons[seasons.length - 1]}.`
    );
  }

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

  const loadStorage = () => G38Storage.load([STORAGE_GAME, STORAGE_RUNS]);
  const safeGet = (key) => G38Storage.get(key);
  const safeSet = (key, value) => G38Storage.set(key, value);

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

  const getChallenge = (id) => CHALLENGES.find((challenge) => challenge.id === id) || null;
  const activeSetupChallenge = () => state.setupMode === "challenge"
    ? getChallenge(state.selectedChallengeId)
    : null;

  function challengeName(challenge) {
    return challenge ? uiText(challenge.name, challenge.nameEn) : uiText("经典模式", "Classic");
  }

  function renderChallengeSetup() {
    if (!ui.playModeSwitch || !ui.challengePicker) return;
    ui.playModeSwitch.querySelectorAll("[data-play-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.playMode === state.setupMode);
    });
    const challengeMode = state.setupMode === "challenge";
    const dynastyMode = state.setupMode === "dynasty";
    const challenge = challengeMode ? activeSetupChallenge() : null;
    const ironManager = challenge?.id === "iron-manager";
    if (!ironManager && ui.difficultySelect.disabled) {
      ui.difficultySelect.value = state.difficultyBeforeIron || "normal";
      state.difficultyBeforeIron = null;
    }
    ui.challengePicker.classList.toggle("hidden", !challengeMode);
    ui.dynastySeasonField?.classList.toggle("hidden", !dynastyMode);
    document.querySelector("#seasonRange")?.closest("label.field")?.classList.toggle("hidden", dynastyMode);
    ui.challengeCards.innerHTML = "";
    if (!challengeMode) {
      ui.difficultySelect.disabled = false;
      return;
    }
    CHALLENGES.forEach((challenge) => {
      const button = el("button", "challenge-card", "");
      button.type = "button";
      button.classList.toggle("selected", challenge.id === state.selectedChallengeId);
      button.appendChild(el("span", "challenge-card-icon", challenge.icon));
      const copy = el("span", "challenge-card-copy", "");
      copy.appendChild(el("strong", "", challengeName(challenge)));
      copy.appendChild(el("small", "", uiText(challenge.description, challenge.descriptionEn)));
      button.appendChild(copy);
      button.addEventListener("click", () => {
        state.selectedChallengeId = challenge.id;
        renderChallengeSetup();
      });
      ui.challengeCards.appendChild(button);
    });
    ui.challengeRules.innerHTML = "";
    if (!challenge) return;
    const best = loadRuns()
      .filter((run) => run.challengeId === challenge.id)
      .reduce((max, run) => Math.max(max, Number(run.result?.challenge?.stars || 0)), 0);
    ui.challengeBest.textContent = uiText(`最佳：${"★".repeat(best) || "--"}`, `Best: ${"★".repeat(best) || "--"}`);
    const description = el("p", "challenge-description", uiText(challenge.description, challenge.descriptionEn));
    const rules = el("ul", "challenge-rule-list", "");
    const ruleTexts = currentLang === "en" ? challenge.rulesEn : challenge.rules;
    ruleTexts.forEach((rule) => rules.appendChild(el("li", "", rule)));
    const goals = el("ol", "challenge-objective-list", "");
    challenge.objectives.forEach((objective) => {
      goals.appendChild(el("li", "", uiText(objective.text, objective.textEn)));
    });
    ui.challengeRules.append(description, rules, goals);
    if (ironManager && !ui.difficultySelect.disabled) {
      state.difficultyBeforeIron = ui.difficultySelect.value;
      ui.difficultySelect.value = "hard";
    }
    ui.difficultySelect.disabled = ironManager;
  }

  function setSetupMode(mode) {
    state.setupMode = ["challenge", "dynasty"].includes(mode) ? mode : "classic";
    renderChallengeSetup();
  }


  function toggleLanguage() {
    const activeView = ["setup", "game", "result"].find((name) => (
      !document.getElementById(`${name}View`)?.classList.contains("hidden")
    )) || "setup";
    currentLang = currentLang === "en" ? "zh" : "en";
    localStorage.setItem(LANG_KEY, currentLang);
    applyLanguage();
    renderLeagueGrid();
    renderHeroStats();
    renderHomeHistory();
    renderChallengeSetup();
    if (state.game) {
      renderGame();
      renderPitch();
      renderCandidates();
      renderTeamRating();
      if (state.transfer) {
        const directMode = ["free", "mystery", "deadline"].includes(state.transfer.mode);
        ui.transferPanel.classList.remove("hidden");
        ui.simulationPanel.classList.add("hidden");
        document.querySelector(".wheel-card")?.classList.toggle("hidden", directMode);
        ui.rerollBtn.classList.toggle("hidden", directMode);
        renderTransferIntro();
        renderTransferHeader();
        renderTransferSpinResult();
      }
    }
    const resultRun = state.viewingRun || (state.game?.result ? state.game : null);
    if (resultRun) renderResult(resultRun);
    showView(activeView, { scroll: false });
    setTimeout(translateDom, 0);
  }

  async function init() {
    await loadStorage();
    pruneData();
    initSeasonRange();
    initDynastySeasonSelect();
    renderLeagueGrid();
    renderHeroStats();
    renderHomeHistory();
    renderChallengeSetup();
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
    await loadSavedGame();
    if (state.game?.mode === "dynasty" && state.game.phase === "complete" && state.game.result) {
      renderResult(state.game);
    } else if (state.game) {
      renderGame();
    }
    drawWheel();
  }

  function bindEvents() {
    ui.langToggle.addEventListener("click", toggleLanguage);
    window.addEventListener("scroll", updateBackHomeButtonFloating, { passive: true });
    window.addEventListener("resize", updateBackHomeButtonFloating);
    ui.playModeSwitch?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-play-mode]");
      if (button) setSetupMode(button.dataset.playMode);
    });
    ui.dynastyStartSeason?.addEventListener("change", updateDynastySeasonHint);
    $("#startBtn").addEventListener("click", startGame);
    $("#newGameBtn").addEventListener("click", showNewGameSetup);
    $("#historyBtn").addEventListener("click", showHomeHistory);
    $("#backSetupBtn").addEventListener("click", () => showView("setup"));
    $("#backGameBtn").addEventListener("click", goBackFromResult);
    ui.nextDynastySeasonBtn?.addEventListener("click", startNextDynastySeason);
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
      const challenge = getChallenge(run.challengeId);
      const stars = Number(run.result?.challenge?.stars || 0);
      card.appendChild(el("strong", "", run.mode === "dynasty"
        ? `${uiText("王朝模式", "Dynasty")} · ${run.dynasty?.results?.length || 0}/${run.dynasty?.seasons?.length || 1}`
        : challenge
        ? `${challenge.icon} ${challengeName(challenge)} · ${"★".repeat(stars)}${"☆".repeat(3 - stars)}`
        : `${uiText("经典模式", "Classic")} · ${run.formation}`));
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

  async function loadSavedGame() {
    const saved = safeGet(STORAGE_GAME);
    const resumableDynasty = saved?.mode === "dynasty" && saved?.slots;
    if (saved?.phase === "drafting" || resumableDynasty) {
      await loadSeasonData(saved.currentSpin?.season || saved.season || CURRENT_DATA_SEASON).catch((error) => {
        console.error(error);
      });
    }
    if (
      saved
      && saved.slots
      && (saved.phase === "drafting" || resumableDynasty)
      && hasSeasonData(saved.currentSpin?.season || saved.season || CURRENT_DATA_SEASON)
    ) {
      ensureGameRandomState(saved);
      saved.playerIdentityHistory = [...new Set([
        ...(saved.playerIdentityHistory || []),
        ...(saved.draftedPlayers || []).map((player) => G38PlayerIdentity.key(player, HISTORICAL_CLUB_IDS))
      ])];
      if (!saved.seasonRange) {
        saved.seasonRange = { start: "1994-95", end: "2025-26" };
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
    const challenge = activeSetupChallenge();
    const dynastyMode = state.setupMode === "dynasty";
    const dynastySeasons = dynastyMode
      ? dynastySeasonsFrom(ui.dynastyStartSeason?.value || "2023-24")
      : [];
    const dynastyStart = dynastySeasons[0] || null;
    const ironManager = challenge?.id === "iron-manager";
    state.game = {
      id: gameId,
      createdAt: Date.now(),
      leagues: [...state.selectedLeagues],
      seasonRange: {
        start: dynastyStart || seasonIndexToKey(Number(ui.seasonRangeStart.value || 0)),
        end: dynastyStart || seasonIndexToKey(Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1))
      },
      season: null,
      league: null,
      mode: dynastyMode ? "dynasty" : challenge ? "challenge" : "classic",
      challengeId: challenge?.id || null,
      dynasty: dynastyMode ? {
        seasons: dynastySeasons,
        currentIndex: 0,
        currentSeason: dynastyStart,
        results: [],
        trophies: { league: 0, domesticCup: 0, europe: 0 }
      } : null,
      difficulty: ironManager ? "hard" : ui.difficultySelect.value,
      hideRatings: ui.hideRatingsSelect.value === "1",
      formation,
      slots,
      draftedPlayers: [],
      playerIdentityHistory: [],
      currentSpin: null,
      candidates: [],
      rerolls: ironManager ? 0 : REROLL_BUDGET[ui.difficultySelect.value],
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
    state.game.season = dynastyStart || randomSeasonInRange(state.game.seasonRange, rng);
    state.game.coachCandidates = shuffleWithRng(Object.keys(COACHES), rng).slice(0, 3);
    state.selectedSlotIndex = null;
    state.pendingDraftPlayerId = null;
    state.autoSpinPending = false;
    state.viewingRun = null;
    state.transfer = null;
    saveGame();
    renderGame();
    toast(challenge
      ? uiText(`${challenge.name}挑战已开始。`, `${challenge.nameEn} challenge started.`)
      : dynastyMode
        ? uiText(`${dynastyStart} 王朝已开始。`, `${dynastyStart} dynasty started.`)
      : uiText("新选秀已开始，请抽取赛季和球队。", "New draft started. Draw a season and club."));
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

  function showView(name, options = {}) {
    ["setupView", "gameView", "resultView"].forEach((id) => {
      document.getElementById(id).classList.toggle("hidden", id !== `${name}View`);
    });
    if (options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    requestAnimationFrame(updateBackHomeButtonFloating);
  }

  function updateBackHomeButtonFloating() {
    const button = document.getElementById("backGameBtn");
    const toolbar = document.querySelector("#resultView .result-toolbar");
    const resultView = document.getElementById("resultView");
    if (!button || !toolbar || !resultView || resultView.classList.contains("hidden")) {
      button?.classList.remove("is-floating");
      return;
    }
    const topbarBottom = document.querySelector(".topbar")?.getBoundingClientRect().bottom || 0;
    button.classList.toggle("is-floating", toolbar.getBoundingClientRect().bottom <= topbarBottom);
  }

  function renderGame() {
    const game = state.game;
    if (!game) return;
    ui.formationTitle.textContent = game.formation;
    ui.gameProgress.textContent = `${game.draftedPlayers.length}/${game.slots.length}`;
    const rangeText = game.seasonRange
      ? `${game.seasonRange.start} - ${game.seasonRange.end}`
      : game.season;
    const scopeText = game.leagues.length === LEAGUES.length
      ? `五大联赛 · ${rangeText}`
      : `${game.leagues.map((id) => getLeague(id)?.name).filter(Boolean).join(" / ")} · ${rangeText}`;
    const challenge = getChallenge(game.challengeId);
    ui.gameLeagueLabel.textContent = challenge
      ? `${challengeName(challenge)} · ${scopeText}`
      : game.mode === "dynasty"
        ? `${uiText("王朝", "Dynasty")} ${Number(game.dynasty?.currentIndex || 0) + 1}/${game.dynasty?.seasons?.length || 1} · ${simulationSeason(game)}`
      : scopeText;
    renderChallengeGameBanner(game);
    document.querySelector(".game-layout")?.classList.remove("hidden");
    ui.rerollChip.textContent = `重转 ${game.rerolls} 次`;
    ui.simulateBtn.disabled = game.draftedPlayers.length < 11 || !game.league;
    ui.simulateBtn.textContent = game.league
      ? `模拟 ${leagueMatchCount(game)} 场赛季`
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

  function renderChallengeGameBanner(game) {
    if (!ui.challengeGameBanner) return;
    const challenge = getChallenge(game?.challengeId);
    ui.challengeGameBanner.innerHTML = "";
    ui.challengeGameBanner.classList.toggle("hidden", !challenge);
    if (!challenge) return;
    const title = el("div", "challenge-game-title", "");
    title.appendChild(el("span", "", challenge.icon));
    const copy = el("div", "", "");
    copy.appendChild(el("strong", "", challengeName(challenge)));
    copy.appendChild(el("small", "", uiText(challenge.description, challenge.descriptionEn)));
    title.appendChild(copy);
    ui.challengeGameBanner.appendChild(title);
    const rules = currentLang === "en" ? challenge.rulesEn : challenge.rules;
    ui.challengeGameBanner.appendChild(el("span", "challenge-game-rules", rules.join(" · ")));
  }

  function updateSpinControls() {
    const game = state.game;
    if (state.transfer) {
      const transfer = state.transfer;
      if (["free", "mystery", "deadline"].includes(transfer.mode)) {
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
        ui.simulateBtn.textContent = `模拟 ${leagueMatchCount(game)} 场赛季`;
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
    if (game.challengeId === "iron-manager") {
      game.coachId = null;
      const locked = el("div", "coach-challenge-lock", "");
      locked.appendChild(el("strong", "", uiText("铁血经理规则：不聘请教练", "Iron Manager rule: No coach")));
      locked.appendChild(el("small", "", uiText("本赛季将以原始阵容直接开始。", "The season starts with the original squad.")));
      ui.coachChoice.appendChild(locked);
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

  function getSeasonPrediction(game, fallbackRating) {
    if (!game?.league) return null;
    const profile = applyCoachToProfile(calcTeamProfile(game), getCoach(game));
    const rating = Number.isFinite(Number(fallbackRating))
      ? Number(fallbackRating)
      : profile.overall || 80;
    const matches = leagueMatchCount(game);
    const points = expectedPointsForRating(rating, matches);
    const rank = clamp(
      Math.round(1 + (matches * 3 * 0.88 - points) / 6.5),
      1,
      leagueTeamCount(game)
    );
    return { rating, matches, points, rank };
  }

  function renderSeasonPrediction() {
    const game = state.game;
    ui.seasonPrediction.innerHTML = "";
    const prediction = getSeasonPrediction(game);
    if (!prediction) return;
    const box = el("div", "prediction-card", "");
    box.appendChild(el("strong", "", `赛前预测：第 ${prediction.rank} 名`));
    box.appendChild(el("span", "", `预计 ${prediction.matches} 场拿到 ${prediction.points} 分`));
    ui.seasonPrediction.appendChild(box);
  }

  function renderPitch() {
    const game = state.game;
    const hidden = isRatingsHidden(game);
    ui.pitchField.innerHTML = "";
    appendPitchMarkings(ui.pitchField);
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
        const forcedFit = !normalFit && canForcePlace(pending, slot);
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
        const forcedFit = !normalFit && canForcePlace(pending, slot);
        if (normalFit) {
          button.appendChild(el("span", "slot-hint", "可放这里"));
        } else if (forcedFit) {
          button.appendChild(el("span", "slot-hint", uiText(
            `强放 -${midfielderForcedPenalty(pending.pos, slot.pos)}`,
            `Out of position -${midfielderForcedPenalty(pending.pos, slot.pos)}`
          )));
        }
      }
      button.addEventListener("click", () => selectSlot(index));
      ui.pitchField.appendChild(button);
    });
    renderUnitRatings();
  }

  function appendPitchMarkings(field) {
    const markings = el("div", "pitch-markings", "");
    [
      ["pitch-boundary", ""],
      ["pitch-halfway", ""],
      ["pitch-center-circle", ""],
      ["pitch-mark pitch-center-spot", ""],
      ["pitch-area penalty-area top", ""],
      ["pitch-area penalty-area bottom", ""],
      ["pitch-area goal-area top", ""],
      ["pitch-area goal-area bottom", ""],
      ["pitch-mark penalty-spot top", ""],
      ["pitch-mark penalty-spot bottom", ""],
      ["pitch-arc top", ""],
      ["pitch-arc bottom", ""],
      ["pitch-goal top", ""],
      ["pitch-goal bottom", ""]
    ].forEach(([className, text]) => markings.appendChild(el("span", className, text)));
    field.appendChild(markings);
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
    appendPitchMarkings(ui.resultLineupField);
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
      const goalkeeperIds = new Set(run.slots
        .filter((slot) => positionUnit(slot.pos) === "GK")
        .map((slot) => slot.player?.id)
        .filter(Boolean));
      const transferEntries = Array.isArray(run.result?.transferLog) && run.result.transferLog.length
        ? run.result.transferLog
        : Array.isArray(run.transferLog) ? run.transferLog : [];
      const outgoingIds = new Set(transferEntries.map((entry) => entry.outgoingId).filter(Boolean));
      const outgoingNames = new Set(transferEntries.map((entry) => entry.outgoing).filter(Boolean));
      const visibleStats = playerStats.slice(0, run.slots.length);
      playerStats
        .filter((stat) => stat.position === "GK"
          || goalkeeperIds.has(stat.id)
          || outgoingIds.has(stat.id)
          || outgoingNames.has(stat.name))
        .forEach((stat) => {
          if (!visibleStats.some((item) => item.id === stat.id)) visibleStats.push(stat);
        });
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
      statsHead.appendChild(el("strong", "", uiText("球员赛季数据", "Player Season Stats")));
      ui.resultLineupInfo.appendChild(statsHead);
      const statsList = el("div", "lineup-player-stats", "");
      const columnHead = el("div", "lineup-player-stat lineup-player-stat-head", "");
      [
        uiText("球员", "Player"),
        uiText("出场", "Apps"),
        uiText("进球", "Goals"),
        uiText("助攻", "Assists"),
        uiText("零封", "Clean sheets")
      ].forEach((label) => columnHead.appendChild(el("span", "", label)));
      statsList.appendChild(columnHead);
      visibleStats.forEach((stat) => {
        const row = el("div", "lineup-player-stat", "");
        const isGoalkeeper = stat.position === "GK" || goalkeeperIds.has(stat.id);
        const isTransferredOut = outgoingIds.has(stat.id) || outgoingNames.has(stat.name);
        const playerCell = el("strong", "lineup-player-name", "");
        playerCell.appendChild(el("span", "", stat.name));
        if (isTransferredOut) playerCell.appendChild(el("small", "", uiText("已转出", "Transferred out")));
        row.appendChild(playerCell);
        row.appendChild(el("span", "", String(stat.apps ?? 0)));
        row.appendChild(el("span", "", String(stat.goals ?? 0)));
        row.appendChild(el("span", "", String(stat.assists ?? 0)));
        row.appendChild(el("span", "player-clean-sheets", isGoalkeeper ? String(stat.cleanSheets ?? 0) : "—"));
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

  function renderTransferReview(run, result, container) {
    const entries = Array.isArray(result.transferLog) && result.transferLog.length
      ? result.transferLog
      : Array.isArray(run.transferLog) ? run.transferLog : [];
    if (!entries.length && !result.transferSkipped && !run.transferSkipped) return;

    const review = el("div", "season-transfer-review", "");
    const heading = el("div", "season-transfer-review-heading", "");
    heading.appendChild(el("strong", "", uiText("转会评价", "Transfer Review")));
    if (!entries.length) {
      heading.appendChild(el("span", "season-transfer-tag neutral", uiText("保持原阵", "No signings")));
      review.appendChild(heading);
      review.appendChild(el("p", "", uiText(
        "本赛季没有进行中途引援，球队以原有阵容完成了全部联赛赛程。这让战术体系和更衣室保持了连续性，但也意味着赛季中暴露出的薄弱位置只能依靠内部调整解决。最终成绩可以直接视作这套初始阵容真实竞争力的体现。",
        "No mid-season signings were made, so the original squad completed the entire league campaign. That preserved tactical and dressing-room continuity, but any weaknesses exposed during the season had to be solved from within. The final result is therefore a direct reflection of the starting squad's true level."
      )));
      container.appendChild(review);
      return;
    }

    const ratingGains = entries
      .map((entry) => Number(entry.ratingGain))
      .filter((gain) => Number.isFinite(gain));
    const averageGain = ratingGains.length
      ? ratingGains.reduce((sum, gain) => sum + gain, 0) / ratingGains.length
      : null;
    const performance = averageGain === null ? "neutral" : averageGain >= 4 ? "ahead" : averageGain >= 1 ? "on-target" : "behind";
    const tagText = averageGain === null
      ? uiText(`${entries.length} 笔签约`, `${entries.length} signing${entries.length === 1 ? "" : "s"}`)
      : uiText(`平均 ${averageGain >= 0 ? "+" : ""}${averageGain.toFixed(1)} 评分`, `Avg. ${averageGain >= 0 ? "+" : ""}${averageGain.toFixed(1)} rating`);
    heading.appendChild(el("span", `season-transfer-tag ${performance}`, tagText));

    const statsById = new Map((result.playerStats || []).map((stat) => [stat.id, stat]));
    const incomingStats = entries.map((entry) => {
      if (entry.incomingId && statsById.has(entry.incomingId)) return statsById.get(entry.incomingId);
      return (result.playerStats || []).find((stat) => stat.name === entry.incoming) || null;
    }).filter(Boolean);
    const goals = incomingStats.reduce((sum, stat) => sum + Number(stat.goals || 0), 0);
    const assists = incomingStats.reduce((sum, stat) => sum + Number(stat.assists || 0), 0);
    const cleanSheets = incomingStats.reduce((sum, stat) => sum + Number(stat.cleanSheets || 0), 0);
    const directContributions = goals + assists + cleanSheets;
    const contribution = [
      goals ? uiText(`${goals} 球`, `${goals} goal${goals === 1 ? "" : "s"}`) : "",
      assists ? uiText(`${assists} 助`, `${assists} assist${assists === 1 ? "" : "s"}`) : "",
      cleanSheets ? uiText(`${cleanSheets} 次零封`, `${cleanSheets} clean sheet${cleanSheets === 1 ? "" : "s"}`) : ""
    ].filter(Boolean).join(" · ");
    const reviewText = averageGain === null
      ? uiText(`球队完成了 ${entries.length} 笔转会，为阵容带来了新的轮换选择。由于旧存档没有完整的评分变化记录，本次评价更侧重新援的实际贡献。`, `${entries.length} transfer${entries.length === 1 ? " was" : "s were"} completed, adding new rotation options. Because this older save does not contain complete rating-change data, the assessment focuses on the arrivals' actual output.`)
      : averageGain >= 4
        ? uiText(`这是一次非常精准的补强：${entries.length} 笔签约平均带来 ${averageGain.toFixed(1)} 点能力提升，明显抬高了阵容上限，也让关键位置拥有了更可靠的即战力。`, `This was highly precise recruitment: ${entries.length} signing${entries.length === 1 ? " delivered" : "s delivered"} an average rating gain of ${averageGain.toFixed(1)}, clearly raising the squad's ceiling and adding dependable quality in key positions.`)
        : averageGain >= 1
          ? uiText(`转会窗完成了有效调整，平均 ${averageGain.toFixed(1)} 点的能力提升不算颠覆性，却为轮换和临场变化补上了可用的即战力。整体操作稳健，属于风险较低、效果明确的补强。`, `The window produced a useful adjustment. An average gain of ${averageGain.toFixed(1)} was not transformative, but it added usable quality for rotation and in-game changes. Overall, this was steady, low-risk recruitment with a clear benefit.`)
          : uiText(`这次操作更接近阵容重组，平均评分变化为 ${averageGain >= 0 ? "+" : ""}${averageGain.toFixed(1)}。纸面实力没有得到明显提升，新援需要用持续表现证明这次人员更替的价值。`, `This window was closer to a squad reshuffle, with an average rating change of ${averageGain >= 0 ? "+" : ""}${averageGain.toFixed(1)}. The team did not improve clearly on paper, so the arrivals need sustained performances to justify the changes.`);
    review.appendChild(heading);
    review.appendChild(el("p", "", reviewText));
    const transferDetails = el("div", "season-review-details", "");
    entries.forEach((entry) => {
      const incomingStat = entry.incomingId && statsById.has(entry.incomingId)
        ? statsById.get(entry.incomingId)
        : (result.playerStats || []).find((item) => item.name === entry.incoming);
      const outgoingStat = entry.outgoingId && statsById.has(entry.outgoingId)
        ? statsById.get(entry.outgoingId)
        : (result.playerStats || []).find((item) => item.name === entry.outgoing);
      const gain = Number(entry.ratingGain);
      const incomingOutput = incomingStat
        ? uiText(`${Number(incomingStat.apps || 0)} 场、${Number(incomingStat.goals || 0)} 球、${Number(incomingStat.assists || 0)} 助、${Number(incomingStat.cleanSheets || 0)} 次零封`, `${Number(incomingStat.apps || 0)} apps, ${Number(incomingStat.goals || 0)} goals, ${Number(incomingStat.assists || 0)} assists, ${Number(incomingStat.cleanSheets || 0)} clean sheets`)
        : uiText("暂无完整个人数据", "complete individual data unavailable");
      const outgoingOutput = outgoingStat
        ? uiText(`${Number(outgoingStat.apps || 0)} 场、${Number(outgoingStat.goals || 0)} 球、${Number(outgoingStat.assists || 0)} 助、${Number(outgoingStat.cleanSheets || 0)} 次零封`, `${Number(outgoingStat.apps || 0)} apps, ${Number(outgoingStat.goals || 0)} goals, ${Number(outgoingStat.assists || 0)} assists, ${Number(outgoingStat.cleanSheets || 0)} clean sheets`)
        : uiText("暂无完整个人数据", "complete individual data unavailable");
      const change = Number.isFinite(gain)
        ? uiText(`位置评分 ${gain >= 0 ? "+" : ""}${gain.toFixed(1)}`, `slot rating ${gain >= 0 ? "+" : ""}${gain.toFixed(1)}`)
        : uiText("评分变化未知", "rating change unavailable");
      transferDetails.appendChild(el("span", "", uiText(
        `${entry.outgoing || "原位置球员"} 转会前贡献：${outgoingOutput}；${entry.incoming} 加入后贡献：${incomingOutput}。本次更替带来${change}。`,
        `Before leaving, ${entry.outgoing || "the previous player"} recorded ${outgoingOutput}; after arriving, ${entry.incoming} recorded ${incomingOutput}. The change produced ${change}.`
      )));
    });
    review.appendChild(transferDetails);
    review.appendChild(el("small", "", contribution
      ? uiText(`新援合计贡献 ${contribution}。${directContributions >= 12 ? "他们迅速成为赛季后半程的重要力量。" : directContributions > 0 ? "他们已经带来直接回报，但仍有继续提升的空间。" : ""}`, `The arrivals combined for ${contribution}. ${directContributions >= 12 ? "They quickly became an important force in the second half of the season." : directContributions > 0 ? "They delivered an immediate return, with room for more." : ""}`)
      : uiText("新援尚未直接参与进球或零封，转会的长期价值仍需后续赛季检验。", "The arrivals did not directly register a goal, assist, or clean sheet, so the long-term value of the business remains to be proven.")));
    container.appendChild(review);
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
      if (!canPlaySlot(pending, slot.pos) && !canForcePlace(pending, slot)) {
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

  function hasNormalPlacement() {
    const game = state.game;
    if (!game) return false;
    return game.candidates.some((candidate) => !isDrafted(candidate.id) && game.slots.some((slot) => !slot.player && canPlaySlot(candidate, slot.pos)));
  }

  function canForcePlace(player, slot) {
    const game = state.game;
    if (!game || !player || !slot?.pos || slot.player) return false;
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
    const forced = !canPlaySlot(candidate, slot.pos) && canForcePlace(candidate, slot);
    const baseRate = Number(candidate.baseRate || candidate.rate);
    const drafted = {
      ...candidate,
      baseRate,
      forced,
      rate: clamp(baseRate + fitBonus(slot.pos, candidate.pos, forced), forced ? 1 : 40, 99)
    };
    slot.player = drafted;
    game.draftedPlayers.push(drafted);
    rememberPlayerIdentity(game, drafted);
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
    const canForce = (candidate) => game.slots.some((slot) => !slot.player && canForcePlace(candidate, slot));
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
      const forcedPenalty = forced ? minimumForcedPenalty(candidate, game) : null;
      button.appendChild(el("small", "", `${candidate.nat} · ${candidate.pos.map((p) => POSITION_NAMES[p]).join("/")}${forcedPenalty ? uiText(` · 强放 -${forcedPenalty}`, ` · Out of position -${forcedPenalty}`) : ""}`));
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

  function playerIdentity(player) {
    return G38PlayerIdentity.key(player, HISTORICAL_CLUB_IDS);
  }

  function rememberPlayerIdentity(game, player) {
    game.playerIdentityHistory = game.playerIdentityHistory || [];
    const identity = playerIdentity(player);
    if (!game.playerIdentityHistory.includes(identity)) game.playerIdentityHistory.push(identity);
  }

  function isOwnedPlayer(player, game = state.game) {
    if (!game || !player) return false;
    const identity = playerIdentity(player);
    return (game.playerIdentityHistory || []).includes(identity)
      || (game.draftedPlayers || []).some((drafted) => playerIdentity(drafted) === identity);
  }

  function isDrafted(playerOrId) {
    const candidate = typeof playerOrId === "string"
      ? state.game?.candidates?.find((player) => player.id === playerOrId) || { id: playerOrId }
      : playerOrId;
    return isOwnedPlayer(candidate);
  }

  async function spinWheel() {
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
    state.spinning = true;
    ui.spinBtn.disabled = true;
    try {
      await loadSeasonData(season);
    } catch (error) {
      state.spinning = false;
      ui.spinBtn.disabled = false;
      toast(uiText("历史赛季数据加载失败，请重试。", "Could not load the historical season. Please retry."));
      console.error(error);
      return;
    }
    state.spinning = false;
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
        sourceClubId: club.id,
        sourceLeagueId: club.league,
        sourceSeason: spinSeason,
        rate: clamp(calibrateRate(Number(player.rate || 80), spinSeason) + Math.floor(rng() * 3) - 1, 40, 99)
      }))
      .filter((player) => !isOwnedPlayer(player, game));
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
    if (season !== CURRENT_DATA_SEASON) {
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
    if (sim.game.challengeId === "iron-manager") {
      sim.transferState = {
        completed: 0,
        log: [],
        resolved: true,
        skipped: true,
        challengeLocked: true
      };
      toast(uiText("铁血经理挑战：已自动跳过转会窗。", "Iron Manager: Transfer window skipped."));
      return false;
    }
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
        : transfer.mode === "deadline"
          ? transfer.selectedCandidateId
            ? uiText("报价已经锁定，点击球场上的兼容位置完成签约。", "The offer is locked in. Click a compatible slot to complete the signing.")
            : uiText("前两份报价可以放弃且不可撤回；第三份报价必须签约。", "The first two offers may be rejected and cannot be recalled; the third offer must be signed.")
        : uiText("系统会先筛出拥有合格补强球员的球队，再从中抽取；点击可补强的位置完成转会。", "The game first filters for clubs with a valid upgrade, then draws from them. Click an upgradeable slot to complete the transfer.");
    ui.transferStatus.appendChild(el("span", "", instruction));
    renderTransferLog();
  }

  function transferModeName(mode) {
    return mode === "weak" ? uiText("弱项补强", "Weak-Area")
      : mode === "free" ? uiText("自由签约", "Free Signing")
      : mode === "mystery" ? uiText("盲盒签约", "Mystery Signing")
      : mode === "deadline" ? uiText("截止日抉择", "Deadline Day")
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

  async function prepareTransferStep(transfer) {
    const rng = gameRng(transfer.sim.game);
    if (transfer.step === 2) {
      transfer.mode = SECOND_TRANSFER_MODE_KEYS[Math.floor(rng() * SECOND_TRANSFER_MODE_KEYS.length)];
    }
    if (transfer.mode === "weak") transfer.targetUnit = getWeakestUnit(transfer.sim.game);
    transfer.currentSpin = null;
    transfer.candidates = [];
    transfer.selectedCandidateId = null;
    transfer.revealedCandidateId = null;
    transfer.deadlineOfferIndex = 0;
    const directMode = ["free", "mystery", "deadline"].includes(transfer.mode);
    document.querySelector(".wheel-card")?.classList.toggle("hidden", directMode);
    ui.rerollBtn.classList.toggle("hidden", directMode);
    if (directMode) {
      state.spinning = true;
      ui.transferStatus.textContent = uiText("正在加载历史球员数据…", "Loading historical player data…");
      try {
        await loadSeasonRange(seasonsInRange(transfer.sim.game.seasonRange));
        prepareDirectTransferCandidates(transfer);
      } catch (error) {
        toast(uiText("历史球员数据加载失败，请重试。", "Could not load historical players. Please retry."));
        console.error(error);
      } finally {
        state.spinning = false;
      }
    }
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
    const identities = new Set();
    return seasons.flatMap((season) => leagueIds.flatMap((leagueId) => (
      allClubs(season)
        .filter((club) => club.league === leagueId)
        .flatMap((club) => (club.players || []).map((player) => ({
          ...player,
          id: `${season}|${club.id}|${player.name}`,
          rate: clamp(calibrateRate(Number(player.rate || 80), season), 40, 99),
          sourceClubId: club.id,
          sourceClubName: club.name,
          sourceLeagueId: club.league,
          sourceSeason: season
        })))
    )))
      .filter((player) => !isOwnedPlayer(player, game))
      .filter((player) => {
        const identity = playerIdentity(player);
        if (identities.has(identity)) return false;
        identities.add(identity);
        return true;
      })
      .filter((player) => game.slots.some((slot) => slot.player && canPlaySlot(player, slot.pos)));
  }

  function buildWeakTransferClubPool(transfer, game) {
    const leagueIds = new Set(game.leagues.length ? game.leagues : [...state.selectedLeagues]);
    return seasonsInRange(game.seasonRange).flatMap((season) => (
      allClubs(season)
        .filter((club) => leagueIds.has(club.league))
        .map((club) => ({
          season,
          leagueId: club.league,
          club,
          candidates: buildTransferCandidates(club, {
            ...transfer,
            currentSpin: { season }
          }, game)
        }))
        .filter((entry) => entry.candidates.length)
    ));
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
    if (transfer.mode === "deadline") {
      transfer.candidates = buildDeadlineCandidates(pool, rng);
      transfer.deadlineOfferIndex = 0;
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

  function buildDeadlineCandidates(pool, rng) {
    if (!pool.length) return [];
    const ordered = [...pool].sort((a, b) => a.rate - b.rate);
    const band = (start, end) => ordered.slice(
      Math.floor(ordered.length * start),
      Math.max(Math.floor(ordered.length * start) + 1, Math.ceil(ordered.length * end))
    );
    const excludedIds = new Set();
    const firstPool = band(0.4, 0.7);
    const secondPool = rng() < 0.5 ? band(0.18, 0.48) : band(0.7, 0.9);
    const finalPool = rng() < 0.5 ? band(0, 0.25) : band(0.88, 1);
    return [
      takeRandomCandidate(firstPool, excludedIds, pool, rng),
      takeRandomCandidate(secondPool, excludedIds, pool, rng),
      takeRandomCandidate(finalPool, excludedIds, pool, rng)
    ].filter(Boolean);
  }

  async function spinTransferWheel() {
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
    if (transfer.mode === "weak") {
      const seasonOptions = seasonsInRange(game.seasonRange);
      state.spinning = true;
      ui.spinBtn.disabled = true;
      renderSpinResult();
      renderCandidates();
      try {
        await loadSeasonRange(seasonOptions);
      } catch (error) {
        state.spinning = false;
        ui.spinBtn.disabled = false;
        toast(uiText("历史球员数据加载失败，请重试。", "Could not load historical players. Please retry."));
        console.error(error);
        return;
      }
      const eligibleClubs = buildWeakTransferClubPool(transfer, game);
      state.spinning = false;
      if (!eligibleClubs.length) {
        ui.spinBtn.disabled = false;
        toast(uiText("所选范围内没有能够提升弱项的球队。", "No club in the selected range can improve the weak area."));
        renderSpinResult();
        renderCandidates();
        updateSpinControls();
        return;
      }
      const selected = eligibleClubs[Math.floor(rng() * eligibleClubs.length)];
      const eligibleSeasons = [...new Set(eligibleClubs.map((entry) => entry.season))];
      const clubOptions = eligibleClubs
        .filter((entry) => entry.season === selected.season)
        .map((entry) => entry.club);
      transfer.currentSpin = {
        leagueId: selected.leagueId,
        clubId: selected.club.id,
        season: selected.season,
        drafted: false
      };
      transfer.candidates = [];
      transfer.selectedCandidateId = null;
      animateWheel(selected.season, selected.club, eligibleSeasons, clubOptions, () => {
        transfer.candidates = selected.candidates;
        saveGame();
        renderSpinResult();
        renderCandidates();
        updateSpinControls();
      });
      renderSpinResult();
      renderCandidates();
      updateSpinControls();
      return;
    }
    const leagueId = leagueIds[Math.floor(rng() * leagueIds.length)];
    const season = randomSeasonInRange(game.seasonRange, rng);
    state.spinning = true;
    ui.spinBtn.disabled = true;
    try {
      await loadSeasonData(season);
    } catch (error) {
      state.spinning = false;
      ui.spinBtn.disabled = false;
      toast(uiText("历史赛季数据加载失败，请重试。", "Could not load the historical season. Please retry."));
      console.error(error);
      return;
    }
    state.spinning = false;
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
    const rng = transfer.mode === "weak" ? null : gameRng(game);
    return pool
      .map((player) => ({
        ...player,
        id: `${season}|${club.id}|${player.name}`,
        sourceClubId: club.id,
        sourceClubName: club.name,
        sourceLeagueId: club.league,
        sourceSeason: season,
        rate: clamp(
          calibrateRate(Number(player.rate || 80), season) + (rng ? Math.floor(rng() * 3) - 1 : 0),
          40,
          99
        )
      }))
      .filter((player) => !isOwnedPlayer(player, game))
      .filter((player) => game.slots.some((slot) => canTransferReplace(player, slot, transfer)))
      .sort((a, b) => transferUpgradeValue(b, game, transfer) - transferUpgradeValue(a, game, transfer) || b.rate - a.rate);
  }

  function transferUpgradeValue(player, game, transfer) {
    return bestTransferFit(player, game, transfer)?.change || 0;
  }

  function bestTransferFit(player, game, transfer) {
    return game.slots.reduce((best, slot) => {
      if (!canTransferReplace(player, slot, transfer)) return best;
      const incomingRate = transferRateForSlot(player, slot.pos);
      const outgoingRate = Number(slot.player.rate || 0);
      const fit = {
        pos: slot.pos,
        incomingRate,
        outgoingRate,
        change: incomingRate - outgoingRate
      };
      return !best || fit.change > best.change ? fit : best;
    }, null);
  }

  function appendTransferImpact(parent, player, transfer) {
    const fit = bestTransferFit(player, state.game, transfer);
    if (!fit) return;
    const change = fit.change > 0 ? `+${fit.change}` : String(fit.change);
    parent.appendChild(el("span", `transfer-impact${fit.change > 0 ? " positive" : fit.change < 0 ? " negative" : ""}`, uiText(
      `最佳替换：${POSITION_NAMES[fit.pos] || fit.pos} · 首发评分 ${change}`,
      `Best replacement: ${fit.pos} · Starting rating ${change}`
    )));
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
    if (transfer?.mode === "deadline") {
      const offerNumber = Math.min((transfer.deadlineOfferIndex || 0) + 1, transfer.candidates.length || 3);
      const box = el("div", "direct-transfer-summary deadline-summary", "");
      box.appendChild(el("strong", "", uiText(`截止日报价 ${offerNumber}/3`, `Deadline Offer ${offerNumber}/3`)));
      box.appendChild(el("span", "", transfer.selectedCandidateId
        ? uiText("报价已锁定，请在球场上选择替换位置。", "Offer locked in. Choose a replacement slot on the pitch.")
        : uiText("接受当前报价，或永久放弃并查看下一份。", "Accept this offer, or reject it permanently to see the next one.")));
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
      const message = ["free", "mystery", "deadline"].includes(transfer.mode)
        ? uiText("没有足够的合格球员完成本次转会。", "Not enough eligible players for this transfer.")
        : uiText("没有可签球员，请重新抽取。", "No eligible player. Redraw.");
      ui.candidates.appendChild(el("p", "history-empty", message));
      return;
    }
    if (transfer.mode === "mystery") {
      renderMysteryCandidates(transfer);
      return;
    }
    if (transfer.mode === "deadline") {
      renderDeadlineCandidate(transfer);
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
      if (transfer.mode === "weak") appendTransferImpact(button, candidate, transfer);
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

  function renderDeadlineCandidate(transfer) {
    const index = transfer.deadlineOfferIndex || 0;
    const candidate = transfer.candidates[index];
    if (!candidate) return;
    const finalOffer = index >= transfer.candidates.length - 1;
    const accepted = transfer.selectedCandidateId === candidate.id;
    const card = el("div", `candidate deadline-offer${accepted ? " pending" : ""}`, "");
    card.appendChild(el("span", "deadline-offer-number", uiText(`报价 ${index + 1}/3`, `Offer ${index + 1}/3`)));
    card.appendChild(el("strong", "", candidate.name));
    card.appendChild(el("small", "", [
      candidate.sourceSeason,
      candidate.sourceClubName,
      candidate.nat,
      candidate.pos.map((pos) => POSITION_NAMES[pos] || pos).join("/")
    ].filter(Boolean).join(" · ")));
    card.appendChild(el("span", "rate", String(candidate.rate)));
    appendTransferImpact(card, candidate, transfer);
    const actions = el("div", "deadline-actions", "");
    const accept = el("button", "btn btn-primary", accepted
      ? uiText(finalOffer ? "强制签约" : "已接受", finalOffer ? "Mandatory Signing" : "Accepted")
      : uiText("接受报价", "Accept Offer"));
    accept.type = "button";
    accept.disabled = accepted;
    accept.addEventListener("click", () => {
      transfer.selectedCandidateId = candidate.id;
      saveGame();
      renderTransferHeader();
      renderTransferSpinResult();
      renderPitch();
      renderCandidates();
      updateSpinControls();
      toast(uiText(`已接受 ${candidate.name} 的报价，请选择替换位置。`, `Accepted ${candidate.name}. Choose a replacement slot.`));
      document.querySelector(".pitch-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    actions.appendChild(accept);
    if (!finalOffer) {
      const reject = el("button", "btn btn-ghost", uiText("放弃，查看下一份", "Reject — Next Offer"));
      reject.type = "button";
      reject.disabled = accepted;
      reject.addEventListener("click", () => rejectDeadlineOffer(transfer));
      actions.appendChild(reject);
    }
    card.appendChild(actions);
    ui.candidates.appendChild(card);
  }

  function rejectDeadlineOffer(transfer) {
    if (transfer.selectedCandidateId) return;
    const nextIndex = (transfer.deadlineOfferIndex || 0) + 1;
    if (nextIndex < transfer.candidates.length) {
      transfer.deadlineOfferIndex = nextIndex;
      const finalOffer = nextIndex >= transfer.candidates.length - 1;
      if (finalOffer) transfer.selectedCandidateId = transfer.candidates[nextIndex].id;
      saveGame();
      renderTransferHeader();
      renderTransferSpinResult();
      renderPitch();
      renderCandidates();
      toast(finalOffer
        ? uiText("最后一份报价已经锁定，必须完成签约。", "The final offer is locked in and must be signed.")
        : uiText("当前报价已放弃，下一份报价已经送达。", "Offer rejected. The next offer has arrived."));
      return;
    }
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
    rememberPlayerIdentity(game, incoming);
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
      incomingId: incoming.id,
      incomingRate: incoming.rate,
      outgoing: outgoing.name,
      outgoingId: outgoing.id,
      outgoingRate: outgoing.rate,
      ratingGain: incoming.rate - outgoing.rate,
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
    const compatible = game.slots.some((slot) => !slot.player && (canPlaySlot(candidate, slot.pos) || canForcePlace(candidate, slot)));
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
    return forced ? -midfielderForcedPenalty(playerPositions, slotPos) : 0;
  }

  function minimumForcedPenalty(player, game) {
    return game.slots.reduce((best, slot) => {
      if (!canForcePlace(player, slot)) return best;
      return Math.min(best, midfielderForcedPenalty(player.pos, slot.pos));
    }, Infinity);
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
  function simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway, options) {
    return G38SimulationCore.simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway, options);
    /* istanbul ignore next -- legacy body retained for build-free fallback review. */
    const hasElo = Number.isFinite(eloHome) && Number.isFinite(eloAway);
    const homeStrength = teamStrength(homeProfile);
    const awayStrength = teamStrength(awayProfile);
    const baseDiff = homeStrength - awayStrength + 1;
    const strengthExpected = clamp(1 / (1 + Math.pow(10, -baseDiff / 8)), 0.06, 0.88);
    const expectedHome = hasElo
      ? clamp(eloExpected(eloHome + HOME_ELO_ADVANTAGE, eloAway) * 0.7 + strengthExpected * 0.3, 0.06, 0.94)
      : strengthExpected;
    const diff = hasElo ? eloHome - eloAway : baseDiff;
    const drawChance = clamp(0.285 - Math.abs(diff) * 0.00035, 0.19, 0.3);
    const isDraw = rng() < drawChance;
    const result = isDraw ? "D" : rng() < expectedHome ? "H" : "A";
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
    const seasonPrediction = getSeasonPrediction(game);
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
      seasonPrediction,
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
    finishDomesticCupInBackgroundAfterElimination(sim);
    if (shouldPlayDomesticCupRound(sim)) {
      const cupMatch = simulateDomesticCupRound(sim);
      if (cupMatch) {
        playDomesticCupMatch(sim, cupMatch, () => {
          renderSimulationStep(sim);
          setTimeout(() => simulateNextMatch(sim), 600);
        });
      } else {
        renderSimulationStep(sim);
        setTimeout(() => simulateNextMatch(sim), 600);
      }
      return;
    }
    advanceAiFixtures(sim, sim.transferState?.resolved ? sim.schedule.length : sim.transferPoint);

    if (sim.allIndex >= sim.schedule.length) {
      finishSimulation(sim);
      return;
    }

    if (sim.allIndex >= sim.transferPoint && openTransferWindow(sim)) {
      return;
    }

    advanceAiFixtures(sim);

    if (sim.allIndex >= sim.schedule.length) {
      finishSimulation(sim);
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
      const stat = getSeasonPlayerStat(sim, scorer);
      stat.goals += 1;
      sim.playerStats.set(scorer.id, stat);
      sim.scorers.set(scorer.name, (sim.scorers.get(scorer.name) || 0) + 1);
    });
    (match.assists || []).forEach((assist) => {
      if (!assist) return;
      const stat = getSeasonPlayerStat(sim, assist);
      stat.assists += 1;
      sim.playerStats.set(assist.id, stat);
    });
    sim.game.slots.forEach((slot) => {
      if (!slot.player) return;
      const stat = getSeasonPlayerStat(sim, slot.player, slot.pos);
      stat.apps += 1;
      if (positionUnit(slot.pos) === "GK" && match.ga === 0) stat.cleanSheets += 1;
      sim.playerStats.set(slot.player.id, stat);
    });
    advanceTransferChemistry(sim);
    renderSimulationStep(sim);
    if (sim.allIndex >= sim.transferPoint && openTransferWindow(sim)) {
      return;
    }
    setTimeout(() => simulateNextMatch(sim), 600);
  }

  function getSeasonPlayerStat(sim, player, position) {
    const stat = sim.playerStats.get(player.id) || {
      id: player.id,
      name: player.name,
      position: position || "",
      apps: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0
    };
    if (!stat.position && position) stat.position = position;
    if (!Number.isFinite(Number(stat.cleanSheets))) stat.cleanSheets = 0;
    return stat;
  }

  function advanceAiFixtures(sim, endIndex = sim.schedule.length) {
    sim.allIndex = G38SimulationCore.advanceAiFixtures(
      sim.schedule,
      sim.allIndex,
      (fixture) => simulateAIFixture(sim, fixture),
      { endIndex }
    );
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

  function renderLeagueSimulationResultRow(match, current = false) {
    const row = el("div", current ? "sim-match-current" : "sim-match-row", "");
    row.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
    const score = el("strong", current ? "match-score" : "sim-list-score", `${match.gf}-${match.ga}`);
    const round = el("span", "match-round", uiText(`第 ${match.round} 轮`, `Round ${match.round}`));
    const venue = el("span", `sim-venue ${match.home ? "home" : "away"}`, uiText(
      match.home ? "主场" : "客场",
      match.home ? "Home" : "Away"
    ));
    const matchup = el("strong", "", uiText(`我的球队 vs ${match.opponent}`, `My Team vs ${match.opponent}`));
    row.append(score, round, venue, matchup);
    if (current) {
      row.appendChild(el(
        "small",
        "",
        match.scorers.length
          ? uiText(`进球：${match.scorers.join("、")}`, `Goals: ${match.scorers.join(", ")}`)
          : uiText("无进球", "No goals")
      ));
    }
    return row;
  }

  function renderSimulationStep(sim) {
    ui.simulationProgress.textContent = `${sim.matches.length}/${sim.matchCount}`;
    ui.simulationCurrent.innerHTML = "";
    ui.simulationCurrent.classList.remove("league-simulation-shell");
    if (sim.matches.length) {
      const match = sim.matches[sim.matches.length - 1];
      ui.simulationCurrent.appendChild(renderLeagueSimulationResultRow(match, true));
    }
    const cup = sim.domesticCup;
    const userStillInCup = cup?.currentTeams?.some((team) => team.isUser);
    if (cup && !cup.finished && userStillInCup) {
      const stage = DOMESTIC_CUP_STAGES[cup.roundIndex] || "决赛";
      ui.simulationCurrent.appendChild(el("span", "cup-status", uiText(`${cup.name} · ${stage}`, `${cup.nameEn} · ${domesticCupStageText(stage)}`)));
    }
    ui.simulationLatest.innerHTML = "";
    sim.matches.slice(-8).reverse().forEach((match) => {
      ui.simulationLatest.appendChild(renderLeagueSimulationResultRow(match));
    });
  }

  function finishSimulation(sim) {
    while (sim.domesticCup && !sim.domesticCup.finished) simulateDomesticCupRound(sim);
    const game = sim.game;
    const points = sim.wins * 3 + sim.draws;
    const maxFinish = leagueTeamCount(game);
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
      seasonPrediction: sim.seasonPrediction,
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
    game.result.challenge = evaluateChallenge(game, game.result);
    game.transferLog = sim.transferState?.log || [];
    game.transferSkipped = Boolean(sim.transferState?.skipped);
    game.phase = "complete";
    game.simulation = null;
    if (game.mode === "dynasty" && game.dynasty) {
      const seasonRecord = {
        season: simulationSeason(game),
        league: game.league,
        result: game.result,
        lineup: game.slots.map((slot) => ({ ...slot, player: slot.player ? { ...slot.player } : null }))
      };
      const recordIndex = game.dynasty.results.findIndex((entry) => entry.season === seasonRecord.season);
      if (recordIndex >= 0) game.dynasty.results[recordIndex] = seasonRecord;
      else game.dynasty.results.push(seasonRecord);
      if (game.result.finish === 1) game.dynasty.trophies.league += 1;
      if (game.result.domesticCup?.champion === "我的球队") game.dynasty.trophies.domesticCup += 1;
    }
    saveGame();
    if (game.mode === "dynasty") updateRun(game);
    else addRun(game);
    renderHomeHistory();
    renderResult(game);
  }

  async function startNextDynastySeason() {
    const game = state.game;
    if (!game?.dynasty || game.mode !== "dynasty") return;
    const nextIndex = Number(game.dynasty.currentIndex || 0) + 1;
    const nextSeason = game.dynasty.seasons[nextIndex];
    if (!nextSeason) return;
    ui.nextDynastySeasonBtn.disabled = true;
    try {
      await loadSeasonData(nextSeason);
      game.dynasty.currentIndex = nextIndex;
      game.dynasty.currentSeason = nextSeason;
      game.dynasty.previousQualification = game.result?.europeQualification || null;
      game.season = nextSeason;
      game.seasonRange = { start: nextSeason, end: nextSeason };
      game.phase = "drafting";
      game.result = null;
      game.simulation = null;
      game.europeResult = null;
      game.europeSim = null;
      game.transferLog = [];
      game.transferSkipped = false;
      game.currentSpin = null;
      game.candidates = [];
      game.draftedPlayers = game.slots.map((slot) => slot.player).filter(Boolean);
      game.rerolls = REROLL_BUDGET[game.difficulty] || 0;
      game.randomSeed = hashSeed(`${game.id}|dynasty|${nextSeason}`);
      game.randomState = game.randomSeed;
      game.randomDraws = 0;
      state.viewingRun = null;
      state.transfer = null;
      saveGame();
      updateRun(game);
      renderGame();
      toast(uiText(`${nextSeason} 赛季开始，阵容已保留。`, `${nextSeason} season started with your squad retained.`));
    } catch (error) {
      console.error(error);
      toast(uiText("下一赛季数据加载失败，请重试。", "Could not load the next season. Please try again."));
    } finally {
      ui.nextDynastySeasonBtn.disabled = false;
    }
  }

  function buildPlayerStats(sim) {
    const rateById = new Map();
    sim.game.slots.forEach((slot) => {
      if (slot.player) rateById.set(slot.player.id, slot.player.rate || 0);
    });
    return [...sim.playerStats.values()]
      .map((stat) => ({
        ...stat,
        cleanSheets: Number(stat.cleanSheets || 0),
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
    const size = leagueTeamCount(game);
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
    const opponentCount = leagueTeamCount(game) - 1;
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
    if (game.mode === "dynasty") {
      const standings = dynastyStandings(season, game.league);
      const clubs = clubsForLeague(game.league, season);
      const count = Math.max(2, standings.length);
      const profiles = {};
      names.filter((name) => name !== "我的球队").forEach((name) => {
        const rankIndex = Math.max(0, standings.indexOf(name));
        profiles[name] = dynastyRankProfile(name, rankIndex, count, clubs);
      });
      return profiles;
    }
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

  const DYNASTY_CLUB_ALIASES = {
    "man city": "manchester city",
    "man united": "manchester united",
    "nott m forest": "nottingham forest",
    "qpr": "queens park rangers",
    "ath madrid": "atletico madrid",
    "ath bilbao": "athletic bilbao",
    "la coruna": "deportivo la coruna",
    "deportivo de la coruna": "deportivo la coruna",
    "sociedad": "real sociedad",
    "betis": "real betis",
    "paris sg": "paris saint germain",
    "lyon": "olympique lyon",
    "marseille": "olympique marseille",
    "m gladbach": "borussia monchengladbach",
    "dortmund": "borussia dortmund",
    "leverkusen": "bayer leverkusen",
    "bayern munich": "bayern munchen",
    "inter": "inter milan",
    "milan": "ac milan"
  };

  function normalizeDynastyClubName(value) {
    const normalized = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(football club|club de futbol|calcio|fc|cf|ssc|1)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return DYNASTY_CLUB_ALIASES[normalized] || normalized;
  }

  function findDynastySeasonClub(name, clubs) {
    const target = normalizeDynastyClubName(name);
    const exact = clubs.filter((club) => [club.name, club.short, club.id]
      .some((value) => normalizeDynastyClubName(value) === target));
    if (exact.length === 1) return exact[0];
    const partial = clubs.filter((club) => {
      const clubName = normalizeDynastyClubName(club.name);
      return clubName.includes(target) || target.includes(clubName);
    });
    return partial.length === 1 ? partial[0] : null;
  }

  function dynastyRankProfile(name, rankIndex, count, clubs) {
    const rankStrength = Math.round(90 - (rankIndex / Math.max(1, count - 1)) * 18);
    const club = findDynastySeasonClub(name, clubs);
    const rawProfile = club
      ? calcClubProfile(club)
      : { attack: rankStrength, midfield: rankStrength, defense: rankStrength, goalkeeper: rankStrength, overall: rankStrength };
    const normalized = clamp(Math.round(rankStrength * 0.8 + rawProfile.overall * 0.2), 68, 94);
    const delta = normalized - rawProfile.overall;
    return {
      attack: clamp(rawProfile.attack + Math.round(delta * 0.35), 40, 99),
      midfield: clamp(rawProfile.midfield + Math.round(delta * 0.25), 40, 99),
      defense: clamp(rawProfile.defense + Math.round(delta * 0.25), 40, 99),
      goalkeeper: clamp(rawProfile.goalkeeper + Math.round(delta * 0.15), 40, 99),
      overall: normalized
    };
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

  function challengeSquadMetrics(game) {
    const players = (game.slots || []).map((slot) => slot.player).filter(Boolean);
    const seasons = new Set(players.map((player) => player.sourceSeason).filter(Boolean));
    const nationalities = new Set(players.map((player) => String(player.nat || "").trim()).filter(Boolean));
    const leagues = new Set(players.map((player) => {
      if (player.sourceLeagueId) return player.sourceLeagueId;
      return getClub(player.sourceClubId, player.sourceSeason)?.league || null;
    }).filter((leagueId) => BIG_FIVE_IDS.has(leagueId)));
    return {
      seasons: seasons.size,
      nationalities: nationalities.size,
      leagues: leagues.size
    };
  }

  function evaluateChallenge(game, result) {
    const challenge = getChallenge(game.challengeId);
    if (!challenge) return null;
    const metrics = challengeSquadMetrics(game);
    const domesticChampion = result.domesticCup?.champion === "我的球队";
    const leagueChampion = result.finish === 1;
    const uclPlaces = Number(result.europeQualification?.allocation?.ucl || 4);
    let valid = true;
    let completedIds = [];
    if (challenge.id === "underdog") {
      valid = result.teamRating <= 84;
      completedIds = [
        valid && result.finish <= 6 ? "top6" : null,
        valid && result.finish <= 4 ? "top4" : null,
        valid && leagueChampion ? "champion" : null
      ];
    } else if (challenge.id === "iron-manager") {
      valid = game.rerolls === 0 && !game.coachId && result.transferSkipped;
      completedIds = [
        valid && result.finish <= 4 ? "top4" : null,
        valid && result.points >= 80 ? "points80" : null,
        valid && leagueChampion ? "champion" : null
      ];
    } else if (challenge.id === "time-traveller") {
      valid = metrics.seasons >= 8;
      completedIds = [
        valid ? "valid-lineup" : null,
        valid && result.finish <= uclPlaces ? "ucl" : null,
        valid && (leagueChampion || domesticChampion) ? "title" : null
      ];
    } else if (challenge.id === "global-dressing-room") {
      valid = metrics.nationalities >= 8 && metrics.leagues === BIG_FIVE_IDS.size;
      completedIds = [
        valid && result.finish <= 6 ? "top6" : null,
        valid && result.finish <= 4 ? "top4" : null,
        valid && (leagueChampion || domesticChampion) ? "title" : null
      ];
    } else if (challenge.id === "defensive-master") {
      completedIds = [
        result.goalsAgainst <= 30 ? "concede30" : null,
        result.goalsAgainst <= 20 ? "concede20" : null,
        result.goalsAgainst <= 10 && leagueChampion ? "concede10-champion" : null
      ];
    }
    completedIds = completedIds.filter(Boolean);
    return {
      id: challenge.id,
      valid,
      stars: completedIds.length,
      completedIds,
      metrics
    };
  }

  function renderChallengeResult(run) {
    const challenge = getChallenge(run.challengeId);
    const evaluation = run.result?.challenge;
    ui.challengeResult.innerHTML = "";
    ui.challengeResult.classList.toggle("hidden", !challenge || !evaluation);
    if (!challenge || !evaluation) return;
    const head = el("div", "challenge-result-head", "");
    const title = el("div", "", "");
    title.appendChild(el("p", "eyebrow", uiText("挑战结算", "Challenge Result")));
    title.appendChild(el("h3", "", `${challenge.icon} ${challengeName(challenge)}`));
    head.appendChild(title);
    head.appendChild(el("strong", "challenge-stars", `${"★".repeat(evaluation.stars)}${"☆".repeat(3 - evaluation.stars)}`));
    ui.challengeResult.appendChild(head);
    if (!evaluation.valid) {
      ui.challengeResult.appendChild(el("p", "challenge-invalid", uiText(
        "核心阵容条件未满足，本次排名目标不计星。",
        "The core squad rule was not met, so placement objectives award no stars."
      )));
    }
    const list = el("div", "challenge-result-objectives", "");
    challenge.objectives.forEach((objective, index) => {
      const completed = evaluation.completedIds.includes(objective.id);
      const row = el("div", `challenge-objective${completed ? " completed" : ""}`, "");
      row.appendChild(el("span", "", completed ? "★" : "☆"));
      row.appendChild(el("strong", "", `${index + 1}. ${uiText(objective.text, objective.textEn)}`));
      list.appendChild(row);
    });
    ui.challengeResult.appendChild(list);
  }

  function renderSeasonReview(run, result) {
    const container = ui.seasonReview;
    if (!container) return;
    container.innerHTML = "";
    const prediction = result.seasonPrediction || getSeasonPrediction(run, result.teamRating);
    if (!prediction) return;

    const actualRank = Number(result.finish);
    const predictedRank = Number(prediction.rank);
    const rankDifference = predictedRank - actualRank;
    const pointDifference = Number(result.points) - Number(prediction.points || 0);
    const performanceClass = rankDifference > 0 ? "ahead" : rankDifference < 0 ? "behind" : "on-target";
    const differenceText = rankDifference > 0
      ? uiText(`高于预测 ${rankDifference} 位`, `${rankDifference} place${rankDifference === 1 ? "" : "s"} above prediction`)
      : rankDifference < 0
        ? uiText(`低于预测 ${Math.abs(rankDifference)} 位`, `${Math.abs(rankDifference)} place${Math.abs(rankDifference) === 1 ? "" : "s"} below prediction`)
        : uiText("符合预测", "On target");
    const pointText = pointDifference > 0
      ? uiText(`多拿 ${pointDifference} 分`, `+${pointDifference} pts`)
      : pointDifference < 0
        ? uiText(`少拿 ${Math.abs(pointDifference)} 分`, `${pointDifference} pts`)
        : uiText("积分持平", "Points matched");
    const matches = Array.isArray(result.matches) ? result.matches : [];
    const biggestWin = matches
      .filter((match) => Number(match.gf) > Number(match.ga))
      .sort((a, b) => (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)[0] || null;
    const heaviestLoss = matches
      .filter((match) => Number(match.gf) < Number(match.ga))
      .sort((a, b) => (b.ga - b.gf) - (a.ga - a.gf) || b.ga - a.ga)[0] || null;
    const cleanSheets = matches.filter((match) => Number(match.ga) === 0).length;
    const scorelessMatches = matches.filter((match) => Number(match.gf) === 0).length;
    const goalDifference = Number(result.goalsFor) - Number(result.goalsAgainst);
    const pointsPerMatch = matches.length ? Number(result.points) / matches.length : 0;
    let longestUnbeaten = 0;
    let currentUnbeaten = 0;
    matches.forEach((match) => {
      currentUnbeaten = match.result === "L" ? 0 : currentUnbeaten + 1;
      longestUnbeaten = Math.max(longestUnbeaten, currentUnbeaten);
    });
    const reviewText = rankDifference >= 4
      ? uiText(`惊喜赛季，最终名次比预测高出 ${rankDifference} 位。`, `A surprise season: ${rankDifference} places above the prediction.`)
      : rankDifference >= 2
        ? uiText(`超额完成目标，球队把预测转化成了更高的联赛位置。`, "A clear overperformance turned the projection into a stronger league finish.")
        : rankDifference === 1
          ? uiText("略超预期，关键场次的表现带来了额外回报。", "Slightly ahead of target, with key results making the difference.")
          : rankDifference === 0
            ? uiText("走势与赛前判断一致，球队稳定兑现了预期。", "The season tracked the pre-season outlook and delivered steadily.")
            : rankDifference >= -2
              ? uiText("与预期有些差距，下赛季需要把细节转化为积分。", "A small gap to the projection leaves room to turn fine margins into points next season.")
              : uiText("结果低于赛前预测，阵容深度和稳定性会是下赛季的重点。", "The finish fell short of the projection; squad depth and consistency should be next season's focus.");

    const heading = el("div", "season-review-heading", "");
    heading.appendChild(el("span", "eyebrow", uiText("赛季表现", "Season Review")));
    heading.appendChild(el("strong", "season-review-delta", differenceText));
    const comparison = el("div", "season-rank-comparison", "");
    [
      [actualRank, uiText("实际排名", "Actual finish"), "actual"],
      [predictedRank, uiText("赛前预测", "Pre-season prediction"), "predicted"]
    ].forEach(([rank, label, type]) => {
      const card = el("div", `season-rank-card ${type}`, "");
      card.appendChild(el("strong", "", uiText(`第 ${rank} 名`, `#${rank}`)));
      card.appendChild(el("span", "", label));
      comparison.appendChild(card);
    });
    const commentary = el("p", "season-review-commentary", "");
    commentary.appendChild(el("span", "", reviewText));
    commentary.appendChild(el("small", "", uiText(
      `${pointText}，场均 ${pointsPerMatch.toFixed(2)} 分；${result.goalsFor} 个进球、${result.goalsAgainst} 个失球，净胜球 ${goalDifference >= 0 ? "+" : ""}${goalDifference}。`,
      `${pointText}, with ${pointsPerMatch.toFixed(2)} points per match; ${result.goalsFor} scored, ${result.goalsAgainst} conceded and a goal difference of ${goalDifference >= 0 ? "+" : ""}${goalDifference}.`
    )));
    const details = el("div", "season-review-details", "");
    if (biggestWin) {
      details.appendChild(el("span", "", uiText(
        `代表作是第 ${biggestWin.round} 轮${biggestWin.home ? "主场" : "客场"} ${biggestWin.gf}-${biggestWin.ga} 击败 ${biggestWin.opponent}，这是本赛季最大比分胜利。`,
        `The standout result was the ${biggestWin.gf}-${biggestWin.ga} ${biggestWin.home ? "home" : "away"} win over ${biggestWin.opponent} in round ${biggestWin.round}, the biggest victory of the season.`
      )));
    }
    if (heaviestLoss) {
      details.appendChild(el("span", "", uiText(
        `最需要复盘的是第 ${heaviestLoss.round} 轮${heaviestLoss.home ? "主场" : "客场"} ${heaviestLoss.gf}-${heaviestLoss.ga} 负于 ${heaviestLoss.opponent}，暴露了球队在逆境中的防守问题。`,
        `The result most in need of review was the ${heaviestLoss.gf}-${heaviestLoss.ga} ${heaviestLoss.home ? "home" : "away"} defeat to ${heaviestLoss.opponent} in round ${heaviestLoss.round}, which exposed defensive issues under pressure.`
      )));
    }
    details.appendChild(el("span", "", uiText(
      `球队完成 ${cleanSheets} 场零封，最长连续 ${longestUnbeaten} 场不败，同时有 ${scorelessMatches} 场未能进球。${cleanSheets >= Math.ceil(matches.length * 0.35) ? "防守稳定性是取得当前排名的重要基础。" : scorelessMatches >= Math.ceil(matches.length * 0.25) ? "如何提高进攻下限，是下赛季最值得优先解决的问题。" : "整体攻防表现较为均衡，但关键场次的效率仍决定了排名上限。"}`,
      `The team recorded ${cleanSheets} clean sheets and a longest unbeaten run of ${longestUnbeaten} matches, while failing to score ${scorelessMatches} times. ${cleanSheets >= Math.ceil(matches.length * 0.35) ? "Defensive consistency was a major foundation of this finish." : scorelessMatches >= Math.ceil(matches.length * 0.25) ? "Raising the attacking floor should be the priority next season." : "The overall balance was sound, although efficiency in key matches still set the ceiling."}`
    )));
    container.className = `season-review ${performanceClass}`;
    container.append(heading, comparison, commentary, details);
    renderTransferReview(run, result, container);
  }

  function renderDynastyProgress(run) {
    if (run.mode !== "dynasty" || !run.dynasty || !ui.seasonReview) return;
    const block = el("div", "dynasty-progress", "");
    const trophies = run.dynasty.trophies || {};
    block.appendChild(el("strong", "", uiText(
      `王朝进度 · ${run.dynasty.results.length}/${run.dynasty.seasons.length} 赛季`,
      `Dynasty progress · ${run.dynasty.results.length}/${run.dynasty.seasons.length} seasons`
    )));
    block.appendChild(el("small", "", uiText(
      `奖杯：联赛 ${trophies.league || 0} · 国内杯赛 ${trophies.domesticCup || 0} · 欧战 ${trophies.europe || 0}`,
      `Trophies: League ${trophies.league || 0} · Domestic cup ${trophies.domesticCup || 0} · Europe ${trophies.europe || 0}`
    )));
    const seasons = el("div", "dynasty-season-list", "");
    run.dynasty.results.forEach((entry) => {
      seasons.appendChild(el("span", "", uiText(
        `${entry.season} · 第 ${entry.result.finish} 名 · ${entry.result.points} 分`,
        `${entry.season} · #${entry.result.finish} · ${entry.result.points} pts`
      )));
    });
    block.appendChild(seasons);
    ui.seasonReview.appendChild(block);
  }

  function renderResult(game) {
    const run = game || state.game;
    if (!run || !run.result) return;
    const result = run.result;
    const leagueName = getLeague(run.league)?.name || run.league || "";
    const seasonText = run.season || run.seasonRange?.end || "";
    const challenge = getChallenge(run.challengeId);
    const dynastyActive = run.mode === "dynasty" && run === state.game;
    const dynastyHasNext = dynastyActive
      && Number(run.dynasty?.currentIndex || 0) < Number(run.dynasty?.seasons?.length || 1) - 1;
    ui.nextDynastySeasonBtn?.classList.toggle("hidden", !dynastyHasNext);
    $("#resultMatchEyebrow").textContent = `${result.matches.length} 场比赛`;
    $("#resultBadge").textContent = challenge
      ? `${challengeName(challenge)} · ${run.formation}`
      : run.mode === "dynasty"
        ? `${uiText("王朝模式", "Dynasty")} · ${simulationSeason(run)} · ${Number(run.dynasty?.currentIndex || 0) + 1}/${run.dynasty?.seasons?.length || 1}`
      : `${run.formation} · ${leagueName || seasonText}`;
    $("#resultRecord").textContent = `${result.wins}-${result.draws}-${result.losses}`;
    $("#resultPoints").textContent = `${result.points} 分`;
    $("#resultScore").textContent = `${result.points} 分 · 第 ${result.finish} 名`;
    renderSeasonReview(run, result);
    renderDynastyProgress(run);

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
    renderChallengeResult(run);

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

  function finishDomesticCupInBackgroundAfterElimination(sim) {
    const cup = sim?.domesticCup;
    if (!cup || cup.finished || cup.currentTeams.some((team) => team.isUser)) return;
    while (!cup.finished) simulateDomesticCupRound(sim);
  }

  function syncDomesticCupUserProfile(sim, profile = sim?.profileMap?.["我的球队"]) {
    const user = sim?.domesticCup?.teams?.find((team) => team.isUser);
    if (!user || !profile) return;
    user.profile = profile;
    user.strength = teamStrength(profile);
  }

  function simulateDomesticCupRound(sim) {
    const cup = sim.domesticCup;
    if (!cup || cup.finished) return null;
    const stage = DOMESTIC_CUP_STAGES[cup.roundIndex] || "决赛";
    const shuffled = shuffleWithRng(cup.currentTeams, sim.rng);
    const ties = [];
    const winners = [];
    let userMatch = null;
    for (let index = 0; index < shuffled.length; index += 2) {
      const home = shuffled[index];
      const away = shuffled[index + 1];
      const neutral = stage === "决赛";
      const tie = createEuropeanTie(home, away, false, neutral);
      const played = simulateEuropeanTie(home, away, sim.rng, neutral);
      tie.legs.push(played);
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
        userMatch = { cup, stage, tie, played };
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
    return userMatch;
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
      const strength = teamStrength(profile);
      return {
        name: club.name,
        strength,
        profile,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        awayGoals: 0,
        awayWins: 0,
        disciplinaryPoints: 0,
        clubCoefficient: strength,
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
      awayGoals: 0,
      awayWins: 0,
      disciplinaryPoints: 0,
      clubCoefficient: strength,
      isUser: false
    };
  }

  function createEuropeanSimulation(run, competition) {
    const rng = makeRng(hashSeed(`europe-${run.id}-${competition}`));
    const entries = (typeof EUROPE_2025_26 !== "undefined" && EUROPE_2025_26[competition]) || null;
    const teams = [];
    if (run.mode === "dynasty") {
      const season = simulationSeason(run);
      const rankOffset = competition === "UCL" ? 0 : competition === "UEL" ? 3 : 6;
      const pool = ["eng", "esp", "ita", "ger", "fra"].flatMap((leagueId) => {
        const standings = dynastyStandings(season, leagueId);
        const clubs = clubsForLeague(leagueId, season);
        return standings.slice(rankOffset, rankOffset + 7).map((name, index) => ({
          name,
          profile: dynastyRankProfile(name, rankOffset + index, standings.length, clubs)
        }));
      });
      shuffleWithRng(pool, rng).slice(0, 35).forEach((entry) => {
        teams.push({
          name: entry.name,
          strength: teamStrength(entry.profile),
          profile: entry.profile,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          awayGoals: 0,
          awayWins: 0,
          disciplinaryPoints: 0,
          clubCoefficient: teamStrength(entry.profile),
          isUser: false
        });
      });
    } else if (entries && entries.length) {
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
          awayGoals: 0,
          awayWins: 0,
          disciplinaryPoints: 0,
          clubCoefficient: teamStrength(profile),
          isUser: false
        });
      });
    }
    const userProfile = applyCoachToProfile(calcTeamProfile(run), getCoach(run));
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
      awayGoals: 0,
      awayWins: 0,
      disciplinaryPoints: 0,
      clubCoefficient: teamStrength(userProfile),
      isUser: true
    });
    const matchdays = competition === "UECL" ? 6 : 8;
    return {
      run,
      competition,
      rng,
      teams,
      matchdays,
      leagueRounds: buildEuropeanLeagueRounds(teams, matchdays, rng),
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

  function buildEuropeanLeagueRounds(teams, matchdays, rng) {
    return G38SimulationCore.buildLeaguePhaseSchedule(teams, matchdays, rng);
  }

  function simulateNextEuropeanStep(sim) {
    if (sim.finished) return;
    const delay = 24;
    if (sim.phase === "league") {
      const round = sim.leagueRounds[sim.roundIndex];
      const match = round.matches[sim.matchIndex];
      const played = simulateEuropeanTie(match.home, match.away, sim.rng, false);
      updateEuropeanStats(match.home, played.homeGoals, played.awayGoals, false);
      updateEuropeanStats(match.away, played.awayGoals, played.homeGoals, true);
      const log = {
        stage: `联赛阶段第 ${round.round} 轮`,
        text: `${match.home.name} ${played.homeGoals}-${played.awayGoals} ${match.away.name}`,
        home: match.home.name,
        away: match.away.name,
        homeGoals: played.homeGoals,
        awayGoals: played.awayGoals,
        homeIsUser: Boolean(match.home.isUser),
        awayIsUser: Boolean(match.away.isUser),
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
        const { home, away } = G38SimulationCore.nextKnockoutLegTeams(tie);
        const played = simulateEuropeanTie(home, away, sim.rng, tie.neutral);
        tie.legs.push(played);
        const log = {
          stage: stage.name,
          text: `${home.name} ${played.homeGoals}-${played.awayGoals} ${away.name}`,
          userMatch: home.isUser || away.isUser
        };
        sim.logs.push(log);
        const tieComplete = tie.legs.length >= (stage.twoLeg ? 2 : 1);
        if (tieComplete) {
          finalizeEuropeanTie(tie, sim.rng);
        }
        if (log.userMatch) {
          playEuropeanKnockoutMatch(sim, stage, tie, played, () => {
            if (tieComplete) {
              logEuropeanTieResolution(sim, stage, tie);
              stage.tieIndex += 1;
              if (stage.tieIndex >= stage.ties.length) {
                advanceEuropeanStage(sim, stage);
              }
            }
            setTimeout(() => simulateNextEuropeanStep(sim), delay);
          });
          return;
        }
        if (tieComplete) {
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
    const table = G38SimulationCore.sortEuropeanLeaguePhase(sim.teams, sim.logs);
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

  function createEuropeanTie(teamA, teamB, twoLeg, neutral = false) {
    return { teamA, teamB, legs: [], winner: null, twoLeg, neutral, aggregateA: 0, aggregateB: 0 };
  }

  function finalizeEuropeanTie(tie, rng) {
    const aggregate = G38SimulationCore.aggregateKnockoutTie(tie);
    tie.aggregateA = aggregate.aggregateA;
    tie.aggregateB = aggregate.aggregateB;
    if (tie.aggregateA !== tie.aggregateB) {
      tie.winner = tie.aggregateA > tie.aggregateB ? tie.teamA : tie.teamB;
      return;
    }
    const lastLeg = tie.legs[tie.legs.length - 1];
    const home = lastLeg.home;
    const away = lastLeg.away;
    const extraTime = simulateEuropeanExtraTime(home, away, rng, tie.neutral);
    tie.extraTime = extraTime;
    if (extraTime.homeGoals !== extraTime.awayGoals) {
      tie.winner = extraTime.homeGoals > extraTime.awayGoals ? home : away;
      return;
    }
    const penalties = simulateEuropeanPenalties(home, away, rng, tie.neutral);
    tie.penalties = penalties;
    tie.winner = penalties.winner;
  }

  function simulateEuropeanExtraTime(teamA, teamB, rng, neutral = false) {
    return G38SimulationCore.simulateKnockoutExtraTime(teamA, teamB, rng, { neutral });
  }

  function simulateEuropeanPenalties(teamA, teamB, rng, neutral = false) {
    return G38SimulationCore.simulateKnockoutPenalties(teamA, teamB, rng, { neutral });
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
    const winners = completedStage.ties.map((tie) => tie.winner);
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
      const qfTies = [];
      for (let index = 0; index < winners.length; index += 2) qfTies.push(createEuropeanTie(winners[index], winners[index + 1], true));
      sim.currentStage = { name: "1/4决赛", ties: qfTies, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "1/4决赛") {
      const sfTies = [];
      for (let index = 0; index < winners.length; index += 2) sfTies.push(createEuropeanTie(winners[index], winners[index + 1], true));
      sim.currentStage = { name: "半决赛", ties: sfTies, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "半决赛") {
      sim.currentStage = { name: "决赛", ties: [createEuropeanTie(winners[0], winners[1], false, true)], tieIndex: 0, twoLeg: false };
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
    if (sim.run.mode === "dynasty" && sim.run.dynasty) {
      const seasonRecord = sim.run.dynasty.results.find((entry) => entry.season === simulationSeason(sim.run));
      if (seasonRecord) seasonRecord.europeResult = sim.run.europeResult;
      if (champion?.isUser) sim.run.dynasty.trophies.europe += 1;
    }
    sim.run.europeSim = null;
    sim.finished = true;
    if (sim.run === state.game) saveGame();
    updateRun(sim.run);
    renderHomeHistory();
    renderChallengeSetup();
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
    ui.europeResults.appendChild(renderEuropeanLeagueResultRow(step, true));
    const latest = el("div", "europe-league-results-list", "");
    const visibleLogs = sim.logs.filter((log) => log.userMatch);
    visibleLogs.slice(-14).reverse().forEach((log) => {
      latest.appendChild(renderEuropeanLeagueResultRow(log));
    });
    ui.europeResults.appendChild(latest);
  }

  function europeanMatchFromLog(log) {
    if (log?.home && log?.away) {
      return {
        home: log.home,
        away: log.away,
        homeGoals: log.homeGoals,
        awayGoals: log.awayGoals,
        homeIsUser: Boolean(log.homeIsUser),
        awayIsUser: Boolean(log.awayIsUser)
      };
    }
    const match = String(log?.text || "").match(/^(.*?)\s+(\d+)-(\d+)\s+(.*?)$/);
    if (!match) return null;
    return {
      home: match[1],
      away: match[4],
      homeGoals: Number(match[2]),
      awayGoals: Number(match[3]),
      homeIsUser: match[1] === "我的球队",
      awayIsUser: match[4] === "我的球队"
    };
  }

  function renderEuropeanLeagueResultRow(log, current = false) {
    const match = europeanMatchFromLog(log);
    const row = el("div", current ? "europe-league-current" : "europe-league-result-row", "");
    row.classList.toggle("user-row", Boolean(log?.userMatch));
    if (!match) {
      row.appendChild(el("span", "europe-league-round", log?.stage || ""));
      row.appendChild(el("span", "europe-league-matchup", log?.text || ""));
      return row;
    }
    const userFirst = match.homeIsUser || match.awayIsUser;
    const firstTeam = userFirst ? "我的球队" : match.home;
    const secondTeam = userFirst
      ? match.homeIsUser ? match.away : match.home
      : match.away;
    const firstGoals = userFirst && match.awayIsUser ? match.awayGoals : match.homeGoals;
    const secondGoals = userFirst && match.awayIsUser ? match.homeGoals : match.awayGoals;
    if (userFirst) {
      row.classList.add(firstGoals > secondGoals ? "result-win" : firstGoals === secondGoals ? "result-draw" : "result-loss");
    }
    row.appendChild(el("strong", "europe-league-score", `${firstGoals}-${secondGoals}`));
    row.appendChild(el("span", "europe-league-round", log?.stage || ""));
    row.appendChild(el("span", `sim-venue ${match.homeIsUser ? "home" : "away"}`, uiText(
      match.homeIsUser ? "主场" : "客场",
      match.homeIsUser ? "Home" : "Away"
    )));
    const teams = el("div", "europe-league-matchup", "");
    teams.appendChild(el("span", userFirst ? "user-team" : "", uiText(firstTeam, userFirst ? "My Team" : firstTeam)));
    teams.appendChild(el("small", "", "vs"));
    teams.appendChild(el("span", "", secondTeam));
    row.appendChild(teams);
    return row;
  }

  function europeanStageText(stage) {
    const names = {
      "附加赛": "Knockout play-off",
      "1/8决赛": "Round of 16",
      "1/4决赛": "Quarter-final",
      "半决赛": "Semi-final",
      "决赛": "Final"
    };
    return uiText(stage, names[stage] || stage);
  }

  function europeanGoalEvents(played, stageName, legNumber, extraTime, runId) {
    const seed = [
      "europe-goals",
      runId,
      stageName,
      legNumber,
      played.home.name,
      played.away.name,
      played.homeGoals,
      played.awayGoals,
      extraTime?.homeGoals || 0,
      extraTime?.awayGoals || 0
    ].join("|");
    const rng = makeRng(hashSeed(seed));
    const events = [];
    const addGoals = (count, side, startMinute, endMinute) => {
      for (let index = 0; index < count; index += 1) {
        events.push({
          minute: startMinute + Math.floor(rng() * (endMinute - startMinute + 1)),
          side
        });
      }
    };
    addGoals(played.homeGoals, "home", 4, 88);
    addGoals(played.awayGoals, "away", 4, 88);
    addGoals(extraTime?.homeGoals || 0, "home", 94, 118);
    addGoals(extraTime?.awayGoals || 0, "away", 94, 118);
    return events.sort((a, b) => a.minute - b.minute || (a.side === "home" ? -1 : 1));
  }

  function europeanAggregateAtMinute(tie, played, homeGoals, awayGoals) {
    const previousLegs = tie.legs.slice(0, -1);
    let teamAGoals = 0;
    let teamBGoals = 0;
    previousLegs.forEach((leg) => {
      teamAGoals += leg.home === tie.teamA ? leg.homeGoals : leg.awayGoals;
      teamBGoals += leg.home === tie.teamB ? leg.homeGoals : leg.awayGoals;
    });
    teamAGoals += played.home === tie.teamA ? homeGoals : awayGoals;
    teamBGoals += played.home === tie.teamB ? homeGoals : awayGoals;
    return { teamAGoals, teamBGoals };
  }

  function playDomesticCupMatch(sim, match, onComplete) {
    ui.simulationCurrent.classList.remove("league-simulation-shell");
    ui.simulationProgress.textContent = uiText(
      `${sim.matches.length}/${sim.matchCount} · 国内杯赛`,
      `${sim.matches.length}/${sim.matchCount} · Domestic cup`
    );
    playEuropeanKnockoutMatch(sim, { name: match.stage, twoLeg: false }, match.tie, match.played, onComplete, {
      container: ui.simulationCurrent,
      title: uiText(`${match.cup.name} · ${match.stage}`, `${match.cup.nameEn} · ${domesticCupStageText(match.stage)}`),
      matchLabel: uiText("单场淘汰赛", "Knockout tie"),
      seedId: sim.game.id,
      className: "domestic-cup-live"
    });
  }

  function playEuropeanKnockoutMatch(sim, stage, tie, played, onComplete, options = {}) {
    const container = options.container || ui.europeResults;
    container.innerHTML = "";
    const legNumber = tie.legs.length;
    const extraTime = tie.extraTime || null;
    const maxMinute = extraTime ? 120 : 90;
    const events = europeanGoalEvents(played, stage.name, legNumber, extraTime, options.seedId || sim.run.id);
    const live = el("div", `europe-live-match${options.className ? ` ${options.className}` : ""}`, "");
    const heading = el("div", "europe-live-heading", "");
    heading.appendChild(el("strong", "", options.title || europeanStageText(stage.name)));
    heading.appendChild(el(
      "span",
      "europe-leg-label",
      options.matchLabel || (stage.twoLeg
        ? uiText(`第 ${legNumber} 回合`, legNumber === 1 ? "First leg" : "Second leg")
        : uiText("单场决胜", "Single match"))
    ));
    live.appendChild(heading);

    const scoreboard = el("div", "europe-live-scoreboard", "");
    const homeName = el("span", "europe-live-team home", uiText(played.home.name, played.home.isUser ? "My Team" : played.home.name));
    const score = el("strong", "europe-live-score", "0 - 0");
    const awayName = el("span", "europe-live-team away", uiText(played.away.name, played.away.isUser ? "My Team" : played.away.name));
    scoreboard.append(homeName, score, awayName);
    live.appendChild(scoreboard);

    const aggregate = el("div", "europe-live-aggregate", "");
    if (stage.twoLeg) live.appendChild(aggregate);

    const clock = el("div", "europe-live-clock", "0′");
    live.appendChild(clock);
    const timeline = el("div", "europe-timeline", "");
    const track = el("div", "europe-timeline-track", "");
    const fill = el("div", "europe-timeline-fill", "");
    track.appendChild(fill);
    [0, 45, 90, ...(maxMinute === 120 ? [120] : [])].forEach((minute) => {
      const tick = el("span", "europe-timeline-tick", `${minute}′`);
      tick.style.left = `${(minute / maxMinute) * 100}%`;
      track.appendChild(tick);
    });
    const markers = events.map((event) => {
      const marker = el("span", `europe-goal-marker ${event.side}`, "⚽");
      marker.style.left = `${(event.minute / maxMinute) * 100}%`;
      marker.title = `${event.minute}′ · ${event.side === "home" ? played.home.name : played.away.name}`;
      track.appendChild(marker);
      return marker;
    });
    timeline.appendChild(track);
    live.appendChild(timeline);

    const eventFeed = el("div", "europe-goal-feed", "");
    eventFeed.appendChild(el("span", "europe-goal-feed-empty", uiText("等待开球…", "Waiting for kick-off…")));
    live.appendChild(eventFeed);
    const controls = el("div", "europe-live-controls", "");
    const skipButton = el("button", "btn btn-ghost europe-skip-button", uiText("跳过动画", "Skip animation"));
    skipButton.type = "button";
    controls.appendChild(skipButton);
    live.appendChild(controls);
    container.appendChild(live);

    let minute = 0;
    let homeGoals = 0;
    let awayGoals = 0;
    let revealedCount = 0;
    let completed = false;
    const renderMinute = (targetMinute) => {
      minute = targetMinute;
      while (revealedCount < events.length && events[revealedCount].minute <= minute) {
        const event = events[revealedCount];
        if (event.side === "home") homeGoals += 1;
        else awayGoals += 1;
        markers[revealedCount].classList.add("show");
        if (revealedCount === 0) eventFeed.innerHTML = "";
        const team = event.side === "home" ? played.home : played.away;
        eventFeed.appendChild(el(
          "span",
          `europe-goal-event ${event.side}`,
          `⚽ ${event.minute}′ · ${uiText(team.name, team.isUser ? "My Team" : team.name)}`
        ));
        revealedCount += 1;
      }
      score.textContent = `${homeGoals} - ${awayGoals}`;
      clock.textContent = `${minute}′`;
      fill.style.width = `${(minute / maxMinute) * 100}%`;
      if (stage.twoLeg) {
        const total = europeanAggregateAtMinute(tie, played, homeGoals, awayGoals);
        aggregate.textContent = uiText(
          `总比分：${tie.teamA.name} ${total.teamAGoals}-${total.teamBGoals} ${tie.teamB.name}`,
          `Aggregate: ${tie.teamA.isUser ? "My Team" : tie.teamA.name} ${total.teamAGoals}-${total.teamBGoals} ${tie.teamB.isUser ? "My Team" : tie.teamB.name}`
        );
      }
    };
    const finish = (skipped = false) => {
      if (completed) return;
      completed = true;
      clearInterval(sim.liveMatchTimer);
      sim.liveMatchTimer = null;
      renderMinute(maxMinute);
      skipButton.disabled = true;
      clock.textContent = extraTime ? uiText("加时结束", "AET") : uiText("全场结束", "Full time");
      if (tie.penalties) {
        eventFeed.querySelector(".europe-goal-feed-empty")?.remove();
        eventFeed.appendChild(el(
          "span",
          "europe-penalty-result",
          uiText(`点球大战 ${tie.penalties.home}-${tie.penalties.away}`, `Penalties ${tie.penalties.home}-${tie.penalties.away}`)
        ));
      }
      setTimeout(onComplete, skipped ? 180 : 1200);
    };
    skipButton.addEventListener("click", () => finish(true));
    renderMinute(0);
    sim.liveMatchTimer = setInterval(() => {
      const nextMinute = Math.min(maxMinute, minute + 1);
      renderMinute(nextMinute);
      if (nextMinute >= maxMinute) finish();
    }, 100);
  }

  function simulateEuropeanTie(teamA, teamB, rng, neutral) {
    const homeProfile = teamA.profile || europeProfileFromStrength(teamA.strength);
    const awayProfile = teamB.profile || europeProfileFromStrength(teamB.strength);
    const result = simulateLeagueResult(homeProfile, awayProfile, rng, teamA.name, undefined, undefined, { neutral });
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
    const tie = createEuropeanTie(teamA, teamB, true);
    for (let legIndex = 0; legIndex < 2; legIndex += 1) {
      const { home, away } = G38SimulationCore.nextKnockoutLegTeams(tie);
      tie.legs.push(simulateEuropeanTie(home, away, rng, false));
    }
    finalizeEuropeanTie(tie, rng);
    return {
      home: teamA,
      away: teamB,
      homeGoals: tie.aggregateA,
      awayGoals: tie.aggregateB,
      winner: tie.winner,
      legs: tie.legs,
      extraTime: tie.extraTime,
      penalties: tie.penalties
    };
  }

  function updateEuropeanStats(team, goalsFor, goalsAgainst, isAway = false) {
    if (!team) return;
    team.played = Number(team.played || 0) + 1;
    if (goalsFor > goalsAgainst) {
      team.wins = Number(team.wins || 0) + 1;
      if (isAway) team.awayWins = Number(team.awayWins || 0) + 1;
    }
    else if (goalsFor === goalsAgainst) team.draws = Number(team.draws || 0) + 1;
    else team.losses = Number(team.losses || 0) + 1;
    team.points += goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
    team.goalsFor += goalsFor;
    team.goalsAgainst += goalsAgainst;
    if (isAway) team.awayGoals = Number(team.awayGoals || 0) + goalsFor;
  }

  function renderEuropeanBracket(rounds) {
    if (!Array.isArray(rounds) || !rounds.length) return null;
    const orderedRounds = orderEuropeanBracketRounds(rounds);
    const block = el("section", "europe-bracket-block", "");
    block.appendChild(el("h3", "", uiText("淘汰赛晋级图", "Knockout Bracket")));
    const scroll = el("div", "europe-bracket-scroll", "");
    const bracket = el("div", "europe-bracket", "");
    const connectorLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connectorLayer.classList.add("europe-bracket-connectors");
    connectorLayer.setAttribute("aria-hidden", "true");
    bracket.appendChild(connectorLayer);
    const roundCards = [];
    orderedRounds.forEach((round) => {
      const column = el("section", "europe-bracket-round", "");
      column.appendChild(el("h4", "", europeanStageText(round.name)));
      const matches = el("div", "europe-bracket-matches", "");
      const cards = [];
      (round.ties || []).forEach((tie) => {
        const home = tie.home || {};
        const away = tie.away || {};
        const winner = tie.winner || {};
        const userTie = Boolean(home.isUser || away.isUser);
        const card = el("article", "europe-bracket-match", "");
        card.classList.toggle("user-match", userTie);
        [
          [home, tie.homeGoals],
          [away, tie.awayGoals]
        ].forEach(([team, goals]) => {
          const row = el("div", "europe-bracket-team", "");
          row.classList.toggle("winner", Boolean(winner.name && winner.name === team.name));
          row.classList.toggle("user-team", Boolean(team.isUser));
          row.appendChild(el("span", "", uiText(team.name || "--", team.isUser ? "My Team" : (team.name || "--"))));
          row.appendChild(el("strong", "", String(goals ?? "-")));
          card.appendChild(row);
        });
        if (tie.extraTime || tie.penalties) {
          const detail = tie.penalties
            ? uiText(`点球 ${tie.penalties.home}-${tie.penalties.away}`, `Pens ${tie.penalties.home}-${tie.penalties.away}`)
            : uiText(`加时 ${tie.extraTime.homeGoals}-${tie.extraTime.awayGoals}`, `AET ${tie.extraTime.homeGoals}-${tie.extraTime.awayGoals}`);
          card.appendChild(el("small", "europe-bracket-detail", detail));
        }
        matches.appendChild(card);
        cards.push({ tie, card, userTie });
      });
      column.appendChild(matches);
      bracket.appendChild(column);
      roundCards.push(cards);
    });
    scroll.appendChild(bracket);
    block.appendChild(scroll);
    const drawConnectors = () => drawEuropeanBracketConnectors(bracket, connectorLayer, roundCards);
    requestAnimationFrame(drawConnectors);
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(drawConnectors);
      observer.observe(bracket);
    }
    return block;
  }

  function orderEuropeanBracketRounds(rounds) {
    const ordered = rounds.map((round) => ({
      ...round,
      ties: [...(round.ties || [])]
    }));
    for (let roundIndex = ordered.length - 2; roundIndex >= 0; roundIndex -= 1) {
      const nextTeamOrder = new Map();
      ordered[roundIndex + 1].ties.forEach((tie, tieIndex) => {
        [tie.home?.name, tie.away?.name].forEach((name, teamIndex) => {
          if (name) nextTeamOrder.set(name, tieIndex * 2 + teamIndex);
        });
      });
      ordered[roundIndex].ties.sort((left, right) => {
        const leftOrder = nextTeamOrder.get(left.winner?.name) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = nextTeamOrder.get(right.winner?.name) ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder;
      });
    }
    return ordered;
  }

  function drawEuropeanBracketConnectors(bracket, connectorLayer, roundCards) {
    if (!bracket.isConnected) return;
    const bracketRect = bracket.getBoundingClientRect();
    const width = bracket.scrollWidth;
    const height = bracket.scrollHeight;
    connectorLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
    connectorLayer.setAttribute("width", String(width));
    connectorLayer.setAttribute("height", String(height));
    connectorLayer.replaceChildren();
    for (let roundIndex = 1; roundIndex < roundCards.length; roundIndex += 1) {
      const previousCards = roundCards[roundIndex - 1];
      roundCards[roundIndex].forEach((target) => {
        const targetTeams = [target.tie.home?.name, target.tie.away?.name].filter(Boolean);
        targetTeams.forEach((teamName) => {
          const source = previousCards.find((entry) => entry.tie.winner?.name === teamName);
          if (!source) return;
          const sourceRect = source.card.getBoundingClientRect();
          const targetRect = target.card.getBoundingClientRect();
          const startX = sourceRect.right - bracketRect.left;
          const startY = sourceRect.top + sourceRect.height / 2 - bracketRect.top;
          const endX = targetRect.left - bracketRect.left;
          const endY = targetRect.top + targetRect.height / 2 - bracketRect.top;
          const bendX = startX + (endX - startX) / 2;
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M ${startX} ${startY} H ${bendX} V ${endY} H ${endX}`);
          path.classList.add("europe-bracket-connector");
          if (source.tie.winner?.isUser) path.classList.add("user-path");
          connectorLayer.appendChild(path);
        });
      });
    }
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
    const leaguePhaseLogs = (europeResult.logs || []).filter((log) => (
      log.userMatch && String(log.stage || "").startsWith("联赛阶段")
    ));
    if (leaguePhaseLogs.length) {
      const leagueResults = el("section", "europe-league-phase-results", "");
      leagueResults.appendChild(el("h3", "", uiText("联赛阶段赛果", "League Phase Results")));
      const list = el("div", "europe-league-results-list", "");
      leaguePhaseLogs.forEach((log) => list.appendChild(renderEuropeanLeagueResultRow(log)));
      leagueResults.appendChild(list);
      ui.europeResults.appendChild(leagueResults);
    }
    const bracket = renderEuropeanBracket(europeResult.rounds);
    if (bracket) ui.europeResults.appendChild(bracket);
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
    renderChallengeSetup();
  }

  function shareResult() {
    const run = state.viewingRun || state.game;
    if (!run?.result) return;
    const result = run.result;
    const challenge = getChallenge(run.challengeId);
    const challengeText = challenge
      ? `，完成${challenge.name}挑战 ${result.challenge?.stars || 0}/3 星`
      : "";
    const text = `Global 38-0：我用了 ${run.formation} 阵容，${result.wins}-${result.draws}-${result.losses}，${result.points} 分，第 ${result.finish} 名${challengeText}。敢来挑战吗？`;
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
