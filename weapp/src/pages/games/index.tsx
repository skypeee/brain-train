import { View, Text, ScrollView } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import Taro from '@tarojs/taro';
import { GameCard } from '../../components/ui/GameCard';

definePageConfig({
  navigationBarTitleText: '脑力游戏',
});

const GAMES = [
  { id: 'sudoku',    name: '数独',         desc: '逻辑推理与模式识别',                icon: 'sudoku',    color: '#229CF8' },
  { id: 'cps',       name: 'CPS点击测试',   desc: '测试手指点击速度极限',             icon: 'cps',       color: '#F59E0B' },
  { id: 'reaction',  name: '反应速度',       desc: '测量视觉反应时间',                 icon: 'reaction',  color: '#EF4444' },
  { id: 'tensecond', name: '十秒挑战',       desc: '凭直觉估算10秒时长',               icon: 'tensecond', color: '#8B5CF6' },
  { id: 'sbti',      name: 'SBTI人格测试',   desc: '探索你的认知风格',                 icon: 'sbti',      color: '#EC4899' },
  { id: 'schulte',   name: '舒尔特方格',     desc: '训练注意力广度与视觉搜索',         icon: 'schulte',   color: '#10B981' },
  { id: 'stroop',    name: '斯特鲁普测试',   desc: '挑战认知灵活性与抑制控制',         icon: 'stroop',    color: '#F97316' },
  { id: 'memory',    name: '记忆翻牌',       desc: '锻炼短时记忆与空间记忆',           icon: 'memory',    color: '#6366F1' },
  { id: 'pomodoro',  name: '番茄钟',         desc: '专注计时，保持高效工作节奏',       icon: 'pomodoro',  color: '#DC2626' },
  { id: 'breathing', name: '呼吸练习',       desc: '引导式深呼吸放松减压',             icon: 'breathing', color: '#06B6D4' },
  { id: 'frog',      name: '青蛙跳跃',       desc: '趣味反应力小游戏',                 icon: 'frog',      color: '#84CC16' },
  { id: 'nback',     name: 'N-Back测试',     desc: '高级工作记忆训练',                 icon: 'nback',     color: '#0EA5E9' },
];

export default function GamesPage() {
  const { t } = useTranslation();

  const handleGamePress = (id: string) => {
    Taro.navigateTo({ url: `/pages/games/${id}/index` });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
      scrollY
      enableFlex
    >
      <View style={{ padding: '40px 32px 120px' }}>
        <Text style={{ fontSize: '44px', fontWeight: '700', color: '#1A1A2E', marginBottom: 32 }}>
          {t('games.title', '全部游戏')}
        </Text>
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            description={game.desc}
            iconName={game.icon}
            color={game.color}
            onPress={handleGamePress}
          />
        ))}
      </View>
    </ScrollView>
  );
}
