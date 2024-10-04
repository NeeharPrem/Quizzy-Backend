import express from 'express'
import { allQuizzes, deleteQuiz, addQuiz, createAdmin, loginAdmin, logout, editQuiz,getQuiz} from "../controllers/admin_controller.js";
const router= express.Router()

router.get('/allQuizzes',allQuizzes)
router.post('/addquiz',addQuiz)
router.patch('/editquiz/:id', editQuiz)
router.delete('/deletequiz/:id',deleteQuiz)
router.post('/signup',createAdmin)
router.post('/login',loginAdmin)
router.post('/logout',logout)
router.get('/getquiz/:id',getQuiz)
export default router