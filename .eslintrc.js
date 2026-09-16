// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
  rules: {
    // react-native-reanimated's SharedValue.value mutation (the standard,
    // documented way to update a shared value from inside a worklet) is a
    // legitimate exception to this rule, which doesn't yet recognize it.
    'react-hooks/immutability': 'off',
  },
};
