import React, { useState, useEffect, useMemo } from 'react';
import { Search, PlayCircle, BookOpen, Calendar, Video, FileText, AlertCircle } from 'lucide-react';

// THAY URL WEB APP CỦA BẠN VÀO ĐÂY
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2-iSpmD23JorgT1VEsCn0UJMYAyUm437etO_2tz_NS2m4M-jzfK4a_56DV5m_ZThO/exec";

export default function AikidoMatrix() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Chuẩn hóa ngày tháng
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

  // Sắp xếp các tuần theo thứ tự số học
  const weeks = ['All', ...[...new Set(data.map(item => item.week).filter(Boolean))].sort((a,b) => Number(a) - Number(b))];

  if (loading) {
    return (
      <div className="flex h-[100dvh] bg-[#020617] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
           <div className="text-slate-300 font-medium animate-pulse">Đang đồng bộ dữ liệu...</div>
        </div>
      </div>
    );
  }

  // ================= CÁC KHỐI GIAO DIỆN DÙNG CHUNG =================

  const renderVideo = () => (
    <div className="w-full bg-black relative" style={{ paddingTop: '56.25%' }}>
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
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} className="flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
          <Video className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">Chưa cập nhật video</p>
        </div>
      )}
    </div>
  );

  const renderHeader = () => (
    <div className="flex flex-col items-start">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-900/30 text-red-400 text-[10px] md:text-xs font-bold uppercase mb-2 md:mb-4 border border-red-900/50">
        <Calendar className="w-3.5 h-3.5" />
        {formatDate(selectedTech?.date)} • {selectedTech?.group}
      </div>
      <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
        {selectedTech?.techniques}
      </h2>
    </div>
  );

  const renderAttackAndNotes = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 bg-slate-800/40 p-4 rounded-lg border border-slate-700">
        <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-1">Tình huống tấn công</p>
          <p className="text-sm md:text-lg text-slate-100 font-semibold">{selectedTech?.attacks}</p>
        </div>
      </div>
      
      {selectedTech?.notes && (
        <div className="bg-slate-900 p-4 md:p-5 rounded-xl border-l-4 border-l-red-600 border border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <h3 className="font-bold uppercase text-xs md:text-sm tracking-wider">Ghi chú huấn luyện</h3>
          </div>
          <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-slate-300">
            {selectedTech.notes.split('\n').map((note, idx) => (
              note.trim() && (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderSearchAndList = () => (
    <div className="flex flex-col h-full bg-[#0f172a] rounded-xl overflow-hidden md:rounded-none">
      {/* Bộ lọc & Tìm kiếm */}
      <div className="p-3 md:p-4 bg-[#020617] border-b border-slate-800 shrink-0">
        <div className="relative mb-3 md:mb-4">
          <Search className="absolute left-3 top-2.5 md:top-3 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-slate-900 border border-slate-700 text-sm md:text-base text-white rounded-lg md:rounded-xl focus:outline-none focus:border-red-600 transition-colors placeholder-slate-500"
            placeholder="Tìm kỹ thuật, đòn tấn công..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {weeks.map(w => (
            <button 
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
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

      {/* Danh sách Kỹ thuật */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 custom-scrollbar">
        {filteredData.length === 0 ? (
          <div className="text-center py-6 md:py-10 text-slate-500">
            <BookOpen className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-20" />
            <p className="text-xs md:text-base">Không tìm thấy dữ liệu</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTech(item)}
              className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                selectedTech?.id === item.id 
                  ? 'bg-slate-800 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                  : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  selectedTech?.id === item.id ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                }`}>
                  {item.group}
                </span>
                {item.videoId && <PlayCircle className={`w-4 h-4 md:w-5 md:h-5 ${selectedTech?.id === item.id ? 'text-red-500' : 'text-slate-400'}`} />}
              </div>
              
              <div>
                <h3 className={`text-sm md:text-base font-bold line-clamp-2 ${selectedTech?.id === item.id ? 'text-white' : 'text-slate-200'}`}>
                  {item.techniques}
                </h3>
                <p className="text-[11px] md:text-sm text-slate-400 line-clamp-1 mt-0.5 md:mt-1">
                  {item.attacks}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0f172a] text-white overflow-hidden selection:bg-red-900 selection:text-white">
      
      {/* ================= GIAO DIỆN MOBILE ================= */}
      {/* Ẩn trên màn hình MD trở lên. Bố cục: Video dính trên cùng -> Header -> Hộp Danh Sách (cuộn được) -> Tấn công & Ghi chú */}
      <div className="md:hidden flex flex-col w-full h-full bg-[#020617]">
        
        {/* Video (Cố định trên cùng) */}
        <div className="shrink-0 z-20 shadow-xl border-b border-slate-800">
          {renderVideo()}
        </div>
        
        {/* Khu vực cuộn chính của Mobile */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">
          {/* Header: Ngày & Tên đòn */}
          <div className="shrink-0">
            {renderHeader()}
          </div>
          
          {/* Hộp Danh sách & Tìm kiếm (Đã được đưa lên trên Ghi chú, có thanh cuộn riêng dài 45vh) */}
          <div className="shrink-0 h-[45vh] border border-slate-700 rounded-xl shadow-lg overflow-hidden">
            {renderSearchAndList()}
          </div>
          
          {/* Tình huống Tấn công & Ghi chú */}
          <div className="shrink-0 pb-6">
            {renderAttackAndNotes()}
          </div>
        </div>
      </div>

      {/* ================= GIAO DIỆN PC / LAPTOP ================= */}
      {/* Ẩn trên Mobile, chia làm 2 cột: Cột trái (Video + Chi tiết), Cột phải (Danh sách) */}
      <div className="hidden md:flex w-full h-full flex-row">
        
        {/* CỘT TRÁI */}
        <div className="w-[60%] flex flex-col bg-[#020617] border-r border-slate-800 z-10">
          <div className="shrink-0 border-b border-slate-800 shadow-xl">
            {renderVideo()}
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col gap-6">
            {renderHeader()}
            {renderAttackAndNotes()}
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="w-[40%] flex flex-col h-full bg-[#0f172a]">
          {renderSearchAndList()}
        </div>
      </div>

    </div>
  );
}