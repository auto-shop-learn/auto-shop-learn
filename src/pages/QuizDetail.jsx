import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        // 1. Fetch quiz document
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          throw new Error('Quiz not found');
        }

        setQuiz(quizSnap.data());

        // 2. Fetch questions subcollection
        const questionsRef = collection(db, 'quizzes', quizId, 'questions');
        const questionsSnap = await getDocs(questionsRef);
        const questionsData = questionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort questions by order
        questionsData.sort((a, b) => a.order - b.order);
        setQuestions(questionsData);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Quiz data not available
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Quizzes
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
        <p className="text-gray-600 mb-4">{quiz.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Difficulty:</span> {quiz.difficulty}
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Questions:</span> {quiz.numQuestions}
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="font-medium">Category:</span> {quiz.category}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Questions ({questions.length})</h2>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 font-medium rounded-full h-8 w-8 flex items-center justify-center mr-3">
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-3">{question.text}</h3>

                <div className="space-y-2">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-3 rounded border ${
                        question.correctAnswer === key
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`inline-block h-5 w-5 rounded-full mr-2 flex-shrink-0 ${
                            question.correctAnswer === key
                              ? 'bg-green-500 text-white flex items-center justify-center'
                              : 'bg-gray-200'
                          }`}
                        >
                          {question.correctAnswer === key && (
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={
                            question.correctAnswer === key
                              ? 'font-medium text-gray-800'
                              : 'text-gray-700'
                          }
                        >
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDetail;