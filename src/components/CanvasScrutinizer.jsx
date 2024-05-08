import { useEffect, useMemo, useRef, useState } from 'react';
import imageSrcCol from '../assets/image-colour.jpg';
import imageSrcAbs from '../assets/image-absolute.png';
import './CanvasScrutinizer.css';

const CanvasScrutinizer = () => {
  const canvasOrig = useRef(null);
  const canvasMag = useRef(null);
  const canvasAbs = useRef(null);
  const ctx = useRef(null);  // Contains source image
  const ctx2 = useRef(null);  // Displays the magnified image and loupe casing
  const ctx3 = useRef(null);
  const magnification = useRef(5);

  const [displayRawImage] = useState(false);
  const [image, setImage] = useState(null);
  const [imageAbs, setImageAbs] = useState(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);
  const [position, setPosition] = useState(null);
  const [annotationPosition, setAnnotationPosition] = useState({x: 0, y: 0});
  const [container, setContainer] = useState({width: 0, height: 0});
  const [radius, setRadius] = useState(30);
  const [selecting, setSelecting] = useState(true);
  const [temps, setTemps] = useState({ px: 0, min: 0, max: 0, avg: 0 });

  useEffect(() => {
    const updateDevicePixelRatio = () => setDevicePixelRatio(window.devicePixelRatio);

    const mediaMatcher = window.matchMedia(
      `screen and (resolution: ${devicePixelRatio}dppx)
    `);

    mediaMatcher.addEventListener("change", updateDevicePixelRatio);

    return () => {
      mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
    };
  }, []);

  useEffect(() => {
    if (container.width > 0 && container.height > 0) {
      resizeCanvasses();
      drawMagnified();
    }
  }, [devicePixelRatio]);

  useEffect(() => {
    ctx.current = canvasOrig.current.getContext('2d');
    ctx2.current = canvasMag.current.getContext('2d');
    ctx3.current = canvasAbs.current.getContext('2d', { willReadFrequently: true });
    
    const image = new Image();
    image.src = imageSrcCol;
    image.addEventListener('load', () => {
      let w = image.naturalWidth;
      let h = image.naturalHeight;
      setContainer({width: w, height: h});
      setImage(image);
    }, { once: true });

    const imageAbs = new Image();
    imageAbs.src = imageSrcAbs;
    image.addEventListener('load', () => {
      setImageAbs(imageAbs);
    }, { once: true });
  }, []);

  useEffect(() => {
    if (image) {      
      canvasOrig.current.style.width = `${container.width}px`;
      canvasOrig.current.style.height = `${container.height}px`;
      canvasMag.current.style.width = `${container.width}px`;
      canvasMag.current.style.height = `${container.height}px`;
      canvasAbs.current.style.width = `${container.width}px`;
      canvasAbs.current.style.height = `${container.height}px`;

      resizeCanvasses(true);
      ctx.current.drawImage(image, 0, 0, container.width * devicePixelRatio, container.height * devicePixelRatio);
      // positionCrossHairs();
    }
  }, [image]);
  
  useEffect(() => {
    if (imageAbs) {
      ctx3.current.drawImage(imageAbs, 0, 0, container.width * devicePixelRatio, container.height * devicePixelRatio);
      
      if (!position) {
        positionCrossHairs();
      }
    }
  }, [imageAbs]);

  const calculateCircularRedValueStats = () => {
    const origRadius = radius / 5 * devicePixelRatio;
    const diameter = origRadius * 2;

    const imageData = ctx3.current.getImageData(position.x * devicePixelRatio - origRadius, position.y * devicePixelRatio - origRadius, diameter, diameter).data;
    const centerPixelIndex = origRadius * diameter * 4 + origRadius * 4;

    let min = imageData[0];
    let max = imageData[0];
    let sum = imageData[0];
    let count = 0;

    for (let y = 0; y < diameter; y++) {
      for (let x = 0; x < diameter; x++) {
        const dx = x - origRadius;
        const dy = y - origRadius;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= origRadius) {
          count++;
          const index = (y * diameter + x) * 4;
          const value = imageData[index];

          if (value < min) min = value;
          if (value > max) max = value;
          sum += value;
        }
      }
    }

    return {
      px: Math.floor((imageData[centerPixelIndex] * 0.64) - 35),
      min: Math.floor((min * 0.64) - 35),
      max: Math.floor((max * 0.64) - 35),
      avg: Math.floor(((sum / count) * 0.64) - 35),
    };
  };

  useEffect(() => {
    drawMagnified();

    if (imageAbs) {
      setTemps(calculateCircularRedValueStats());
    }
  }, [position]);

  const resizeCanvasses = (initial = false) => {
    ctx.current.canvas.width = container.width * devicePixelRatio;
    ctx.current.canvas.height = container.height * devicePixelRatio;
    ctx2.current.canvas.width = container.width * devicePixelRatio;
    ctx2.current.canvas.height = container.height * devicePixelRatio;
    ctx3.current.canvas.width = container.width * devicePixelRatio;
    ctx3.current.canvas.height = container.height * devicePixelRatio;

    if (!initial) {
      ctx.current.drawImage(image, 0, 0, container.width * devicePixelRatio, container.height * devicePixelRatio);
      ctx3.current.drawImage(imageAbs, 0, 0, container.width * devicePixelRatio, container.height * devicePixelRatio);
    }
  };

  const positionCrossHairs = () => {
    let x = ctx.current.canvas.width / (2 * devicePixelRatio);
    let y = ctx.current.canvas.height / (2 * devicePixelRatio);
    setPosition({x, y});
    setAnnotationPosition({x: x - 42, y: y + 48});
  };

  const updateCrossHairs = (newPosition) => {    
    setPosition(newPosition);
    
    let annotationX = newPosition.x - 42;
    let annotationY = newPosition.y + 48;
    
    if (newPosition.x < 48) annotationX = 6;
    if (newPosition.x > container.width - 48) annotationX = container.width - 90;
    if (newPosition.y > container.height - 138) annotationY = annotationY - 180;
    
    setAnnotationPosition({x: annotationX, y: annotationY});
  };
  
  const drawMagnified = () => {
    if (position) {
      // Wipe canvas clean
      ctx2.current.clearRect(0, 0, ctx2.current.canvas.width, ctx2.current.canvas.height);

      // Create clipping mask
      ctx2.current.save();
      ctx2.current.beginPath();
      ctx2.current.arc(position.x * devicePixelRatio, position.y * devicePixelRatio, radius * devicePixelRatio, 0, 2 * Math.PI);
      ctx2.current.strokeStyle = '#fff8';
      ctx2.current.lineWidth = 16 * devicePixelRatio;
      ctx2.current.stroke();
      ctx2.current.clip();

      // Draw magnified fragment
      let size = radius * 2;
      let r = size / magnification.current;

      ctx2.current.drawImage(
        displayRawImage ? ctx3.current.canvas : ctx.current.canvas,
        (position.x - r / 2) * devicePixelRatio,
        (position.y - r / 2) * devicePixelRatio,
        r * devicePixelRatio,
        r * devicePixelRatio,
        (position.x - radius) * devicePixelRatio,
        (position.y - radius) * devicePixelRatio,
        2 * radius * devicePixelRatio,
        2 * radius * devicePixelRatio
      );

      // Undo clipping
      ctx2.current.restore();
    }
  };

  const handleMouseMove = ({nativeEvent: event}) => {
    const limit = radius / magnification.current;
    if (event.layerX >= limit && event.layerX <= container.width - limit && event.layerY >= limit && event.layerY <= container.height - limit) {
      updateCrossHairs({x: event.layerX, y: event.layerY});
    }
  };

  const handleClick = ({nativeEvent: event}) => {
    if (!selecting) {
      updateCrossHairs({x: event.layerX, y: event.layerY});
    }

    setSelecting(!selecting);
  };

  return (
    <div className="container">
      <canvas ref={canvasOrig} className="canvas_original"></canvas>
      <canvas ref={canvasAbs} className="canvas_absolute" style={{opacity: displayRawImage ? 1 : 0}}></canvas>
      <canvas
        ref={canvasMag}
        className={"canvas_magnification" + (selecting ? ' selecting' : '')}
        onMouseMove={selecting ? handleMouseMove : null}
        onClick={handleClick}
      ></canvas>
      {imageAbs && <div
        className="annotation"
        style={{transform: `translateX(${annotationPosition.x}px) translateY(${annotationPosition.y}px)`}}
      >
        <div>
          <span>Temp</span>
          <span><strong>{temps.px}</strong>ºC</span>
        </div>
        <div>
          <span>Min</span>
          <span><strong>{temps.min}</strong>ºC</span>
        </div>
        <div>
          <span>Max</span>
          <span><strong>{temps.max}</strong>ºC</span>
        </div>
        <div>
          <span>Avg</span>
          <span><strong>{temps.avg}</strong>ºC</span>
        </div>
      </div>}
    </div>
  );
};

export default CanvasScrutinizer;
