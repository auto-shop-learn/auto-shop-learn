import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
  collection, getDocs, doc, getDoc,
  addDoc, setDoc, deleteDoc, updateDoc,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import DeleteIcon from "../assets/svg/deleteIcon.svg?react";
import Logo from "../assets/images/logo2.png";

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
  const [userData, setUserData] = useState({ 
    name: "", 
    email: "", 
    department: "" 
  });
  
  // Quiz creation states
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    category: "General",
    passingScore: 70,
    status: "Draft"
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
  const quizAttemptsCollectionRef = collection(db, "quizAttempts");
  const certificatesCollectionRef = collection(db, "certificates");
  const userProgressCollectionRef = collection(db, "userProgress");

  // Fetch user data and quizzes
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(usersCollectionRef, auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserData({
              name: data.displayName || "",
              email: data.email || "",
              department: data.department || ""
            });
          }
        }

        const q = userRole === "Educator" 
          ? quizzesCollectionRef 
          : query(quizzesCollectionRef, where("status", "==", "Published"));
        
        const quizSnapshot = await getDocs(q);
        setQuizList(quizSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userRole]);

  // Quiz taking functions
  const startQuiz = async (quizId) => {
    try {
      const questionsRef = collection(db, "quizzes", quizId, "questions");
      const snapshot = await getDocs(questionsRef);
      const allQuestions = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Select 10 random questions
      const selectedQuestions = [...allQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
      
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
    setUserAnswers(prev => ({
      ...prev,
      [quizQuestions[currentQuestionIndex].id]: optionIndex
    }));
  };

  const submitQuiz = async () => {
    // Calculate score
    const correctAnswers = quizQuestions.reduce((count, question) => {
      return count + (userAnswers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    
    const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
    const passed = percentage >= currentQuiz.passingScore;
    
    setScore({ 
      correct: correctAnswers, 
      total: quizQuestions.length, 
      percentage, 
      passed 
    });

    // Save attempt data
    const attemptData = {
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      userId: auth.currentUser.uid,
      userName: userData.name,
      userEmail: userData.email,
      score: percentage,
      correctAnswers,
      totalQuestions: quizQuestions.length,
      passed,
      answers: quizQuestions.map(q => ({
        questionId: q.id,
        selected: userAnswers[q.id],
        correct: userAnswers[q.id] === q.correctAnswer
      })),
      submittedAt: serverTimestamp()
    };

    try {
      // Save attempt
      await addDoc(quizAttemptsCollectionRef, attemptData);
      
      // Update user progress
      await updateUserProgress(currentQuiz.id, percentage, passed);
      
      // Generate certificate if passed
      if (passed) {
        await generateCertificate(currentQuiz.id, percentage);
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const updateUserProgress = async (quizId, score, passed) => {
    try {
      const progressRef = doc(userProgressCollectionRef, auth.currentUser.uid);
      const progressSnap = await getDoc(progressRef);
      
      const newProgress = {
        userId: auth.currentUser.uid,
        userName: userData.name,
        department: userData.department,
        lastUpdated: serverTimestamp(),
        completedQuizzes: [
          ...(progressSnap.exists() ? progressSnap.data().completedQuizzes : []),
          { 
            quizId, 
            score, 
            passed, 
            date: serverTimestamp() 
          }
        ]
      };
      
      await setDoc(progressRef, newProgress, { merge: true });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const generateCertificate = async (quizId, score) => {
    try {
      const certData = {
        certificateId: `cert-${uuidv4()}`,
        userId: auth.currentUser.uid,
        userName: userData.name,
        userDepartment: userData.department,
        quizId,
        quizTitle: currentQuiz.title,
        score,
        issueDate: serverTimestamp(),
        educatorId: currentQuiz.createdBy,
        status: "issued",
        verificationCode: `AUTO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };
      
      await addDoc(certificatesCollectionRef, certData);
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  // Quiz creation functions (Educator only)
  const addQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(opt => !opt)) {
      alert("Please fill all question fields");
      return;
    }

    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  const createQuiz = async () => {
    if (questions.length < 10) {
      alert("Minimum 10 questions required");
      return;
    }

    try {
      // Create quiz document
      const quizRef = doc(quizzesCollectionRef);
      await setDoc(quizRef, {
        ...quizForm,
        quizId: quizRef.id,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        numQuestions: questions.length,
      });

      // Add questions to subcollection
      const questionsBatch = questions.map((q, i) => {
        const qRef = doc(collection(db, "quizzes", quizRef.id, "questions"));
        return setDoc(qRef, {
          ...q,
          order: i + 1,
          createdAt: serverTimestamp()
        });
      });
      await Promise.all(questionsBatch);

      // Refresh quiz list
      const quizData = await getDocs(quizzesCollectionRef);
      setQuizList(quizData.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })));
      
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
      passingScore: 70,
      status: "Draft"
    });
    setQuestions([]);
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  if (userRole === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <img src={Logo} alt="Company Logo" className="h-12" />
        <h1 className="text-2xl font-bold">
          {userRole === "Educator" ? "Quiz Management" : "Available Quizzes"}
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
                <span className={`px-2 py-1 rounded ${
                  quiz.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                  quiz.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {quiz.difficulty}
                </span>
                <span>{quiz.numQuestions} questions</span>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2">
              {userRole === "Employee" ? (
                <button
                  onClick={() => startQuiz(quiz.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Quiz
                </button>
              ) : (
                <>
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {quiz.status}
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete Quiz"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                </>
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
              {!score && (
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </p>
              )}
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              {score ? (
                <div className="text-center space-y-4">
                  <h4 className="text-xl font-bold">Quiz Results</h4>
                  <div className={`text-4xl font-bold ${
                    score.passed ? "text-green-600" : "text-red-600"
                  }`}>
                    {score.percentage}% {score.passed ? "✓" : "✗"}
                  </div>
                  <p>
                    You answered {score.correct} of {score.total} questions correctly
                  </p>
                  {score.passed && (
                    <p className="text-green-600 font-medium">
                      Certificate has been awarded!
                    </p>
                  )}
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                      <div 
                        key={idx}
                        className={`p-3 rounded border cursor-pointer flex items-center ${
                          userAnswers[quizQuestions[currentQuestionIndex].id] === idx
                            ? "bg-blue-100 border-blue-500"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        <input
                          type="radio"
                          name={`quiz-question-${currentQuestionIndex}`}
                          checked={userAnswers[quizQuestions[currentQuestionIndex].id] === idx}
                          readOnly
                          className="mr-2 h-4 w-4"
                        />
                        <span>{String.fromCharCode(65 + idx)}. {option}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!score && (
              <div className="p-4 border-t flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Create New Quiz</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Quiz Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Title*</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Category*</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={quizForm.category}
                      onChange={(e) => setQuizForm({...quizForm, category: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Difficulty*</label>
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
                  <div>
                    <label className="block font-medium mb-1">Passing Score*</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full p-2 border rounded"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({
                        ...quizForm, 
                        passingScore: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Status*</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={quizForm.status}
                      onChange={(e) => setQuizForm({
                        ...quizForm, 
                        status: e.target.value
                      })}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-lg mb-4">
                  Questions ({questions.length})
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    {questions.length < 10 ? 
                      `(Minimum ${10 - questions.length} more needed)` : 
                      "Ready to publish"}
                  </span>
                </h4>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Question Text*</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={3}
                      value={currentQuestion.text}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        text: e.target.value
                      })}
                      required
                    />
                  </div>

                  <div className="space-y-2 mb-4">
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
                          className="h-4 w-4"
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
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!currentQuestion.text || currentQuestion.options.some(opt => !opt)}
                  >
                    Add Question
                  </button>
                </div>

                {questions.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 font-medium">Added Questions</div>
                    <ul className="divide-y">
                      {questions.map((q, i) => (
                        <li key={i} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                          <div>
                            <span className="font-medium">{i + 1}.</span> {q.text}
                            <div className="text-sm text-gray-600 mt-1">
                              Correct: {String.fromCharCode(65 + q.correctAnswer)}
                            </div>
                          </div>
                          <button
                            onClick={() => setQuestions(questions.filter((_, index) => index !== i))}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove question"
                          >
                            <DeleteIcon className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                {questions.length < 10 ? 
                  `Add ${10 - questions.length} more questions` : 
                  "Publish Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;