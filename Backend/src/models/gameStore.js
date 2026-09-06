import { pool, getIsPgConnected } from '../config/db.js';

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rayIntersectsSegment(rayOrigin, rayDir, p1, p2, buffer = 0.1) {
  const [rx, ry] = rayOrigin;
  const [dx, dy] = rayDir;
  const [x1, y1] = p1;
  const [x2, y2] = p2;

  const minX = Math.min(x1, x2) - buffer;
  const maxX = Math.max(x1, x2) + buffer;
  const minY = Math.min(y1, y2) - buffer;
  const maxY = Math.max(y1, y2) + buffer;

  if (dy === 0) {
    if (ry >= minY && ry <= maxY) {
      let intersectX;
      if (Math.abs(y2 - y1) < 0.001) {
        intersectX = dx > 0 ? Math.min(x1, x2) : Math.max(x1, x2);
      } else {
        intersectX = x1 + ((ry - y1) / (y2 - y1)) * (x2 - x1);
      }
      const dist = (intersectX - rx) * dx;
      if (dist > buffer && intersectX >= minX && intersectX <= maxX) {
        return true;
      }
    }
  }

  if (dx === 0) {
    if (rx >= minX && rx <= maxX) {
      let intersectY;
      if (Math.abs(x2 - x1) < 0.001) {
        intersectY = dy > 0 ? Math.min(y1, y2) : Math.max(y1, y2);
      } else {
        intersectY = y1 + ((rx - x1) / (x2 - x1)) * (y2 - y1);
      }
      const dist = (intersectY - ry) * dy;
      if (dist > buffer && intersectY >= minY && intersectY <= maxY) {
        return true;
      }
    }
  }

  return false;
}

export function checkObstruction(arrow, allArrows) {
  const head = arrow.points[arrow.points.length - 1];
  let dir = [1, 0];
  if (arrow.direction === 'left') dir = [-1, 0];
  else if (arrow.direction === 'up') dir = [0, -1];
  else if (arrow.direction === 'down') dir = [0, 1];

  for (const other of allArrows) {
    if (other.id === arrow.id) continue;
    for (let i = 0; i < other.points.length - 1; i++) {
      if (rayIntersectsSegment(head, dir, other.points[i], other.points[i + 1])) {
        return false;
      }
    }
  }
  return true;
}

export function verifySolvability(arrows) {
  let remaining = [...arrows];
  while (remaining.length > 0) {
    const clearableIndex = remaining.findIndex(a => checkObstruction(a, remaining));
    if (clearableIndex === -1) return false;
    remaining.splice(clearableIndex, 1);
  }
  return true;
}

export function hasLoopArrow(points) {
  if (!points || points.length < 4) return false;
  const turnSigns = [];
  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];
    const dx1 = Math.sign(pCurr[0] - pPrev[0]);
    const dy1 = Math.sign(pCurr[1] - pPrev[1]);
    const dx2 = Math.sign(pNext[0] - pCurr[0]);
    const dy2 = Math.sign(pNext[1] - pCurr[1]);
    const cp = dx1 * dy2 - dy1 * dx2;
    if (cp !== 0) {
      turnSigns.push(Math.sign(cp));
    }
  }

  // Reject if 3 consecutive turns have the same sign (curling 270+ degrees into a box loop)
  if (turnSigns.length >= 3) {
    let sameSignStreak = 1;
    for (let i = 1; i < turnSigns.length; i++) {
      if (turnSigns[i] === turnSigns[i - 1]) {
        sameSignStreak++;
        if (sameSignStreak >= 3) return true;
      } else {
        sameSignStreak = 1;
      }
    }
  }

  // Reject if cumulative rotation reaches 270 or 360 degrees
  let totalAngle = 0;
  for (const s of turnSigns) {
    totalAngle += s * 90;
  }
  if (Math.abs(totalAngle) >= 270) {
    return true;
  }

  // Reject if a U-turn (two turns of same sign) makes any further turns
  for (let i = 0; i < turnSigns.length - 1; i++) {
    if (turnSigns[i] === turnSigns[i + 1]) {
      if (turnSigns.length > 2) return true;
    }
  }

  return false;
}

