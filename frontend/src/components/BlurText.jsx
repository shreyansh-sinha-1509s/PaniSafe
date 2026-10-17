import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * BlurText Component
 * Word-by-word staggered blur-in animation using Framer Motion.
 */
export default function BlurText({ text = '', className = '', style = {} }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.1, once: true });
  const words = text ? text.split(' ') : [];

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: '0.05em',
        lineHeight: 0.82,
        ...style
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={isInView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : { filter: 'blur(10px)', opacity: 0, y: 50 }}
          transition={{
            duration: 0.7,
            delay: index * 0.1,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          style={{
            display: 'inline-block',
            marginRight: '0.24em',
            lineHeight: 'inherit'
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
