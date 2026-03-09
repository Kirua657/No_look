// src/app/teacher/class/data.ts

export type StudentComment = {
  id: string;
  word: string;
  detail: string;
  emotion: { [key: string]: number }; // 感情統計データ
};

export const classData: StudentComment[] = [
  { id: 'ID-001', word: 'ありがとう', detail: '感謝の意を表すポジティブなコメント。特定の課題に対する感謝か、友人への感謝かを確認したい。', emotion: { joy: 0.85, neutral: 0.1, confusion: 0.05 } },
  { id: 'ID-001', word: '難しかった', detail: '問題の難易度が高かったという表明。どの部分が難しかったのか、具体的なフィードバックが必要です。', emotion: { sadness: 0.6, confusion: 0.2, neutral: 0.2 } },
  { id: 'ID-003', word: '楽しい', detail: '学習活動への積極的な参加と楽しさの表明。', emotion: { joy: 0.9, excitement: 0.1, neutral: 0.0 } },
  { id: 'ID-002', word: '疲れた', detail: '学習による疲労の蓄積。休憩や学習量の調整を検討する必要がある。', emotion: { tiredness: 0.8, sadness: 0.1, neutral: 0.1 } },
  { id: 'ID-004', word: '覚えた', detail: '新しい知識やスキルを習得したという前向きな報告。', emotion: { joy: 0.7, satisfaction: 0.2, neutral: 0.1 } },
  { id: 'ID-006', word: '単調だった', detail: '活動の単調さによる集中力の低下の可能性。活動にバリエーションを加えるべき。', emotion: { boredom: 0.8, neutral: 0.2 } },
];
