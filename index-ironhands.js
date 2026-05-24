const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const XP_FILE = path.join(__dirname, 'xp.json');
const PROMOTION_FILE = path.join(__dirname, 'promotions.json');
const AAR_LOG_FILE = path.join(__dirname, 'aar_log.json');
const ARMORY_FILE = path.join(__dirname, 'armory.json');
const pendingSpecialtyApplications = new Set();

// CHANNEL IDS
const AAR_CHANNEL_ID = '1459240311665721365';
const WELCOME_CHANNEL_ID = '1461424711132254410';
const UNIFORM_CHANNEL_ID = '1459231675455377697';
const RANKS_CHANNEL_ID = '1460498962711711816';
const GENERAL_CHANNEL_ID = '1459242984490008791';
const TRIAL_CHANNEL_ID = "1459238865989796122";

// RANK-SPECIFIC UNIFORM CHANNELS
const UNIFORM_CHANNELS = {
  'Neophyte': '1461491585874133159',
  'Battle Brother': '1469735774982373480',
  'Veteran': '1469732681913860201',
  'Sergeant': '1469716911406190673',
  'Veteran Sergeant': '1469709766472237209',
  'Lieutenant': '1469700291216805889',
  'Company Ancient': '1469686708021755957',
  'Company Champion': '1469683431855358147',
  'Captain': '1469391890444189920',
  'High Command': UNIFORM_CHANNEL_ID
};

const PRIMARCH_ROLE_ID = '1461160231802376520';
const TECHMARINE_ROLE_ID = '1460141834352197737';
const IRON_FATHER_ROLE_ID = '1459230489830363348';

// ⚙️ IRON HANDS HIGH COMMAND
const HIGH_COMMAND_ROLE_IDS = [
  '1461160231802376520', 
  '1460293116241379369',
  '1459245485050040360',
  '1499162882913599529',
  '1499163605386657933',
  '1499162830081884291',
  '1459344450667937962',
  '1459230489830363348',
  '1459252226567704660'  
];
const HIGH_COMMAND_CHANNEL_ID = '1459247450890961110';

// ⚙️ IRON HANDS OFFICER COMMAND
const LIEUTENANT_ROLE_IDS = [
  '1460380127979634798' // Iron Hands Lieutenant
];

// ⚙️ IRON HANDS CAPTAIN COMMAND
const CAPTAIN_ROLE_IDS = [
  '1459252226567704660' // Iron Captain
];

// Rank ID'S
// LT is Above all of this Shit
const RANK_ROLE_IDS = {
  'Neophyte': '1459230095968305379',
  'Battle Brother': '1459229587207753728',
  'Veteran': '1459230241397674024',
  'Fireteam Leader': '1499872963241971832',
  'Sergeant': '1459252033285787861',
  'Veteran Sergeant': '1459878516249202794'
};

const SPECIALTY_CONFIG = {
  channelId: '1499874282266824754',
  logChannelId: '1459247450890961110',
  highCommandRoleId: HIGH_COMMAND_ROLE_IDS[0],
  pendingRoleId: null,

  eligibleRankIds: [
    RANK_ROLE_IDS['Sergeant'],
    RANK_ROLE_IDS['Veteran Sergeant']
  ],

  specialties: [
    {
      key: 'librarius',
      label: 'Librarius',
      buttonId: 'spec_librarius',
      ranks: {
        entry: '1499092673959821412',
        advanced: '1499092668293320946'
      }
    },
    {
      key: 'reclusiam',
      label: 'Reclusiam',
      buttonId: 'spec_reclusiam',
      ranks: {
        entry: '1499093486496911532',
        mid: '1499093480599978165',
        top: '1499093474023047169'
      }
    },
    {
      key: 'Apothecarion',
      label: 'Apothecary',
      buttonId: 'spec_apothecary',
      ranks: {
        entry: '1499092440857051177',
        advanced: '1499092436247380009'
      }
    },
    {
      key: 'armoury',
      label: 'Armoury',
      buttonId: 'spec_armoury',
      ranks: {
        entry: '1480633717025411094',
        advanced: '1460141834352197737'
      }
    }
  ]
};


// ENVOY
const ENVOY_ROLE_ID = '1459293889931247841';

// SETTINGS
const MIN_AAR_LENGTH = 40;
const FIRETEAM_CHOICE_THRESHOLD = 60;

// ===== PATH KEYS =====
const PATH_KEYS = {
  FIRETEAM: 'fireteam',
  CHAMPION: 'champion',
  ANCIENT: 'ancient'
};

const PATH_LABELS = {
  [PATH_KEYS.FIRETEAM]: 'Fireteam Leader',
  [PATH_KEYS.CHAMPION]: 'Clan Champion Trials',
  [PATH_KEYS.ANCIENT]: 'Company Ancient Trials'
};

// ===== TITLE / TRIAL SETTINGS =====
const CHAPTER_TRIAL_AAR_CHANNEL_ID = '1499832902589092011'; // 
const COMPANY_CHAMPION_ROLE_ID = '1459252641967378664';
const COMPANY_ANCIENT_ROLE_ID = '1474572937532018858';

const FIRETEAM_REVIEW_PATHS = {
  STAY: 'stay_fireteam',
  CHAMPION: 'switch_champion',
  ANCIENT: 'switch_ancient'
};

// RANDOM LORE FOR !flesh (Iron Hands)
const fleshLore = [
  '⚙️ **The Flesh is Weak**\nWeakness resides in flesh. Through steel, discipline, and logic, we purge imperfection.',
  '🦾 **The Flesh is Weak**\nThe sons of Medusa do not seek comfort. Only efficiency, endurance, and victory.',
  '⚙️ **Doctrine of Ferrus Manus**\nStrength is not given. It is forged through suffering, precision, and augmentation.',
  '🦾 **The Flesh is Weak**\nEmotion is a liability. Steel does not falter. Steel does not doubt.',
  '⚙️ **Iron Within, Iron Without**\nTo improve is to endure. To endure is to replace weakness with iron.',
  '🦾 **The Machine Spirit Watches**\nEvery action is recorded. Every inefficiency corrected.',
  '⚙️ **Ferrus Manus**\nThe primarch taught that weakness must be excised, not tolerated.',
  '🦾 **The Flesh is Weak**\nPain is a lesson. Augmentation is the answer.',
  '⚙️ **Forge Doctrine**\nWar is not chaos. War is calculation, precision, and execution.',
  '🦾 **Sons of Medusa**\nWe do not rage. We do not falter. We endure.'
];

const rankData = [
  {
    name: 'Neophyte',
    minPoints: 0,
    description: 'A Neophyte is an initiate undergoing augmentation and indoctrination into the Iron Hands. Flesh is stripped away, and weakness is identified.',
    expectations: 'Submit to discipline. Accept augmentation. Eliminate weakness in both mind and body.'
  },
  {
    name: 'Battle Brother',
    minPoints: 18,
    description: 'A Battle Brother of the Iron Hands is a fully inducted Astartes, hardened through combat and tempered through discipline.',
    expectations: 'Execute orders with precision. Maintain efficiency in all operations. Emotion is a liability.'
  },
  {
    name: 'Veteran',
    minPoints: 30,
    description: 'A Veteran is a proven warrior whose body and doctrine have been refined through countless engagements.',
    expectations: 'Guide lesser brothers. Correct inefficiency. Ensure all actions align with optimal outcomes.'
  },
  {
    name: 'Fireteam Leader',
    minPoints: 60,
    description: 'A Fireteam Leader commands small combat elements with calculated precision.',
    expectations: 'Maintain control. Execute strategy without deviation. Your squad reflects your efficiency.'
  },
  {
    name: 'Sergeant',
    minPoints: 60,
    description: 'A Sergeant enforces discipline and ensures operational effectiveness within the squad.',
    expectations: 'Maintain order. Eliminate inefficiency. Ensure all brothers meet Iron Hands standards.'
  },
  {
    name: 'Veteran Sergeant',
    minPoints: 60,
    description: 'A Veteran Sergeant is a hardened commander who embodies the doctrine of Ferrus Manus.',
    expectations: 'Lead with logic. Maintain absolute discipline. You are the standard others must reach.'
  },
  {
    name: 'Lieutenant',
    minPoints: 100,
    description: 'A Lieutenant oversees battlefield operations and ensures the execution of command directives.',
    expectations: 'Coordinate forces with precision. Support command structure. Maintain operational superiority.'
  },
  {
    name: 'Clan Ancient',
    minPoints: 100,
    description: 'A Clan Ancient carries the legacy of the Iron Hands into battle as a symbol of endurance and unyielding will.',
    expectations: 'Preserve legacy. Strengthen cohesion. Represent the unbroken will of the Clan.'
  },
  {
    name: 'Clan Champion',
    minPoints: 150,
    description: 'A Clan Champion is a calculated duelist, executing enemies with precision and efficiency.',
    expectations: 'Eliminate priority targets. Maintain superiority in combat. Prove dominance through action.'
  },
  {
    name: 'Iron Captain',
    minPoints: 999999,
    description: 'An Iron Captain commands with logic, efficiency, and absolute authority.',
    expectations: 'Lead with precision. Maintain discipline. Ensure all operations achieve optimal results.'
  },
  {
    name: 'Iron Council',
    minPoints: 999999,
    description: 'The Iron Council governs through logic, doctrine, and the teachings of Ferrus Manus.',
    expectations: 'Eliminate weakness across the Chapter. Enforce doctrine. Ensure perfection of the Clan.'
  }
];

const promotionMessages = {
  'Neophyte': '⚙️ {user} has been inducted as **Neophyte**. Weakness will be removed.',
  'Battle Brother': '⚙️ {user} now stands as a **Battle Brother**. Efficiency increased.',
  'Veteran': '⚙️ {user} has achieved **Veteran** status. Performance validated.',
  'Fireteam Leader': '⚙️ {user} designated as **Fireteam Leader**. Squad efficiency now under their control.',
  'Sergeant': '⚙️ {user} elevated to **Sergeant**. Discipline enforcement authorized.',
  'Veteran Sergeant': '⚙️ {user} is now **Veteran Sergeant**. Standard bearer of doctrine.',
  'Lieutenant': '⚙️ {user} elevated to **Lieutenant**. Operational command granted.',
  'Clan Ancient': '⚙️ {user} now serves as **Clan Ancient**. Legacy preserved through iron.',
  'Clan Champion': '⚙️ {user} recognized as **Clan Champion**. Combat superiority confirmed.',
  'Iron Captain': '⚙️ {user} elevated to **Iron Captain**. Command authority absolute.',
  'Iron Council': '⚙️ {user} has joined the **Iron Council**. Judgment and doctrine now theirs to enforce.'
};

const AUTO_PROGRESS_RANKS = [
  'Neophyte',
  'Battle Brother',
  'Veteran'
];

const APPROVAL_RANKS = [
  'Sergeant',
  'Lieutenant'
];

const SPECIAL_APPOINTMENT_RANKS = [
  'Company Ancient',
  'Company Champion'
];

const progressionRankData = rankData.filter(rank =>
  AUTO_PROGRESS_RANKS.includes(rank.name) ||
  APPROVAL_RANKS.includes(rank.name)
);

// ================= ARMORY SHOP DATA =================
const ARMORY_CHANNEL_ID = '1480648419260370984';
const FORGE_CHANNEL_ID = '1496163178994733106';
const IRON_HANDS_ROLE_ID = '1499878459759919154';


function buildArmoryForgeRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('armory_add_item')
      .setLabel('Add Armory Item')
      .setStyle(ButtonStyle.Primary)
  );
}

const armoryDropMessages = [
  'A new pattern has been sanctified. The Machine Spirit endures. Secure it while stock remains.',
  'The forge has completed its rite. The Machine Spirit awakens. Claim it before depletion.',
  'A sacred construct has been bound to steel. Requisition is now authorized.',
  'The forge burns eternal. A new instrument of war stands ready for acquisition.',
  'By the Omnissiah’s will, a relic has been forged. Only the worthy shall claim it.'
];

function getRandomArmoryDropMessage() {
  return armoryDropMessages[Math.floor(Math.random() * armoryDropMessages.length)];
}

const ARMORY_CATEGORIES = [
  'Helmet',
  'Chest',
  'Shoulder',
  'Arms',
  'Legs',
  'Backpack',
  'Cosmetic',
  'Special Issue'
];

const armorySubmissionCache = new Map();

function isPrimarch(member) {
  return member?.roles?.cache?.has(PRIMARCH_ROLE_ID);
}

function isForgeStaff(member) {
  if (!member) return false;

  return (
    member.roles.cache.has(PRIMARCH_ROLE_ID) ||
    member.roles.cache.has(TECHMARINE_ROLE_ID) ||
    member.roles.cache.has(IRON_FATHER_ROLE_ID)
  );
}

function isArmoryManager(member) {
  return isForgeStaff(member);
}
function getArmorySubmission(userId) {
  return armorySubmissionCache.get(userId) || null;
}

function clearArmorySubmission(userId) {
  armorySubmissionCache.delete(userId);
}

function createArmorySubmission(userId) {
  const submission = {
    submittedBy: userId,
    imageUrl: '',
    itemName: '',
    category: '',
    price: 0,
    stock: 1,
    step: 'awaiting_image',
    createdAt: Date.now()
  };

  armorySubmissionCache.set(userId, submission);
  return submission;
}

function saveArmoryItem(submission, approvedBy) {
  const itemId = generateArmoryItemId();

  const item = {
    itemId,
    itemName: submission.itemName,
    category: submission.category,
    price: submission.price,
    stock: submission.stock,
    imageUrl: submission.imageUrl,
    submittedBy: submission.submittedBy,
    approvedBy,
    active: true,
    shopMessageId: null,
    createdAt: Date.now()
  };

 setArmoryItem(item);
return item;
}

function buildArmoryReviewEmbed(submission, member) {
  return new EmbedBuilder()
    .setTitle('⚙️ Armory Item Review')
    .setDescription(
      `**Name:** ${submission.itemName || 'Not set'}\n` +
      `**Category:** ${submission.category || 'Not set'}\n` +
      `**Price:** ${submission.price || 0} Armory Data\n` +
      `**Stock:** ${submission.stock || 0}\n` +
      `**Submitted By:** ${member}`
    )
    .setImage(submission.imageUrl || null);
}

function buildArmoryShopEmbed(item) {
  return new EmbedBuilder()
    .setTitle(`⚔️ ${item.itemName}`)
    .setDescription(
      `**Category:** ${item.category}\n` +
      `**Price:** ${item.price} Armory Data\n` +
      `**Stock Remaining:** ${item.stock}\n` +
      `**Item ID:** ${item.itemId}`
    )
    .setImage(item.imageUrl || null);
}

function buildArmoryReviewRow(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`armory_approve:${userId}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`armory_cancel:${userId}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger)
  );
}

function buildArmoryShopRow(itemId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`armory_buy:${itemId}`)
      .setLabel('Purchase')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`armory_balance:${itemId}`)
      .setLabel('View Balance')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ================= XP / ARMORY DATA SYSTEM =================

