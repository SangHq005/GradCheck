import React, { useState, useCallback } from 'react';
import { AppState, Student, MatchResult } from './types';
import { parseCSV } from './utils/csvParser';
import { Steps } from './components/Steps';
import { UploadZone } from './components/UploadZone';
import { ResultsView } from './components/ResultsView';
import { GraduationCap, ArrowRight, SearchCheck } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [clubMembers, setClubMembers] = useState<Student[]>([]);
  const [schoolGraduates, setSchoolGraduates] = useState<Student[]>([]);
  const [results, setResults] = useState<MatchResult | null>(null);
  
  // Store file names for UI feedback
  const [clubFileName, setClubFileName] = useState<string>("");
  const [schoolFileName, setSchoolFileName] = useState<string>("");

  const handleClubUpload = useCallback((content: string, fileName: string) => {
    // Source 'club' here represents the "List to Check" (Subset)
    const students = parseCSV(content, 'club');
    setClubMembers(students);
    setClubFileName(fileName);
    setAppState(AppState.UPLOADING_SCHOOL);
  }, []);

  const handleSchoolUpload = useCallback((content: string, fileName: string) => {
    // Source 'school' here represents the "Master List" (Superset)
    const students = parseCSV(content, 'school');
    setSchoolGraduates(students);
    setSchoolFileName(fileName);
    // Automatically process after second upload
    setAppState(AppState.PROCESSING);
    
    // Simulate a small delay for UX processing feel
    setTimeout(() => {
      processMatching(clubMembers, students);
    }, 800);
  }, [clubMembers]);

  const processMatching = (subsetList: Student[], masterList: Student[]) => {
    // Create a Set of normalized IDs from the master list for O(1) lookup
    const masterIds = new Set(masterList.map(s => s.id.trim().toLowerCase()));
    
    const matched: Student[] = [];
    const notFound: Student[] = [];

    subsetList.forEach(member => {
        const memberId = member.id.trim().toLowerCase();
        
        if (masterIds.has(memberId)) {
            // Find detailed info in master list if available
            const masterData = masterList.find(s => s.id.trim().toLowerCase() === memberId);
            
            // Merge data: Prefer master list data (it usually has the official status/major), 
            // but fallback to subset list name if master list has no name.
            const mergedStudent: Student = {
                id: member.id, // Keep original ID format from input
                fullName: masterData?.fullName || member.fullName || "",
                major: masterData?.major || member.major,
                source: 'club',
                raw: { ...member.raw, ...masterData?.raw }
            };
            matched.push(mergedStudent);
        } else {
            notFound.push(member);
        }
    });

    setResults({
        matched: matched,
        notGraduated: notFound, 
        notFoundInSchoolFile: notFound,
        totalClubMembers: subsetList.length,
        totalSchoolGraduates: masterList.length
    });
    
    setAppState(AppState.RESULTS);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setClubMembers([]);
    setSchoolGraduates([]);
    setResults(null);
    setClubFileName("");
    setSchoolFileName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <SearchCheck size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">GradCheck</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Công cụ so sánh danh sách MSSV nhanh chóng
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-8 px-4 pb-12">
        <Steps currentStep={appState} />

        {appState === AppState.IDLE && (
          <div className="text-center space-y-6 max-w-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800">Công cụ kiểm tra MSSV trùng khớp</h2>
            <p className="text-gray-600 text-lg">
              Bạn có 2 danh sách MSSV? Tải lên để tìm ra những MSSV xuất hiện trong cả 2 file.
            </p>
            <div className="flex justify-center">
                <button 
                    onClick={() => setAppState(AppState.UPLOADING_CLUB)}
                    className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all transform hover:-translate-y-1"
                >
                    Bắt đầu kiểm tra
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>
        )}

        {appState === AppState.UPLOADING_CLUB && (
          <UploadZone 
            title="Bước 1: Tải lên danh sách cần kiểm tra" 
            description="File chứa các MSSV bạn muốn check (ví dụ: DS thành viên CLB)"
            onFileSelect={handleClubUpload}
          />
        )}

        {appState === AppState.UPLOADING_SCHOOL && (
          <div className="w-full max-w-xl">
             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center justify-between">
                <span>Đã nhận: <strong>{clubFileName}</strong> ({clubMembers.length} dòng)</span>
             </div>
             <UploadZone 
                title="Bước 2: Tải lên danh sách gốc" 
                description="File chứa toàn bộ MSSV tổng (ví dụ: DS tốt nghiệp toàn trường)"
                onFileSelect={handleSchoolUpload}
             />
          </div>
        )}

        {appState === AppState.PROCESSING && (
           <div className="flex flex-col items-center justify-center py-20 space-y-6">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <SearchCheck className="absolute inset-0 m-auto text-blue-600" size={32} />
             </div>
             <p className="text-xl font-medium text-gray-700">Đang đối chiếu MSSV...</p>
             <p className="text-gray-500">Đang tìm điểm trùng giữa 2 danh sách.</p>
           </div>
        )}

        {appState === AppState.RESULTS && results && (
          <ResultsView results={results} onReset={handleReset} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} GradCheck.
        </div>
      </footer>
    </div>
  );
};

export default App;