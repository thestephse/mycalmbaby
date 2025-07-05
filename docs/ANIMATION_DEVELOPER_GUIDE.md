# Animation Developer Guide

This guide explains how to add new animations to the My Calm Baby app using the new animation system.

## Animation System Overview

The app now uses a folder-based animation system that allows for easy addition of new animations without modifying core code. The system consists of:

1. **Folder Structure**: Animations are organized in folders under `assets/animations/`
2. **Animation Manager**: A utility that loads and manages animations (`app/utils/AnimationManager.ts`)
3. **Animation Drawer**: A bottom sheet UI component for selecting animations (`app/components/AnimationDrawer.tsx`)

## Adding a New Animation

To add a new animation to the app, follow these steps:

### 1. Create a new animation folder

Create a new folder under `assets/animations/` with a descriptive name (use kebab-case):

```bash
mkdir -p assets/animations/your-animation-name
```

### 2. Add a thumbnail image

Create a thumbnail image for your animation and save it in the animation folder:

```
assets/animations/your-animation-name/thumbnail.png
```

The recommended thumbnail size is 200x200 pixels.

### 3. Update the AnimationManager.ts file

Open `app/utils/AnimationManager.ts` and add your new animation to the `DEFAULT_ANIMATIONS` array:

```typescript
{
  id: 'your-animation-name',
  name: 'Your Animation Name',
  description: 'Brief description of your animation',
  folder: 'your-animation-name',
  thumbnail: require('../../assets/animations/your-animation-name/thumbnail.png'),
  elements: [
    {
      type: 'circle', // or 'square', 'triangle', 'custom'
      properties: {
        size: 100,
        color: '#3B82F6', // Use any color
        animations: {
          rotate: true,
          scale: true,
          opacity: true,
          // Add other animation properties as needed
        },
      },
    },
    // Add more elements as needed
  ],
}
```

### 4. Animation Element Properties

Each animation element can have the following properties:

- **type**: The shape type ('circle', 'square', 'triangle', or 'custom')
- **properties**: An object containing:
  - **size**: Size in pixels
  - **color**: Color in hex format
  - **position**: Optional position override {x, y}
  - **animations**: Which animations to apply to this element:
    - **rotate**: Boolean - whether to rotate the element
    - **scale**: Boolean - whether to scale the element
    - **opacity**: Boolean - whether to animate opacity
    - **translateX/Y**: Boolean - whether to translate the element

### 5. Testing Your Animation

1. Restart the app
2. Navigate to the animation screen
3. Swipe up on the bottom drawer to see all animations
4. Select your new animation to test it

## Advanced Animation Configuration

### Custom Animation Elements

For more complex animations, you can create custom elements:

```typescript
{
  type: 'custom',
  properties: {
    size: 100,
    color: '#3B82F6',
    shape: 'star', // Custom shape identifier
    points: 5, // Number of points for star
    animations: {
      rotate: true,
      scale: true,
    },
    // Add any other custom properties
  },
}
```

### Animation Timing

You can customize animation timing for each element:

```typescript
animations: {
  rotate: {
    enabled: true,
    duration: 5000, // milliseconds
    delay: 500,
  },
  scale: {
    enabled: true,
    duration: 3000,
    min: 0.8,
    max: 1.2,
  }
}
```

## Future Enhancements

In future versions, the animation system will support:

1. Dynamic loading of animation configurations from JSON files
2. User-created custom animations
3. More animation types and properties
4. Sharing animations between users

## Troubleshooting

If your animation doesn't appear:

1. Check that the thumbnail path is correct
2. Verify the animation ID is unique
3. Make sure the folder name matches the folder property in the animation config
4. Check the console for any errors

For additional help, contact the development team.
