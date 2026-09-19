import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, History } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function BottomTabBar({ activeTab, onTabChange }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, SPACING.sm);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer,
                ]}
              >
                <IconComponent
                  size={20}
                  color={isActive ? COLORS.primary : COLORS.textMuted}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  tabsRow: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primaryMuted,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
