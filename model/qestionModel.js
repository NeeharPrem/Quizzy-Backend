import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    options: [{
        text: {
            type: String,
            required: true
        }
    }],
    isCorrect: [
        {
            text: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }
    ]
});
const Questions = mongoose.model('Questions',QuestionSchema);
export default Questions;