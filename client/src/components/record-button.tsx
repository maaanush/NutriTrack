import { useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

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
  // Simple click handler that toggles recording on/off
  const handleClick = () => {
    if (isRecording) {
      onRelease();
    } else {
      onPress();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`relative flex h-16 w-64 items-center justify-center rounded-full shadow-lg focus:outline-none ${
        isRecording 
          ? 'animate-pulse bg-danger'
          : 'bg-primary'
      } text-white`}
    >
      {isRecording ? (
        <>
          <Square className="mr-2 h-6 w-6" />
          <span>Stop Recording</span>
        </>
      ) : (
        <>
          <Mic className="mr-2 h-6 w-6" />
          <span>Start Recording</span>
        </>
      )}
      
      {isRecording && (
        <span className="absolute h-full w-full animate-ping rounded-full bg-danger opacity-30"></span>
      )}
    </button>
  );
}