export function hasCollinearMouth(cand, existingArrows) {
  const head = cand.points[cand.points.length - 1];
  const [hx, hy] = head;
  const dir = cand.direction;

  for (const other of existingArrows) {
    const oHead = other.points[other.points.length - 1];
    const [ox, oy] = oHead;
    const oDir = other.direction;

    // Minimum distance between any two arrowheads
    if (Math.hypot(hx - ox, hy - oy) < 1.05) return true;

    // If both point horizontally (left or right):
    if ((dir === 'left' || dir === 'right') && (oDir === 'left' || oDir === 'right')) {
      // Cannot share same vertical line (hx) on adjacent/nearby rows (the exact issue in Screenshot 1!)
      if (Math.abs(hx - ox) < 0.01 && Math.abs(hy - oy) <= 2) return true;
      // Cannot share the exact same row (hy) within 3 columns
      if (Math.abs(hy - oy) < 0.01 && Math.abs(hx - ox) <= 3) return true;
    }

    // If both point vertically (up or down):
    if ((dir === 'up' || dir === 'down') && (oDir === 'up' || oDir === 'down')) {
      // Cannot share same horizontal line (hy) on adjacent/nearby columns
      if (Math.abs(hy - oy) < 0.01 && Math.abs(hx - ox) <= 2) return true;
      // Cannot share the exact same column (hx) within 3 rows
      if (Math.abs(hx - ox) < 0.01 && Math.abs(hy - oy) <= 3) return true;
    }
  }

  return false;
}

