import { useEffect, useRef, useState } from 'react';
import CrossHairs from './CrossHairs';
import hazel from '../assets/image.jpg';
import './CanvasScrutinizer.css';

const CanvasScrutinizer = () => {
  const canvasOrig = useRef(null);
  const canvasMag = useRef(null);
  const ctx = useRef(null); // Contains source image
  const ctx2 = useRef(null); // Displays the magnified image and glass edge/casing
  const magnification = useRef(5); //2.04,
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [radius, setRadius] = useState(32);

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

    ctx.current.canvas.width = w;
    ctx.current.canvas.height = h;

    ctx2.current.canvas.width = w;
    ctx2.current.canvas.height = h;
    ctx2.current.lineWidth = 28;

    setContainer({ width: w, height: h });

    ctx.current.drawImage(image, 0, 0);
  };

  const positionCrossHairs = () => {
    setPosition({ x: ctx.current.canvas.width / 2, y: ctx.current.canvas.height / 2 });
  };

  const updateCrossHairs = (delta) => {
    // const xPos = position.x + delta.x

    // let xPos = position.x + delta.x;
    // let yPos = position.y + delta.y;


    // if (xPos > container.width) xPos = container.width;
    // if (xPos < 0) xPos = 0;
    // xPos = xPos > container.width ? container.width : xPos
    // xPos = xPos > container.width ? container.width : xPos

    // if (xPos >= 0 && xPos <= container.width && yPos >= 0 && yPos <= container.height) {

    // if (xPos >= 0 && xPos <= container.width) {
      // setPosition({ x: xPos, y: yPos });
      setPosition((curr) => ({ x: curr.x + delta.x, y: curr.y + delta.y }));
    // }
  };

  const drawMagnified = () => {
    // Wipe canvas clean
    ctx2.current.clearRect(0, 0, ctx2.current.canvas.width, ctx2.current.canvas.height);

    // Create clipping mask
    ctx2.current.save();
    ctx2.current.beginPath();
    ctx2.current.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx2.current.strokeStyle = '#fff8';
    ctx2.current.stroke();
    ctx2.current.clip();

    // Draw magnified fragment
    let size = radius * 2;
    let r = size / magnification.current;

    ctx2.current.drawImage(
      ctx.current.canvas,
      position.x - r / 2,
      position.y - r / 2,
      r,
      r,
      position.x - radius,
      position.y - radius,  
      2 * radius,
      2 * radius
    );

    // Undo clipping
    ctx2.current.restore();
  };

  return (
    <div className="container">
      <canvas className="canvas_original" ref={canvasOrig}></canvas>
      <canvas className="canvas_magnification" ref={canvasMag}></canvas>
      {position.x !== 0 && position.y !== 0 && <CrossHairs
        position={position}
        radius={radius}
        container={container}
        update={updateCrossHairs}
      />}
    </div>
  );
};

export default CanvasScrutinizer;
