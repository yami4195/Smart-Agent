import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { forexStyles } from '../../../../../assets/styles/forex.styles';
import { TickerTape } from '../../../../components/forex/TickerTape';
import { CurrencyConverter } from '../../../../components/forex/CurrencyConverter';
import { ExchangeRatesTable } from '../../../../components/forex/ExchangeRatesTable';
import { ForexAiBanner } from '../../../../components/forex/ForexAiBanner';
import { RateAlertModal } from '../../../../components/forex/RateAlertModal';
import { COLORS } from '../../../../../constants/colors';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function ForexPage() {
    const router = useRouter();
    const { unreadCount, openNotificationModal } = useNotification();
    const [alertModalVisible, setAlertModalVisible] = useState(false);

    const handleBookTicket = () => {
        // Navigate to queue booking tab/screen
        router.push('/customer/queue');
    };

    const handleOpenAlertModal = () => {
        setAlertModalVisible(true);
    };

    return (
        <View style={forexStyles.safeArea}>
            {/* Top Header Bar */}
            <View style={forexStyles.headerContainer}>
                <View style={forexStyles.headerLeft}>
                    <Pressable style={forexStyles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
                    </Pressable>
                    <View>
                        <Text style={forexStyles.headerTitle}>Forex & Currency</Text>
                        <Text style={forexStyles.headerSubtitle}>Wegagen Live Rates</Text>
                    </View>
                </View>
                <Pressable style={forexStyles.backButton} onPress={openNotificationModal}>
                    <Ionicons name="notifications-outline" size={20} color={COLORS.navy} />
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>

            <ScrollView style={forexStyles.container} contentContainerStyle={forexStyles.scrollContent}>
                {/* 1. Real-Time Market Ticker Tape */}
                <TickerTape />

                {/* 2. Instant Multi-Currency Converter & Calculator */}
                <CurrencyConverter
                    onBookTicketPress={handleBookTicket}
                    onSetAlertPress={handleOpenAlertModal}
                />

                {/* 3. Smart Agent AI Assistance Banner */}
                <ForexAiBanner />

                {/* 4. Full Exchange Rates Directory Table */}
                <ExchangeRatesTable/>
            </ScrollView>

            {/* 5. Rate Alert Modal */}
            <RateAlertModal
                visible={alertModalVisible}
                onClose={() => setAlertModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    unreadBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    unreadBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});