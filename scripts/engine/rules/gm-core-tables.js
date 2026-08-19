const LEVEL_MIN = -1;
const LEVEL_MAX = 24;
const LEVELS = Array.from({ length: LEVEL_MAX - LEVEL_MIN + 1 }, (_, i) => i + LEVEL_MIN);
const table = (rows) => Object.fromEntries(LEVELS.map((level, i) => [level, rows[i]]));
export const GM_CORE_LEVEL_MIN = LEVEL_MIN;
export const GM_CORE_LEVEL_MAX = LEVEL_MAX;
export const ATTRIBUTE_MODIFIERS = table([
{extreme:null,high:3,average:2,low:0},{extreme:null,high:3,average:2,low:0},{extreme:5,high:4,average:3,low:1},{extreme:5,high:4,average:3,low:1},{extreme:5,high:4,average:3,low:1},{extreme:6,high:5,average:3,low:2},{extreme:6,high:5,average:4,low:2},{extreme:7,high:5,average:4,low:2},{extreme:7,high:6,average:4,low:2},{extreme:7,high:6,average:4,low:3},{extreme:7,high:6,average:4,low:3},{extreme:8,high:7,average:5,low:3},{extreme:8,high:7,average:5,low:3},{extreme:8,high:7,average:5,low:4},{extreme:9,high:8,average:5,low:4},{extreme:9,high:8,average:5,low:4},{extreme:9,high:8,average:6,low:4},{extreme:10,high:9,average:6,low:5},{extreme:10,high:9,average:6,low:5},{extreme:10,high:9,average:6,low:5},{extreme:11,high:10,average:6,low:5},{extreme:11,high:10,average:7,low:6},{extreme:11,high:10,average:7,low:6},{extreme:11,high:10,average:8,low:6},{extreme:11,high:10,average:8,low:6},{extreme:13,high:12,average:9,low:7}]);
export const PERCEPTION = table([
{extreme:9,high:8,average:5,low:2,terrible:0},{extreme:10,high:9,average:6,low:3,terrible:1},{extreme:11,high:10,average:7,low:4,terrible:2},{extreme:12,high:11,average:8,low:5,terrible:3},{extreme:14,high:12,average:9,low:6,terrible:4},{extreme:15,high:14,average:11,low:8,terrible:6},{extreme:17,high:15,average:12,low:9,terrible:7},{extreme:18,high:17,average:14,low:11,terrible:8},{extreme:20,high:18,average:15,low:12,terrible:10},{extreme:21,high:19,average:16,low:13,terrible:11},{extreme:23,high:21,average:18,low:15,terrible:12},{extreme:24,high:22,average:19,low:16,terrible:14},{extreme:26,high:24,average:21,low:18,terrible:15},{extreme:27,high:25,average:22,low:19,terrible:16},{extreme:29,high:26,average:23,low:20,terrible:18},{extreme:30,high:28,average:25,low:22,terrible:19},{extreme:32,high:29,average:26,low:23,terrible:20},{extreme:33,high:30,average:28,low:25,terrible:22},{extreme:35,high:32,average:29,low:26,terrible:23},{extreme:36,high:33,average:30,low:27,terrible:24},{extreme:38,high:35,average:32,low:29,terrible:26},{extreme:39,high:36,average:33,low:30,terrible:27},{extreme:41,high:38,average:35,low:32,terrible:28},{extreme:43,high:39,average:36,low:33,terrible:30},{extreme:44,high:40,average:37,low:34,terrible:31},{extreme:46,high:42,average:38,low:36,terrible:32}]);
export const SKILLS = table([
{extreme:8,high:5,average:4,low:[2,1]},{extreme:9,high:6,average:5,low:[3,2]},{extreme:10,high:7,average:6,low:[4,3]},{extreme:11,high:8,average:7,low:[5,4]},{extreme:13,high:10,average:9,low:[7,5]},{extreme:15,high:12,average:10,low:[8,7]},{extreme:16,high:13,average:12,low:[10,8]},{extreme:18,high:15,average:13,low:[11,9]},{extreme:20,high:17,average:15,low:[13,11]},{extreme:21,high:18,average:16,low:[14,12]},{extreme:23,high:20,average:18,low:[16,13]},{extreme:25,high:22,average:19,low:[17,15]},{extreme:26,high:23,average:21,low:[19,16]},{extreme:28,high:25,average:22,low:[20,17]},{extreme:30,high:27,average:24,low:[22,19]},{extreme:31,high:28,average:25,low:[23,20]},{extreme:33,high:30,average:27,low:[25,21]},{extreme:35,high:32,average:28,low:[26,23]},{extreme:36,high:33,average:30,low:[28,24]},{extreme:38,high:35,average:31,low:[29,25]},{extreme:40,high:37,average:33,low:[31,27]},{extreme:41,high:38,average:34,low:[32,28]},{extreme:43,high:40,average:36,low:[34,29]},{extreme:45,high:42,average:37,low:[35,31]},{extreme:46,high:43,average:38,low:[36,32]},{extreme:48,high:45,average:40,low:[38,33]}]);
export const AC = table([
{extreme:18,high:15,average:14,low:12},{extreme:19,high:16,average:15,low:13},{extreme:19,high:16,average:15,low:13},{extreme:21,high:18,average:17,low:15},{extreme:22,high:19,average:18,low:16},{extreme:24,high:21,average:20,low:18},{extreme:25,high:22,average:21,low:19},{extreme:27,high:24,average:23,low:21},{extreme:28,high:25,average:24,low:22},{extreme:30,high:27,average:26,low:24},{extreme:31,high:28,average:27,low:25},{extreme:33,high:30,average:29,low:27},{extreme:34,high:31,average:30,low:28},{extreme:36,high:33,average:32,low:30},{extreme:37,high:34,average:33,low:31},{extreme:39,high:36,average:35,low:33},{extreme:40,high:37,average:36,low:34},{extreme:42,high:39,average:38,low:36},{extreme:43,high:40,average:39,low:37},{extreme:45,high:42,average:41,low:39},{extreme:46,high:43,average:42,low:40},{extreme:48,high:45,average:44,low:42},{extreme:49,high:46,average:45,low:43},{extreme:51,high:48,average:47,low:45},{extreme:52,high:49,average:48,low:46},{extreme:54,high:51,average:50,low:48}]);

