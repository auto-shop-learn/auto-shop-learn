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
// import Logo from "../assets/svg/logo.svg"
import Logo from "../assets/images/logo2.png"
import { Link, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid" // Import to generate random quizId

const Quizzes = () => {
  const navigate = useNavigate()

  const [quizList, setQuizList] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const [newQuizTitle, setNewQuizTitle] = useState("")
  const [newNumQuestions, setNewNumQuestions] = useState("")

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
    try {
      await addDoc(quizzesCollectionRef, {
        title: newQuizTitle,
        numQuestions: newNumQuestions,
        userId: auth?.currentUser?.uid,
        quizId: uuidv4(),
        difficulty: "Medium",
        category: "General",
        status: "Draft",
        quizType: "Multiple Choice",
      })
      getQuizList()
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
              onClick={onSubmitQuiz}
            >
              + Add Quiz
            </button>
          </div>

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