function loadXP() {
  if (!fs.existsSync(XP_FILE)) {
    fs.writeFileSync(XP_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(XP_FILE, 'utf8'));
}

function saveXP(data) {
  fs.writeFileSync(XP_FILE, JSON.stringify(data, null, 2));
}

function ensureUserRecord(data, userId) {
  if (!data[userId]) {
    data[userId] = {
      points: 0,
      armoryData: 0
    };
  }

  if (typeof data[userId].points !== 'number') {
    data[userId].points = 0;
  }

  if (typeof data[userId].armoryData !== 'number') {
    data[userId].armoryData = 0;
  }

  return data[userId];
}

// AAR POINTS
function getUserXP(userId) {
  const data = loadXP();
  return ensureUserRecord(data, userId).points;
}

function addUserXP(userId, amount) {
  const data = loadXP();
  const record = ensureUserRecord(data, userId);

  record.points += amount;
  saveXP(data);

  return record.points;
}

function setUserXP(userId, amount) {
  const data = loadXP();
  const record = ensureUserRecord(data, userId);

  record.points = Math.max(0, amount);
  saveXP(data);

  return record.points;
}

function removeUserXP(userId, amount) {
  const data = loadXP();
  const record = ensureUserRecord(data, userId);

  record.points = Math.max(0, record.points - amount);
  saveXP(data);

  return record.points;
}

// ARMORY DATA
function getUserArmoryData(userId) {
  const data = loadXP();
  return ensureUserRecord(data, userId).armoryData;
}

function addUserArmoryData(userId, amount) {
  const data = loadXP();
  const record = ensureUserRecord(data, userId);

  record.armoryData += amount;
  saveXP(data);

  return record.armoryData;
}

function setUserArmoryData(userId, amount) {
  const data = loadXP();
  const record = ensureUserRecord(data, userId);

  record.armoryData = Math.max(0, amount);
  saveXP(data);

  return record.armoryData;
}

function removeUserArmoryData(userId, amount) {
  const data = loadXP();
  const record = ensureUserRecord(data, userId);

  record.armoryData = Math.max(0, record.armoryData - amount);
  saveXP(data);

  return record.armoryData;
}

// ================= PROMOTION STORAGE =================

function loadPromotionData() {
  if (!fs.existsSync(PROMOTION_FILE)) {
    fs.writeFileSync(PROMOTION_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(PROMOTION_FILE, 'utf8'));
}

function savePromotionData(data) {
  fs.writeFileSync(PROMOTION_FILE, JSON.stringify(data, null, 2));
}

function getDefaultPromotionRecord() {
  return {
    eligibleRank: null,
    officialRank: null,
    title: null,
    pendingApprovalRank: null,
    approvalStatus: null,

    // ===== Phase 1 progression-path system =====
    progressionChoiceOffered: false,
    progressionChoicePending: false,
    progressionChoiceMade: false,
    selectedPath: null, // 'Fireteam Leader' | 'Company Champion Trials' | 'Company Ancient Trials'
    pathStatus: null,   // 'awaiting_selection' | 'pending_review' | 'approved' | 'denied' | 'active'

    fireteamData: {
      active: false,
      approvedAt: null,
      reassessmentDue: false,
      reassessmentCount: 0,
      sergeantReviewStatus: null // 'ready' | 'needs_more_time' | null
    },

    trialData: {
      champion: {
        active: false,
        cooldownUntil: null,
        attempts: 0,
        status: null,
        overseerRank: null,
        lastReport: null,
        challengerStatus: null,
        duelPending: false
      },
      ancient: {
        active: false,
        cooldownUntil: null,
        attempts: 0,
        status: null,
        operations: {
          Inferno: null,
          Decapitation: null
        }
      }
    },

    specialRoles: {
      'Company Ancient': {
        status: null,
        trialAccepted: false
      },
      'Company Champion': {
        status: null,
        trialAccepted: false
      }
    }
  };
}

function getUserPromotion(userId) {
  const data = loadPromotionData();
  const defaultRecord = getDefaultPromotionRecord();
  const stored = data[userId] || {};

  return {
    ...defaultRecord,
    ...stored,

    fireteamData: {
      ...defaultRecord.fireteamData,
      ...(stored.fireteamData || {})
    },

    trialData: {
      ...defaultRecord.trialData,
      ...(stored.trialData || {}),
      champion: {
        ...defaultRecord.trialData.champion,
        ...((stored.trialData && stored.trialData.champion) || {})
      },
      ancient: {
        ...defaultRecord.trialData.ancient,
        ...((stored.trialData && stored.trialData.ancient) || {}),
        operations: {
          ...defaultRecord.trialData.ancient.operations,
          ...(
            stored.trialData &&
            stored.trialData.ancient &&
            stored.trialData.ancient.operations
              ? stored.trialData.ancient.operations
              : {}
          )
        }
      }
    },

    specialRoles: {
      ...defaultRecord.specialRoles,
      ...(stored.specialRoles || {})
    }
  };
}

function updateUserPromotion(userId, updater) {
  const data = loadPromotionData();
  const current = getUserPromotion(userId);
  const updatedRaw = updater(current) || current;
  const defaultRecord = getDefaultPromotionRecord();

  const updated = {
    ...defaultRecord,
    ...updatedRaw,
    fireteamData: {
      ...defaultRecord.fireteamData,
      ...(updatedRaw.fireteamData || {})
    },
    trialData: {
      ...defaultRecord.trialData,
      ...(updatedRaw.trialData || {}),
      champion: {
        ...defaultRecord.trialData.champion,
        ...((updatedRaw.trialData && updatedRaw.trialData.champion) || {})
      },
      ancient: {
        ...defaultRecord.trialData.ancient,
        ...((updatedRaw.trialData && updatedRaw.trialData.ancient) || {}),
        operations: {
          ...defaultRecord.trialData.ancient.operations,
          ...(
            updatedRaw.trialData &&
            updatedRaw.trialData.ancient &&
            updatedRaw.trialData.ancient.operations
              ? updatedRaw.trialData.ancient.operations
              : {}
          )
        }
      }
    },
    specialRoles: {
      ...defaultRecord.specialRoles,
      ...(updatedRaw.specialRoles || {})
    }
  };

  data[userId] = updated;
  savePromotionData(data);
  return updated;
}

function setEligibleRank(userId, rank) {
  return updateUserPromotion(userId, current => ({
    ...current,
    eligibleRank: rank
  }));
}

function setOfficialRank(userId, rank) {
  return updateUserPromotion(userId, current => ({
    ...current,
    officialRank: rank
  }));
}

function setUserTitle(userId, title) {
  return updateUserPromotion(userId, current => ({
    ...current,
    title: title || null
  }));
}

function setApprovalState(userId, pendingApprovalRank, approvalStatus) {
  return updateUserPromotion(userId, current => ({
    ...current,
    pendingApprovalRank,
    approvalStatus
  }));
}

function clearApprovalState(userId) {
  return updateUserPromotion(userId, current => ({
    ...current,
    pendingApprovalRank: null,
    approvalStatus: null
  }));
}

function setSpecialRoleState(userId, roleName, status, trialAccepted = false) {
  return updateUserPromotion(userId, current => ({
    ...current,
    specialRoles: {
      ...current.specialRoles,
      [roleName]: {
        status,
        trialAccepted
      }
    }
  }));
}

function setProgressionChoiceState(userId, updates) {
  return updateUserPromotion(userId, current => ({
    ...current,
    ...updates
  }));
}

function resetProgressionChoiceState(userId) {
  return updateUserPromotion(userId, current => ({
    ...current,
    progressionChoiceOffered: false,
    progressionChoicePending: false,
    progressionChoiceMade: false,
    selectedPath: null,
    pathStatus: null,
    fireteamData: {
      ...current.fireteamData,
      active: false,
      approvedAt: null,
      reassessmentDue: false,
      reassessmentCount: 0,
      sergeantReviewStatus: null
    },
    trialData: {
      ...current.trialData,
      champion: {
        ...current.trialData.champion,
        active: false,
        status: null,
        challengerStatus: null,
        duelPending: false
      },
      ancient: {
        ...current.trialData.ancient,
        active: false,
        status: null,
        cooldownUntil: null,
        operations: {
          Inferno: null,
          Decapitation: null
        }
      }
    }
  }));
}

function isInSpecialProgressionFlow(userData) {
  return Boolean(
    userData.progressionChoiceOffered ||
    userData.progressionChoicePending ||
    userData.progressionChoiceMade ||
    userData.selectedPath ||
    userData.pathStatus ||
    userData.fireteamData?.active ||
    userData.trialData?.champion?.active ||
    userData.trialData?.ancient?.active
  );
}

// ================= PATH / BUTTON HELPERS =================

function getPathLabel(pathKey) {
  return PATH_LABELS[pathKey] || 'Unknown Path';
}

function buildPathChoiceRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`pathselect:${PATH_KEYS.FIRETEAM}`)
      .setLabel('Fireteam Leader')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`pathselect:${PATH_KEYS.CHAMPION}`)
      .setLabel('Clan Champion Trials')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`pathselect:${PATH_KEYS.ANCIENT}`)
      .setLabel('Company Ancient Trials')
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildHighCommandReviewRow(userId, pathKey) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`pathreview:approve:${userId}:${pathKey}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`pathreview:deny:${userId}:${pathKey}`)
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger)
  );
}

function buildFireteamReassessmentRow(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`fireteamreassess:${FIRETEAM_REVIEW_PATHS.STAY}:${userId}`)
      .setLabel('Remain Fireteam Leader')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`fireteamreassess:${FIRETEAM_REVIEW_PATHS.CHAMPION}:${userId}`)
      .setLabel('Request Champion Trials')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`fireteamreassess:${FIRETEAM_REVIEW_PATHS.ANCIENT}:${userId}`)
      .setLabel('Request Ancient Trials')
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildSergeantReviewRow(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`sergeantreview:ready:${userId}`)
      .setLabel('Ready for Sergeant')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`sergeantreview:moretime:${userId}`)
      .setLabel('Needs More Time')
      .setStyle(ButtonStyle.Danger)
  );
}

function buildChampionChallengerRow(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`champchallenger:approve:${userId}`)
      .setLabel('Approve Challenger')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`champchallenger:deny:${userId}`)
      .setLabel('Deny Challenger')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`champchallenger:delay:${userId}`)
      .setLabel('Delay Challenger')
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildChampionDuelResolutionRow(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`champduel:defender:${userId}`)
      .setLabel('Defender Retains Title')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`champduel:challenger:${userId}`)
      .setLabel('Challenger Becomes Champion')
      .setStyle(ButtonStyle.Success)
  );
}

function buildAncientOccupancyRow(userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ancienttitle:keep:${userId}`)
      .setLabel('Keep Current Ancient')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`ancienttitle:replace:${userId}`)
      .setLabel('Replace Current Ancient')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`ancienttitle:reserve:${userId}`)
      .setLabel('Mark as Successor / Reserve')
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildDisabledRowsFromMessage(message) {
  return message.components.map(row => {
    const disabledButtons = row.components.map(component =>
      ButtonBuilder.from(component).setDisabled(true)
    );
    return new ActionRowBuilder().addComponents(disabledButtons);
  });
}

function buildBasicHelpRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_general')
      .setLabel('General')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('help_progression')
      .setLabel('Progression')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('help_specialty')
      .setLabel('Specialty')
      .setStyle(ButtonStyle.Primary)
  );
}

function buildAdminHelpRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_admin')
      .setLabel('Command Tools')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('help_trials')
      .setLabel('Trial Tools')
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildArmoryDataRewardRow(messageId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`armorydata:green:${messageId}`)
      .setLabel('Mastercraft +0.25')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`armorydata:purple:${messageId}`)
      .setLabel('Artificer +0.5')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`armorydata:gold:${messageId}`)
      .setLabel('Gold')
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildGoldArmoryDataRow(messageId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`armorydata:gold1:${messageId}`)
      .setLabel('Relic Ruthless +1')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`armorydata:gold2:${messageId}`)
      .setLabel('Relic Lethal +1.5')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`armorydata:gold3:${messageId}`)
      .setLabel('Relic Absolute +2')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ================= TRIAL / TITLE HELPERS =================

function parseYesNo(value) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (['yes', 'y', 'true', 'pass', 'passed'].includes(normalized)) return true;
  if (['no', 'n', 'false', 'fail', 'failed'].includes(normalized)) return false;
  return null;
}

function isChampionOverseerRankValid(rankName) {
  if (!rankName) return false;
  const normalized = rankName.trim().toLowerCase();
  return ['veteran sergeant', 'lieutenant', 'captain', 'high command'].includes(normalized);
}

function isAncientOverseerRankValid(rankName) {
  if (!rankName) return false;
  const normalized = rankName.trim().toLowerCase();
  return ['sergeant', 'veteran sergeant', 'lieutenant', 'captain', 'high command'].includes(normalized);
}

function normalizeSquadList(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean)
    .sort();
}

function sameSquad(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function formatDateTime(date) {
  return new Date(date).toLocaleString();
}

function getCurrentRoleHolder(guild, roleId) {
  if (!guild || !roleId) return null;
  const role = guild.roles.cache.get(roleId);
  if (!role) return null;
  const holder = role.members.first();
  return holder || null;
}

async function removeExclusiveRoleFromCurrentHolder(guild, roleId, excludeUserId = null) {
  const role = guild.roles.cache.get(roleId);
  if (!role) return null;

  const currentHolder = role.members.find(member => member.id !== excludeUserId) || null;
  if (currentHolder) {
    try {
      await currentHolder.roles.remove(roleId);
    } catch (error) {
      console.error(`Failed removing exclusive role ${role.name} from ${currentHolder.user.tag}:`, error);
    }
  }

  return currentHolder;
}

async function awardExclusiveRole(member, roleId) {
  if (!member || !roleId) return;
  const guild = member.guild;
  await removeExclusiveRoleFromCurrentHolder(guild, roleId, member.id);

  try {
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
    }
  } catch (error) {
    console.error(`Failed awarding exclusive role ${roleId} to ${member.user.tag}:`, error);
  }
}

async function notifyChampionTitleResolution(guild, member) {
  const currentChampion = getCurrentRoleHolder(guild, COMPANY_CHAMPION_ROLE_ID);

  if (!currentChampion || currentChampion.id === member.id) {
    await awardExclusiveRole(member, COMPANY_CHAMPION_ROLE_ID);
    setUserTitle(member.id, 'Company Champion');

    const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (generalChannel) {
      await generalChannel.send(
        `⚔️ ${member} has been recognized as **Company Champion** by decree of High Command.`
      );
    }

    try {
      await member.send(
        `⚔️ **Your trial is complete.**\n\n` +
        `The mantle of **Company Champion** has been granted to you.`
      );
    } catch (error) {
      console.error(`Could not DM ${member.user.tag}:`, error);
    }

    return;
  }

  const highCommandChannel = guild.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);
  if (highCommandChannel) {
    await highCommandChannel.send({
      content:
        `⚔️ **Champion Title Contested**\n` +
        `Brother ${member} has passed the Company Champion trial, but the title is already held by ${currentChampion}.\n` +
        `Select how High Command wishes to proceed.`,
      components: [buildChampionChallengerRow(member.id)]
    });
  }

updateUserPromotion(member.id, current => ({
  ...current,
  trialData: {
    ...current.trialData,
      champion: {
        ...current.trialData.champion,
        challengerStatus: 'pending',
        duelPending: false
      }
    }
  }));
}

