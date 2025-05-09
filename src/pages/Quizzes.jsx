import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import DeleteIcon from "../assets/svg/deleteIcon.svg?react";
import Logo from "../assets/images/logo2.png";
import { v4 as uuidv4 } from "uuid";

const Quizzes = () => {
  // State management
  const [quizList, setQuizList] = useState([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({ name: "", email: "" });
  
  // Quiz creation states
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    category: "General",
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  // Firestore references
  const quizzesCollectionRef = collection(db, "quizzes");
  const usersCollectionRef = collection(db, "users");
  const gradesCollectionRef = collection(db, "grades");

  // Fetch user data, role and quizzes on component mount
  useEffect(() => {
    const fetchUserDataAndQuizzes = async () => {
      try {
        if (auth.currentUser) {
          // Fetch user data including role
          const userDoc = await getDoc(doc(usersCollectionRef, auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role); // "Educator" or "Employee"
            setUserData({
              name: data.name || "",
              email: data.email || auth.currentUser.email || ""
            });
          }
        }

        // Fetch quizzes
        const quizData = await getDocs(quizzesCollectionRef);
        setQuizList(quizData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchUserDataAndQuizzes();
  }, []);

  // Quiz taking functions
  const startQuiz = async (quizId) => {
    try {
      // Get 10 random questions from the pool
      const questionsRef = collection(db, "quizzes", quizId, "questions");
      const snapshot = await getDocs(questionsRef);
      const allQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 10);
      
      setQuizQuestions(selectedQuestions);
      setCurrentQuiz(quizList.find(q => q.id === quizId));
      setShowQuizModal(true);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScore(null);
    } catch (error) {
      console.error("Error starting quiz:", error);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [quizQuestions[currentQuestionIndex].id]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    // Calculate score
    const correctAnswers = quizQuestions.reduce((count, question) => {
      return count + (userAnswers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    
    const quizScore = {
      correct: correctAnswers,
      total: quizQuestions.length,
      percentage: Math.round((correctAnswers / quizQuestions.length) * 100)
    };
    
    setScore(quizScore);

    // Save to grades collection
    try {
      await addDoc(gradesCollectionRef, {
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        employeeId: auth.currentUser.uid,
        employeeName: userData.name,
        employeeEmail: userData.email,
        score: quizScore.percentage,
        correctAnswers: quizScore.correct,
        totalQuestions: quizScore.total,
        submittedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving grade:", error);
    }
  };

  // Quiz creation functions
  const addQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(opt => !opt)) {
      alert("Please fill all question fields and select correct answer");
      return;
    }

    setQuestions([...questions, currentQuestion]);

    // Reset for next question
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  const createQuiz = async () => {
    if (questions.length < 10) {
      alert("Please add at least 10 questions");
      return;
    }

    try {
      const quizRef = doc(quizzesCollectionRef);
      const quizId = quizRef.id;
      
      await setDoc(quizRef, {
        ...quizForm,
        quizId,
        userId: auth.currentUser.uid,
        status: "Published",
        quizType: "Multiple Choice",
        createdAt: new Date().toISOString(),
        numQuestions: questions.length,
      });

      // Add questions to subcollection
      const questionsCollectionRef = collection(db, "quizzes", quizId, "questions");
      for (const [index, question] of questions.entries()) {
        await addDoc(questionsCollectionRef, {
          ...question,
          quizId,
          order: index + 1,
          createdAt: new Date().toISOString(),
        });
      }

      // Refresh quiz list and reset form
      const quizData = await getDocs(quizzesCollectionRef);
      setQuizList(quizData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteDoc(doc(quizzesCollectionRef, quizId));
        setQuizList(quizList.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const resetForm = () => {
    setQuizForm({
      title: "",
      description: "",
      difficulty: "Medium",
      category: "General",
    });
    setQuestions([]);
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  // Loading state
  if (userRole === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <img src={Logo} alt="Company Logo" className="h-12" />
        <h1 className="text-2xl font-bold">
          {userRole === "Educator" ? "Manage Quizzes" : "Available Quizzes"}
        </h1>
        {userRole === "Educator" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Quiz
          </button>
        )}
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizList.map((quiz) => (
          <div key={quiz.id} className="border rounded-lg overflow-hidden shadow-md">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-lg">{quiz.title}</h3>
              <p className="text-sm text-gray-600">{quiz.description}</p>
              <div className="mt-2 flex justify-between text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {quiz.difficulty}
                </span>
                <span>{quiz.numQuestions} questions</span>
              </div>
            </div>
            <div className="p-4 flex justify-end">
              {userRole === "Employee" ? (
                <button
                  onClick={() => startQuiz(quiz.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Quiz
                </button>
              ) : (
                <button
                  onClick={() => deleteQuiz(quiz.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Quiz
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Taking Modal */}
      {showQuizModal && currentQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-bold text-lg">{currentQuiz.title}</h3>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </p>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              {score ? (
                <div className="text-center">
                  <h4 className="text-xl font-bold mb-2">Quiz Results</h4>
                  <div className={`text-4xl font-bold mb-4 ${
                    score.percentage >= 70 ? "text-green-600" : 
                    score.percentage >= 50 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {score.percentage}%
                  </div>
                  <p className="mb-4">
                    {userData.name}, you scored {score.correct} out of {score.total} questions correctly
                  </p>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-medium mb-4">
                    {quizQuestions[currentQuestionIndex]?.text}
                  </p>
                  
                  <div className="space-y-2">
                    {quizQuestions[currentQuestionIndex]?.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left p-3 rounded border ${
                          userAnswers[quizQuestions[currentQuestionIndex].id] === idx
                            ? "bg-blue-100 border-blue-500"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!score && (
              <div className="p-4 border-t flex justify-between">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    disabled={!userAnswers[quizQuestions[currentQuestionIndex].id]}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submitQuiz}
                    disabled={!userAnswers[quizQuestions[currentQuestionIndex].id]}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Creation Modal */}
      {showCreateModal && userRole === "Educator" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-bold text-lg">Create New Quiz</h3>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Quiz Title*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={2}
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Category</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={quizForm.category}
                      onChange={(e) => setQuizForm({...quizForm, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Difficulty</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={quizForm.difficulty}
                      onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Add Questions ({questions.length})</h4>

                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block font-medium mb-1">Question Text*</label>
                      <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        value={currentQuestion.text}
                        onChange={(e) => setCurrentQuestion({
                          ...currentQuestion,
                          text: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-medium">Options*</label>
                      {currentQuestion.options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === idx}
                            onChange={() => setCurrentQuestion({
                              ...currentQuestion,
                              correctAnswer: idx
                            })}
                          />
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[idx] = e.target.value;
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: newOptions
                              });
                            }}
                            placeholder={`Option ${idx + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={!currentQuestion.text || currentQuestion.options.some(opt => !opt)}
                    >
                      Add Question
                    </button>
                  </div>

                  {questions.length > 0 && (
                    <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                      <h5 className="font-medium mb-2">Added Questions:</h5>
                      <ul className="space-y-1">
                        {questions.map((q, i) => (
                          <li key={i} className="flex justify-between items-center p-1 hover:bg-gray-50">
                            <span className="truncate">{i + 1}. {q.text}</span>
                            <button
                              onClick={() => setQuestions(questions.filter((_, index) => index !== i))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={createQuiz}
                disabled={questions.length < 10}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {questions.length < 10 ? `Add ${10 - questions.length} more questions` : "Publish Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;