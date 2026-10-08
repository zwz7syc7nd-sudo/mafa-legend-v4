/* R13: a finite, source-scoped Lineage M knight reference catalog.
 * Names/categories reference NC's historic guide, not a complete/current Taiwan database.
 * ALL numbers, rarity buckets, item effects, learning rules and prices below are local game balance.
 * UI illustrations are original procedural SVGs. No hero or monster art is modified here.
 */
(function (root) {
  'use strict';
  const sourceScope = '本作經典 M 核心 17 位的有限裝備範圍，採《天堂M》代表性騎士項目；名稱／類別參照 NC 歷史官方指南，中文為常用譯名，非現行台服完整圖鑑。';
  const balanceScope = '本作 17 核心裝備位全部開放是本作設定；不套用 PC 版解鎖等級，也不宣稱涵蓋現行 M 全部欄位。所有攻防、品質分級、HP／MP、命中、暴擊、吸血、傷害、速度、時間、價格、學習／強化與掉落設定皆為本作自訂平衡；不宣稱官方數值或公式。';
  const artScope = '本作原創 SVG 道具介面圖示，非官方道具圖片；英雄與怪物圖像維持原樣。';
  const sources = [
    { id:'specialAccessories', title:'NC 天堂M 倫提斯與史奈普道具公告', url:'https://lounge.plaync.com/feed/16209', sourceScope:'官方確認藍光／黑光倫提斯耳環與英雄／防禦史奈普戒指存在；繁中名稱與功能方向由 2019 次級 M 資料交叉核對，數值為本作自訂。', crossChecks:[{url:'https://www.lineagem.com.tw/info/buy-earrings-and-rings',scope:'次級 M 繁中名稱與藍耳補血、黑耳近戰、英雄戒 HP／近戰、防禦戒 AC／MR 方向'}] },
    { id:'ogreBelt', title:'NC 天堂M 歷史野外狩獵指南', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/begin_levelup_levelup_filed.html', sourceScope:'龍谷區域熱門掉落表中的歐吉皮帶存在性，非逐怪掉率；本作皮帶 HP 加成是自訂換算。' },
    { id:'deathKnightSword', title:'NC 天堂M 2025 死亡騎士更新公告', url:'https://about.ncsoft.com/news/article/lineagem-update-250319', sourceScope:'官方確認死亡騎士火劍存在；繁中名稱與騎士可用單手劍分類採次級歷史資料交叉核對，非現行台服完整裝備規格。', crossChecks:[{url:'https://www.lineagem.com.tw/news/twinfo/tw-0122-update',scope:'次級台服 M 報導中的繁中名稱'},{url:'https://mineagem.pixnet.net/blog/posts/15064442295',scope:'次級 M 歷史裝備表中的單手劍分類與騎士可用性'}] },
    { id:'jewelry', title:'NC Lineage M 歷史首領獎勵指南', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/begin_levelup_levelup_boss.html', sourceScope:'變形怪首領左右戒指、項鍊及發光的古老項鍊之歷史存在性。此頁不證明職業限制或目前台服譯名；本作採常用／直譯中文，騎士可用與數值為本作設定。' },
    { id:'weapon', title:'NC Lineage M 歷史武器製作指南', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_item_make_weapon.html', sourceScope:'歷史武器存在性及分類；中文採常用譯名；非 2026 台服數值。' },
    { id:'armor', title:'NC Lineage M 歷史防具圖鑑', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_item_item_shield.html', sourceScope:'歷史防具名稱、部位與騎士可用性；盾牌僅配單手武器。官方網頁搜尋索引可讀，直接讀取可能逾時。', crossChecks:[{url:'https://www.lineagem.com.tw/info/shields-ability',scope:'次級 M 歷史繁中防具表，用於力量T恤、魔法防禦褲子與體力臂甲等名稱核對'}] },
    { id:'knight', title:'NC Lineage M 歷史騎士指南', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_class_knight.html', sourceScope:'五項基本騎士技術的身份／功能方向；衝擊之暈與反擊屏障限雙手劍。非目前台服技能數值。' },
    { id:'consumable', title:'NC Lineage M 歷史一般道具指南', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_item_item_general.html', sourceScope:'治癒、綠水、勇水、回村與隨機瞬移的用途；本作持續時間與倍率另外設定。' },
    { id:'enchant', title:'NC Lineage M 歷史強化系統', url:'https://rc-wstatic.plaync.co.kr/lineagem/guidebook/game_item_enchant.html', sourceScope:'武器魔法卷軸與防具魔法卷軸的用途。官方存在失敗／消失風險；本作採自訂百分之百成功、上限 +15。' }
  ];
  const SLOT_NAMES = Object.freeze({weapon:'武器',armor:'盔甲',helmet:'頭盔',cloak:'斗篷',gloves:'手套',boots:'長靴',shield:'盾牌',ring:'戒指',charm:'項鍊',shirt:'T恤',greaves:'褲子',guard:'臂甲',belt:'腰帶',earring:'耳環',snapperRing:'史奈普戒指'});
  const makeGear = (catalogId, name, slot, quality, values, description, iconVariant, iconColor, sourceNameKo, sourceId='armor') => ({
    catalogId,name,slot,quality,atk:0,def:0,crit:0,leech:0,hp:0,mp:0,hit:0,undeadBonus:0,twoHanded:false,
    ac:values.ac ?? -(values.def||0),dr:0,mr:0,str:0,dex:0,int:0,wis:0,con:0,meleeDamage:0,rangedDamage:0,rangedHit:0,spellPower:0,magicHit:0,er:0,potionHealBonus:0,
    ...values,description,iconVariant,iconColor,sourceNameKo,sourceId,sourceScope:sourceScope+' '+balanceScope
  });
  const gear = [
    makeGear('great-sword','巨劍','weapon','common',{atk:28,twoHanded:true},'基礎雙手劍，可施放衝擊之暈與反擊屏障；不能同時持盾。','straight','#b7cad2','대검','weapon'),
    makeGear('officer-greatsword','武官雙手劍','weapon','rare',{atk:42,hit:3,twoHanded:true},'武官系列雙手劍；本作提高近戰命中。','officer','#b4bac5','무관의 양손검','weapon'),
    makeGear('destruction-greatsword','毀滅巨劍','weapon','epic',{atk:56,leech:3,twoHanded:true},'沉重雙手劍；本作以吸血提供持續作戰能力。','ruin','#c28575','파멸의 대검','weapon'),
    makeGear('thebes-greatsword','底比斯歐西里斯雙手劍','weapon','epic',{atk:62,mp:15,hit:4,twoHanded:true},'底比斯主題雙手劍；本作兼具命中與魔力上限。','thebes','#cbaa6f','테베 오시리스의 양손검','weapon'),
    makeGear('demon-king-greatsword','惡魔王雙手劍','weapon','legendary',{atk:78,crit:5,twoHanded:true},'高階雙手劍；本作提供強力斬擊與暴擊加成。','demon','#be6863','악마왕의 양손검','weapon'),
    makeGear('thunder-sword','雷雨之劍','weapon','rare',{atk:36,hit:5},'單手劍，可搭配盾牌；不相容於雙手劍限定技術。','thunder','#81cceb','뇌신검','weapon'),
    makeGear('crystal-dagger','水晶短劍','weapon','rare',{atk:30,crit:4,undeadBonus:15},'單手短劍，可配盾；本作另設對不死系的額外傷害。','crystal','#a4e6ee','수정 단검','weapon'),
    makeGear('steel-plate','鋼鐵金屬盔甲','armor','common',{def:12,hp:20},'鋼鐵系列重甲；提供基礎防禦與生命上限。','plate','#8399a7','강철 판금 갑옷'),
    makeGear('officer-armor','武官護鎧','armor','rare',{def:19,hp:55},'武官系列胸甲；本作偏向生命與穩定防護。','officer','#779bac','무관의 갑옷'),
    makeGear('baphomet-armor','巴風特盔甲','armor','epic',{def:28,hp:90,dr:2},'騎士代表重甲；本作 AC -28、傷害減免 DR +2、生命上限 +90。數值為本作平衡。','baphomet','#916d86','바포메트의 갑옷'),
    makeGear('magic-defense-helmet','魔法防禦頭盔','helmet','common',{def:3,mp:8,mr:10},'騎士可用頭盔；本作 AC -3、MR +10、MP +8，數值為本作平衡。','magic','#7893b8','마법 방어 투구'),
    makeGear('officer-helmet','武官頭盔','helmet','rare',{def:5,hp:25},'武官系列頭盔；本作增加生命上限與防禦。','officer','#a3acbb','무관의 투구'),
    makeGear('officer-cloak','武官斗篷','cloak','rare',{def:4,hp:30},'武官系列斗篷，配置於獨立斗篷欄。','officer','#647fa0','무관의 망토'),
    makeGear('silver-cloak','銀光斗篷','cloak','epic',{def:5,hp:35,mp:12,mr:15},'銀色斗篷；本作 AC -5、MR +15，並增加生命與魔力上限。','silver','#acbfd2','은색의 망토'),
    makeGear('steel-gloves','鋼鐵手套','gloves','common',{def:3,hit:2},'鋼鐵系列手部防具；本作另給少量近戰命中。','steel','#a4afb8','강철 장갑'),
    makeGear('steel-boots','鋼鐵長靴','boots','common',{def:4,hp:15},'鋼鐵系列足部防具，配置於獨立長靴欄。','steel','#91a4b2','강철 부츠'),
    makeGear('steel-shield','鋼鐵盾牌','shield','common',{def:7},'僅配單手武器。穿戴雙手劍時，盾牌必須卸回背包。','steel','#879daf','강철 방패'),
    makeGear('silver-knight-shield','銀騎士之盾','shield','rare',{def:9,mp:8},'單手武器的防護搭配；本作以防禦與魔力上限呈現。','magic','#93bfd2','은기사의 방패'),
    makeGear('strength-shirt','力量T恤','shirt','rare',{def:1,str:1,meleeDamage:1},'獨立 T恤欄；力量與近戰傷害型內襯。本作 AC -1、STR +1、近戰傷害 +1。','strength','#b4bfc2','완력의 티셔츠'),
    makeGear('magic-defense-greaves','魔法防禦褲子','greaves','rare',{def:4,mr:2},'獨立褲子欄；本作 AC -4、MR +2。繁中名稱以 M 歷史次級資料交叉核對。','magic','#8cacc1','마법 방어 각반'),
    makeGear('health-guard','體力臂甲','guard','rare',{hp:50},'與盾牌共用副手欄；可配雙手劍。本作生命上限 +50，不提供盾牌的格擋含義。','health','#81b79e','체력의 가더'),
    makeGear('ogre-belt','歐吉皮帶','belt','rare',{hp:40},'歷史 M 代表腰帶。本作未建立負重系統，改以生命上限 +40 呈現，是本作換算。','ogre','#a67d50','오우거의 벨트','ogreBelt'),
    makeGear('roomtis-blue-earring','倫提斯的藍光耳環','earring','rare',{hp:20,potionHealBonus:.10},'恢復型耳環；本作治癒藥水回復量 +10%、生命上限 +20。倍率為本作平衡。','blue','#70bdea','룸티스의 푸른빛 귀걸이','specialAccessories'),
    makeGear('roomtis-black-earring','倫提斯的黑光耳環','earring','rare',{ac:-1,meleeDamage:1},'近戰型耳環；本作 AC -1、近戰傷害 +1。','black','#b49bbf','룸티스의 검은빛 귀걸이','specialAccessories'),
    makeGear('snapper-hero-ring','史奈普的英雄戒指','snapperRing','rare',{hp:35,meleeDamage:1},'史奈普專用戒指欄；本作生命上限 +35、近戰傷害 +1。','hero','#d2856b','스냅퍼의 용사 반지','specialAccessories'),
    makeGear('snapper-defense-ring','史奈普的防禦戒指','snapperRing','rare',{ac:-2,mr:10},'史奈普專用戒指欄；本作 AC -2、MR +10。','defense','#8ab5d0','스냅퍼의 방어 반지','specialAccessories'),
    makeGear('death-knight-flame-sword','死亡騎士的烈炎之劍','weapon','legendary',{atk:70,hit:4,twoHanded:false},'獨立單手劍，可配盾；不屬於死亡騎士四件防具套裝，也不適用衝擊之暈與反擊屏障。火焰僅為道具圖示造型，傷害依本作攻擊數值。','flame','#e78643','데스나이트의 불검','deathKnightSword'),
    makeGear('death-knight-helmet','死亡騎士頭盔','helmet','epic',{def:7,hp:20,setId:'death-knight',setPiece:'death-knight-helmet'},'死亡騎士四件套之一；本作提供防禦與生命上限，集齊四件追加套裝加成。','death-knight','#a58a54','데스나이트의 투구'),
    makeGear('death-knight-armor','死亡騎士盔甲','armor','epic',{def:28,hp:100,setId:'death-knight',setPiece:'death-knight-armor'},'死亡騎士四件套之一；本作為重型胸甲，集齊四件追加套裝加成。','death-knight','#a58a54','데스나이트의 갑옷'),
    makeGear('death-knight-gloves','死亡騎士手套','gloves','epic',{def:7,hp:20,setId:'death-knight',setPiece:'death-knight-gloves'},'死亡騎士四件套之一；裝備於手套欄，集齊四件追加套裝加成。','death-knight','#a58a54','데스나이트의 장갑'),
    makeGear('death-knight-boots','死亡騎士長靴','boots','epic',{def:8,hp:40,setId:'death-knight',setPiece:'death-knight-boots'},'死亡騎士四件套之一；裝備於長靴欄，集齊四件追加套裝加成。','death-knight','#a58a54','데스나이트의 부츠'),
    makeGear('doppelganger-left-ring','變形怪首領之戒（左）','ring','rare',{atk:4,crit:2},'歷史首領表代表飾品；本作提高攻擊與暴擊。名稱中的左右不另增裝備欄。','gem','#d57764','도펠겡어 보스의 왼쪽 반지','jewelry'),
    makeGear('doppelganger-right-ring','變形怪首領之戒（右）','ring','epic',{atk:6,hit:3},'歷史首領表代表飾品；本作提高攻擊與命中。名稱中的左右不另增裝備欄。','signet','#a6b6d9','도펠겡어 보스의 오른쪽 반지','jewelry'),
    makeGear('doppelganger-amulet','變形怪首領項鍊','charm','rare',{hp:45,mp:12},'歷史首領表代表項鍊；本作增加生命及魔力上限。','skull','#d4c4a0','도펠겡어 보스의 목걸이','jewelry'),
    makeGear('ancient-shining-amulet','發光的古老項鍊','charm','epic',{def:1,hp:80,mp:20},'歷史首領表代表項鍊；本作以生命、魔力上限及防禦呈現。','gem','#91d8d2','빛나는 고대 목걸이','jewelry'),
  ];
  for(const item of gear) if(item.sourceId==='jewelry') item.sourceScope='NC《天堂M》歷史首領表證明此飾品存在；原版職業限制與現行台服繁中譯名尚未核實。本作允許騎士裝備，中文採常用／直譯名稱。 '+balanceScope;
  gear.find(item=>item.catalogId==='death-knight-flame-sword').sourceScope='NC《天堂M》2025 官方公告確認武器存在；繁中名稱及單手／騎士分類由次級 M 歷史資料交叉核對，非官方現行台服完整規格。 '+balanceScope;
  const sets = {
    'death-knight':{
      name:'死亡騎士套裝',
      pieces:['death-knight-helmet','death-knight-armor','death-knight-gloves','death-knight-boots'],
      bonus:{ac:-10,meleeDamage:2,str:2},
      description:'四件齊備：AC -10、近距離傷害 +2、STR +2，沿用歷史 M 四件套的屬性方向與數字；AC、STR 的實際戰鬥換算由本作公式處理。武器不屬於此四件套。',
      sourceId:'armor',
      sourceScope:'NC《天堂M》歷史官方防具指南列出的四件套與歷史套裝效果。四件單品數值、品質與 AC／STR 戰鬥公式皆為本作自訂平衡；不宣稱現行台服數值。'
    }
  };
  const skills = {
    basic:{name:'過頂下劈',short:'普攻',mp:0,cd:.52,duration:.5,hitAt:.19,range:3.6,mul:1,shape:'overhead',color:'#ffe09b',requiresTwoHanded:false,unlock:true,desc:'普通揮砍：舉刀、下劈、收回；落刀只判定一次。'},
    shock:{name:'衝擊之暈',short:'衝暈',mp:10,cd:6,duration:.7,hitAt:.28,range:3.6,mul:1.5,shape:'single',color:'#ffcf70',requiresTwoHanded:true,unlock:true,stun:2,desc:'雙手劍限定，近距離擊中單一目標並暈眩 2 秒；冷卻 6 秒。'},
    reduction:{name:'增幅防禦',short:'增防',mp:15,cd:30,duration:.4,hitAt:.16,range:0,mul:0,shape:'buff',color:'#93c4eb',requiresTwoHanded:false,unlock:true,buffDuration:30,damageReduction:5,desc:'施放後 30 秒傷害減免 DR +5；受到攻擊時按本作公式固定扣減傷害。'},
    bounce:{name:'尖刺盔甲',short:'尖刺',mp:10,cd:30,duration:.4,hitAt:.16,range:0,mul:0,shape:'buff',color:'#e8bf6e',requiresTwoHanded:false,unlock:false,buffDuration:30,meleeHit:12,desc:'學習後可施放，30 秒近距離命中 +12；不造成範圍傷害。'},
    solid:{name:'堅固防護',short:'堅防',mp:12,cd:30,duration:.4,hitAt:.16,range:0,mul:0,shape:'buff',color:'#98d0c7',requiresTwoHanded:false,unlock:false,buffDuration:30,rangedEvasion:15,desc:'學習後可施放，30 秒遠距離物理攻擊迴避 ER +15（箭矢）；魔法由 MR 處理。'},
    counter:{name:'反擊屏障',short:'反屏',mp:20,cd:30,duration:.4,hitAt:.16,range:0,mul:0,shape:'buff',color:'#bfabeb',requiresTwoHanded:true,unlock:false,buffDuration:30,counterChance:.35,counterMul:1.5,desc:'雙手劍限定，施放後 30 秒有 35% 機率閃避近戰並以 1.5 倍攻擊反擊。'}
  };
  for(const [id,skill] of Object.entries(skills)) {
    skill.sourceId=id==='basic'?null:'knight';
    skill.sourceScope=(id==='basic'?'本作普通攻擊。':sourceScope+' 技術功能方向參照歷史騎士指南。')+' '+balanceScope;
  }
  const consumables = {
    red:{name:'治癒藥水',description:'恢復最大生命的 35%；冷卻 3 秒。數值為本作平衡。',price:35,color:'#cf4b49',kind:'potion'},
    green:{name:'綠色藥水',description:'300 秒內移速 ×1.20、攻速 ×1.25；重喝刷新時間，不疊加同種效果。本作倍率。',price:90,color:'#6daf59',kind:'haste'},
    recall:{name:'回村卷軸',description:'返回安全起點，獲得 3 秒保護；消耗一張。本作回城地點。',price:70,color:'#549db8',kind:'recall'},
    enhance:{name:'對武器施法的卷軸',description:'所選武器強化 +1；100% 成功，上限 +15，不收金幣。成功率及上限為本作自訂。',price:250,color:'#b87a34',kind:'weaponEnchant'},
    armorEnchant:{name:'對盔甲施法的卷軸',description:'所選防具強化 +1；不適用武器與飾品。100% 成功，上限 +15。本作自訂強化。',price:200,color:'#648bad',kind:'armorEnchant'},
    brave:{name:'勇敢藥水',description:'騎士第二段加速：300 秒攻速再 ×1.20，可與綠水並用；不提高移速。重喝刷新。本作倍率。',price:120,color:'#da9c45',kind:'brave'},
    teleport:{name:'瞬間移動卷軸',description:'傳送至可站立的隨機位置；消耗一張。本作地圖內瞬移，不是戰鬥技能。',price:55,color:'#8d79b8',kind:'teleport'}
  };
  for(const key of ['shock','reduction','bounce','solid','counter']) {
    const skill=skills[key];
    consumables['skill:'+key]={name:'技術書（'+skill.name+'）',description:'學習或提升'+skill.name+'一級，上限 5 級；學會後須另行施放。'+(skill.requiresTwoHanded?'施放須持雙手劍。':'')+'本作學習規則。',price:key==='counter'?900:key==='shock'?280:220,color:skill.color,skill:key,kind:'skillBook'};
  }
  for(const [id,item] of Object.entries(consumables)) {
    item.sourceId=id.startsWith('skill:')?'knight':['enhance','armorEnchant'].includes(id)?'enchant':'consumable';
    item.sourceScope=sourceScope+' '+balanceScope;
  }

  const byId=Object.fromEntries(gear.map(item=>[item.catalogId,item]));
  // Original vector UI illustrations. These are not extracted NC/beanfun artwork.
  const palette = {
    common: ['#87969e', '#dce8ed'], rare: ['#398ab5', '#bceafa'],
    epic: ['#8559b0', '#e6cdff'], legendary: ['#b67b25', '#ffe3a0']
  };
  const escapeXML = value => String(value).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
  const emblem = (key, color = '#f9e7b4') => {
    const common = `fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"`;
    const glyphs = {
      basic: '<path d="M48 22v47m-11-9 11 11 11-11M36 31l12-13 12 13"/>',
      shock: '<path d="m52 19-18 29h14l-6 29 23-35H51l9-23Z" fill="currentColor"/><path d="m26 33-8-5m50 1 9-5M27 63l-10 7m52-4 9 6"/>',
      reduction: '<path d="m48 21 23 10v18c0 14-14 24-23 29-9-5-23-15-23-29V31Z"/><path d="M36 46h24M48 34v24"/>',
      bounce: '<circle cx="48" cy="48" r="21"/><circle cx="48" cy="48" r="10"/><path d="M48 18v13m0 34v13M18 48h13m34 0h13m-29-30 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z"/>',
      solid: '<path d="M48 26c-18 0-26 10-32 22 6 12 14 22 32 22m9-42 20 20-20 20M76 48H40m5-21-9 42"/><path d="m63 18 12-3-2 12m-10 49 12 3-2-12"/>',
      counter: '<path d="m24 22 40 42m-8-4 13 13m-14-2 15-14M72 22 32 64m8-4L27 73m14-2L26 57"/><path d="M28 32a27 27 0 0 1 40 5m-1-15 4 16-16-3M67 65a27 27 0 0 1-39-6m1 15-4-16 16 3"/>',
      red: '<path d="M44 31h8v13h13v8H52v13h-8V52H31v-8h13Z" fill="currentColor" stroke="none"/>',
      green: '<path d="m41 24-8 21h13l-9 24 26-32H50l8-13Z" fill="currentColor" stroke="none"/>',
      brave: '<path d="m48 22 8 13 15-1-5 15 5 14-15-1-8 13-8-13-15 1 5-14-5-15 15 1Z"/><path d="m42 49 5 6 10-14"/>',
      recall: '<path d="m25 44 23-20 23 20M32 39v29h32V39M43 68V51h10v17"/><path d="M22 54a25 25 0 0 0 44 17m-1-9 3 10-11 2"/>',
      teleport: '<ellipse cx="48" cy="49" rx="18" ry="27"/><ellipse cx="48" cy="49" rx="9" ry="20"/><path d="m19 20 2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm59 42 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/>',
      enhance: '<path d="m63 22-9 26-19 17-6-6 17-19Zm-32 27 16 16M24 65l7 7M68 57v18m-9-9h18"/>',
      armorEnchant: '<path d="m35 26-14 8 7 19 6-3-1 19h32l-1-19 6 3 7-19-14-8-7 10H42Z"/><path d="M48 43v17m-8-8h16"/>'
    };
    return `<g ${common} style="color:${color}">${glyphs[key] || glyphs.reduction}</g>`;
  };
  function weaponArt(item) {
    const color=item.iconColor || '#a3bfd0', two=item.twoHanded, variant=item.iconVariant || 'straight';
    const blade = variant === 'crystal'
      ? '<path d="m49 10 9 19-8 29h-6l-5-29Z" fill="url(#steel)"/><path d="m49 10 1 48-7-3-4-26Z" fill="#a9f2ff" opacity=".9"/>'
      : variant === 'flame'
      ? '<path d="m39 20-9 15 8 1-10 15 11-5-5 15 17-11 11-29-9 10 2-16-9 10 1-19Z" fill="#c45e26" stroke="#f8b347" stroke-width="1.3"/><path d="m48 11 6 14-3 34h-8l-1-34Z" fill="url(#steel)"/><path d="M48 17v40" stroke="#f6cc69" stroke-width="2"/>'
      : variant === 'officer'
      ? '<path d="m48 5 9 15-3 43H42l-3-43Z" fill="url(#steel)"/><path d="M48 17v38m-5-29 5 4 5-4m-10 10 5 4 5-4" stroke="#c2a466" stroke-width="2" fill="none"/>'
      : variant === 'ruin'
      ? '<path d="m47 5 11 16-2 10 5 4-8 25-12-1-6-24 6-4-3-10Z" fill="url(#steel)"/><path d="m49 17-6 14 8 5-8 17" stroke="#e5654b" stroke-width="2" fill="none"/>'
      : variant === 'thebes'
      ? '<path d="m48 5 9 11v23l6 6-6 16H39l-6-16 6-6V16Z" fill="url(#steel)"/><path d="M44 18v27m8-27v27M40 48h16" fill="none" stroke="#d5a64e" stroke-width="2"/>'
      : variant === 'demon'
      ? '<path d="m47 3 12 21-4 4 8 6-7 5 6 5-11 20-12-6-5-14 6-5-6-7 6-4-2-9Z" fill="url(#steel)"/><path d="M47 18v40" stroke="#ec7564" stroke-width="3"/>'
      : `<path d="m48 ${two?5:13} ${two?9:6} 15-3 ${two?43:35}H42l-${two?3:0}-${two?43:35}Z" fill="url(#steel)"/><path d="M48 ${two?10:18}v43" stroke="#effbff" opacity=".7" stroke-width="1.3"/>`;
    const guards=variant==='demon'
      ? '<path d="m28 53 7 9 13 3 13-3 8-9-3 15-18 3-18-3Z" fill="url(#gold)" stroke="#f4ca83"/>'
      : variant==='thunder'
      ? '<path d="m24 62 12-8 9 6h6l9-6 12 8-11-2-10 7h-6l-10-7Z" fill="url(#gold)"/><path d="m60 12-6 15 9-2-10 21 5-17-9 3 6-20" fill="#9adeff" stroke="#c9f4ff" stroke-width="1"/>'
      : '<path d="m27 62 6-6 12 4h6l12-4 6 6-18 6h-6Z" fill="url(#gold)" stroke="#f4ca83" stroke-width="1"/>';
    return `<g transform="rotate(32 48 48)" stroke="#17232d" stroke-width="1.6" stroke-linejoin="round"><path d="M44 61h8v${two?21:16}h-8Z" fill="#432a28"/><path d="M44 68h8m-8 5h8m-8 5h8" stroke="#cfaa68" stroke-width="1.6"/>${blade}${guards}<path d="m43 ${two?84:79} 5-3 5 3-1 6h-8Z" fill="url(#gold)"/><circle cx="48" cy="63" r="3" fill="${color}" stroke="#fff2c5"/></g>`;
  }
  function deathKnightArt(slot) {
    const skull='<path d="M39 46c0-14 18-14 18 0l-4 5v7H43v-7Z" fill="#cbb77f" stroke="#312b24"/><path d="m41 43 5 1-2 5-4-2m15-4-5 1 2 5 4-2M46 51h4m-5 3v4m5-4v4" fill="#382a22" stroke="#382a22" stroke-width="1.5"/>';
    const parts={
      helmet:'<path d="m28 37-11-5-5-18 17 15m39 8 11-5 5-18-17 15" fill="#907345" stroke="#d6b66f" stroke-width="2"/><path d="M25 49c0-26 10-35 23-35s23 9 23 35l5 25-14 8-14-10-14 10-14-8Z" fill="url(#dkMetal)"/><path d="m48 14 7 29-7 31-7-31Z" fill="#9c844e"/><path d="m27 42 18 6-5 7-13-3m42-10-18 6 5 7 13-3" fill="#d87d38" stroke="#f4c881"/><path d="m28 60 12-5 8 17 8-17 12 5-5 21-9-5-6 10-6-10-9 5Z" fill="#273039"/><path d="m33 68 5 7m25-7-5 7M45 67v10m6-10v10" stroke="#c5a86a" stroke-width="2"/>',
      armor:'<path d="m30 21-17 3-6 17 21 7 2 27 18 12 18-12 2-27 21-7-6-17-17-3-9 9H39Z" fill="url(#dkMetal)"/><path d="m12 27 3-14 10 14 5-7 6 20-12-2-14 6m74-17-3-14-10 14-5-7-6 20 12-2 14 6" fill="#5b5140" stroke="#c7a264" stroke-width="2"/><path d="m31 49 9 5m-10 4 12 5m-10 4 13 6m20-24-9 5m10 4-12 5m10 4-13 6" stroke="#ba9c65" stroke-width="3"/><path d="m29 75 19 7 19-7" fill="none" stroke="#e2c17c" stroke-width="3"/>'+skull,
      gloves:'<g transform="rotate(-13 32 50)"><path d="m21 40-1-20 7-5 3 19 1-23 7 1 1 23 3-19 7 3-1 23 8-8 6 6-13 23-1 18H22l-3-21-8-14 4-7Z" fill="url(#dkMetal)"/><path d="m23 35 7-7 7 8 8-6 6 10-8 8-15-1Z" fill="#c0a368"/><path d="m26 48 7-5 10 5-4 15-8 3Z" fill="#181f28" stroke="#bf9f60"/><path d="M22 70h26v12H22Z" fill="#806239" stroke="#d8b76e"/><path d="m29 50 9 8m-9 0 9-8" stroke="#cdb16e" stroke-width="2"/></g><path d="m61 38 15-4 6 18-5 16 9 11-15 7-15-18-4-19Z" fill="url(#dkMetal)"/><path d="m58 39 2-11 8 8 8-10 4 18-9 8Z" fill="#c5a76a"/><path d="m58 63 17-5m-14 13 14-8m-11 13 14-7" stroke="#c4a25d" stroke-width="3"/>',
      boots:'<g transform="rotate(-8 30 50)"><path d="M16 15h28l-1 34-6 12 17 11v12H12V68l7-18Z" fill="url(#dkMetal)"/><path d="m16 15 14 7 14-7-3 12-11 7-11-7Z" fill="#c7a35f"/><path d="m20 36 10-8 10 8-3 23-7 8-7-8Z" fill="#202831" stroke="#b89b62"/><path d="m25 40 5 5 5-5m-10 10 5 5 5-5M13 76h39" fill="none" stroke="#e0ba70" stroke-width="3"/></g><g transform="translate(36 0) rotate(8 30 50)"><path d="M16 15h28l-1 34-6 12 17 11v12H12V68l7-18Z" fill="url(#dkMetal)"/><path d="m16 15 14 7 14-7-3 12-11 7-11-7Z" fill="#c7a35f"/><path d="m20 36 10-8 10 8-3 23-7 8-7-8Z" fill="#202831" stroke="#b89b62"/><path d="m25 40 5 5 5-5m-10 10 5 5 5-5M13 76h39" fill="none" stroke="#e0ba70" stroke-width="3"/></g>'
    };
    return '<g stroke="#121a22" stroke-width="1.8" stroke-linejoin="round">'+parts[slot]+'</g>';
  }
  function armorArt(item) {
    if(item.iconVariant==='death-knight') return deathKnightArt(item.slot);
    const type=item.iconVariant || 'plate';
    let pattern=type==='crystal'
      ? '<path d="m35 33 13 11 13-11-5 22-8 17-8-17Z" fill="#c4f4ff" opacity=".7"/><path d="m36 36 12 8 12-8M48 45v25" stroke="#f2ffff" stroke-width="2" fill="none"/>'
      : type==='baphomet'
      ? '<path d="m35 40 13-8 13 8-4 22-9 9-9-9Z" fill="#622938"/><path d="m38 40-5-10 12 8h6l12-8-5 10M42 48l4 3m8-3-4 3m-7 7 5 5 5-5" fill="none" stroke="#eed2a5" stroke-width="3"/>'
      : type==='officer'
      ? '<path d="M48 31v40M33 42l15 5 15-5M34 55l14 6 14-6" stroke="#efc981" stroke-width="2" fill="none"/><path d="m43 36 5-5 5 5-5 8Z" fill="#bf514a" stroke="#eed3a0"/>'
      : '<path d="M32 40q16 10 32 0M32 49q16 11 32 0M33 60q15 9 30 0" fill="none" stroke="#ddedee" stroke-width="2" opacity=".6"/>';
    return `<g stroke="#17232d" stroke-width="1.6" stroke-linejoin="round"><path d="m33 19-17 9 3 26 13-7-5 31 21 9 21-9-5-31 13 7 3-26-17-9-7 10H40Z" fill="url(#metal)"/><path d="m32 20-2 20-13 5-3-15Z M64 20l2 20 13 5 3-15Z" fill="url(#steel)"/><path d="m38 20 3 11h14l3-11-10 5Z" fill="#17232d"/>${pattern}<path d="m29 76 19 5 19-5M31 70l17 6 17-6" fill="none" stroke="#d9b575" stroke-width="3"/></g>`;
  }
  function helmetArt(item) {
    if(item.iconVariant==='death-knight') return deathKnightArt(item.slot);
    const magic=item.iconVariant==='magic';
    return `<g stroke="#1b242b" stroke-width="1.6" stroke-linejoin="round"><path d="M24 48c0-25 10-35 24-35s24 10 24 35l8 20-13 7-10-7-9 12-9-12-10 7-13-7Z" fill="url(#metal)"/><path d="m48 13 5 34-5 34-5-34Z" fill="url(#steel)" stroke="#e8ebdb"/><path d="m26 45 17 6-2 6-16-5Zm44 0-17 6 2 6 16-5Z" fill="#10151b"/><path d="M28 62v8m7-10v11m26-11v11m7-9v8" stroke="#eef3e8" opacity=".6"/>${magic?'<path d="m48 16 9 12-9 13-9-13Z" fill="#7aa6ee" stroke="#e1efff"/><path d="m22 23-5 15m57-15 5 15" stroke="#abd9ff" stroke-width="3"/>':'<path d="M46 10V6h4v4M31 20 22 14l-3 14m46-8 9-6 3 14" fill="#ddba6f" stroke="#ffe4a5"/>'}</g>`;
  }
  function cloakArt(item) {
    const silver=item.iconVariant==='silver', fabric=silver?'url(#steel)':'url(#cloth)', gem=silver?'#bedcf0':'#d7836e';
    return `<g stroke="#17232d" stroke-width="1.6" stroke-linejoin="round"><path d="m33 17-8 18-13 43 25 5 11-5 11 5 25-5-13-43-8-18-15 8Z" fill="${fabric}"/><path d="m33 17 15 8 15-8-4 20-11 11-11-11Z" fill="url(#metal)"/><path d="m35 38-8 37m21-27v25m13-35 8 37" stroke="#b7d2e9" opacity=".5" fill="none" stroke-width="2"/><circle cx="48" cy="34" r="6" fill="url(#gold)"/><path d="m48 29 3 5-3 5-3-5Z" fill="${gem}"/>${silver?'<path d="m43 54 5-5 5 5-5 9Z" fill="#e7f4f6" stroke="#507387"/><path d="m18 76 20 4 10-5 10 5 20-4" stroke="#e4d5a6" stroke-width="3" fill="none"/>':'<path d="m41 52 7 4 7-4v13l-7 6-7-6Z" fill="#b38d50" stroke="#ecce8c"/>'}</g>`;
  }
  function glovesArt(item) {
    if(item.iconVariant==='death-knight') return deathKnightArt(item.slot);
    return '<g stroke="#17232d" stroke-width="1.6" stroke-linejoin="round"><g transform="rotate(-15 33 50)"><path d="M20 42V19q4-6 7 0v17-23q5-5 7 0v22-20q5-4 7 1v22-16q5-4 7 2v22l5-8q6-2 6 4l-11 24v13H22V66l-8-16q-1-9 6-8Z" fill="url(#metal)"/><path d="M22 40h24l-1 17-12 7-11-8Z" fill="url(#steel)"/><path d="M20 70h30v13H20Z" fill="url(#gold)"/><path d="M25 43v10m8-12v15m8-13v10" stroke="#7894a4" stroke-width="2"/></g><path d="m59 38 13-6 7 19-2 15 9 11-13 9-15-13-6-19Z" fill="url(#metal)"/><path d="m59 40 10 21 9-5m-15 14 13-7" fill="none" stroke="#d7e5e9" stroke-width="3"/><path d="m62 72 14-8 9 12-13 9Z" fill="url(#gold)"/></g>';
  }
  function bootsArt(item) {
    if(item.iconVariant==='death-knight') return deathKnightArt(item.slot);
    return '<g stroke="#17232d" stroke-width="1.7" stroke-linejoin="round"><g transform="rotate(-10 32 51)"><path d="M18 17h27l-3 40 13 11 1 13H14l-1-17 7-10Z" fill="url(#metal)"/><path d="M17 17h30v9H17Zm0 55h38v9H17Z" fill="url(#gold)"/><path d="m20 32 21 4-1 12-11 10-11-6Z" fill="url(#steel)"/><path d="m18 65 14-6 16 10" fill="none" stroke="#d8e8eb" stroke-width="2"/></g><g transform="translate(36 -1) rotate(9 32 51)"><path d="M18 17h27l-3 40 13 11 1 13H14l-1-17 7-10Z" fill="url(#metal)"/><path d="M17 17h30v9H17Zm0 55h38v9H17Z" fill="url(#gold)"/><path d="m20 32 21 4-1 12-11 10-11-6Z" fill="url(#steel)"/><path d="m18 65 14-6 16 10" fill="none" stroke="#d8e8eb" stroke-width="2"/></g></g>';
  }
  function shieldArt(item) {
    const magic=item.iconVariant==='magic';
    return `<g stroke="#1b242b" stroke-width="1.8" stroke-linejoin="round"><path d="m48 9 30 13-3 32c-4 15-14 24-27 34-13-10-23-19-27-34l-3-32Z" fill="url(#gold)"/><path d="m48 16 23 11-3 25c-3 13-11 21-20 29-9-8-17-16-20-29l-3-25Z" fill="url(#metal)"/><path d="M48 18v60M28 33h40" fill="none" stroke="#dce9e9" stroke-width="3"/>${magic?'<circle cx="48" cy="46" r="17" fill="#315872" stroke="#97d7ed" stroke-width="2"/><path d="m48 31 4 10 11 5-11 4-4 11-4-11-11-4 11-5Z" fill="#aedbf6"/>':'<path d="m48 32 12 9-4 19-8 8-8-8-4-19Z" fill="url(#gold)"/><circle cx="48" cy="46" r="5" fill="#ad5138"/>'}</g>`;
  }
  function ringArt(item) {
    const color=item.iconColor || '#a6dceb', variant=item.iconVariant || 'gem';
    return `<g stroke="#2a2118" stroke-width="1.5"><ellipse cx="48" cy="58" rx="25" ry="27" fill="url(#gold)"/><ellipse cx="48" cy="58" rx="16" ry="18" fill="#141e2a"/><path d="M24 53q1-15 13-19m22 0q12 4 14 19" fill="none" stroke="#fff0ba" stroke-width="3"/><path d="m30 30 7-14 22 0 7 14-18 17Z" fill="url(#gold)"/>${variant==='signet'?'<path d="M36 18h24v20H36Z" fill="#bec9d3"/><path d="m42 34 6-12 6 12m-10-4h8" fill="none" stroke="#425164" stroke-width="2.7"/>':`<path d="m35 28 8-11h10l8 11-13 13Z" fill="${color}" stroke="#fff2c5"/><path d="m43 17 5 24 5-24m-18 11h26" fill="none" stroke="#f3f9ff" opacity=".7"/>`}<path d="M28 65q4 14 15 16" fill="none" stroke="#eacb82" stroke-width="2"/></g>`;
  }
  function charmArt(item) {
    const color=item.iconColor || '#acdbec', skull=item.iconVariant==='skull';
    return `<path d="M22 14c-7 24-4 43 26 59 30-16 33-35 26-59" fill="none" stroke="#5a4528" stroke-width="6"/><path d="M22 14c-7 24-4 43 26 59 30-16 33-35 26-59" fill="none" stroke="#ddbb78" stroke-width="3" stroke-dasharray="3 2"/><g stroke="#30241b" stroke-width="1.6"><circle cx="48" cy="47" r="6" fill="url(#gold)"/>${skull?'<path d="M32 65c0-22 32-22 32 0l-5 8v10H37V73Z" fill="#e3d9b7"/><path d="m35 61 9 2-3 8-7-3Zm26 0-9 2 3 8 7-3ZM46 68l-3 7h10l-3-7Z" fill="#30251f"/><path d="M42 76v8m6-8v8m6-8v8" stroke="#605548"/>':`<path d="m48 49 20 18-20 21-20-21Z" fill="url(#gold)"/><path d="m48 55 13 12-13 14-13-14Z" fill="${color}" stroke="#fff2c5"/><path d="m48 57-4 10 4 12 5-12Z" fill="#fff" opacity=".45"/>`}</g>`;
  }
  function shirtArt() {
    return '<g stroke="#27313a" stroke-width="1.8" stroke-linejoin="round"><path d="m31 18-20 13 10 23 11-5-3 32h38l-3-32 11 5 10-23-20-13-10 9H41Z" fill="url(#steel)"/><path d="m36 19 5 11h14l5-11M33 47l-1 30h32l-1-30" fill="none" stroke="#e7d4a4" stroke-width="2"/><path d="m48 40 11 10-6 15H43l-6-15Z" fill="#8c6142" stroke="#eed2a0"/><path d="M48 45v13m-6-7 6-6 6 6" stroke="#f7e5ad" stroke-width="2.5" fill="none"/></g>';
  }
  function greavesArt() {
    return '<g stroke="#1d2b34" stroke-width="1.7" stroke-linejoin="round"><path d="m17 17 25-4 2 28-7 12 2 30-20 3-4-33-3-17Z M54 13l25 4 5 19-3 17-4 33-20-3 2-30-7-12Z" fill="url(#metal)"/><path d="m18 23 22-4 1 20-10 11-15-8Zm38-4 22 4 2 19-15 8-10-11Z" fill="url(#steel)"/><path d="m19 54 10 8 8-7m22 0 8 7 10-8M22 69l13 4m26 0 13-4" stroke="#d0c291" stroke-width="2.5" fill="none"/><path d="m29 25 5 6-5 7-5-7Zm38 0 5 6-5 7-5-7Z" fill="#84bbd9" stroke="#e3f0ec"/></g>';
  }
  function guardArt() {
    return '<g transform="rotate(24 48 48)" stroke="#24302e" stroke-width="1.8" stroke-linejoin="round"><path d="M25 14h46l-5 66-18 9-18-9Z" fill="url(#metal)"/><path d="M24 14h48v14H24Zm5 58h38v16H29Z" fill="url(#gold)"/><path d="m33 31 15-4 15 4-3 26-12 8-12-8Z" fill="#325748" stroke="#b2d0a2" stroke-width="2"/><path d="M45 36h6v9h9v6h-9v9h-6v-9h-9v-6h9Z" fill="#c6e9c6" stroke="none"/><path d="M32 19h32m-29 50h26" stroke="#ffe0a3" stroke-width="2"/></g>';
  }
  function beltArt() {
    return '<g stroke="#2b241d" stroke-width="1.8" stroke-linejoin="round"><path d="M11 28q37-17 74 0v36q-37 19-74 0Z" fill="#644834"/><path d="M11 35q37 17 74 0v19q-37 20-74 0Z" fill="#9d7950"/><path d="M15 33q33-15 66 0M15 61q33 16 66 0" fill="none" stroke="#d7b773" stroke-width="2"/><path d="M34 28h29v39H34Z" fill="url(#gold)"/><path d="M41 36h15v23H41Z" fill="#574235"/><path d="M48 46h17" stroke="#eee1b3" stroke-width="3"/><path d="m18 42 4 7-4 7m54-14 5 7-5 7" fill="none" stroke="#d0b274" stroke-width="2.5"/></g>';
  }
  function earringArt(item) {
    const black=item.iconVariant==='black',gem=black?'#3e304c':item.iconColor;
    return `<g stroke="#463b29" stroke-width="1.7"><path d="M41 32c-14-23 25-28 17-7-4 9-9 10-9 22" fill="none" stroke="url(#gold)" stroke-width="6"/><circle cx="49" cy="39" r="5" fill="url(#gold)"/><path d="m49 44 21 18-21 26-21-26Z" fill="url(#gold)"/><path d="m49 50 14 12-14 19-14-19Z" fill="${gem}" stroke="#eee3b7"/>${black?'<path d="m39 59 10-4 10 4-10 15Z" fill="#574367"/><path d="m42 62 7 4 7-4" stroke="#ecb591" stroke-width="2" fill="none"/>':'<path d="m49 52-6 10 6 17 6-17Z" fill="#c0eeff"/><path d="M43 62h12" stroke="#fff"/>'}</g>`;
  }
  function snapperRingArt(item) {
    return ringArt(item)+`<g stroke="#34291c" stroke-width="1.3"><path d="m73 60 12 5-2 15-10 8-10-8-2-15Z" fill="url(#gold)"/><path d="m73 65 7 3-1 10-6 5-6-5-1-10Z" fill="${item.iconColor}"/>${item.iconVariant==='defense'?'<path d="M73 67v12m-5-8h10" stroke="#ecf2e6" stroke-width="2"/>':'<path d="m69 69 8 8m-8 0 8-8" stroke="#fff0cf" stroke-width="2"/>'}</g>`;
  }
  function consumableArt(key, item) {
    if (['red', 'green', 'brave'].includes(key)) {
      return `<g stroke="#392c23" stroke-width="1.8" stroke-linejoin="round"><path d="M39 12h18v19c0 10 17 12 17 31 0 13-8 21-26 21S22 75 22 62c0-19 17-21 17-31Z" fill="#d7edee" fill-opacity=".23" stroke="#aecbd1"/><path d="M34 45h28c6 5 8 11 8 19 0 11-8 15-22 15s-22-4-22-15c0-8 2-14 8-19Z" fill="${item.color}"/><path d="M36 11h24v11H36Z" fill="url(#gold)"/><path d="M39 23h18" stroke="#edf8ee" stroke-width="2"/><path d="M33 48q-6 7-4 17" fill="none" stroke="#fff" opacity=".7" stroke-width="3"/><g transform="translate(20 34) scale(.58)">${emblem(key,'#fff3d1')}</g></g>`;
    }
    const sigil=key.startsWith('skill:')?key.slice(6):key;
    return `<g stroke="#66482c" stroke-width="1.8" stroke-linejoin="round"><path d="m25 16 48 0-10 63H14Z" fill="url(#paper)"/><path d="M25 16C8 13 5 23 11 30h47c-7-11 2-15 15-14Z" fill="#f0d6a0"/><path d="M14 79c8-15 18-8 18 0h41c-4 11-11 12-14 5H16Z" fill="#d0a66a"/><path d="M29 35h28M26 65h26" stroke="#ac8856" stroke-width="1.6"/><g transform="translate(12 21) scale(.62)"><circle cx="48" cy="48" r="30" fill="#273445" stroke="#96723e" stroke-width="2"/>${emblem(sigil,item.color)}</g><path d="m59 54 10 0-3 25-5-5-5 4Z" fill="${item.color}" stroke="#402821"/><circle cx="64" cy="53" r="6" fill="url(#gold)"/><circle cx="64" cy="53" r="3" fill="${item.color}" stroke="none"/></g>`;
  }
  const iconCache = new Map();
  function icon(id) {
    if (iconCache.has(id)) return iconCache.get(id);
    const item=byId[id], consumable=consumables[id], skill=skills[id];
    const grade=item ? item.quality : id && id.startsWith('skill:') ? 'rare' : skill ? 'rare' : 'common';
    const colors=palette[grade] || palette.common;
    const tint=item?.iconColor || consumable?.color || skill?.color || colors[0];
    let art='';
    if(item){
      const functions={weapon:weaponArt,armor:armorArt,helmet:helmetArt,cloak:cloakArt,gloves:glovesArt,boots:bootsArt,shield:shieldArt,ring:ringArt,charm:charmArt,shirt:shirtArt,greaves:greavesArt,guard:guardArt,belt:beltArt,earring:earringArt,snapperRing:snapperRingArt};
      art=functions[item.slot](item);
    } else if (consumable) art=consumableArt(id,consumable);
    else if (skill) art=`<circle cx="48" cy="48" r="32" fill="#111d2a" stroke="${tint}" stroke-width="2"/>${emblem(id,tint)}`;
    else art='<path d="m48 22 24 26-24 26-24-26Z" fill="url(#metal)" stroke="#d7d6be" stroke-width="2"/><circle cx="48" cy="48" r="7" fill="#d4bf8c"/>';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${escapeXML(item?.name||consumable?.name||skill?.name||'道具')}"><title>${escapeXML(item?.name||consumable?.name||skill?.name||'道具')} · 本作原創介面圖示</title><defs><linearGradient id="dkMetal"><stop stop-color="#151e27"/><stop offset=".4" stop-color="#58616a"/><stop offset=".5" stop-color="#8d8a73"/><stop offset=".61" stop-color="#343f49"/><stop offset="1" stop-color="#141b23"/></linearGradient><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#263441"/><stop offset="1" stop-color="#0a1017"/></linearGradient><radialGradient id="halo"><stop stop-color="${tint}" stop-opacity=".28"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/></radialGradient><linearGradient id="metal"><stop stop-color="#263b49"/><stop offset=".38" stop-color="${tint}"/><stop offset=".5" stop-color="#c6d8dd"/><stop offset=".61" stop-color="${tint}"/><stop offset="1" stop-color="#223341"/></linearGradient><linearGradient id="steel"><stop stop-color="#263d4d"/><stop offset=".42" stop-color="#f0f7ed"/><stop offset=".5" stop-color="#b9d1d9"/><stop offset=".54" stop-color="#617e91"/><stop offset="1" stop-color="#263947"/></linearGradient><linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#705128"/><stop offset=".42" stop-color="#f7dda0"/><stop offset=".57" stop-color="#b58b42"/><stop offset="1" stop-color="#634523"/></linearGradient><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#f1dfb9"/><stop offset=".55" stop-color="#d7bb85"/><stop offset="1" stop-color="#947447"/></linearGradient><linearGradient id="cloth" x2="1" y2="1"><stop stop-color="#8baec9"/><stop offset=".4" stop-color="#294865"/><stop offset=".6" stop-color="#527d9e"/><stop offset="1" stop-color="#122c45"/></linearGradient></defs><rect x="2" y="2" width="92" height="92" rx="8" fill="url(#bg)" stroke="${colors[0]}" stroke-width="2"/><rect x="6" y="6" width="84" height="84" rx="5" fill="url(#halo)" stroke="${colors[1]}" stroke-opacity=".23"/><path d="M7 22V9h13m56 0h13v13M7 74v13h13m56 0h13V74" fill="none" stroke="${colors[1]}" stroke-width="1.5" stroke-opacity=".7"/>${art}</svg>`;
    const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    iconCache.set(id,uri);
    return uri;
  }

  const deepFreeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; };
  root.R13Catalog=deepFreeze({gear,byId,consumables,skills,icon,sources,sets,SLOT_NAMES,sourceScope,balanceScope,artScope});
})(globalThis);
