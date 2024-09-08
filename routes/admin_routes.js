import express from 'express'
import { allQuizzes, deleteQuiz,addQuiz} from "../controllers/admin_controller.js";
const router= express.Router()

router.get('/allQuizzes',allQuizzes)
router.post('/addquiz',addQuiz)
router.delete('/deletequiz/:id',deleteQuiz)
export default router