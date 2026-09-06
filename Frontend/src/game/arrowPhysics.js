/**
 * Arrow Puzzle Collision & Raycasting Physics Engine
 */

// Helper to check intersection between ray and line segment
function rayIntersectsSegment(rayOrigin, rayDir, p1, p2, buffer = 0.15) {
  const [rx, ry] = rayOrigin;
  const [dx, dy] = rayDir; // e.g. [1, 0] for right, [-1, 0] for left, [0, 1] for down, [0, -1] for up

  const [x1, y1] = p1;
  const [x2, y2] = p2;

  const minX = Math.min(x1, x2) - buffer;
  const maxX = Math.max(x1, x2) + buffer;
  const minY = Math.min(y1, y2) - buffer;
  const maxY = Math.max(y1, y2) + buffer;

  // Horizontal Ray (right or left)
  if (dy === 0) {
    // Ray travels along line y = ry
    // Does segment contain this y?
    if (ry >= minY && ry <= maxY) {
      // Find x where segment has y = ry
      let intersectX;
      if (Math.abs(y2 - y1) < 0.001) {
        // Segment is also horizontal at same y
        intersectX = dx > 0 ? Math.min(x1, x2) : Math.max(x1, x2);
      } else {
        // Vertical or sloped segment
        intersectX = x1 + ((ry - y1) / (y2 - y1)) * (x2 - x1);
      }

      // Check if intersectX is in front of ray origin
      const dist = (intersectX - rx) * dx;
      if (dist > buffer && intersectX >= minX && intersectX <= maxX) {
        return { distance: dist, point: [intersectX, ry] };
      }
    }
  }

  // Vertical Ray (down or up)
  if (dx === 0) {
    // Ray travels along line x = rx
    // Does segment contain this x?
    if (rx >= minX && rx <= maxX) {
      let intersectY;
      if (Math.abs(x2 - x1) < 0.001) {
        // Segment is also vertical at same x
        intersectY = dy > 0 ? Math.min(y1, y2) : Math.max(y1, y2);
      } else {
        intersectY = y1 + ((rx - x1) / (x2 - x1)) * (y2 - y1);
      }

      const dist = (intersectY - ry) * dy;
      if (dist > buffer && intersectY >= minY && intersectY <= maxY) {
        return { distance: dist, point: [rx, intersectY] };
      }
    }
  }

  return null;
}

export function getDirectionVector(dir) {
  switch (dir.toLowerCase()) {
    case 'right': return [1, 0];
    case 'left': return [-1, 0];
    case 'down': return [0, 1];
    case 'up': return [0, -1];
    default: return [1, 0];
  }
}

/**
 * Check whether an arrow can freely fly off the board or is blocked
 * @param {Object} arrow The arrow to test
 * @param {Array} allArrows List of currently remaining arrows on the board
 * @returns {Object} { canExit: boolean, blocker: Object|null, impactPoint: Array|null, distance: number }
 */
export function checkArrowObstruction(arrow, allArrows) {
  const headPoint = arrow.points[arrow.points.length - 1];
  const rayDir = getDirectionVector(arrow.direction);

  let closestHit = null;

  for (const other of allArrows) {
    if (other.id === arrow.id) continue;

    // Check all line segments of the other arrow
    for (let i = 0; i < other.points.length - 1; i++) {
      const p1 = other.points[i];
      const p2 = other.points[i + 1];

      const hit = rayIntersectsSegment(headPoint, rayDir, p1, p2);
      if (hit) {
        if (!closestHit || hit.distance < closestHit.distance) {
          closestHit = {
            arrow: other,
            distance: hit.distance,
            point: hit.point
          };
        }
      }
    }
  }

  if (closestHit) {
    return {
      canExit: false,
      blocker: closestHit.arrow,
      impactPoint: closestHit.point,
      distance: closestHit.distance
    };
  }

  return {
    canExit: true,
    blocker: null,
    impactPoint: null,
    distance: Infinity
  };
}

/**
 * Returns list of arrows that can currently escape without hitting anything
 */
export function findClearableArrows(allArrows) {
  return allArrows.filter(arrow => {
    const result = checkArrowObstruction(arrow, allArrows);
    return result.canExit;
  });
}
