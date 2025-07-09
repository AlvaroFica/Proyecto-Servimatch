import React from 'react';
import { StyleSheet } from 'react-native';
import {
    Card,
    Avatar,
    Text,
    useTheme,
    IconButton,
    Surface,
} from 'react-native-paper';

import type { AccessibilityRole, AccessibilityState } from 'react-native';
export interface ServiceCardProps {
    title: string;
    subtitle?: string;
    iconUrl?: string;
    onPress?: () => void;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
    style?: any;
    selected?: boolean;
}

export default function ServiceCard({
    title,
    subtitle,
    iconUrl,
    onPress,
    accessibilityRole,
    accessibilityState,
    style,
    selected,
}: ServiceCardProps) {
    const theme = useTheme();
    const borderStyle = selected ? { borderColor: theme.colors.primary, borderWidth: 2 } : {};
    return (
        <Card
            mode="elevated"
            onPress={onPress}
            style={[
                styles.card,
                borderStyle,
                style,
                { backgroundColor: theme.colors.surface, marginHorizontal: 4 }
            ]}
            elevation={2}
            accessibilityRole={accessibilityRole}
            accessibilityState={accessibilityState}
        >
            <Card.Title
                title={title}
                subtitle={subtitle}
                titleStyle={styles.title}
                subtitleStyle={styles.subtitle}
                left={props =>
                    iconUrl
                        ? <Avatar.Image {...props} source={{ uri: iconUrl }} size={40} />
                        : <Avatar.Icon {...props} icon="briefcase-outline" size={40} />
                }
                right={props => (
                    // @ts-ignore
                    <IconButton
                        {...props}
                        icon={selected ? 'check-circle' : 'chevron-right'}
                        iconColor={selected ? theme.colors.primary : undefined}
                    />
                )}
                // @ts-ignore
                titleNumberOfLines={1}
                // @ts-ignore
                subtitleNumberOfLines={1}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 6,
        marginHorizontal: 0,
        borderRadius: 12,
        overflow: 'hidden',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
});
