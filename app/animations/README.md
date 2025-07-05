# My Calm Baby - Animation System

This folder contains the animation system for the My Calm Baby app. Each animation is contained in its own folder, making it easy to add new animations to the app without modifying the core codebase.

## Animation Folder Structure

Each animation folder must contain the following files:

1. `animation.tsx` - The React component that renders the animation
2. `animation.json` - Configuration file for the animation (metadata, elements, etc.)
3. `thumbnail.png` - Image used for the animation card in the carousel

## Adding a New Animation

To add a new animation to the app, follow these steps:

1. Create a new folder in the `app/animations` directory with a unique name (e.g., `my-new-animation`)
2. Create the required files in the new folder:

### 1. animation.json

This file defines the metadata for your animation and the elements that will be rendered.

```json
{
  "id": "my-new-animation",
  "name": "My New Animation",
  "description": "A brief description of the animation",
  "folder": "my-new-animation",
  "thumbnail": "thumbnail.png",
  "elements": [
    {
      "type": "circle",
      "properties": {
        "size": 100,
        "color": "#3B82F6",
        "animations": {
          "rotate": true,
          "scale": true,
          "opacity": true
        },
        "position": {
          "x": 150,
          "y": 250
        }
      }
    }
    // Add more elements as needed
  ]
}
```

### 2. animation.tsx

This file contains the React component that renders your animation. The component will receive props from the main animation screen.

```tsx
import React from 'react';
import { View, Animated } from 'react-native';
import { AnimationElement } from '../../utils/AnimationManager';

// Props that will be passed to your animation component
interface AnimationProps {
  animationValue: Animated.Value;
  rotationValue: Animated.Value;
  scaleValue: Animated.Value;
  elements: AnimationElement[];
  styles: Record<string, any>;
}

// Your animation component
const MyNewAnimation: React.FC<AnimationProps> = ({
  animationValue,
  rotationValue,
  scaleValue,
  elements,
  styles,
}) => {
  // Create any animation interpolations you need
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.animationContainer}>
      {elements.map((element, index) => {
        const { type, properties } = element;
        const { size, color, animations = {}, position } = properties;

        const positionStyle = position ? {
          position: 'absolute' as const,
          top: position.y || 0,
          left: position.x || 0,
        } : {};

        const transforms = [];
        if (animations.rotate) {
          transforms.push({ rotate: rotation });
        }
        if (animations.scale) {
          transforms.push({ scale: scaleValue });
        }

        const opacityStyle = animations.opacity ? { opacity: animationValue } : {};

        // Render different shapes based on the element type
        switch (type) {
          case 'circle':
            return (
              <Animated.View
                key={`element-${index}`}
                style={[
                  styles.circle,
                  {
                    width: size,
                    height: size,
                    backgroundColor: color,
                    transform: transforms,
                    ...opacityStyle,
                    ...positionStyle,
                  },
                ]}
              />
            );
          // Add cases for other shapes as needed
          default:
            return null;
        }
      })}
    </View>
  );
};

export default MyNewAnimation;
```

### 3. thumbnail.png

Create a PNG image (recommended size: 200x200px) that represents your animation. This image will be displayed in the animation carousel on the main menu.

## Animation System Architecture

The animation system works as follows:

1. `AnimationManager` loads all animations from the `app/animations` directory
2. Each animation's `animation.json` file is parsed to create an `AnimationConfig` object
3. The main menu displays a carousel of animations using the thumbnail images
4. When the user selects an animation and presses Play, the app navigates to the animation screen
5. The animation screen loads the selected animation's `animation.tsx` component and renders it
6. The animation component receives props from the animation screen (animationValue, rotationValue, etc.)

This architecture allows for a plug-and-play system where new animations can be added simply by creating a new folder with the required files.

## Example Animations

The app comes with two example animations:

1. `basic-shapes` - A simple animation with basic geometric shapes
2. `nature-patterns` - A more complex animation with nature-themed elements

You can use these as references when creating your own animations.
