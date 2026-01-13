import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaBrain, FaBolt, FaLeaf, FaDumbbell, FaMusic, FaVolumeUp } from 'react-icons/fa';
import { songsAPI, apiKeysAPI } from '../../services/api';
import { toast } from 'react-toastify';
import NightSkyBackground from '../../components/NightSkyBackground';

const MusicLibrary = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMood, setSelectedMood] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const toggleShuffle = () => {
    const newValue = !isShuffling;
    setIsShuffling(newValue);
    if (newValue) {
      setIsRepeating(false); // Kalau Shuffle nyala, Repeat mati otomatis
    }
  };

  const toggleRepeat = () => {
    const newValue = !isRepeating;
    setIsRepeating(newValue);
    if (newValue) {
      setIsShuffling(false); // Kalau Repeat nyala, Shuffle mati otomatis
    }
  };

  const [userApiKey, setUserApiKey] = useState(null);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const bgCanvasRef = useRef(null);

  // --- ENHANCED MOODS with icons ---
  const moods = [
    { 
      value: '', 
      label: 'All Music', 
      icon: FaMusic,
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-300',
      description: 'Browse everything'
    },
    { 
      value: 'focus', 
      label: 'Focus', 
      icon: FaBrain,
      gradient: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
      description: 'Deep concentration'
    },
    { 
      value: 'energetic', 
      label: 'Energetic', 
      icon: FaBolt,
      gradient: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-300',
      description: 'High energy vibes'
    },
    { 
      value: 'chill', 
      label: 'Chill', 
      icon: FaLeaf,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-300',
      description: 'Relax & unwind'
    },
    { 
      value: 'motivation', 
      label: 'Motivation', 
      icon: FaDumbbell,
      gradient: 'from-pink-500/20 to-purple-500/20',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-300',
      description: 'Push your limits'
    }
  ];

  // --- 1. Ambil API Key User ---
  useEffect(() => {
    const getApiKey = async () => {
      try {
        const response = await apiKeysAPI.getAll();
        const keys = response.data.data;
        const activeKey = keys.find(k => k.status === 'active');
        
        if (activeKey) {
          setUserApiKey(activeKey.key);
        } else {
          // 👇 PERBAIKAN DI SINI: Tambahkan object config dengan toastId
          toast.warn('Please generate an API Key in "API Keys" menu to listen to music.', {
            toastId: 'missing-api-key-warning' // ID unik mencegah duplikasi
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching API keys:", error);
        setLoading(false);
      }
    };
    getApiKey();
  }, []);

  // --- 2. Fetch Songs ---
  useEffect(() => {
    if (userApiKey) {
      const fetchSongs = async () => {
        try {
          const response = await songsAPI.getAll({}, userApiKey);
          // 👇 UBAH BAGIAN INI
          setSongs(response.data.data || []); 
        } catch (error) {
          console.error("Error fetching songs:", error);
          toast.error("Failed to load songs");
        } finally {
          setLoading(false);
        }
      };
      fetchSongs();
    }
  }, [userApiKey]);

  // --- 3. Audio Visualizer Background ---
  useEffect(() => {
    if (!isPlaying || !bgCanvasRef.current || !analyserRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = bgCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.5;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.9)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        x += barWidth + 1;
      }
    };

    renderFrame();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const initializeAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playSong = (song) => {
    initializeAudioContext();
    
    // Logika Play/Pause UI
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
      return;
    }

    // Set State Lagu
    setCurrentSong(song);
    setIsPlaying(true);

    // Putar Audio
    if (audioRef.current) {
      const filename = song.fileUrl || song.file_url;
      audioRef.current.src = `http://localhost:5000/uploads/songs/${filename}`;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.error("Error play:", e));
    }

    // 👇 TAMBAHAN: Lapor ke Backend untuk tambah Play Count
    if (userApiKey) {
      // Kita panggil API ini secara "fire and forget" (tidak perlu await karena ga nunggu response)
      songsAPI.incrementPlay(song.id, userApiKey)
        .then(() => console.log(`Play count +1 for: ${song.title}`))
        .catch(err => console.error("Failed to increment play count", err));
    }
  };

  const pauseSong = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else if (currentSong) {
      initializeAudioContext();
      setIsPlaying(true);
      if (audioContextRef.current) audioContextRef.current.resume();
      audioRef.current?.play();
    }
  };

  const nextSong = () => {
    if (!currentSong || filteredSongs.length === 0) return;
    let nextIndex;
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * filteredSongs.length);
      // Tambahan loop 'do-while' biar ga milih lagu yang sama persis kayak sekarang
      do {
        nextIndex = Math.floor(Math.random() * filteredSongs.length);
      } while (filteredSongs.length > 1 && filteredSongs[nextIndex].id === currentSong.id);
      
    } else {
      // Logic Normal: Urut satu per satu
      const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % filteredSongs.length;
    }
    playSong(filteredSongs[nextIndex]);
  };

  const previousSong = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();

        // 👇 TAMBAHAN BARU: Lapor ke backend saat Repeat terjadi
        if (userApiKey && currentSong) {
           songsAPI.incrementPlay(currentSong.id, userApiKey)
             .then(() => console.log('Repeat: Play count +1'))
             .catch(e => console.error(e));
        }

      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isRepeating, currentSong, songs]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter(song => {
    const matchesMood = !selectedMood || song.mood === selectedMood;
    const matchesSearch = !searchQuery || 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <NightSkyBackground />
        <div className="relative" style={{ zIndex: 10 }}>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-32">
      
      {/* 1. LAYER PALING BELAKANG: Bulan & Bintang */}
      <NightSkyBackground />
      
      {/* 2. LAYER TENGAH: Visualizer Canvas */}
      <canvas
          ref={bgCanvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
      />
      
      {/* Overlay tipis supaya text terbaca */}
      <div 
          className="fixed inset-0 bg-black/20 pointer-events-none" 
          style={{ zIndex: 2 }}
      />

      {/* 3. LAYER DEPAN: Konten Website */}
      <div className="relative" style={{ zIndex: 10 }}>
        
        {/* Header */}
        <div className="p-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
            Music Library
          </h1>
          <p className="text-purple-200 text-lg">Your midnight soundtrack ✨</p>
        </div>

        {/* 🎯 HORIZONTAL LAYOUT - Search + Mood Pills in ONE ROW! */}
        <div className="px-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* LEFT: Search Bar - Fixed width */}
            <div className="w-full lg:w-80 flex-shrink-0 animate-slide-in">
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all shadow-lg"
              />
            </div>

            {/* DIVIDER */}
            <div className="hidden lg:block h-12 w-px bg-purple-500/30"></div>

            {/* RIGHT: Mood Pills - Horizontal scroll on mobile, flex on desktop */}
            <div className="w-full lg:flex-1 animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
            {moods.map(mood => {
              const IconComponent = mood.icon;
              const isActive = selectedMood === mood.value;
              const activeBg = mood.textColor.replace('text-', 'bg-').replace('300', '500/20');

              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`relative px-4 py-2.5 rounded-xl border transition-all transform hover:scale-105 overflow-hidden group flex items-center gap-2 flex-shrink-0 ${
                    isActive
                      ? `bg-gradient-to-br ${mood.gradient} ${mood.borderColor} shadow-lg`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`flex-shrink-0 p-1.5 rounded-full ${isActive ? activeBg : 'bg-white/10'}`}>
                    <IconComponent className={`text-sm ${isActive ? mood.textColor : 'text-purple-300'}`} />
                  </div>
                  <span className={`font-semibold text-sm whitespace-nowrap ${isActive ? 'text-white' : 'text-purple-200'}`}>
                    {mood.label}
                  </span>
                  
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse shadow-lg ml-1"></div>
                  )}
                </button>
              );
            })}
              </div>
            </div>
          </div>
        </div>

        {/* Now Playing Section - SMALLER VINYL! */}
        {currentSong && (
          <div className="px-8 mb-8 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-600/20 via-purple-900/30 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                {/* 💿 SMALLER VINYL - w-48 h-48 instead of w-64 h-64 */}
                <div className="relative group flex-shrink-0">
                  <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-gray-900 to-black relative overflow-hidden shadow-2xl ${isPlaying ? 'animate-spin-vinyl' : ''}`}>
                    {/* Vinyl grooves */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-gray-800/30"
                        style={{
                          width: `${100 - i * 10}%`,
                          height: `${100 - i * 10}%`,
                          top: `${i * 5}%`,
                          left: `${i * 5}%`
                        }}
                      />
                    ))}
                    
                    {/* Center image - smaller too */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg">
                      {(currentSong.coverUrl || currentSong.cover_url) ? (
                        <img
                          src={`http://localhost:5000/uploads/covers/${currentSong.coverUrl || currentSong.cover_url}`}
                          alt={currentSong.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                          <FaPlay className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Shimmer effect when playing */}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                    )}
                  </div>
                </div>

                {/* Song Controls */}
                <div className="flex-1 text-center md:text-left w-full">
                  <h2 className="text-3xl font-bold mb-1">{currentSong.title}</h2>
                  <p className="text-xl text-purple-200 mb-4">{currentSong.artist}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-5">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%, rgba(255, 255, 255, 0.2) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                    <button 
                      onClick={toggleShuffle} 
                      className={`p-3 rounded-full transition-all ${isShuffling ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}
                    >
                      <FaRandom />
                    </button>
                    <button 
                      onClick={previousSong} 
                      className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-purple-200 transition-all"
                    >
                      <FaStepBackward />
                    </button>
                    <button 
                      onClick={togglePlayPause} 
                      className="p-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:scale-110 transition-transform shadow-lg shadow-purple-500/50"
                    >
                      {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
                    </button>
                    <button 
                      onClick={nextSong} 
                      className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-purple-200 transition-all"
                    >
                      <FaStepForward />
                    </button>
                    <button 
                      onClick={toggleRepeat} 
                      className={`p-3 rounded-full transition-all ${isRepeating ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}
                    >
                      <FaRedo />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <FaVolumeUp className="text-purple-300" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-purple-300 w-10 text-right">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎨 ENHANCED SONG CARDS - More attractive! */}
        <div className="px-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
            {selectedMood ? `${moods.find(m => m.value === selectedMood)?.label} Tracks` : 'All Tracks'}
            <span className="ml-3 text-sm text-purple-300">({filteredSongs.length})</span>
          </h2>

          {filteredSongs.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <FaMusic className="text-6xl text-purple-300/30 mx-auto mb-4" />
              <p className="text-purple-200 text-xl">No songs found</p>
              <p className="text-purple-300/70 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredSongs.map((song, index) => (
                <div 
                  key={song.id} 
                  onClick={() => playSong(song)}
                  className={`group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden animate-slide-up ${
                    currentSong?.id === song.id 
                      ? 'border-purple-500 shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50' 
                      : 'border-white/10 hover:border-purple-400/50 hover:shadow-purple-500/20'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative mb-4 overflow-hidden rounded-xl aspect-square">
                    <img 
                      src={`http://localhost:5000/uploads/covers/${song.coverUrl || song.cover_url}`}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
                    />
                    <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity ${
                      currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {currentSong?.id === song.id && isPlaying ? (
                        <div className="flex flex-col items-center gap-2">
                          <FaPause className="text-4xl text-white animate-pulse" />
                          <span className="text-xs font-semibold text-white">Playing</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform group-hover:scale-110 transition-transform shadow-lg">
                            <FaPlay className="text-2xl text-white ml-0.5" />
                          </div>
                          <span className="text-xs font-semibold text-white">Play</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <h3 className="font-bold text-white truncate mb-1 group-hover:text-purple-200 transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-sm text-purple-300/80 truncate mb-3">{song.artist}</p>
                    
                    {/* Mood badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                        song.mood === 'focus' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                        song.mood === 'energetic' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                        song.mood === 'chill' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                        'bg-pink-500/20 text-pink-300 border-pink-400/30'
                      }`}>
                        {song.mood}
                      </span>
                      {currentSong?.id === song.id && (
                        <span className="flex items-center gap-1 text-xs text-purple-400 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                          Now
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} crossOrigin="anonymous" />

      <style>{`
        /* Vinyl Animation */
        .animate-spin-vinyl { animation: spin-vinyl 3s linear infinite; }
        @keyframes spin-vinyl { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }

        /* Shimmer Effect */
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Page Animations */
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Loading Animation */
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }

        /* Custom Scrollbar for Mood Pills */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #9333ea, #db2777);
        }
        
        /* Progress Bar Styling */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);
          transition: all 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.8);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);
          transition: all 0.2s;
        }
        input[type=range]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.8);
        }
      `}</style>
    </div>
  );
};

export default MusicLibrary;