const curatedLevels = {
  // Level 1: 5 arrows, strict single-thread chain (Tutorial: a2 is the only free arrow, guided by hand)
  1: {
    level_number: 1,
    title: 'First Steps',
    difficulty: 'Easy',
    grid_size: 6,
    arrows: [
      { id: 'a2', points: [[2.0, 3.0], [4.5, 3.0]], direction: 'right' }, // The ONLY unblocked opening! Hand points here!
      { id: 'a1', points: [[3.0, 1.5], [3.0, 2.5]], direction: 'down' },  // Blocked by a2
      { id: 'a3', points: [[4.8, 2.0], [3.5, 2.0]], direction: 'left' },  // Blocked by a1
      { id: 'a4', points: [[4.0, 3.5], [4.0, 2.3]], direction: 'up' },    // Blocked by a3
      { id: 'a5', points: [[4.0, 5.0], [4.0, 3.8]], direction: 'up' }     // Blocked by a4
    ]
  },
  // Level 2: 8 arrows, interlocking U-turns & box traps (only 2 free openings)
  2: {
    level_number: 2,
    title: 'The Interlock',
    difficulty: 'Normal',
    grid_size: 7,
    arrows: [
      { id: 'a1', points: [[3.0, 4.2], [3.0, 2.2], [4.0, 2.2], [4.0, 4.0]], direction: 'down' },
      { id: 'a2', points: [[2.0, 4.8], [2.0, 1.5]], direction: 'up' },
      { id: 'a3', points: [[2.8, 4.8], [5.2, 4.8]], direction: 'right' },
      { id: 'a4', points: [[4.8, 1.8], [1.5, 1.8]], direction: 'left' },
      { id: 'a5', points: [[1.5, 1.0], [5.2, 1.0]], direction: 'right' },
      { id: 'a6', points: [[1.2, 2.5], [1.2, 5.5], [4.8, 5.5]], direction: 'right' },
      { id: 'a7', points: [[5.5, 1.0], [5.5, 6.0]], direction: 'down' },
      { id: 'a8', points: [[4.5, 3.5], [4.5, 2.5]], direction: 'up' }
    ]
  },
  // Level 3: 12 arrows, multi-turn labyrinth weave (only 2 free openings, depth 12)
  3: {
    level_number: 3,
    title: 'The Labyrinth',
    difficulty: 'Normal',
    grid_size: 8,
    arrows: [
      { id: 'a1', points: [[4, 2], [4, 3], [5, 3]], direction: 'right' },
      { id: 'a2', points: [[7, 3], [7, 1]], direction: 'up' },
      { id: 'a3', points: [[1, 4], [1, 2], [2, 2]], direction: 'right' },
      { id: 'a4', points: [[4, 6], [2, 6], [2, 4]], direction: 'up' },
      { id: 'a5', points: [[3, 7], [2, 7]], direction: 'left' },
      { id: 'a6', points: [[2, 1], [4, 1]], direction: 'right' },
      { id: 'a7', points: [[6, 1], [6, 4], [5, 4], [5, 5]], direction: 'down' },
      { id: 'a8', points: [[4, 5], [3, 5]], direction: 'left' },
      { id: 'a9', points: [[4, 7], [7, 7]], direction: 'right' },
      { id: 'a10', points: [[1, 7], [1, 6]], direction: 'up' },
      { id: 'a11', points: [[3, 4], [3, 3]], direction: 'up' },
      { id: 'a12', points: [[6, 5], [6, 6]], direction: 'down' }
    ]
  },
  // Level 4: 13 arrows, serpentine knot with deep mutual blocks
  4: {
    level_number: 4,
    title: 'Serpentine Knot',
    difficulty: 'Hard',
    grid_size: 9,
    arrows: [
      { id: 'a1', points: [[4, 2], [7, 2], [7, 6], [8, 6]], direction: 'right' },
      { id: 'a2', points: [[3, 1], [3, 5], [4, 5]], direction: 'right' },
      { id: 'a3', points: [[5, 1], [7, 1]], direction: 'right' },
      { id: 'a4', points: [[1, 7], [2, 7], [2, 8], [4, 8]], direction: 'right' },
      { id: 'a5', points: [[1, 3], [1, 4]], direction: 'down' },
      { id: 'a6', points: [[6, 3], [6, 8]], direction: 'down' },
      { id: 'a7', points: [[4, 3], [5, 3]], direction: 'right' },
      { id: 'a8', points: [[1, 2], [2, 2]], direction: 'right' },
      { id: 'a9', points: [[5, 6], [2, 6], [2, 5]], direction: 'up' },
      { id: 'a10', points: [[8, 1], [8, 3]], direction: 'down' },
      { id: 'a11', points: [[7, 8], [7, 7]], direction: 'up' },
      { id: 'a12', points: [[4, 7], [3, 7]], direction: 'left' },
      { id: 'a13', points: [[2, 1], [1, 1]], direction: 'left' }
    ]
  },
  // Level 5: 19 arrows, dense cross-woven labyrinth
  5: {
    level_number: 5,
    title: 'The Gauntlet',
    difficulty: 'Hard',
    grid_size: 9,
    arrows: [
      { id: 'a1', points: [[4, 8], [2, 8]], direction: 'left' },
      { id: 'a2', points: [[3, 5], [5, 5], [5, 6]], direction: 'down' },
      { id: 'a3', points: [[2, 7], [2, 6], [3, 6]], direction: 'right' },
      { id: 'a4', points: [[6, 3], [6, 6], [7, 6]], direction: 'right' },
      { id: 'a5', points: [[8, 7], [6, 7]], direction: 'left' },
      { id: 'a6', points: [[3, 4], [3, 3], [4, 3]], direction: 'right' },
      { id: 'a7', points: [[5, 1], [5, 2]], direction: 'down' },
      { id: 'a8', points: [[7, 5], [7, 3]], direction: 'up' },
      { id: 'a9', points: [[4, 6], [4, 7]], direction: 'down' },
      { id: 'a10', points: [[1, 2], [2, 2]], direction: 'right' },
      { id: 'a11', points: [[6, 2], [8, 2]], direction: 'right' },
      { id: 'a12', points: [[8, 6], [8, 5]], direction: 'up' },
      { id: 'a13', points: [[1, 8], [1, 5], [2, 5]], direction: 'right' },
      { id: 'a14', points: [[1, 4], [1, 3]], direction: 'up' },
      { id: 'a15', points: [[4, 2], [4, 1]], direction: 'up' },
      { id: 'a16', points: [[5, 8], [8, 8]], direction: 'right' },
      { id: 'a17', points: [[6, 1], [7, 1]], direction: 'right' },
      { id: 'a18', points: [[4, 4], [5, 4]], direction: 'right' },
      { id: 'a19', points: [[3, 2], [3, 1], [1, 1]], direction: 'left' }
    ]
  }
};

