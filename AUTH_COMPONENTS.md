# Authentication Components

This project includes a complete set of authentication pages with a unified design system, matching the style from the provided screenshot.

## Components Created

### Design System (`constants/theme.ts`)
- **Colors**: Primary blue (#007AFF), secondary orange, background colors, text colors
- **Typography**: Title, subtitle, body, caption, and button text styles
- **Spacing**: Consistent spacing scale (xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48)
- **Border Radius**: Consistent border radius values
- **Shadows**: Card shadow styles

### Reusable UI Components (`components/ui/`)

#### 1. Input Component (`Input.tsx`)
- Text input with icon support
- Password visibility toggle
- Error state handling
- Focus state styling
- Customizable keyboard types

**Props:**
- `label?: string` - Optional label above input
- `placeholder: string` - Placeholder text
- `value: string` - Input value
- `onChangeText: (text: string) => void` - Change handler
- `secureTextEntry?: boolean` - Password input
- `icon?: keyof typeof Ionicons.glyphMap` - Left icon
- `error?: string` - Error message
- `keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'`
- `autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'`

#### 2. Button Component (`Button.tsx`)
- Multiple variants: primary, secondary, social
- Loading state with spinner
- Icon support
- Social login buttons (Google, Facebook)
- Disabled state

**Props:**
- `title: string` - Button text
- `onPress: () => void` - Press handler
- `variant?: 'primary' | 'secondary' | 'social'` - Button style
- `size?: 'small' | 'medium' | 'large'` - Button size
- `disabled?: boolean` - Disabled state
- `loading?: boolean` - Loading state
- `icon?: keyof typeof Ionicons.glyphMap` - Icon
- `socialType?: 'google' | 'facebook'` - Social button type

#### 3. Card Component (`Card.tsx`)
- Consistent card styling with shadows
- Configurable padding
- Rounded corners

**Props:**
- `children: React.ReactNode` - Card content
- `style?: ViewStyle` - Custom styles
- `padding?: 'none' | 'small' | 'medium' | 'large'` - Padding size

#### 4. Illustration Component (`Illustration.tsx`)
- Custom illustrations for each auth page
- Animated-style icons with shadows
- Three types: signin, signup, forgot-password

**Props:**
- `type: 'signin' | 'signup' | 'forgot-password'` - Illustration type
- `style?: ViewStyle` - Custom styles

### Authentication Pages

#### 1. Sign In Page (`SignInPage.tsx`)
- Username and password fields
- "Forget password" link
- Social login buttons (Google, Facebook)
- "Sign up" link
- Form validation
- Loading states

**Features:**
- Form validation with error messages
- Social login placeholders
- Navigation to signup and forgot password pages
- Responsive design

#### 2. Sign Up Page (`SignUpPage.tsx`)
- Full name, email, and password fields
- Terms and conditions checkbox
- Social signup buttons
- "Sign in" link
- Form validation

**Features:**
- Email validation
- Terms agreement requirement
- Social signup placeholders
- Navigation to signin page

#### 3. Forgot Password Page (`ForgotPasswordPage.tsx`)
- Email input field
- OTP sending functionality
- Success state with resend option
- "Sign in" link

**Features:**
- Email validation
- Success state after OTP sent
- Resend OTP functionality
- Navigation back to signin

## Navigation Setup

The app uses Expo Router for navigation:

- `/` - Sign In page (default)
- `/signup` - Sign Up page
- `/forgot-password` - Forgot Password page

## Usage

### Import Components
```typescript
import { Button, Card, Input, Illustration } from '../components/ui';
import SignInPage from '../components/SignInPage';
import SignUpPage from '../components/SignUpPage';
import ForgotPasswordPage from '../components/ForgotPasswordPage';
```

### Using the Design System
```typescript
import { colors, spacing, typography } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
});
```

## Design Features

- **Consistent Color Scheme**: Blue primary color (#007AFF) matching the original design
- **Modern UI**: Clean, minimal design with proper spacing and typography
- **Responsive**: Works on different screen sizes
- **Accessible**: Proper contrast ratios and touch targets
- **Interactive**: Hover states, focus states, and loading states
- **Form Validation**: Client-side validation with error messages
- **Social Login**: Placeholder integration for Google and Facebook
- **Navigation**: Seamless navigation between auth pages

## Customization

All components use the centralized theme system, making it easy to customize:

1. **Colors**: Modify `constants/theme.ts` to change the color scheme
2. **Typography**: Update font sizes, weights, and line heights
3. **Spacing**: Adjust the spacing scale for different layouts
4. **Components**: Extend or modify individual components as needed

The design system ensures consistency across all authentication pages while maintaining the visual style from the original screenshot.
