'use client';

import { useState, useMemo } from 'react';
import { QuestionRow } from '@/lib/csv';
import { getUniqueValues } from '@/lib/utils';
import { FilterState } from '@/types/quiz';
import { Dispatch, SetStateAction } from 'react';

interface FiltersProps {
  questions: QuestionRow[];
  onStartQuiz: (filters: FilterState) => void;
}

export default function Filters({ questions, onStartQuiz }: FiltersProps) {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [limit, setLimit] = useState<number>(0);

  // Get all Categories 
  const allCategories = useMemo(() => getUniqueValues(questions, 'Category'), [questions]);

  // Get Topics (Dynamic based on selected Categories)
  const availableTopics = useMemo(() => {
    if (selectedCats.length === 0) return getUniqueValues(questions, 'Topic');

    // Filter questions first, then grab topics
    const filtered = questions.filter(q => selectedCats.includes(q.Category));
    return getUniqueValues(filtered, 'Topic');
  }, [questions, selectedCats]);

  const toggle = (
    list: string[],
    setList: Dispatch<SetStateAction<string[]>>,
    value: string
  ) => {
    if (list.includes(value)) {
        setList(list.filter(item => item !== value));
    } else {
        setList([...list, value]);
    }
  }

  const handleStart = () => {
    onStartQuiz({
      categories: selectedCats,
      topics: selectedTopics,
      limit: limit
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Configure Quiz</h2>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 dark:text-gray-200">1. Categories</h3>
        <div className="flex flex-wrap gap-3">
          {allCategories.map((cat) => (
            <label key={cat as string} className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-600">
              <input 
                type="checkbox" 
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={selectedCats.includes(cat as string)}
                onChange={() => toggle(selectedCats, setSelectedCats, cat as string)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">{cat as string}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 dark:text-gray-200">2. Topics</h3>
        <p className="text-xs text-gray-500 mb-2">
            {selectedCats.length > 0 ? "Showing topics for selected categories." : "Showing all topics."}
        </p>
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
          {availableTopics.map((topic) => (
            <label key={topic as string} className="flex items-center gap-2 cursor-pointer px-2 py-1 border rounded hover:bg-blue-50 dark:hover:bg-blue-900 dark:border-gray-600">
               <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={selectedTopics.includes(topic as string)}
                onChange={() => toggle(selectedTopics, setSelectedTopics, topic as string)}
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">{topic as string}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Limit */}
      <div className="mb-8">
         <h3 className="font-semibold mb-3 dark:text-gray-200">3. Question Count</h3>
         <select 
            className="w-full p-3 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
         >
            <option value={0}>All Matching Questions</option>
            <option value={10}>10 Questions</option>
            <option value={20}>20 Questions</option>
            <option value={50}>50 Questions</option>
         </select>
      </div>

      <button 
        onClick={handleStart}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
      >
        Start Quiz
      </button>
    </div>
  );
}