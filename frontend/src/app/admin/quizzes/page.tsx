"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search, FileQuestion, X, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Quiz {
  _id: string;
  title: string;
  topic?: {
    _id: string;
    title: string;
  };
  questions: Array<{
    _id?: string;
    text: string;
    options: string[];
    answerIndex: number;
  }>;
  createdAt: string;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
}

interface QuestionForm {
  text: string;
  options: string[];
  answerIndex: number;
}

export default function QuizzesManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    topic: "",
    questions: [] as QuestionForm[]
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchQuizzes();
    fetchTopics();
  }, [router]);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/quizzes`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const quizzesData = await response.json();
        setQuizzes(quizzesData);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/topics`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const topicsData = await response.json();
        setTopics(topicsData);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: "",
      topic: "",
      questions: [{
        text: "",
        options: ["", "", "", ""],
        answerIndex: 0
      }]
    });
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      topic: quiz.topic?._id || "", // FIX: Added null check for topic
      questions: quiz.questions.map(q => ({
        text: q.text,
        options: [...q.options],
        answerIndex: q.answerIndex
      }))
    });
    setShowQuizModal(true);
  };

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          text: "",
          options: ["", "", "", ""],
          answerIndex: 0
        }
      ]
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!quizForm.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    if (!quizForm.topic) {
      alert("Please select a topic");
      return;
    }

    if (quizForm.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Validate each question
    for (const question of quizForm.questions) {
      if (!question.text.trim()) {
        alert("Please enter text for all questions");
        return;
      }
      if (question.options.some(opt => !opt.trim())) {
        alert("Please fill in all options for each question");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingQuiz 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/quizzes/${editingQuiz._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/quizzes`;
      
      const method = editingQuiz ? 'PUT' : 'POST';

      const payload = {
        ...quizForm,
        questions: quizForm.questions.map(q => ({
          text: q.text,
          options: q.options,
          answerIndex: q.answerIndex
        }))
      };

      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowQuizModal(false);
        fetchQuizzes();
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Error saving quiz");
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Error saving quiz");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchQuizzes();
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Error deleting quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Error deleting quiz");
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.topic?.title?.toLowerCase().includes(searchTerm.toLowerCase()); // FIX: Added optional chaining
    const matchesTopic = !selectedTopic || quiz.topic?._id === selectedTopic; // FIX: Added optional chaining
    return matchesSearch && matchesTopic;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Quiz Management</h1>
            <p className="text-gray-400">Create and manage quizzes for students</p>
          </div>
          <Button onClick={handleCreateQuiz} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 border-gray-600 text-white"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic._id} value={topic._id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quizzes</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-700">
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Topic</TableHead>
                  <TableHead className="text-gray-300">Questions</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz._id} className="border-gray-700 hover:bg-gray-700">
                    <TableCell className="font-medium text-white">{quiz.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-purple-600">
                        {quiz.topic?.title || 'No Topic'} {/* FIX: Added fallback */}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{quiz.questions.length}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => handleEditQuiz(quiz)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {editingQuiz ? 'Update quiz details and questions' : 'Create a new quiz with questions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitQuiz} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-300">Quiz Title</Label>
                      <Input
                        id="title"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                        placeholder="Enter quiz title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-gray-300">Topic</Label>
                      <Select 
                        value={quizForm.topic} 
                        onValueChange={(value) => setQuizForm({...quizForm, topic: value})}
                        required
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {topics.map(topic => (
                            <SelectItem key={topic._id} value={topic._id}>
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300 text-lg">Questions</Label>
                      <Button 
                        type="button" 
                        onClick={handleAddQuestion}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>
                    </div>

                    {quizForm.questions.map((question, qIndex) => (
                      <div key={qIndex} className="p-4 border border-gray-600 rounded-lg bg-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <Label className="text-gray-300">Question {qIndex + 1}</Label>
                          {quizForm.questions.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                              onClick={() => handleRemoveQuestion(qIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Textarea
                            placeholder="Enter question text..."
                            value={question.text}
                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                            className="bg-gray-600 border-gray-500 text-white min-h-[80px]"
                            required
                          />

                          <div className="space-y-2">
                            <Label className="text-gray-300">Options (select the correct answer)</Label>
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`question-${qIndex}`}
                                  checked={question.answerIndex === oIndex}
                                  onChange={() => handleQuestionChange(qIndex, 'answerIndex', oIndex)}
                                  className="text-purple-600 focus:ring-purple-500"
                                  required
                                />
                                <Input
                                  placeholder={`Option ${oIndex + 1}`}
                                  value={option}
                                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  className="bg-gray-600 border-gray-500 text-white"
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={quizForm.questions.length === 0}
                    >
                      {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowQuizModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}