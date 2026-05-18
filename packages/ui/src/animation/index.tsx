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
