import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Portal } from 'react-native-paper';

interface DropdownItem {
  label: string;
  value: string;
  onPress: () => void;
  leadingIcon?: string;
  titleStyle?: any;
}

interface CustomDropdownProps {
  visible: boolean;
  onDismiss: () => void;
  anchor: React.ReactElement;
  items: DropdownItem[];
  anchorRef?: React.RefObject<View>;
}

export function CustomDropdown({
  visible,
  onDismiss,
  anchor,
  items,
}: CustomDropdownProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [anchorLayout, setAnchorLayout] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, minWidth: 0, maxHeight: 300 });
  const anchorRef = React.useRef<View>(null);
  const dropdownRef = React.useRef<View>(null);

  // Calculate dropdown position to avoid overflow
  const calculatePosition = (x: number, y: number, width: number, height: number) => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    
    // Maximum dropdown height (with scroll)
    const MAX_DROPDOWN_HEIGHT = 300;
    const ITEM_HEIGHT = 48;
    const estimatedDropdownHeight = Math.min(items.length * ITEM_HEIGHT + 8, MAX_DROPDOWN_HEIGHT);
    
    // Calculate minimum width needed for items (estimate based on longest label)
    const MIN_DROPDOWN_WIDTH = 160; // Minimum width to show text properly
    const estimatedDropdownWidth = Math.max(width, MIN_DROPDOWN_WIDTH);
    
    // Calculate vertical position
    const spaceBelow = screenHeight - (y + height);
    const spaceAbove = y;
    const showAbove = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;
    
    // Calculate horizontal position
    // Check if anchor is on the right side of screen
    const anchorCenterX = x + width / 2;
    const isOnRightSide = anchorCenterX > screenWidth / 2;
    
    let left = x;
    
    // If anchor is on the right side, align dropdown to the right edge of anchor
    if (isOnRightSide) {
      // Align right edge of dropdown with right edge of anchor
      left = x + width - estimatedDropdownWidth;
      
      // If this would overflow on the left, align to right edge of screen
      if (left < 8) {
        left = screenWidth - estimatedDropdownWidth - 8;
      }
    } else {
      // If anchor is on the left side, align dropdown to the left edge of anchor
      left = x;
      
      // If this would overflow on the right, align to left edge of screen
      if (left + estimatedDropdownWidth > screenWidth - 8) {
        left = screenWidth - estimatedDropdownWidth - 8;
      }
    }
    
    // Ensure minimum left margin
    if (left < 8) {
      left = 8;
    }
    
    // Ensure dropdown doesn't overflow on the right
    if (left + estimatedDropdownWidth > screenWidth - 8) {
      left = screenWidth - estimatedDropdownWidth - 8;
    }
    
    const top = showAbove 
      ? y - estimatedDropdownHeight - 4 // Show above with 4px gap
      : y + height + 4; // Show below with 4px gap
    
    return {
      top: Math.max(8, Math.min(top, screenHeight - estimatedDropdownHeight - 8)),
      left: Math.max(8, left),
      minWidth: Math.min(estimatedDropdownWidth, screenWidth - 16),
      maxHeight: estimatedDropdownHeight,
    };
  };

  useEffect(() => {
    if (visible) {
      // Measure anchor position
      anchorRef.current?.measureInWindow((x, y, width, height) => {
        setAnchorLayout({ x, y, width, height });
        const position = calculatePosition(x, y, width, height);
        setDropdownPosition(position);
      });
      
      // Start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim, items.length]);

  // Clone anchor element - keep original onPress when not visible
  const anchorElement = React.cloneElement(anchor, {
    ...(visible ? {} : { onPress: (anchor.props as any).onPress }),
  });

  const dropdownStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        {anchorElement}
      </View>
      {visible && (
      <Portal>
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={onDismiss}
        >
          <Pressable style={styles.overlay} onPress={onDismiss}>
            <Animated.View
              ref={dropdownRef}
              style={[
                styles.dropdown,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  minWidth: dropdownPosition.minWidth,
                  maxHeight: dropdownPosition.maxHeight,
                },
                dropdownStyle,
              ]}
            >
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
              >
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={item.value || index}
                    style={[
                      styles.item,
                      index === items.length - 1 && styles.lastItem,
                    ]}
                    onPress={() => {
                      item.onPress();
                      onDismiss();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant="bodyMedium"
                      style={[styles.itemText, item.titleStyle]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Modal>
      </Portal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minWidth: 112,
    maxWidth: 280,
    zIndex: 1000,
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemText: {
    color: '#000',
    fontSize: 16,
  },
});
