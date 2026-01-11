import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { THEMES } from '../data/themes';

const ThemeBackground = ({ theme = THEMES[0], children }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const prevColorRef = useRef(theme.background[0]);
  const nextColorRef = useRef(theme.background[0]);

  useEffect(() => {
    if (theme.background[0] !== nextColorRef.current) {
      prevColorRef.current = nextColorRef.current;
      nextColorRef.current = theme.background[0];
      
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [theme]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [prevColorRef.current, nextColorRef.current],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor }
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemeBackground;
