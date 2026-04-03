import type { Variants } from 'framer-motion';

export const easings = {
    smooth: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
    bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
    elastic: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
};

export const fadeUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easings.smooth } }
};
