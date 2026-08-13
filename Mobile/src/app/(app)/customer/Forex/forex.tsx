import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { forexStyles } from '../../../../../assets/styles/forex.styles';
import { TickerTape } from '../../../../components/forex/TickerTape';
import { CurrencyConverter } from '../../../../components/forex/CurrencyConverter';
import { ExchangeRatesTable } from '../../../../components/forex/ExchangeRatesTable';
import { ForexAiBanner } from '../../../../components/forex/ForexAiBanner';
import { RateAlertModal } from '../../../../components/forex/RateAlertModal';
import { COLORS } from '../../../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForexPage() {
    const router = useRouter();
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
                        <Text style={forexStyles.headerTitle}>Forex & Currency Exchange</Text>
                        <Text style={forexStyles.headerSubtitle}>Wegagen Bank Official Live Rates</Text>
                    </View>
                </View>
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
                <ExchangeRatesTable />
            </ScrollView>

            {/* 5. Rate Alert Modal */}
            <RateAlertModal
                visible={alertModalVisible}
                onClose={() => setAlertModalVisible(false)}
            />
        </View>
    );
}