export function analyzeSolvability(arrows) {
  let remaining = [...arrows];
  let steps = 0;
  const initialClearable = remaining.filter(a => checkObstruction(a, remaining)).length;
  if (initialClearable === 0) return { solvable: false };

  while (remaining.length > 0) {
    const clearableIndices = [];
    for (let i = 0; i < remaining.length; i++) {
      if (checkObstruction(remaining[i], remaining)) {
        clearableIndices.push(i);
      }
    }
    if (clearableIndices.length === 0) return { solvable: false };

    remaining.splice(clearableIndices[0], 1);
    steps++;
  }

  return {
    solvable: true,
    initialClearable,
    chainDepth: steps,
    totalArrows: arrows.length
  };
}

function generateDensePuzzleCandidate(targetArrows, gridSize, rng) {
  const directions = ['right', 'left', 'up', 'down'];
  const dirVectors = {
    right: [1, 0],
    left: [-1, 0],
    up: [0, -1],
    down: [0, 1]
  };

  const minCoord = 1;
  const maxCoord = gridSize - 1;
  const arrows = [];
  const usedNodes = new Set();
  const usedSegments = new Set();

  function segKey(x1, y1, x2, y2) {
    return `${x1},${y1}-${x2},${y2}`;
  }

  const availableCoords = [];
  for (let x = minCoord; x <= maxCoord; x++) {
    for (let y = minCoord; y <= maxCoord; y++) {
      availableCoords.push([x, y]);
    }
  }

  let failures = 0;
  while (arrows.length < targetArrows && failures < 120) {
    const freeCoords = availableCoords.filter(([x, y]) => !usedNodes.has(`${x},${y}`));
    if (freeCoords.length === 0) break;

    const [hx, hy] = freeCoords[Math.floor(rng() * freeCoords.length)];
    const shuffledDirs = [...directions].sort(() => rng() - 0.5);

    let placed = false;
    for (const dir of shuffledDirs) {
      const [dx, dy] = dirVectors[dir];
      const roll = rng();
      const maxTurns = roll < 0.10 ? 0 : roll < 0.45 ? 1 : roll < 0.85 ? 2 : 3;

      const path = [[hx, hy]];
      const local = new Set([`${hx},${hy}`]);
      let cx = hx;
      let cy = hy;
      let curDx = -dx;
      let curDy = -dy;
      let turns = 0;
      let stepsInDir = 0;
      const maxLen = 2 + Math.floor(rng() * (gridSize - 2));

      for (let s = 0; s < maxLen; s++) {
        const nx = cx + curDx;
        const ny = cy + curDy;
        if (nx < minCoord || nx > maxCoord || ny < minCoord || ny > maxCoord) break;
        const key = `${nx},${ny}`;
        if (usedNodes.has(key) || local.has(key)) break;
        if (usedSegments.has(segKey(cx, cy, nx, ny)) || usedSegments.has(segKey(nx, ny, cx, cy))) break;

        path.push([nx, ny]);
        local.add(key);
        cx = nx;
        cy = ny;
        stepsInDir++;

        if (turns < maxTurns && stepsInDir >= 1 && rng() < 0.60 && s < maxLen - 1) {
          const sign = rng() < 0.5 ? 1 : -1;
          const newDx = -curDy * sign;
          const newDy = curDx * sign;
          curDx = newDx;
          curDy = newDy;
          turns++;
          stepsInDir = 0;
        }
      }

      if (path.length < 2) continue;

      const reversed = path.reverse();
      const simplified = [reversed[0]];
      for (let i = 1; i < reversed.length - 1; i++) {
        const prev = simplified[simplified.length - 1];
        const curr = reversed[i];
        const next = reversed[i + 1];
        const isCollinear = (prev[0] === curr[0] && curr[0] === next[0]) ||
                            (prev[1] === curr[1] && curr[1] === next[1]);
        if (!isCollinear) simplified.push(curr);
      }
      simplified.push(reversed[reversed.length - 1]);

      if (hasLoopArrow(simplified)) continue;

      const cand = {
        id: `a${arrows.length + 1}`,
        points: simplified,
        direction: dir
      };

      if (hasCollinearMouth(cand, arrows)) continue;

      arrows.push(cand);
      for (const p of path) usedNodes.add(`${p[0]},${p[1]}`);
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        usedSegments.add(segKey(p1[0], p1[1], p2[0], p2[1]));
        usedSegments.add(segKey(p2[0], p2[1], p1[0], p1[1]));
      }
      placed = true;
      break;
    }

    if (!placed) failures++;
  }

  return arrows;
}

