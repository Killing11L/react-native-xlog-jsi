import React, {useEffect, useState} from 'react';
import {BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Xlog from '@react-native-ohos/react-native-xlog-jsi';

const LOG_DIR = '/data/storage/el2/base/haps/entry/cache';
const PREFIX = 'XLogJsi';

export default function App() {
  const [page, setPage] = useState<'home' | 'upstream' | 'rnt'>('home');
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 'home') return false;
      setPage('home');
      return true;
    });
    return () => sub.remove();
  }, [page]);
  const append = (text: string) => setLines(old => [text, ...old].slice(0, 30));
  const run = async (label: string, action: () => unknown) => {
    try {
      await action();
      append(`${label}: 完成`);
    } catch (error) {
      append(`${label}: ${String(error)}`);
    }
  };
  const button = (label: string, action: () => unknown) => (
    <TouchableOpacity key={label} style={styles.button} onPress={() => { void run(label, action); }}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
  const init = () => new Xlog(LOG_DIR, PREFIX, 3, true);

  if (page === 'home') {
    return <View style={styles.home}>
      <Text style={styles.title}>react-native-xlog-jsi</Text>
      {button('upstream', () => setPage('upstream'))}
      {button('rnt', () => setPage('rnt'))}
    </View>;
  }

  if (page === 'upstream') {
    return <View style={styles.screen}>
      <TouchableOpacity onPress={() => setPage('home')} style={styles.back}><Text>返回首页</Text></TouchableOpacity>
      <View style={styles.upstreamEmpty}><Text>无上游 demo</Text></View>
    </View>;
  }
  return <View style={styles.screen}>
    <TouchableOpacity onPress={() => setPage('home')} style={styles.back}><Text>返回首页</Text></TouchableOpacity>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Xlog JSI 手动测试</Text>
      <Text>日志目录：{LOG_DIR}；文件前缀：{PREFIX}</Text>
      {button('初始化 Xlog', init)}
      {button('console.log', () => console.log('XLOG_JSI_LOG_MARKER'))}
      {button('console.warn', () => console.warn('XLOG_JSI_WARN_MARKER'))}
      {button('console.error', () => console.error('XLOG_JSI_ERROR_MARKER'))}
      {button('同步刷新', () => Xlog.appenderFlush(true))}
      {button('异步刷新', () => Xlog.appenderFlush(false))}
      <Text style={styles.note}>初始化后写日志，再刷新并查看日志文件。</Text>
      <Text style={styles.title}>调用记录</Text>
      {lines.map((line, index) => <Text key={`${index}-${line}`}>{line}</Text>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  home: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  screen: {flex: 1, backgroundColor: '#F5FCFF'},
  content: {padding: 16},
  back: {padding: 16, paddingTop: 36},
  title: {fontSize: 20, fontWeight: '600', marginVertical: 12},
  button: {backgroundColor: '#007AFF', padding: 12, borderRadius: 6, marginVertical: 5, minWidth: 180},
  buttonText: {color: '#fff', textAlign: 'center'},
  note: {marginVertical: 12},
  upstreamEmpty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
