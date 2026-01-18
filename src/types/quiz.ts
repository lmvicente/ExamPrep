export type FilterState = {
  categories: string[];
  topics: string[];
  limit: number;
};

export type HistoryRecord = {
  questionId: string;
  isCorrect: boolean;
  userSelection: string;
};