export function generateProceduralLevel(levelNumber) {
  const num = Math.max(1, Math.min(100, parseInt(levelNumber, 10) || 1));
  if (curatedLevels[num]) {
    return curatedLevels[num];
  }

  // Progressive grid scaling
  const gridSize = num <= 8 ? 8 : num <= 20 ? 9 : num <= 45 ? 10 : num <= 70 ? 11 : 12;

  // Realistic target arrows achievable on each grid size
  const targetArrows = num <= 8 ? 11 + (num - 5)
                     : num <= 20 ? 14 + Math.floor((num - 8) * 0.4)
                     : num <= 45 ? 18 + Math.floor((num - 20) * 0.25)
                     : num <= 70 ? 22 + Math.floor((num - 45) * 0.2)
                     : 26 + Math.floor((num - 70) * 0.1);

  const minArrows = Math.max(6, Math.floor(targetArrows * 0.50));
  const difficulty = num <= 8 ? 'Normal' : num <= 25 ? 'Hard' : num <= 60 ? 'Expert' : 'Master';

  let bestCandidate = null;

  for (let attempt = 0; attempt < 75; attempt++) {
    const rng = mulberry32(num * 99991 + attempt * 1337 + 17);
    const arrows = generateDensePuzzleCandidate(targetArrows, gridSize, rng);
    if (arrows.length < minArrows) continue;

    const analysis = analyzeSolvability(arrows);
    if (!analysis.solvable) continue;

    // Hardness scoring:
    // Heavy bonus for low initial clearable count (1 to 2 openings)
    // Bonus for arrow count and chain depth
    let score = arrows.length * 10 - analysis.initialClearable * 25 + analysis.chainDepth * 5;
    if (analysis.initialClearable <= 2) score += 100;
    else if (analysis.initialClearable === 3) score += 40;

    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = {
        level_number: num,
        title: `Level ${num}`,
        difficulty,
        grid_size: gridSize,
        arrows,
        analysis,
        score
      };
      if (analysis.initialClearable <= 2 && arrows.length >= targetArrows - 1) {
        break;
      }
    }
  }

  if (bestCandidate) {
    return {
      level_number: bestCandidate.level_number,
      title: bestCandidate.title,
      difficulty: bestCandidate.difficulty,
      grid_size: bestCandidate.grid_size,
      arrows: bestCandidate.arrows
    };
  }

  // Guaranteed fallback
  return {
    level_number: num,
    title: `Level ${num}`,
    difficulty,
    grid_size: 8,
    arrows: [
      { id: 'a1', points: [[2, 2], [2, 5], [4, 5]], direction: 'right' },
      { id: 'a2', points: [[3, 6], [3, 2]], direction: 'up' },
      { id: 'a3', points: [[5, 2], [6, 2], [6, 5]], direction: 'down' },
      { id: 'a4', points: [[6, 6], [4, 6]], direction: 'left' },
      { id: 'a5', points: [[5, 4], [1, 4]], direction: 'left' }
    ]
  };
}

