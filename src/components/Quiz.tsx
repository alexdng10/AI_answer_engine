import { useState } from 'react';
import { QuizQuestion } from '@/data/cs3319questions';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

interface QuizProps {
  questions: QuizQuestion[];
  onExit: () => void;
}

export default function Quiz({ questions, onExit }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set<number>());

  const handleAnswer = (optionIndex: number) => {
    if (answeredQuestions.has(currentQuestion)) return;
    
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswered = answeredQuestions.has(currentQuestion);
  const currentQuestionData = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-gray-400">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="text-gray-400">
          Score: {score}/{answeredQuestions.size}
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
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
        
        {isLastQuestion && hasAnswered && (
          <button
            onClick={onExit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
}
