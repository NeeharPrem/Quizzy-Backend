import mongoose from 'mongoose'
const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    admin:{
        type:Boolean,
        default:false
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Questions'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Quiz = mongoose.model('Quiz', QuizSchema)
export default Quiz;