import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Upload, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { parseBlob } from "music-metadata-browser";
import { Buffer } from "buffer";
window.Buffer = Buffer; // Ensure Buffer is globally available



export default function PassingThePillow() {
  const [darkMode, setDarkMode] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [albumArt, setAlbumArt] = useState(null);
  const [randomStop, setRandomStop] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (audioRef.current) {
          const progressValue =
            (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(progressValue);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setRandomStop(generateRandomTime());
      }, 22000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (randomStop !== null && isPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setRandomStop(generateRandomTime());
        }
      }, randomStop);
    }
  }, [randomStop, isPlaying]);

  const generateRandomTime = () => {
    return Math.floor(Math.random() * (20000 - 10000) + 10000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioFile(url);
      extractAlbumArt(file);
    }
  };
 
  
  const extractAlbumArt = async (file) => {
    try {
      const metadata = await parseBlob(file);
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const base64String = `data:${picture.format};base64,${Buffer.from(
          picture.data
        ).toString("base64")}`;
        setAlbumArt(base64String);
      } else {
        setAlbumArt(null);
      }
    } catch (error) {
      console.error("Error extracting metadata:", error);
      setAlbumArt(null);
    }
  };
  
  
  

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setRandomStop(null);
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } min-h-screen flex flex-col items-center justify-between transition-all`}
    >
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-lg font-bold">
          <link
            rel="alternate"
            href="atom.xml"
            type="application/atom+xml"
            title="Atom"
          />
          <Link to="/">Pass the pillow</Link>
        </h1>
        <div className="flex gap-4">
          <label className="cursor-pointer">
            <Upload size={20} />
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Content Section */}
      <div className="relative w-64 h-64 flex items-center justify-center mt-10 border-4 border-gray-400 rounded-full overflow-hidden">
        {albumArt ? (
          <img
            src={albumArt}
            alt="Album Art"
            className={`absolute w-full h-full object-cover ${
              isPlaying ? "animate-spin-slow" : ""
            }`}
          />
        ) : (
          <div className="absolute w-full h-full flex items-center justify-center bg-gray-400">
            <p className="text-white text-center">No Album Art</p>
          </div>
        )}
        <span className="text-xl font-bold relative z-10 pt-8">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <button
          className="p-2 bg-blue-500 text-white rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          className="p-2 bg-red-500 text-white rounded-full"
          onClick={handleReplay}
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {audioFile && <audio ref={audioRef} src={audioFile} />}
    </div>
  );
}
