import Questions from "../model/qestionModel.js";
import Quiz from "../model/quizModel.js";
import Admin from "../model/adminModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const addQuiz = async (req, res) => {
    try {
        const { title, description, questions} = req.body;

        if (questions.length < 5) {
            return res.status(400).json({ message: 'At least 5 questions are needed' });
        }
        const newQuiz = new Quiz({
            title,
            description,
            createdBy: Admin,
            admin:true,
            questions: []
        });
        for (const q of questions) {
            const newQuestion = new Questions({
                quiz: newQuiz._id,
                text: q.question,
                createdBy: creater,
                options: q.options.map(option => ({
                    text: option,
                })),
                isCorrect: q.options.filter(option => q.correct === option).map(option => ({
                    text: option,
                    isCorrect: true
                }))
            });
            await newQuestion.save();
            newQuiz.questions.push(newQuestion._id);
        }
        await newQuiz.save();
        res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const allQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().select(['title', '_id', 'description']);
        res.status(200).json({ quizzes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        await Quiz.findByIdAndDelete(id); 
        await Questions.deleteMany({ quiz: id });
        res.status(200).json({ message: 'Quiz deleted succesfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const createAdmin = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password and confirmpassword do not match' });
        }
        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new Admin({
            name,
            email,
            password: hashedPass,
            is_admin: true,
        });
        await newUser.save();
        res.status(201).json({ message: 'Account created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const payload = {
            id:user._id,
            name:user.name
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' })
        res.cookie('adminJWT', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        const userData={
            id:user._id,
            name:user.name
        }
        res.status(200).json({ message: 'Login successful',userData});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req,res)=>{
    try {
        res.cookie("adminJWT", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json("Logged Out Successfully");
    } catch (error) {
        console.log(error)
    }
}

export const getQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await Quiz.findById(quizId)
            .populate('questions')
            .exec();
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json({ quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// export const editQuiz = async (req, res) => {
//     try {
//         const { title, description, questions } = req.body;
//         const quizId = req.params.id;

//         if (questions.length < 5) {
//             return res.status(400).json({ message: 'At least 5 questions are needed' });
//         }

//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: 'Quiz not found' });
//         }

//         quiz.title = title;
//         quiz.description = description;
//         quiz.questions = [];

//         for (const q of questions) {
//             if (!q.text) {
//                 return res.status(400).json({ message: 'Each question must have a text field.' });
//             }

//             let questionDoc;
//             if (q._id) {
//                 questionDoc = await Questions.findById(q._id);
//                 if (questionDoc) {
//                     questionDoc.text = q.text;
//                     questionDoc.options = q.options.map(option => ({
//                         text: option.text,
//                         _id: option._id
//                     }));
//                     if (q.isCorrect && q.isCorrect.length > 0) {
//                         questionDoc.isCorrect = q.isCorrect.map(correct => ({
//                             text: correct.text,
//                             isCorrect: true
//                         }));
//                     }
//                     await questionDoc.save();
//                 }
//             } else {
//                 questionDoc = new Questions({
//                     quiz: quiz._id,
//                     text: q.text,
//                     createdBy: quiz.createdBy,
//                     options: q.options.map(option => ({
//                         text: option.text
//                     })),
//                     isCorrect: (q.isCorrect && q.isCorrect.length > 0) ? q.isCorrect.map(correct => ({
//                         text: correct.text,
//                         isCorrect: true
//                     })) : [] 
//                 });
//                 await questionDoc.save();
//             }

//             if (questionDoc) {
//                 quiz.questions.push(questionDoc._id);
//             }
//         }

//         await quiz.save();

//         res.status(200).json({ message: 'Quiz updated successfully', quiz });
//     } catch (error) {
//         console.error('Error updating quiz:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
export const editQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const quizId = req.params.id;

        if (questions.length < 5) {
            return res.status(400).json({ message: 'At least 5 questions are needed' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        quiz.title = title;
        quiz.description = description;
        quiz.questions = [];

        for (const q of questions) {
            if (!q.text) {
                return res.status(400).json({ message: 'Each question must have a text field.' });
            }

            let questionDoc;
            if (q._id) {
                try {
                    questionDoc = await Questions.findById(q._id);
                    if (questionDoc) {
                        questionDoc.text = q.text;
                        questionDoc.options = q.options.map(option => ({
                            text: option.text,
                            _id: option._id,
                            isCorrect: q.isCorrect && q.isCorrect.some(correct => correct.text === option.text)
                        }));
                        questionDoc.isCorrect = q.isCorrect.map(correct => ({
                            text: correct.text,
                            isCorrect: true
                        }));
                        await questionDoc.save();
                    }
                } catch (error) {
                    if (error.name === 'VersionError') {
                        return res.status(409).json({ message: 'The quiz has been updated by another user. Please refresh and try again.' });
                    } else if (error.name === 'ValidationError') {
                        return res.status(400).json({ message: 'Validation error: ' + error.message });
                    }
                    throw error;
                }
            } else {
                questionDoc = new Questions({
                    quiz: quiz._id,
                    text: q.text,
                    createdBy: quiz.createdBy,
                    options: q.options.map(option => ({
                        text: option.text,
                        isCorrect: q.isCorrect && q.isCorrect.some(correct => correct.text === option.text)
                    })),
                    isCorrect: q.isCorrect.map(correct => ({
                        text: correct.text,
                        isCorrect: true
                    }))
                });
                await questionDoc.save();
            }

            if (questionDoc) {
                quiz.questions.push(questionDoc._id);
            }
        }

        await quiz.save();

        res.status(200).json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        console.error('Error updating quiz:', error);
        if (error.name === 'VersionError') {
            res.status(409).json({ message: 'The quiz has been updated by another user. Please refresh and try again.' });
        } else if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation error: ' + error.message });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};