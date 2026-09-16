# Swipe UI

A focused, Tinder-style swipe card demo built with [Expo](https://expo.dev), [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/), and [React Native Reanimated 3](https://docs.swmansion.com/react-native-reanimated/).

It renders a stack of profile cards that can be dragged in any direction, or swiped with the on-screen like/dislike buttons. The card interpolates rotation, opacity, and the next card's scale as it's dragged, and animates off-screen (or snaps back) on release.

## Key implementation detail: gesture handling runs on the UI thread

The drag gesture is built with Gesture Handler's `Gesture.Pan()` API (see `app/(tabs)/index.tsx`) rather than React Native's legacy `PanResponder`. This matters because:

- `onUpdate` mutates Reanimated shared values (`translateX`, `translateY`, `nextCardScale`) directly inside a UI-thread worklet, so every touch-move frame is handled without crossing the JS bridge.
- `onEnd` decides the swipe outcome (left/right/up/down or snap-back) and only hops back to the JS thread via `runOnJS` for the parts that must run there — updating React state once the card animation completes.
- `components/CardView.tsx` wraps the top card in a `GestureDetector` and derives all of its visual transform (position, rotation, opacity, scale) from those shared values inside `useAnimatedStyle`, so the whole gesture-to-animation pipeline stays off the JS thread until a card is actually dismissed.

This is the idiomatic way to combine Gesture Handler 2 with Reanimated 3, and it's what keeps the drag feeling smooth even under JS-thread load.

## Project structure

- `app/(tabs)/index.tsx` — the swipe screen: gesture setup, swipe/reset logic, and the like/dislike buttons.
- `components/CardView.tsx` — a single animated card, including the gesture detector for the top card.
- `animation/data/data.ts` — sample card data (placeholder names/bios with generic stock photos).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npx expo start
   ```

   From the Expo CLI output you can open the app in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), an Android emulator, an iOS simulator, or [Expo Go](https://expo.dev/go).

## Scripts

- `npm run start` — start the Expo dev server (dev client)
- `npm run ios` / `npm run android` — build and run on a simulator/emulator
- `npm run web` — run in the browser
- `npm run lint` — run Expo's lint config
- `npm run test` — run the Jest test suite
