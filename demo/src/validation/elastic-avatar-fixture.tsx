import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';
import { Button, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

const avatar = require('../../assets/validation/avatar.png');

export function ElasticAvatarFixture() {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [enableHeaderBounce, setEnableHeaderBounce] = useState(true);
  const [bounces, setBounces] = useState(true);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [refreshEnabled, setRefreshEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [status, setStatus] = useState('Ready');

  const cancelRefreshTimer = useCallback(() => {
    if (refreshTimer.current !== null) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  useEffect(() => cancelRefreshTimer, [cancelRefreshTimer]);

  const onRefresh = useCallback(() => {
    cancelRefreshTimer();
    setRefreshCount((count) => count + 1);
    setRefreshing(true);
    setStatus('Refreshing');
    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      setRefreshing(false);
      setStatus('Refresh complete');
    }, 1000);
  }, [cancelRefreshTimer]);

  const toggleRefreshing = useCallback(() => {
    cancelRefreshTimer();
    setRefreshing((value) => !value);
    setStatus('Controlled refresh');
  }, [cancelRefreshTimer]);

  const toggleRefreshControl = useCallback(() => {
    cancelRefreshTimer();
    setRefreshing(false);
    setRefreshEnabled((value) => !value);
    setStatus('Ready');
  }, [cancelRefreshTimer]);

  const resetToTop = useCallback(() => {
    cancelRefreshTimer();
    setRefreshing(false);
    setStatus('Reset to top');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [cancelRefreshTimer]);

  return (
    <View style={styles.fill}>
      <View style={styles.controls}>
        <Button
          testID="elastic-refresh-control-toggle"
          title={`Refresh control: ${refreshEnabled ? 'on' : 'off'}`}
          onPress={toggleRefreshControl}
        />
        <Button
          testID="elastic-bounce-toggle"
          title={`Header bounce: ${enableHeaderBounce ? 'on' : 'off'}`}
          onPress={() => setEnableHeaderBounce((value) => !value)}
        />
        <Button
          testID="native-bounces-toggle"
          title={`Bounces: ${bounces ? 'on' : 'off'}`}
          onPress={() => setBounces((value) => !value)}
        />
        <Button
          testID="scroll-enabled-toggle"
          title={`Scroll: ${scrollEnabled ? 'on' : 'off'}`}
          onPress={() => setScrollEnabled((value) => !value)}
        />
        <Button
          testID="elastic-refresh-toggle"
          title={`Refreshing: ${refreshing ? 'on' : 'off'}`}
          onPress={toggleRefreshing}
        />
        <Button testID="elastic-reset" title="Reset to top" onPress={resetToTop} />
      </View>
      <Text testID="fixture-status" style={styles.status}>
        Refreshes: {refreshCount} · {status}
      </Text>
      <AvatarHeaderScrollView
        ref={scrollRef}
        title="Elastic Avatar"
        titleTestID="fixture-title"
        subtitle="Pull beyond the top"
        subtitleTestID="elastic-foreground"
        image={avatar}
        backgroundColor={colors.header}
        containerStyle={styles.fill}
        contentContainerStyle={styles.content}
        titleStyle={styles.heading}
        parallaxHeight={220}
        headerHeight={64}
        enableSafeAreaTopInset={false}
        enableHeaderBounce={enableHeaderBounce}
        bounces={bounces}
        alwaysBounceVertical
        scrollEnabled={scrollEnabled}
        refreshControl={
          !refreshEnabled || Platform.OS === 'web' ? undefined : (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          )
        }>
        <View testID="elastic-body" collapsable={false} style={styles.body}>
          <Text testID="elastic-body-start" style={styles.row}>
            Short content starts here
          </Text>
          <Text style={styles.row}>Pull down, reverse, then release.</Text>
          <Text style={styles.row}>The foreground and content should move together.</Text>
        </View>
      </AvatarHeaderScrollView>
    </View>
  );
}

const colors = { background: '#ffffff', header: '#17494d', border: '#d4dedf' };

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  content: { backgroundColor: colors.background },
  body: { backgroundColor: colors.background },
  heading: { color: colors.background, fontSize: 24 },
  row: {
    minHeight: 56,
    padding: 16,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  status: { padding: 8, textAlign: 'center' },
});
