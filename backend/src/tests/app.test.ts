import request from 'supertest';
import { app } from '../index';
import { Request, Response, NextFunction } from 'express'; // Import the necessary types

describe('GET /', () => {
    it('responds with Hello World!', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    });
});

describe('POST /api/institutions', () => {
  it('should return 201 and institution_id for valid data', async () => {
    const response = await request(app)
      .post('/api/institutions')
      .send({
        name: 'University A',
        type: 'University',
        address: '123 University St, City, Country',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('institution_id');
    expect(response.body.message).toBe('Institution created successfully.');
  });

  it('should return 400 for missing name or type', async () => {
    const response = await request(app)
      .post('/api/institutions')
      .send({
        type: 'University',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('name and type are required fields');
  });

  it('should return 400 for invalid institution type', async () => {
    const response = await request(app)
      .post('/api/institutions')
      .send({
        name: 'Invalid Type Institution',
        type: 'InvalidType',
        address: '123 Invalid St, Invalid City, Invalid Country',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('The institution type \'InvalidType\' is invalid.');
  });
});


describe('POST /api/candidates', () => {
    it('should create a candidate and return 201 status', async () => {
        const response = await request(app)
            .post('/api/candidates')
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "john5.doe@example.com",
                phone: "+1234567890",
                address: "123 Test St, Test City, Test Country",
                cv_file: "path/to/cv.pdf",
                education: [
                  {
                    degree: "Bachelor of Science in Computer Science",
                    startDate: "2015-09-01T00:00:00Z",
                    endDate: "2019-06-30T00:00:00Z",
                    description: "Studied computer science with a focus on algorithms and data structures.",
                    institutionId: 1
                  }
                ],
                work_experience: [
                  {
                    position: "Software Engineer",
                    startDate: "2019-07-01T00:00:00Z",
                    endDate: "2023-12-31T00:00:00Z",
                    description: "Worked on backend development using Node.js and PostgreSQL.",
                    companyId: 2
                  }
                ]
              });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Candidate created successfully.');
    });

    // Test for required fields
    it('should return 400 for missing required fields', async () => {
        const response = await request(app)
            .post('/api/candidates')
            .send({
                first_name: 'John',
                email: 'john.doe@example.com',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Bad Request: Missing required fields.');
    });

    // Test for invalid email format
    it('should return 400 for invalid email format', async () => {
        const response = await request(app)
            .post('/api/candidates')
            .send({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe',
                phone: '1234567890',
                address: '123 Main St, City, Country',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Bad Request: Invalid email format.');
    });

    Test for invalid institution_id and company_id
    it('should return 404 for invalid institution_id or company_id', async () => {
        const response = await request(app)
            .post('/api/candidates')
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "john4.doe@example.com",
                phone: "+1234567890",
                address: "123 Test St, Test City, Test Country",
                cv_file: "path/to/cv.pdf",
                education: [
                  {
                    degree: "Bachelor of Science in Computer Science",
                    startDate: "2015-09-01T00:00:00Z",
                    endDate: "2019-06-30T00:00:00Z",
                    description: "Studied computer science with a focus on algorithms and data structures.",
                    institutionId: 999
                  }
                ],
                work_experience: [
                  {
                    position: "Software Engineer",
                    startDate: "2019-07-01T00:00:00Z",
                    endDate: "2023-12-31T00:00:00Z",
                    description: "Worked on backend development using Node.js and PostgreSQL.",
                    companyId: 999
                  }
                ]
              });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Not Found: Invalid institution_id or company_id.');
    });
});