export const ATTACK_BONUS = table([
{extreme:10,high:8,average:6,low:4},{extreme:10,high:8,average:6,low:4},{extreme:11,high:9,average:7,low:5},{extreme:13,high:11,average:9,low:7},{extreme:14,high:12,average:10,low:8},{extreme:16,high:14,average:12,low:9},{extreme:17,high:15,average:13,low:11},{extreme:19,high:17,average:15,low:12},{extreme:20,high:18,average:16,low:13},{extreme:22,high:20,average:18,low:15},{extreme:23,high:21,average:19,low:16},{extreme:25,high:23,average:21,low:17},{extreme:27,high:24,average:22,low:19},{extreme:28,high:26,average:24,low:20},{extreme:29,high:27,average:25,low:21},{extreme:31,high:29,average:27,low:23},{extreme:32,high:30,average:28,low:24},{extreme:34,high:32,average:30,low:25},{extreme:35,high:33,average:31,low:27},{extreme:37,high:35,average:33,low:28},{extreme:38,high:36,average:34,low:29},{extreme:40,high:38,average:36,low:31},{extreme:41,high:39,average:37,low:32},{extreme:43,high:41,average:39,low:33},{extreme:44,high:42,average:40,low:35},{extreme:46,high:44,average:42,low:36}]);

