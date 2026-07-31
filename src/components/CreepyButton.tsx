import React, { useRef, useState } from "react";

interface CreepyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

type Coords = {
  x: number;
  y: number;
};

export function CreepyButton({
  children,
  className = "",
  onClick,
  ...props
}: CreepyButtonProps) {
  const eyesRef = useRef<HTMLSpanElement>(null);
  const [eyeCoords, setEyeCoords] = useState<Coords>({ x: 0, y: 0 });

  const translateX = -50 + eyeCoords.x * 50;
  const translateY = -50 + eyeCoords.y * 50;
  
  const eyeStyle: React.CSSProperties = {
    transform: `translate(${translateX}%, ${translateY}%)`,
  };

  const updateEyes = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    const userEvent = "touches" in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
    
    if (!eyesRef.current) return;
    const eyesRect = eyesRef.current.getBoundingClientRect();
    const eyesCenter: Coords = {
      x: eyesRect.left + eyesRect.width / 2,
      y: eyesRect.top + eyesRect.height / 2,
    };
    
    const cursor: Coords = {
      x: userEvent.clientX,
      y: userEvent.clientY,
    };

    const dx = cursor.x - eyesCenter.x;
    const dy = cursor.y - eyesCenter.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    const visionRangeX = 150;
    const visionRangeY = 100;
    const distance = Math.min(Math.hypot(dx, dy), 200);
    
    const x = (Math.sin(angle) * distance) / visionRangeX;
    const y = (Math.cos(angle) * distance) / visionRangeY;
    
    setEyeCoords({ x, y });
  };

  const resetEyes = () => {
    setEyeCoords({ x: 0, y: 0 });
  };

  return (
    <>
      <style>
        {`
          .creepy-btn {
            background-color: #111111;
            border-radius: 9999px;
            color: #FFFFFF;
            cursor: pointer;
            letter-spacing: 1px;
            min-width: 9em;
            padding: 0;
            border: 0;
            outline: 0.1875em solid transparent;
            transition: outline 0.1s linear;
            -webkit-tap-highlight-color: transparent;
            font-family: inherit;
            font-size: 0.95rem;
            position: relative;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          }

          .creepy-btn__cover {
            background-color: #FFE600;
            color: #111111;
            box-shadow: 0 0 0 0.125em #111111 inset;
            padding: 0.65em 1.5em;
            border-radius: inherit;
            display: block;
            position: relative;
            z-index: 1;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transform-origin: 1.25em 50%;
            transition:
              background-color 0.3s,
              transform 0.3s cubic-bezier(0.65, 0, 0.35, 1);
            inset: 0;
          }

          .creepy-btn__eyes {
            position: absolute;
            display: flex;
            align-items: center;
            gap: 0.375em;
            right: 1.2em;
            bottom: 0.7em;
            height: 0.75em;
            z-index: 0;
            pointer-events: none; 
          }

          .creepy-btn__eye {
            animation: cb-eye-blink 3s infinite;
            background-color: #FFFFFF;
            border-radius: 50%;
            overflow: hidden;
            width: 0.75em;
            height: 0.75em;
            position: relative;
            display: block;
          }

          .creepy-btn__pupil {
            background-color: #111111;
            border-radius: 50%;
            display: block;
            position: absolute;
            width: 0.375em;
            height: 0.375em;
            top: 50%;
            left: 50%;
          }

          @media (hover: hover) {
            .creepy-btn:hover .creepy-btn__cover {
              background-color: #111111;
              color: #FFE600;
              transform: rotate(-4.5deg);
              transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1.65);
            }
          }

          .creepy-btn:active .creepy-btn__cover {
            transform: rotate(0) scale(0.96);
            transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
          }

          @keyframes cb-eye-blink {
            0%,
            92%,
            100% {
              animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
              height: 0.75em;
            }

            96% {
              animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
              height: 0;
            }
          }
        `}
      </style>
      <button
        className={`creepy-btn ${className}`}
        type="button"
        onClick={onClick}
        onMouseMove={updateEyes}
        onTouchMove={updateEyes}
        onMouseLeave={resetEyes}
        {...props}
      >
        <span className="creepy-btn__eyes" ref={eyesRef}>
          <span className="creepy-btn__eye">
            <span className="creepy-btn__pupil" style={eyeStyle}></span>
          </span>
          <span className="creepy-btn__eye">
            <span className="creepy-btn__pupil" style={eyeStyle}></span>
          </span>
        </span>
        <span className="creepy-btn__cover">{children}</span>
      </button>
    </>
  );
}

export default CreepyButton;
