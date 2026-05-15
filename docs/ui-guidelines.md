# UI Guidelines for TODO App

## Overview

This document establishes the design standards and guidelines for the TODO application frontend. All UI components must adhere to these guidelines to ensure consistency, accessibility, and a professional user experience.

## Component Framework

### Material Design System

The TODO app frontend **must** use Material-UI (MUI) components for all user interface elements. Material-UI provides:

- Pre-built, accessible components that follow Material Design principles
- Consistent component behavior across the application
- Built-in accessibility features (ARIA labels, keyboard navigation, etc.)
- Responsive design support

**Required Core Components:**
- `Button` - for all interactive actions
- `TextField` - for text input
- `Checkbox` - for todo completion toggling
- `Card` - for todo item containers
- `AppBar` - for application header
- `Container` - for layout and spacing
- `Typography` - for all text content
- `IconButton` - for compact action buttons
- `Dialog/Modal` - for confirmation dialogs
- `Snackbar` - for notifications and feedback
- `LinearProgress` / `CircularProgress` - for loading states

### No Custom Components Without Justification

Custom or third-party UI components require architectural review. Prima facie, use Material-UI components unless there is a documented technical reason (accessibility limitations, specific UX requirement, performance concerns).

---

## Color Palette

### Primary Color Scheme

- **Primary Brand Color**: `#1976D2` (Material Blue)
  - Used for buttons, links, and primary interactive elements
  - Used for focus states and active highlights

- **Secondary Color**: `#DC004E` (Material Pink)
  - Used for accents and secondary actions
  - Used for delete/danger operations

- **Success Color**: `#4CAF50` (Material Green)
  - Used for completed todos
  - Used for success messages and confirmations

- **Warning Color**: `#FF9800` (Material Orange)
  - Used for pending/in-progress items
  - Used for warning messages

- **Error Color**: `#F44336` (Material Red)
  - Used for errors and critical alerts
  - Used for delete confirmation

### Neutral Colors

- **Background (Light Mode)**: `#FAFAFA`
- **Surface**: `#FFFFFF`
- **Text Primary**: `#212121` (rgba(0, 0, 0, 0.87))
- **Text Secondary**: `#757575` (rgba(0, 0, 0, 0.60))
- **Dividers**: `#E0E0E0` (rgba(0, 0, 0, 0.12))

### Theme Configuration

All colors should be defined in the Material-UI theme configuration:

```javascript
// Example: src/theme/theme.js
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#DC004E',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
  },
});
```

---

## Button Styles

### Button Types

#### 1. Contained Button (Primary Action)
- **Usage**: Main call-to-action, form submissions, primary actions
- **Style**: Filled background with primary color, white text
- **Example**: "Add Todo", "Save", "Submit"
- **MUI Component**: `<Button variant="contained" color="primary">`

#### 2. Outlined Button (Secondary Action)
- **Usage**: Secondary actions, cancel operations, alternatives
- **Style**: Transparent background with colored border, colored text
- **Example**: "Cancel", "Discard", "Skip"
- **MUI Component**: `<Button variant="outlined" color="primary">`

#### 3. Text Button (Tertiary Action)
- **Usage**: Links, minor actions, inline operations
- **Style**: Transparent background, colored text only
- **Example**: "Learn More", "Edit", "View Details"
- **MUI Component**: `<Button variant="text" color="primary">`

#### 4. Icon Button (Compact Action)
- **Usage**: Toolbar actions, edit/delete in list items, compact interfaces
- **Style**: Icon-only, no text label (tooltip required)
- **Example**: Edit icon, Delete icon, Settings icon
- **MUI Component**: `<IconButton>`

### Button Sizing

- **Large**: `size="large"` - Primary CTAs on empty states
- **Medium (Default)**: `size="medium"` - Standard buttons throughout the app
- **Small**: `size="small"` - Secondary actions, compact spaces

### Button States

All buttons must support standard states:
- **Normal**: Default enabled state
- **Hover**: Visual feedback on mouse over (darkened or elevated)
- **Active/Pressed**: Visual feedback when clicked
- **Disabled**: Greyed out, `disabled={true}`, cursor: not-allowed
- **Loading**: Spinner or progress indicator, disabled interaction

### Button Spacing and Alignment

- **Horizontal spacing between buttons**: 8px minimum
- **Button padding**: Material-UI defaults (12px horizontal, 6px vertical for medium)
- **Button grouping**: Use `<Stack>` or `<Box>` with `gap` property
- **Full-width buttons**: Use in forms and modals only; `fullWidth={true}`

---

## Accessibility Requirements

### 1. Keyboard Navigation

- **All interactive elements must be keyboard accessible**
  - Buttons, links, checkboxes, inputs must be focusable (tab order)
  - Focus order should follow logical reading order (left-to-right, top-to-bottom)
  - Use `tabIndex` carefully; avoid `tabIndex > 0`