export const SAVES = PERCEPTION;
export const HP = table([
{high:[9,9],average:[8,7],low:[6,5]},{high:[20,17],average:[16,14],low:[13,11]},{high:[26,24],average:[21,19],low:[16,14]},{high:[40,36],average:[32,28],low:[25,21]},{high:[59,53],average:[48,42],low:[37,31]},{high:[78,72],average:[63,57],low:[48,42]},{high:[97,91],average:[78,72],low:[59,53]},{high:[123,115],average:[99,91],low:[75,67]},{high:[148,140],average:[119,111],low:[90,82]},{high:[173,165],average:[139,131],low:[105,97]},{high:[198,190],average:[159,151],low:[120,112]},{high:[223,215],average:[179,171],low:[135,127]},{high:[248,240],average:[199,191],low:[150,142]},{high:[273,265],average:[219,211],low:[165,157]},{high:[298,290],average:[239,231],low:[180,172]},{high:[323,315],average:[259,251],low:[195,187]},{high:[348,340],average:[279,271],low:[210,202]},{high:[373,365],average:[299,291],low:[225,217]},{high:[398,390],average:[319,311],low:[240,232]},{high:[423,415],average:[339,331],low:[255,247]},{high:[448,440],average:[359,351],low:[270,262]},{high:[473,465],average:[379,371],low:[285,277]},{high:[505,495],average:[405,395],low:[305,295]},{high:[544,532],average:[436,424],low:[329,317]},{high:[581,569],average:[466,454],low:[351,339]},{high:[633,617],average:[508,492],low:[383,367]}]);
export function ruleValue(ruleTable, level, tier, { lowPick = "high", fallbackTier = "average" } = {}) {
 const row=ruleTable[level]; if(!row) throw new RangeError(`No GM Core benchmark row for level ${level}`);
 let value=row[tier]; if(value==null&&tier==="extreme") value=row.high; if(value==null) value=row[fallbackTier];
 if(Array.isArray(value)) return lowPick==="low"?value[1]:value[0]; return value;
}
export const midpoint=(range)=>Array.isArray(range)?Math.round((Number(range[0])+Number(range[1]))/2):(Number(range)||0);

