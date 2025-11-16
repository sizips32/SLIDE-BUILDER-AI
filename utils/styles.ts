/**
 * 공통 스타일 상수
 * 애플리케이션 전반에서 사용되는 일관된 스타일을 정의합니다.
 */

// 색상 팔레트
export const colors = {
  primary: {
    main: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    focus: 'focus:ring-blue-500',
    text: 'text-blue-600',
  },
  secondary: {
    main: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    focus: 'focus:ring-indigo-500',
    text: 'text-indigo-600',
  },
  accent: {
    main: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    focus: 'focus:ring-amber-500',
    text: 'text-amber-500',
  },
  danger: {
    main: 'bg-red-600',
    hover: 'hover:bg-red-700',
    focus: 'focus:ring-red-500',
    text: 'text-red-600',
  },
  success: {
    main: 'bg-green-600',
    hover: 'hover:bg-green-700',
    focus: 'focus:ring-green-500',
    text: 'text-green-600',
  },
} as const;

// 버튼 스타일
export const buttonStyles = {
  // 기본 버튼 (Primary)
  primary: [
    'w-full',
    'px-4',
    'py-3',
    colors.primary.main,
    'text-white',
    'rounded-lg',
    'font-semibold',
    colors.primary.hover,
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    colors.primary.focus,
    'transition-transform',
    'transform',
    'hover:scale-105',
    'disabled:bg-gray-400',
    'disabled:cursor-not-allowed',
  ].join(' '),

  // 중간 크기 버튼 (Secondary)
  secondary: [
    'w-full',
    'px-3',
    'py-2',
    'text-sm',
    colors.secondary.main,
    'text-white',
    'rounded-md',
    'font-semibold',
    colors.secondary.hover,
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    colors.secondary.focus,
    'transition',
    'disabled:bg-gray-400',
  ].join(' '),

  // 작은 버튼
  small: [
    'px-2',
    'py-1',
    'text-xs',
    colors.primary.main,
    'text-white',
    'rounded-md',
    'font-semibold',
    colors.primary.hover,
    'transition',
    'disabled:bg-gray-400',
  ].join(' '),

  // 아이콘 버튼
  icon: [
    'p-1',
    'text-black',
    'disabled:text-gray-400',
    'transition',
  ].join(' '),

  // 위험 작업 버튼 (삭제 등)
  danger: [
    'p-1',
    colors.danger.text,
    'hover:text-red-700',
    'font-bold',
    'disabled:text-gray-400',
    'text-xl',
    'leading-none',
  ].join(' '),

  // 작은 액션 버튼 (복사 등)
  smallAction: [
    'px-3',
    'py-1',
    'text-xs',
    'font-semibold',
    colors.primary.text,
    'bg-blue-100',
    'rounded-md',
    'hover:bg-blue-200',
    'transition',
    'disabled:bg-gray-200',
    'disabled:text-gray-500',
  ].join(' '),

  // 큰 액션 버튼 (프레젠테이션 생성 등)
  largeAction: [
    'w-full',
    'text-lg',
    'font-bold',
    'text-white',
    'p-4',
    'rounded-lg',
    'bg-gradient-to-r',
    'from-amber-500',
    'to-orange-500',
    'hover:from-amber-600',
    'hover:to-orange-600',
    'disabled:from-gray-400',
    'disabled:to-gray-500',
    'disabled:cursor-not-allowed',
    'transition-transform',
    'transform',
    'hover:scale-105',
    'shadow-lg',
  ].join(' '),
} as const;

// 입력 필드 스타일
export const inputStyles = {
  base: [
    'w-full',
    'text-sm',
    'p-2',
    'border',
    'border-gray-300',
    'rounded-md',
    'bg-white',
    'text-black',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'disabled:bg-gray-100',
  ].join(' '),

  textarea: [
    'w-full',
    'text-sm',
    'p-2',
    'border',
    'border-gray-300',
    'rounded-md',
    'bg-white',
    'text-black',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'disabled:bg-gray-100',
    'resize-y',
  ].join(' '),

  large: [
    'w-full',
    'text-sm',
    'p-3',
    'border-2',
    'border-gray-300',
    'rounded-lg',
    'bg-gray-50',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-amber-500',
    'text-gray-900',
  ].join(' '),
} as const;

// 카드 스타일
export const cardStyles = {
  container: [
    'bg-white',
    'rounded-xl',
    'shadow-lg',
    'border',
    'border-gray-200',
    'overflow-hidden',
  ].join(' '),

  header: [
    'text-xl',
    'font-semibold',
    'text-white',
    'p-4',
    'bg-gradient-to-r',
    'from-amber-500',
    'to-orange-500',
  ].join(' '),

  content: [
    'p-6',
    'space-y-4',
  ].join(' '),
} as const;

// 상태별 메시지 스타일
export const messageStyles = {
  error: [
    'p-3',
    'text-sm',
    'text-red-800',
    'bg-red-100',
    'border',
    'border-red-200',
    'rounded-lg',
  ].join(' '),

  success: [
    'p-4',
    'text-center',
    'rounded-lg',
    'font-semibold',
    'text-sm',
    'bg-green-100',
    'text-green-800',
    'border',
    'border-green-300',
  ].join(' '),

  warning: [
    'p-4',
    'text-sm',
    'text-yellow-800',
    'bg-yellow-100',
    'border-2',
    'border-yellow-300',
    'rounded-lg',
  ].join(' '),

  info: [
    'p-4',
    'text-center',
    'rounded-lg',
    'font-semibold',
    'text-sm',
    'bg-blue-100',
    'text-blue-800',
    'border',
    'border-blue-300',
  ].join(' '),
} as const;

