import type { ReactNode } from 'react';
import CountUpDefault from 'react-countup';

export interface AnimatedNumberProps {
  decimals?: number;
  duration?: number;
  end: number;
  prefix?: string;
  suffix?: string;
}

const CountUp = CountUpDefault as unknown as (props: AnimatedNumberProps) => ReactNode;

export function AnimatedNumber({ decimals = 0, duration = 0.8, end, prefix, suffix }: AnimatedNumberProps): ReactNode {
  return <CountUp decimals={decimals} duration={duration} end={end} prefix={prefix} suffix={suffix} />;
}

export interface CoinDropProps {
  label: string;
  reward: number;
}

export function CoinDrop({ label, reward }: CoinDropProps): ReactNode {
  return (
    <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-warning-300 bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-800 transition-transform duration-500 hover:-translate-y-0.5">
      <span aria-hidden="true" className="h-3 w-3 rounded-full bg-warning-500 shadow-card" />
      <span>{label}</span>
      <AnimatedNumber end={reward} prefix="+" suffix=" credits" />
    </div>
  );
}

export interface PrizeWheelProps {
  label: string;
  prize: string;
}

export function PrizeWheel({ label, prize }: PrizeWheelProps): ReactNode {
  return (
    <div className="grid aspect-square w-28 place-items-center rounded-full border-4 border-primary-200 bg-white text-center text-xs font-semibold text-neutral-900 shadow-card transition-transform duration-700 hover:rotate-45">
      <span>
        {label}
        <br />
        {prize}
      </span>
    </div>
  );
}

export interface LevelUpBadgeProps {
  level: number;
  title: string;
}

export function LevelUpBadge({ level, title }: LevelUpBadgeProps): ReactNode {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-success-300 bg-success-50 px-3 py-2 text-sm font-semibold text-success-800">
      <span>LV{level}</span>
      <span>{title}</span>
    </div>
  );
}

export function SuccessConfetti({ label = '升级成功' }: { label?: string }): ReactNode {
  return (
    <div className="relative inline-flex min-h-11 items-center rounded-md border border-accent-500 bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700">
      <span className="absolute -top-1 left-4 h-2 w-2 animate-bounce rounded-full bg-accent-500" />
      <span className="absolute -top-2 right-6 h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:120ms]" />
      {label}
    </div>
  );
}
