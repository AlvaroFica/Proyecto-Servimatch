// components/BaseLayout.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, View, Platform, StatusBar } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BaseLayoutProps {
  title?: string;
  back?: boolean;
  children: ReactNode;
}

export default function BaseLayout({ title = '', back = false, children }: BaseLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? StatusBar.currentHeight || insets.top : insets.top;

  return (
    <SafeAreaView
      style={[
        styles.root,
        { paddingTop: topPadding, backgroundColor: theme.colors.background },
      ]}
    >
      <Appbar style={[styles.appbar, { backgroundColor: theme.colors.primary }]}>
        {back && (
          <Appbar.BackAction
            onPress={() => router.back()}
            color={theme.colors.onPrimary}
            size={20} // 👈 ícono más pequeño
          />
        )}
        <Appbar.Content
          title={title}
          titleStyle={{
            color: theme.colors.onPrimary,
            fontWeight: '600',
            fontSize: 16, // 👈 texto más pequeño
          }}
        />
      </Appbar>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  appbar: {
    height: 44, // 👈 altura compacta (por defecto es 56+)
    elevation: 0,
  },
});
