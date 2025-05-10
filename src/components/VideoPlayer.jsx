import { useState, useEffect, useRef } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const VideoPlayer = ({ video, userId, onProgressUpdate }) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // Load saved progress from Firestore
    const loadProgress = async () => {
      if (!userId || !video.id) return;
      
      try {
        const progressDoc = await getDoc(doc(db, "videoProgress", `${userId}_${video.id}`));
        if (progressDoc.exists()) {
          const data = progressDoc.data();
          setProgress(data.progress);
          setIsCompleted(data.completed);
          if (videoRef.current) {
            videoRef.current.currentTime = (data.progress / 100) * videoRef.current.duration;
          }
        }
      } catch (error) {
        console.error("Error loading video progress:", error);
      }
    };

    loadProgress();
  }, [video.id, userId]);

  const handleTimeUpdate = async () => {
    if (!videoRef.current || !userId || !video.id) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    const newProgress = (currentTime / duration) * 100;

    setProgress(newProgress);

    // Save progress to Firestore
    try {
      const progressRef = doc(db, "videoProgress", `${userId}_${video.id}`);
      await updateDoc(progressRef, {
        progress: newProgress,
        completed: newProgress >= 95,
        lastPosition: currentTime,
        updatedAt: new Date()
      });

      // If video is completed (95% or more watched)
      if (newProgress >= 95 && !isCompleted) {
        setIsCompleted(true);
        onProgressUpdate?.(video.id, true);
        toast.success("Video completed! 🎉");
      } else if (newProgress < 95 && isCompleted) {
        setIsCompleted(false);
        onProgressUpdate?.(video.id, false);
      }
    } catch (error) {
      console.error("Error saving video progress:", error);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={video.url}
        controls
        className="w-full max-w-xl"
        onTimeUpdate={handleTimeUpdate}
      />
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            ref={progressRef}
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-600">
            Progress: {Math.round(progress)}%
          </span>
          {isCompleted && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✓ Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 