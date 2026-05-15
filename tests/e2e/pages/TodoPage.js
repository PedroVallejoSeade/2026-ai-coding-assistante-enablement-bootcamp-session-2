/**
 * Page Object Model for TODO App
 * Encapsulates selectors and common interactions
 */
class TodoPage {
  constructor(page) {
    this.page = page;
    
    // Header elements
    this.appTitle = 'text=📝 To Do App';
    
    // Add task form elements
    this.taskNameInput = 'input[label="Task name"]';
    this.dueDateInput = 'input[type="date"]';
    this.addTaskButton = 'button:has-text("Add Task")';
    
    // Task list elements
    this.taskCards = '[data-testid="task-card"]';
    this.taskCheckbox = (index) => `[data-testid="task-${index}-checkbox"]`;
    this.taskEditButton = (index) => `[data-testid="task-${index}-edit"]`;
    this.taskDeleteButton = (index) => `[data-testid="task-${index}-delete"]`;
    
    // Dialog elements
    this.editDialog = '[data-testid="edit-dialog"]';
    this.editNameField = '[data-testid="edit-name"]';
    this.editDueDateField = '[data-testid="edit-due-date"]';
    this.editSaveButton = 'button:has-text("Save")';
    this.editCancelButton = 'button:has-text("Cancel")';
    
    // Loading and notifications
    this.loadingSpinner = '[role="progressbar"]';
    this.snackbar = '[role="alert"]';
    this.noTasksMessage = 'text=No tasks found';
  }

  /**
   * Navigate to the TODO app
   */
  async goto() {
    await this.page.goto('http://localhost:3000');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new task
   */
  async addTask(taskName, dueDate = null) {
    await this.page.fill(this.taskNameInput, taskName);
    
    if (dueDate) {
      await this.page.fill(this.dueDateInput, dueDate);
    }
    
    await this.page.click(this.addTaskButton);
    
    // Wait for the task to appear in the list
    await this.page.waitForSelector('text=' + taskName);
  }

  /**
   * Get all tasks currently displayed
   */
  async getAllTasks() {
    const taskElements = await this.page.$$('[role="listitem"]');
    const tasks = [];
    
    for (let i = 0; i < taskElements.length; i++) {
      const taskText = await taskElements[i].textContent();
      tasks.push(taskText);
    }
    
    return tasks;
  }

  /**
   * Delete a task by name
   */
  async deleteTaskByName(taskName) {
    // Find the card containing the task
    const taskCard = this.page.locator(
      `text=${taskName}`
    ).locator('..');
    
    // Find and click the delete button in that card
    const deleteButton = taskCard.locator('[aria-label*="Delete"]');
    await deleteButton.click();
    
    // Wait for the task to be removed
    await this.page.waitForSelector(`text=${taskName}`, { state: 'hidden' });
  }

  /**
   * Edit a task by name
   */
  async editTaskByName(taskName, newName, newDueDate = null) {
    // Find the card containing the task
    const taskCard = this.page.locator(
      `text=${taskName}`
    ).locator('..');
    
    // Find and click the edit button in that card
    const editButton = taskCard.locator('[aria-label*="Edit"]');
    await editButton.click();
    
    // Wait for the dialog to appear
    await this.page.waitForSelector(this.editDialog);
    
    // Update the name
    const nameInput = this.page.locator(this.editNameField);
    await nameInput.clear();
    await nameInput.fill(newName);
    
    // Update the due date if provided
    if (newDueDate) {
      const dateInput = this.page.locator(this.editDueDateField);
      await dateInput.clear();
      await dateInput.fill(newDueDate);
    }
    
    // Click save
    await this.page.click(this.editSaveButton);
    
    // Wait for the dialog to close
    await this.page.waitForSelector(this.editDialog, { state: 'hidden' });
    
    // Wait for the updated task to appear
    await this.page.waitForSelector(`text=${newName}`);
  }

  /**
   * Toggle task completion by name
   */
  async toggleTaskCompletion(taskName) {
    // Find the card containing the task
    const taskCard = this.page.locator(
      `text=${taskName}`
    ).locator('..');
    
    // Find and click the checkbox in that card
    const checkbox = taskCard.locator('input[type="checkbox"]');
    await checkbox.click();
  }

  /**
   * Check if a task is completed
   */
  async isTaskCompleted(taskName) {
    const taskCard = this.page.locator(
      `text=${taskName}`
    ).locator('..');
    
    const checkbox = taskCard.locator('input[type="checkbox"]');
    return await checkbox.isChecked();
  }

  /**
   * Wait for notification to appear and get its message
   */
  async getNotificationMessage() {
    await this.page.waitForSelector(this.snackbar);
    const message = await this.page.textContent(this.snackbar);
    return message;
  }

  /**
   * Check if no tasks message is displayed
   */
  async hasNoTasksMessage() {
    const hidden = await this.page.isHidden(this.noTasksMessage);
    return !hidden;
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading() {
    const hidden = await this.page.isHidden(this.loadingSpinner);
    return !hidden;
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
  }

  /**
   * Check if task with due date is visible
   */
  async isTaskWithDueDateVisible(taskName, dueDate) {
    const formatted = this.formatDateForDisplay(dueDate);
    const selector = `text=${taskName}.*${formatted}`;
    
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format date for display (YYYY-MM-DD to MMM DD, YYYY)
   */
  formatDateForDisplay(dateString) {
    const date = new Date(dateString + 'T00:00:00');
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
    const taskCards = await this.page.$$('[role="listitem"]');
    const names = [];
    
    for (const card of taskCards) {
      const h3 = await card.$('h3');
      if (h3) {
        const text = await h3.textContent();
        names.push(text?.trim());
      }
    }
    
    return names;
  }
}

module.exports = TodoPage;