async function notifyAncientTitleDecision(guild, member) {
  const currentAncient = getCurrentRoleHolder(guild, COMPANY_ANCIENT_ROLE_ID);

  if (!currentAncient || currentAncient.id === member.id) {
    await awardExclusiveRole(member, COMPANY_ANCIENT_ROLE_ID);
    setUserTitle(member.id, 'Company Ancient');

    const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (generalChannel) {
      await generalChannel.send(
        `🏛️ ${member} has been recognized as **Company Ancient** by decree of High Command.`
      );
    }

    try {
      await member.send(
        `🏛️ **Your trial is complete.**\n\n` +
        `The mantle of **Company Ancient** has been granted to you.`
      );
    } catch (error) {
      console.error(`Could not DM ${member.user.tag}:`, error);
    }

    return;
  }

  const highCommandChannel = guild.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);
  if (highCommandChannel) {
    await highCommandChannel.send({
      content:
        `🏛️ **Ancient Title Occupied**\n` +
        `Brother ${member} has passed the Company Ancient trial, but the title is currently held by ${currentAncient}.\n` +
        `Select how High Command wishes to proceed.`,
      components: [buildAncientOccupancyRow(member.id)]
    });
  }
}

function buildPromotionMessage(member, rank, points) {
  const uniformChannelId = UNIFORM_CHANNELS[rank.name] || UNIFORM_CHANNEL_ID;

  let msg =
    `⚙️ **The Machine Spirit addresses you, ${member.user.username}...**\n\n` +
    `Your deeds have been recorded in the annals of the Chapter.\n` +
    `You have attained the standing of **${rank.name}**.\n\n` +
    `**AAR Points:** ${points}\n\n` +
    `**Description:** ${rank.description}\n\n` +
    `**Rank Expectations:** ${rank.expectations}\n`;

  if (rank.note) {
    msg += `\n**Additional Directive:** ${rank.note}\n`;
  }

  if (rank.specialNote) {
    msg += `\n**Special Note:** ${rank.specialNote}\n`;
  }

  msg +=
    `\nReport to <#${uniformChannelId}> and ensure your appearance, wargear, and bearing match the standards of your new station.\n` +
    `Review the full rank structure in <#${RANKS_CHANNEL_ID}>.\n\n` +
    `Stand ready. Greater trials await.`;

  return msg;
}

// ================= AAR LOG =================

function loadAARLog() {
  if (!fs.existsSync(AAR_LOG_FILE)) {
    fs.writeFileSync(AAR_LOG_FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(AAR_LOG_FILE, 'utf8'));
}

function saveAARLog(data) {
  fs.writeFileSync(AAR_LOG_FILE, JSON.stringify(data, null, 2));
}

function normalizeAAR(content) {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getAARSignature(message, members) {
  const ids = members.map(m => m.id).sort().join('-');
  const content = normalizeAAR(message.content);
  return `${ids}::${content}`;
}

function isDuplicateAAR(signature) {
  const log = loadAARLog();
  return Boolean(log[signature]);
}

function storeAAR(signature, messageId) {
  const log = loadAARLog();
  log[signature] = {
    messageId,
    createdAt: new Date().toISOString()
  };
  saveAARLog(log);
}

// ================= RANK HELPERS =================

function getRank(points) {
  let current = progressionRankData[0];

  for (const rank of progressionRankData) {
    if (points >= rank.minPoints) {
      current = rank;
    }
  }

  return current;
}

function isAutoProgressRank(rankName) {
  return AUTO_PROGRESS_RANKS.includes(rankName);
}

function isApprovalRank(rankName) {
  return APPROVAL_RANKS.includes(rankName);
}

function isSpecialAppointmentRank(rankName) {
  return SPECIAL_APPOINTMENT_RANKS.includes(rankName);
}

function getHighestManagedRankFromMember(member) {
  const orderedDetectableRanks = [
    'Veteran Sergeant',
    'Sergeant',
    'Veteran',
    'Battle Brother',
    'Neophyte'
  ];

  for (const rankName of orderedDetectableRanks) {
    const roleId = RANK_ROLE_IDS[rankName];
    if (roleId && member.roles.cache.has(roleId)) {
      return rankName;
    }
  }

  return null;
}

async function syncMemberRankRole(member, newRankName) {
  if (!member || !member.guild) return;
  if (!RANK_ROLE_IDS[newRankName]) return;

  const trackedRoleIds = Object.values(RANK_ROLE_IDS).filter(Boolean);
  const newRoleId = RANK_ROLE_IDS[newRankName];

  try {
    const rolesToRemove = trackedRoleIds.filter(
      roleId => roleId && roleId !== newRoleId && member.roles.cache.has(roleId)
    );

    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove);
    }

    if (!member.roles.cache.has(newRoleId)) {
      await member.roles.add(newRoleId);
    }
  } catch (error) {
    console.error(`Failed to sync rank roles for ${member.user.tag}:`, error);
  }
}

async function sendFireteamChoicePrompt(guild, member, points) {
  let dmDelivered = false;

  try {
    await member.send({
      content:
        `⚙️ **The Machine Spirit records your rising standing, Brother...**\n\n` +
        `You have reached **${points} AAR points**, the threshold at which your path may now be chosen.\n\n` +
        `You now stand before the next step in your service.\n` +
        `Select the path you wish to pursue:\n\n` +
        `• **Fireteam Leader**\n` +
        `• **Company Champion Trials**\n` +
        `• **Company Ancient Trials**`,
      components: [buildPathChoiceRow()]
    });

    dmDelivered = true;
  } catch (error) {
    console.error(`Could not DM ${member.user.tag}:`, error);
  }

  setProgressionChoiceState(member.id, {
    progressionChoiceOffered: true,
    progressionChoicePending: true,
    progressionChoiceMade: false,
    selectedPath: null,
    pathStatus: 'awaiting_selection'
  });

  const highCommandChannel = guild.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);
  if (highCommandChannel) {
    await highCommandChannel.send(
      `⚠️ **Progression Path Review Ready**\n` +
      `Brother ${member} has reached **${points} AAR points** and entered the Fireteam progression threshold.\n` +
      `**Status:** Awaiting path selection\n` +
      `**DM Delivered:** ${dmDelivered ? 'Yes' : 'No'}\n` +
      `**Available Paths:** Fireteam Leader / Company Champion Trials / Company Ancient Trials`
    );
  }
}

async function handleRankThresholdChange(guild, member, oldTrackedRank, oldPoints, newPoints) {
  if (!guild || !member) return;

if (hasSpecialtyRole(member)) {
    setEligibleRank(member.id, getHighestManagedRankFromMember(member) || 'Specialty');
    return;
  }

  const newRank = getRank(newPoints);
  const oldRank = getRank(oldPoints);
  const userData = getUserPromotion(member.id);

  if (
    userData.officialRank === 'High Command' ||
    userData.eligibleRank === 'High Command'
  ) {
    return;
  }

  // ================= FIRETEAM PATH THRESHOLD =================
  const crossedFireteamChoiceThreshold =
    oldPoints < FIRETEAM_CHOICE_THRESHOLD &&
    newPoints >= FIRETEAM_CHOICE_THRESHOLD;

  const alreadyInSpecialFlow = isInSpecialProgressionFlow(userData);

  if (crossedFireteamChoiceThreshold && !alreadyInSpecialFlow) {
    if (newRank.name !== oldTrackedRank) {
      setEligibleRank(member.id, newRank.name);
    }

    await sendFireteamChoicePrompt(guild, member, newPoints);
    return;
  }

  if (newRank.name === oldTrackedRank) {
    return;
  }

  setEligibleRank(member.id, newRank.name);

  // ================= AUTO PROMOTION (UP TO VETERAN) =================
  if (
    isAutoProgressRank(newRank.name) &&
    newPoints > oldPoints &&
    newRank.minPoints > oldRank.minPoints
  ) {
    setOfficialRank(member.id, newRank.name);
    clearApprovalState(member.id);
    await syncMemberRankRole(member, newRank.name);

    try {
      await member.send(buildPromotionMessage(member, newRank, newPoints));
    } catch (error) {
      console.error(`Could not DM ${member.user.tag}:`, error);
    }

    const channel = guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      const template =
        promotionMessages[newRank.name] ||
        '⚔️ {user} has been elevated within the Chapter.';
      await channel.send(template.replace('{user}', `${member}`));
    }

    return;
  }

  // ================= APPROVAL REQUIRED (SERGEANT+) =================
  const refreshedUserData = getUserPromotion(member.id);
  const blockApprovalBecauseInSpecialFlow =
    refreshedUserData.progressionChoiceOffered ||
    refreshedUserData.progressionChoicePending ||
    refreshedUserData.progressionChoiceMade ||
    refreshedUserData.selectedPath === 'Fireteam Leader' ||
    refreshedUserData.fireteamData?.active;

  if (
    isApprovalRank(newRank.name) &&
    newPoints > oldPoints &&
    newRank.minPoints > oldRank.minPoints &&
    !blockApprovalBecauseInSpecialFlow
  ) {
    setApprovalState(member.id, newRank.name, 'pending');

    const highCommandChannel = guild.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);

    if (highCommandChannel) {
      await highCommandChannel.send(
        `⚠️ **Promotion Review Required**\n` +
        `Brother ${member} has reached the required AAR standing for **${newRank.name}**.\n` +
        `**Official Rank:** ${userData.officialRank || oldTrackedRank}\n` +
        `**Eligible Rank:** ${newRank.name}\n` +
        `**Approval Status:** Pending\n` +
        `Awaiting judgment by High Command.`
      );
    }
  }
}

function hasCommandAuthority(member) {
  if (!member) return false;

  const hasHighCommandRole = HIGH_COMMAND_ROLE_IDS.some(roleId =>
    member.roles.cache.has(roleId)
  );

  const hasLieutenantRole = LIEUTENANT_ROLE_IDS.some(roleId =>
    member.roles.cache.has(roleId)
  );

  const hasCaptainRole = CAPTAIN_ROLE_IDS.some(roleId =>
    member.roles.cache.has(roleId)
  );

  return hasHighCommandRole || hasLieutenantRole || hasCaptainRole;
}

// ================= AAR POINT CALCULATION =================

function getMentionedRoleNames(message) {
  const roleNames = new Set();

  message.mentions.roles.forEach(role => {
    roleNames.add(role.name.toLowerCase());
  });

  const rawRoleIds = [...message.content.matchAll(/<@&(\d+)>/g)].map(match => match[1]);

  for (const roleId of rawRoleIds) {
    const role = message.guild.roles.cache.get(roleId);

    if (role) {
      roleNames.add(role.name.toLowerCase());
    }
  }

  return [...roleNames];
}

function getAARData(message) {
  const text = message.content.toLowerCase();
  const roleNames = getMentionedRoleNames(message);

  const hasRole = name => roleNames.includes(name.toLowerCase());
  const hasText = value => text.includes(value.toLowerCase());

  const victoryRequired =
    hasText('victory') ||
    hasText('status: victory') ||
    hasText('successful') ||
    hasText('success');

  const hasGeneSeed =
    hasText('gene-seed: yes') ||
    hasText('gene seed: yes') ||
    hasText('gene-seed: true') ||
    hasText('gene seed: true') ||
    hasRole('gene-seed') ||
    hasRole('gene seed');

  // ================= PvE Siege =================
  if (
    hasText('pve siege') ||
    hasText('waves:') ||
    hasText('waves') ||
    hasRole('normal siege mode') ||
    hasRole('hard siege mode')
  ) {
    const waveMatch =
      text.match(/waves\s*:\s*(\d+)/i) ||
      text.match(/waves\s*(\d+)/i) ||
      text.match(/(\d+)\s*waves/i);

    const waves = waveMatch ? parseInt(waveMatch[1], 10) : 0;
    const setsOfFive = Math.floor(waves / 5);

    let points = 0;

    if (
      hasRole('hard siege mode') ||
      hasText('difficulty: hard') ||
      hasText('hard')
    ) {
      points = setsOfFive * 2;
    } else if (
      hasRole('normal siege mode') ||
      hasText('difficulty: normal') ||
      hasText('normal')
    ) {
      points = setsOfFive * 1;
    }

    return {
      type: 'PvE Siege',
      points
    };
  }

  // ================= PvE Stratagem =================
  if (
    hasText('pve stratagem') ||
    hasRole('normal strat') ||
    hasRole('hard strat') ||
    hasRole('normal stratagem') ||
    hasRole('hard stratagem')
  ) {
    let points = 0;

    if (
      hasRole('hard strat') ||
      hasRole('hard stratagem') ||
      hasText('difficulty: hard') ||
      hasText('hard strat')
    ) {
      points = 4;
    } else if (
      hasRole('normal strat') ||
      hasRole('normal stratagem') ||
      hasText('difficulty: normal') ||
      hasText('normal strat')
    ) {
      points = 2;
    }

    if (victoryRequired && hasGeneSeed) {
      points += 1;
    }

    return {
      type: 'PvE Stratagem',
      points
    };
  }

  // ================= PvP Eternal War =================
  if (
    hasText('pvp eternal war') ||
    hasText('gamemode:') ||
    hasRole('pvp victory') ||
    hasRole('pvp defeat')
  ) {
    let points = 0;

    if (
      hasRole('pvp victory') ||
      hasText('status: victory') ||
      hasText('victory')
    ) {
      points = 2;
    } else if (
      hasRole('pvp defeat') ||
      hasText('status: defeat') ||
      hasText('defeat')
    ) {
      points = 1;
    }

    return {
      type: 'PvP Eternal War',
      points
    };
  }

  // ================= PvE Operation =================
  if (
    hasText('pve operation') ||
    hasText('operation:') ||
    hasRole('absolute') ||
    hasRole('lethal') ||
    hasRole('ruthless')
  ) {
    let points = 0;

    if (
      hasRole('absolute') ||
      hasText('difficulty: absolute') ||
      hasText('absolute')
    ) {
      points = 3;
    } else if (
      hasRole('lethal') ||
      hasText('difficulty: lethal') ||
      hasText('lethal')
    ) {
      points = 2;
    } else if (
      hasRole('ruthless') ||
      hasRole('substantial') ||
      hasRole('average') ||
      hasRole('minimal') ||
      hasText('difficulty: ruthless') ||
      hasText('ruthless') ||
      hasText('substantial') ||
      hasText('average') ||
      hasText('minimal')
    ) {
      points = 1;
    }

    if (victoryRequired && hasGeneSeed) {
      points += 1;
    }

    return {
      type: 'PvE Operation',
      points
    };
  }

  return {
    type: 'Unknown',
    points: 0
  };
}

function isEligibleForSpecialty(member) {
  return member.roles.cache.some(role =>
    SPECIALTY_CONFIG.eligibleRankIds.includes(role.id)
  );
}

function getCurrentSpecialty(member) {
  return SPECIALTY_CONFIG.specialties.find(spec =>
    Object.values(spec.ranks).some(roleId =>
      member.roles.cache.has(roleId)
    )
  );
}

