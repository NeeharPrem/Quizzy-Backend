import Questions from "../model/qestionModel.js";
import Quiz from "../model/quizModel.js";


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