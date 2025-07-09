import React from 'react';
import { Portal, Surface, Text, IconButton, useTheme } from 'react-native-paper';
import { TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

interface ErrorModalProps {
    visible: boolean;
    message: string;
    onDismiss: () => void;
    color?: 'primary' | 'error'; // Permite personalizar el color del borde y el texto
}

export default function ErrorModal({ visible, message, onDismiss, color = 'error' }: ErrorModalProps) {
    const { colors } = useTheme();
    const borderColor = color === 'error' ? colors.error : colors.primary;
    const textColor = color === 'error' ? colors.error : colors.primary;
    const cardBg = colors.background;
    return (
        <Portal>
            {visible && (
                <>
                    <TouchableWithoutFeedback onPress={onDismiss}>
                        <View style={[styles.overlay, { zIndex: 2000 }]} />
                    </TouchableWithoutFeedback>
                    <View
                        pointerEvents="box-none"
                        style={[styles.center, { zIndex: 2001 }]}
                    >
                        <Surface style={[styles.card, { borderColor, backgroundColor: cardBg, elevation: 12 }]}>
                            <Text style={[styles.text, { color: textColor }]}>{message}</Text>
                        </Surface>
                    </View>
                </>
            )}
        </Portal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    center: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '80%',
        padding: 24,
        borderRadius: 12,
        borderWidth: 2,
    },
    header: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
    text: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
