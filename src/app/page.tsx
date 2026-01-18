import QuizApp from "@/components/QuizApp";
import { getQuestions } from "@/lib/csv";


export default function Home() {
  return (
    <QuizApp questions={getQuestions()}></QuizApp>
  );
}