function hasSpecialtyRole(member) {
  if (!member) return false;

  return Boolean(getCurrentSpecialty(member)) ||
    member.roles.cache.has(COMPANY_ANCIENT_ROLE_ID) ||
    member.roles.cache.has(COMPANY_CHAMPION_ROLE_ID) ||
    CAPTAIN_ROLE_IDS.some(roleId => member.roles.cache.has(roleId)) ||
    LIEUTENANT_ROLE_IDS.some(roleId => member.roles.cache.has(roleId));
}

async function removeAllSpecialtyRoles(member) {
  const allRoles = SPECIALTY_CONFIG.specialties.flatMap(spec =>
    Object.values(spec.ranks)
  );

  const rolesToRemove = allRoles.filter(roleId =>
    member.roles.cache.has(roleId)
  );

  if (rolesToRemove.length > 0) {
    await member.roles.remove(rolesToRemove);
  }
}

// ================= AAR TEAM CREDIT =================

function getCreditedMembers(message) {
  const credited = new Map();

  credited.set(message.author.id, message.member);

  message.mentions.members.forEach(member => {
    if (!member.user.bot) {
      credited.set(member.id, member);
    }
  });

  return [...credited.values()];
}

// ================= READY =================

client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

// ================= AUTO WELCOME =================

client.on(Events.GuildMemberAdd, member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const isEnvoy = member.roles.cache.has(ENVOY_ROLE_ID);

  if (isEnvoy) {
    return channel.send(
      `🕊️ **The Machine Spirit acknowledges an honored envoy...**\n` +
      `Welcome, ${member}.\n\n` +
      `You enter these halls as a guest among the sons of The Gorgon.\n` +
      `Conduct yourself with dignity, honor, and purpose.\n\n` +
      `⚙️ **Required:**\n` +
      `• Review the rules and conduct\n\n` +
      `Use !help if guidance is required.`
    );
  }

  return channel.send(
    `⚙️ The Machine Spirit acknowledges a new arrival...\n` +
      `Welcome, ${member}.\n\n` +
      `You now stand among the Sons of The Gorgon as a **Neophyte** of the Chapter.\n` +
      `The flesh is weak. Strength is earned through discipline and iron.\n\n` +
      `⚙️ Begin your induction:\n` +
      `• Review the rules and conduct\n` +
      `• Report to Neophyte uniform issue:<#1461491585874133159>\n` +
      `• Look at the rank structure in <#${RANKS_CHANNEL_ID}>\n` +
      `• Submit AARs after missions\n\n` +
      `Use !help to access all Machine Spirit functions.`
  );
});

// ================= ARMORY STORAGE =================
function loadArmoryInventory() {
  if (!fs.existsSync(ARMORY_FILE)) {
    fs.writeFileSync(ARMORY_FILE, JSON.stringify({
      counter: 1,
      items: {}
    }, null, 2));
  }

  return JSON.parse(fs.readFileSync(ARMORY_FILE, 'utf8'));
}

function saveArmoryInventory(data) {
  fs.writeFileSync(ARMORY_FILE, JSON.stringify(data, null, 2));
}

function getArmoryItem(itemId) {
  const data = loadArmoryInventory();
  return data.items[itemId] || null;
}

function setArmoryItem(item) {
  const data = loadArmoryInventory();
  data.items[item.itemId] = item;
  saveArmoryInventory(data);
}

function generateArmoryItemId() {
  const data = loadArmoryInventory();
  const itemId = `armory_${String(data.counter).padStart(3, '0')}`;
  data.counter += 1;
  saveArmoryInventory(data);
  return itemId;
}

// ================= INTERACTIONS =================

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

// ================= ARMORY DATA REWARD BUTTONS =================
if (interaction.customId.startsWith('armorydata:')) {
  if (!hasCommandAuthority(interaction.member)) {
    return interaction.reply({
      content: '⚠️ Only authorized officers may confirm Armory Data rewards.',
      ephemeral: true
    });
  }

  const [, type, aarMessageId] = interaction.customId.split(':');

  if (type === 'gold') {
    return interaction.reply({
      content: '⚙️ Select the Gold Armory Data value recovered.',
      components: [buildGoldArmoryDataRow(aarMessageId)],
      ephemeral: true
    });
  }

  let amount = 0;

if (type === 'green') amount = 0.25;
if (type === 'purple') amount = 0.5;

if (type === 'gold1') amount = 1;
if (type === 'gold2') amount = 1.5;
if (type === 'gold3') amount = 2;

  if (amount <= 0) {
    return interaction.reply({
      content: '⚠️ Invalid Armory Data value.',
      ephemeral: true
    });
  }

  const aarChannel = interaction.guild.channels.cache.get(AAR_CHANNEL_ID);
  const aarMessage = await aarChannel.messages.fetch(aarMessageId).catch(() => null);

  if (!aarMessage) {
    return interaction.reply({
      content: '⚠️ Could not find the original AAR message.',
      ephemeral: true
    });
  }

  const creditedMembers = getCreditedMembers(aarMessage);

  for (const member of creditedMembers) {
    addUserArmoryData(member.id, amount);
  }

  const disabledRows = buildDisabledRowsFromMessage(interaction.message);

  await interaction.message.edit({
    components: disabledRows
  }).catch(() => null);

  return interaction.reply({
    content:
      `⚙️ **Armory Data Logged**\n` +
      `Awarded **${amount} Armory Data** to **${creditedMembers.length}** battle brother(s).`,
    ephemeral: true
  });
}

// ================= ARMORY SHOP SYSTEM =================
if (interaction.customId === 'armory_add_item') {
  if (!isArmoryManager(interaction.member)) {
    return interaction.reply({
      content: '⚠️ Only Techmarines, Iron Fathers, or the Primarch may forge armory items.',
      ephemeral: true
    });
  }

  const existing = getArmorySubmission(interaction.user.id);
  if (existing) {
    return interaction.reply({
      content: '⚠️ You already have an active armory submission in progress.',
      ephemeral: true
    });
  }

  createArmorySubmission(interaction.user.id);

  return interaction.reply({
    content:
      '⚙️ **Armory creation initiated.**\n\n' +
      'Upload the image of the armor piece in this channel. Once the image is received, the Machine Spirit will continue the forge process.',
    ephemeral: true
  });
}

// ================= ARMORY REVIEW SYSTEM =================
if (
  interaction.customId.startsWith('armory_approve:') ||
  interaction.customId.startsWith('armory_cancel:')
) {
  const parts = interaction.customId.split(':');

  if (parts.length < 2) {
    return interaction.reply({
      content: '⚠️ Invalid armory interaction.',
      ephemeral: true
    });
  }

  if (!isArmoryManager(interaction.member)) {
    return interaction.reply({
      content: '⚠️ Only authorized forge staff may review armory items.',
      ephemeral: true
    });
  }

  const [action, targetUserId] = parts;
  const submission = getArmorySubmission(targetUserId);

  if (!submission) {
    return interaction.reply({
      content: '⚠️ That armory submission no longer exists or has already been processed.',
      ephemeral: true
    });
  }

  const disabledRows = buildDisabledRowsFromMessage(interaction.message);

  if (action === 'armory_cancel') {
    clearArmorySubmission(targetUserId);

    await interaction.update({
      content:
        `⚠️ **Armory Submission Cancelled**\n` +
        `The item submission for <@${targetUserId}> has been cancelled by ${interaction.user}.`,
      embeds: [],
      components: disabledRows
    });

    return;
  }

  if (action === 'armory_approve') {
    const item = saveArmoryItem(submission, interaction.user.id);
    clearArmorySubmission(targetUserId);

    const armoryChannel = interaction.guild.channels.cache.get(ARMORY_CHANNEL_ID);
    let shopMessage = null;

    const dropMessage = getRandomArmoryDropMessage();

    if (armoryChannel) {
      shopMessage = await armoryChannel.send({
        content:
  	`<@&${IRON_HANDS_ROLE_ID}>\n` +
  	`⚙️ **New Forge Stock Available!**\n` +
  	`${dropMessage}`,
        embeds: [buildArmoryShopEmbed(item)],
        components: [buildArmoryShopRow(item.itemId)],
        allowedMentions: {
          roles: [IRON_HANDS_ROLE_ID]
        }
      });

      item.shopMessageId = shopMessage.id;
      setArmoryItem(item);	
    }

    const forgeChannel = interaction.guild.channels.cache.get(FORGE_CHANNEL_ID);
    if (forgeChannel) {
      await forgeChannel.send(
        `⚙️ **Armory Item Approved**\n` +
        `**Item:** ${item.itemName}\n` +
        `**Category:** ${item.category}\n` +
        `**Price:** ${item.price} Armory Data\n` +
        `**Stock:** ${item.stock}\n` +
        `**Approved By:** ${interaction.user}`
      );
    }

    await interaction.update({
      content:
        `⚙️ **Praise the Omnissiah, This Machine Spirit is satisfied.**\n\n` +
        `🔥 **Forge Complete**\n` +
        `The item **${item.itemName}** has been sanctified and entered into the armory by ${interaction.user}.`,
      embeds: [buildArmoryReviewEmbed(submission, `<@${targetUserId}>`)],
      components: disabledRows
    });

    return;
  }
}

// ================= ARMORY PURCHASE SYSTEM =================
if (interaction.customId.startsWith('armory_buy:')) {
  const parts = interaction.customId.split(':');

  if (parts.length < 2) {
    return interaction.reply({
      content: '⚠️ Invalid purchase interaction.',
      ephemeral: true
    });
  }

  const [, itemId] = parts;
  const item = getArmoryItem(itemId);

  if (!item || !item.active) {
    return interaction.reply({
      content: '⚠️ This item is no longer available in the armory.',
      ephemeral: true
    });
  }

  if (item.stock <= 0) {
    return interaction.reply({
      content: '⚠️ This item has already been claimed.',
      ephemeral: true
    });
  }

  const currentBalance = getUserArmoryData(interaction.user.id);

  if (currentBalance < item.price) {
    return interaction.reply({
      content:
        `⚙️ **The Machine Spirit denies this request.**\n\n` +
        `Required: ${item.price} Armory Data\n` +
        `You possess: ${currentBalance}`,
      ephemeral: true
    });
  }

  // COMPLETE PURCHASE
  removeUserArmoryData(interaction.user.id, item.price);
  item.stock -= 1;

  if (item.stock <= 0) {
    item.active = false;
  }

  setArmoryItem(item);

  // LOG TO FORGE CHANNEL
  const forgeChannel = interaction.guild.channels.cache.get(FORGE_CHANNEL_ID);
  if (forgeChannel) {
    await forgeChannel.send(
      `⚙️ **Armory Acquisition Logged**\n` +
      `**Brother:** ${interaction.user}\n` +
      `**Item:** ${item.itemName}\n` +
      `**Cost:** ${item.price} Armory Data\n` +
      `**Stock Remaining:** ${item.stock}`
    );
  }

  // UPDATE SHOP MESSAGE
  try {
    const armoryChannel = interaction.guild.channels.cache.get(ARMORY_CHANNEL_ID);

    if (armoryChannel && item.shopMessageId) {
      const shopMsg = await armoryChannel.messages.fetch(item.shopMessageId);

      await shopMsg.edit({
        content: shopMsg.content,
        embeds: [buildArmoryShopEmbed(item)],
        components: item.active ? [buildArmoryShopRow(item.itemId)] : []
      });
    }
  } catch (err) {
    console.error('Armory message update failed:', err);
  }

  return interaction.reply({
    content:
      `⚙️ **Praise the Omnissiah**\n\n` +
      `You have successfully acquired **${item.itemName}** for ${item.price} Armory Data.`,
    ephemeral: true
  });
}

// ================= ARMORY BALANCE =================
if (interaction.customId.startsWith('armory_balance')) {
  const currentBalance = getUserArmoryData(interaction.user.id);

  return interaction.reply({
    content:
      `⚙️ **The Machine Spirit reports your reserves.**\n\n` +
      `You currently possess: **${currentBalance} Armory Data**`,
    ephemeral: true
  });
}

// ================= SPECIALTY APPLICATION SYSTEM =================
const specialty = SPECIALTY_CONFIG.specialties.find(
  spec => spec.buttonId === interaction.customId
);

if (specialty) {
  const member = interaction.member;
  const guild = interaction.guild;

  try {
    if (!isEligibleForSpecialty(member)) {
      return interaction.reply({
        content: '⚠️ Request denied. Only Sergeants and above may apply for these roles.',
        ephemeral: true
      });
    }

    const current = getCurrentSpecialty(member);
    if (current) {
      return interaction.reply({
        content: `⚠️ You already belong to **${current.label}**.`,
        ephemeral: true
      });
    }

    if (pendingSpecialtyApplications.has(member.id)) {
      return interaction.reply({
        content: '⚠️ You already have a pending application.',
        ephemeral: true
      });
    }

    pendingSpecialtyApplications.add(member.id);

    const logChannel = guild.channels.cache.get(SPECIALTY_CONFIG.logChannelId);

    if (logChannel) {
      const reviewRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`specapprove:${member.id}:${specialty.key}`)
          .setLabel('Approve')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`specdeny:${member.id}:${specialty.key}`)
          .setLabel('Deny')
          .setStyle(ButtonStyle.Danger)
      );

      await logChannel.send({
        content:
          `📡 <@&${SPECIALTY_CONFIG.highCommandRoleId}> ${member} applied for **${specialty.label}**.\n` +
          `Review and render judgment below.`,
        components: [reviewRow]
      });
    }

    return interaction.reply({
      content: `✅ Application for **${specialty.label}** submitted.`,
      ephemeral: true
    });

  } catch (err) {
    console.error('Specialty Error:', err);

    return interaction.reply({
      content: '⚠️ Machine Spirit error.',
      ephemeral: true
    });
  }
}

// ================= SPECIALTY REVIEW SYSTEM =================
if (
  interaction.customId.startsWith('specapprove:') ||
  interaction.customId.startsWith('specdeny:')
) {
  if (!interaction.guild || !interaction.member) {
    return interaction.reply({
      content: '⚠️ This action may only be used inside the guild.',
      ephemeral: true
    });
  }

  if (!hasCommandAuthority(interaction.member)) {
    return interaction.reply({
      content: '⚠️ Only High Command, Captains, or Lieutenants may review specialty applications.',
      ephemeral: true
    });
  }

  const [action, targetUserId, specialtyKey] = interaction.customId.split(':');
  const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

  if (!targetMember) {
    return interaction.reply({
      content: '⚠️ Could not find that brother in the server.',
      ephemeral: true
    });
  }

  const specialty = SPECIALTY_CONFIG.specialties.find(spec => spec.key === specialtyKey);

  if (!specialty) {
    return interaction.reply({
      content: '⚠️ Invalid specialty key.',
      ephemeral: true
    });
  }

  const disabledRows = buildDisabledRowsFromMessage(interaction.message);

  if (action === 'specapprove') {
    await removeAllSpecialtyRoles(targetMember);
    await targetMember.roles.add(specialty.ranks.entry);
    pendingSpecialtyApplications.delete(targetMember.id);

    try {
      await targetMember.send(
        `✅ **High Command has rendered judgment.**\n\n` +
        `Your application for **${specialty.label}** has been **approved**.\n` +
        `You have been admitted at the entry rank of that path.`
      );
    } catch (error) {
      console.error(`Could not DM ${targetMember.user.tag}:`, error);
    }

    await interaction.update({
      content:
        `✅ **Specialty Approved**\n` +
        `Brother <@${targetUserId}> has been approved for **${specialty.label}**.\n` +
        `Assigned Entry Rank: ${specialty.label}\n` +
        `Reviewed by ${interaction.user}.`,
      components: disabledRows
    });

    return;
  }

  if (action === 'specdeny') {
    pendingSpecialtyApplications.delete(targetMember.id);

    try {
      await targetMember.send(
        `⚠️ **High Command has rendered judgment.**\n\n` +
        `Your application for **${specialty.label}** has been **denied** at this time.\n` +
        `Continue your service and stand ready for future review.`
      );
    } catch (error) {
      console.error(`Could not DM ${targetMember.user.tag}:`, error);
    }

    await interaction.update({
      content:
        `⚠️ **Specialty Denied**\n` +
        `Brother <@${targetUserId}> has been denied for **${specialty.label}**.\n` +
        `Reviewed by ${interaction.user}.`,
      components: disabledRows
    });

    return;
  }
}