// GM Core: Creature Building, Strike Damage (levels -1 through 24).
// `formula` is the printed benchmark expression. `average` is the listed expected damage.
const damageRow = (extreme, high, average, low) => ({ extreme, high, average, low });
const damageEntry = (formula, average) => Object.freeze({ formula, average });
export const STRIKE_DAMAGE = table([
  damageRow(damageEntry("1d6+1",4), damageEntry("1d4+1",3), damageEntry("1d4",3), damageEntry("1d4",2)),
  damageRow(damageEntry("1d6+3",6), damageEntry("1d6+2",5), damageEntry("1d4+2",4), damageEntry("1d4+1",3)),
  damageRow(damageEntry("1d8+4",8), damageEntry("1d6+3",6), damageEntry("1d6+2",5), damageEntry("1d4+2",4)),
  damageRow(damageEntry("1d12+4",11), damageEntry("1d10+4",9), damageEntry("1d8+4",8), damageEntry("1d6+3",6)),
  damageRow(damageEntry("1d12+8",15), damageEntry("1d10+6",12), damageEntry("1d8+6",10), damageEntry("1d6+5",8)),
  damageRow(damageEntry("2d10+7",18), damageEntry("2d8+5",14), damageEntry("2d6+5",12), damageEntry("2d4+4",9)),
  damageRow(damageEntry("2d12+7",20), damageEntry("2d8+7",16), damageEntry("2d6+6",13), damageEntry("2d4+6",11)),
  damageRow(damageEntry("2d12+10",23), damageEntry("2d8+9",18), damageEntry("2d6+8",15), damageEntry("2d4+7",12)),
  damageRow(damageEntry("2d12+12",25), damageEntry("2d10+9",20), damageEntry("2d8+8",17), damageEntry("2d6+6",13)),
  damageRow(damageEntry("2d12+15",28), damageEntry("2d10+11",22), damageEntry("2d8+9",18), damageEntry("2d6+8",15)),
  damageRow(damageEntry("2d12+17",30), damageEntry("2d10+13",24), damageEntry("2d8+11",20), damageEntry("2d6+9",16)),
  damageRow(damageEntry("2d12+20",33), damageEntry("2d12+13",26), damageEntry("2d10+11",22), damageEntry("2d6+10",17)),
  damageRow(damageEntry("2d12+22",35), damageEntry("2d12+15",28), damageEntry("2d10+12",23), damageEntry("2d8+10",19)),
  damageRow(damageEntry("3d12+19",38), damageEntry("3d10+14",30), damageEntry("3d8+12",25), damageEntry("3d6+10",20)),
  damageRow(damageEntry("3d12+21",40), damageEntry("3d10+16",32), damageEntry("3d8+14",27), damageEntry("3d6+11",21)),
  damageRow(damageEntry("3d12+24",43), damageEntry("3d10+18",34), damageEntry("3d8+15",28), damageEntry("3d6+13",23)),
  damageRow(damageEntry("3d12+26",45), damageEntry("3d12+17",36), damageEntry("3d10+14",30), damageEntry("3d6+14",24)),
  damageRow(damageEntry("3d12+29",48), damageEntry("3d12+18",37), damageEntry("3d10+15",31), damageEntry("3d6+15",25)),
  damageRow(damageEntry("3d12+31",50), damageEntry("3d12+19",38), damageEntry("3d10+16",32), damageEntry("3d6+16",26)),
  damageRow(damageEntry("3d12+34",53), damageEntry("3d12+20",40), damageEntry("3d10+17",33), damageEntry("3d6+17",27)),
  damageRow(damageEntry("4d12+29",55), damageEntry("4d10+20",42), damageEntry("4d8+17",35), damageEntry("4d6+14",28)),
  damageRow(damageEntry("4d12+32",58), damageEntry("4d10+22",44), damageEntry("4d8+19",37), damageEntry("4d6+15",29)),
  damageRow(damageEntry("4d12+34",60), damageEntry("4d10+24",46), damageEntry("4d8+20",38), damageEntry("4d6+17",31)),
  damageRow(damageEntry("4d12+37",63), damageEntry("4d10+26",48), damageEntry("4d8+22",40), damageEntry("4d6+18",32)),
  damageRow(damageEntry("4d12+39",65), damageEntry("4d12+24",50), damageEntry("4d10+20",42), damageEntry("4d6+20",34)),
  damageRow(damageEntry("4d12+42",68), damageEntry("4d12+26",52), damageEntry("4d10+22",44), damageEntry("4d6+21",35))
]);

const DIE_AVERAGES = Object.freeze({ d4: 2.5, d6: 3.5, d8: 4.5, d10: 5.5, d12: 6.5 });
const DAMAGE_TIERS = Object.freeze(["low", "average", "high", "extreme"]);
export function weakerDamageTier(tier = "average", steps = 1) {
  const index = Math.max(0, DAMAGE_TIERS.indexOf(tier));
  return DAMAGE_TIERS[Math.max(0, index - Math.max(0, Number(steps) || 0))];
}
export function strikeDamageBenchmark(level, tier = "average") {
  const row = STRIKE_DAMAGE[level];
  if (!row) throw new RangeError(`No GM Core strike damage row for level ${level}`);
  return row[tier] ?? row.average;
}
export function formulaAverage(formula = "") {
  const match = String(formula).trim().match(/^(\d+)d(4|6|8|10|12)(?:\+(-?\d+))?$/i);
  if (!match) return null;
  return Number(match[1]) * DIE_AVERAGES[`d${match[2]}`] + Number(match[3] ?? 0);
}
export function weaponScaledDamageFormula({ level, tier = "average", die = "d6" } = {}) {
  const benchmark = strikeDamageBenchmark(level, tier);
  const dieAverage = DIE_AVERAGES[die] ?? DIE_AVERAGES.d6;
  // GM Core recommends roughly half the strike damage from dice and half from the flat modifier.
  // Preserve the actual weapon die while aiming at the benchmark's listed average damage.
  const dice = Math.max(1, Math.round((benchmark.average / 2) / dieAverage));
  const modifier = Math.max(0, Math.round(benchmark.average - (dice * dieAverage)));
  return {
    formula: `${dice}${die}${modifier ? `+${modifier}` : ""}`,
    dice,
    die,
    modifier,
    tier,
    expectedAverage: benchmark.average,
    actualAverage: dice * dieAverage + modifier,
    benchmarkFormula: benchmark.formula
  };
}


