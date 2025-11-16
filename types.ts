
export interface ValidationStatus {
  isValid: boolean;
  message: string;
  isWarning?: boolean;
  details?: string;
}

// Fix: Define and export the Settings interface used across multiple components.
export interface Settings {
  primaryColor: string;
  fontFamily: string;
  footerText: string;
  driveFolderUrl: string;
  showTitleUnderline: boolean;
  showBottomBar: boolean;
  showDateColumn: boolean;
  enableGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  headerLogoUrl: string;
  closingLogoUrl: string;
  titleBgUrl: string;
  sectionBgUrl: string;
  mainBgUrl: string;
  closingBgUrl: string;
}

// 공통 슬라이드 속성
interface BaseSlide {
  id?: string;
  notes?: string;
  source?: string;
}

// 슬라이드 타입별 인터페이스 정의
export interface TitleSlide extends BaseSlide {
  type: 'title';
  title: string;
  date?: string;
}

export interface SectionSlide extends BaseSlide {
  type: 'section';
  title: string;
  sectionNo?: number;
}

export interface ClosingSlide extends BaseSlide {
  type: 'closing';
}

export interface ContentSlide extends BaseSlide {
  type: 'content';
  title: string;
  subhead?: string;
  points?: string[];
  twoColumn?: boolean;
  columns?: [string[], string[]];
}

export interface AgendaSlide extends BaseSlide {
  type: 'agenda';
  title: string;
  subhead?: string;
  items: string[];
}

export interface CompareSlide extends BaseSlide {
  type: 'compare';
  title: string;
  subhead?: string;
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
}

export interface ProcessSlide extends BaseSlide {
  type: 'process';
  title: string;
  subhead?: string;
  steps: string[];
}

export interface ProcessListSlide extends BaseSlide {
  type: 'processList';
  title: string;
  subhead?: string;
  steps: string[];
}

export interface TimelineMilestone {
  label: string;
  date: string;
  state?: 'done' | 'next' | 'todo';
}

export interface TimelineSlide extends BaseSlide {
  type: 'timeline';
  title: string;
  subhead?: string;
  milestones: TimelineMilestone[];
}

export interface DiagramLane {
  title: string;
  items: string[];
}

export interface DiagramSlide extends BaseSlide {
  type: 'diagram';
  title: string;
  subhead?: string;
  lanes: DiagramLane[];
}

export interface CycleItem {
  label: string;
  subLabel?: string;
}

export interface CycleSlide extends BaseSlide {
  type: 'cycle';
  title: string;
  subhead?: string;
  items: CycleItem[];
  centerText?: string;
}

export interface CardItem {
  title?: string;
  desc?: string;
}

export interface CardsSlide extends BaseSlide {
  type: 'cards';
  title: string;
  subhead?: string;
  columns?: 2 | 3;
  items: (string | CardItem)[];
}

export interface HeaderCardsSlide extends BaseSlide {
  type: 'headerCards';
  title: string;
  subhead?: string;
  columns?: 2 | 3;
  items: CardItem[];
}

export interface TableSlide extends BaseSlide {
  type: 'table';
  title: string;
  subhead?: string;
  headers: string[];
  rows: string[][];
}

export interface ProgressItem {
  label: string;
  percent: number;
}

export interface ProgressSlide extends BaseSlide {
  type: 'progress';
  title: string;
  subhead?: string;
  items: ProgressItem[];
}

export interface QuoteSlide extends BaseSlide {
  type: 'quote';
  title: string;
  subhead?: string;
  text: string;
  author: string;
}

export interface KpiItem {
  label: string;
  value: string;
  change: string;
  status: 'good' | 'bad' | 'neutral';
}

export interface KpiSlide extends BaseSlide {
  type: 'kpi';
  title: string;
  subhead?: string;
  columns?: 2 | 3 | 4;
  items: KpiItem[];
}

export interface BulletCardItem {
  title: string;
  desc: string;
}

export interface BulletCardsSlide extends BaseSlide {
  type: 'bulletCards';
  title: string;
  subhead?: string;
  items: BulletCardItem[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSlide extends BaseSlide {
  type: 'faq';
  title: string;
  subhead?: string;
  items: FaqItem[];
}

export interface StatCompareItem {
  label: string;
  leftValue: string;
  rightValue: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface StatsCompareSlide extends BaseSlide {
  type: 'statsCompare';
  title: string;
  subhead?: string;
  leftTitle: string;
  rightTitle: string;
  stats: StatCompareItem[];
}

export interface BarCompareSlide extends BaseSlide {
  type: 'barCompare';
  title: string;
  subhead?: string;
  leftTitle: string;
  rightTitle: string;
  stats: StatCompareItem[];
  showTrends?: boolean;
}

export interface TriangleItem {
  title: string;
  desc?: string;
}

export interface TriangleSlide extends BaseSlide {
  type: 'triangle';
  title: string;
  subhead?: string;
  items: TriangleItem[];
}

export interface PyramidLevel {
  title: string;
  description: string;
}

export interface PyramidSlide extends BaseSlide {
  type: 'pyramid';
  title: string;
  subhead?: string;
  levels: PyramidLevel[];
}

export interface FlowChartFlow {
  steps: string[];
}

export interface FlowChartSlide extends BaseSlide {
  type: 'flowChart';
  title: string;
  subhead?: string;
  flows: FlowChartFlow[];
}

export interface StepUpItem {
  title: string;
  desc: string;
}

export interface StepUpSlide extends BaseSlide {
  type: 'stepUp';
  title: string;
  subhead?: string;
  items: StepUpItem[];
}

export interface ImageTextSlide extends BaseSlide {
  type: 'imageText';
  title: string;
  subhead?: string;
  image: string;
  imageCaption?: string;
  imagePosition?: 'left' | 'right';
  points: string[];
}

// 모든 슬라이드 타입의 유니온 타입
export type Slide =
  | TitleSlide
  | SectionSlide
  | ClosingSlide
  | ContentSlide
  | AgendaSlide
  | CompareSlide
  | ProcessSlide
  | ProcessListSlide
  | TimelineSlide
  | DiagramSlide
  | CycleSlide
  | CardsSlide
  | HeaderCardsSlide
  | TableSlide
  | ProgressSlide
  | QuoteSlide
  | KpiSlide
  | BulletCardsSlide
  | FaqSlide
  | StatsCompareSlide
  | BarCompareSlide
  | TriangleSlide
  | PyramidSlide
  | FlowChartSlide
  | StepUpSlide
  | ImageTextSlide;

// Fix: Add gdocs to the global Window interface to resolve type errors in SettingsSection.tsx.
declare global {
  interface Window {
    gdocs?: {
      createPresentation: (options: {
        slideData: Slide[];
        settings: Settings;
      }) => Promise<{ presentationUrl: string }>;
    };
  }
}
