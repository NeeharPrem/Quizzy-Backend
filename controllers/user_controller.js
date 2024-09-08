import Quiz from '../model/quizModel.js'
import Questions from '../model/qestionModel.js'
import bcrypt from 'bcrypt'

export const addQuiz = async (req, res) => {
    try {
        const { title, description, questions,creater} = req.body;

        if (questions.length < 5) {
            return res.status(400).json({ message: 'At least 5 questions are needed'});
        }
        const newQuiz = new Quiz({
            title,
            description,
            createdBy: creater,
            questions: []
        });
        for (const q of questions) {
            const newQuestion = new Questions({
                quiz: newQuiz._id,
                text: q.question,
                createdBy:creater,
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
        const quizzes = await Quiz.find().select(['title','_id','description']);
        res.status(200).json({ quizzes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await Quiz.findById(quizId, { title: 1, questions: 1, _id: 1 })
            .populate('questions', '-isCorrect')
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

export const createUser = async (req, res) => {
    try {
        const { name,email,password,confirmpassword} = req.body;
        if (password !== confirmpassword) {
            return res.status(400).json({ message: 'Password and confirmpassword do not match' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPass,
            is_admin: false,
        });
        await newUser.save();
        res.status(201).json({ message:'Account created'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message:'Internal server error'});
    }
};

export const loginUser = async (req, res) => {
    try {
        const {email,password} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message:'User not found'});
        }
        const validPassword = await bcrypt.compare(password,user.password);
        if (!validPassword) {
            return res.status(401).json({ message:'Invalid password'});
        }
        res.status(200).json({ message:'Login successful',user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message:'Internal server error'});
    }
};

export const report = async (req,res)=>{
    try {
        const {name, result,timetaken}= req.body
        const evaluatedResults = await Promise.all(
            result.map(async (res) => {
                const question = await Questions.findById(res.questionId);

                if (!question) {
                    return { questionId: res.questionId, isCorrect: false };
                }
                const isCorrect = res.answer.text === question.isCorrect[0].text;

                if(isCorrect){
                    return {
                        questionId: res.questionId,
                        question: question.text,
                        answer: res.answer.text,
                        isCorrect,
                    };
                }else{
                    return {
                        questionId: res.questionId,
                        question: question.text,
                        right: question.isCorrect[0].text,
                        answer: res.answer.text,
                        isCorrect,
                    };
                }
            })
        );
        res.status(200).json({ result: evaluatedResults })
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"})
    }
};