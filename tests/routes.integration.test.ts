import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../server/routes';
import { getTestAuthToken } from './helpers';

describe('Integration Test Suite', () => {
  let server: import('http').Server;
  let token: string;

  beforeAll(async () => {
    const app = express();
    server = await registerRoutes(app);
    token = await getTestAuthToken();
  });

  afterAll((done) => { server.close(done); });

  // Topics
  describe('Topics API', () => {
    let topicId: string;

    it('rejects unauthorized GET /api/topics', async () => {
      await request(server).get('/api/topics').expect(401);
    });

    it('creates a topic', async () => {
      const res = await request(server)
        .post('/api/topics')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Integration Test Topic' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      topicId = res.body.id;
    });

    it('gets all topics', async () => {
      const res = await request(server)
        .get('/api/topics')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deletes the topic', async () => {
      await request(server)
        .delete(`/api/topics/${topicId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });
  });

  // Applications
  describe('Applications API', () => {
    let appId: string;

    it('rejects unauthorized GET /api/applications', async () => {
      await request(server).get('/api/applications').expect(401);
    });

    it('creates an application', async () => {
      const res = await request(server)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          dateApplied: '2025-06-08',
          companyName: 'TestCo',
          roleTitle: 'Tester',
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      appId = res.body.id;
    });

    it('gets all applications', async () => {
      const res = await request(server)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('gets application by id', async () => {
      const res = await request(server)
        .get(`/api/applications/${appId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(appId);
    });

    it('updates the application', async () => {
      const res = await request(server)
        .put(`/api/applications/${appId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'UpdatedCo',
          roleTitle: 'Senior Tester',
          applicationStage: 'In Progress',
          modeOfApplication: 'Referral',
        });
      expect(res.status).toBe(200);
      expect(res.body.companyName).toBe('UpdatedCo');
    });

    it('deletes the application', async () => {
      await request(server)
        .delete(`/api/applications/${appId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });
  });

  // (Continue similarly for Preparation Sessions, Interviews, Assessments, Dashboard Stats…)
});
