import { motion } from 'framer-motion';
import './CrossHairs.css';
import { useCallback, useEffect, useRef, useState } from 'react';

const CrossHairs = ({ position, radius, container, update, selecting, setSelecting}) => {
  const [startPosition, setStartPosition] = useState({...position});

  const handleSetStartPosition = () => setStartPosition({...position});

  const handlePan = (event, info) => {
    const offsetX = startPosition.x + info.offset.x;
    const offsetY = startPosition.y + info.offset.y;

    if (offsetX >= 6 && offsetX <= container.width - 6 && offsetY >= 6 && offsetY <= container.height - 6) {
      update({x: offsetX, y: offsetY});
    }
  };
  
  const handleMouseMove = ({nativeEvent: event}) => {
    if (event.layerX >= 6 && event.layerX <= container.width - 6 && event.layerY >= 6 && event.layerY <= container.height - 6) {
      update({x: event.layerX, y: event.layerY});
    }
  };

  const handleClick = ({nativeEvent: event}) => {
    if (!selecting) {
      update({x: event.layerX, y: event.layerY});
    }

    setSelecting(!selecting);
  };

  return (
    <svg
      onMouseMove={selecting ? handleMouseMove : null}
      onClick={handleClick}
      className={"crosshairs" + (selecting ? ' selecting' : '')}
      viewBox={`0 0 ${container.width} ${container.height}`}
    >
      <motion.circle
        cx="0"
        cy="0"
        fill="none"
        strokeWidth="20"
        r={radius * 1.25}
        onPanStart={handleSetStartPosition}
        onPanEnd={handleSetStartPosition}
        onPan={handlePan}
        style={{transform: `translateX(${position.x}px) translateY(${position.y}px)`}}
      />
    </svg>
  );
};

export default CrossHairs;
