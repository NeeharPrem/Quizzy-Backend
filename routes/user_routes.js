import express from 'express';
import { addQuiz, allQuizzes, getQuiz,createUser,loginUser,report} from "../controllers/user_controller.js";
const router = express.Router();

router.post('/addquiz', addQuiz);
router.get('/allquizzes',allQuizzes);
router.get('/getquiz/:id',getQuiz);
router.post('/signup',createUser);
router.post('/signin',loginUser);
router.post('/report',report)

export default router; 