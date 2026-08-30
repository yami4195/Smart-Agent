import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { forexStyles } from '../../../../../assets/styles/forex.styles';
import { notificationStyles } from '../../../../../assets/styles/notification.styles';
import { TickerTape } from '../../../../components/forex/TickerTape';
import { CurrencyConverter } from '../../../../components/forex/CurrencyConverter';
import { ExchangeRatesTable } from '../../../../components/forex/ExchangeRatesTable';
import { ForexAiBanner } from '../../../../components/forex/ForexAiBanner';
import { RateAlertModal } from '../../../../components/forex/RateAlertModal';
import { COLORS } from '../../../../../constants/colors';
import { useNotification } from '../../../../contexts/NotificationContext';
import { forexApi, ForexRate } from '../../../../api/forexApi';

export default function ForexPage() {
    const router = useRouter();
    const { unreadCount, openNotificationModal } = useNotification();
    const scrollViewRef = useRef<ScrollView>(null);

    const [rates, setRates] = useState<ForexRate[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedCurrencyToConvert, setSelectedCurrencyToConvert] = useState<string>('USD');
    const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);

    const fetchRates = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await forexApi.getRates();
            if (response && response.rates) {
                setRates(response.rates);
                setLastUpdated(response.lastUpdated || new Date().toISOString());
            }
        } catch (error) {
            console.warn('Failed to fetch live forex rates:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    const handleBookTicket = () => {
        router.push('/customer/queue');
    };

    const handleOpenAlertModal = () => {
        setAlertModalVisible(true);
    };

    const handleSelectCurrencyToConvert = (code: string) => {
        setSelectedCurrencyToConvert(code);
        // Scroll up smoothly to the converter
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
                        <View style={notificationStyles.unreadBadge}>
                            <Text style={notificationStyles.unreadBadgeText}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={forexStyles.container}
                contentContainerStyle={forexStyles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchRates(true)}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* 1. Real-Time Market Ticker Tape */}
                <TickerTape rates={rates} lastUpdated={lastUpdated} />

                {/* 2. Instant Multi-Currency Converter & Calculator */}
                <CurrencyConverter
                    rates={rates}
                    loading={loading}
                    selectedCurrencyCode={selectedCurrencyToConvert}
                    onBookTicketPress={handleBookTicket}
                    onSetAlertPress={handleOpenAlertModal}
                />

                {/* 3. Smart Agent AI Assistance Banner */}
                <ForexAiBanner />

                {/* 4. Full Exchange Rates Directory Table */}
                <ExchangeRatesTable
                    rates={rates}
                    loading={loading}
                    onSelectCurrencyToConvert={handleSelectCurrencyToConvert}
                />
            </ScrollView>

            {/* 5. Rate Alert Modal */}
            <RateAlertModal
                visible={alertModalVisible}
                rates={rates}
                initialCurrencyCode={selectedCurrencyToConvert}
                onClose={() => setAlertModalVisible(false)}
            />
        </View>
    );
}