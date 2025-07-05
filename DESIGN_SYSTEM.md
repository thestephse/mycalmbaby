# My Calm Baby - Design System

A comprehensive design system inspired by modern wellness and meditation apps, focusing on calming, approachable, and intuitive user experiences.

## 🎨 Color Palette

### Primary Colors
```css
/* Primary Blue */
--primary-blue: #4A90E2;
--primary-blue-light: #6BA6FF;
--primary-blue-dark: #357ABD;

/* Secondary Blues */
--sky-blue: #87CEEB;
--powder-blue: #B0E0E6;
--alice-blue: #F0F8FF;
```

### Neutral Colors
```css
/* Whites & Grays */
--white: #FFFFFF;
--off-white: #FAFAFA;
--light-gray: #F5F5F5;
--medium-gray: #E0E0E0;
--dark-gray: #757575;
--charcoal: #424242;
```

### Accent Colors
```css
/* Mood & Category Colors */
--happy-yellow: #FFD700;
--calm-green: #90EE90;
--stress-orange: #FFA500;
--anxiety-red: #FF6B6B;
--peaceful-purple: #DDA0DD;
--energy-pink: #FF69B4;
```

### Semantic Colors
```css
/* Status Colors */
--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;
```

## 📱 Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Type Scale
```css
/* Headlines */
--text-xl: 28px;     /* Page titles */
--text-lg: 24px;     /* Section headers */
--text-md: 20px;     /* Card titles */

/* Body Text */
--text-base: 16px;   /* Primary body text */
--text-sm: 14px;     /* Secondary text */
--text-xs: 12px;     /* Captions, labels */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## 🧩 Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--primary-blue);
  color: var(--white);
  border-radius: 24px;
  padding: 12px 24px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  min-height: 48px;
  border: none;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.btn-primary:hover {
  background: var(--primary-blue-dark);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--white);
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  border-radius: 24px;
  padding: 10px 24px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  min-height: 48px;
}
```

#### Pill Button (Small)
```css
.btn-pill {
  background: var(--primary-blue);
  color: var(--white);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  min-height: 36px;
  border: none;
}
```

#### Mood Selector Button
```css
.btn-mood {
  background: var(--white);
  border: 2px solid var(--light-gray);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.btn-mood.active {
  border-color: var(--primary-blue);
  background: var(--alice-blue);
}
```

### Cards

#### Primary Card
```css
.card-primary {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--light-gray);
}
```

#### Feature Card (with illustration)
```css
.card-feature {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
  border-radius: 20px;
  padding: 24px;
  color: var(--white);
  position: relative;
  overflow: hidden;
}
```

#### Insight Card
```css
.card-insight {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

### Form Elements

#### Text Input
```css
.input-text {
  background: var(--white);
  border: 2px solid var(--light-gray);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: var(--text-base);
  min-height: 48px;
  width: 100%;
}

.input-text:focus {
  border-color: var(--primary-blue);
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}
```

#### Toggle Switch
```css
.toggle-switch {
  width: 50px;
  height: 28px;
  background: var(--medium-gray);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
}

.toggle-switch.active {
  background: var(--primary-blue);
}
```

### Navigation

#### Tab Bar
```css
.tab-bar {
  background: var(--white);
  border-top: 1px solid var(--light-gray);
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
}

.tab-item.active {
  background: var(--alice-blue);
  color: var(--primary-blue);
}
```

## 📏 Spacing & Layout

### Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 50%;
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

## 🎭 Iconography

### Icon Style Guidelines
- Use outline-style icons for consistency
- Icon size: 16px, 20px, 24px, 32px
- Stroke width: 1.5px for small icons, 2px for larger icons
- Color: Primary blue for active states, medium gray for inactive

### Common Icons
- Home: house outline
- Profile: person circle outline  
- Settings: cog outline
- Play: play circle outline
- Pause: pause circle outline
- Heart: heart outline (favorites)
- Star: star outline (ratings)
- Plus: plus circle outline (add)

## 🌈 Illustrations

### Style Guidelines
- Simple, friendly, and approachable
- Use primary color palette with soft gradients
- Rounded, organic shapes
- Minimal detail with focus on emotion
- Consistent character style across all illustrations

### Common Illustration Themes
- Meditation poses
- Nature elements (clouds, stars, moon)
- Abstract calming shapes
- Parent-child interactions
- Sleep-related imagery

## 📱 Component Usage Examples

### Mood Selector Row
```jsx
<View style={styles.moodSelector}>
  <Text style={styles.questionText}>How are you feeling today?</Text>
  <View style={styles.moodRow}>
    <TouchableOpacity style={[styles.moodButton, styles.happy]}>
      <Text>😊</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.moodButton, styles.calm]}>
      <Text>😌</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.moodButton, styles.stressed]}>
      <Text>😤</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.moodButton, styles.sad]}>
      <Text>😔</Text>
    </TouchableOpacity>
  </View>
