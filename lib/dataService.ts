// データサービス - makerとmany_maker間のデータ共有
export interface SchoolDataInput {
  schoolId: string;
  attendanceRate?: number;
  gradeAverages?: { grade: string; average: number }[];
  monthlyStats?: { month: string; attendance: number; tests: number; events: number }[];
  teacherDistribution?: { subject: string; count: number }[];
  emotionStats?: { emotion: string; percentage: number; trend: 'up' | 'down' | 'stable' }[];
  dailyEmotionData?: { 
    date: string; 
    joy: number; 
    sadness: number; 
    anger: number; 
    anxiety: number; 
    fatigue: number; 
    concentration: number; 
    confusion: number 
  }[];
  lastUpdated?: string;
}

// ローカルストレージキー
const STORAGE_KEY = 'school_data_input';

// データの保存
export const saveSchoolData = (schoolId: string, data: Partial<SchoolDataInput>): void => {
  try {
    const existingData = getSchoolData(schoolId);
    const updatedData: SchoolDataInput = {
      ...existingData,
      ...data,
      schoolId,
      lastUpdated: new Date().toISOString()
    };
    
    const allData = getAllSchoolData();
    allData[schoolId] = updatedData;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('データ保存エラー:', error);
  }
};

// 特定の学校データの取得
export const getSchoolData = (schoolId: string): SchoolDataInput => {
  try {
    const allData = getAllSchoolData();
    return allData[schoolId] || {
      schoolId,
      attendanceRate: 95,
      gradeAverages: [],
      monthlyStats: [],
      teacherDistribution: [],
      emotionStats: [],
      dailyEmotionData: []
    };
  } catch (error) {
    console.error('データ取得エラー:', error);
    return { schoolId };
  }
};

// すべての学校データの取得
export const getAllSchoolData = (): Record<string, SchoolDataInput> => {
  try {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('データ取得エラー:', error);
    return {};
  }
};

// データの削除
export const removeSchoolData = (schoolId: string): void => {
  try {
    const allData = getAllSchoolData();
    delete allData[schoolId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('データ削除エラー:', error);
  }
};

// 出席率の更新
export const updateAttendanceRate = (schoolId: string, rate: number): void => {
  saveSchoolData(schoolId, { attendanceRate: rate });
};

// 感情データの更新
export const updateEmotionData = (
  schoolId: string, 
  emotionStats: { emotion: string; percentage: number; trend: 'up' | 'down' | 'stable' }[]
): void => {
  saveSchoolData(schoolId, { emotionStats });
};

// 日別感情データの追加
export const addDailyEmotionData = (
  schoolId: string,
  emotionData: { 
    date: string; 
    joy: number; 
    sadness: number; 
    anger: number; 
    anxiety: number; 
    fatigue: number; 
    concentration: number; 
    confusion: number 
  }
): void => {
  const existingData = getSchoolData(schoolId);
  const dailyData = existingData.dailyEmotionData || [];
  
  // 同じ日付のデータがあれば更新、なければ追加
  const existingIndex = dailyData.findIndex(d => d.date === emotionData.date);
  if (existingIndex >= 0) {
    dailyData[existingIndex] = emotionData;
  } else {
    dailyData.push(emotionData);
    // 最新7日分のみ保持
    if (dailyData.length > 7) {
      dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      dailyData.splice(0, dailyData.length - 7);
    }
  }
  
  saveSchoolData(schoolId, { dailyEmotionData: dailyData });
};

// 学年別成績の更新
export const updateGradeAverages = (
  schoolId: string,
  gradeAverages: { grade: string; average: number }[]
): void => {
  saveSchoolData(schoolId, { gradeAverages });
};

// 月別統計の更新
export const updateMonthlyStats = (
  schoolId: string,
  monthlyStats: { month: string; attendance: number; tests: number; events: number }[]
): void => {
  saveSchoolData(schoolId, { monthlyStats });
};

// 教員配置の更新
export const updateTeacherDistribution = (
  schoolId: string,
  teacherDistribution: { subject: string; count: number }[]
): void => {
  saveSchoolData(schoolId, { teacherDistribution });
};

// データのエクスポート
export const exportSchoolData = (schoolId: string): string => {
  const data = getSchoolData(schoolId);
  return JSON.stringify(data, null, 2);
};

// データのインポート
export const importSchoolData = (schoolId: string, jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    saveSchoolData(schoolId, data);
    return true;
  } catch (error) {
    console.error('データインポートエラー:', error);
    return false;
  }
};