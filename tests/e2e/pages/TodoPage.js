/**
 * Page Object Model for TODO App
 * Encapsulates selectors and common interactions
 */
class TodoPage {
  constructor(page) {
    this.page = page;

    this.appTitle = page.getByRole('heading', { name: '📝 To Do App' });
    this.taskNameInput = page.getByLabel('Task name').first();
    this.dueDateInput = page.getByLabel('Due date').first();
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
    this.noTasksMessage = page.getByText('No tasks found. Add one to get started! 🚀');
  }

  /**
   * Navigate to the TODO app
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new task
   */
  async addTask(taskName, dueDate = null) {
    await this.taskNameInput.fill(taskName);

    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
    }

    await this.addTaskButton.click();
    await this.getTaskCardByName(taskName).waitFor({ state: 'visible' });
  }

  /**
   * Get all tasks currently displayed
   */
  async getAllTasks() {
    const taskHeadings = this.page.locator('.MuiCard-root h3');
    return taskHeadings.allTextContents();
  }

  /**
   * Delete a task by name
   */
  async deleteTaskByName(taskName) {
    await this.page
      .getByRole('button', { name: `Delete task "${taskName}"` })
      .first()
      .click();

    await this.getTaskCardByName(taskName).waitFor({ state: 'hidden' });
  }

  /**
   * Edit a task by name
   */
  async editTaskByName(taskName, newName, newDueDate = null) {
    await this.page
      .getByRole('button', { name: `Edit task "${taskName}"` })
      .first()
      .click();

    const dialog = this.page.getByRole('dialog', { name: 'Edit Task' });
    await dialog.waitFor({ state: 'visible' });

    const nameInput = dialog.getByLabel('Task name');
    await nameInput.clear();
    await nameInput.fill(newName);

    if (newDueDate) {
      const dateInput = dialog.getByLabel('Due date');
      await dateInput.fill('');
      await dateInput.fill(newDueDate);
    }

    await dialog.getByRole('button', { name: 'Save' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await this.getTaskCardByName(newName).waitFor({ state: 'visible' });
  }

  /**
   * Toggle task completion by name
   */
  async toggleTaskCompletion(taskName) {
    await this.getTaskCardByName(taskName).locator('input[type="checkbox"]').first().click();
  }

  /**
   * Check if a task is completed
   */
  async isTaskCompleted(taskName) {
    return this.getTaskCardByName(taskName).locator('input[type="checkbox"]').first().isChecked();
  }

  /**
   * Wait for notification to appear and get its message
   */
  async getNotificationMessage() {
    const snackbar = this.page.getByRole('alert').last();
    await snackbar.waitFor({ state: 'visible' });
    const message = await snackbar.textContent();
    return message || '';
  }

  /**
   * Check if no tasks message is displayed
   */
  async hasNoTasksMessage() {
    return this.noTasksMessage.isVisible();
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading() {
    return this.page.getByRole('progressbar').first().isVisible();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if task with due date is visible
   */
  async isTaskWithDueDateVisible(taskName, dueDate) {
    const formatted = this.formatDateForDisplay(dueDate);
    const taskCard = this.getTaskCardByName(taskName);
    const dueText = taskCard.getByText(`Due: ${formatted}`);

    return dueText.first().isVisible();
  }

  /**
   * Format date for display (YYYY-MM-DD to MMM DD, YYYY)
   */
  formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get all visible task names in order
   */
  async getTaskNamesInOrder() {
    const headings = this.page.locator('.MuiCard-root h3');
    const names = await headings.allTextContents();
    return names.map((name) => name?.trim() || '');
  }

  /**
   * Get the card for a task by exact task name
   */
  getTaskCardByName(taskName) {
    return this.page
      .locator('.MuiCard-root', {
        has: this.page.getByRole('heading', { level: 3, name: taskName, exact: true }),
      })
      .first();
  }
}

module.exports = TodoPage;