// ================= HELP BUTTON HUB =================
if (interaction.customId.startsWith('help_')) {
  let embed;

  if (interaction.customId === 'help_general') {
    embed = new EmbedBuilder()
      .setTitle('⚙️ General Guidance')
      .setDescription(
        '`!uniform` - Uniform standards\n' +
        '`!aar` - How to post an AAR\n' +
        '`!ranks` - Rank structure and progression\n' +
        '`!flesh` - Iron Hands doctrine\n' +
        '`!profile` - View your service record\n' +
        '`!points` - View your AAR points'
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (interaction.customId === 'help_progression') {
    embed = new EmbedBuilder()
      .setTitle('⚙️ Progression Guidance')
      .setDescription(
        '`!progression` - View your progression-path record\n\n' +
        'Brothers advance through AAR points, command review, and trial systems.\n' +
        'Higher paths and command roles require judgment by High Command.'
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (interaction.customId === 'help_specialty') {
    embed = new EmbedBuilder()
      .setTitle('⚔️ Specialty Guidance')
      .setDescription(
        'Specialty applications are submitted through the specialty panel.\n\n' +
        '**Requirements:**\n' +
        'Only **Sergeants and above** may apply.\n\n' +
        '**Available Paths:**\n' +
        '• Librarius\n' +
        '• Reclusiam\n' +
        '• Apothecarion\n' +
        '• Armoury'
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (interaction.customId === 'help_admin') {
    if (!hasCommandAuthority(interaction.member)) {
      return interaction.reply({
        content: '⚠️ Command access required.',
        ephemeral: true
      });
    }

    embed = new EmbedBuilder()
      .setTitle('🛡️ Command Tools')
      .setDescription(
        '`!syncallranks` - Rebuild promotion data from Discord roles\n' +
        '`!approve @user` - Approve pending promotion\n' +
        '`!deny @user` - Deny pending promotion\n' +
        '`!settitle @user title` - Set custom title\n' +
        '`!promote @user rank` - Promote\n' +
        '`!demote @user rank` - Demote\n' +
        '`!setpoints @user amount` - Set AAR points\n' +
        '`!addpoints @user amount` - Add AAR points\n' +
        '`!removepoints @user amount` - Remove AAR points\n' +
        '`!setrank @user trackedRank | officialRank` - Set tracked + display rank\n' +
        '`!resetprogression @user` - Reset progression-path state\n' +
        '`!sendpathprompt @user` - Send progression path prompt manually\n' +
        '`!specialtypanel` - Deploy specialty application panel'
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (interaction.customId === 'help_trials') {
    if (!hasCommandAuthority(interaction.member)) {
      return interaction.reply({
        content: '⚠️ Command access required.',
        ephemeral: true
      });
    }

    embed = new EmbedBuilder()
      .setTitle('⚔️ Trial Tools')
      .setDescription(
        '`!fireteamreview @user` - Send Fireteam reassessment prompt\n' +
        '`!sergeantreview @user` - Send Sergeant readiness review buttons\n' +
        '`!championreport @user | overseer rank | class | mode | difficulty | wave | extracted yes/no | extremis kills | success/fail`\n' +
        '`!ancientreport @user | operation | overseer rank | class | difficulty | squad1,squad2,squad3 | noDowns yes/no | geneSeed yes/no | armouryData yes/no | success/fail`'
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}

  // ================= USER PATH SELECTION =================
  if (interaction.customId.startsWith('pathselect:')) {
    const [, pathKey] = interaction.customId.split(':');
    const userId = interaction.user.id;
    const promoData = getUserPromotion(userId);

    if (!Object.values(PATH_KEYS).includes(pathKey)) {
      return interaction.reply({
        content: '⚠️ Unknown path selection.',
        ephemeral: true
      });
    }

    if (!promoData.progressionChoicePending || promoData.pathStatus !== 'awaiting_selection') {
      return interaction.reply({
        content: '⚠️ Your progression choice is not currently awaiting selection.',
        ephemeral: true
      });
    }

    const selectedPathLabel = getPathLabel(pathKey);
    const disabledRows = buildDisabledRowsFromMessage(interaction.message);

    setProgressionChoiceState(userId, {
      progressionChoiceOffered: true,
      progressionChoicePending: false,
      progressionChoiceMade: true,
      selectedPath: selectedPathLabel,
      pathStatus: 'pending_review'
    });

    await interaction.update({
      content:
        `⚙️ **Selection Recorded**\n\n` +
        `You have selected **${selectedPathLabel}**.\n` +
        `Your request has been sent to High Command for judgment.`,
      components: disabledRows
    });

    const highCommandChannel = client.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);
    if (highCommandChannel) {
      const points = getUserXP(userId);

      await highCommandChannel.send({
        content:
          `⚠️ **Path Review Required**\n` +
          `Brother <@${userId}> has selected **${selectedPathLabel}**.\n` +
          `**AAR Points:** ${points}\n` +
          `**Status:** Pending High Command review`,
        components: [buildHighCommandReviewRow(userId, pathKey)]
      });
    }

    return;
  }

  // ================= HIGH COMMAND PATH REVIEW =================
  if (interaction.customId.startsWith('pathreview:')) {
    if (!interaction.guild || !interaction.member) {
      return interaction.reply({
        content: '⚠️ This action may only be used inside the guild.',
        ephemeral: true
      });
    }

    if (!hasCommandAuthority(interaction.member)) {
      return interaction.reply({
        content: '⚠️ Only High Command, Captains, or Lieutenants may review path selections.',
        ephemeral: true
      });
    }

    const [, action, targetUserId, pathKey] = interaction.customId.split(':');

    if (!['approve', 'deny'].includes(action)) {
      return interaction.reply({
        content: '⚠️ Invalid review action.',
        ephemeral: true
      });
    }

    if (!Object.values(PATH_KEYS).includes(pathKey)) {
      return interaction.reply({
        content: '⚠️ Invalid path key.',
        ephemeral: true
      });
    }

    const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        content: '⚠️ Could not find that brother in the server.',
        ephemeral: true
      });
    }

    const promoData = getUserPromotion(targetUserId);
    const expectedPathLabel = getPathLabel(pathKey);

    if (promoData.selectedPath !== expectedPathLabel || promoData.pathStatus !== 'pending_review') {
      return interaction.reply({
        content: '⚠️ This request is no longer pending or no longer matches the stored path.',
        ephemeral: true
      });
    }

    const disabledRows = buildDisabledRowsFromMessage(interaction.message);

if (action === 'approve') {
  const updatePayload = {
    progressionChoiceOffered: true,
    progressionChoicePending: false,
    progressionChoiceMade: true,
    selectedPath: expectedPathLabel,
    pathStatus: pathKey === PATH_KEYS.FIRETEAM ? 'active' : 'approved'
  };

  if (pathKey === PATH_KEYS.FIRETEAM) {
    updatePayload.fireteamData = {
      ...promoData.fireteamData,
      active: true,
      approvedAt: new Date().toISOString(),
      reassessmentDue: false
    };
  }

  if (pathKey === PATH_KEYS.CHAMPION) {
    updatePayload.trialData = {
      ...promoData.trialData,
      champion: {
        ...promoData.trialData.champion,
        active: true,
        status: 'approved',
        attempts: (promoData.trialData.champion.attempts || 0) + 1,
        cooldownUntil: null,
        lastReport: null
      }
    };
  }

  if (pathKey === PATH_KEYS.ANCIENT) {
    updatePayload.trialData = {
      ...promoData.trialData,
      ancient: {
        ...promoData.trialData.ancient,
        active: true,
        status: 'approved',
        attempts: (promoData.trialData.ancient.attempts || 0) + 1,
        operations: {
          Inferno: null,
          Decapitation: null
        }
      }
    };
  }
      
	
	setProgressionChoiceState(targetUserId, updatePayload);

      if (pathKey === PATH_KEYS.FIRETEAM) {
        await syncMemberRankRole(targetMember, 'Fireteam Leader');
      }

      try {
        await targetMember.send(
          `✅ **High Command has rendered judgment.**\n\n` +
          `Your request for **${expectedPathLabel}** has been **approved**.\n` +
          (
            pathKey === PATH_KEYS.FIRETEAM
              ? `You now stand upon the **Fireteam Leader** path.`
              : `Your path has been approved. Trial management is now active.`
          )
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `✅ **Path Approved**\n` +
          `Brother <@${targetUserId}> has been approved for **${expectedPathLabel}**.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }

    if (action === 'deny') {
      setProgressionChoiceState(targetUserId, {
        progressionChoiceOffered: true,
        progressionChoicePending: false,
        progressionChoiceMade: true,
        selectedPath: expectedPathLabel,
        pathStatus: 'denied'
      });

      try {
        await targetMember.send(
          `⚠️ **High Command has rendered judgment.**\n\n` +
          `Your request for **${expectedPathLabel}** has been **denied** at this time.\n` +
          `Continue your service and stand ready for future review.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `⚠️ **Path Denied**\n` +
          `Brother <@${targetUserId}> has been denied for **${expectedPathLabel}**.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }
  }

  // ================= FIRETEAM REASSESSMENT =================
  if (interaction.customId.startsWith('fireteamreassess:')) {
    const [, action, userId] = interaction.customId.split(':');

    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: '⚠️ This reassessment is not assigned to you.',
        ephemeral: true
      });
    }

    const promoData = getUserPromotion(userId);

    if (!promoData.fireteamData.active) {
      return interaction.reply({
        content: '⚠️ You are not currently on the Fireteam Leader path.',
        ephemeral: true
      });
    }

    const disabledRows = buildDisabledRowsFromMessage(interaction.message);

    if (action === FIRETEAM_REVIEW_PATHS.STAY) {
      updateUserPromotion(userId, current => ({
        ...current,
        fireteamData: {
          ...current.fireteamData,
          reassessmentDue: false,
          reassessmentCount: (current.fireteamData.reassessmentCount || 0) + 1
        },
        pathStatus: 'active',
        selectedPath: 'Fireteam Leader'
      }));

      await interaction.update({
        content:
          ` **Fireteam Path Confirmed**\n\n` +
          `You have chosen to remain upon the **Fireteam Leader** path and continue proving yourself.`,
        components: disabledRows
      });

      return;
    }

    let requestedPath = null;

    if (action === FIRETEAM_REVIEW_PATHS.CHAMPION) {
      requestedPath = PATH_KEYS.CHAMPION;
    } else if (action === FIRETEAM_REVIEW_PATHS.ANCIENT) {
      requestedPath = PATH_KEYS.ANCIENT;
    }

    if (!requestedPath) {
      return interaction.reply({
        content: '⚠️ Invalid reassessment action.',
        ephemeral: true
      });
    }

    const selectedPathLabel = getPathLabel(requestedPath);

    setProgressionChoiceState(userId, {
      progressionChoiceOffered: true,
      progressionChoicePending: false,
      progressionChoiceMade: true,
      selectedPath: selectedPathLabel,
      pathStatus: 'pending_review',
      fireteamData: {
        ...promoData.fireteamData,
        reassessmentDue: false,
        reassessmentCount: (promoData.fireteamData.reassessmentCount || 0) + 1
      }
    });

    await interaction.update({
      content:
        ` **Reassessment Recorded**\n\n` +
        `You have requested **${selectedPathLabel}**.\n` +
        `Your request has been sent to High Command for judgment.`,
      components: disabledRows
    });

    const highCommandChannel = client.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);
    if (highCommandChannel) {
      await highCommandChannel.send({
        content:
          `⚠️ **Fireteam Reassessment Review Required**\n` +
          `Brother <@${userId}> has requested **${selectedPathLabel}** during Fireteam reassessment.\n` +
          `**AAR Points:** ${getUserXP(userId)}\n` +
          `**Status:** Pending High Command review`,
        components: [buildHighCommandReviewRow(userId, requestedPath)]
      });
    }

    return;
  }

  // ================= SERGEANT REVIEW =================
  if (interaction.customId.startsWith('sergeantreview:')) {
    if (!interaction.guild || !interaction.member) {
      return interaction.reply({
        content: '⚠️ This action may only be used inside the guild.',
        ephemeral: true
      });
    }

    if (!hasCommandAuthority(interaction.member)) {
      return interaction.reply({
        content: '⚠️ Only High Command, Captains, or Lieutenants may review Sergeant readiness.',
        ephemeral: true
      });
    }

    const [, action, userId] = interaction.customId.split(':');
    const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        content: '⚠️ Could not find that brother in the server.',
        ephemeral: true
      });
    }

    const promoData = getUserPromotion(userId);
    if (!promoData.fireteamData.active) {
      return interaction.reply({
        content: '⚠️ That brother is not currently an active Fireteam Leader.',
        ephemeral: true
      });
    }

    const disabledRows = buildDisabledRowsFromMessage(interaction.message);

    if (action === 'ready') {
      updateUserPromotion(userId, current => ({
        ...current,
        fireteamData: {
          ...current.fireteamData,
          sergeantReviewStatus: 'ready'
        }
      }));

      setApprovalState(userId, 'Sergeant', 'pending');

      try {
        await targetMember.send(
          `✅ **High Command has reviewed your service.**\n\n` +
          `You have been marked **Ready for Sergeant** and now await formal promotion approval.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `✅ **Sergeant Review Complete**\n` +
          `Brother <@${userId}> has been marked **Ready for Sergeant**.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }

   if (action === 'moretime') {
  updateUserPromotion(userId, current => ({
    ...current,
    fireteamData: {
      ...current.fireteamData,
      sergeantReviewStatus: 'needs_more_time'
    }
  }));

  try {
    await targetMember.send(
      `⚠️ **High Command has reviewed your service.**\n\n` +
      `You have been marked as **Needs More Time** upon the Fireteam Leader path. Continue to prove yourself.`
    );
  } catch (error) {
    console.error(`Could not DM ${targetMember.user.tag}:`, error);
  }

  await interaction.update({
    content:
      `⚠️ **Sergeant Review Complete**\n` +
      `Brother <@${userId}> has been marked **Needs More Time**.\n` +
      `Reviewed by ${interaction.user}.`,
    components: disabledRows
  });

  return;
}

 // ================= CHAMPION CHALLENGER =================
if (interaction.customId.startsWith('champchallenger:')) {
  if (!interaction.guild || !interaction.member) {
    return interaction.reply({
      content: '⚠️ This action may only be used inside the guild.',
      ephemeral: true
    });
  }

  if (!hasCommandAuthority(interaction.member)) {
    return interaction.reply({
      content: '⚠️ Only High Command, Captains, or Lieutenants may review Champion challengers.',
      ephemeral: true
    });
  }

  const [, action, userId] = interaction.customId.split(':');
  const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);

  if (!targetMember) {
    return interaction.reply({
      content: '⚠️ Could not find that brother in the server.',
      ephemeral: true
    });
  }

  const promoData = getUserPromotion(userId);
  const disabledRows = buildDisabledRowsFromMessage(interaction.message);

  if (action === 'approve') {
    updateUserPromotion(userId, current => ({
      ...current,
      trialData: {
        ...current.trialData,
        champion: {
          ...current.trialData.champion,
          challengerStatus: 'approved',
          duelPending: true
        }
      }
    }));

    try {
      await targetMember.send(
        `⚔️ **High Command has sanctioned your challenge.**\n\n` +
        `You are now an approved challenger for the mantle of **Company Champion**.`
      );
    } catch (error) {
      console.error(`Could not DM ${targetMember.user.tag}:`, error);
    }

    const highCommandChannel = interaction.guild.channels.cache.get(HIGH_COMMAND_CHANNEL_ID);
    if (highCommandChannel) {
      await highCommandChannel.send({
        content:
          `⚔️ **Champion Duel Resolution Required**\n` +
          `A sanctioned challenger now stands for the title: ${targetMember}\n` +
          `Record the result of the challenge after it is complete.`,
        components: [buildChampionDuelResolutionRow(userId)]
      });
    }

    await interaction.update({
      content:
        `✅ **Champion Challenger Approved**\n` +
        `Brother <@${userId}> has been sanctioned as a challenger.\n` +
        `Reviewed by ${interaction.user}.`,
      components: disabledRows
    });

    return;
  }

  if (action === 'deny') {
    updateUserPromotion(userId, current => ({
      ...current,
      trialData: {
        ...current.trialData,
        champion: {
          ...current.trialData.champion,
          challengerStatus: 'denied',
          duelPending: false
        }
      }
    }));

    try {
      await targetMember.send(
        `⚠️ **High Command has rendered judgment.**\n\n` +
        `Though your Champion trial was passed, you have **not** been sanctioned to challenge for the title at this time.`
      );
    } catch (error) {
      console.error(`Could not DM ${targetMember.user.tag}:`, error);
    }

    await interaction.update({
      content:
        `⚠️ **Champion Challenger Denied**\n` +
        `Brother <@${userId}> has not been sanctioned as a challenger.\n` +
        `Reviewed by ${interaction.user}.`,
      components: disabledRows
    });

    return;
  }

  if (action === 'delay') {
    updateUserPromotion(userId, current => ({
      ...current,
      trialData: {
        ...current.trialData,
        champion: {
          ...current.trialData.champion,
          challengerStatus: 'delayed',
          duelPending: false
        }
      }
    }));

    try {
      await targetMember.send(
        `⚠️ **High Command has delayed your challenge.**\n\n` +
        `Your right to challenge for the mantle of **Company Champion** has been delayed for a later date.`
      );
    } catch (error) {
      console.error(`Could not DM ${targetMember.user.tag}:`, error);
    }

    await interaction.update({
      content:
        `⚠️ **Champion Challenger Delayed**\n` +
        `Brother <@${userId}> remains a pending challenger for a later date.\n` +
        `Reviewed by ${interaction.user}.`,
      components: disabledRows
    });

    return;
  }
}

    if (action === 'deny') {
 updateUserPromotion(userId, current => ({
  ...current,
  trialData: {
    ...current.trialData,
    champion: {
      ...current.trialData.champion,
      challengerStatus: 'delayed',
      duelPending: false
    }
  }
}));

      try {
        await targetMember.send(
          `⚠️ **High Command has rendered judgment.**\n\n` +
          `Though your Champion trial was passed, you have **not** been sanctioned to challenge for the title at this time.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `⚠️ **Champion Challenger Denied**\n` +
          `Brother <@${userId}> has not been sanctioned as a challenger.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }

    if (action === 'delay') {
      updateUserPromotion(userId, current => ({
        ...current,
        trialData: {
          ...current.trialData,
          champion: {
            ...current.trialData.champion,
            challengerStatus: 'delayed',
            duelPending: false
          }
        }
      }));

      try {
        await targetMember.send(
          `⚠️ **High Command has delayed your challenge.**\n\n` +
          `Your Champion challenge has been placed on hold for later review.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `⚠️ **Champion Challenger Delayed**\n` +
          `Brother <@${userId}> has had the challenge delayed.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }
  }

  // ================= CHAMPION DUEL RESOLUTION =================
  if (interaction.customId.startsWith('champduel:')) {
    if (!interaction.guild || !interaction.member) {
      return interaction.reply({
        content: '⚠️ This action may only be used inside the guild.',
        ephemeral: true
      });
    }

    if (!hasCommandAuthority(interaction.member)) {
      return interaction.reply({
        content: '⚠️ Only High Command, Captains, or Lieutenants may resolve Champion duels.',
        ephemeral: true
      });
    }

    const [, result, userId] = interaction.customId.split(':');
    const challenger = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!challenger) {
      return interaction.reply({
        content: '⚠️ Could not find that challenger in the server.',
        ephemeral: true
      });
    }

    const currentChampion = getCurrentRoleHolder(interaction.guild, COMPANY_CHAMPION_ROLE_ID);
    const disabledRows = buildDisabledRowsFromMessage(interaction.message);

    if (result === 'defender') {
      updateUserPromotion(userId, current => ({
        ...current,
        trialData: {
          ...current.trialData,
          champion: {
            ...current.trialData.champion,
            challengerStatus: 'defender_retained',
            duelPending: false
          }
        }
      }));

      try {
        await challenger.send(
          `⚠️ **The duel has been judged.**\n\n` +
          `The defending **Company Champion** has retained the title.`
        );
      } catch (error) {
        console.error(`Could not DM ${challenger.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `⚔️ **Champion Duel Resolved**\n` +
          `The defending Champion has retained the title.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }

    if (result === 'challenger') {
      await awardExclusiveRole(challenger, COMPANY_CHAMPION_ROLE_ID);
      setUserTitle(challenger.id, 'Company Champion');

updateUserPromotion(userId, current => ({
  ...current,
  trialData: {
    ...current.trialData,
    champion: {
      ...current.trialData.champion,
      challengerStatus: 'challenger_won',
      duelPending: false,
      active: false,
      status: 'passed'
    }
  }
}));

      if (currentChampion && currentChampion.id !== challenger.id) {
        setUserTitle(currentChampion.id, null);
      }

      try {
        await challenger.send(
          `⚔️ **The duel has been judged.**\n\n` +
          `You have prevailed and now bear the mantle of **Company Champion**.`
        );
      } catch (error) {
        console.error(`Could not DM ${challenger.user.tag}:`, error);
      }

      const generalChannel = interaction.guild.channels.cache.get(GENERAL_CHANNEL_ID);
      if (generalChannel) {
        await generalChannel.send(
          `⚔️ ${challenger} has claimed the mantle of **Company Champion** through sanctioned challenge.`
        );
      }

      await interaction.update({
        content:
          `✅ **Champion Duel Resolved**\n` +
          `Brother <@${userId}> has become **Company Champion**.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }
  }

  // ================= ANCIENT OCCUPANCY RESOLUTION =================
  if (interaction.customId.startsWith('ancienttitle:')) {
    if (!interaction.guild || !interaction.member) {
      return interaction.reply({
        content: '⚠️ This action may only be used inside the guild.',
        ephemeral: true
      });
    }

    if (!hasCommandAuthority(interaction.member)) {
      return interaction.reply({
        content: '⚠️ Only High Command, Captains, or Lieutenants may decide Ancient title occupancy.',
        ephemeral: true
      });
    }

    const [, action, userId] = interaction.customId.split(':');
    const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        content: '⚠️ Could not find that brother in the server.',
        ephemeral: true
      });
    }

    const disabledRows = buildDisabledRowsFromMessage(interaction.message);

    if (action === 'keep') {
      updateUserPromotion(userId, current => ({
        ...current,
        specialRoles: {
          ...current.specialRoles,
          'Company Ancient': {
            ...current.specialRoles['Company Ancient'],
            status: 'reserve'
          }
        }
      }));

      try {
        await targetMember.send(
          `⚠️ **High Command has rendered judgment.**\n\n` +
          `The current **Company Ancient** remains in office. You have been recognized as qualified, but not appointed at this time.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `⚠️ **Ancient Title Decision Complete**\n` +
          `The current Ancient remains in office.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }

    if (action === 'replace') {
      await awardExclusiveRole(targetMember, COMPANY_ANCIENT_ROLE_ID);
      setUserTitle(targetMember.id, 'Company Ancient');

      updateUserPromotion(userId, current => ({
        ...current,
        specialRoles: {
          ...current.specialRoles,
          'Company Ancient': {
            ...current.specialRoles['Company Ancient'],
            status: 'appointed'
          }
        }
      }));

      try {
        await targetMember.send(
          `🏛️ **High Command has rendered judgment.**\n\n` +
          `You have been appointed as **Company Ancient**.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      const generalChannel = interaction.guild.channels.cache.get(GENERAL_CHANNEL_ID);
      if (generalChannel) {
        await generalChannel.send(
          `🏛️ ${targetMember} has been appointed as **Company Ancient** by decree of High Command.`
        );
      }

      await interaction.update({
        content:
          `✅ **Ancient Title Decision Complete**\n` +
          `Brother <@${userId}> has been appointed as **Company Ancient**.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }

    if (action === 'reserve') {
      updateUserPromotion(userId, current => ({
        ...current,
        specialRoles: {
          ...current.specialRoles,
          'Company Ancient': {
            ...current.specialRoles['Company Ancient'],
            status: 'reserve'
          }
        }
      }));

      try {
        await targetMember.send(
          `🏛️ **High Command has rendered judgment.**\n\n` +
          `You have been marked as a qualified **successor / reserve** for the office of Company Ancient.`
        );
      } catch (error) {
        console.error(`Could not DM ${targetMember.user.tag}:`, error);
      }

      await interaction.update({
        content:
          `⚠️ **Ancient Title Decision Complete**\n` +
          `Brother <@${userId}> has been marked as **Successor / Reserve**.\n` +
          `Reviewed by ${interaction.user}.`,
        components: disabledRows
      });

      return;
    }
  }
});

// ================= MESSAGE HANDLER =================

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;

// ================= ARMORY SUBMISSION FLOW =================

const armorySubmission = getArmorySubmission(message.author.id);

if (armorySubmission) {

  
  if (!message.member) return;

  if (!isArmoryManager(message.member)) {
    clearArmorySubmission(message.author.id);
    return message.reply('⚠️ Your armory submission session has been cleared.');
  }

  if (message.channel.id !== FORGE_CHANNEL_ID) {
    return message.reply(`⚠️ Continue your armory submission in <#${FORGE_CHANNEL_ID}>.`);
  }

  // STEP 1: IMAGE
  if (armorySubmission.step === 'awaiting_image') {
    const attachment = message.attachments.first();

    if (!attachment || !attachment.contentType?.startsWith('image/')) {
      return message.reply(
        '⚠️ Upload a valid image for the armor piece to continue the forge process.'
      );
    }

    armorySubmission.imageUrl = attachment.url;
    armorySubmission.step = 'awaiting_name';

    return message.reply(
      '⚙️ Image received.\n\nWhat is the name of this armor piece?'
    );
  }

  // STEP 2: NAME
  if (armorySubmission.step === 'awaiting_name') {
    const itemName = message.content.trim();

    if (!itemName || itemName.length < 2) {
      return message.reply('⚠️ Enter a valid armor piece name.');
    }

    armorySubmission.itemName = itemName;
    armorySubmission.step = 'awaiting_category';

    return message.reply(
      `⚙️ Name recorded: **${itemName}**\n\n` +
      `Now enter a category from the following list:\n` +
      `${ARMORY_CATEGORIES.map(cat => `• ${cat}`).join('\n')}`
    );
  }

  // STEP 3: CATEGORY
  if (armorySubmission.step === 'awaiting_category') {
    const inputCategory = message.content.trim().toLowerCase();

    const matchedCategory = ARMORY_CATEGORIES.find(
      cat => cat.toLowerCase() === inputCategory
    );

    if (!matchedCategory) {
      return message.reply(
        `⚠️ Invalid category.\nChoose one of:\n${ARMORY_CATEGORIES.map(cat => `• ${cat}`).join('\n')}`
      );
    }

    armorySubmission.category = matchedCategory;
    armorySubmission.step = 'awaiting_price';

    return message.reply(
      `⚙️ Category recorded: **${matchedCategory}**\n\n` +
      `What is the armory data price for this item?`
    );
  }

  // STEP 4: PRICE
  if (armorySubmission.step === 'awaiting_price') {
    const price = parseInt(message.content.trim(), 10);

    if (Number.isNaN(price) || price <= 0) {
      return message.reply('⚠️ Enter a valid price greater than 0.');
    }

    armorySubmission.price = price;
    armorySubmission.step = 'awaiting_stock';

    return message.reply(
      `⚙️ Price recorded: **${price} Armory Data**\n\n` +
      `How many are available in stock?`
    );
  }

  // STEP 5: STOCK
  if (armorySubmission.step === 'awaiting_stock') {
    const stock = parseInt(message.content.trim(), 10);

    if (Number.isNaN(stock) || stock <= 0) {
      return message.reply('⚠️ Enter a valid stock amount greater than 0.');
    }

    armorySubmission.stock = stock;
    armorySubmission.step = 'pending_review';

    return message.reply({
      content: '⚙️ Armory item ready for review.',
      embeds: [buildArmoryReviewEmbed(armorySubmission, message.member)],
      components: [buildArmoryReviewRow(message.author.id)]
    });
  }
}

 // ================= ARMORY PANEL DEPLOY =================
if (message.content === '!armorypanel') {
  if (!message.guild || !message.member) return;

  if (!isArmoryManager(message.member)) {
    return message.reply('⚠️ Only authorized forge staff may deploy the armory panel.');
  }

  if (message.channel.id !== FORGE_CHANNEL_ID) {
    return message.reply(`⚠️ Deploy the armory panel in <#${FORGE_CHANNEL_ID}>.`);
  }

  const pinnedMessages = await message.channel.messages.fetchPinned().catch(() => null);

  if (pinnedMessages) {
    const existingPanel = pinnedMessages.find(msg =>
      msg.author.id === client.user.id &&
      msg.content.includes('Forge Armory Control Panel')
    );

    if (existingPanel) {
      return message.reply('⚠️ An Armory Forge panel is already pinned in this channel.');
    }
  }

  const panelMessage = await message.channel.send({
    content:
      '⚙️ **Forge Armory Control Panel**\n\n' +
      'Authorized brothers may begin the item-forging process below.',
    components: [buildArmoryForgeRow()]
  });

  await panelMessage.pin().catch(err =>
    console.error('Failed to pin armory panel:', err)
  );

  return message.reply('✅ Armory Forge panel deployed and pinned.');
}

// ================= ARMORY DATA CHECK =================
if (message.content === '!armorydata') {
  const balance = getUserArmoryData(message.author.id);

  return message.reply(
    `⚙️ **Armory Data Reserve**\nYou currently possess **${balance} Armory Data**.`
  );
}

  if (message.content === '!ping') {
    return message.reply('Pong!');
  }

  if (message.content === '!flesh') {
    const randomLore = thirstLore[Math.floor(Math.random() * fleshLore.length)];
    return message.reply(randomLore);
  }

if (message.content === '!help') {
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Machine Spirit Guidance Menu')
    .setDescription(
      'Select a category below to view available functions.\n\n' +
      'Basic guidance is available to all brothers.\n' +
      'Command functions are restricted to authorized officers.'
    );

  const rows = [buildBasicHelpRow()];

  if (hasCommandAuthority(message.member)) {
    rows.push(buildAdminHelpRow());
  }

  return message.reply({
    embeds: [embed],
    components: rows
  });
}
  if (message.content === '!uniform') {
    return message.reply(
      ' **Uniform Guidance**\n' +
      `All Brothers must review the uniform standards in <#${UNIFORM_CHANNEL_ID}>.\n` +
      'Ensure your appearance matches chapter regulations before deployment.'
    );
  }

  if (message.content === '!aar') {
    return message.reply(
      '📜 **AAR Instructions**\n\n' +
      '**PvE Operation**\n' +
      'Mission Type: @PVE\n' +
      'Mission:\n' +
      'Difficulty: @Substantial / @Ruthless / @Lethal / @Absolute\n' +
      'Members: @Brother1 @Brother2\n' +
      'Geneseed:\n' +
      'Armory Data:\n' +
      '"Picture of Victory screen and Stats screen"\n\n' +

      '**PvE Siege**\n' +
      'Members: @Brother1 @Brother2\n' +
      'Difficulty: @Normal Siege Mode / @Hard Siege Mode\n' +
      'Waves: 10/20/30\n' +
      '"Picture of Victory screen and Stats screen"\n\n' +

      '**PvE Stratagem**\n' +
      'Difficulty: @Normal Stratagem / @Hard Stratagem\n' +
      'Members: @Brother1 @Brother2\n' +
      'Geneseed:\n' +
      'Armory Data:\n' +
      '"Picture of Victory screen and Stats screen"\n\n' +

      '**PvP Eternal War**\n' +
      'Status: @Victory / @Defeat\n' +
      'Members: @Brother1 @Brother2\n' +
      'Gamemode: Annihilation / Seize Ground / Capture & Control / Helbrute Onslaught\n' +
      '"Picture of Victory Screen"'
    );
  }

  if (message.content === '!ranks') {
    return message.reply(
      '🛡️ **Chapter Rank Structure**\n' +
      `Review the Chapter rank structure in <#${RANKS_CHANNEL_ID}>.\n` +
      'Advance through discipline, service, and AAR contribution.'
    );
  }

  if (message.content === '!points') {
    const points = getUserXP(message.author.id);
    return message.reply(
      `📜 **AAR Record**\n` +
      `${message.author.username}, you currently hold **${points} AAR points**.`
    );
  }

  if (message.content === '!profile') {
    const member = message.member;
    const points = getUserXP(message.author.id);
    const eligibleRank = getRank(points);
    const promoData = getUserPromotion(message.author.id);

    const roles = member.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => role.name)
      .join(', ') || 'No assigned roles';

    const officialRank = promoData.officialRank || 'Not yet recorded';
    const trackedRank = promoData.eligibleRank || eligibleRank.name;
    const title = promoData.title || 'None';
    const pendingApprovalRank = promoData.pendingApprovalRank || 'None';
    const approvalStatus = promoData.approvalStatus || 'None';

    return message.reply(
      `⚙️ **Service Record for ${message.author.username}** ⚙️\n` +
      `**Ranks / Roles:** ${roles}\n` +
      `**AAR Points:** ${points}\n` +
      `**Official Rank:** ${officialRank}\n` +
      `**Tracked Standing:** ${trackedRank}\n` +
      `**Title:** ${title}\n` +
      `**Pending Approval:** ${pendingApprovalRank}\n` +
      `**Approval Status:** ${approvalStatus}`
    );
  }

  if (message.content === '!progression') {
    const promoData = getUserPromotion(message.author.id);

    return message.reply(
      `⚙️ **Progression Path Record for ${message.author.username}** ⚙️\n` +
      `**Choice Offered:** ${promoData.progressionChoiceOffered}\n` +
      `**Choice Pending:** ${promoData.progressionChoicePending}\n` +
      `**Choice Made:** ${promoData.progressionChoiceMade}\n` +
      `**Selected Path:** ${promoData.selectedPath || 'None'}\n` +
      `**Path Status:** ${promoData.pathStatus || 'None'}\n` +
      `**Fireteam Active:** ${promoData.fireteamData.active}\n` +
      `**Sergeant Review Status:** ${promoData.fireteamData.sergeantReviewStatus || 'None'}\n` +
      `**Champion Trial Active:** ${promoData.trialData.champion.active}\n` +
      `**Champion Trial Status:** ${promoData.trialData.champion.status || 'None'}\n` +
      `**Champion Challenger Status:** ${promoData.trialData.champion.challengerStatus || 'None'}\n` +
      `**Ancient Trial Active:** ${promoData.trialData.ancient.active}\n` +
      `**Ancient Trial Status:** ${promoData.trialData.ancient.status || 'None'}\n` +
      `**Ancient Cooldown Until:** ${promoData.trialData.ancient.cooldownUntil || 'None'}`
    );
  }

// ================= TRIAL + AAR CHANNEL SYSTEM =================
if (
  message.channel.id === TRIAL_CHANNEL_ID &&
  message.content.length >= MIN_AAR_LENGTH
) {
  const creditedMembers = getCreditedMembers(message);

  // Require at least 2 people (candidate + overseer)
  if (creditedMembers.length < 2) {
    return message.reply(
      '⚠️ Trial reports must include at least one overseeing brother (Veteran Sergeant or higher).'
    );
  }

  // Prevent duplicate trial logs
  const signature = getAARSignature(message, creditedMembers);
  if (isDuplicateAAR(signature)) {
    return message.reply(
      '⚠️ This trial report has already been recorded in the Chapter archives.'
    );
  }

  storeAAR(signature, message.id);

  // Identify candidate (first mentioned OR author fallback)
  const candidate = creditedMembers[0];
  const promoData = getUserPromotion(candidate.id);

  // Check if they are actually in a trial
  if (
    !promoData.trialData.champion.active &&
    !promoData.trialData.ancient.active
  ) {
    return message.reply(
      '⚠️ This brother does not currently have an active trial.'
    );
  }

  // NO XP GIVEN IN TRIAL CHANNEL
  return message.reply(
    `📜 **Trial Report Logged**\n` +
    `Brother ${candidate} has submitted a **trial report**.\n\n` +
    `⚠️ AAR points are **not awarded** for trial reports.\n` +
    `High Command must review this trial using commands.`
  );
}

// ================= NORMAL AAR SYSTEM =================
if (
  message.channel.id === AAR_CHANNEL_ID &&
  message.content.length >= MIN_AAR_LENGTH
) {
  const creditedMembers = getCreditedMembers(message);
  const signature = getAARSignature(message, creditedMembers);

  if (isDuplicateAAR(signature)) {
    return message.reply(
      '⚠️ This AAR has already been recorded in the Chapter archives. Duplicate reports will not be credited.'
    );
  }

  const aarData = getAARData(message);
  const earnedPoints = aarData.points;

  if (earnedPoints <= 0) {
    return message.reply(
      '⚠️ The Machine Spirit could not determine a valid point value from this AAR. Ensure the correct AAR type and required difficulty or status tags were used.'
    );
  }

  storeAAR(signature, message.id);

  for (const member of creditedMembers) {
    const oldPoints = getUserXP(member.id);
    const oldTrackedRank =
      getUserPromotion(member.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = addUserXP(member.id, earnedPoints);

    await handleRankThresholdChange(
      message.guild,
      member,
      oldTrackedRank,
      oldPoints,
      newTotal
    );
  }

  const creditedList = creditedMembers.map(member => `${member}`).join(', ');
  const aarType = aarData.type;

await message.reply(
  `📜 **AAR Logged**\n` +
  `**Type:** ${aarType}\n` +
  `**Points Awarded:** ${earnedPoints}\n` +
  `**Credited Brothers:** ${creditedList}`
);

return message.reply({
  content:
    `⚙️ **Armory Data Recovery Check**\n` +
    `Select the Armory Data recovered from this mission.`,
  components: [buildArmoryDataRewardRow(message.id)]
});

  // ================= SYNC ALL RANKS =================
  if (message.content === '!syncallranks') {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may run this command.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ This command may only be used in the High Command channel.');
    }

    await message.guild.members.fetch();

    const rebuiltData = {};
    let processed = 0;

    for (const member of message.guild.members.cache.values()) {
      if (member.user.bot) continue;

      const existing = getUserPromotion(member.id);

      const isHighCommand = HIGH_COMMAND_ROLE_IDS.some(roleId =>
        member.roles.cache.has(roleId)
      );

      if (isHighCommand) {
        rebuiltData[member.id] = {
          ...existing,
          eligibleRank: 'High Command',
          officialRank: 'High Command',
          pendingApprovalRank: null,
          approvalStatus: null
        };
        processed++;
        continue;
      }

      let detectedRank = getHighestManagedRankFromMember(member);
      if (!detectedRank) {
        detectedRank = 'Aspirant';
      }

      rebuiltData[member.id] = {
        ...existing,
        eligibleRank: detectedRank,
        officialRank: detectedRank,
        pendingApprovalRank: null,
        approvalStatus: null
      };

      processed++;
    }

    savePromotionData(rebuiltData);

    return message.reply(
      `✅ Rank sync complete.\n` +
      `Processed **${processed} members**.\n` +
      `Promotion data has been rebuilt from Discord roles.`
    );
  }

  // ================= APPROVE COMMAND =================
  if (message.content.startsWith('!approve')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may approve promotions.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Approvals may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !approve @user');
    }

    const promoData = getUserPromotion(target.id);
    const pendingRank = promoData.pendingApprovalRank;

    if (!pendingRank) {
      return message.reply(`⚠️ ${target} has no pending approval rank.`);
    }

    setOfficialRank(target.id, pendingRank);
    clearApprovalState(target.id);
    await syncMemberRankRole(target, pendingRank);

    const points = getUserXP(target.id);
    const rank = rankData.find(r => r.name === pendingRank);

    if (rank) {
      try {
        await target.send(buildPromotionMessage(target, rank, points));
      } catch {
        await message.reply(`⚠️ Could not DM ${target.user.username}.`);
      }
    }

    const channel = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      const template =
        promotionMessages[pendingRank] ||
        '⚔️ {user} has been elevated within the Chapter.';
      await channel.send(template.replace('{user}', `${target}`));
    }

    return message.reply(`✅ ${target} has been approved for **${pendingRank}**.`);
  }

  // ================= DENY COMMAND =================
  if (message.content.startsWith('!deny')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may deny promotions.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Denials may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !deny @user');
    }

    const promoData = getUserPromotion(target.id);
    const pendingRank = promoData.pendingApprovalRank;

    if (!pendingRank) {
      return message.reply(`⚠️ ${target} has no pending approval rank.`);
    }

    setApprovalState(target.id, null, 'denied');

    try {
      await target.send(
        `⚠️ **The Machine Spirit records a denied elevation...**\n\n` +
        `Your advancement to **${pendingRank}** has been denied at this time.\n` +
        `You remain eligible to continue earning AAR points and may be reviewed again in the future.`
      );
    } catch {
      await message.reply(`⚠️ Could not DM ${target.user.username}.`);
    }

    return message.reply(
      `⚠️ ${target} has been denied approval for **${pendingRank}**.\n` +
      `Their progression remains active.`
    );
  }

  // ================= SETTITLE COMMAND =================
  if (message.content.startsWith('!settitle')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may set titles.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Title adjustments may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !settitle @user TitleName');
    }

    const raw = message.content.replace('!settitle', '').trim();
    const withoutMention = raw.replace(/<@!?\d+>/, '').trim();
    const title = withoutMention || null;

    setUserTitle(target.id, title);

    return message.reply(
      `🏛️ ${target} now has the title: **${title || 'None'}**`
    );
  }

  // ================= PROMOTE COMMAND =================
  if (message.content.startsWith('!promote')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may issue promotions.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Promotions may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const rankName = args.slice(2).join(' ');

    if (!target || !rankName) {
      return message.reply('Usage: !promote @user RankName');
    }

    const rank = rankData.find(r => r.name.toLowerCase() === rankName.toLowerCase());

    if (!rank) {
      return message.reply('⚠️ Invalid rank.');
    }

    setEligibleRank(target.id, rank.name);
    setOfficialRank(target.id, rank.name);
    clearApprovalState(target.id);
    await syncMemberRankRole(target, rank.name);

    const points = getUserXP(target.id);

    try {
      await target.send(buildPromotionMessage(target, rank, points));
    } catch {
      await message.reply(`⚠️ Could not DM ${target.user.username}.`);
    }

    const channel = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      const template =
        promotionMessages[rank.name] ||
        '⚔️ {user} has been elevated within the Chapter.';
      await channel.send(template.replace('{user}', `${target}`));
    }

    return message.reply(`✅ ${target} has been promoted to **${rank.name}**.`);
  }

  // ================= DEMOTE COMMAND =================
  if (message.content.startsWith('!demote')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may issue demotions.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Demotions may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const rankName = args.slice(2).join(' ');

    if (!target || !rankName) {
      return message.reply('Usage: !demote @user RankName');
    }

    const rank = rankData.find(r => r.name.toLowerCase() === rankName.toLowerCase());

    if (!rank) {
      return message.reply('⚠️ Invalid rank.');
    }

    setEligibleRank(target.id, rank.name);
    setOfficialRank(target.id, rank.name);
    clearApprovalState(target.id);
    await syncMemberRankRole(target, rank.name);

    try {
      await target.send(
        `⚠️ **The Machine Spirit records a change in standing...**\n\n` +
        `You have been reassigned to the rank of **${rank.name}**.\n` +
        `Reflect, endure, and rise again through service.`
      );
    } catch {
      await message.reply(`⚠️ Could not DM ${target.user.username}.`);
    }

    const channel = message.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (channel) {
      await channel.send(
        `⚠️ ${target} has been reassigned to **${rank.name}** by High Command.`
      );
    }

    return message.reply(`⚠️ ${target} has been demoted to **${rank.name}**.`);
  }

  // ================= SETPOINTS COMMAND =================
  if (message.content.startsWith('!setpoints')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may set AAR points.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ AAR point adjustments may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!target || Number.isNaN(amount) || amount < 0) {
      return message.reply('Usage: !setpoints @user amount');
    }

    const oldPoints = getUserXP(target.id);
    const oldTrackedRank = getUserPromotion(target.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = setUserXP(target.id, amount);

    await handleRankThresholdChange(
      message.guild,
      target,
      oldTrackedRank,
      oldPoints,
      newTotal
    );

    return message.reply(
      `📜 ${target} now holds **${newTotal} AAR points** in the Chapter records.`
    );
  }

  // ================= ADDPOINTS COMMAND =================
  if (message.content.startsWith('!addpoints')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may adjust AAR points.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ AAR point adjustments may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!target || Number.isNaN(amount) || amount < 0) {
      return message.reply('Usage: !addpoints @user amount');
    }

    const oldPoints = getUserXP(target.id);
    const oldTrackedRank = getUserPromotion(target.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = addUserXP(target.id, amount);

    await handleRankThresholdChange(
      message.guild,
      target,
      oldTrackedRank,
      oldPoints,
      newTotal
    );

    return message.reply(
      `📜 ${target} has been granted **${amount} AAR points**.\n` +
      `New total: **${newTotal}**`
    );
  }

  // ================= REMOVEPOINTS COMMAND =================
  if (message.content.startsWith('!removepoints')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may adjust AAR points.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ AAR point adjustments may only be issued in the High Command channel.');
    }

    const args = message.content.split(' ');
    const target = message.mentions.members.first();
    const amount = parseInt(args[2], 10);

    if (!target || Number.isNaN(amount) || amount < 0) {
      return message.reply('Usage: !removepoints @user amount');
    }

    const oldPoints = getUserXP(target.id);
    const oldTrackedRank = getUserPromotion(target.id).eligibleRank || getRank(oldPoints).name;
    const newTotal = removeUserXP(target.id, amount);

    await handleRankThresholdChange(
      message.guild,
      target,
      oldTrackedRank,
      oldPoints,
      newTotal
    );

    return message.reply(
      `📜 ${amount} AAR points have been removed from ${target}.\n` +
      `New total: **${newTotal}**`
    );
  }

  // ================= SETRANK COMMAND =================
  if (message.content.startsWith('!setrank')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may set ranks.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Rank adjustments may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !setrank @user trackedRank | officialRank');
    }

    const raw = message.content.replace('!setrank', '').trim();
    const withoutMention = raw.replace(/<@!?\d+>/, '').trim();
    const parts = withoutMention.split('|').map(part => part.trim());

    if (parts.length < 1 || !parts[0]) {
      return message.reply('Usage: !setrank @user trackedRank | officialRank');
    }

    const trackedRank = parts[0];
    const officialRank = parts[1] || parts[0];

    const validTrackedRank = rankData.find(
      r => r.name.toLowerCase() === trackedRank.toLowerCase()
    );

    if (!validTrackedRank) {
      return message.reply('⚠️ Invalid tracked rank.');
    }

    setEligibleRank(target.id, validTrackedRank.name);
    setOfficialRank(target.id, officialRank);
    clearApprovalState(target.id);
    await syncMemberRankRole(target, validTrackedRank.name);

    return message.reply(
      `🛡️ ${target} now has:\n` +
      `**Tracked Standing:** ${validTrackedRank.name}\n` +
      `**Official Rank:** ${officialRank}`
    );
  }

  // ================= PHASE 3 COMMANDS =================

  if (message.content.startsWith('!fireteamreview')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may send Fireteam review prompts.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Fireteam review prompts may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('Usage: !fireteamreview @user');
    }

    const promoData = getUserPromotion(target.id);
    if (!promoData.fireteamData.active) {
      return message.reply(`⚠️ ${target} is not currently an active Fireteam Leader.`);
    }

    updateUserPromotion(target.id, current => ({
      ...current,
      fireteamData: {
        ...current.fireteamData,
        reassessmentDue: true
      }
    }));

    try {
      await target.send({
        content:
          ` **Fireteam Reassessment**\n\n` +
          `Brother, time has passed and your service as **Fireteam Leader** is once again under review.\n` +
          `Do you wish to remain upon this path, or do you seek Company Champion or Company Ancient trials?`,
        components: [buildFireteamReassessmentRow(target.id)]
      });
    } catch (error) {
      console.error(`Could not DM ${target.user.tag}:`, error);
      return message.reply(`⚠️ Could not DM ${target.user.username}.`);
    }

    return message.reply(`✅ Fireteam reassessment prompt sent to ${target}.`);
  }

  if (message.content.startsWith('!sergeantreview')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may issue Sergeant reviews.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Sergeant reviews may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('Usage: !sergeantreview @user');
    }

    const promoData = getUserPromotion(target.id);
    if (!promoData.fireteamData.active) {
      return message.reply(`⚠️ ${target} is not currently an active Fireteam Leader.`);
    }

    return message.reply({
      content:
        `⚠️ **Sergeant Readiness Review**\n` +
        `Review the Fireteam service of ${target} and determine if he is ready for promotion.`,
      components: [buildSergeantReviewRow(target.id)]
    });
  }

  if (message.content.startsWith('!championreport')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may submit Champion trial reports.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Champion trial reports may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply(
        'Usage: !championreport @user | overseer rank | class | mode | difficulty | wave | extracted yes/no | extremis kills | success/fail'
      );
    }

    const raw = message.content.replace('!championreport', '').trim();
    const withoutMention = raw.replace(/<@!?\d+>/, '').trim();
    const parts = withoutMention.split('|').map(part => part.trim());

    if (parts.length < 8) {
      return message.reply(
        'Usage: !championreport @user | overseer rank | class | mode | difficulty | wave | extracted yes/no | extremis kills | success/fail'
      );
    }

    const [overseerRank, classUsed, mode, difficulty, waveText, extractedText, extremisText, successText] = parts;
    const wave = parseInt(waveText, 10);
    const extracted = parseYesNo(extractedText);
    const extremisKills = parseInt(extremisText, 10);
    const success = parseYesNo(successText);

    const promoData = getUserPromotion(target.id);
    if (!promoData.trialData.champion.active) {
      return message.reply(`⚠️ ${target} does not currently have an active Company Champion trial.`);
    }

    const valid =
      isChampionOverseerRankValid(overseerRank) &&
      classUsed.toLowerCase() === 'bulwark' &&
      mode.toLowerCase() === 'siege' &&
      difficulty.toLowerCase() === 'hard' &&
      !Number.isNaN(wave) &&
      wave >= 15 &&
      extracted === true &&
      !Number.isNaN(extremisKills) &&
      extremisKills >= 40 &&
      success === true;

    if (!valid) {
      updateUserPromotion(target.id, current => ({
        ...current,
        trialData: {
          ...current.trialData,
          champion: {
            ...current.trialData.champion,
            active: false,
            status: 'failed',
            lastReport: {
              overseerRank,
              classUsed,
              mode,
              difficulty,
              wave,
              extracted,
              extremisKills,
              success,
              submittedAt: new Date().toISOString(),
              channelId: message.channel.id
            }
          }
        }
      }));

      return message.reply(
        `⚠️ **Champion Trial Failed**\n` +
        `${target} did not satisfy the required conditions for the Company Champion trial.\n` +
        `No cooldown applies. The trial may be attempted again immediately.`
      );
    }

    updateUserPromotion(target.id, current => ({
      ...current,
      trialData: {
        ...current.trialData,
        champion: {
          ...current.trialData.champion,
          active: false,
          status: 'passed',
          lastReport: {
            overseerRank,
            classUsed,
            mode,
            difficulty,
            wave,
            extracted,
            extremisKills,
            success,
            submittedAt: new Date().toISOString(),
            channelId: message.channel.id
          }
        }
      }
    }));

    await notifyChampionTitleResolution(message.guild, target);
    return message.reply(
      `✅ **Champion Trial Passed**\n` +
      `${target} satisfied all Company Champion trial requirements.`
    );
  }

  if (message.content.startsWith('!ancientreport')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may submit Ancient trial reports.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Ancient trial reports may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply(
        'Usage: !ancientreport @user | operation | overseer rank | class | difficulty | squad1,squad2,squad3 | noDowns yes/no | geneSeed yes/no | armouryData yes/no | success/fail'
      );
    }

    const raw = message.content.replace('!ancientreport', '').trim();
    const withoutMention = raw.replace(/<@!?\d+>/, '').trim();
    const parts = withoutMention.split('|').map(part => part.trim());

    if (parts.length < 9) {
      return message.reply(
        'Usage: !ancientreport @user | operation | overseer rank | class | difficulty | squad1,squad2,squad3 | noDowns yes/no | geneSeed yes/no | armouryData yes/no | success/fail'
      );
    }

    const [
      operation,
      overseerRank,
      classUsed,
      difficulty,
      squadRaw,
      noDownsText,
      geneSeedText,
      armouryDataText,
      successText
    ] = parts;

    const normalizedOperation =
      operation.toLowerCase() === 'inferno'
        ? 'Inferno'
        : operation.toLowerCase() === 'decapitation'
          ? 'Decapitation'
          : null;

    if (!normalizedOperation) {
      return message.reply('⚠️ Operation must be Inferno or Decapitation.');
    }

    const noDowns = parseYesNo(noDownsText);
    const geneSeed = parseYesNo(geneSeedText);
    const armouryData = parseYesNo(armouryDataText);
    const success = parseYesNo(successText);
    const squad = normalizeSquadList(squadRaw);

    const promoData = getUserPromotion(target.id);
    if (!promoData.trialData.ancient.active) {
      return message.reply(`⚠️ ${target} does not currently have an active Company Ancient trial.`);
    }

    const operationPassed =
      isAncientOverseerRankValid(overseerRank) &&
      classUsed.toLowerCase() === 'bulwark' &&
      difficulty.toLowerCase() === 'lethal' &&
      squad.length > 0 &&
      noDowns === true &&
      geneSeed === true &&
      armouryData === true &&
      success === true;

    if (!operationPassed) {
      const cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      updateUserPromotion(target.id, current => ({
        ...current,
        trialData: {
          ...current.trialData,
          ancient: {
            ...current.trialData.ancient,
            active: false,
            status: 'failed',
            cooldownUntil,
            operations: {
              ...current.trialData.ancient.operations,
              [normalizedOperation]: {
                overseerRank,
                classUsed,
                difficulty,
                squad,
                noDowns,
                geneSeed,
                armouryData,
                success,
                submittedAt: new Date().toISOString()
              }
            }
          }
        }
      }));

      return message.reply(
        `⚠️ **Ancient Trial Failed**\n` +
        `${target} failed the **${normalizedOperation}** operation requirements.\n` +
        `A 24-hour cooldown has been applied until **${formatDateTime(cooldownUntil)}**.`
      );
    }

    updateUserPromotion(target.id, current => ({
      ...current,
      trialData: {
        ...current.trialData,
        ancient: {
          ...current.trialData.ancient,
          operations: {
            ...current.trialData.ancient.operations,
            [normalizedOperation]: {
              overseerRank,
              classUsed,
              difficulty,
              squad,
              noDowns,
              geneSeed,
              armouryData,
              success,
              submittedAt: new Date().toISOString()
            }
          }
        }
      }
    }));

    const refreshed = getUserPromotion(target.id);
    const inferno = refreshed.trialData.ancient.operations.Inferno;
    const decapitation = refreshed.trialData.ancient.operations.Decapitation;

    if (!inferno || !decapitation) {
      return message.reply(
        `📜 **Ancient Trial Operation Logged**\n` +
        `${target} has completed **${normalizedOperation}** successfully.\n` +
        `Awaiting the remaining required operation.`
      );
    }

    if (!sameSquad(inferno.squad, decapitation.squad)) {
      const cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      updateUserPromotion(target.id, current => ({
        ...current,
        trialData: {
          ...current.trialData,
          ancient: {
            ...current.trialData.ancient,
            active: false,
            status: 'failed',
            cooldownUntil
          }
        }
      }));

      return message.reply(
        `⚠️ **Ancient Trial Failed**\n` +
        `${target} did not use the same squad for Inferno and Decapitation.\n` +
        `A 24-hour cooldown has been applied until **${formatDateTime(cooldownUntil)}**.`
      );
    }

    updateUserPromotion(target.id, current => ({
      ...current,
      trialData: {
        ...current.trialData,
        ancient: {
          ...current.trialData.ancient,
          active: false,
          status: 'passed',
          cooldownUntil: null
        }
      }
    }));

    await notifyAncientTitleDecision(message.guild, target);
    return message.reply(
      `✅ **Ancient Trial Passed**\n` +
      `${target} satisfied all Ancient trial requirements.`
    );
  }

  // ================= RESET / TEST COMMANDS =================
  if (message.content.startsWith('!resetprogression')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may reset progression state.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Progression resets may only be issued in the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !resetprogression @user');
    }

    resetProgressionChoiceState(target.id);

    return message.reply(
      `✅ ${target} progression-path state has been reset.\n` +
      `They may trigger the Fireteam threshold flow again when appropriate.`
    );
  }

   if (message.content.startsWith('!sendpathprompt')) {
    if (!hasCommandAuthority(message.member)) {
      return message.reply('⚠️ Only High Command, Captains, or Lieutenants may send path prompts.');
    }

    if (message.channel.id !== HIGH_COMMAND_CHANNEL_ID) {
      return message.reply('⚠️ Path prompts may only be issued from the High Command channel.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: !sendpathprompt @user');
    }

    const points = getUserXP(target.id);

    await sendFireteamChoicePrompt(message.guild, target, points);

    return message.reply(
      `✅ Fireteam progression path prompt has been sent to ${target}.`
    );
  }

