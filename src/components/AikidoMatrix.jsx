import React, { useState, useEffect, useMemo } from 'react';
import { Search, PlayCircle, BookOpen, Calendar, Video, FileText, AlertCircle } from 'lucide-react';

// THAY URL WEB APP CỦA BẠN VÀO ĐÂY
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxu50_u37PEAkUchkbo12vnqhmNwJZtnfwagIvvQeBbElgZmN4f5vHlgiX_3J51ViB7/exec";

export default function AikidoMatrix() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Hàm chuẩn hóa chuỗi ngày tháng bị lỗi múi giờ từ Google Sheets
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('GMT') || dateStr.includes('Time')) {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return dateStr;
  };

  useEffect(() => {
    fetch(APPS_SCRIPT_URL)
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        if(fetchedData.length > 0) setSelectedTech(fetchedData[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải dữ liệu:", err);
        setLoading(false);
      });
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchWeek = selectedWeek === 'All' || item.week === String(selectedWeek);
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = (item.techniques || '').toLowerCase().includes(searchLower) || 
                          (item.attacks || '').toLowerCase().includes(searchLower) ||
                          (item.group || '').toLowerCase().includes(searchLower);
      return matchWeek && matchSearch;
    });
  }, [data, selectedWeek, searchTerm]);

  const weeks = ['All', ...new Set(data.map(item => item.week).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="flex h-screen bg-[#020617] items-center justify-center">
        <div className="text-white text-xl animate-pulse">Đang tải dữ liệu võ đường...</div>
      </div>
    );
  }

  return (
    // Bọc toàn bộ trong màu nền tối tuyệt đối, chữ trắng để fix lỗi chữ đen
    <div className="flex flex-col h-screen bg-[#0f172a] text-white md:flex-row font-sans overflow-hidden">
      
      {/* ---------------- CỘT TRÁI: VIDEO & CHI TIẾT ---------------- */}
      <div className="w-full md:w-[60%] flex flex-col bg-[#020617] border-b md:border-b-0 md:border-r border-slate-800 z-10">
        
        {/* Khung Video: Sử dụng Inline Style Hack để ĐẢM BẢO luôn đúng tỷ lệ 16:9 */}
        <div className="w-full bg-black relative" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
          {selectedTech?.videoId ? (
            selectedTech.videoSource === 'youtube' ? (
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube.com/embed/${selectedTech.videoId}?rel=0&autoplay=1&modestbranding=1`} 
                title={selectedTech.techniques}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            ) : (
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://drive.google.com/file/d/${selectedTech.videoId}/preview`}
                allow="autoplay">
              </iframe>
            )
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} className="flex flex-col items-center justify-center text-slate-500">
              <Video className="w-12 h-12 mb-3 opacity-30" />
              <p>Chưa có dữ liệu video</p>
            </div>
          )}
        </div>

        {/* Nội dung chi tiết đòn đánh */}
        <div className="p-5 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-900/30 text-red-400 text-xs font-bold uppercase mb-4 border border-red-900/50">
            <Calendar className="w-4 h-4" />
            {formatDate(selectedTech?.date)} • {selectedTech?.group}
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
            {selectedTech?.techniques}
          </h2>
          
          <div className="flex items-start gap-3 mb-8 bg-slate-800/40 p-4 rounded-lg border border-slate-700">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tình huống tấn công</p>
              <p className="text-lg text-slate-100 font-semibold">{selectedTech?.attacks}</p>
            </div>
          </div>
          
          {selectedTech?.notes && (
            <div className="bg-slate-900 p-5 rounded-xl border-l-4 border-l-red-600 border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-300">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold uppercase text-sm tracking-wider">Ghi chú huấn luyện</h3>
              </div>
              <ul className="space-y-2 text-slate-300">
                {selectedTech.notes.split('\n').map((note, idx) => (
                  note.trim() && (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{note}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- CỘT PHẢI: TÌM KIẾM & DANH SÁCH ---------------- */}
      <div className="w-full md:w-[40%] flex flex-col h-full bg-[#0f172a]">
        
        {/* Bộ lọc & Tìm kiếm */}
        <div className="p-4 bg-[#020617] border-b border-slate-800 z-10 shrink-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-red-600 transition-colors placeholder-slate-500"
              placeholder="Tìm kỹ thuật, đòn tấn công..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weeks.map(w => (
              <button 
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  selectedWeek === w 
                    ? 'bg-red-700 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {w === 'All' ? 'Tất cả' : `Tuần ${w}`}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách Kỹ thuật */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Không tìm thấy dữ liệu phù hợp</p>
            </div>
          ) : (
            filteredData.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTech(item)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                  selectedTech?.id === item.id 
                    ? 'bg-slate-800 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                    : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    selectedTech?.id === item.id ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {item.group}
                  </span>
                  {item.videoId && <PlayCircle className={`w-5 h-5 ${selectedTech?.id === item.id ? 'text-red-500' : 'text-slate-400'}`} />}
                </div>
                
                <div>
                  <h3 className={`font-bold line-clamp-2 ${selectedTech?.id === item.id ? 'text-white' : 'text-slate-200'}`}>
                    {item.techniques}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-1 mt-1">
                    {item.attacks}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

    </div>
  );
}