</View>
```

### Feature Card with CTA
```jsx
<View style={styles.featureCard}>
  <View style={styles.cardContent}>
    <Text style={styles.cardTitle}>Insights on staying focused</Text>
    <Text style={styles.cardSubtitle}>
      Explore breathing techniques on maintaining clarity as a way of staying present.
    </Text>
    <TouchableOpacity style={styles.cardButton}>
      <Text style={styles.cardButtonText}>Listen now</Text>
    </TouchableOpacity>
  </View>
  <Image source={focusIllustration} style={styles.cardIllustration} />
</View>
```

## 🔤 Voice & Tone

### Personality
- **Calm & Soothing**: Use gentle, reassuring language
- **Supportive**: Encouraging without being pushy  
- **Simple**: Clear, easy-to-understand instructions
- **Empathetic**: Acknowledge user's emotional state

### Writing Guidelines
- Use second person ("you") to create connection
- Keep sentences short and actionable
- Avoid medical or clinical terminology
- Use positive, affirming language
- Include helpful context without overwhelming

### Example Copy
- **Button Labels**: "Start session", "Continue", "Try again"
- **Success Messages**: "Great job! You've completed your session"
- **Error Messages**: "Something went wrong. Let's try that again"
- **Onboarding**: "Let's create your personal calm space"

## 🎯 Accessibility

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 ratio)
- Interactive elements must be clearly distinguishable
- Don't rely solely on color to convey information

### Touch Targets
- Minimum 44px × 44px for all interactive elements
- Adequate spacing between touch targets (8px minimum)
- Clear visual feedback for all interactions

### Typography
- Scalable text that works with system font size settings
- Clear hierarchy with sufficient size differences
- High contrast between text and background

## 📋 Implementation Notes

### React Native StyleSheet
```javascript
export const designTokens = {
  colors: {
    primary: '#4A90E2',
    primaryLight: '#6BA6FF',
    primaryDark: '#357ABD',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F5F5',
    mediumGray: '#E0E0E0',
    darkGray: '#757575',
    charcoal: '#424242',
    happyYellow: '#FFD700',
    calmGreen: '#90EE90',
    stressOrange: '#FFA500',
    anxietyRed: '#FF6B6B',
    peacefulPurple: '#DDA0DD',
    energyPink: '#FF69B4',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      md: 18,
      lg: 24,
      xl: 28,
      xxl: 32,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};
```

## 🧩 Refactored Components

The following components have been refactored to use the design system tokens:

### Onboarding Screen
- **Sequence Circles**: Corner buttons with active/inactive states using design tokens for colors, typography, and spacing
- **Sequence Dots**: Indicators showing unlock pattern progress with consistent sizing and styling
- **Layout**: Consistent spacing and alignment using design token spacing scale

### Animation Screen
- **Animation Elements**: Circles and squares using design token colors and border radius
- **Sequence Dots**: Consistent styling with main menu and onboarding screens
- **Error Indicators**: Using semantic colors from the design system

### Main Menu Screen
- **Play Button**: Large touch target with primary color, proper spacing, and shadow
- **Animation Pack Cards**: Cards with consistent styling, proper spacing, and shadows
- **Download Button**: Properly sized button within animation pack cards
- **Toggle Controls**: Consistent styling for white noise and sleep timer controls

---

*This design system is living document and should be updated as the product evolves. All components should be tested across different screen sizes and accessibility settings.*
