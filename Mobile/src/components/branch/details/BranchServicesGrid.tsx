import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchDetailsStyles } from '../../../../assets/styles/branch-details.styles';
import { COLORS } from '../../../../constants/colors';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface BranchServicesGridProps {
  services?: string[];
  selectedService?: string | null;
  onSelectService?: (serviceName: string) => void;
}

/**
 * Maps raw service strings from the database or defaults to styled service cards
 */
const mapDbServiceToCard = (serviceName: string, index: number): ServiceItem => {
  const lower = serviceName.toLowerCase();

  if (lower.includes('atm') || lower.includes('card')) {
    return {
      id: `service-${index}`,
      title: 'ATM Card Request',
      description: 'New ATM Card, PIN Reset & Replacement',
      icon: <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color="#0284C7" />,
    };
  }

  if (lower.includes('account') || lower.includes('opening')) {
    return {
      id: `service-${index}`,
      title: 'Account Opening',
      description: 'New Savings, Current Account & KYC',
      icon: <FontAwesome5 name="university" size={17} color="#0284C7" />,
    };
  }

  if (lower.includes('cash') || lower.includes('deposit') || lower.includes('withdrawal')) {
    return {
      id: `service-${index}`,
      title: 'Cash Services',
      description: 'Cash Deposit, Withdrawal & Cashier Desk',
      icon: <MaterialCommunityIcons name="cash-multiple" size={20} color="#0284C7" />,
    };
  }

  if (lower.includes('loan') || lower.includes('credit') || lower.includes('finance')) {
    return {
      id: `service-${index}`,
      title: 'Loan Consultation',
      description: 'Personal Loan, Business & SME Credit',
      icon: <MaterialCommunityIcons name="handshake-outline" size={20} color="#0284C7" />,
    };
  }

  if (lower.includes('forex') || lower.includes('exchange') || lower.includes('currency') || lower.includes('remittance')) {
    return {
      id: `service-${index}`,
      title: 'Forex Exchange',
      description: 'Foreign Currency Buy/Sell & Remittance',
      icon: <MaterialCommunityIcons name="currency-usd" size={20} color="#0284C7" />,
    };
  }

  if (lower.includes('digital') || lower.includes('mobile') || lower.includes('app') || lower.includes('internet')) {
    return {
      id: `service-${index}`,
      title: 'Digital Banking',
      description: 'App Activation, Telebirr & Internet Banking',
      icon: <MaterialCommunityIcons name="cellphone-cog" size={20} color="#0284C7" />,
    };
  }

  // Default fallback for any other custom service from DB
  return {
    id: `service-${index}`,
    title: serviceName,
    description: 'Available at branch counter & customer desk',
    icon: <Ionicons name="checkmark-circle-outline" size={20} color="#0284C7" />,
  };
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'default-1',
    title: 'Account Opening',
    description: 'New Savings, Current Account & KYC',
    icon: <FontAwesome5 name="university" size={17} color="#0284C7" />,
  },
  {
    id: 'default-2',
    title: 'ATM Card Request',
    description: 'New ATM Card, PIN Reset & Replacement',
    icon: <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color="#0284C7" />,
  },
  {
    id: 'default-3',
    title: 'Cash Services',
    description: 'Cash Deposit, Withdrawal & Cashier Desk',
    icon: <MaterialCommunityIcons name="cash-multiple" size={20} color="#0284C7" />,
  },
  {
    id: 'default-4',
    title: 'Loan Consultation',
    description: 'Personal Loan, Business & SME Credit',
    icon: <MaterialCommunityIcons name="handshake-outline" size={20} color="#0284C7" />,
  },
  {
    id: 'default-5',
    title: 'Forex Exchange',
    description: 'Foreign Currency Buy/Sell & Remittance',
    icon: <MaterialCommunityIcons name="currency-usd" size={20} color="#0284C7" />,
  },
  {
    id: 'default-6',
    title: 'Digital Banking',
    description: 'App Activation, Telebirr & Internet Banking',
    icon: <MaterialCommunityIcons name="cellphone-cog" size={20} color="#0284C7" />,
  },
];

export const BranchServicesGrid: React.FC<BranchServicesGridProps> = ({
  services,
  selectedService,
  onSelectService,
}) => {
  const serviceCards: ServiceItem[] =
    services && services.length > 0
      ? services.map((s, idx) => mapDbServiceToCard(s, idx))
      : DEFAULT_SERVICES;

  return (
    <View style={branchDetailsStyles.servicesGrid}>
      {serviceCards.map((service) => {
        const isSelected = selectedService === service.title;

        return (
          <TouchableOpacity
            key={service.id}
            style={[
              branchDetailsStyles.serviceCard,
              isSelected && {
                borderColor: '#0A2540',
                borderWidth: 2,
                backgroundColor: '#F0F7FF',
              },
            ]}
            onPress={() => onSelectService && onSelectService(service.title)}
            activeOpacity={0.75}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View
                style={[
                  branchDetailsStyles.serviceIconWrap,
                  isSelected && { backgroundColor: '#DBEAFE' },
                ]}
              >
                {service.icon}
              </View>

              {isSelected && (
                <View
                  style={{
                    backgroundColor: '#0A2540',
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text
              style={[
                branchDetailsStyles.serviceTitle,
                isSelected && { color: '#0A2540', fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {service.title}
            </Text>
            <Text style={branchDetailsStyles.serviceDescription} numberOfLines={2}>
              {service.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BranchServicesGrid;
