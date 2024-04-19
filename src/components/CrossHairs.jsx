import { motion, useMotionValue } from 'framer-motion';
import './CrossHairs.css';
import { useRef } from 'react';

const CrossHairs = ({ position, radius, container, update}) => {
  const circleRef = useRef(null);
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  const handleDrag = (event, info) => {
    console.log(`delta: ${info.delta.x}, ${info.delta.y}`);
    console.log(`point: ${info.point.x}, ${info.point.y}`);
    console.log(`newX: ${info.point.x}, ${info.point.y}`);

    const xDelta = (position.x + info.delta.x >= 0 && position.x + info.delta.x <= container.width) ? info.delta.x : 0;
    const yDelta = (position.y + info.delta.y >= 0 && position.y + info.delta.y <= container.height) ? info.delta.y : 0;
    // const yPos = position.y + info.delta.y;

    // if (info.point.x >= 0 && info.point.x <= container.width && info.point.y >= 0 && info.point.y <= container.height) {
      update({x: xDelta, y: yDelta});
      // update(info.delta);
    // }
  };

  return (
    <svg className="crosshairs" viewBox={`0 0 ${container.width} ${container.height}`}>
      <motion.circle
        ref={circleRef}
        cx="0"
        cy="0"
        fill="none"
        strokeWidth="18"
        r={radius * 1.3}
        drag
        dragMomentum={false}
        dragElastic={false}
        onDrag={handleDrag}
        dragConstraints={{top: 0, left: 0, right: container.width, bottom: container.height}}
        style={{x, y}}
      />
    </svg>
  );
};

export default CrossHairs;