export const SPELLCASTING_BENCHMARKS = Object.freeze({
  "-1": { extreme:{dc:19,attack:11}, high:{dc:16,attack:8}, average:{dc:13,attack:5} },
  "0": { extreme:{dc:19,attack:11}, high:{dc:16,attack:8}, average:{dc:13,attack:5} },
  "1": { extreme:{dc:20,attack:12}, high:{dc:17,attack:9}, average:{dc:14,attack:6} },
  "2": { extreme:{dc:22,attack:14}, high:{dc:18,attack:10}, average:{dc:15,attack:7} },
  "3": { extreme:{dc:23,attack:15}, high:{dc:20,attack:12}, average:{dc:17,attack:9} },
  "4": { extreme:{dc:25,attack:17}, high:{dc:21,attack:13}, average:{dc:18,attack:10} },
  "5": { extreme:{dc:26,attack:18}, high:{dc:22,attack:14}, average:{dc:19,attack:11} },
  "6": { extreme:{dc:27,attack:19}, high:{dc:24,attack:16}, average:{dc:21,attack:13} },
  "7": { extreme:{dc:29,attack:21}, high:{dc:25,attack:17}, average:{dc:22,attack:14} },
  "8": { extreme:{dc:30,attack:22}, high:{dc:26,attack:18}, average:{dc:23,attack:15} },
  "9": { extreme:{dc:32,attack:24}, high:{dc:28,attack:20}, average:{dc:25,attack:17} },
  "10": { extreme:{dc:33,attack:25}, high:{dc:29,attack:21}, average:{dc:26,attack:18} },
  "11": { extreme:{dc:34,attack:26}, high:{dc:30,attack:22}, average:{dc:27,attack:19} },
  "12": { extreme:{dc:36,attack:28}, high:{dc:32,attack:24}, average:{dc:29,attack:21} },
  "13": { extreme:{dc:37,attack:29}, high:{dc:33,attack:25}, average:{dc:30,attack:22} },
  "14": { extreme:{dc:39,attack:31}, high:{dc:34,attack:26}, average:{dc:31,attack:23} },
  "15": { extreme:{dc:40,attack:32}, high:{dc:36,attack:28}, average:{dc:33,attack:25} },
  "16": { extreme:{dc:41,attack:33}, high:{dc:37,attack:29}, average:{dc:34,attack:26} },
  "17": { extreme:{dc:43,attack:35}, high:{dc:38,attack:30}, average:{dc:35,attack:27} },
  "18": { extreme:{dc:44,attack:36}, high:{dc:40,attack:32}, average:{dc:37,attack:29} },
  "19": { extreme:{dc:46,attack:38}, high:{dc:41,attack:33}, average:{dc:38,attack:30} },
  "20": { extreme:{dc:47,attack:39}, high:{dc:42,attack:34}, average:{dc:39,attack:31} },
  "21": { extreme:{dc:48,attack:40}, high:{dc:44,attack:36}, average:{dc:41,attack:33} },
  "22": { extreme:{dc:50,attack:42}, high:{dc:45,attack:37}, average:{dc:42,attack:34} },
  "23": { extreme:{dc:51,attack:43}, high:{dc:46,attack:38}, average:{dc:43,attack:35} },
  "24": { extreme:{dc:52,attack:44}, high:{dc:48,attack:40}, average:{dc:45,attack:37} }
});

export function spellcastingBenchmark(level, tier = "high") {
  const row = SPELLCASTING_BENCHMARKS[String(Math.max(-1, Math.min(24, Number(level))))];
  return row?.[tier] ?? row?.high ?? null;
}
