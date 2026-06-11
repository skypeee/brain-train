export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/games/index',
    'pages/stats/index',
    'pages/settings/index',
    'pages/games/sudoku/index',
    'pages/games/sudoku/play',
    'pages/games/reaction/index',
    'pages/games/cps/index',
    'pages/games/tensecond/index',
    'pages/games/sbti/index',
    'pages/games/schulte/index',
    'pages/games/stroop/index',
    'pages/games/memory/index',
    'pages/games/pomodoro/index',
    'pages/games/breathing/index',
    'pages/games/frog/index',
    'pages/games/nback/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A1A2E',
    navigationBarTitleText: '脑力训练',
    navigationBarTextStyle: 'white',
  },
  permission: {
    'scope.userLocation': { desc: '用于提供基于位置的服务体验' },
  },
  requiredPrivateInfos: [],
  lazyCodeLoading: 'requiredComponents',
  sitemapLocation: 'sitemap.json',
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#229CF8',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/games/index',
        text: '游戏',
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
      },
    ],
  },
});
