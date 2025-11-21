export interface Student {
  id: string; // MSSV
  fullName: string;
  major?: string; // Ngành học
  source?: 'club' | 'school';
  raw: Record<string, string>;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING_CLUB = 'UPLOADING_CLUB',
  UPLOADING_SCHOOL = 'UPLOADING_SCHOOL',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
}

export interface MatchResult {
  matched: Student[];
  notGraduated: Student[];
  notFoundInSchoolFile: Student[];
  totalClubMembers: number;
  totalSchoolGraduates: number;
}

export interface AnalysisResult {
  summary: string;
  congratulationMessage: string;
  stats: {
    label: string;
    value: number;
  }[];
}