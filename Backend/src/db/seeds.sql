-- Seeds for Arrow Puzzle Game

-- Ensure default user exists
INSERT INTO users (id, username, current_level, hearts, hints)
VALUES (1, 'ArrowMaster', 1, 3, 3)
ON CONFLICT (id) DO NOTHING;

-- Level 1: Introduction / Tutorial (Simple clearable arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    1,
    'First Steps',
    'Easy',
    6,
    '[
        {"id": "a2", "points": [[2.0, 3.0], [4.5, 3.0]], "direction": "right"},
        {"id": "a1", "points": [[3.0, 1.5], [3.0, 2.5]], "direction": "down"},
        {"id": "a3", "points": [[4.8, 2.0], [3.5, 2.0]], "direction": "left"},
        {"id": "a4", "points": [[4.0, 2.8], [4.0, 2.3]], "direction": "up"},
        {"id": "a5", "points": [[4.0, 5.0], [4.0, 3.5]], "direction": "up"}
    ]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET arrows = EXCLUDED.arrows;

-- Level 2: The Interlock (Interlocking U-turns & box traps, no intersecting arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    2,
    'The Interlock',
    'Normal',
    7,
    '[
        {"id": "a1", "points": [[3.0, 4.2], [3.0, 2.2], [4.0, 2.2], [4.0, 4.0]], "direction": "down"},
        {"id": "a2", "points": [[2.0, 4.8], [2.0, 1.5]], "direction": "up"},
        {"id": "a3", "points": [[2.8, 4.8], [5.2, 4.8]], "direction": "right"},
        {"id": "a4", "points": [[4.8, 1.8], [2.4, 1.8]], "direction": "left"},
        {"id": "a5", "points": [[1.5, 1.0], [5.2, 1.0]], "direction": "right"},
        {"id": "a6", "points": [[1.2, 2.5], [1.2, 5.5], [4.8, 5.5]], "direction": "right"},
        {"id": "a7", "points": [[5.5, 1.0], [5.5, 6.0]], "direction": "down"},
        {"id": "a8", "points": [[4.5, 3.5], [4.5, 2.5]], "direction": "up"}
    ]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET arrows = EXCLUDED.arrows;

-- Level 3: The Exact Maze from Screenshot 2!
-- 8 arrows with bends, U-turn, hook, and directional flow
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    3,
    'The Maze',
    'Normal',
    8,
    '[
        {"id": "a1", "points": [[2, 1.5], [2, 3.2]], "direction": "down"},
        {"id": "a2", "points": [[2, 4.4], [2, 6.8], [3.8, 6.8]], "direction": "right"},
        {"id": "a3", "points": [[3, 6.2], [3, 2.8]], "direction": "up"},
        {"id": "a4", "points": [[3.8, 1.5], [6.2, 1.5], [6.2, 2.2]], "direction": "right"},
        {"id": "a5", "points": [[4.2, 2.7], [3.8, 2.7], [3.8, 4.4]], "direction": "down"},
        {"id": "a6", "points": [[4.6, 4.3], [4.6, 5.2], [5.4, 5.2], [5.4, 3.2]], "direction": "up"},
        {"id": "a7", "points": [[6.2, 6.2], [4.4, 6.2]], "direction": "left"},
        {"id": "a8", "points": [[4.4, 6.8], [6.2, 6.8], [6.2, 3.2]], "direction": "up"}
    ]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET arrows = EXCLUDED.arrows;

-- Level 4: Intricate Weave
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    4,
    'Double Loop',
    'Normal',
    8,
    '[
        {"id": "a1", "points": [[1.5, 1.5], [6.5, 1.5]], "direction": "right"},
        {"id": "a2", "points": [[6.5, 2.5], [2.5, 2.5], [2.5, 5.5]], "direction": "down"},
        {"id": "a3", "points": [[3.5, 5.5], [3.5, 3.5], [5.5, 3.5]], "direction": "right"},
        {"id": "a4", "points": [[5.5, 4.5], [4.5, 4.5], [4.5, 6.5]], "direction": "down"},
        {"id": "a5", "points": [[1.5, 6.5], [3.5, 6.5]], "direction": "right"},
        {"id": "a6", "points": [[6.5, 6.5], [6.5, 3.5]], "direction": "up"},
        {"id": "a7", "points": [[5.5, 6.5], [5.5, 7.5]], "direction": "down"}
    ]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET arrows = EXCLUDED.arrows;

-- Level 5: Master Tangle
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    5,
    'Centrifuge',
    'Hard',
    9,
    '[
        {"id": "a1", "points": [[1.5, 4.5], [1.5, 1.5], [4.5, 1.5]], "direction": "right"},
        {"id": "a2", "points": [[4.5, 1.5], [7.5, 1.5], [7.5, 4.5]], "direction": "down"},
        {"id": "a3", "points": [[7.5, 4.5], [7.5, 7.5], [4.5, 7.5]], "direction": "left"},
        {"id": "a4", "points": [[4.5, 7.5], [1.5, 7.5], [1.5, 4.5]], "direction": "up"},
        {"id": "a5", "points": [[3, 3], [5, 3]], "direction": "right"},
        {"id": "a6", "points": [[5, 3], [5, 5]], "direction": "down"},
        {"id": "a7", "points": [[5, 5], [3, 5]], "direction": "left"},
        {"id": "a8", "points": [[3, 5], [3, 3.5]], "direction": "up"}
    ]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET arrows = EXCLUDED.arrows;
