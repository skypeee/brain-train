declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function defineAppConfig(config: any): any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function definePageConfig(config: any): any;

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'h5' | 'alipay' | 'swan' | 'tt' | 'qq' | 'jd';
  }
}
