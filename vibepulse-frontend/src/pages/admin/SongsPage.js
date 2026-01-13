import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { FaMusic, FaPlus, FaEdit, FaTrash, FaTimes, FaPlay, FaPause, FaStepForward, FaStepBackward, FaSearch, FaRandom, FaRedo, FaVolumeUp, FaBrain, FaBolt, FaLeaf, FaDumbbell, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SongsPage = () => {
  // State management (all existing states preserved)
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    mood: 'focus',
    genre: '',
    duration: '',
    lyrics: '',
    isActive: true
  });
  const [musicFile, setMusicFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const bgCanvasRef = useRef(null);

  const moods = [
    { 
      value: 'focus', 
      label: 'Focus', 
      icon: FaBrain,
      gradient: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
      description: 'Deep work & concentration'
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
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-300',
      description: 'Push your limits'
    }
  ];

  // All useEffects (preserved)
  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchQuery, selectedMood]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentSong, songs, isRepeating]);

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
        barHeight = (dataArray[i] / 255) * canvas.height * 0.75;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
        gradient.addColorStop(0.4, 'rgba(51, 65, 85, 0.7)');
        gradient.addColorStop(0.7, 'rgba(148, 163, 184, 0.85)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        x += barWidth + 1;
      }
    };

    renderFrame();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // All functions (preserved)
  const fetchSongs = async () => {
    try {
      const response = await adminAPI.getAllSongs();
      setSongs(response.data.data.songs);
    } catch (error) {
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = [...songs];
    if (searchQuery) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedMood) {
      filtered = filtered.filter(song => song.mood === selectedMood);
    }
    setFilteredSongs(filtered);
  };

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
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
      return;
    }
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      const filename = song.fileUrl || song.file_url;
      audioRef.current.src = `http://localhost:5000/uploads/songs/${filename}`;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.error("Error play:", e));
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
    } else {
      const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
      nextIndex = (currentIndex + 1) % filteredSongs.length;
    }
    playSong(filteredSongs[nextIndex]);
  };

  const previousSong = () => {
    if (!currentSong || filteredSongs.length === 0) return;
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
    playSong(filteredSongs[prevIndex]);
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEdit = (song) => {
    setFormData({
      title: song.title,
      artist: song.artist,
      mood: song.mood,
      genre: song.genre || '',
      duration: song.duration || '',
      lyrics: song.lyrics || '',
      isActive: song.isActive
    });
    setEditId(song.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (musicFile) data.append('music', musicFile);
    if (coverFile) data.append('cover', coverFile);

    try {
      if (isEditing) {
        await adminAPI.updateSong(editId, data);
        toast.success('Song updated successfully! 🎵');
      } else {
        if (!musicFile) {
          toast.error('Please upload a music file');
          return;
        }
        await adminAPI.createSong(data);
        toast.success('Song created successfully! ✨');
      }
      closeModal();
      fetchSongs();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteSong(id);
      toast.success('Song deleted! 🗑️');
      if (currentSong?.id === id) {
        setCurrentSong(null);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
      fetchSongs();
    } catch (error) {
      toast.error('Failed to delete song');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: '', artist: '', mood: 'focus', genre: '', duration: '', lyrics: '', isActive: true });
    setMusicFile(null);
    setCoverFile(null);
  };

  const toggleSongStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateSong(id, { isActive: !currentStatus });
      toast.success(!currentStatus ? 'Song activated! ✅' : 'Song deactivated! ⏸️');
      fetchSongs();
    } catch (error) {
      toast.error('Failed to update song status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Moon Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>
          <div className="absolute top-20 right-20 w-64 h-64">
            <div className="relative w-full h-full animate-float-slow">
              <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-2xl">
                <div className="absolute top-8 left-12 w-8 h-8 bg-slate-500/30 rounded-full"></div>
                <div className="absolute top-20 right-16 w-12 h-12 bg-slate-500/20 rounded-full"></div>
                <div className="absolute bottom-16 left-16 w-6 h-6 bg-slate-500/40 rounded-full"></div>
              </div>
            </div>
          </div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-slate-400 border-t-transparent rounded-full animate-spin-reverse"></div>
          <div className="absolute inset-3 w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-32">
      {/* 🌙 MOON BACKGROUND - Same as Dashboard & Users! */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black"></div>
        
        {/* Moon */}
        <div className="absolute top-20 right-20 w-64 h-64">
          <div className="relative w-full h-full animate-float-slow">
            {/* Moon glow */}
            <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
            {/* Moon body */}
            <div className="absolute inset-4 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-2xl">
              {/* Moon craters */}
              <div className="absolute top-8 left-12 w-8 h-8 bg-slate-500/30 rounded-full"></div>
              <div className="absolute top-20 right-16 w-12 h-12 bg-slate-500/20 rounded-full"></div>
              <div className="absolute bottom-16 left-16 w-6 h-6 bg-slate-500/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Floating Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}

        {/* Shooting Stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white animate-shooting-star" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white animate-shooting-star" style={{ animationDelay: '5s' }}></div>
        <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-white animate-shooting-star" style={{ animationDelay: '8s' }}></div>

        {/* Floating Clouds */}
        <div className="absolute bottom-20 left-0 w-full h-32 opacity-10">
          <div className="absolute bottom-0 left-0 w-64 h-24 bg-slate-400 rounded-full blur-2xl animate-cloud-slow"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-20 bg-slate-500 rounded-full blur-2xl animate-cloud-medium"></div>
          <div className="absolute bottom-0 right-0 w-72 h-28 bg-slate-400 rounded-full blur-2xl animate-cloud-fast"></div>
        </div>
      </div>

      {/* Audio Visualizer Canvas */}
      <canvas
        ref={bgCanvasRef}
        className="fixed inset-0 md:left-64 pointer-events-none w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Main Overlay */}
      <div className="fixed inset-0 md:left-64 bg-gradient-to-b from-slate-900/70 to-slate-950/95 pointer-events-none" style={{ zIndex: 1 }}></div>

      {/* Content */}
      <div className="relative max-w-[1600px] mx-auto px-6 py-6" style={{ zIndex: 10 }}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-200 via-sky-200 to-slate-200 bg-clip-text text-transparent mb-2 animate-gradient">
              Song Management
            </h1>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
              Your music library • {songs.length} tracks
            </p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            className="px-6 py-3 bg-gradient-to-r from-slate-600 to-sky-500 rounded-xl font-bold text-white hover:from-slate-700 hover:to-sky-600 transition-all shadow-lg shadow-sky-500/30 hover:scale-105 flex items-center gap-2 animate-slide-in"
          >
            <FaPlus /> Add Song
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50 transition-all shadow-lg group-hover:shadow-xl group-hover:shadow-sky-500/20"
            />
          </div>
        </div>

        {/* Mood Filter */}
        <div className="mb-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* All Music */}
            <button
              onClick={() => setSelectedMood('')}
              className={`relative p-3 rounded-xl border transition-all transform hover:scale-105 overflow-hidden group text-left ${
                selectedMood === ''
                  ? 'bg-gradient-to-br from-slate-600/40 to-slate-700/40 border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="relative z-10 flex items-center gap-3">
                 <div className={`flex-shrink-0 p-2 rounded-full ${selectedMood === '' ? 'bg-sky-500/20' : 'bg-slate-700/50'}`}>
                    <FaMusic className={`text-lg ${selectedMood === '' ? 'text-sky-400' : 'text-slate-400'}`} />
                 </div>
                 <div className="min-w-0">
                   <h3 className={`font-bold text-sm truncate ${selectedMood === '' ? 'text-white' : 'text-slate-300'}`}>
                     All Music
                   </h3>
                   <p className="text-[10px] text-slate-400 leading-tight truncate">Browse everything</p>
                 </div>
              </div>
              {selectedMood === '' && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
              )}
            </button>

            {/* Mood Cards */}
            {moods.map(mood => {
              const IconComponent = mood.icon;
              const activeBg = mood.textColor.replace('text-', 'bg-').replace('300', '500/20');
              const activeDot = mood.textColor.replace('text-', 'bg-').replace('300', '400');

              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`relative p-3 rounded-xl border transition-all transform hover:scale-105 overflow-hidden group text-left ${
                    selectedMood === mood.value
                      ? `bg-gradient-to-br ${mood.gradient} ${mood.borderColor} shadow-md`
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-3">
                     <div className={`flex-shrink-0 p-2 rounded-full ${selectedMood === mood.value ? activeBg : 'bg-slate-700/50'}`}>
                        <IconComponent className={`text-lg ${selectedMood === mood.value ? mood.textColor : 'text-slate-400'}`} />
                     </div>
                     <div className="min-w-0">
                       <h3 className={`font-bold text-sm truncate ${selectedMood === mood.value ? 'text-white' : 'text-slate-300'}`}>
                         {mood.label}
                       </h3>
                       <p className="text-[10px] text-slate-400 leading-tight truncate">{mood.description}</p>
                     </div>
                  </div>
                  {selectedMood === mood.value && (
                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${activeDot}`}></div>
                  )}
                </button>
              );
            })}
          </div>
          
          <p className="text-xs text-slate-500 mt-3 ml-1 font-medium">
            {filteredSongs.length === songs.length 
              ? `Showing all ${songs.length} tracks` 
              : `Found ${filteredSongs.length} of ${songs.length} tracks`}
          </p>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6">
          
          {/* LEFT: Songs Grid */}
          <div>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-32 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-3xl animate-fade-in">
                <FaMusic className="text-7xl text-slate-400/30 mx-auto mb-6" />
                <p className="text-slate-300 text-2xl font-semibold mb-2">No songs found</p>
                <p className="text-slate-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSongs.map((song, index) => (
                  <div 
                    key={song.id} 
                    className={`group bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-lg border rounded-2xl p-4 hover:from-slate-700/50 hover:to-slate-800/70 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-sky-500/20 animate-slide-up ${
                      currentSong?.id === song.id ? 'border-sky-400 shadow-xl shadow-sky-500/40 ring-2 ring-sky-400/50' : 'border-slate-700/50'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => playSong(song)}
                  >
                    <div className="absolute top-3 left-3 z-20">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        song.isActive ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                      }`}>
                        {song.isActive ? '●' : '○'}
                      </span>
                    </div>

                    <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-slate-900/50">
                      {(song.coverUrl || song.cover_url) ? (
                        <img 
                          src={`http://localhost:5000/uploads/covers/${song.coverUrl || song.cover_url}`}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=♪'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                          <FaMusic className="text-5xl text-slate-500/50" />
                        </div>
                      )}
                      
                      <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center transition-opacity ${
                        currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {currentSong?.id === song.id && isPlaying ? (
                          <div className="flex flex-col items-center gap-2">
                            <FaPause className="text-5xl text-white animate-pulse" />
                            <span className="text-xs font-semibold text-white">Playing</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-4 bg-gradient-to-r from-slate-500 to-sky-500 rounded-full transform group-hover:scale-110 transition-transform shadow-lg shadow-sky-500/50">
                              <FaPlay className="text-3xl text-white ml-1" />
                            </div>
                            <span className="text-xs font-semibold text-white">Play Now</span>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(song); }}
                          className="p-2 bg-slate-600/90 hover:bg-slate-700 backdrop-blur-md text-white rounded-lg transition-all transform hover:scale-110 shadow-lg"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(song.id, song.title); }}
                          className="p-2 bg-red-500/90 hover:bg-red-600 backdrop-blur-md text-white rounded-lg transition-all transform hover:scale-110 shadow-lg"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white truncate text-sm leading-tight">{song.title}</h3>
                      <p className="text-xs text-slate-300/80 truncate">{song.artist}</p>
                      
                      <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                        <span className={`px-2 py-1 rounded-md font-semibold ${
                          song.mood === 'focus' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          song.mood === 'energetic' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          song.mood === 'chill' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {song.mood}
                        </span>
                        <span className="flex items-center gap-1">
                          ▶ {song.playCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Now Playing Panel */}
          {currentSong && (
            <div className="lg:sticky lg:top-8 h-fit animate-slide-in">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaMusic className="text-sky-400 animate-bounce-gentle" />
                  Now Playing
                </h2>

                {/* Spinning Vinyl */}
                <div className="relative w-full aspect-square mb-6">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`} style={{ animationDuration: '3s' }}>
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-slate-700/30"
                        style={{
                          width: `${100 - i * 10}%`,
                          height: `${100 - i * 10}%`,
                          top: `${i * 5}%`,
                          left: `${i * 5}%`
                        }}
                      />
                    ))}
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/5 h-2/5 rounded-full bg-slate-800 border-2 border-sky-500/50 overflow-hidden shadow-lg">
                      {(currentSong.coverUrl || currentSong.cover_url) ? (
                        <img 
                          src={`http://localhost:5000/uploads/covers/${currentSong.coverUrl || currentSong.cover_url}`}
                          alt={currentSong.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-700">
                          <FaMusic className="text-2xl text-slate-500" />
                        </div>
                      )}
                    </div>

                    {isPlaying && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer rounded-full"></div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{currentSong.title}</h3>
                    <p className="text-sm text-slate-400">{currentSong.artist}</p>
                  </div>

                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #64748b 0%, #38bdf8 ${progress}%, rgba(100, 116, 139, 0.3) ${progress}%, rgba(100, 116, 139, 0.3) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={() => setIsShuffling(!isShuffling)} 
                      className={`p-2 rounded-lg transition-all ${
                        isShuffling ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <FaRandom />
                    </button>
                    <button 
                      onClick={previousSong} 
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <FaStepBackward />
                    </button>
                    <button 
                      onClick={togglePlayPause} 
                      className="p-4 bg-white rounded-full hover:scale-110 transition-all shadow-lg"
                    >
                      {isPlaying ? <FaPause className="text-slate-900" /> : <FaPlay className="text-slate-900 ml-0.5" />}
                    </button>
                    <button 
                      onClick={nextSong} 
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <FaStepForward />
                    </button>
                    <button 
                      onClick={() => setIsRepeating(!isRepeating)} 
                      className={`p-2 rounded-lg transition-all ${
                        isRepeating ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <FaRedo />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <FaVolumeUp className="text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-1.5 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 w-10 text-right font-medium">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM STICKY PLAYER --- */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-gradient-to-r from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-t border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-6 py-3">
            
            {/* Progress Bar (Garis Tipis di Atas Player) */}
            <div className="absolute top-0 left-0 right-0 h-1 group cursor-pointer">
               <div className="absolute inset-0 bg-slate-700/30"></div>
               <div 
                 className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 relative transition-all duration-100"
                 style={{ width: `${progress}%` }}
               >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4 mt-1">
              {/* Left: Info Lagu Kecil */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg border border-slate-700/50 relative group">
                  {(currentSong.coverUrl || currentSong.cover_url) ? (
                    <img 
                      src={`http://localhost:5000/uploads/covers/${currentSong.coverUrl || currentSong.cover_url}`}
                      alt={currentSong.title}
                      className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                      style={{ animationDuration: '8s' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <FaMusic className="text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <h4 className="font-bold text-slate-100 truncate text-sm">{currentSong.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{currentSong.artist}</p>
                </div>
              </div>

              {/* Center: Tombol Kontrol */}
              <div className="flex items-center gap-3 md:gap-6">
                 <button 
                    onClick={() => setIsShuffling(!isShuffling)}
                    className={`p-2 rounded-lg transition-colors ${isShuffling ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Shuffle"
                  >
                    <FaRandom className="text-xs md:text-sm" />
                  </button>

                 <button 
                    onClick={previousSong} 
                    className="text-slate-300 hover:text-white transition-colors hover:scale-110 transform"
                  >
                    <FaStepBackward className="text-lg" />
                  </button>

                  <button 
                    onClick={togglePlayPause} 
                    className="p-3 bg-gradient-to-r from-slate-100 to-white text-slate-900 rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
                  >
                    {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
                  </button>

                  <button 
                    onClick={nextSong} 
                    className="text-slate-300 hover:text-white transition-colors hover:scale-110 transform"
                  >
                    <FaStepForward className="text-lg" />
                  </button>

                  <button 
                    onClick={() => setIsRepeating(!isRepeating)}
                    className={`p-2 rounded-lg transition-colors ${isRepeating ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Repeat"
                  >
                    <FaRedo className="text-xs md:text-sm" />
                  </button>
              </div>

              {/* Right: Volume & Waktu */}
              <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
                <span className="text-xs text-slate-400 font-mono hidden md:block">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                <div className="hidden md:flex items-center gap-2 w-28 group">
                    <FaVolumeUp className={`text-sm ${volume === 0 ? 'text-slate-600' : 'text-slate-400 group-hover:text-sky-400'} transition-colors`} />
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer relative">
                      <div 
                        className="h-full bg-slate-400 group-hover:bg-sky-400 transition-colors"
                        style={{ width: `${volume * 100}%` }}
                      ></div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-slide-up">
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white z-10"
            >
              <FaTimes />
            </button>

            <div className="p-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-200 to-sky-200 bg-clip-text text-transparent mb-6">
                {isEditing ? '✏️ Edit Song' : '➕ Add New Song'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Title *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all" 
                      placeholder="e.g. Midnight City"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Artist *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.artist} 
                      onChange={(e) => setFormData({...formData, artist: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all" 
                      placeholder="e.g. M83"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Mood *</label>
                    <select 
                      value={formData.mood} 
                      onChange={(e) => setFormData({...formData, mood: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all appearance-none"
                    >
                      <option value="focus" className="bg-slate-900">🎯 Focus</option>
                      <option value="energetic" className="bg-slate-900">⚡ Energetic</option>
                      <option value="chill" className="bg-slate-900">😌 Chill</option>
                      <option value="motivation" className="bg-slate-900">💪 Motivation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Genre</label>
                    <input 
                      type="text" 
                      value={formData.genre} 
                      onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all" 
                      placeholder="e.g. Lofi / Pop"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400">Duration (seconds)</label>
                  <input 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all" 
                    placeholder="e.g. 180"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400 flex justify-between">
                      Audio File (MP3) {!isEditing && '*'}
                      {isEditing && <span className="text-xs text-amber-400">Optional</span>}
                    </label>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      onChange={(e) => setMusicFile(e.target.files[0])} 
                      className="w-full px-4 py-3 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-slate-500 file:to-sky-500 file:text-white hover:file:from-slate-600 hover:file:to-sky-600 cursor-pointer transition-all" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-400">Cover Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setCoverFile(e.target.files[0])} 
                      className="w-full px-4 py-3 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-slate-500 file:to-sky-500 file:text-white hover:file:from-slate-600 hover:file:to-sky-600 cursor-pointer transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    Status
                    <span className="text-xs text-slate-500">(Active songs are visible to users)</span>
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isActive ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-semibold ${formData.isActive ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {formData.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl font-bold transition-all text-slate-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 via-slate-500 to-sky-500 hover:from-slate-700 hover:via-slate-600 hover:to-sky-600 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 text-white"
                  >
                    {isEditing ? 'Save Changes' : 'Upload Song'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Moon & Background Animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px);
            opacity: 0;
          }
        }

        @keyframes cloud-slow {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes cloud-medium {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(100vw); }
        }

        @keyframes cloud-fast {
          0% { transform: translateX(-80px); }
          100% { transform: translateX(100vw); }
        }

        /* Content Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in {
          from { 
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Animation Classes */
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-shooting-star { animation: shooting-star 3s linear infinite; }
        .animate-cloud-slow { animation: cloud-slow 60s linear infinite; }
        .animate-cloud-medium { animation: cloud-medium 45s linear infinite; }
        .animate-cloud-fast { animation: cloud-fast 30s linear infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-shimmer {
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }

        /* Range Slider Styling */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e2e8f0, #38bdf8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
          transition: all 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 15px rgba(56, 189, 248, 1);
        }
        input[type=range]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e2e8f0, #38bdf8);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
          transition: all 0.2s;
        }
        input[type=range]::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 15px rgba(56, 189, 248, 1);
        }
      `}</style>
    </div>
  );
};

export default SongsPage;