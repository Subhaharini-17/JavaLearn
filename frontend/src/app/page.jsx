// 'use client';

// import { useState } from 'react';
// import { AppSidebar } from '@/components/AppSidebar';
// import { CompilerPlayground } from '@/components/CompilerPlayground';
// import { AppHeader } from '@/components/AppHeader';
// import { TutorialView } from '@/components/TutorialView';
// import { QuizView } from '@/components/QuizView';

// import { SidebarProvider } from '@/components/ui/sidebar';
// import { topics } from '@/lib/topics';

// export default function Home() {
//   // Application state - Removed TypeScript syntax from useState
//   const [currentView, setCurrentView] = useState('lessons');
//   const [activeTopic, setActiveTopic] = useState(topics[0]);
//   const [completedTopics, setCompletedTopics] = useState([]);
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Handle quiz completion
//   const handleQuizCompletion = () => {
//     const topicTitle = activeTopic.title;
//     if (!completedTopics.includes(topicTitle)) {
//       setCompletedTopics((prev) => [...prev, topicTitle]);
//     }
//   };

//   // Calculate progress percentage
//   const progress = (completedTopics.length / topics.length) * 100;

//   return (
//     <SidebarProvider>
//       <div className="flex h-screen overflow-hidden">
//         {/* Sidebar */}
//         <AppSidebar
//           activeTopic={activeTopic}
//           setActiveTopic={setActiveTopic}
//           completedTopics={completedTopics}
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//         />

//         {/* Main content area */}
//         <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out bg-muted/20">
//           {/* Header */}
//           <AppHeader
//             progress={progress}
//             currentView={currentView}
//             onNavigateToLessons={() => setCurrentView('lessons')}
//             onNavigateToCompiler={() => setCurrentView('compiler')}
//             onNavigateToChallenges={() => setCurrentView('challenges')}
//           />

//           {/* Main Content */}
//           <main className="flex justify-start flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
//             {currentView === 'lessons' && (
//               <div className="grid max-w-6xl gap-8">
//                 <TutorialView topic={activeTopic} />
//                 {/* Safe check for quiz existence */}
//                 {activeTopic.quiz && activeTopic.quiz.length > 0 && (
//                   <QuizView
//                     key={activeTopic.title}
//                     topic={activeTopic}
//                     onComplete={handleQuizCompletion}
//                     isCompleted={completedTopics.includes(activeTopic.title)}
//                   />
//                 )}
//               </div>
//             )}

//             {currentView === 'compiler' && <CompilerPlayground />}

//           </main>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}