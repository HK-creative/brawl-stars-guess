'use client';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  MotionValue,
} from 'framer-motion';

const TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 18,
  mass: 0.3,
};

// Custom useMeasure hook to replace react-use-measure
function useMeasure() {
  const ref = useRef<HTMLElement>(null);
  const [bounds, setBounds] = useState({ height: 0, width: 0 });

  useLayoutEffect(() => {
    if (ref.current) {
      const measure = () => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          setBounds({ height: rect.height, width: rect.width });
        }
      };
      
      measure();
      
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, [ref]);

  return [ref, bounds] as const;
}

function Digit({ value, place, transition = TRANSITION }: { value: number; place: number; transition?: any }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = useMotionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, transition || TRANSITION);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div className='relative inline-block w-[1ch] h-[1em] overflow-x-visible overflow-y-clip leading-none tabular-nums'>
      <div className='invisible'>0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} transition={transition} />
      ))}
    </div>
  );
}

function Number({ mv, number, transition = TRANSITION }: { mv: MotionValue<number>; number: number; transition?: any }) {
  const uniqueId = useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * bounds.height;

    if (offset > 5) {
      memo -= 10 * bounds.height;
    }

    return memo;
  });

  // don't render the animated number until we know the height
  if (!bounds.height) {
    return (
      <span ref={ref as any} className='invisible absolute'>
        {number}
      </span>
    );
  }

  return (
    <motion.span
      style={{ y }}
      layoutId={`${uniqueId}-${number}`}
      className='absolute inset-0 flex items-center justify-center'
      transition={transition || TRANSITION}
      ref={ref as any}
    >
      {number}
    </motion.span>
  );
}

export type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  // Optional custom transition to tune animation (e.g., slower decay)
  transition?: any;
};

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = '.',
  transition,
}: SlidingNumberProps) {
  // Handle non-numeric values gracefully
  if (isNaN(value)) {
    return <div className="flex items-center">-</div>;
  }
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toString().split('.');
  const integerValue = parseInt(integerPart, 10);
  const paddedInteger =
    padStart && integerValue < 10 ? `0${integerPart}` : integerPart;
  const integerDigits = paddedInteger.split('');
  const integerPlaces = integerDigits.map((_, i) =>
    Math.pow(10, integerDigits.length - i - 1)
  );

  return (
    <div className='flex items-center'>
      {value < 0 && '-'}
      {integerDigits.map((_, index) => (
        <Digit
          key={`pos-${integerPlaces[index]}`}
          value={integerValue}
          place={integerPlaces[index]}
          transition={transition}
        />
      ))}
      {decimalPart && (
        <>
          <span>{decimalSeparator}</span>
          {decimalPart.split('').map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={parseInt(decimalPart, 10)}
              place={Math.pow(10, decimalPart.length - index - 1)}
              transition={transition}
            />
          ))}
        </>
      )}
    </div>
  );
}