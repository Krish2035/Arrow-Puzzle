import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Arrow Puzzle Backend API',
    version: '1.0.0',
    description: `High-Performance Production REST API for the **Arrow Puzzle** Game.
    
### Core Architecture Highlights:
- **Horizontal Scaling & Load Balancing**: Multi-core cluster worker support & Nginx reverse proxy load balancer.
- **Read Replica & Primary DB**: Dual-pool connection routing for split read/write traffic.
- **Redis High-Performance Caching**: Multi-tier caching with TTL and resilient in-memory fallback.
- **Search Index**: Multi-attribute level search index with filtering.
- **Drizzle ORM & Postgres**: Modern type-safe data access layer.
- **Rate Limiting**: Automated protection against DDoS and abuse.`,
    contact: {
      name: 'Arrow Puzzle Team',
      url: 'https://github.com/Krish2035/Arrow-Puzzle'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Primary Node / Load Balancer'
    },
    {
      url: 'https://arrow-puzzle.onrender.com',
      description: 'Production Cloud'
    }
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'System health check',
        description: 'Returns operational status, database connectivity, and cache statistics.',
        tags: ['System'],
        responses: {
          200: {
            description: 'API is running healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', example: '2026-10-09T15:20:00.000Z' },
                    service: { type: 'string', example: 'Arrow Puzzle Backend API' },
                    database: { type: 'string', example: 'connected' },
                    readReplica: { type: 'string', example: 'ready' },
                    cache: { type: 'string', example: 'redis / in-memory' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/levels': {
      get: {
        summary: 'Get summary catalog of all 100 levels',
        tags: ['Levels'],
        responses: {
          200: {
            description: 'List of all 100 levels with metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/LevelSummary' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/levels/search': {
      get: {
        summary: 'Search and filter levels through the search index',
        tags: ['Levels', 'Search'],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Keyword or search text' },
          { name: 'difficulty', in: 'query', schema: { type: 'string', enum: ['all', 'easy', 'medium', 'hard', 'master'] } },
          { name: 'minArrows', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'maxArrows', in: 'query', schema: { type: 'integer', default: 999 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
        ],
        responses: {
          200: {
            description: 'Search results matching criteria',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 100 },
                        count: { type: 'integer', example: 20 },
                        results: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/LevelSummary' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/levels/{levelNumber}': {
      get: {
        summary: 'Get complete puzzle board for specific level',
        tags: ['Levels'],
        parameters: [
          { name: 'levelNumber', in: 'path', required: true, schema: { type: 'integer', minimum: 1, maximum: 100 } }
        ],
        responses: {
          200: {
            description: 'Puzzle data with verifiable arrow pathways',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/LevelDetail' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Level not found'
          }
        }
      }
    },
    '/api/levels/{levelNumber}/complete': {
      post: {
        summary: 'Submit win results for a level',
        tags: ['Levels', 'Game Progress'],
        parameters: [
          { name: 'levelNumber', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  heartsLeft: { type: 'integer', default: 3, minimum: 1, maximum: 3 },
                  timeSeconds: { type: 'integer', default: 25 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Victory recorded and user stats updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        next_level: { type: 'integer', example: 4 },
                        profile: { $ref: '#/components/schemas/UserProfile' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/levels/daily/today': {
      get: {
        summary: 'Get today’s unique daily challenge maze',
        tags: ['Levels', 'Daily Challenge'],
        responses: {
          200: {
            description: 'Today’s daily challenge level board',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/LevelDetail' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/user/profile': {
      get: {
        summary: 'Fetch current user player profile & progress stats',
        tags: ['User'],
        responses: {
          200: {
            description: 'Current user profile stats',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserProfile' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/user/sync': {
      post: {
        summary: 'Sync user profile and Firebase Google account authentication data',
        tags: ['User', 'Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserProfile' }
            }
          }
        },
        responses: {
          200: {
            description: 'Synchronized user profile across devices',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserProfile' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      LevelSummary: {
        type: 'object',
        properties: {
          level_number: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Level 1' },
          difficulty: { type: 'string', example: 'easy' },
          grid_size: { type: 'integer', example: 6 },
          arrow_count: { type: 'integer', example: 5 }
        }
      },
      LevelDetail: {
        type: 'object',
        properties: {
          level_number: { type: 'integer', example: 3 },
          title: { type: 'string', example: 'Level 3' },
          difficulty: { type: 'string', example: 'easy' },
          grid_size: { type: 'integer', example: 6 },
          arrows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                direction: { type: 'string', enum: ['up', 'down', 'left', 'right'], example: 'right' },
                points: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: { type: 'number' }
                  },
                  example: [[1, 2], [3, 2]]
                }
              }
            }
          }
        }
      },
      UserProfile: {
        type: 'object',
        properties: {
          uid: { type: 'string', example: 'firebase-uid-123' },
          username: { type: 'string', example: 'Arrow Master' },
          email: { type: 'string', example: 'player@example.com' },
          photoURL: { type: 'string', example: 'https://lh3.googleusercontent.com/...' },
          current_level: { type: 'integer', example: 4 },
          hearts: { type: 'integer', example: 3 },
          hints: { type: 'integer', example: 2 },
          stars: { type: 'integer', example: 9 },
          completed_levels: {
            type: 'array',
            items: { type: 'integer' },
            example: [1, 2, 3]
          }
        }
      }
    }
  }
};

export const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Arrow Puzzle API Documentation'
};

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
  app.use('/docs', (req, res) => res.redirect('/api/docs'));
  console.log('📖 Swagger UI documentation available at /api/docs');
}
