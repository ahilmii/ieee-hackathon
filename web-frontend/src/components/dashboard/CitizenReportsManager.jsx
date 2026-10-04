import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateCitizenReportStatus } from '../../services/apiService';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  MapPin, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CitizenReportsManager({ reports = [], onReportsUpdate }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'INCELEMEDE' | 'ONAYLANDI' | 'TUTARSIZ'
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [expandedExplanations, setExpandedExplanations] = useState(() => new Set());
  const scrollContainerRef = useRef(null);

  // Belediye personeli operasyonel onay yetkisi
  const canManage = user?.role === 'MUNICIPALITY_STAFF';

  // Filtreleme mantığı
  const filteredReports = reports.filter((report) => {
    const status = report.ai_validation_status || report.status || 'INCELEMEDE';
    if (filter === 'ALL') return true;
    return status === filter;
  });

  // Sayaçlar
  const counts = {
    ALL: reports.length,
    INCELEMEDE: reports.filter(r => (r.ai_validation_status || r.status) === 'INCELEMEDE').length,
    ONAYLANDI: reports.filter(r => (r.ai_validation_status || r.status) === 'ONAYLANDI').length,
    TUTARSIZ: reports.filter(r => (r.ai_validation_status || r.status) === 'TUTARSIZ').length,
  };

  // Yatay kaydırma kontrolleri
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Statü güncelleme
  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    setActionError(null);

    try {
      await updateCitizenReportStatus(reportId, newStatus);

      if (onReportsUpdate) {
        onReportsUpdate(prev => 
          prev.map(r => r.id === reportId ? { 
            ...r, 
            ai_validation_status: newStatus, 
            status: newStatus,
            ai_verification: {
              ...r.ai_verification,
              verified: newStatus === 'ONAYLANDI'
            }
          } : r)
        );
      }
    } catch (err) {
      console.error("Status update execution error:", err);
      setActionError(`Failed to update Report #${reportId}. Please verify your active session permissions.`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Rozet oluşturucu
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ONAYLANDI':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'TUTARSIZ':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
            <XCircle className="w-3 h-3" /> Inconsistent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <Clock className="w-3 h-3" /> Review
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      
      {/* Header and Filter Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Citizen Science Field Operations Desk
            </h3>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
              Municipal Coordination
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crowdsourced environmental anomaly reports and computer vision moderation queue
          </p>
        </div>

        {/* Filters and Navigation Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({counts.ALL})
            </button>
            <button
              onClick={() => setFilter('INCELEMEDE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'INCELEMEDE'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Under Review ({counts.INCELEMEDE})
            </button>
            <button
              onClick={() => setFilter('ONAYLANDI')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'ONAYLANDI'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Approved ({counts.ONAYLANDI})
            </button>
            <button
              onClick={() => setFilter('TUTARSIZ')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'TUTARSIZ'
                  ? 'bg-rose-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              Inconsistent ({counts.TUTARSIZ})
            </button>
          </div>

          {/* Slider Prev / Next Controls */}
          {filteredReports.length > 0 && (
            <div className="flex items-center space-x-1.5 ml-auto">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Yatay Kaydırmalı Kart Listesi (Max 4 Görünür) */}
      {filteredReports.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono">
          No citizen observation reports match the active filter criteria.
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none [scrollbar-width:thin] [scrollbar-color:#334155_transparent]"
        >
          {filteredReports.map((report) => {
            const currentStatus = report.ai_validation_status || report.status || 'INCELEMEDE';
            const isUpdating = updatingId === report.id;
            const explanation = report.ai_explanation || report.ai_verification?.feedback || "Computer vision anomaly validation completed.";
            const canExpandExplanation = explanation.length > 70;
            const isExplanationExpanded = expandedExplanations.has(report.id);

            return (
              <div 
                key={report.id}
                className="shrink-0 w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] snap-start bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3.5 shadow-lg shadow-black/20"
              >
                {/* Görsel ve Temel Başlık */}
                <div className="space-y-3">
                  <div className="relative w-full h-36 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden group">
                    {report.photo_url ? (
                      <img 
                        src={report.photo_url} 
                        alt="Field Observation"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-600 font-mono">
                        No Photo Available
                      </div>
                    )}
                    {report.photo_url && (
                      <a 
                        href={report.photo_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                      </a>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(currentStatus)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate" title={report.category_label || report.category}>
                      {report.category_label || report.category}
                    </h4>
                    <div className="flex items-center text-[11px] text-slate-400 space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{report.location_name}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    "{report.note || 'No notes provided by observer.'}"
                  </p>
                </div>

                {/* AI Analiz Kutusu */}
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1 text-cyan-400 font-medium">
                      <Cpu className="w-3 h-3" /> CV Moderation
                    </span>
                    <span className="font-mono text-slate-400">
                      {((report.ai_verification?.confidence ?? 0.85) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className={`text-[11px] text-slate-300 leading-tight ${isExplanationExpanded ? '' : 'line-clamp-2'}`}>
                    {explanation}
                  </p>
                  {canExpandExplanation && (
                    <button
                      type="button"
                      onClick={() => setExpandedExplanations((current) => {
                        const next = new Set(current);
                        if (next.has(report.id)) {
                          next.delete(report.id);
                        } else {
                          next.add(report.id);
                        }
                        return next;
                      })}
                      aria-expanded={isExplanationExpanded}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
                    >
                      {isExplanationExpanded ? 'Show less' : '… Show more'}
                    </button>
                  )}
                </div>

                {/* Alt Kısım: Zaman & Aksiyon Butonları */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    {report.timestamp ? new Date(report.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No timestamp'}
                  </div>

                  {canManage && currentStatus === 'INCELEMEDE' && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleStatusChange(report.id, 'TUTARSIZ')}
                        disabled={isUpdating}
                        className="flex items-center justify-center space-x-1 text-[11px] py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">Inconsistent</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(report.id, 'ONAYLANDI')}
                        disabled={isUpdating}
                        className="flex items-center justify-center space-x-1 text-[11px] py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate">Approve</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}