- **Keyboard shortcuts**
  - Enter/Space: Activate buttons and toggle checkboxes
  - Escape: Close dialogs and cancel operations
  - Ctrl/Cmd+T: Quick add todo (optional but recommended)
  - Ctrl/Cmd+D: Delete selected item (optional)

### 2. Screen Reader Support

- **ARIA labels and descriptions**: Provide meaningful labels for all interactive elements
  - Use `aria-label` for icon-only buttons
  - Use `aria-describedby` for complex interactions
  - Use semantic HTML: `<button>`, `<input>`, `<label>`

- **Example:**
  ```jsx
  <IconButton aria-label="delete todo">
    <DeleteIcon />
  </IconButton>
  ```

- **Form labels**: Always associate labels with inputs using `<label htmlFor>`
  ```jsx
  <TextField
    id="todo-input"
    label="Add a new todo"
    aria-label="Todo item input"
  />
  ```

### 3. Color Contrast

- **Text contrast ratio minimum**: WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
- **Use Material-UI theme colors**: Pre-configured colors meet WCAG standards
- **Test with tools**: Use WAVE, axe DevTools, or similar accessibility checkers

### 4. Visual Indicators

- **Do not rely solely on color** to convey meaning
  - Use icons, patterns, or text in addition to color
  - Example: Don't use only red for errors; include error icon and error text

- **Focus indicators**: Visible focus ring on all interactive elements
  - Material-UI provides default focus styles
  - Ensure focus ring is visible with 3:1 contrast ratio

### 5. Responsive Design

- **Mobile accessibility**
  - Touch targets: Minimum 44x44px for buttons and interactive elements
  - Finger-friendly spacing on mobile devices

- **Text sizing**
  - Avoid fixed pixel sizes; use relative units (rem, em)
  - Support browser zoom up to 200%
  - Ensure text reflows properly when zoomed

### 6. Motion and Animation

- **Respect user preferences**: Honor `prefers-reduced-motion` media query
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

- **Animations should be under 300ms** to avoid disorientation

### 7. Semantic HTML

- Use semantic elements: `<button>`, `<form>`, `<label>`, `<h1>-<h6>`, `<nav>`
- Use Material-UI Typography component with proper variant: `h1`, `h2`, `body1`, `body2`, etc.

### 8. Error Handling and Validation

- **Clear error messages**
  - Display error text near the invalid field
  - Use `helperText` in TextField: `helperText="This field is required"`
  - Use error color: `error={true}` on inputs

- **Accessible error communication**
  - Announce errors to screen readers
  - Use `role="alert"` for error messages
  - Provide suggestions for correction

### 9. Loading States

- **Provide visual feedback**: Show spinners, progress bars, or skeleton screens
- **Disable interactions during loading**: Prevent duplicate submissions
- **Announce status changes**: Use `aria-live="polite"` for status updates

---

## Layout and Spacing

### Spacing Scale

Use Material-UI spacing system (8px base unit):
- `spacing(1)` = 8px
- `spacing(2)` = 16px
- `spacing(3)` = 24px
- `spacing(4)` = 32px

### Container and Responsive Breakpoints

- **xs**: Extra small (mobile): 0px
- **sm**: Small (tablet): 600px
- **md**: Medium (small laptop): 960px
- **lg**: Large (desktop): 1280px
- **xl**: Extra large: 1920px

### Todo Item Card Layout

```
┌─────────────────────────────────────┐
│ ☐ Todo Title                   ✎ ✕ │
│ Description or metadata             │
│ Tags/Categories (if applicable)     │
│ Due Date: MM/DD/YYYY                │
└─────────────────────────────────────┘
```

---

## Typography

### Font Stack

```
font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif
```

### Text Hierarchy

- **h1**: App title - used once per page
- **h2**: Section headers - major sections
- **h3**: Subsection headers
- **body1**: Primary body text (16px)
- **body2**: Secondary body text (14px)
- **button**: Button text (14px, uppercase)
- **caption**: Small labels, timestamps (12px)

---

## Implementation Checklist

- [ ] Material-UI installed and configured
- [ ] Theme provider applied at app root
- [ ] All buttons follow button style guidelines
- [ ] Color palette implemented in theme
- [ ] Keyboard navigation tested (Tab, Enter, Escape)
- [ ] Screen reader tested (NVDA, JAWS, or VoiceOver)
- [ ] Color contrast verified (WAVE, axe DevTools)
- [ ] Focus indicators visible on all interactive elements
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Responsive design tested on xs, sm, md, lg breakpoints
- [ ] Error messages accessible and clear
- [ ] Loading states provide visual feedback
- [ ] Animations respect `prefers-reduced-motion`

---

## References

- [Material Design Official Site](https://material.io)
- [Material-UI Documentation](https://mui.com/)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
