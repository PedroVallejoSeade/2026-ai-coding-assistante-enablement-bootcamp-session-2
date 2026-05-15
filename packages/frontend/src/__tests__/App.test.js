import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Test Item 1', due_date: '2026-05-20', completed: 0, created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, name: 'Test Item 2', due_date: null, completed: 0, created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),
  
  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name, due_date } = req.body;
    
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        due_date: due_date || null,
        completed: 0,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // PUT /api/items/:id handler
  rest.put('/api/items/:id', (req, res, ctx) => {
    const { name, due_date, completed } = req.body;
    
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(req.params.id),
        name,
        due_date: due_date || null,
        completed: completed || 0,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Item deleted successfully', id: parseInt(req.params.id) })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Custom render function that wraps App with Theme
const renderApp = () => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

describe('App Component', () => {
  test('renders the header with app title', async () => {
    await act(async () => {
      renderApp();
    });
    
    // Check for the app title with emoji
    expect(screen.getByText(/📝 To Do App/)).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      renderApp();
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('displays due dates for tasks', async () => {
    await act(async () => {
      renderApp();
    });
    
    // Wait for items to load and check for formatted date
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      // The date formatting results in "May 20, 2026"
      expect(screen.getByText(/May 20, 2026/)).toBeInTheDocument();
    });
  });

  test('adds a new item with task name', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      renderApp();
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Fill in task name
    const taskInput = screen.getByLabelText(/Task name/);
    await user.type(taskInput, 'New Test Item');
    
    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(submitButton);
    
    // Check for success notification
    await waitFor(() => {
      expect(screen.getByText(/added successfully/)).toBeInTheDocument();
    });
  });

  test('adds a new item with due date', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      renderApp();
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Fill in task name
    const taskInput = screen.getByLabelText(/Task name/);
    await user.type(taskInput, 'Task with due date');
    
    // Fill in due date
    const dateInput = screen.getByLabelText(/Due date/);
    await user.type(dateInput, '2026-05-30');
    
    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(submitButton);
    
    // Check for success notification
    await waitFor(() => {
      expect(screen.getByText(/added successfully/)).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      renderApp();
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      renderApp();
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText(/No tasks found/)).toBeInTheDocument();
    });
  });

  test('form submit button is disabled when input is empty', async () => {
    await act(async () => {
      renderApp();
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Check button is disabled initially
    const submitButton = screen.getByRole('button', { name: /Add Task/i });
    expect(submitButton).toBeDisabled();
    
    // Type in input
    const taskInput = screen.getByLabelText(/Task name/);
    await userEvent.type(taskInput, 'Test');
    
    // Button should be enabled
    expect(submitButton).not.toBeDisabled();
    
    // Clear input
    await userEvent.clear(taskInput);
    
    // Button should be disabled again
    expect(submitButton).toBeDisabled();
  });

  test('displays Material-UI theme components', async () => {
    await act(async () => {
      renderApp();
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Check for MUI input fields
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    
    // Check for buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});