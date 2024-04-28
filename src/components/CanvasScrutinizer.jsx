import { useEffect, useRef, useState } from 'react';
import CrossHairs from './CrossHairs';
import hazel from '../assets/image.jpg';
import './CanvasScrutinizer.css';

const ratio = window.devicePixelRatio;

const CanvasScrutinizer = () => {
  const canvasOrig = useRef(null);
  const canvasMag = useRef(null);
  const ctx = useRef(null); // Contains source image
  const ctx2 = useRef(null); // Displays the magnified image and glass edge/casing
  const magnification = useRef(5); //2.04,
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [radius, setRadius] = useState(30);
  const [selecting, setSelecting] = useState(true);

  useEffect(() => {
    ctx.current = canvasOrig.current.getContext('2d');
    ctx2.current = canvasMag.current.getContext('2d');

    let image = new Image();

    const cb = () => {
        initCanvasses(image);
        positionCrossHairs();
    };

    image.addEventListener('load', cb);

    image.src = hazel;

    return () => {
      image.removeEventListener('load', cb);
    };
  }, []);

  useEffect(() => {
    drawMagnified();
  }, [position]);

  const initCanvasses = (image) => {
    let w = image.naturalWidth;
    let h = image.naturalHeight;

    canvasOrig.current.style.width = `${w}px`;
    canvasOrig.current.style.height = `${h}px`;
    canvasMag.current.style.width = `${w}px`;
    canvasMag.current.style.height = `${h}px`;

    ctx.current.canvas.width = w * ratio;
    ctx.current.canvas.height = h * ratio;

    ctx2.current.canvas.width = w * ratio;
    ctx2.current.canvas.height = h * ratio;
    ctx2.current.lineWidth = 30 * ratio;

    setContainer({width: w, height: h});
    ctx.current.drawImage(image, 0, 0, w * ratio, h * ratio);
  };

  const positionCrossHairs = () => {
    setPosition({x: ctx.current.canvas.width / (2 * ratio), y: ctx.current.canvas.height / (2 * ratio)});
  };
  
  const updateCrossHairs = (newPosition) => {
    setPosition(newPosition);
  };

  const drawMagnified = () => {
    // Wipe canvas clean
    ctx2.current.clearRect(0, 0, ctx2.current.canvas.width, ctx2.current.canvas.height);

    // Create clipping mask
    ctx2.current.save();
    ctx2.current.beginPath();
    ctx2.current.arc(position.x * ratio, position.y * ratio, radius * ratio, 0, 2 * Math.PI);
    ctx2.current.strokeStyle = '#fff8';
    ctx2.current.stroke();
    ctx2.current.clip();

    // Draw magnified fragment
    let size = radius * 2;
    let r = size / magnification.current;

    ctx2.current.drawImage(
      ctx.current.canvas,
      (position.x - r / 2) * ratio,
      (position.y - r / 2) * ratio,
      r * ratio,
      r * ratio,
      (position.x - radius) * ratio,
      (position.y - radius) * ratio,  
      2 * radius * ratio,
      2 * radius * ratio
    );

    // Undo clipping
    ctx2.current.restore();
  };

  return (
    <div className="container">
      <canvas className="canvas_original" ref={canvasOrig}></canvas>
      <canvas className="canvas_magnification" ref={canvasMag}></canvas>
      <CrossHairs
        position={position} 
        radius={radius}
        container={container}
        update={updateCrossHairs}
        selecting={selecting}
        setSelecting={setSelecting}
      />
    </div>
  );
};

export default CanvasScrutinizer;
