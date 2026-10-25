import React, { useState, useEffect, useMemo } from 'react';
import { Search, PlayCircle, BookOpen, Calendar, FileText, AlertCircle, ArrowLeft, LayoutGrid, Video } from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDMb2cs12xPnpjuAQa3GLp4OPXFlZdGzTc3FxxNv3RbWXheWFYSMHQWr15X23JjU-a/exec"; 

export default function AikidoMatrix() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('All'); // Khôi phục tính năng chọn Tuần
  const [autoPlay, setAutoPlay] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (String(dateStr).includes('GMT') || String(dateStr).includes('Time')) {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return dateStr;
  };

  useEffect(() => {
    fetch(APPS_SCRIPT_URL)
      .then(res => res.json())
      .then(fetchedData => {
        if (Array.isArray(fetchedData)) {
           setData(fetchedData);
        } else {
           console.error("Dữ liệu API không phải là mảng:", fetchedData);
           setData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải dữ liệu:", err);
        setData([]);
        setLoading(false);
      });
  }, []);

  // Lọc dữ liệu kết hợp cả Từ khóa tìm kiếm và Tuần đã chọn
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchWeek = selectedWeek === 'All' || String(item.week) === String(selectedWeek);
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = String(item.techniques || '').toLowerCase().includes(searchLower) || 
                          String(item.attacks || '').toLowerCase().includes(searchLower) ||
                          String(item.group || '').toLowerCase().includes(searchLower);
      return matchWeek && matchSearch;
    });
  }, [data, searchTerm, selectedWeek]);

  // Tạo danh sách các Tuần hiện có để làm nút bấm
  const weeks = ['All', ...[...new Set(data.map(item => item.week).filter(Boolean))].sort((a,b) => Number(a) - Number(b))];

  const groupedData = useMemo(() => {
    const groups = {};
    filteredData.forEach(item => {
      const w = item.week || 'Khác';
      if (!groups[w]) groups[w] = [];
      groups[w].push(item);
    });
    return Object.keys(groups).sort((a,b) => Number(a) - Number(b)).map(week => ({
      week,
      items: groups[week]
    }));
  }, [filteredData]);

  const handleSelect = (item) => {
    setSelectedTech(item);
    setAutoPlay(true);
  };

  const handleBackToDashboard = () => {
    setSelectedTech(null);
    setAutoPlay(false);
  };

  if (loading) {
    return (
      <div className="flex h-[100dvh] bg-[#020617] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
           <div className="text-slate-300 font-medium animate-pulse tracking-wide">Đang đồng bộ võ đường...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#0f172a] text-white overflow-hidden font-sans">
      
      {/* ================= CỘT TRÁI: VIDEO PLAYER ================= */}
      <div className={`w-full md:w-[60%] bg-[#020617] border-r border-slate-800 flex-col z-20 transition-all duration-300 ${selectedTech ? 'flex' : 'hidden md:flex'}`}>
        
        {!selectedTech ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-[#020617]">
             <LayoutGrid className="w-16 h-16 mb-6 opacity-20" />
             <h2 className="text-2xl font-bold text-slate-300 mb-2 uppercase tracking-widest">Từ Điển Aikido</h2>
             <p className="text-sm font-medium">Vui lòng chọn một kỹ thuật từ bảng điều khiển bên phải</p>
          </div>
        ) : (
          <>
            <div className="md:hidden flex items-center justify-between p-3 bg-[#0f172a] border-b border-slate-800">
               <button 
                 onClick={handleBackToDashboard} 
                 className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800/80 rounded-lg active:scale-95 transition-transform"
               >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Trở về</span>
               </button>
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chi tiết đòn</span>
            </div>

            <div className="w-full bg-black relative shrink-0 shadow-2xl" style={{ paddingTop: '56.25%' }}>
              {selectedTech.videoSource === 'youtube' ? (
                <iframe 
                  className="absolute top-0 left-0 w-full h-full border-none"
                  src={`https://www.youtube.com/embed/${selectedTech.videoId}?rel=0&modestbranding=1&autoplay=${autoPlay ? 1 : 0}`} 
                  title={selectedTech.techniques}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
                </iframe>
              ) : selectedTech.videoSource === 'drive' ? (
                <iframe 
                  className="absolute top-0 left-0 w-full h-full border-none bg-slate-900"
                  src={`https://drive.google.com/file/d/${selectedTech.videoId}/preview`}
                  allow={autoPlay ? "autoplay; fullscreen; encrypted-media" : "fullscreen; encrypted-media"}
                  loading="lazy">
                </iframe>
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
                  <Video className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">Video đang được cập nhật</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar bg-gradient-to-b from-slate-900 to-[#020617]">
              <div className="mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-950/40 text-red-400 text-[10px] md:text-xs font-bold uppercase mb-4 border border-red-900/30">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(selectedTech?.date)} • {selectedTech?.group}
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                  {selectedTech?.techniques}
                </h2>
              </div>

              <div className="hidden md:flex flex-col gap-6 mt-8">
                 <div className="flex items-start gap-4 bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                   <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Tình huống tấn công</p>
                     <p className="text-lg text-slate-100 font-semibold">{selectedTech?.attacks}</p>
                   </div>
                 </div>
                 
                 {selectedTech?.notes && (
                   <div className="bg-slate-900/80 p-6 rounded-xl border-l-4 border-l-red-600 border border-slate-800/80">
                     <div className="flex items-center gap-2 mb-4 text-slate-300">
                       <FileText className="w-5 h-5" />
                       <h3 className="font-bold uppercase text-sm tracking-widest">Ghi chú huấn luyện</h3>
                     </div>
                     <ul className="space-y-2 text-slate-300 leading-relaxed">
                       {String(selectedTech.notes).split('\n').map((note, idx) => (
                         note.trim() && (
                           <li key={idx} className="flex items-start gap-3">
                             <span className="text-red-500 mt-1.5 text-xs">◆</span>
                             <span>{note}</span>
                           </li>
                         )
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= CỘT PHẢI: DASHBOARD ================= */}
      <div className={`w-full md:w-[40%] bg-[#0f172a] flex-col ${!selectedTech ? 'flex' : 'hidden md:flex'}`}>
         
         <div className="p-4 md:p-5 bg-[#020617] border-b border-slate-800 shrink-0 shadow-md z-10 flex flex-col gap-4">
            <h1 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
               <LayoutGrid className="text-red-600 w-6 h-6"/>
               Bảng Điều Khiển
            </h1>
            
            {/* Bộ lọc Tìm kiếm */}
            <div className="relative">
               <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
               <input
                 type="text"
                 className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:border-red-600 transition-all placeholder-slate-500 shadow-inner"
                 placeholder="Tìm đòn thế, tình huống tấn công..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            {/* Thanh Tab Chọn Tuần */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {weeks.map(w => (
                <button 
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedWeek === w 
                      ? 'bg-red-700 text-white shadow-md shadow-red-900/20' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {w === 'All' ? 'Tất cả' : `Tuần ${w}`}
                </button>
              ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar bg-slate-950/30">
            {groupedData.length === 0 ? (
               <div className="text-center py-12 text-slate-500">
                  <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Không tìm thấy dữ liệu phù hợp</p>
               </div>
            ) : (
               <div className="space-y-8 pb-8">
                  {groupedData.map(group => (
                     <div key={group.week} className="space-y-3 relative">
                        <h3 className="text-red-500 font-extrabold uppercase tracking-widest text-sm flex items-center gap-2 sticky top-[-1px] md:top-[-20px] bg-[#0f172a]/95 backdrop-blur-sm py-2.5 z-10 shadow-[0_10px_15px_-10px_rgba(2,6,23,0.8)]">
                           <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
                           Tuần {group.week}
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                           {group.items.map(item => (
                              <button
                                 key={item.id}
                                 onClick={() => handleSelect(item)}
                                 className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 group ${
                                    selectedTech?.id === item.id 
                                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-red-600 shadow-[0_4px_20px_rgba(220,38,38,0.15)] ring-1 ring-red-500/30' 
                                    : 'bg-[#1e293b]/70 border-slate-700/60 hover:border-slate-500 hover:bg-[#1e293b]'
                                 }`}
                              >
                                 <div className="flex justify-between items-center w-full mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 uppercase tracking-wider border border-slate-700/50">
                                       {item.group}
                                    </span>
                                    {item.videoId ? (
                                      <PlayCircle className={`w-5 h-5 transition-colors ${selectedTech?.id === item.id ? 'text-red-500' : 'text-slate-500 group-hover:text-red-400'}`} />
                                    ) : (
                                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                                    )}
                                 </div>
                                 <div>
                                    <h4 className="text-sm md:text-base font-bold text-slate-100 line-clamp-2 leading-snug">
                                       {item.techniques}
                                    </h4>
                                    <p className="text-[11px] md:text-xs text-slate-400 line-clamp-1 mt-1 font-medium">
                                       {item.attacks}
                                    </p>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}