const levelsCache = {};
function getOrGenerateLevel(i) {
  if (!levelsCache[i]) {
    levelsCache[i] = generateProceduralLevel(i);
  }
  return levelsCache[i];
}

let memoryProfile = {
  username: 'ArrowMaster',
  current_level: 4,
  hearts: 3,
  hints: 2,
  completed_levels: [1, 2, 3],
  stars: 9
};

export const gameStore = {
  async getLevel(levelNumber) {
    const num = parseInt(levelNumber, 10) || 1;
    if (getIsPgConnected()) {
      try {
        const res = await pool.query('SELECT * FROM levels WHERE level_number = $1', [num]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const parsed = typeof row.arrows === 'string' ? JSON.parse(row.arrows) : row.arrows;
          if (verifySolvability(parsed)) {
            return { ...row, arrows: parsed };
          }
        }
      } catch (err) {
        console.error('Error fetching from PostgreSQL:', err.message);
      }
    }
    return getOrGenerateLevel(num);
  },

  async getAllLevels() {
    const list = [];
    for (let i = 1; i <= 100; i++) {
      const lvl = getOrGenerateLevel(i);
      list.push({
        level_number: lvl.level_number,
        title: lvl.title,
        difficulty: lvl.difficulty,
        grid_size: lvl.grid_size,
        arrow_count: lvl.arrows.length
      });
    }
    return list;
  },

  async getProfile() {
    if (getIsPgConnected()) {
      try {
        const res = await pool.query('SELECT * FROM users LIMIT 1');
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.error('Error fetching user from PostgreSQL:', err.message);
      }
    }
    return memoryProfile;
  },

  async completeLevel(levelNumber, heartsLeft = 3, timeSeconds = 30) {
    const num = parseInt(levelNumber, 10);
    if (!memoryProfile.completed_levels.includes(num)) {
      memoryProfile.completed_levels.push(num);
      memoryProfile.stars += 3;
    }
    if (memoryProfile.current_level <= num) {
      memoryProfile.current_level = Math.min(100, num + 1);
    }

    if (getIsPgConnected()) {
      try {
        await pool.query(
          `INSERT INTO level_completions (user_id, level_number, hearts_left, time_seconds)
           VALUES (1, $1, $2, $3)`,
          [num, heartsLeft, timeSeconds]
        );
        await pool.query(
          `UPDATE users SET current_level = GREATEST(current_level, $1 + 1) WHERE id = 1`,
          [num]
        );
      } catch (err) {
        console.error('Error saving level completion in PostgreSQL:', err.message);
      }
    }

    return {
      success: true,
      next_level: Math.min(100, num + 1),
      profile: memoryProfile
    };
  },

  async getDailyChallenge() {
    const today = new Date().toISOString().split('T')[0];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const d = new Date();
    const formattedDate = `${monthNames[d.getMonth()]} ${d.getDate()}`;

    const dailyLevelIndex = ((d.getDate() * 7) % 95) + 5;
    const dailyLevel = {
      ...generateProceduralLevel(dailyLevelIndex),
      id: 'daily-' + today,
      title: 'Daily Challenge',
      date: formattedDate,
      date_iso: today
    };

    return dailyLevel;
  }
};
