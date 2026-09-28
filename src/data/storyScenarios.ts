import { StoryStep } from '../types/game';

export const STORY_SCENARIOS: Record<string, StoryStep> = {
  prologue: {
    id: 'prologue',
    era: 'AD_1000',
    speaker: '加爾迪亞千禧盛典 ‧ 中央廣場',
    title: '序章：時空裂隙的召喚',
    dialogue: `王國盛典的中央廣場上，露卡展示的「物質傳送機」突然發生超載引力共振，懸掛在少女身上的「時空之石」吊墜迸發出刺眼光芒，將空間撕裂出一道漆黑扭曲的時空之門（Gate）！\n\n少女被吸入了虛空之中，只在地面上留下了微弱發光的吊墜。警衛隊正大喊著朝這裡趕來，空氣中瀰漫著時空紊亂的電弧與焦糊味。\n\n克羅斯，你必須在此刻做出命運的抉擇！`,
    isCustomActionAllowed: true,
    choices: [
      {
        text: '【選項 1】撿起時空吊墜，義無反顧跳入時空門追尋少女。',
        consequenceText: '你彎腰拾起發光的時空吊墜，吊墜與你手中的太刀產生強烈共振！在警衛隊驚呼聲中，你縱身躍入漆黑扭曲的時空漩渦！強烈的失重感席卷全身……',
        nextStepId: 'arrive_ad_600_direct',
        teleportEra: 'AD_600',
      },
      {
        text: '【選項 2】讓露卡迅速調整傳送機頻率，鎖定少女掉落的確切時間座標再進入。',
        consequenceText: '露卡飛快敲打控制台：「頻率同步 94%！座標定位在中世紀加爾迪亞（A.D. 600）！拿上備用能源電池！」裝備校準完成後，你們兩人從容跨入穩定化的蟲洞。',
        nextStepId: 'arrive_ad_600_calibrated',
        teleportEra: 'AD_600',
        rewardItem: 'ether',
      },
      {
        text: '【選項 3】拔出佩劍，先阻止被時空裂縫吸引並湧入廣場的異次元魔物。',
        consequenceText: '你鏗鏘拔出太刀，斬斷從時空裂隙探出的紫黑色觸鬚！保護了廣場上驚慌的鎮民，隨後立刻進入戰鬥迎擊異次元狂暴生物！',
        nextStepId: 'prologue_battle_clear',
        startBattleEnemyId: 'rift_beast',
      },
    ],
  },

  prologue_battle_clear: {
    id: 'prologue_battle_clear',
    era: 'AD_1000',
    speaker: '露卡 (魔導技師)',
    title: '序章：裂隙肅清',
    dialogue: `「好身手，克羅斯！魔物已經被驅散，但傳送門的光芒正在衰退！如果現在不進去，時空座標就會永久漂移，那個女孩就再也回不來了！」`,
    choices: [
      {
        text: '拿起吊墜，與露卡攜手跳入時空門！',
        consequenceText: '吊墜的光芒再度盛放，裹挾著你們穿越無盡的次元洪流，降落在了四百年前的中世紀森林！',
        nextStepId: 'arrive_ad_600_direct',
        teleportEra: 'AD_600',
      },
    ],
  },

  arrive_ad_600_direct: {
    id: 'arrive_ad_600_direct',
    era: 'AD_600',
    speaker: '中世紀加爾迪亞 ‧ 特魯斯峽谷森林',
    title: '第一章：四百年前的風聲',
    dialogue: `耳邊傳來風吹過樹冠的沙沙聲。你們墜落在茂密的原始樹林草地上。遠處赫然聳立著一座比千禧年更古樸威嚴的城堡——加爾迪亞王城！\n\n然而，附近的村民低聲啜泣，傳聞城堡中的「真理大教堂」發生了異變，王后被魔物替換，而一位擁有金色秀髮的神秘少女正被軟禁在大教堂地下！`,
    isCustomActionAllowed: true,
    choices: [
      {
        text: '潛入真理大教堂，揭露魔物的偽裝並救出少女。',
        consequenceText: '你們推開莊嚴卻陰森的教堂銅門，修女們眼中閃爍著冷酷的凶光，魔王軍的爪牙現形了！',
        startBattleEnemyId: 'yakra_boss',
        nextStepId: 'cathedral_cleared',
      },
      {
        text: '在迷霧森林探索，尋找被困的森林妖精樹靈。',
        consequenceText: '在古木樹蔭下，你們發現了被怨氣纏繞的幼小森林精靈。用淨化之泉解救了它，古老的妖精立下了千年之約！',
        butterflyKey: 'dryad_rescue',
        nextStepId: 'spirit_saved',
      },
      {
        text: '尋找古代時空裂隙，嘗試開啟前往更遙遠時代的蟲洞。',
        consequenceText: '時空吊墜再次在祭壇發熱，引導你們穿過時空夾縫，望向更狂暴的遠古大地……',
        teleportEra: 'BC_65M',
        nextStepId: 'arrive_bc_65m',
      },
    ],
  },

  arrive_ad_600_calibrated: {
    id: 'arrive_ad_600_calibrated',
    era: 'AD_600',
    speaker: '露卡 (魔導技師)',
    title: '第一章：精準著陸',
    dialogue: `「看！儀表顯示這裡是 A.D. 600 年！而且我的時空掃描儀偵測到了吊墜微弱的同頻波長——就在前方的真理大教堂！那個失蹤的女孩很可能就是加爾迪亞王國的始祖王女，或者……」\n\n露卡突然摀住嘴：「如果她遭遇不測，千禧年的歷史就會完全消失崩塌！」`,
    isCustomActionAllowed: true,
    choices: [
      {
        text: '刻不容緩！突襲真理大教堂消滅魔王軍！',
        consequenceText: '兩人拔出武器殺入修道院大廳，直取偽裝主教雅庫拉！',
        startBattleEnemyId: 'yakra_boss',
        nextStepId: 'cathedral_cleared',
      },
      {
        text: '先前往王城守護寶庫，加強封印避免古代黑箱被魔物掠奪。',
        consequenceText: '你們成功修復了王城寶庫的防護法陣，並未貪婪打開黑箱，因果之線劇烈變動……四百年後的寶庫將凝結出神器！',
        butterflyKey: 'royal_treasury_seal',
        nextStepId: 'cathedral_cleared',
      },
    ],
  },

  cathedral_cleared: {
    id: 'cathedral_cleared',
    era: 'AD_600',
    speaker: '瑪爾 (王女瑪莉亞)',
    title: '第一章：真理與羈絆',
    dialogue: `「克羅斯！露卡！真的是你們！」少女緊緊抱住你們。原來她正是千禧年的王女瑪爾，因項鍊共鳴被傳送到了古代。\n\n此時，教堂頂端的時空裂口再度暴走，狂暴的能量將你們吸往時間軸的最深處……！`,
    choices: [
      {
        text: '穿越裂縫，前往【原始時代 (B.C. 65,000,000)】！',
        consequenceText: '灼熱的火山灰撲面而來，大地劇烈轟鳴！歡迎來到白堊紀巨獸稱霸的原始洪荒！',
        teleportEra: 'BC_65M',
        nextStepId: 'arrive_bc_65m',
      },
      {
        text: '穿越裂縫，前往【機械廢土 (A.D. 2300)】！',
        consequenceText: '冷冽刺骨的酸雨滴在破碎的生化穹頂上，你們看到了人類文明毀滅後的悽涼餘燼……',
        teleportEra: 'AD_2300',
        nextStepId: 'arrive_ad_2300',
      },
    ],
  },

  spirit_saved: {
    id: 'spirit_saved',
    era: 'AD_600',
    speaker: '迷霧修道院森林妖精',
    title: '蝴蝶漣漪：生機之契',
    dialogue: `「善良的旅行者……我們將守護這片土地直到一千年後。當你們回到千禧年時，我們的族人必將獻上祝福……」\n\n【因果蝴蝶效應觸發】全體連攜合體技傷害永久提升 30%！`,
    choices: [
      {
        text: '回頭討伐教堂妖僧，救出被困少女。',
        consequenceText: '懷抱森林祝福的你們力量大增，挺進教堂核心！',
        startBattleEnemyId: 'yakra_boss',
        nextStepId: 'cathedral_cleared',
      },
    ],
  },

  arrive_bc_65m: {
    id: 'arrive_bc_65m',
    era: 'BC_65M',
    speaker: '艾拉 (原始女戰士)',
    title: '第二章：蠻荒大地的火種',
    dialogue: `「你們，奇怪衣服！但是……眼神很強！艾拉喜歡強者！」艾拉扛著巨大骨棒大笑。\n\n「火山在發怒，天上有紅色的星星落下來！暴龍王在火山口發狂了！如果不及時處理，所有生靈都會化為焦土！」`,
    isCustomActionAllowed: true,
    choices: [
      {
        text: '在創世火山口肥沃的黑土中，種下【世界樹之種】！',
        consequenceText: '你在高熱的火山口邊緣挖開土壤，將神木種子埋下。種子在地下生根，時空雷達顯示：西元 2300 年的未來廢土正綻放出浩瀚的翡翠色綠意！',
        butterflyKey: 'seed_planted',
        nextStepId: 'arrive_bc_65m_planted',
      },
      {
        text: '挑戰火山口的【原始古代霸王暴龍】！',
        consequenceText: '暴龍發出震天咆哮，熾熱的熔岩口水滴落在岩石上，戰鬥一觸即發！',
        startBattleEnemyId: 'tyrano_boss',
        nextStepId: 'tyrano_defeated',
      },
      {
        text: '前往時空之門，轉移至【未來機械廢土 (A.D. 2300)】檢驗因果變化。',
        consequenceText: '時空之門光芒一閃，你們踏入了千年後的命運十字路口。',
        teleportEra: 'AD_2300',
        nextStepId: 'arrive_ad_2300',
      },
    ],
  },

  arrive_bc_65m_planted: {
    id: 'arrive_bc_65m_planted',
    era: 'BC_65M',
    speaker: '時空羅盤通訊 (露卡)',
    title: '因果改寫完成',
    dialogue: `「天哪！克羅斯！快看儀表數據！西元 2300 年的未來廢土坐標正在被實時覆寫！原本寸草不生的酸雨荒漠，現在居然出現了覆蓋半個大陸的森林綠洲！這就是蝴蝶效應的奇蹟！」`,
    choices: [
      {
        text: '討伐原始暴龍，確保部族存續與龍騎士血統。',
        consequenceText: '艾拉高呼：「夥伴們，上！讓暴龍見識人類與時空行者的勇氣！」',
        startBattleEnemyId: 'tyrano_boss',
        nextStepId: 'tyrano_defeated',
      },
      {
        text: '前往【未來機械廢土 (A.D. 2300)】親眼見證綠洲與神兵！',
        consequenceText: '時空扭曲發動，躍遷至西元 2300 年！',
        teleportEra: 'AD_2300',
        nextStepId: 'arrive_ad_2300',
      },
    ],
  },

  tyrano_defeated: {
    id: 'tyrano_defeated',
    era: 'BC_65M',
    speaker: '艾拉 (原始女戰士)',
    title: '原始霸主的降服',
    dialogue: `「好厲害！暴龍低頭了！艾拉教部族跟恐龍做朋友，以後我們就是恐龍的主人了！這個古老紅寶石，送給你們！」\n\n【因果蝴蝶效應觸發】中世紀誕生了傳奇龍騎士衛隊，全體暴擊率增加 15%！`,
    choices: [
      {
        text: '前往【未來機械廢土 (A.D. 2300)】',
        consequenceText: '你們向艾拉揮手告別，踏入了通往未來的光柱之中！',
        teleportEra: 'AD_2300',
        nextStepId: 'arrive_ad_2300',
      },
    ],
  },

  arrive_ad_2300: {
    id: 'arrive_ad_2300',
    era: 'AD_2300',
    speaker: '西元 2300 年 ‧ 命運交匯處',
    title: '第三章：廢墟與綠洲',
    dialogue: `這裡原本是人類文明在終焉降臨後的荒涼墳墓。如果你曾在原始時代種下種子，現在眼前將是一片遮天蔽日的生機神木，清泉流淌在生化穹頂之下！\n\n然而，廢棄工廠裡仍有機械失控的咆哮，沉睡的機器人 R-66Y 與超導地熱反應堆等待著你們的探索。`,
    isCustomActionAllowed: true,
    choices: [
      {
        text: '探索綠洲神木的核心，拔出沉睡千萬年的神兵【因果折光】！',
        consequenceText: '世界樹的枝幹輕柔地將一柄散發彩虹耀斑的太刀呈現在克羅斯面前！【獲得因果折光 ‧ 聖劍，全體 HP 上限大幅增加！】',
        butterflyKey: 'seed_planted',
        rewardItem: 'potion',
        nextStepId: 'eden_explored',
      },
      {
        text: '修復工廠深處的超導地熱反應爐。',
        consequenceText: '伴隨一陣清脆的蜂鳴，龐大的純淨能量流注入大地，並順著時空奇點逆流至【時之夾縫】！全體戰鬥中每回合自動回復 MP！',
        butterflyKey: 'repair_generator',
        nextStepId: 'generator_fixed',
      },
      {
        text: '直面工廠失控的防禦核心機器人！',
        consequenceText: '沉睡的警報驟然尖叫，巨大的重裝機械守衛核心啟動了！',
        startBattleEnemyId: 'guardian_core_boss',
        nextStepId: 'robo_joined',
      },
    ],
  },

  eden_explored: {
    id: 'eden_explored',
    era: 'AD_2300',
    speaker: '未來倖存者領袖',
    title: '希望的種子',
    dialogue: `「感謝你們……這座在神木庇護下的綠洲是我們唯一能活下去的家園。傳說古代有英雄播下種子，原來傳說中的英雄正是你們！」`,
    choices: [
      {
        text: '啟程前往【時之夾縫 (∞)】，迎戰一切災難的源頭！',
        consequenceText: '帶著所有時代的信念與希望，時空之門在腳下展開，將隊伍送入時間的盡頭……',
        teleportEra: 'END_OF_TIME',
        nextStepId: 'arrive_end_of_time',
      },
    ],
  },

  generator_fixed: {
    id: 'generator_fixed',
    era: 'AD_2300',
    speaker: '露卡 (魔導技師)',
    title: '能源逆流成功',
    dialogue: `「地熱逆向超導中樞運轉正常！這些能量正為時之夾縫的水桶陣注入永久超空間動力，我們在戰鬥中再也不用擔心魔力匱乏了！」`,
    choices: [
      {
        text: '啟程前往【時之夾縫 (∞)】',
        consequenceText: '次元裂縫撕開，無垠的星海在你們眼前展開！',
        teleportEra: 'END_OF_TIME',
        nextStepId: 'arrive_end_of_time',
      },
    ],
  },

  robo_joined: {
    id: 'robo_joined',
    era: 'AD_2300',
    speaker: '羅波 (Robo R-66Y)',
    title: '新的鋼鐵誓約',
    dialogue: `「偵測到友善生物……記憶庫重載完畢。我的編號是 R-66Y。感謝你們修復了我，我願作為你們的盾牌與重拳，共同為了地球的未來而戰！」`,
    choices: [
      {
        text: '前往【時之夾縫 (∞)】，直面終焉！',
        consequenceText: '隊伍全員整裝待發，躍入時之夾縫的永恆維度！',
        teleportEra: 'END_OF_TIME',
        nextStepId: 'arrive_end_of_time',
      },
    ],
  },

  arrive_end_of_time: {
    id: 'arrive_end_of_time',
    era: 'END_OF_TIME',
    speaker: '時之夾縫 ‧ 永恆街燈下的老人',
    title: '終章：時間盡頭的決斷',
    dialogue: `「喔吼吼……你們終於來到這個所有時間被洗刷乾淨的地方。看那邊那口漆黑的水桶……深處寄宿著在各個時代吸食行星生命的巨獸【奧米加核心】。\n\n你們過去所做的每一次因果抉擇，都將化為斬裂命運的利刃。去吧，孩子們，改寫這個星球悲劇的命運！」`,
    isCustomActionAllowed: true,
    choices: [
      {
        text: '【全軍突擊】跳入終焉水桶，迎戰終焉奧米加核心！',
        consequenceText: '時空在瞬間坍縮！狂暴的星屑與宇宙黑洞中，巨大的終焉寄生巨獸睜開了億萬隻赤紅的眼瞳！最後的決戰爆發！',
        startBattleEnemyId: 'omega_core',
        nextStepId: 'omega_victory',
      },
      {
        text: '在永恆路燈旁休整，完全回復隊伍的 HP 與 MP。',
        consequenceText: '溫暖的燈光拂過每位夥伴的心靈，體力與魔力完全回滿，狀態調整至巔峰！',
        rewardItem: 'potion',
        nextStepId: 'arrive_end_of_time',
      },
      {
        text: '返回各時代，完成尚未閉環的蝴蝶效應事件。',
        consequenceText: '利用水桶陣，你可以自由返回任何一個時代補全遺憾！',
        teleportEra: 'AD_1000',
        nextStepId: 'prologue',
      },
    ],
  },

  omega_victory: {
    id: 'omega_victory',
    era: 'END_OF_TIME',
    speaker: '時空的因果鐘聲',
    title: '尾聲：因果的誓約',
    dialogue: `伴隨著刺眼欲盲的聖光，奧米加核心化為漫天璀璨的星塵，被永久驅逐出歷史長河！\n\n破碎的時鐘指針重新開始轉動，五大時代的因果線在此刻編織成最美麗的彩虹。加爾迪亞千禧年的大鐘悠揚敲響，你們拯救了過去、現在與未來的所有生靈！`,
    choices: [
      {
        text: '見證歷史結局與榮譽畫卷',
        consequenceText: '時空的旅者們，你們的名字將銘刻在因果迴廊的永恆星宿之上！',
        nextStepId: 'arrive_end_of_time',
      },
    ],
  },
};
