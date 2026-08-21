(() => {
  "use strict";

  window.G38Challenges = [
    {
      id: "underdog",
      icon: "🐗",
      name: "草根奇迹",
      nameEn: "Underdog Miracle",
      description: "用总评不超过 84 的最终阵容冲击联赛巅峰。",
      descriptionEn: "Chase league glory with a final squad rated 84 or lower.",
      rules: ["最终阵容评分不超过 84"],
      rulesEn: ["Final squad rating must not exceed 84"],
      objectives: [
        { id: "top6", text: "联赛前六", textEn: "Finish in the top six" },
        { id: "top4", text: "联赛前四", textEn: "Finish in the top four" },
        { id: "champion", text: "赢得联赛冠军", textEn: "Win the league" }
      ]
    },
    {
      id: "iron-manager",
      icon: "🧱",
      name: "铁血经理",
      nameEn: "Iron Manager",
      description: "没有重抽、教练和冬窗援军，只靠最初的十一人。",
      descriptionEn: "No rerolls, coach, or winter reinforcements. Trust your original XI.",
      rules: ["0 次重抽", "不可聘请教练", "自动跳过转会窗"],
      rulesEn: ["No rerolls", "No coach", "Transfer window is skipped"],
      objectives: [
        { id: "top4", text: "联赛前四", textEn: "Finish in the top four" },
        { id: "points80", text: "获得至少 80 分", textEn: "Earn at least 80 points" },
        { id: "champion", text: "赢得联赛冠军", textEn: "Win the league" }
      ]
    },
    {
      id: "time-traveller",
      icon: "⌛",
      name: "时空旅人",
      nameEn: "Time Traveller",
      description: "让不同时代的球员组成跨越足球历史的首发阵容。",
      descriptionEn: "Build a starting XI that spans football history.",
      rules: ["最终首发至少来自 8 个不同赛季"],
      rulesEn: ["Final XI must represent at least 8 different seasons"],
      objectives: [
        { id: "valid-lineup", text: "满足跨赛季阵容条件", textEn: "Meet the multi-season squad rule" },
        { id: "ucl", text: "满足阵容条件并获得欧冠资格", textEn: "Meet the rule and qualify for the UCL" },
        { id: "title", text: "满足阵容条件并赢得联赛或国内杯", textEn: "Meet the rule and win the league or domestic cup" }
      ]
    },
    {
      id: "global-dressing-room",
      icon: "🌍",
      name: "环球更衣室",
      nameEn: "Global Dressing Room",
      description: "用多国球员和五大联赛履历打造真正的全球明星队。",
      descriptionEn: "Build a truly global XI with varied nationalities and Big Five experience.",
      rules: ["最终首发至少 8 个国籍", "最终首发覆盖五大联赛"],
      rulesEn: ["Final XI must include at least 8 nationalities", "Final XI must cover all Big Five leagues"],
      objectives: [
        { id: "top6", text: "满足阵容条件并进入前六", textEn: "Meet the rules and finish in the top six" },
        { id: "top4", text: "满足阵容条件并进入前四", textEn: "Meet the rules and finish in the top four" },
        { id: "title", text: "满足阵容条件并赢得任意冠军", textEn: "Meet the rules and win either title" }
      ]
    },
    {
      id: "defensive-master",
      icon: "🛡️",
      name: "防守大师",
      nameEn: "Defensive Master",
      description: "把整个联赛变成你的零封作品集。",
      descriptionEn: "Turn the league season into a clean-sheet showcase.",
      rules: ["以联赛总失球数结算"],
      rulesEn: ["Objectives are based on total league goals conceded"],
      objectives: [
        { id: "concede30", text: "失球不超过 30", textEn: "Concede no more than 30" },
        { id: "concede20", text: "失球不超过 20", textEn: "Concede no more than 20" },
        { id: "concede10-champion", text: "失球不超过 10 且联赛夺冠", textEn: "Concede no more than 10 and win the league" }
      ]
    },
    {
      id: "club-peak",
      icon: "🏛️",
      name: "俱乐部巅峰",
      nameEn: "Club Peak",
      description: "选择一支五大联赛球队，挑战它在历史数据中的最佳联赛成绩。",
      descriptionEn: "Choose a Big Five club and challenge its best league finish in the historical database.",
      rules: ["目标球队固定参加所属联赛", "队史最佳排名按现有历史赛季数据计算", "每支球队单独记录你的最高成绩"],
      rulesEn: ["The target club stays in its own league", "The benchmark uses the available historical seasons", "Your best result is tracked for every club"],
      objectives: [
        { id: "match-best", text: "达到队史最佳联赛排名", textEn: "Match the club's best league finish" },
        { id: "new-best", text: "刷新队史最佳排名", textEn: "Set a new club-best finish" },
        { id: "double", text: "联赛与国内杯双冠", textEn: "Win the league and domestic cup" }
      ]
    }
  ];
})();
