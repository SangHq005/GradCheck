import React, { useState } from 'react';
import { MatchResult, AnalysisResult } from '../types';
import { analyzeGraduates } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Sparkles, Users, UserX, RefreshCw, CheckCircle } from 'lucide-react';

interface ResultsViewProps {
  results: MatchResult;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'analysis'>('list');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    setActiveTab('analysis');
    try {
      const data = await analyzeGraduates(results.matched);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const exportCSV = () => {
    const headers = ["MSSV", "Họ và tên", "Ngành", "Trạng thái"];
    const rows = results.matched.map(s => [
      s.id, 
      s.fullName || "N/A", 
      s.major || "N/A", 
      "Đã tốt nghiệp"
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ket_qua_loc_mssv.csv';
    link.click();
  };

  const StatCard = ({ title, value, color, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="SL File cần kiểm tra" 
          value={results.totalClubMembers} 
          color="bg-blue-500" 
          icon={Users}
        />
        <StatCard 
          title="Trùng khớp (Có trong DS tổng)" 
          value={results.matched.length} 
          color="bg-green-500" 
          icon={CheckCircle}
        />
        <StatCard 
          title="Không tìm thấy" 
          value={results.notFoundInSchoolFile.length} 
          color="bg-orange-400" 
          icon={UserX}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50">
            <div className="flex space-x-2 mb-4 sm:mb-0 bg-gray-200 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    Danh sách trùng khớp ({results.matched.length})
                </button>
                {/* Only show AI button if we have matched data to analyze */}
                {results.matched.length > 0 && (
                  <button
                      onClick={() => { setActiveTab('analysis'); if(!analysis && !loadingAnalysis) handleAnalyze(); }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                      <Sparkles size={16} />
                      AI Phân tích
                  </button>
                )}
            </div>
            <div className="flex space-x-3">
                <button 
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                    disabled={results.matched.length === 0}
                >
                    <Download size={16} />
                    Tải về kết quả
                </button>
                <button 
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                    <RefreshCw size={16} />
                    Làm lại
                </button>
            </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {activeTab === 'list' && (
            <div className="overflow-x-auto">
                {results.matched.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <UserX size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Không tìm thấy MSSV nào trùng khớp giữa hai file.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold w-16">#</th>
                            <th className="p-4 font-semibold text-blue-700">MSSV (Trùng khớp)</th>
                            <th className="p-4 font-semibold">Họ và tên</th>
                            <th className="p-4 font-semibold">Ngành/Thông tin thêm</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {results.matched.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                                <td className="p-4 text-gray-400">{idx + 1}</td>
                                <td className="p-4 font-mono font-bold text-blue-600 text-lg">{student.id}</td>
                                <td className="p-4 font-medium">{student.fullName || <span className="text-gray-300 italic">Không có tên</span>}</td>
                                <td className="p-4 text-gray-500">{student.major || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-8">
                {loadingAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 animate-pulse">Đang phân tích dữ liệu...</p>
                    </div>
                ) : analysis ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Content Side */}
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <h3 className="text-purple-800 font-bold flex items-center gap-2 mb-3">
                                    <Sparkles size={18} />
                                    Nhận xét tổng quan
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-blue-800 font-bold mb-3">Gợi ý bài đăng Fanpage</h3>
                                <div className="bg-white p-4 rounded-lg shadow-sm text-gray-600 italic relative">
                                    <span className="absolute top-2 left-2 text-4xl text-gray-200 font-serif">"</span>
                                    <p className="px-4 py-2 whitespace-pre-line">{analysis.congratulationMessage}</p>
                                    <span className="absolute bottom-[-10px] right-4 text-4xl text-gray-200 font-serif">"</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Side */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-80">
                             <h3 className="text-gray-800 font-bold mb-4 text-center">Phân bố ngành học</h3>
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analysis.stats}>
                                    <XAxis dataKey="label" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                    <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                                        {analysis.stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="mb-4 text-gray-500">Nếu danh sách có thông tin ngành, AI có thể giúp bạn thống kê.</p>
                        <button onClick={handleAnalyze} className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition">
                            Bắt đầu phân tích
                        </button>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};