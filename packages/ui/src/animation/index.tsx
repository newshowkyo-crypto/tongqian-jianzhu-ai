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

export function AnimationFeedbackLink({ label = '我反感这种推送' }: { label?: ReactNode }): ReactNode {
  return (
    <button className="mt-2 min-h-11 text-xs font-medium text-neutral-500 underline-offset-4 hover:text-neutral-700 hover:underline" type="button">
      {label}
    </button>
  );
}

export interface CoinDropProps {
  label: string;
  reward: number;
}

export function CoinDrop({ label, reward }: CoinDropProps): ReactNode {
  return (
    <div className="inline-flex flex-col">
      <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-warning-300 bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-800 transition-transform duration-500 hover:-translate-y-0.5">
        <span aria-hidden="true" className="h-3 w-3 rounded-full bg-warning-500 shadow-card [animation:tq-coin-drop_600ms_cubic-bezier(0.2,0.8,0.2,1)_both]" />
        <span>{label}</span>
        <AnimatedNumber end={reward} prefix="+" suffix=" credits" />
      </div>
      <AnimationFeedbackLink />
    </div>
  );
}

export interface PrizeWheelProps {
  label: string;
  prize: string;
}

export function PrizeWheel({ label, prize }: PrizeWheelProps): ReactNode {
  return (
    <div className="inline-flex flex-col items-center">
      <div className="grid aspect-square w-28 place-items-center rounded-full border-4 border-primary-200 bg-white text-center text-xs font-semibold text-neutral-900 shadow-card [animation:tq-wheel-decelerate_800ms_cubic-bezier(0.12,0.74,0.24,1)_both]">
        <span>
          {label}
          <br />
          {prize}
        </span>
      </div>
      <AnimationFeedbackLink />
    </div>
  );
}

export interface LevelUpBadgeProps {
  level: number;
  title: string;
}

export function LevelUpBadge({ level, title }: LevelUpBadgeProps): ReactNode {
  return (
    <div className="inline-flex flex-col">
      <div className="inline-flex items-center gap-2 rounded-md border border-success-300 bg-success-50 px-3 py-2 text-sm font-semibold text-success-800 transition-all duration-500">
        <span>LV{level}</span>
        <span>{title}</span>
      </div>
      {level >= 3 ? <SuccessConfetti label="等级提升" /> : null}
      <AnimationFeedbackLink />
    </div>
  );
}

export function SuccessConfetti({ label = '升级成功' }: { label?: string }): ReactNode {
  return (
    <div className="relative inline-flex min-h-11 items-center rounded-md border border-accent-500 bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700">
      <span className="absolute -top-1 left-4 h-2 w-2 rounded-full bg-accent-500 [animation:tq-confetti-pop_900ms_ease-out_infinite]" />
      <span className="absolute -top-2 right-6 h-2 w-2 rounded-full bg-primary-500 [animation:tq-confetti-pop_900ms_ease-out_infinite] [animation-delay:120ms]" />
      <span className="absolute -top-1 right-14 h-1.5 w-1.5 rounded-full bg-success-500 [animation:tq-confetti-pop_900ms_ease-out_infinite] [animation-delay:220ms]" />
      {label}
    </div>
  );
}

export function BuildingUnlockAnimation({ label = '建造馆解锁' }: { label?: ReactNode }): ReactNode {
  return (
    <div className="inline-flex flex-col">
      <div className="flex h-24 items-end gap-2 rounded-md border border-primary-100 bg-primary-50 p-4">
        {[36, 48, 60, 72, 84].map((height, index) => (
          <span
            key={height}
            className="w-7 rounded-t bg-primary-600 [animation:tq-building-unlock_600ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
            style={{ animationDelay: `${index * 90}ms`, height }}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-primary-700">{label}</span>
      </div>
      <AnimationFeedbackLink />
    </div>
  );
}