if (message.content === '!specialtypanel') {
  if (!hasCommandAuthority(message.member)) {
    return message.reply('⚠️ High Command only.');
  }

  if (message.channel.id !== SPECIALTY_CONFIG.channelId) {
    return message.reply('⚠️ This panel may only be deployed in the specialty channel.');
  }

  const row = new ActionRowBuilder().addComponents(
    SPECIALTY_CONFIG.specialties.map(spec =>
      new ButtonBuilder()
        .setCustomId(spec.buttonId)
        .setLabel(spec.label)
        .setStyle(ButtonStyle.Primary)
    )
  );

  const panelMessage = await message.channel.send({
    content:
      '**⚔️ Select Your Specialty Path ⚔️**\n\n' +
      'Only **Sergeants and above** may apply.\n' +
      'All applications are reviewed by High Command.',
    components: [row]
  });

  try {
    await panelMessage.pin();
  } catch (err) {
    console.error('Failed to pin specialty panel:', err);
  }

  return message.reply('✅ Specialty panel deployed and pinned.');
}

// ================= XP ADJUSTMENT =================
if (message.content.startsWith('!adjustxp')) {

  if (!hasCommandAuthority(message.member)) {
    return message.reply('⚠️ You are not authorized to adjust progression points.');
  }

  const args = message.content.split(' ');
  const target = message.mentions.members.first();
  const amount = parseFloat(args[2]);

  if (!target || isNaN(amount)) {
    return message.reply(
      '⚠️ Usage: `!adjustxp @user amount`'
    );
  }

  const oldXP = getUserXP(target.id);
  const newXP = addUserXP(target.id, amount);

  await handleRankThresholdChange(
    message.guild,
    target,
    getRank(oldXP).name,
    oldXP,
    newXP
  );

  return message.reply(
    `⚙️ Adjusted ${target}'s progression by ${amount} points.\n` +
    `New Total: ${newXP}`
  );
}

}

});

client.login(process.env.TOKEN);
