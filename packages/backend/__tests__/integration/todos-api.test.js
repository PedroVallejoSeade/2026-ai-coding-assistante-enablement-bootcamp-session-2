const request = require('supertest');
const Database = require('better-sqlite3');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Setup a fresh database for integration tests
let app;
let db;

beforeAll(() => {
  // Create a new app instance with a fresh database
  app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  db = new Database(':memory:');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // API Routes
  app.get('/api/items', (req, res) => {
    try {
      const items = db.prepare(`
        SELECT * FROM items
        ORDER BY
          CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
          due_date ASC,
          created_at DESC
      `).all();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  app.post('/api/items', (req, res) => {
    try {
      const { name, due_date } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Item name is required' });
      }

      const dueDateValue = due_date || null;
      const result = db.prepare('INSERT INTO items (name, due_date, completed) VALUES (?, ?, 0)').run(name, dueDateValue);
      const id = result.lastInsertRowid;

      const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  });

  app.put('/api/items/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, due_date, completed } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Valid item ID is required' });
      }

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Item name is required' });
      }

      const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
      if (!existingItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const dueDateValue = due_date === undefined ? existingItem.due_date : due_date;
      const completedValue = completed === undefined ? existingItem.completed : completed;

      db.prepare('UPDATE items SET name = ?, due_date = ?, completed = ? WHERE id = ?').run(name, dueDateValue, completedValue, id);

      const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  app.delete('/api/items/:id', (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Valid item ID is required' });
      }

      const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
      if (!existingItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);

      if (result.changes > 0) {
        res.json({ message: 'Item deleted successfully', id: parseInt(id) });
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  });
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('TODO API Integration Tests', () => {
  describe('Complete TODO Workflow', () => {
    it('should complete a full todo lifecycle', async () => {
      // Step 1: Create a todo without due date
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'Buy groceries' });

      expect(createRes.status).toBe(201);
      const todoId = createRes.body.id;
      expect(createRes.body.name).toBe('Buy groceries');
      expect(createRes.body.completed).toBe(0);
      expect(createRes.body.due_date).toBeNull();

      // Step 2: Verify it's in the list
      const listRes = await request(app).get('/api/items');
      expect(listRes.status).toBe(200);
      const createdTodo = listRes.body.find(item => item.id === todoId);
      expect(createdTodo).toBeDefined();

      // Step 3: Edit the todo to add a due date
      const editRes = await request(app)
        .put(`/api/items/${todoId}`)
        .send({ name: 'Buy groceries', due_date: '2026-05-25' });

      expect(editRes.status).toBe(200);
      expect(editRes.body.due_date).toBe('2026-05-25');
      expect(editRes.body.name).toBe('Buy groceries');

      // Step 4: Mark as completed
      const completeRes = await request(app)
        .put(`/api/items/${todoId}`)
        .send({ name: 'Buy groceries', due_date: '2026-05-25', completed: 1 });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.completed).toBe(1);

      // Step 5: Delete the todo
      const deleteRes = await request(app).delete(`/api/items/${todoId}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.id).toBe(todoId);

      // Step 6: Verify it's deleted
      const finalListRes = await request(app).get('/api/items');
      const deletedTodo = finalListRes.body.find(item => item.id === todoId);
      expect(deletedTodo).toBeUndefined();
    });
  });

  describe('Sorting by Due Date', () => {
    it('should sort todos by nearest due date first, then undated last', async () => {
      // Clear existing data by creating a fresh context
      // Create multiple todos with different due dates
      const todo1Res = await request(app)
        .post('/api/items')
        .send({ name: 'Task with far due date', due_date: '2026-06-15' });

      const todo2Res = await request(app)
        .post('/api/items')
        .send({ name: 'Task with near due date', due_date: '2026-05-18' });

      const todo3Res = await request(app)
        .post('/api/items')
        .send({ name: 'Task without due date' });

      const todo4Res = await request(app)
        .post('/api/items')
        .send({ name: 'Another undated task' });

      // Get sorted list
      const listRes = await request(app).get('/api/items');
      const items = listRes.body;

      // Find indices of our test items
      const idx1 = items.findIndex(item => item.id === todo1Res.body.id);
      const idx2 = items.findIndex(item => item.id === todo2Res.body.id);
      const idx3 = items.findIndex(item => item.id === todo3Res.body.id);
      const idx4 = items.findIndex(item => item.id === todo4Res.body.id);

      // Verify dated tasks come before undated tasks
      expect(idx2).toBeLessThan(idx3);
      expect(idx2).toBeLessThan(idx4);
      expect(idx1).toBeLessThan(idx3);

      // Verify dated tasks are sorted by date (closer date first)
      expect(idx2).toBeLessThan(idx1); // 2026-05-18 comes before 2026-06-15

      // Clean up
      await request(app).delete(`/api/items/${todo1Res.body.id}`);
      await request(app).delete(`/api/items/${todo2Res.body.id}`);
      await request(app).delete(`/api/items/${todo3Res.body.id}`);
      await request(app).delete(`/api/items/${todo4Res.body.id}`);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle concurrent updates gracefully', async () => {
      const createRes = await request(app)
        .post('/api/items')
        .send({ name: 'Concurrent test', due_date: '2026-05-20' });

      const todoId = createRes.body.id;

      // Make concurrent updates
      const [update1, update2] = await Promise.all([
        request(app)
          .put(`/api/items/${todoId}`)
          .send({ name: 'Update 1', due_date: '2026-05-21' }),
        request(app)
          .put(`/api/items/${todoId}`)
          .send({ name: 'Update 2', due_date: '2026-05-22' }),
      ]);

      // Both should succeed (last one wins in typical DB scenarios)
      expect(update1.status).toBe(200);
      expect(update2.status).toBe(200);

      // Verify final state
      const finalRes = await request(app).get('/api/items');
      const finalItem = finalRes.body.find(item => item.id === todoId);
      expect(finalItem).toBeDefined();

      // Clean up
      await request(app).delete(`/api/items/${todoId}`);
    });

    it('should return appropriate errors for invalid operations', async () => {
      // Test invalid ID format
      const invalidRes = await request(app)
        .put('/api/items/not-a-number')
        .send({ name: 'Test' });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error).toBe('Valid item ID is required');

      // Test missing item
      const notFoundRes = await request(app)
        .put('/api/items/99999')
        .send({ name: 'Test' });

      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.body.error).toBe('Item not found');
    });
  });
});
