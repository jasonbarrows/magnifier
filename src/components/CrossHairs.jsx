import { motion } from 'framer-motion';
import './CrossHairs.css';

const CrossHairs = ({ position, radius, container, update}) => {
  const handlePan = (event, info) => {
    const deltaX = (position.x + info.delta.x >= 6 && position.x + info.delta.x <= container.width - 6) ? info.delta.x : 0;
    const deltaY = (position.y + info.delta.y >= 6 && position.y + info.delta.y <= container.height - 6) ? info.delta.y : 0;

    if (deltaX || deltaY) {
      update({x: position.x + deltaX, y:position.y + deltaY});
    }
  };

  return (
    <svg
      className="crosshairs"
      viewBox={`0 0 ${container.width} ${container.height}`}
      >
      <motion.circle
        cx="0"
        cy="0"
        fill="none"
        strokeWidth="20"
        r={radius * 1.25}
        onPan={handlePan}
        style={{transform: `translateX(${position.x}px) translateY(${position.y}px)`}}
      />
    </svg>
  );
};

export default CrossHairs;
