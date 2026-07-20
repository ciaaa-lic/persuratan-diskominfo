'use client';

import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useGetLibur, useAddLibur, useDeleteLibur } from '@/features/libur/api';
import { useAuthStore } from '@/store/useAuthStore';

interface KalenderBulananModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function KalenderBulananModal({ isOpen, onClose }: KalenderBulananModalProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const now = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<'bulanan' | 'mingguan'>('bulanan');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const { data: liburData } = useGetLibur();
  const { mutateAsync: addLibur } = useAddLibur();
  const { mutateAsync: deleteLibur } = useDeleteLibur();

  const holidaysDict = useMemo(() => {
    const dict: Record<string, string> = {};
    if (liburData) {
      liburData.forEach(l => {
        const dStr = new Date(l.tanggal).toISOString().split('T')[0];
        dict[dStr] = l.keterangan;
      });
    }
    return dict;
  }, [liburData]);

  const activeSelected = useMemo(() => {
    let target = selectedDateStr;
    if (!target) {
      target = now.toISOString().split('T')[0];
    }
    
    const [y, m, d] = target.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    const dayOfWeek = dateObj.getDay();
    
    return {
      dateString: target,
      dateObj: dateObj,
      dayNum: dateObj.getDate(),
      dayOfWeek: dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      holidayName: holidaysDict[target] || '',
      isHoliday: !!holidaysDict[target],
      isToday: target === now.toISOString().split('T')[0],
    };
  }, [selectedDateStr, holidaysDict, now]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    const todayStr = now.toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayPad = String(d).padStart(2, '0');
      const dateString = `${y}-${m}-${dayPad}`;

      const dayOfWeek = dateObj.getDay();
      days.push({
        dayNum: d,
        dateString,
        dayOfWeek,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday: !!holidaysDict[dateString],
        holidayName: holidaysDict[dateString] || '',
        isToday: dateString === todayStr,
      });
    }
    return days;
  }, [currentMonth, currentYear, now, holidaysDict]);

  const weeklyDays = useMemo(() => {
    const targetDate = activeSelected.dateObj;
    const day = targetDate.getDay();
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(targetDate);
    monday.setDate(diff);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const dayPad = String(current.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${dayPad}`;
      
      week.push({
        dayNum: current.getDate(),
        dateString,
        dayOfWeek: current.getDay(),
        isWeekend: current.getDay() === 0 || current.getDay() === 6,
        isHoliday: !!holidaysDict[dateString],
        holidayName: holidaysDict[dateString] || '',
        isToday: dateString === now.toISOString().split('T')[0],
      });
    }
    return week;
  }, [activeSelected.dateObj, holidaysDict, now]);

  const firstDayOffset = useMemo(() => {
    if (viewMode === 'mingguan') return 0;
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [currentMonth, currentYear, viewMode]);

  if (!isOpen) return null;

  const prevStep = () => {
    if (viewMode === 'mingguan') {
      const prevWeek = new Date(activeSelected.dateObj);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentMonth(prevWeek.getMonth());
      setCurrentYear(prevWeek.getFullYear());
      setSelectedDateStr(prevWeek.toISOString().split('T')[0]);
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const nextStep = () => {
    if (viewMode === 'mingguan') {
      const nextWeek = new Date(activeSelected.dateObj);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentMonth(nextWeek.getMonth());
      setCurrentYear(nextWeek.getFullYear());
      setSelectedDateStr(nextWeek.toISOString().split('T')[0]);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const resetToToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  const formattedSelectedDate = () => {
    return activeSelected.dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const toggleHoliday = async () => {
    if (activeSelected.isHoliday) {
      const result = await Swal.fire({
        title: 'Hapus Hari Libur?',
        text: `Hapus libur: ${activeSelected.holidayName}? Nomor surat pada tanggal ini akan kembali dialokasikan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });
      
      if (result.isConfirmed) {
        try {
          await deleteLibur(activeSelected.dateString);
          Swal.fire({ title: 'Terhapus!', text: 'Hari libur berhasil dihapus.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus hari libur.', 'error');
        }
      }
    } else {
      const { value: keterangan } = await Swal.fire({
        title: 'Tambah Hari Libur',
        text: 'Sistem nomor surat akan melompati tanggal libur secara otomatis.',
        input: 'text',
        inputLabel: 'Keterangan / Nama Libur',
        inputPlaceholder: 'Contoh: Cuti Bersama Idul Fitri',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Simpan',
        inputValidator: (value) => {
          if (!value) return 'Keterangan tidak boleh kosong!';
        }
      });

      if (keterangan) {
        try {
          await addLibur({ tanggal: activeSelected.dateString, keterangan });
          Swal.fire({ title: 'Berhasil!', text: 'Hari libur ditambahkan.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menambahkan hari libur.', 'error');
        }
      }
    }
  };

  const gridDays = viewMode === 'mingguan' ? weeklyDays : calendarDays;
  const currentMonthDisplay = viewMode === 'mingguan' ? activeSelected.dateObj.getMonth() : currentMonth;
  const currentYearDisplay = viewMode === 'mingguan' ? activeSelected.dateObj.getFullYear() : currentYear;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-red-900/20 border border-white/50 dark:border-gray-700/50 max-w-[22rem] w-full overflow-hidden flex flex-col font-sans max-h-[90vh] relative transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vibe / Theme Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col p-6 sm:p-7 h-full">
          {/* Header toggles */}
          <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-2xl p-1 mb-6 border border-white/30 dark:border-gray-700/30 shadow-inner backdrop-blur-sm">
            <button 
              onClick={() => setViewMode('bulanan')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${viewMode === 'bulanan' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              Bulanan
            </button>
            <button 
              onClick={() => setViewMode('mingguan')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${viewMode === 'mingguan' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              Mingguan
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-xl transition-all ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Month / Year Display */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {monthsList[currentMonthDisplay]}
              </h2>
              <span className="text-2xl sm:text-3xl text-gray-400 dark:text-gray-500 font-light tracking-tight">{currentYearDisplay}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={prevStep} className="w-7 h-7 rounded-full bg-white/60 dark:bg-gray-800/60 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white hover:shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg></button>
              <button onClick={nextStep} className="w-7 h-7 rounded-full bg-white/60 dark:bg-gray-800/60 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white hover:shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg></button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-3">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
              <div key={day} className={`text-center text-[11px] font-bold uppercase tracking-wider ${idx >= 5 ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 relative">
            {/* Arced background highlight for today's week (simulated visual effect) */}
            <div className="absolute top-1/2 left-0 right-0 h-16 bg-white/40 dark:bg-gray-800/30 rounded-3xl -z-10 blur-md pointer-events-none" />

            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 sm:h-10" />
            ))}

            {gridDays.map((dateObj) => {
              const isSelected = activeSelected.dateString === dateObj.dateString;
              return (
                <button
                  key={dateObj.dateString}
                  onClick={() => setSelectedDateStr(dateObj.dateString)}
                  title={dateObj.holidayName || (dateObj.isWeekend ? 'Akhir Pekan' : 'Hari Kerja')}
                  className={`h-9 sm:h-10 w-9 sm:w-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all relative group
                    ${
                      dateObj.isToday
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 ring-4 ring-white/50 dark:ring-gray-900/50 scale-110 z-10'
                        : isSelected
                          ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md scale-105 z-10'
                          : dateObj.isWeekend || dateObj.isHoliday
                            ? 'text-red-400/80 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-red-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {dateObj.dayNum}
                  {/* Indicator dots */}
                  {!dateObj.isToday && !isSelected && dateObj.isHoliday && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400" />
                  )}
                  {!dateObj.isToday && !isSelected && !dateObj.isWeekend && !dateObj.isHoliday && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-emerald-400 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 pt-5 border-t border-gray-200/40 dark:border-gray-700/40 flex items-center justify-between">
            <button onClick={resetToToday} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/30 dark:bg-gray-800/40 px-3.5 py-2 rounded-xl shadow-sm backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hari Ini
            </button>
            
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleHoliday}
                  className={`flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-md transition-all border ${
                    activeSelected.isHoliday 
                      ? 'bg-gray-800 hover:bg-gray-700 shadow-gray-900/20 border-gray-700' 
                      : 'bg-red-500 hover:bg-red-600 shadow-red-500/20 border-red-400/50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {activeSelected.isHoliday ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  {activeSelected.isHoliday ? 'Hapus' : 'Tambah Libur'}
                </button>
              </div>
            )}
          </div>
          
          <div className="text-center mt-4">
               <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">{formattedSelectedDate()}</p>
               <p className={`text-[10px] font-medium truncate mt-0.5 ${activeSelected.isHoliday ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                 {activeSelected.isHoliday ? `Libur: ${activeSelected.holidayName}` : activeSelected.isWeekend ? 'Libur Akhir Pekan' : 'Kerja SOP: 40 Nomor/Hari'}
               </p>
          </div>
        </div>
      </div>
    </div>
  );
}
