import { QuestionRow } from "@/lib/csv";

export const getUniqueValues = (data: QuestionRow[], key: keyof QuestionRow): string[] => {
  return Array.from(new Set(data.map((item) => String(item[key])))).sort();
};