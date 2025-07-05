import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Badge } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Props {
  name: string;
  color: string;
  size: number;
  focused: boolean;
  badgeCount?: number;
  type?: 'ionicons' | 'material';
}

export default function CustomTabIcon({
  name,
  color,
  size,
  focused,
  badgeCount = 0,
  type = 'ionicons',
}: Props) {
  const IconComponent = type === 'material' ? MaterialIcons : Ionicons;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.iconContainer}>
        <IconComponent name={name as any} size={size} color={color} />
        {badgeCount > 0 && (
          <Badge style={styles.badge}>{badgeCount}</Badge>
        )}
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30, // 🔽 reduce altura total
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: '#D32F2F',
    color: '#fff',
    fontSize: 10,
    zIndex: 10,
  },
  dot: {
    position: 'absolute',
    bottom: -4, // 🔽 aparece justo debajo del ícono
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2B6CB0',
  },
});
