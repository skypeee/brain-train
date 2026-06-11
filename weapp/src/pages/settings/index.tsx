import { View, Text, ScrollView, Switch } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { clearAllRecords } from '../../utils/storage';
import { Button } from '../../components/ui';
import { useSettingsStore } from '../../stores/settingsStore';

definePageConfig({
  navigationBarTitleText: '设置',
});

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: 24, fontWeight: 600, color: '#94A3B8',
      marginBottom: 16, marginTop: 32, paddingLeft: 4,
    }}>
      {title}
    </Text>
  );
}

function SettingRow({
  label, desc, right,
}: {
  label: string; desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={{
      backgroundColor: '#FFFFFF', borderRadius: 14,
      padding: '24px 28px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 12,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: 500, color: '#1A1A2E' }}>{label}</Text>
        {desc && <Text style={{ fontSize: 22, color: '#94A3B8', marginTop: 4 }}>{desc}</Text>}
      </View>
      {right}
    </View>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    soundEnabled, hapticsEnabled, language, isLoaded,
    setSoundEnabled, setHapticsEnabled, setLanguage, loadSettings,
  } = useSettingsStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings();
    // Wait a tick for Zustand to propagate
    setTimeout(() => setReady(true), 100);
  }, []);

  const handleClearData = () => {
    Taro.showModal({
      title: '清除数据',
      content: '确定要清除所有本地游戏记录吗？此操作不可恢复。',
      confirmText: '确定清除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          clearAllRecords();
          Taro.showToast({ title: '数据已清除', icon: 'success' });
        }
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }} scrollY enableFlex>
      <View style={{ padding: '40px 32px 120px' }}>
        <Text style={{ fontSize: '44px', fontWeight: '700', color: '#1A1A2E', marginBottom: 8 }}>
          {t('settings.title', '设置')}
        </Text>

        <SectionTitle title='偏好设置' />
        <SettingRow
          label='音效'
          desc='游戏中的声音反馈'
          right={
            <Switch
              checked={soundEnabled}
              color='#229CF8'
              onChange={(e) => setSoundEnabled(e.detail.value)}
            />
          }
        />
        <SettingRow
          label='触觉反馈'
          desc='按钮点击时的轻微震动'
          right={
            <Switch
              checked={hapticsEnabled}
              color='#229CF8'
              onChange={(e) => setHapticsEnabled(e.detail.value)}
            />
          }
        />

        <SectionTitle title='语言' />
        <View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
          <Button
            title='中文'
            variant={language === 'zh' ? 'primary' : 'secondary'}
            size='md'
            onPress={() => setLanguage('zh')}
          />
          <Button
            title='English'
            variant={language === 'en' ? 'primary' : 'secondary'}
            size='md'
            onPress={() => setLanguage('en')}
          />
        </View>

        <SectionTitle title='数据管理' />
        <Button
          title='清除本地数据'
          variant='secondary'
          size='md'
          onPress={handleClearData}
        />

        <SectionTitle title='关于' />
        <SettingRow
          label='版本'
          desc='1.0.0'
        />
        <SettingRow
          label='BrainTrain'
          desc='脑力训练 · 让大脑保持敏锐'
        />
      </View>
    </ScrollView>
  );
}
