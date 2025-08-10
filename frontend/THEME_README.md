# Theme System Documentation

This Angular application includes a comprehensive theme system that allows users to switch between light and dark themes.

## Features

- **Light/Dark Theme Toggle**: Users can switch between light and dark themes using the theme toggle button in the top navigation bar
- **Persistent Storage**: Theme preference is saved in localStorage and persists across browser sessions
- **System Preference Detection**: Automatically detects and applies the user's system theme preference on first visit
- **Smooth Transitions**: All theme changes include smooth CSS transitions for a polished user experience
- **CSS Variables**: Uses CSS custom properties for consistent theming across all components

## How It Works

### Theme Service (`ThemeService`)

The `ThemeService` manages the current theme state and provides methods to:
- Get the current theme
- Toggle between themes
- Set a specific theme
- Check if dark/light theme is active

### Theme Toggle Component

The `ThemeToggleComponent` is a reusable component that displays a button with:
- Sun icon for dark theme (click to switch to light)
- Moon icon for light theme (click to switch to dark)
- Proper accessibility labels and tooltips

### CSS Variables

The theme system uses CSS custom properties defined in `styles.scss`:

```scss
:root {
  /* Light theme variables */
  --primary-color: #667eea;
  --text-primary: #2d3748;
  --bg-primary: #ffffff;
  --border-color: #e2e8f0;
  /* ... more variables */
}

.dark-theme {
  /* Dark theme variables */
  --text-primary: #f7fafc;
  --bg-primary: #1a202c;
  --border-color: #4a5568;
  /* ... more variables */
}
```

## Usage

### Adding Theme Support to Components

1. **Use CSS Variables**: Replace hardcoded colors with theme variables:

```scss
// Before
.my-component {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
}

// After
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

2. **Import Theme Service**: If you need theme state in your component:

```typescript
import { ThemeService } from '../core/services/theme.service';

export class MyComponent {
  currentTheme$ = this.themeService.currentTheme$;
  
  constructor(private themeService: ThemeService) {}
}
```

3. **Add Theme Toggle**: Include the theme toggle component in your template:

```html
<app-theme-toggle></app-theme-toggle>
```

### Available CSS Variables

#### Colors
- `--primary-color`: Primary brand color
- `--primary-hover`: Primary color on hover
- `--secondary-color`: Secondary brand color
- `--success-color`: Success state color
- `--warning-color`: Warning state color
- `--error-color`: Error state color
- `--info-color`: Info state color

#### Text Colors
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-muted`: Muted/subtle text color

#### Background Colors
- `--bg-primary`: Primary background color
- `--bg-secondary`: Secondary background color
- `--bg-tertiary`: Tertiary background color

#### Borders and Shadows
- `--border-color`: Default border color
- `--border-hover`: Border color on hover
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Test both themes** during development
3. **Ensure sufficient contrast** between text and background colors
4. **Use semantic color names** (e.g., `--error-color` instead of `--red`)
5. **Include smooth transitions** for theme changes

## Adding New Themes

To add a new theme (e.g., "auto" that follows system preference):

1. Add the theme type to the `Theme` union type in `ThemeService`
2. Add CSS variables for the new theme in `styles.scss`
3. Update the theme service logic to handle the new theme
4. Update the theme toggle component to show appropriate icons

## Browser Support

The theme system works in all modern browsers that support:
- CSS Custom Properties (CSS Variables)
- localStorage API
- CSS transitions

## Troubleshooting

### Theme Not Persisting
- Check if localStorage is available and not blocked
- Verify the theme service is properly injected

### Styles Not Updating
- Ensure CSS variables are properly defined
- Check if the theme class is applied to the body element
- Verify component styles use theme variables

### Performance Issues
- Theme changes are optimized with CSS variables
- Avoid complex calculations in CSS variables
- Use `will-change` CSS property sparingly for theme transitions 