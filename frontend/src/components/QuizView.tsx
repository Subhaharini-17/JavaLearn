// Revised QuizView.tsx - Dark Theme UI
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, XCircle, RefreshCw, Award, Clock, Brain, Target } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface Topic {
    title: string;
    description: string;
    content: string;
    exampleCode: string;
    quiz: QuizQuestion[];
    compilerDefaultCode?: string;
}

interface QuizViewProps {
    topic: Topic;
    onComplete: (topicTitle: string) => void;
    isCompleted: boolean;
}

export function QuizView({ topic, onComplete, isCompleted }: QuizViewProps) {
    const [answers, setAnswers] = useState<(string | null)[]>(
        Array(topic.quiz?.length || 0).fill(null)
    );
    const [submitted, setSubmitted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        console.log('🎯 QuizView received topic:', topic);
        console.log('📊 Quiz questions:', topic.quiz);
    }, [topic]);

    const handleAnswerChange = (questionIndex: number, selectedOption: string) => {
        if (submitted) return;
        const newAnswers = [...answers];
        newAnswers[questionIndex] = selectedOption;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        const allCorrect = topic.quiz.every(
            (q, i) => answers[i] === q.correctAnswer
        );
        if (allCorrect) {
            onComplete(topic.title);
        }
    };

    const handleRetry = () => {
        setAnswers(Array(topic.quiz.length).fill(null));
        setSubmitted(false);
        setCurrentQuestion(0);
        setTimeSpent(0);
    }

    const allQuestionsAnswered = answers.every((answer) => answer !== null);
    const score = topic.quiz.reduce((acc, q, i) => {
        return acc + (answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- DARK THEME: No Quiz Available State ---
    if (!topic.quiz || topic.quiz.length === 0) {
        return (
            <Card className="bg-gray-800 border border-gray-700 shadow-2xl rounded-3xl">
                <CardHeader className="bg-gray-900 border-b border-gray-700">
                    <CardTitle className="text-2xl text-gray-50 flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-red-500" />
                        Quiz: {topic.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <Alert variant="destructive" className="border-red-600 bg-red-900/30">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <AlertTitle className="text-red-300">No Quiz Available</AlertTitle>
                        <AlertDescription className="text-red-400">
                            This quiz doesn't have any questions. Please contact the administrator.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // --- DARK THEME: Already Completed State ---
    if (isCompleted && !submitted) {
        return (
            <Card className="bg-gray-800 border border-gray-700 shadow-2xl rounded-3xl">
                <CardHeader className="bg-gray-900 border-b border-gray-700">
                    <CardTitle className="text-2xl text-gray-50 flex items-center gap-3">
                        <Award className="h-8 w-8 text-green-500" />
                        Quiz: {topic.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <Alert className="border-green-600 bg-green-900/30">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <AlertTitle className="text-green-300">Congratulations!</AlertTitle>
                        <AlertDescription className="text-green-400">
                            You have already passed this quiz with flying colors!
                        </AlertDescription>
                    </Alert>
                    <div className="mt-6 p-6 bg-green-900/40 rounded-2xl border border-green-600">
                        <div className="text-center">
                            <Award className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-green-300 mb-2">Quiz Mastered</h3>
                            <p className="text-green-400">You've demonstrated excellent understanding of this topic.</p>
                        </div>
                    </div>
                    <Button onClick={handleRetry} className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // --- DARK THEME: Main Quiz View ---
    return (
        <Card className="bg-gray-900 border border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2" />
            <CardHeader className="pb-6 bg-gray-800/50 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl text-gray-50 flex items-center gap-3">
                            <Brain className="h-8 w-8 text-purple-400" />
                            Quiz: {topic.title}
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-400 mt-2">
                            Test your knowledge to mark this topic as complete.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Dark Theme Badges */}
                        <Badge variant="secondary" className="bg-purple-900/40 text-purple-400 border border-purple-700/50 px-3 py-2">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(timeSpent)}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-900/40 text-blue-400 border border-blue-700/50 px-3 py-2">
                            <Target className="h-4 w-4 mr-1" />
                            {currentQuestion + 1}/{topic.quiz.length}
                        </Badge>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Progress</span>
                        <span>{Math.round(((currentQuestion + 1) / topic.quiz.length) * 100)}%</span>
                    </div>
                    <Progress 
                        value={((currentQuestion + 1) / topic.quiz.length) * 100} 
                        className="h-2 bg-gray-700 rounded-full"
                    />
                </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
                {/* Question Navigation */}
                {!submitted && (
                    <div className="flex gap-2 overflow-x-auto pb-4">
                        {topic.quiz.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-xl border-2 font-semibold transition-all duration-300",
                                    answers[index] 
                                        ? "bg-green-700 border-green-700 text-white shadow-lg" // Answered (Green in Dark)
                                        : currentQuestion === index
                                        ? "bg-purple-600 border-purple-600 text-white shadow-lg" // Current (Purple in Dark)
                                        : "bg-gray-800 border-gray-600 text-gray-400 hover:border-purple-500" // Default/Unanswered (Dark Base)
                                )}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Current Question */}
                {!submitted ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold text-gray-50 mb-4 flex items-center gap-3">
                                <span className="bg-blue-600 text-white rounded-xl w-8 h-8 flex items-center justify-center text-sm">
                                    {currentQuestion + 1}
                                </span>
                                {topic.quiz[currentQuestion].question}
                            </h3>
                            
                            <RadioGroup
                                value={answers[currentQuestion] || ''}
                                onValueChange={(value) => handleAnswerChange(currentQuestion, value)}
                                className="space-y-4"
                            >
                                {topic.quiz[currentQuestion].options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-3">
                                        <RadioGroupItem 
                                            value={option} 
                                            id={`q${currentQuestion}o${oIndex}`}
                                            className="h-5 w-5 text-blue-500 border-2 border-gray-500 data-[state=checked]:border-blue-500"
                                        />
                                        <Label
                                            htmlFor={`q${currentQuestion}o${oIndex}`}
                                            className={cn(
                                                "flex-1 p-4 rounded-xl border-2 border-gray-700 hover:border-blue-500 cursor-pointer transition-all duration-300 font-medium text-gray-300",
                                                answers[currentQuestion] === option && 'bg-blue-900/30 border-blue-500' // Highlight selected answer
                                            )}
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="rounded-xl border-2 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-blue-500 transition-all duration-300"
                            >
                                Previous
                            </Button>
                            
                            {currentQuestion < topic.quiz.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestion(prev => Math.min(topic.quiz.length - 1, prev + 1))}
                                    disabled={!answers[currentQuestion]}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-white"
                                >
                                    Next Question
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!allQuestionsAnswered}
                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-white"
                                >
                                    Submit Answers
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Results View */
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Dark Theme Alert Box */}
                        <Alert 
                            variant={score === topic.quiz.length ? "default" : "destructive"} 
                            className={cn(
                                "border-2 rounded-2xl",
                                score === topic.quiz.length 
                                    ? 'border-green-600 bg-green-900/30' 
                                    : 'border-red-600 bg-red-900/30'
                            )}
                        >
                            {score === topic.quiz.length ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <AlertTitle className={score === topic.quiz.length ? "text-green-300" : "text-red-300"}>
                                {score === topic.quiz.length ? "Quiz Passed! 🎉" : "Quiz Failed"}
                            </AlertTitle>
                            <AlertDescription className={score === topic.quiz.length ? "text-green-400" : "text-red-400"}>
                                You scored {score} out of {topic.quiz.length}.
                                {score < topic.quiz.length && " Please try again to mark the topic as complete."}
                            </AlertDescription>
                        </Alert>

                        {/* Score Visualization - Dark Theme */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-6 bg-green-900/40 rounded-2xl border border-green-700">
                                <div className="text-3xl font-bold text-green-400">{score}</div>
                                <div className="text-green-500 font-medium">Correct</div>
                            </div>
                            <div className="text-center p-6 bg-blue-900/40 rounded-2xl border border-blue-700">
                                <div className="text-3xl font-bold text-blue-400">{topic.quiz.length - score}</div>
                                <div className="text-blue-500 font-medium">Incorrect</div>
                            </div>
                            <div className="text-center p-6 bg-purple-900/40 rounded-2xl border border-purple-700">
                                <div className="text-3xl font-bold text-purple-400">{Math.round((score / topic.quiz.length) * 100)}%</div>
                                <div className="text-purple-500 font-medium">Score</div>
                            </div>
                        </div>

                        <Button onClick={handleRetry} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 text-white">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Quiz
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}