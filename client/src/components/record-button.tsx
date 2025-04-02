import { useEffect, useRef } from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  onRelease: () => void;
}

export default function RecordButton({ 
  isRecording, 
  onPress, 
  onRelease 
}: RecordButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Clean up event listeners on unmount
  useEffect(() => {
    const button = buttonRef.current;
    
    return () => {
      if (button) {
        button.removeEventListener('mousedown', onPress);
        button.removeEventListener('touchstart', onPress);
        button.removeEventListener('mouseup', onRelease);
        button.removeEventListener('touchend', onRelease);
        button.removeEventListener('mouseleave', onRelease);
      }
    };
  }, [onPress, onRelease]);
  
  // If already recording, the button should function as a stop button
  const handleClick = () => {
    if (isRecording) {
      onRelease();
    } else {
      onPress();
    }
  };
  
  return (
    <button
      ref={buttonRef}
      className={`relative flex h-16 w-64 items-center justify-center rounded-full shadow-lg focus:outline-none ${
        isRecording 
          ? 'animate-pulse bg-danger'
          : 'bg-primary'
      } text-white`}
      onClick={isRecording ? onRelease : undefined}
      onMouseDown={!isRecording ? onPress : undefined}
      onTouchStart={!isRecording ? onPress : undefined}
      onMouseUp={!isRecording ? onRelease : undefined}
      onTouchEnd={!isRecording ? onRelease : undefined}
      onMouseLeave={!isRecording ? onRelease : undefined}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="mr-2 h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        {isRecording ? (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" 
          />
        ) : (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        )}
      </svg>
      <span>{isRecording ? 'Tap to stop' : 'Hold to speak'}</span>
      
      {isRecording && (
        <span className="absolute h-full w-full animate-ping rounded-full bg-danger opacity-30"></span>
      )}
    </button>
  );
}
