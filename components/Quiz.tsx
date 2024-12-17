import { useState } from 'react';
import { questions } from '../src/data/cs3319questions';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  year?: string;
}

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowAnswer(false);
      setSelectedAnswer('');
      setIsAnswered(false);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowExplanation(false);
  };

  const percentage = Math.round((score / (currentQuestion + 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Question {currentQuestion + 1} of {questions.length}</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                Score: {score}/{currentQuestion + 1} ({percentage}%)
              </span>
              {questions[currentQuestion].difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  questions[currentQuestion].difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  questions[currentQuestion].difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {questions[currentQuestion].difficulty}
                </span>
              )}
            </div>
            <p className="text-lg text-gray-700">{questions[currentQuestion].question}</p>
          </div>

          <div className="space-y-4 mb-8">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={`w-full p-4 text-left rounded-lg transition-colors duration-200 ${
                  !isAnswered ? 'hover:bg-blue-50 border border-gray-200' :
                  option === questions[currentQuestion].correctAnswer ? 'bg-green-100 border border-green-500' :
                  option === selectedAnswer ? 'bg-red-100 border border-red-500' :
                  'border border-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {showAnswer && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg ${
                selectedAnswer === questions[currentQuestion].correctAnswer
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedAnswer === questions[currentQuestion].correctAnswer
                  ? '✓ Correct!'
                  : `✗ Incorrect. The correct answer is: ${questions[currentQuestion].correctAnswer}`}
              </div>
              {questions[currentQuestion].explanation && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                  </button>
                  {showExplanation && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700">
                      {questions[currentQuestion].explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Reset Quiz
            </button>
            {isAnswered && currentQuestion < questions.length - 1 && (
              <button
                onClick={nextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        </div>

        {questions[currentQuestion].category && (
          <div className="text-sm text-gray-500 mt-4">
            Category: {questions[currentQuestion].category}
            {questions[currentQuestion].year && ` • Year: ${questions[currentQuestion].year}`}
          </div>
        )}
      </div>
    </div>
  );
}
