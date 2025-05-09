import { useState, useEffect } from "react"
import { db, auth } from "../config/firebase"
import Sidebar from "../components/Sidebar"
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import DeleteIcon from "../assets/svg/deleteIcon.svg?react"
import EditIcon from "../assets/svg/editIcon.svg?react"
import Logo from "../assets/images/logo2.png"
import { Link, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

const Quizzes = () => {
  const navigate = useNavigate()

  const [quizList, setQuizList] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showAddQuizModal, setShowAddQuizModal] = useState(false)

  const [newQuizTitle, setNewQuizTitle] = useState("")
  const [newNumQuestions, setNewNumQuestions] = useState("")
  const [newDifficulty, setNewDifficulty] = useState("Medium")
  const [newCategory, setNewCategory] = useState("General")

  const [updatedDifficulty, setUpdatedDifficulty] = useState("")
  const [updatedNumQuestions, setUpdatedNumQuestions] = useState("")
  const [updatedTitle, setUpdatedTitle] = useState("")

  const quizzesCollectionRef = collection(db, "quizzes")

  const getQuizList = async () => {
    try {
      const data = await getDocs(quizzesCollectionRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      setQuizList(filteredData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getQuizList()
  }, [])

  const onSubmitQuiz = async () => {
    if (!newQuizTitle || !newNumQuestions) {
      alert("Please fill in all fields")
      return
    }

    try {
      await addDoc(quizzesCollectionRef, {
        title: newQuizTitle,
        numQuestions: newNumQuestions,
        difficulty: newDifficulty,
        category: newCategory,
        userId: auth?.currentUser?.uid,
        quizId: uuidv4(),
        status: "Draft",
        quizType: "Multiple Choice",
        createdAt: new Date().toISOString()
      })
      getQuizList()
      setNewQuizTitle("")
      setNewNumQuestions("")
      setShowAddQuizModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteQuiz = async (id) => {
    const quizDoc = doc(db, "quizzes", id)
    await deleteDoc(quizDoc)
    getQuizList()
  }

  const updateQuiz = async (id) => {
    const quizDoc = doc(db, "quizzes", id)
    await updateDoc(quizDoc, {
      difficulty: updatedDifficulty,
      numQuestions: updatedNumQuestions,
      title: updatedTitle,
    })
    getQuizList()
    setSelectedQuiz(null)
  }

  return (
    <>
      <div className="logo mt-3 mb-6">
        <img src={Logo} alt="Your Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              onClick={() => setShowAddQuizModal(true)}
            >
              + Add Quiz
            </button>
          </div>

          {/* Add Quiz Modal */}
          {showAddQuizModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Quiz Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                      placeholder="Enter quiz title"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Number of Questions</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={newNumQuestions}
                      onChange={(e) => setNewNumQuestions(e.target.value)}
                      placeholder="Enter number of questions"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Difficulty</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowAddQuizModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={onSubmitQuiz}
                  >
                    Create Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizList.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="bg-blue-200 p-3 font-semibold text-lg flex justify-between items-center">
                  <span>{quiz.title || "Untitled Quiz"}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/quiz/${quiz.quizId}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Start Quiz
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="hover:bg-red-100 p-1 rounded"
                    >
                      <DeleteIcon width={20} height={20} />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedQuiz(
                          quiz.id === selectedQuiz ? null : quiz.id
                        )
                      }
                      className="hover:bg-blue-100 p-1 rounded"
                    >
                      <EditIcon width={20} height={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Quiz Type</span>
                      <span>{quiz.quizType || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Number of Questions:</span>
                      <span>{quiz.numQuestions || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Difficulty Level:</span>
                      <span>{quiz.difficulty || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Quiz ID:</span>
                      <span>{quiz.quizId || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Category:</span>
                      <span>{quiz.category || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b pb-1">
                      <span className="font-medium">Status:</span>
                      <span>{quiz.status || "N/A"}</span>
                    </div>
                  </div>

                  {selectedQuiz === quiz.id && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h3 className="font-medium mb-2">Edit Quiz</h3>
                      <div className="space-y-2">
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="New Title"
                          onChange={(e) => setUpdatedTitle(e.target.value)}
                        />
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="New Number of Questions"
                          onChange={(e) =>
                            setUpdatedNumQuestions(e.target.value)
                          }
                        />
                        <input
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="New Difficulty"
                          onChange={(e) => setUpdatedDifficulty(e.target.value)}
                        />
                        <button
                          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => updateQuiz(quiz.id)}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Quizzes