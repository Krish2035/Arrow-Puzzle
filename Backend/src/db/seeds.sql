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

-- Level 6: Heart of Courage (Hard - 38 arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    6,
    'Heart of Courage',
    'Hard',
    18,
    '[{"id":"a1","points":[[5,11],[5,8]],"direction":"up"},{"id":"a2","points":[[10,2],[11,2]],"direction":"right"},{"id":"a3","points":[[2,2],[6,2],[6,3],[8,3]],"direction":"right"},{"id":"a4","points":[[16,4],[15,4]],"direction":"left"},{"id":"a5","points":[[9,5],[9,3]],"direction":"up"},{"id":"a6","points":[[8,9],[6,9],[6,7],[9,7]],"direction":"right"},{"id":"a7","points":[[12,2],[13,2]],"direction":"right"},{"id":"a8","points":[[10,7],[13,7]],"direction":"right"},{"id":"a9","points":[[14,8],[14,7]],"direction":"up"},{"id":"a10","points":[[13,5],[13,4],[14,4],[14,2]],"direction":"up"},{"id":"a11","points":[[7,10],[7,11],[11,11]],"direction":"right"},{"id":"a12","points":[[6,6],[4,6]],"direction":"left"},{"id":"a13","points":[[10,12],[7,12]],"direction":"left"},{"id":"a14","points":[[6,10],[6,12]],"direction":"down"},{"id":"a15","points":[[8,14],[8,13],[6,13]],"direction":"left"},{"id":"a16","points":[[9,13],[9,14]],"direction":"down"},{"id":"a17","points":[[8,16],[9,16]],"direction":"right"},{"id":"a18","points":[[7,6],[8,6]],"direction":"right"},{"id":"a19","points":[[8,4],[6,4]],"direction":"left"},{"id":"a20","points":[[12,8],[12,9]],"direction":"down"},{"id":"a21","points":[[12,10],[12,11]],"direction":"down"},{"id":"a22","points":[[3,5],[3,7]],"direction":"down"},{"id":"a23","points":[[5,4],[2,4]],"direction":"left"},{"id":"a24","points":[[10,3],[10,6],[12,6]],"direction":"right"},{"id":"a25","points":[[5,3],[3,3]],"direction":"left"},{"id":"a26","points":[[2,5],[2,6]],"direction":"down"},{"id":"a27","points":[[13,8],[13,10]],"direction":"down"},{"id":"a28","points":[[2,3],[1,3]],"direction":"left"},{"id":"a29","points":[[13,6],[14,6]],"direction":"right"},{"id":"a30","points":[[15,5],[15,6]],"direction":"down"},{"id":"a31","points":[[1,4],[1,5]],"direction":"down"},{"id":"a32","points":[[15,3],[16,3]],"direction":"right"},{"id":"a33","points":[[4,8],[3,8]],"direction":"left"},{"id":"a34","points":[[10,13],[10,15]],"direction":"down"},{"id":"a35","points":[[11,12],[11,13]],"direction":"down"},{"id":"a36","points":[[9,15],[8,15]],"direction":"left"},{"id":"a37","points":[[7,14],[7,15]],"direction":"down"},{"id":"a38","points":[[4,9],[4,10]],"direction":"down"}]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET 
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    grid_size = EXCLUDED.grid_size,
    arrows = EXCLUDED.arrows;

-- Level 9: Grand Labyrinth (Normal - 54 arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    9,
    'Grand Labyrinth',
    'Normal',
    20,
    '[{"id":"a1","points":[[12,10],[10,10],[10,12]],"direction":"down"},{"id":"a2","points":[[9,5],[9,6],[11,6],[11,3]],"direction":"up"},{"id":"a3","points":[[9,10],[8,10]],"direction":"left"},{"id":"a4","points":[[9,1],[9,2],[4,2]],"direction":"left"},{"id":"a5","points":[[13,13],[13,15],[15,15]],"direction":"right"},{"id":"a6","points":[[10,3],[10,1]],"direction":"up"},{"id":"a7","points":[[12,15],[8,15]],"direction":"left"},{"id":"a8","points":[[6,10],[6,14]],"direction":"down"},{"id":"a9","points":[[16,2],[16,5]],"direction":"down"},{"id":"a10","points":[[1,3],[1,5]],"direction":"down"},{"id":"a11","points":[[14,18],[11,18]],"direction":"left"},{"id":"a12","points":[[12,6],[12,4]],"direction":"up"},{"id":"a13","points":[[5,8],[5,10]],"direction":"down"},{"id":"a14","points":[[11,7],[7,7],[7,9]],"direction":"down"},{"id":"a15","points":[[1,16],[3,16]],"direction":"right"},{"id":"a16","points":[[11,1],[13,1]],"direction":"right"},{"id":"a17","points":[[3,7],[3,5]],"direction":"up"},{"id":"a18","points":[[13,10],[14,10]],"direction":"right"},{"id":"a19","points":[[5,11],[5,13]],"direction":"down"},{"id":"a20","points":[[3,14],[4,14],[4,13],[2,13]],"direction":"left"},{"id":"a21","points":[[8,9],[10,9]],"direction":"right"},{"id":"a22","points":[[16,6],[16,9]],"direction":"down"},{"id":"a23","points":[[4,15],[4,17]],"direction":"down"},{"id":"a24","points":[[7,17],[7,19]],"direction":"down"},{"id":"a25","points":[[14,9],[14,7]],"direction":"up"},{"id":"a26","points":[[3,17],[2,17]],"direction":"left"},{"id":"a27","points":[[3,8],[3,11],[1,11]],"direction":"left"},{"id":"a28","points":[[15,16],[15,19]],"direction":"down"},{"id":"a29","points":[[3,15],[2,15]],"direction":"left"},{"id":"a30","points":[[3,4],[3,2]],"direction":"up"},{"id":"a31","points":[[2,18],[5,18],[5,19],[3,19]],"direction":"left"},{"id":"a32","points":[[13,5],[14,5],[14,2]],"direction":"up"},{"id":"a33","points":[[8,1],[6,1]],"direction":"left"},{"id":"a34","points":[[15,8],[15,6]],"direction":"up"},{"id":"a35","points":[[16,13],[16,15]],"direction":"down"},{"id":"a36","points":[[2,6],[1,6]],"direction":"left"},{"id":"a37","points":[[16,16],[16,17]],"direction":"down"},{"id":"a38","points":[[6,16],[6,18]],"direction":"down"},{"id":"a39","points":[[2,8],[1,8]],"direction":"left"},{"id":"a40","points":[[1,17],[1,18]],"direction":"down"},{"id":"a41","points":[[15,10],[16,10]],"direction":"right"},{"id":"a42","points":[[13,12],[16,12]],"direction":"right"},{"id":"a43","points":[[7,16],[10,16],[10,18]],"direction":"down"},{"id":"a44","points":[[2,5],[2,3]],"direction":"up"},{"id":"a45","points":[[11,11],[13,11]],"direction":"right"},{"id":"a46","points":[[14,11],[15,11]],"direction":"right"},{"id":"a47","points":[[4,12],[3,12]],"direction":"left"},{"id":"a48","points":[[8,17],[8,18]],"direction":"down"},{"id":"a49","points":[[2,19],[1,19]],"direction":"left"},{"id":"a50","points":[[15,5],[15,3]],"direction":"up"},{"id":"a51","points":[[5,1],[3,1]],"direction":"left"},{"id":"a52","points":[[2,14],[1,14]],"direction":"left"},{"id":"a53","points":[[9,17],[9,19]],"direction":"down"},{"id":"a54","points":[[2,2],[1,2]],"direction":"left"}]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET 
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    grid_size = EXCLUDED.grid_size,
    arrows = EXCLUDED.arrows;

-- Level 10: Sands of Time (Hard - 85 arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    10,
    'Sands of Time',
    'Hard',
    26,
    '[{"id":"a1","points":[[8,25],[8,24],[10,24]],"direction":"right"},{"id":"a2","points":[[12,6],[12,7],[9,7]],"direction":"left"},{"id":"a3","points":[[19,5],[17,5]],"direction":"left"},{"id":"a4","points":[[10,4],[10,6],[8,6]],"direction":"left"},{"id":"a5","points":[[7,4],[6,4],[6,6]],"direction":"down"},{"id":"a6","points":[[10,17],[10,16],[12,16]],"direction":"right"},{"id":"a7","points":[[7,23],[7,25]],"direction":"down"},{"id":"a8","points":[[9,18],[14,18]],"direction":"right"},{"id":"a9","points":[[12,3],[18,3]],"direction":"right"},{"id":"a10","points":[[8,13],[10,13]],"direction":"right"},{"id":"a11","points":[[15,19],[15,24]],"direction":"down"},{"id":"a12","points":[[13,21],[13,20],[11,20]],"direction":"left"},{"id":"a13","points":[[16,21],[17,21]],"direction":"right"},{"id":"a14","points":[[16,9],[12,9]],"direction":"left"},{"id":"a15","points":[[15,1],[17,1]],"direction":"right"},{"id":"a16","points":[[2,23],[5,23],[5,25]],"direction":"down"},{"id":"a17","points":[[8,17],[8,20],[6,20]],"direction":"left"},{"id":"a18","points":[[6,8],[8,8]],"direction":"right"},{"id":"a19","points":[[8,3],[8,1]],"direction":"up"},{"id":"a20","points":[[4,24],[2,24]],"direction":"left"},{"id":"a21","points":[[7,3],[2,3]],"direction":"left"},{"id":"a22","points":[[17,22],[17,23]],"direction":"down"},{"id":"a23","points":[[7,2],[6,2]],"direction":"left"},{"id":"a24","points":[[20,23],[20,24]],"direction":"down"},{"id":"a25","points":[[11,10],[9,10]],"direction":"left"},{"id":"a26","points":[[13,7],[15,7]],"direction":"right"},{"id":"a27","points":[[12,22],[8,22]],"direction":"left"},{"id":"a28","points":[[9,12],[13,12]],"direction":"right"},{"id":"a29","points":[[14,17],[14,15],[10,15]],"direction":"left"},{"id":"a30","points":[[9,11],[12,11]],"direction":"right"},{"id":"a31","points":[[7,18],[6,18]],"direction":"left"},{"id":"a32","points":[[10,20],[9,20],[9,21],[7,21]],"direction":"left"},{"id":"a33","points":[[19,1],[21,1]],"direction":"right"},{"id":"a34","points":[[12,4],[14,4]],"direction":"right"},{"id":"a35","points":[[8,10],[7,10]],"direction":"left"},{"id":"a36","points":[[5,1],[2,1]],"direction":"left"},{"id":"a37","points":[[6,21],[3,21]],"direction":"left"},{"id":"a38","points":[[17,4],[19,4]],"direction":"right"},{"id":"a39","points":[[17,2],[20,2]],"direction":"right"},{"id":"a40","points":[[6,22],[4,22]],"direction":"left"},{"id":"a41","points":[[18,22],[18,24]],"direction":"down"},{"id":"a42","points":[[9,17],[9,15],[7,15]],"direction":"left"},{"id":"a43","points":[[16,19],[17,19]],"direction":"right"},{"id":"a44","points":[[16,7],[17,7]],"direction":"right"},{"id":"a45","points":[[13,22],[13,23]],"direction":"down"},{"id":"a46","points":[[14,25],[16,25]],"direction":"right"},{"id":"a47","points":[[19,21],[19,22]],"direction":"down"},{"id":"a48","points":[[11,14],[9,14]],"direction":"left"},{"id":"a49","points":[[15,17],[16,17]],"direction":"right"},{"id":"a50","points":[[13,11],[14,11]],"direction":"right"},{"id":"a51","points":[[12,14],[13,14]],"direction":"right"},{"id":"a52","points":[[9,8],[13,8]],"direction":"right"},{"id":"a53","points":[[5,2],[4,2]],"direction":"left"},{"id":"a54","points":[[13,6],[14,6]],"direction":"right"},{"id":"a55","points":[[11,23],[11,25]],"direction":"down"},{"id":"a56","points":[[17,24],[17,25]],"direction":"down"},{"id":"a57","points":[[11,6],[11,5]],"direction":"up"},{"id":"a58","points":[[12,23],[12,24]],"direction":"down"},{"id":"a59","points":[[11,9],[10,9]],"direction":"left"},{"id":"a60","points":[[12,10],[13,10]],"direction":"right"},{"id":"a61","points":[[12,2],[12,1]],"direction":"up"},{"id":"a62","points":[[14,8],[16,8]],"direction":"right"},{"id":"a63","points":[[10,3],[10,1]],"direction":"up"},{"id":"a64","points":[[8,9],[6,9]],"direction":"left"},{"id":"a65","points":[[11,13],[12,13]],"direction":"right"},{"id":"a66","points":[[11,4],[11,2]],"direction":"up"},{"id":"a67","points":[[9,5],[9,2]],"direction":"up"},{"id":"a68","points":[[15,6],[16,6]],"direction":"right"},{"id":"a69","points":[[7,19],[5,19]],"direction":"left"},{"id":"a70","points":[[5,20],[4,20]],"direction":"left"},{"id":"a71","points":[[18,25],[20,25]],"direction":"right"},{"id":"a72","points":[[4,25],[3,25]],"direction":"left"},{"id":"a73","points":[[16,20],[18,20]],"direction":"right"},{"id":"a74","points":[[5,5],[3,5]],"direction":"left"},{"id":"a75","points":[[17,6],[18,6]],"direction":"right"},{"id":"a76","points":[[2,25],[1,25]],"direction":"left"},{"id":"a77","points":[[8,7],[7,7]],"direction":"left"},{"id":"a78","points":[[13,24],[13,25]],"direction":"down"},{"id":"a79","points":[[14,10],[15,10]],"direction":"right"},{"id":"a80","points":[[6,23],[6,24]],"direction":"down"},{"id":"a81","points":[[14,2],[14,1]],"direction":"up"},{"id":"a82","points":[[5,4],[4,4]],"direction":"left"},{"id":"a83","points":[[5,6],[4,6]],"direction":"left"},{"id":"a84","points":[[6,7],[5,7]],"direction":"left"},{"id":"a85","points":[[13,13],[14,13]],"direction":"right"}]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET 
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    grid_size = EXCLUDED.grid_size,
    arrows = EXCLUDED.arrows;

-- Level 14: Twin Pillars (Normal - 70 arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    14,
    'Twin Pillars',
    'Normal',
    22,
    '[{"id":"a1","points":[[6,6],[3,6]],"direction":"left"},{"id":"a2","points":[[16,14],[15,14],[15,17]],"direction":"down"},{"id":"a3","points":[[12,16],[13,16],[13,14]],"direction":"up"},{"id":"a4","points":[[15,19],[13,19],[13,18],[15,18]],"direction":"right"},{"id":"a5","points":[[13,12],[13,10]],"direction":"up"},{"id":"a6","points":[[2,6],[1,6]],"direction":"left"},{"id":"a7","points":[[17,16],[16,16],[16,18]],"direction":"down"},{"id":"a8","points":[[17,20],[16,20]],"direction":"left"},{"id":"a9","points":[[8,2],[8,3],[5,3]],"direction":"left"},{"id":"a10","points":[[14,20],[10,20]],"direction":"left"},{"id":"a11","points":[[4,5],[4,3]],"direction":"up"},{"id":"a12","points":[[7,2],[6,2]],"direction":"left"},{"id":"a13","points":[[5,2],[4,2]],"direction":"left"},{"id":"a14","points":[[14,16],[14,17],[12,17]],"direction":"left"},{"id":"a15","points":[[16,21],[13,21]],"direction":"left"},{"id":"a16","points":[[3,4],[3,2]],"direction":"up"},{"id":"a17","points":[[9,20],[6,20]],"direction":"left"},{"id":"a18","points":[[12,21],[11,21]],"direction":"left"},{"id":"a19","points":[[1,9],[3,9]],"direction":"right"},{"id":"a20","points":[[10,19],[10,17],[8,17]],"direction":"left"},{"id":"a21","points":[[1,1],[3,1]],"direction":"right"},{"id":"a22","points":[[5,7],[8,7]],"direction":"right"},{"id":"a23","points":[[5,9],[9,9]],"direction":"right"},{"id":"a24","points":[[6,8],[13,8]],"direction":"right"},{"id":"a25","points":[[14,8],[16,8]],"direction":"right"},{"id":"a26","points":[[6,18],[1,18]],"direction":"left"},{"id":"a27","points":[[10,6],[13,6]],"direction":"right"},{"id":"a28","points":[[14,7],[14,6]],"direction":"up"},{"id":"a29","points":[[14,10],[15,10]],"direction":"right"},{"id":"a30","points":[[14,12],[15,12]],"direction":"right"},{"id":"a31","points":[[14,5],[14,4]],"direction":"up"},{"id":"a32","points":[[12,10],[10,10]],"direction":"left"},{"id":"a33","points":[[10,9],[11,9]],"direction":"right"},{"id":"a34","points":[[11,5],[11,4]],"direction":"up"},{"id":"a35","points":[[5,13],[7,13]],"direction":"right"},{"id":"a36","points":[[11,16],[7,16]],"direction":"left"},{"id":"a37","points":[[12,11],[11,11]],"direction":"left"},{"id":"a38","points":[[17,10],[17,8]],"direction":"up"},{"id":"a39","points":[[11,12],[11,13],[13,13]],"direction":"right"},{"id":"a40","points":[[16,12],[17,12]],"direction":"right"},{"id":"a41","points":[[6,16],[4,16]],"direction":"left"},{"id":"a42","points":[[14,13],[16,13]],"direction":"right"},{"id":"a43","points":[[10,11],[6,11]],"direction":"left"},{"id":"a44","points":[[4,14],[4,11],[2,11]],"direction":"left"},{"id":"a45","points":[[15,7],[15,5]],"direction":"up"},{"id":"a46","points":[[10,21],[9,21]],"direction":"left"},{"id":"a47","points":[[4,17],[2,17]],"direction":"left"},{"id":"a48","points":[[14,11],[16,11]],"direction":"right"},{"id":"a49","points":[[9,10],[7,10]],"direction":"left"},{"id":"a50","points":[[5,1],[7,1]],"direction":"right"},{"id":"a51","points":[[9,3],[11,3]],"direction":"right"},{"id":"a52","points":[[8,1],[13,1]],"direction":"right"},{"id":"a53","points":[[15,4],[15,3]],"direction":"up"},{"id":"a54","points":[[3,16],[1,16]],"direction":"left"},{"id":"a55","points":[[10,15],[8,15]],"direction":"left"},{"id":"a56","points":[[14,3],[14,1]],"direction":"up"},{"id":"a57","points":[[6,10],[5,10]],"direction":"left"},{"id":"a58","points":[[16,7],[17,7]],"direction":"right"},{"id":"a59","points":[[9,19],[8,19]],"direction":"left"},{"id":"a60","points":[[7,15],[5,15]],"direction":"left"},{"id":"a61","points":[[7,19],[5,19]],"direction":"left"},{"id":"a62","points":[[5,20],[3,20]],"direction":"left"},{"id":"a63","points":[[2,19],[2,20]],"direction":"down"},{"id":"a64","points":[[8,21],[7,21]],"direction":"left"},{"id":"a65","points":[[4,21],[2,21]],"direction":"left"},{"id":"a66","points":[[15,1],[16,1]],"direction":"right"},{"id":"a67","points":[[1,19],[1,21]],"direction":"down"},{"id":"a68","points":[[5,8],[4,8]],"direction":"left"},{"id":"a69","points":[[4,15],[3,15]],"direction":"left"},{"id":"a70","points":[[3,8],[2,8]],"direction":"left"}]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET 
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    grid_size = EXCLUDED.grid_size,
    arrows = EXCLUDED.arrows;

-- Level 16: Emerald Peak (Hard - 61 arrows)
INSERT INTO levels (level_number, title, difficulty, grid_size, arrows)
VALUES (
    16,
    'Emerald Peak',
    'Hard',
    22,
    '[{"id":"a1","points":[[15,13],[14,13],[14,12],[10,12]],"direction":"left"},{"id":"a2","points":[[8,8],[11,8],[11,9],[9,9]],"direction":"left"},{"id":"a3","points":[[4,9],[6,9],[6,11]],"direction":"down"},{"id":"a4","points":[[12,11],[12,10]],"direction":"up"},{"id":"a5","points":[[9,10],[9,12]],"direction":"down"},{"id":"a6","points":[[3,20],[1,20]],"direction":"left"},{"id":"a7","points":[[10,13],[6,13]],"direction":"left"},{"id":"a8","points":[[4,10],[4,13]],"direction":"down"},{"id":"a9","points":[[15,12],[16,12]],"direction":"right"},{"id":"a10","points":[[2,18],[4,18],[4,20]],"direction":"down"},{"id":"a11","points":[[7,8],[7,5]],"direction":"up"},{"id":"a12","points":[[14,14],[14,15]],"direction":"down"},{"id":"a13","points":[[7,16],[2,16]],"direction":"left"},{"id":"a14","points":[[9,4],[12,4]],"direction":"right"},{"id":"a15","points":[[11,16],[11,18],[14,18]],"direction":"right"},{"id":"a16","points":[[12,9],[13,9]],"direction":"right"},{"id":"a17","points":[[10,17],[9,17],[9,19]],"direction":"down"},{"id":"a18","points":[[9,7],[9,6],[8,6],[8,4]],"direction":"up"},{"id":"a19","points":[[13,17],[15,17]],"direction":"right"},{"id":"a20","points":[[6,17],[6,20],[9,20]],"direction":"right"},{"id":"a21","points":[[12,19],[12,20]],"direction":"down"},{"id":"a22","points":[[2,21],[4,21]],"direction":"right"},{"id":"a23","points":[[11,2],[11,3],[8,3]],"direction":"left"},{"id":"a24","points":[[14,19],[14,20],[17,20]],"direction":"right"},{"id":"a25","points":[[6,21],[8,21]],"direction":"right"},{"id":"a26","points":[[13,14],[11,14]],"direction":"left"},{"id":"a27","points":[[10,14],[9,14]],"direction":"left"},{"id":"a28","points":[[15,19],[18,19]],"direction":"right"},{"id":"a29","points":[[14,11],[14,9]],"direction":"up"},{"id":"a30","points":[[13,4],[14,4]],"direction":"right"},{"id":"a31","points":[[11,21],[14,21]],"direction":"right"},{"id":"a32","points":[[6,7],[5,7]],"direction":"left"},{"id":"a33","points":[[10,6],[11,6]],"direction":"right"},{"id":"a34","points":[[10,18],[10,20]],"direction":"down"},{"id":"a35","points":[[7,14],[5,14]],"direction":"left"},{"id":"a36","points":[[5,17],[3,17]],"direction":"left"},{"id":"a37","points":[[4,8],[4,7]],"direction":"up"},{"id":"a38","points":[[17,18],[17,17]],"direction":"up"},{"id":"a39","points":[[10,2],[9,2]],"direction":"left"},{"id":"a40","points":[[7,4],[7,3]],"direction":"up"},{"id":"a41","points":[[5,15],[3,15]],"direction":"left"},{"id":"a42","points":[[15,15],[16,15]],"direction":"right"},{"id":"a43","points":[[5,18],[5,19]],"direction":"down"},{"id":"a44","points":[[8,2],[7,2]],"direction":"left"},{"id":"a45","points":[[12,16],[13,16]],"direction":"right"},{"id":"a46","points":[[6,4],[5,4]],"direction":"left"},{"id":"a47","points":[[7,1],[8,1]],"direction":"right"},{"id":"a48","points":[[10,7],[12,7],[12,8],[14,8]],"direction":"right"},{"id":"a49","points":[[3,14],[3,12]],"direction":"up"},{"id":"a50","points":[[17,16],[17,15]],"direction":"up"},{"id":"a51","points":[[9,1],[10,1]],"direction":"right"},{"id":"a52","points":[[11,1],[12,1]],"direction":"right"},{"id":"a53","points":[[5,20],[5,21]],"direction":"down"},{"id":"a54","points":[[9,5],[10,5]],"direction":"right"},{"id":"a55","points":[[12,6],[14,6]],"direction":"right"},{"id":"a56","points":[[16,11],[15,11],[15,8]],"direction":"up"},{"id":"a57","points":[[15,21],[16,21]],"direction":"right"},{"id":"a58","points":[[18,20],[18,21]],"direction":"down"},{"id":"a59","points":[[11,5],[13,5]],"direction":"right"},{"id":"a60","points":[[13,7],[15,7]],"direction":"right"},{"id":"a61","points":[[3,19],[2,19]],"direction":"left"}]'::jsonb
) ON CONFLICT (level_number) DO UPDATE SET 
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    grid_size = EXCLUDED.grid_size,
    arrows = EXCLUDED.arrows;
