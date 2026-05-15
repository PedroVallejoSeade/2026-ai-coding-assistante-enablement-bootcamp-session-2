const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (name = 'Temp Item to Delete', due_date = null) => {
  const response = await request(app)
    .post('/api/items')
    .send({ name, due_date })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('created_at');
    });

    it('should sort items by due_date ASC with nulls last', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      const items = response.body;

      // Find items with due_dates
      const itemsWithDues = items.filter(item => item.due_date !== null);
      const itemsWithoutDues = items.filter(item => item.due_date === null);

      // Verify items with due_dates come before items without
      if (itemsWithDues.length > 0 && itemsWithoutDues.length > 0) {
        expect(items.indexOf(itemsWithDues[0])).toBeLessThan(items.indexOf(itemsWithoutDues[0]));
      }

      // Verify due_dates are sorted ascending
      for (let i = 0; i < itemsWithDues.length - 1; i++) {
        const current = new Date(itemsWithDues[i].due_date);
        const next = new Date(itemsWithDues[i + 1].due_date);
        expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
      }
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body).toHaveProperty('due_date');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create a new item with due_date', async () => {
      const newItem = { name: 'Task with due date', due_date: '2026-05-25' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.due_date).toBe('2026-05-25');
      expect(response.body.completed).toBe(0);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await createItem('Original Name');
      const updatedData = { name: 'Updated Name', due_date: '2026-06-01', completed: 1 };

      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send(updatedData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(item.id);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.due_date).toBe('2026-06-01');
      expect(response.body.completed).toBe(1);
    });

    it('should update only name', async () => {
      const item = await createItem('Test Name', '2026-05-20');

      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'New Name' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New Name');
      expect(response.body.due_date).toBe('2026-05-20');
    });

    it('should return 400 if name is empty', async () => {
      const item = await createItem('Test Item');

      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Item name is required');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ name: 'Updated Name' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app)
        .put('/api/items/abc')
        .send({ name: 'Updated Name' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });
});