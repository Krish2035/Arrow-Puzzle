const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? 'https://arrow-puzzle.onrender.com/api'
    : 'http://localhost:5000/api');

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

// Handcrafted challenging levels with tight interlocking dependencies
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
      { id: 'a4', points: [[4.0, 2.8], [4.0, 2.3]], direction: 'up' },    // Blocked by a3
      { id: 'a5', points: [[4.0, 5.0], [4.0, 3.5]], direction: 'up' }     // Blocked by a2
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
      { id: 'a4', points: [[4.8, 1.8], [2.4, 1.8]], direction: 'left' }, // Cleanly stops at 2.4 before a2 at 2.0
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
  },
  6: {
    level_number: 6,
    title: 'Heart of Courage',
    difficulty: 'Hard',
    grid_size: 18,
    arrows: [
      { id: 'a1', points: [[5,11],[5,8]], direction: 'up' },
      { id: 'a2', points: [[10,2],[11,2]], direction: 'right' },
      { id: 'a3', points: [[2,2],[6,2],[6,3],[8,3]], direction: 'right' },
      { id: 'a4', points: [[16,4],[15,4]], direction: 'left' },
      { id: 'a5', points: [[9,5],[9,3]], direction: 'up' },
      { id: 'a6', points: [[8,9],[6,9],[6,7],[9,7]], direction: 'right' },
      { id: 'a7', points: [[12,2],[13,2]], direction: 'right' },
      { id: 'a8', points: [[10,7],[13,7]], direction: 'right' },
      { id: 'a9', points: [[14,8],[14,7]], direction: 'up' },
      { id: 'a10', points: [[13,5],[13,4],[14,4],[14,2]], direction: 'up' },
      { id: 'a11', points: [[7,10],[7,11],[11,11]], direction: 'right' },
      { id: 'a12', points: [[6,6],[4,6]], direction: 'left' },
      { id: 'a13', points: [[10,12],[7,12]], direction: 'left' },
      { id: 'a14', points: [[6,10],[6,12]], direction: 'down' },
      { id: 'a15', points: [[8,14],[8,13],[6,13]], direction: 'left' },
      { id: 'a16', points: [[9,13],[9,14]], direction: 'down' },
      { id: 'a17', points: [[8,16],[9,16]], direction: 'right' },
      { id: 'a18', points: [[7,6],[8,6]], direction: 'right' },
      { id: 'a19', points: [[8,4],[6,4]], direction: 'left' },
      { id: 'a20', points: [[12,8],[12,9]], direction: 'down' },
      { id: 'a21', points: [[12,10],[12,11]], direction: 'down' },
      { id: 'a22', points: [[3,5],[3,7]], direction: 'down' },
      { id: 'a23', points: [[5,4],[2,4]], direction: 'left' },
      { id: 'a24', points: [[10,3],[10,6],[12,6]], direction: 'right' },
      { id: 'a25', points: [[5,3],[3,3]], direction: 'left' },
      { id: 'a26', points: [[2,5],[2,6]], direction: 'down' },
      { id: 'a27', points: [[13,8],[13,10]], direction: 'down' },
      { id: 'a28', points: [[2,3],[1,3]], direction: 'left' },
      { id: 'a29', points: [[13,6],[14,6]], direction: 'right' },
      { id: 'a30', points: [[15,5],[15,6]], direction: 'down' },
      { id: 'a31', points: [[1,4],[1,5]], direction: 'down' },
      { id: 'a32', points: [[15,3],[16,3]], direction: 'right' },
      { id: 'a33', points: [[4,8],[3,8]], direction: 'left' },
      { id: 'a34', points: [[10,13],[10,15]], direction: 'down' },
      { id: 'a35', points: [[11,12],[11,13]], direction: 'down' },
      { id: 'a36', points: [[9,15],[8,15]], direction: 'left' },
      { id: 'a37', points: [[7,14],[7,15]], direction: 'down' },
      { id: 'a38', points: [[4,9],[4,10]], direction: 'down' }
    ]
  },
  9: {
    level_number: 9,
    title: 'Grand Labyrinth',
    difficulty: 'Normal',
    grid_size: 20,
    arrows: [
      { id: 'a1', points: [[12,10],[10,10],[10,12]], direction: 'down' },
      { id: 'a2', points: [[9,5],[9,6],[11,6],[11,3]], direction: 'up' },
      { id: 'a3', points: [[9,10],[8,10]], direction: 'left' },
      { id: 'a4', points: [[9,1],[9,2],[4,2]], direction: 'left' },
      { id: 'a5', points: [[13,13],[13,15],[15,15]], direction: 'right' },
      { id: 'a6', points: [[10,3],[10,1]], direction: 'up' },
      { id: 'a7', points: [[12,15],[8,15]], direction: 'left' },
      { id: 'a8', points: [[6,10],[6,14]], direction: 'down' },
      { id: 'a9', points: [[16,2],[16,5]], direction: 'down' },
      { id: 'a10', points: [[1,3],[1,5]], direction: 'down' },
      { id: 'a11', points: [[14,18],[11,18]], direction: 'left' },
      { id: 'a12', points: [[12,6],[12,4]], direction: 'up' },
      { id: 'a13', points: [[5,8],[5,10]], direction: 'down' },
      { id: 'a14', points: [[11,7],[7,7],[7,9]], direction: 'down' },
      { id: 'a15', points: [[1,16],[3,16]], direction: 'right' },
      { id: 'a16', points: [[11,1],[13,1]], direction: 'right' },
      { id: 'a17', points: [[3,7],[3,5]], direction: 'up' },
      { id: 'a18', points: [[13,10],[14,10]], direction: 'right' },
      { id: 'a19', points: [[5,11],[5,13]], direction: 'down' },
      { id: 'a20', points: [[3,14],[4,14],[4,13],[2,13]], direction: 'left' },
      { id: 'a21', points: [[8,9],[10,9]], direction: 'right' },
      { id: 'a22', points: [[16,6],[16,9]], direction: 'down' },
      { id: 'a23', points: [[4,15],[4,17]], direction: 'down' },
      { id: 'a24', points: [[7,17],[7,19]], direction: 'down' },
      { id: 'a25', points: [[14,9],[14,7]], direction: 'up' },
      { id: 'a26', points: [[3,17],[2,17]], direction: 'left' },
      { id: 'a27', points: [[3,8],[3,11],[1,11]], direction: 'left' },
      { id: 'a28', points: [[15,16],[15,19]], direction: 'down' },
      { id: 'a29', points: [[3,15],[2,15]], direction: 'left' },
      { id: 'a30', points: [[3,4],[3,2]], direction: 'up' },
      { id: 'a31', points: [[2,18],[5,18],[5,19],[3,19]], direction: 'left' },
      { id: 'a32', points: [[13,5],[14,5],[14,2]], direction: 'up' },
      { id: 'a33', points: [[8,1],[6,1]], direction: 'left' },
      { id: 'a34', points: [[15,8],[15,6]], direction: 'up' },
      { id: 'a35', points: [[16,13],[16,15]], direction: 'down' },
      { id: 'a36', points: [[2,6],[1,6]], direction: 'left' },
      { id: 'a37', points: [[16,16],[16,17]], direction: 'down' },
      { id: 'a38', points: [[6,16],[6,18]], direction: 'down' },
      { id: 'a39', points: [[2,8],[1,8]], direction: 'left' },
      { id: 'a40', points: [[1,17],[1,18]], direction: 'down' },
      { id: 'a41', points: [[15,10],[16,10]], direction: 'right' },
      { id: 'a42', points: [[13,12],[16,12]], direction: 'right' },
      { id: 'a43', points: [[7,16],[10,16],[10,18]], direction: 'down' },
      { id: 'a44', points: [[2,5],[2,3]], direction: 'up' },
      { id: 'a45', points: [[11,11],[13,11]], direction: 'right' },
      { id: 'a46', points: [[14,11],[15,11]], direction: 'right' },
      { id: 'a47', points: [[4,12],[3,12]], direction: 'left' },
      { id: 'a48', points: [[8,17],[8,18]], direction: 'down' },
      { id: 'a49', points: [[2,19],[1,19]], direction: 'left' },
      { id: 'a50', points: [[15,5],[15,3]], direction: 'up' },
      { id: 'a51', points: [[5,1],[3,1]], direction: 'left' },
      { id: 'a52', points: [[2,14],[1,14]], direction: 'left' },
      { id: 'a53', points: [[9,17],[9,19]], direction: 'down' },
      { id: 'a54', points: [[2,2],[1,2]], direction: 'left' }
    ]
  },
  10: {
    level_number: 10,
    title: 'Sands of Time',
    difficulty: 'Hard',
    grid_size: 26,
    arrows: [
      { id: 'a1', points: [[8,25],[8,24],[10,24]], direction: 'right' },
      { id: 'a2', points: [[12,6],[12,7],[9,7]], direction: 'left' },
      { id: 'a3', points: [[19,5],[17,5]], direction: 'left' },
      { id: 'a4', points: [[10,4],[10,6],[8,6]], direction: 'left' },
      { id: 'a5', points: [[7,4],[6,4],[6,6]], direction: 'down' },
      { id: 'a6', points: [[10,17],[10,16],[12,16]], direction: 'right' },
      { id: 'a7', points: [[7,23],[7,25]], direction: 'down' },
      { id: 'a8', points: [[9,18],[14,18]], direction: 'right' },
      { id: 'a9', points: [[12,3],[18,3]], direction: 'right' },
      { id: 'a10', points: [[8,13],[10,13]], direction: 'right' },
      { id: 'a11', points: [[15,19],[15,24]], direction: 'down' },
      { id: 'a12', points: [[13,21],[13,20],[11,20]], direction: 'left' },
      { id: 'a13', points: [[16,21],[17,21]], direction: 'right' },
      { id: 'a14', points: [[16,9],[12,9]], direction: 'left' },
      { id: 'a15', points: [[15,1],[17,1]], direction: 'right' },
      { id: 'a16', points: [[2,23],[5,23],[5,25]], direction: 'down' },
      { id: 'a17', points: [[8,17],[8,20],[6,20]], direction: 'left' },
      { id: 'a18', points: [[6,8],[8,8]], direction: 'right' },
      { id: 'a19', points: [[8,3],[8,1]], direction: 'up' },
      { id: 'a20', points: [[4,24],[2,24]], direction: 'left' },
      { id: 'a21', points: [[7,3],[2,3]], direction: 'left' },
      { id: 'a22', points: [[17,22],[17,23]], direction: 'down' },
      { id: 'a23', points: [[7,2],[6,2]], direction: 'left' },
      { id: 'a24', points: [[20,23],[20,24]], direction: 'down' },
      { id: 'a25', points: [[11,10],[9,10]], direction: 'left' },
      { id: 'a26', points: [[13,7],[15,7]], direction: 'right' },
      { id: 'a27', points: [[12,22],[8,22]], direction: 'left' },
      { id: 'a28', points: [[9,12],[13,12]], direction: 'right' },
      { id: 'a29', points: [[14,17],[14,15],[10,15]], direction: 'left' },
      { id: 'a30', points: [[9,11],[12,11]], direction: 'right' },
      { id: 'a31', points: [[7,18],[6,18]], direction: 'left' },
      { id: 'a32', points: [[10,20],[9,20],[9,21],[7,21]], direction: 'left' },
      { id: 'a33', points: [[19,1],[21,1]], direction: 'right' },
      { id: 'a34', points: [[12,4],[14,4]], direction: 'right' },
      { id: 'a35', points: [[8,10],[7,10]], direction: 'left' },
      { id: 'a36', points: [[5,1],[2,1]], direction: 'left' },
      { id: 'a37', points: [[6,21],[3,21]], direction: 'left' },
      { id: 'a38', points: [[17,4],[19,4]], direction: 'right' },
      { id: 'a39', points: [[17,2],[20,2]], direction: 'right' },
      { id: 'a40', points: [[6,22],[4,22]], direction: 'left' },
      { id: 'a41', points: [[18,22],[18,24]], direction: 'down' },
      { id: 'a42', points: [[9,17],[9,15],[7,15]], direction: 'left' },
      { id: 'a43', points: [[16,19],[17,19]], direction: 'right' },
      { id: 'a44', points: [[16,7],[17,7]], direction: 'right' },
      { id: 'a45', points: [[13,22],[13,23]], direction: 'down' },
      { id: 'a46', points: [[14,25],[16,25]], direction: 'right' },
      { id: 'a47', points: [[19,21],[19,22]], direction: 'down' },
      { id: 'a48', points: [[11,14],[9,14]], direction: 'left' },
      { id: 'a49', points: [[15,17],[16,17]], direction: 'right' },
      { id: 'a50', points: [[13,11],[14,11]], direction: 'right' },
      { id: 'a51', points: [[12,14],[13,14]], direction: 'right' },
      { id: 'a52', points: [[9,8],[13,8]], direction: 'right' },
      { id: 'a53', points: [[5,2],[4,2]], direction: 'left' },
      { id: 'a54', points: [[13,6],[14,6]], direction: 'right' },
      { id: 'a55', points: [[11,23],[11,25]], direction: 'down' },
      { id: 'a56', points: [[17,24],[17,25]], direction: 'down' },
      { id: 'a57', points: [[11,6],[11,5]], direction: 'up' },
      { id: 'a58', points: [[12,23],[12,24]], direction: 'down' },
      { id: 'a59', points: [[11,9],[10,9]], direction: 'left' },
      { id: 'a60', points: [[12,10],[13,10]], direction: 'right' },
      { id: 'a61', points: [[12,2],[12,1]], direction: 'up' },
      { id: 'a62', points: [[14,8],[16,8]], direction: 'right' },
      { id: 'a63', points: [[10,3],[10,1]], direction: 'up' },
      { id: 'a64', points: [[8,9],[6,9]], direction: 'left' },
      { id: 'a65', points: [[11,13],[12,13]], direction: 'right' },
      { id: 'a66', points: [[11,4],[11,2]], direction: 'up' },
      { id: 'a67', points: [[9,5],[9,2]], direction: 'up' },
      { id: 'a68', points: [[15,6],[16,6]], direction: 'right' },
      { id: 'a69', points: [[7,19],[5,19]], direction: 'left' },
      { id: 'a70', points: [[5,20],[4,20]], direction: 'left' },
      { id: 'a71', points: [[18,25],[20,25]], direction: 'right' },
      { id: 'a72', points: [[4,25],[3,25]], direction: 'left' },
      { id: 'a73', points: [[16,20],[18,20]], direction: 'right' },
      { id: 'a74', points: [[5,5],[3,5]], direction: 'left' },
      { id: 'a75', points: [[17,6],[18,6]], direction: 'right' },
      { id: 'a76', points: [[2,25],[1,25]], direction: 'left' },
      { id: 'a77', points: [[8,7],[7,7]], direction: 'left' },
      { id: 'a78', points: [[13,24],[13,25]], direction: 'down' },
      { id: 'a79', points: [[14,10],[15,10]], direction: 'right' },
      { id: 'a80', points: [[6,23],[6,24]], direction: 'down' },
      { id: 'a81', points: [[14,2],[14,1]], direction: 'up' },
      { id: 'a82', points: [[5,4],[4,4]], direction: 'left' },
      { id: 'a83', points: [[5,6],[4,6]], direction: 'left' },
      { id: 'a84', points: [[6,7],[5,7]], direction: 'left' },
      { id: 'a85', points: [[13,13],[14,13]], direction: 'right' }
    ]
  },
  14: {
    level_number: 14,
    title: 'Twin Pillars',
    difficulty: 'Normal',
    grid_size: 22,
    arrows: [
      { id: 'a1', points: [[6,6],[3,6]], direction: 'left' },
      { id: 'a2', points: [[16,14],[15,14],[15,17]], direction: 'down' },
      { id: 'a3', points: [[12,16],[13,16],[13,14]], direction: 'up' },
      { id: 'a4', points: [[15,19],[13,19],[13,18],[15,18]], direction: 'right' },
      { id: 'a5', points: [[13,12],[13,10]], direction: 'up' },
      { id: 'a6', points: [[2,6],[1,6]], direction: 'left' },
      { id: 'a7', points: [[17,16],[16,16],[16,18]], direction: 'down' },
      { id: 'a8', points: [[17,20],[16,20]], direction: 'left' },
      { id: 'a9', points: [[8,2],[8,3],[5,3]], direction: 'left' },
      { id: 'a10', points: [[14,20],[10,20]], direction: 'left' },
      { id: 'a11', points: [[4,5],[4,3]], direction: 'up' },
      { id: 'a12', points: [[7,2],[6,2]], direction: 'left' },
      { id: 'a13', points: [[5,2],[4,2]], direction: 'left' },
      { id: 'a14', points: [[14,16],[14,17],[12,17]], direction: 'left' },
      { id: 'a15', points: [[16,21],[13,21]], direction: 'left' },
      { id: 'a16', points: [[3,4],[3,2]], direction: 'up' },
      { id: 'a17', points: [[9,20],[6,20]], direction: 'left' },
      { id: 'a18', points: [[12,21],[11,21]], direction: 'left' },
      { id: 'a19', points: [[1,9],[3,9]], direction: 'right' },
      { id: 'a20', points: [[10,19],[10,17],[8,17]], direction: 'left' },
      { id: 'a21', points: [[1,1],[3,1]], direction: 'right' },
      { id: 'a22', points: [[5,7],[8,7]], direction: 'right' },
      { id: 'a23', points: [[5,9],[9,9]], direction: 'right' },
      { id: 'a24', points: [[6,8],[13,8]], direction: 'right' },
      { id: 'a25', points: [[14,8],[16,8]], direction: 'right' },
      { id: 'a26', points: [[6,18],[1,18]], direction: 'left' },
      { id: 'a27', points: [[10,6],[13,6]], direction: 'right' },
      { id: 'a28', points: [[14,7],[14,6]], direction: 'up' },
      { id: 'a29', points: [[14,10],[15,10]], direction: 'right' },
      { id: 'a30', points: [[14,12],[15,12]], direction: 'right' },
      { id: 'a31', points: [[14,5],[14,4]], direction: 'up' },
      { id: 'a32', points: [[12,10],[10,10]], direction: 'left' },
      { id: 'a33', points: [[10,9],[11,9]], direction: 'right' },
      { id: 'a34', points: [[11,5],[11,4]], direction: 'up' },
      { id: 'a35', points: [[5,13],[7,13]], direction: 'right' },
      { id: 'a36', points: [[11,16],[7,16]], direction: 'left' },
      { id: 'a37', points: [[12,11],[11,11]], direction: 'left' },
      { id: 'a38', points: [[17,10],[17,8]], direction: 'up' },
      { id: 'a39', points: [[11,12],[11,13],[13,13]], direction: 'right' },
      { id: 'a40', points: [[16,12],[17,12]], direction: 'right' },
      { id: 'a41', points: [[6,16],[4,16]], direction: 'left' },
      { id: 'a42', points: [[14,13],[16,13]], direction: 'right' },
      { id: 'a43', points: [[10,11],[6,11]], direction: 'left' },
      { id: 'a44', points: [[4,14],[4,11],[2,11]], direction: 'left' },
      { id: 'a45', points: [[15,7],[15,5]], direction: 'up' },
      { id: 'a46', points: [[10,21],[9,21]], direction: 'left' },
      { id: 'a47', points: [[4,17],[2,17]], direction: 'left' },
      { id: 'a48', points: [[14,11],[16,11]], direction: 'right' },
      { id: 'a49', points: [[9,10],[7,10]], direction: 'left' },
      { id: 'a50', points: [[5,1],[7,1]], direction: 'right' },
      { id: 'a51', points: [[9,3],[11,3]], direction: 'right' },
      { id: 'a52', points: [[8,1],[13,1]], direction: 'right' },
      { id: 'a53', points: [[15,4],[15,3]], direction: 'up' },
      { id: 'a54', points: [[3,16],[1,16]], direction: 'left' },
      { id: 'a55', points: [[10,15],[8,15]], direction: 'left' },
      { id: 'a56', points: [[14,3],[14,1]], direction: 'up' },
      { id: 'a57', points: [[6,10],[5,10]], direction: 'left' },
      { id: 'a58', points: [[16,7],[17,7]], direction: 'right' },
      { id: 'a59', points: [[9,19],[8,19]], direction: 'left' },
      { id: 'a60', points: [[7,15],[5,15]], direction: 'left' },
      { id: 'a61', points: [[7,19],[5,19]], direction: 'left' },
      { id: 'a62', points: [[5,20],[3,20]], direction: 'left' },
      { id: 'a63', points: [[2,19],[2,20]], direction: 'down' },
      { id: 'a64', points: [[8,21],[7,21]], direction: 'left' },
      { id: 'a65', points: [[4,21],[2,21]], direction: 'left' },
      { id: 'a66', points: [[15,1],[16,1]], direction: 'right' },
      { id: 'a67', points: [[1,19],[1,21]], direction: 'down' },
      { id: 'a68', points: [[5,8],[4,8]], direction: 'left' },
      { id: 'a69', points: [[4,15],[3,15]], direction: 'left' },
      { id: 'a70', points: [[3,8],[2,8]], direction: 'left' }
    ]
  },
  16: {
    level_number: 16,
    title: 'Emerald Peak',
    difficulty: 'Hard',
    grid_size: 22,
    arrows: [
      { id: 'a1', points: [[15,13],[14,13],[14,12],[10,12]], direction: 'left' },
      { id: 'a2', points: [[8,8],[11,8],[11,9],[9,9]], direction: 'left' },
      { id: 'a3', points: [[4,9],[6,9],[6,11]], direction: 'down' },
      { id: 'a4', points: [[12,11],[12,10]], direction: 'up' },
      { id: 'a5', points: [[9,10],[9,12]], direction: 'down' },
      { id: 'a6', points: [[3,20],[1,20]], direction: 'left' },
      { id: 'a7', points: [[10,13],[6,13]], direction: 'left' },
      { id: 'a8', points: [[4,10],[4,13]], direction: 'down' },
      { id: 'a9', points: [[15,12],[16,12]], direction: 'right' },
      { id: 'a10', points: [[2,18],[4,18],[4,20]], direction: 'down' },
      { id: 'a11', points: [[7,8],[7,5]], direction: 'up' },
      { id: 'a12', points: [[14,14],[14,15]], direction: 'down' },
      { id: 'a13', points: [[7,16],[2,16]], direction: 'left' },
      { id: 'a14', points: [[9,4],[12,4]], direction: 'right' },
      { id: 'a15', points: [[11,16],[11,18],[14,18]], direction: 'right' },
      { id: 'a16', points: [[12,9],[13,9]], direction: 'right' },
      { id: 'a17', points: [[10,17],[9,17],[9,19]], direction: 'down' },
      { id: 'a18', points: [[9,7],[9,6],[8,6],[8,4]], direction: 'up' },
      { id: 'a19', points: [[13,17],[15,17]], direction: 'right' },
      { id: 'a20', points: [[6,17],[6,20],[9,20]], direction: 'right' },
      { id: 'a21', points: [[12,19],[12,20]], direction: 'down' },
      { id: 'a22', points: [[2,21],[4,21]], direction: 'right' },
      { id: 'a23', points: [[11,2],[11,3],[8,3]], direction: 'left' },
      { id: 'a24', points: [[14,19],[14,20],[17,20]], direction: 'right' },
      { id: 'a25', points: [[6,21],[8,21]], direction: 'right' },
      { id: 'a26', points: [[13,14],[11,14]], direction: 'left' },
      { id: 'a27', points: [[10,14],[9,14]], direction: 'left' },
      { id: 'a28', points: [[15,19],[18,19]], direction: 'right' },
      { id: 'a29', points: [[14,11],[14,9]], direction: 'up' },
      { id: 'a30', points: [[13,4],[14,4]], direction: 'right' },
      { id: 'a31', points: [[11,21],[14,21]], direction: 'right' },
      { id: 'a32', points: [[6,7],[5,7]], direction: 'left' },
      { id: 'a33', points: [[10,6],[11,6]], direction: 'right' },
      { id: 'a34', points: [[10,18],[10,20]], direction: 'down' },
      { id: 'a35', points: [[7,14],[5,14]], direction: 'left' },
      { id: 'a36', points: [[5,17],[3,17]], direction: 'left' },
      { id: 'a37', points: [[4,8],[4,7]], direction: 'up' },
      { id: 'a38', points: [[17,18],[17,17]], direction: 'up' },
      { id: 'a39', points: [[10,2],[9,2]], direction: 'left' },
      { id: 'a40', points: [[7,4],[7,3]], direction: 'up' },
      { id: 'a41', points: [[5,15],[3,15]], direction: 'left' },
      { id: 'a42', points: [[15,15],[16,15]], direction: 'right' },
      { id: 'a43', points: [[5,18],[5,19]], direction: 'down' },
      { id: 'a44', points: [[8,2],[7,2]], direction: 'left' },
      { id: 'a45', points: [[12,16],[13,16]], direction: 'right' },
      { id: 'a46', points: [[6,4],[5,4]], direction: 'left' },
      { id: 'a47', points: [[7,1],[8,1]], direction: 'right' },
      { id: 'a48', points: [[10,7],[12,7],[12,8],[14,8]], direction: 'right' },
      { id: 'a49', points: [[3,14],[3,12]], direction: 'up' },
      { id: 'a50', points: [[17,16],[17,15]], direction: 'up' },
      { id: 'a51', points: [[9,1],[10,1]], direction: 'right' },
      { id: 'a52', points: [[11,1],[12,1]], direction: 'right' },
      { id: 'a53', points: [[5,20],[5,21]], direction: 'down' },
      { id: 'a54', points: [[9,5],[10,5]], direction: 'right' },
      { id: 'a55', points: [[12,6],[14,6]], direction: 'right' },
      { id: 'a56', points: [[16,11],[15,11],[15,8]], direction: 'up' },
      { id: 'a57', points: [[15,21],[16,21]], direction: 'right' },
      { id: 'a58', points: [[18,20],[18,21]], direction: 'down' },
      { id: 'a59', points: [[11,5],[13,5]], direction: 'right' },
      { id: 'a60', points: [[13,7],[15,7]], direction: 'right' },
      { id: 'a61', points: [[3,19],[2,19]], direction: 'left' }
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

export function doSegmentsIntersect(p1, p2, p3, p4) {
  function ccw(A, B, C) {
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  }
  if ((p1[0] === p3[0] && p1[1] === p3[1]) || (p1[0] === p4[0] && p1[1] === p4[1]) ||
      (p2[0] === p3[0] && p2[1] === p3[1]) || (p2[0] === p4[0] && p2[1] === p4[1])) {
    return false;
  }
  return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}

export function hasSegmentIntersections(arrows) {
  for (let i = 0; i < arrows.length; i++) {
    for (let j = i + 1; j < arrows.length; j++) {
      const a1 = arrows[i];
      const a2 = arrows[j];
      for (let s1 = 0; s1 < a1.points.length - 1; s1++) {
        for (let s2 = 0; s2 < a2.points.length - 1; s2++) {
          if (doSegmentsIntersect(a1.points[s1], a1.points[s1 + 1], a2.points[s2], a2.points[s2 + 1])) {
            return true;
          }
        }
      }
    }
  }
  return false;
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

// Procedural Dense Interlocking Maze Generator for Levels 6 to 100
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
    if (hasSegmentIntersections(arrows)) continue;

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

  // Guaranteed non-intersecting fallback
  return {
    level_number: num,
    title: `Level ${num}`,
    difficulty,
    grid_size: 8,
    arrows: [
      { id: 'a1', points: [[2, 2], [5, 2]], direction: 'right' },
      { id: 'a2', points: [[6, 2], [6, 5]], direction: 'down' },
      { id: 'a3', points: [[6, 6], [3, 6]], direction: 'left' },
      { id: 'a4', points: [[2, 6], [2, 3]], direction: 'up' },
      { id: 'a5', points: [[4, 4], [4, 3]], direction: 'up' }
    ]
  };
}

const levelsCache = {};
export function getLevelFromCache(num) {
  if (curatedLevels[num]) return curatedLevels[num];
  if (!levelsCache[num]) {
    levelsCache[num] = generateProceduralLevel(num);
  }
  return levelsCache[num];
}

const STORAGE_KEY_PROFILE = 'arrow_puzzle_profile';
const STORAGE_KEY_LEVELS = 'arrow_puzzle_levels_cache';

function getLocalProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveLocalProfile(profile) {
  if (typeof window === 'undefined' || !profile) return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {}
}

export async function fetchLevel(levelNumber) {
  const num = parseInt(levelNumber, 10) || 1;
  if (curatedLevels[num]) {
    return curatedLevels[num];
  }

  // Check localStorage level cache first for instant offline access
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_LEVELS}_${num}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.level_number === num && parsed.arrows?.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/levels/${num}`, { 
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.level_number === num && json.data.arrows && json.data.arrows.length > 0) {
        if (verifySolvability(json.data.arrows)) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`${STORAGE_KEY_LEVELS}_${num}`, JSON.stringify(json.data));
            } catch (e) {}
          }
          return json.data;
        }
      }
    }
  } catch (e) {
    // Network failure / Offline mode
  }

  const offlineLevel = getLevelFromCache(num);
  if (typeof window !== 'undefined' && offlineLevel) {
    try {
      localStorage.setItem(`${STORAGE_KEY_LEVELS}_${num}`, JSON.stringify(offlineLevel));
    } catch (e) {}
  }
  return offlineLevel;
}

export async function submitLevelWin(levelNumber, heartsLeft = 3, timeSeconds = 25) {
  const num = parseInt(levelNumber, 10) || 1;
  const nextLvl = Math.min(100, num + 1);

  // Update local profile immediately for seamless offline progression
  let currentProfile = getLocalProfile() || {
    username: 'ArrowMaster',
    current_level: num,
    hearts: 3,
    hints: 2,
    completed_levels: [],
    stars: 0
  };

  if (!currentProfile.completed_levels.includes(num)) {
    currentProfile.completed_levels.push(num);
    currentProfile.stars = (currentProfile.stars || 0) + (heartsLeft === 3 ? 3 : heartsLeft === 2 ? 2 : 1);
  }
  currentProfile.current_level = Math.max(currentProfile.current_level || 1, nextLvl);
  saveLocalProfile(currentProfile);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/levels/${num}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heartsLeft, timeSeconds }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.profile) {
        saveLocalProfile(json.data.profile);
        return json;
      }
    }
  } catch (e) {
    // Offline mode: proceed with local profile
  }

  return {
    success: true,
    next_level: nextLvl,
    data: { profile: currentProfile }
  };
}

export async function fetchDailyChallenge() {
  try {
    const res = await fetch(`${API_BASE}/levels/daily/today`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (e) {
    // Fallback
  }
  const d = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const challengeLevel = generateProceduralLevel(((d.getDate() * 7) % 95) + 5);
  return {
    ...challengeLevel,
    title: 'Daily Challenge',
    date: `${months[d.getMonth()]} ${d.getDate()}`
  };
}

export async function fetchUserProfile() {
  const localProf = getLocalProfile();
  try {
    const res = await fetch(`${API_BASE}/user/profile`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        saveLocalProfile(json.data);
        return json.data;
      }
    }
  } catch (e) {
    // Offline mode: return locally persisted profile
  }

  return localProf || {
    username: 'ArrowMaster',
    current_level: 4,
    hearts: 3,
    hints: 2,
    completed_levels: [1, 2, 3],
    stars: 9
  };
}
