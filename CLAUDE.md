# React PoC Architecture Guide

## Project-Specific Documentation

For a comprehensive understanding of this specific application (RideLvl - Skiing Pose Analysis), please refer to:
- **@APP_OVERVIEW.md** - Complete application overview, technical implementation details, and LLM-optimized documentation

## Overview

This architecture is designed for small React applications serving as Proof of Concepts (PoCs). It prioritizes simplicity, maintainability, and ease of development over scalability. The goal is to achieve high cohesion and low coupling without unnecessary complexity or abstraction layers.

## Core Principles

- **Simplicity First**: Avoid over-engineering and premature optimization
- **Feature-Based Organization**: Group related code together by feature
- **Minimal Abstractions**: Use only necessary abstraction layers
- **Standard React Patterns**: Leverage built-in React capabilities before adding external dependencies
- **Colocation**: Keep related files close to where they're used
- **Design System**: Use Shadcn UI components with Tailwind CSS for consistent, accessible design

## Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   └── index.js
│   ├── Modal/
│   │   ├── Modal.jsx
│   │   ├── Modal.module.css
│   │   └── index.js
│   ├── Input/
│   └── ...
├── features/            # Feature-specific code
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   └── services/
│   │       └── authService.js
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.js
│   │   └── services/
│   │       └── dashboardService.js
│   └── ...
├── shared/              # Cross-cutting concerns
│   ├── hooks/
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── constants/
│   │   ├── api.js
│   │   └── config.js
│   ├── types/
│   │   └── common.js
│   └── components/
│       └── Layout.jsx
├── App.jsx
├── App.css
└── index.js
```

## Detailed Architecture Guidelines

### 1. Components Directory

**Purpose**: Houses reusable UI components that can be used across multiple features.

**Structure**:
```
components/
├── Button/
│   ├── Button.jsx       # Component implementation
│   ├── Button.module.css # Component-specific styles
│   └── index.js         # Export file for clean imports
```

**Guidelines**:
- Each component gets its own folder
- Include an `index.js` for clean imports: `import Button from 'components/Button'`
- Keep components pure and focused on UI concerns
- Use Tailwind CSS for styling with Shadcn UI components as the primary design system
- Props should be well-defined and documented

**Example Component**:
```jsx
// components/Button/Button.jsx
import { cn } from "shared/utils/cn";

const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  onClick,
  disabled = false,
  ...props
}) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

### 2. Features Directory

**Purpose**: Contains feature-specific code organized by business domain.

**Structure**: Each feature follows the same internal structure:
- `components/`: Components specific to this feature
- `hooks/`: Custom hooks for feature logic
- `services/`: API calls and external service interactions

**Guidelines**:
- Features should be self-contained
- Avoid cross-feature dependencies (use shared/ instead)
- Each feature can have its own internal state management
- Business logic should live in custom hooks

**Example Feature Hook**:
```jsx
// features/auth/hooks/useAuth.js
import { useState, useContext, createContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 3. Shared Directory

**Purpose**: Contains code that's used across multiple features.

#### shared/hooks/
Common custom hooks for cross-cutting concerns.

**Example API Hook**:
```jsx
// shared/hooks/useApi.js
import { useState, useEffect } from 'react';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('API call failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

#### shared/utils/
Utility functions for common operations.

```jsx
// shared/utils/formatters.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US').format(new Date(date));
};

// shared/utils/cn.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

#### shared/constants/
Application-wide constants and configuration.

```jsx
// shared/constants/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  DASHBOARD: '/dashboard'
};
```

### 4. State Management Strategy

**Local State**: Use `useState` and `useReducer` for component-level state.

**Global State**: Use Context API for application-wide state that needs to be shared.

**Server State**: Use custom hooks (like `useApi`) for data fetching and caching.

**Guidelines**:
- Start with local state and lift up only when necessary
- Use Context sparingly - create separate contexts for different concerns
- Don't put everything in global state
- Consider data fetching libraries (React Query, SWR) only if you need advanced caching

### 5. Service Layer

Services handle external API calls and side effects.

```jsx
// features/auth/services/authService.js
import { API_BASE_URL, ENDPOINTS } from 'shared/constants/api';

export const authService = {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  async logout() {
    // Handle logout logic
    localStorage.removeItem('authToken');
  }
};
```

## File Naming Conventions

- **Components**: PascalCase (`Button.jsx`, `LoginForm.jsx`)
- **Hooks**: camelCase starting with 'use' (`useAuth.js`, `useApi.js`)
- **Services**: camelCase ending with 'Service' (`authService.js`)
- **Utils**: camelCase (`formatters.js`, `validators.js`)
- **Constants**: camelCase (`api.js`, `config.js`)

## Import/Export Patterns

**Use index.js files for clean imports**:
```jsx
// components/Button/index.js
export { default } from './Button';

// Usage
import Button from 'components/Button';
```

**Prefer named exports for utilities**:
```jsx
// shared/utils/formatters.js
export const formatCurrency = (amount) => { /* ... */ };
export const formatDate = (date) => { /* ... */ };

// Usage
import { formatCurrency, formatDate } from 'shared/utils/formatters';
```

## Testing Strategy

- **Unit Tests**: Test individual components and hooks
- **Integration Tests**: Test feature workflows
- **Keep it Simple**: Don't over-test for a PoC

**Example Test Structure**:
```
src/
├── components/
│   └── Button/
│       ├── Button.jsx
│       ├── Button.test.jsx
│       └── index.js
└── features/
    └── auth/
        ├── components/
        │   ├── LoginForm.jsx
        │   └── LoginForm.test.jsx
        └── hooks/
            ├── useAuth.js
            └── useAuth.test.js
```

## Key Benefits of This Architecture

1. **Clear Separation**: Features are isolated, components are reusable
2. **Easy Navigation**: Developers can quickly find relevant code
3. **Low Coupling**: Features don't depend on each other directly
4. **High Cohesion**: Related code is grouped together
5. **Gradual Complexity**: Start simple, add complexity only when needed
6. **Standard Patterns**: Uses familiar React patterns and conventions

## When to Evolve

This architecture is designed for PoCs and small applications. Consider evolving when:

- You need complex state management (add Redux/Zustand)
- You have many API calls (add React Query/SWR)
- You need advanced routing (add nested routes, route guards)
- Performance becomes an issue (add optimization strategies)
- Team grows significantly (add more strict patterns and tooling)

## Anti-Patterns to Avoid

- **Over-abstraction**: Don't create layers you don't need
- **Premature Optimization**: Don't optimize for problems you don't have
- **Feature Coupling**: Avoid direct imports between features
- **God Components**: Keep components focused and small
- **Magic Numbers**: Use constants for configuration values
- **Inconsistent Patterns**: Stick to the established conventions

Remember: The goal is to build a working PoC efficiently, not to create the perfect architecture. Keep it simple, keep it working, and evolve as needed.