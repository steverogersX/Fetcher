import { z } from 'zod';
import { githubProfileSchema } from '@/types/github';

const envelope = (dataSchema: object) => ({
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', example: true },
    data: dataSchema,
  },
});

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Fetcher API',
    description:
      'Fetches public GitHub profile data by username and stores insights in MySQL.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://fetcher-production-da21.up.railway.app',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local',
    },
  ],
  tags: [{ name: 'Profiles' }, { name: 'Health' }],
  paths: {
    '/api/v1/profiles': {
      get: {
        tags: ['Profiles'],
        summary: 'List all stored profiles',
        description: 'Returns every GitHub profile that has previously been fetched and stored.',
        operationId: 'listProfiles',
        responses: {
          '200': {
            description: 'Stored profiles',
            content: {
              'application/json': {
                schema: envelope({
                  type: 'array',
                  items: { $ref: '#/components/schemas/StoredProfile' },
                }),
                example: {
                  success: true,
                  data: [
                    {
                      githubId: 1024025,
                      login: 'torvalds',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                      htmlUrl: 'https://github.com/torvalds',
                      name: 'Linus Torvalds',
                      company: 'Linux Foundation',
                      blog: '',
                      location: 'Portland, OR',
                      bio: null,
                      email: null,
                      publicRepos: 8,
                      publicGists: 1,
                      followers: 246000,
                      following: 0,
                      githubCreatedAt: '2011-09-03T15:26:22.000Z',
                      githubUpdatedAt: '2024-11-08T17:07:39.000Z',
                      fetchedAt: '2026-06-06T05:19:50.000Z',
                    },
                  ],
                },
              },
            },
          },
          '503': { $ref: '#/components/responses/DatabaseError' },
        },
      },
    },
    '/api/v1/profiles/{username}': {
      get: {
        tags: ['Profiles'],
        summary: 'Fetch a profile by username',
        description:
          'Fetches live data from the GitHub API, upserts it into the database, and returns the result.',
        operationId: 'getProfileByUsername',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            description: 'GitHub username — 1–39 chars, alphanumeric and hyphens only',
            schema: {
              type: 'string',
              minLength: 1,
              maxLength: 39,
              pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$',
            },
            example: 'torvalds',
          },
        ],
        responses: {
          '200': {
            description: 'GitHub profile',
            content: {
              'application/json': {
                schema: envelope({ $ref: '#/components/schemas/GithubProfile' }),
                example: {
                  success: true,
                  data: {
                    login: 'torvalds',
                    id: 1024025,
                    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                    htmlUrl: 'https://github.com/torvalds',
                    name: 'Linus Torvalds',
                    company: 'Linux Foundation',
                    blog: '',
                    location: 'Portland, OR',
                    bio: null,
                    email: null,
                    publicRepos: 8,
                    publicGists: 1,
                    followers: 246000,
                    following: 0,
                    createdAt: '2011-09-03T15:26:22Z',
                    updatedAt: '2024-11-08T17:07:39Z',
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '422': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/RateLimit' },
          '503': { $ref: '#/components/responses/DatabaseError' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Server is up',
            content: {
              'application/json': {
                schema: envelope({
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    uptime: { type: 'number', example: 120.5 },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                }),
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      GithubProfile: z.toJSONSchema(githubProfileSchema),
      StoredProfile: {
        type: 'object',
        required: [
          'githubId',
          'login',
          'avatarUrl',
          'htmlUrl',
          'publicRepos',
          'publicGists',
          'followers',
          'following',
          'githubCreatedAt',
          'githubUpdatedAt',
          'fetchedAt',
        ],
        properties: {
          githubId: { type: 'integer', example: 1024025 },
          login: { type: 'string', example: 'torvalds' },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://avatars.githubusercontent.com/u/1024025?v=4',
          },
          htmlUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://github.com/torvalds',
          },
          name: { type: 'string', nullable: true, example: 'Linus Torvalds' },
          company: { type: 'string', nullable: true, example: 'Linux Foundation' },
          blog: { type: 'string', nullable: true, example: '' },
          location: { type: 'string', nullable: true, example: 'Portland, OR' },
          bio: { type: 'string', nullable: true, example: null },
          email: { type: 'string', nullable: true, example: null },
          publicRepos: { type: 'integer', example: 8 },
          publicGists: { type: 'integer', example: 1 },
          followers: { type: 'integer', example: 246000 },
          following: { type: 'integer', example: 0 },
          githubCreatedAt: { type: 'string', format: 'date-time' },
          githubUpdatedAt: { type: 'string', format: 'date-time' },
          fetchedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            required: ['message', 'code'],
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      NotFound: {
        description: 'GitHub user not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: {
                message: "GitHub user 'ghost' not found",
                code: 'GITHUB_USER_NOT_FOUND',
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Username failed format validation',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: {
                message: 'id: Invalid GitHub username format',
                code: 'VALIDATION_ERROR',
              },
            },
          },
        },
      },
      RateLimit: {
        description: 'GitHub API rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: {
                message:
                  'GitHub API rate limit exceeded. Resets at 2026-06-06T06:00:00.000Z',
                code: 'GITHUB_RATE_LIMIT',
              },
            },
          },
        },
      },
      DatabaseError: {
        description: 'Database unavailable',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { message: 'Failed to retrieve profiles', code: 'DB_READ_ERROR' },
            },
          },
        },
      },
    },
  },
};
