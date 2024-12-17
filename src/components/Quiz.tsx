import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/data/cs3319questions';
import { FiCheck, FiX, FiArrowRight, FiFilter, FiBook, FiAward, FiRefreshCw } from 'react-icons/fi';

interface QuizProps {
  questions: QuizQuestion[];
  onExit: () => void;
}

type QuizMode = 'practice' | 'exam';
type QuizFilter = {
  categories: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
  years: string[];
};

export default function Quiz({ questions, onExit }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set<number>());
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<QuizFilter>({
    categories: [],
    difficulties: [],
    years: []
  });
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);

  // Extract unique values for filters
  const allCategories = [...new Set(questions.map(q => q.category))];
  const allDifficulties = [...new Set(questions.map(q => q.difficulty))];
  const allYears = [...new Set(questions.map(q => q.year).filter(Boolean))] as string[];

  useEffect(() => {
    const filtered = questions.filter(q => {
      const categoryMatch = filters.categories.length === 0 || filters.categories.includes(q.category);
      const difficultyMatch = filters.difficulties.length === 0 || filters.difficulties.includes(q.difficulty);
      const yearMatch = filters.years.length === 0 || (q.year && filters.years.includes(q.year));
      return categoryMatch && difficultyMatch && yearMatch;
    });
    setFilteredQuestions(filtered);
    shuffleQuestions(filtered);
  }, [filters, questions]);

  const shuffleQuestions = (questions: QuizQuestion[]) => {
    const order = Array.from({ length: questions.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setQuestionOrder(order);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnsweredQuestions(new Set());
    setScore(0);
  };

  const handleAnswer = (optionIndex: number) => {
    if (answeredQuestions.has(currentQuestion)) return;
    
    setSelectedAnswer(optionIndex);
    if (quizMode === 'practice') {
      setShowExplanation(true);
    }
    
    if (optionIndex === filteredQuestions[questionOrder[currentQuestion]].correctAnswer) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
  };

  const nextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    shuffleQuestions(filteredQuestions);
  };

  const toggleFilter = (type: keyof QuizFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const currentQuestionData = filteredQuestions[questionOrder[currentQuestion]];
  const isLastQuestion = currentQuestion === filteredQuestions.length - 1;
  const hasAnswered = answeredQuestions.has(currentQuestion);
  const isCorrect = selectedAnswer === currentQuestionData?.correctAnswer;

  if (!currentQuestionData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-300">No questions match your filters</p>
          <button
            onClick={() => setFilters({ categories: [], difficulties: [], years: [] })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Quiz Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
  {/* Change this div to handle wrapping better */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <button
          onClick={() => setQuizMode(quizMode === 'practice' ? 'exam' : 'practice')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            quizMode === 'practice'
              ? 'bg-green-600/20 text-green-200 border border-green-500/30'
              : 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
          }`}
        >
          <FiBook />
          <span>{quizMode === 'practice' ? 'Practice Mode' : 'Exam Mode'}</span>
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 text-gray-200 rounded-lg hover:bg-gray-700"
        >
          <FiFilter />
          <span>Filters</span>
        </button>
        <button
          onClick={resetQuiz}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 text-gray-200 rounded-lg hover:bg-gray-700"
        >
          <FiRefreshCw />
          <span>Reset</span>
        </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-gray-400">
            Question {currentQuestion + 1} of {filteredQuestions.length}
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <FiAward className="text-yellow-500" />
            <span>Score: {score}/{answeredQuestions.size}</span>
            <span className="text-gray-500">
              ({((score / Math.max(answeredQuestions.size, 1)) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 space-y-4">
          <div className="space-y-2">
            <h3 className="text-gray-300 font-medium">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter('categories', category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.categories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-gray-300 font-medium">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {allDifficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => toggleFilter('difficulties', difficulty)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.difficulties.includes(difficulty)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
          {allYears.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-gray-300 font-medium">Years</h3>
              <div className="flex flex-wrap gap-2">
                {allYears.map(year => (
                  <button
                    key={year}
                    onClick={() => toggleFilter('years', year)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.years.includes(year)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            currentQuestionData.difficulty === 'easy'
              ? 'bg-green-600/20 text-green-200 border border-green-500/30'
              : currentQuestionData.difficulty === 'medium'
              ? 'bg-yellow-600/20 text-yellow-200 border border-yellow-500/30'
              : 'bg-red-600/20 text-red-200 border border-red-500/30'
          }`}>
            {currentQuestionData.difficulty}
          </span>
          {currentQuestionData.year && (
            <span className="text-sm text-gray-400">
              Year: {currentQuestionData.year}
            </span>
          )}
        </div>
        
        <h2 className="text-xl text-gray-100 mb-6">{currentQuestionData.question}</h2>
        
        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={hasAnswered}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                hasAnswered
                  ? index === currentQuestionData.correctAnswer
                    ? 'bg-green-600/20 border-green-500/50 text-green-200'
                    : index === selectedAnswer
                    ? 'bg-red-600/20 border-red-500/50 text-red-200'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {hasAnswered && index === currentQuestionData.correctAnswer && (
                  <FiCheck className="text-green-500" />
                )}
                {hasAnswered && index === selectedAnswer && index !== currentQuestionData.correctAnswer && (
                  <FiX className="text-red-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && currentQuestionData.explanation && (
        <div className={`p-4 rounded-lg ${
          isCorrect ? 'bg-green-600/10 border border-green-500/20' : 'bg-red-600/10 border border-red-500/20'
        }`}>
          <p className="text-gray-200">{currentQuestionData.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onExit}
          className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
        >
          Exit Quiz
        </button>
        
        {hasAnswered && !isLastQuestion && (
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>Next Question</span>
            <FiArrowRight />
          </button>
        )}
        
        {(isLastQuestion && hasAnswered) && (
          <button
            onClick={resetQuiz}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FiRefreshCw />
            <span>Start New Quiz</span>
          </button>
        )}
      </div>
    </div>
  );
}
