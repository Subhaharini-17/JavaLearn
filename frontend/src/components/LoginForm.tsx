// // src/app/auth/page.tsx

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { Eye, EyeOff, User, Lock, Sparkles, Code, Terminal, Rocket, ChevronRight, Play, Sun, Moon, Mail, BookOpen } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
// import { apiClient } from "@/lib/api";

// // ====================================================================
// // FloatingParticles Component (Background Effect)
// // ====================================================================
// const FloatingParticles = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Set canvas size
//     const resizeCanvas = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };

//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);

//     // Particle system
//     const particles: Array<{
//       x: number;
//       y: number;
//       size: number;
//       speedX: number;
//       speedY: number;
//       opacity: number;
//     }> = [];

//     // Create particles
//     for (let i = 0; i < 80; i++) {
//       particles.push({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         size: Math.random() * 3 + 1,
//         speedX: (Math.random() - 0.5) * 0.5,
//         speedY: (Math.random() - 0.5) * 0.5,
//         opacity: Math.random() * 0.5 + 0.1
//       });
//     }

//     // Animation loop
//     const animate = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       // Update and draw particles
//       particles.forEach(particle => {
//         particle.x += particle.speedX;
//         particle.y += particle.speedY;

//         // Wrap around edges
//         if (particle.x > canvas.width) particle.x = 0;
//         if (particle.x < 0) particle.x = canvas.width;
//         if (particle.y > canvas.height) particle.y = 0;
//         if (particle.y < 0) particle.y = canvas.height;

//         // Draw particle
//         ctx.beginPath();
//         ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
//         ctx.fill();
//       });

//       requestAnimationFrame(animate);
//     };

//     animate();

//     return () => {
//       window.removeEventListener('resize', resizeCanvas);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="absolute inset-0 pointer-events-none"
//       style={{ background: 'transparent' }}
//     />
//   );
// };

// // ====================================================================
// // Code Preview (Simulates an IDE)
// // ====================================================================
// const CodePreview = () => {
//   const codeSnippet = `
// public class FutureBuilder {
//   public static void main(String[] args) {
//     String lang = "Java";
//     for (int i = 0; i < 3; i++) {
//       System.out.println("Coding in " + lang + "...");
//     }
//   }
// }
//   `;
//   return (
//     <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/50">
//         <div className="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">
//             <div className="flex space-x-2">
//                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//             </div>
//             <span className="text-xs text-slate-400 font-mono">FutureBuilder.java</span>
//             <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 flex items-center space-x-1">
//                 <Play className="h-3 w-3" />
//                 <span>Run</span>
//             </Button>
//         </div>
//         <pre className="p-4 text-sm font-mono overflow-x-auto">
//             {codeSnippet.split('\n').slice(1, -1).map((line, index) => (
//                 <div key={index} className="flex space-x-4">
//                     <span className="text-slate-600 w-4 text-right">{index + 1}</span>
//                     <span className="flex-1">
//                         {line.split(' ').map((word, wIndex) => {
//                             if (['public', 'class', 'static', 'void', 'String', 'for', 'int'].includes(word)) {
//                                 return <span key={wIndex} className="text-purple-400">{word} </span>;
//                             }
//                             if (['System.out.println'].includes(word.replace(/[;()]/g, ''))) {
//                                 return <span key={wIndex} className="text-cyan-400">{word} </span>;
//                             }
//                             if (word.startsWith('"') && word.endsWith('"')) {
//                                 return <span key={wIndex} className="text-yellow-400">{word} </span>;
//                             }
//                             return <span key={wIndex} className="text-white">{word} </span>;
//                         })}
//                     </span>
//                 </div>
//             ))}
//         </pre>
//         <div className="p-3 bg-slate-800 border-t border-slate-700 text-sm text-green-400 font-mono">
//             &gt; Output: Coding in Java...
//         </div>
//     </div>
//   );
// };

// // ====================================================================
// // Marketing Content Component for Java Learning
// // ====================================================================
// const MarketingContent = () => (
//     <div className="max-w-xl space-y-8 p-4">
//         {/* Animated Code Snippet */}
//         <CodePreview />
        
//         <div className="space-y-4">
//             {/* Primary Headline */}
//             <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tighter">
//                 <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
//                     Code. Create. Career.
//                 </span>
//                 <br />
//                 <span className="text-white">Learn Java the Right Way.</span>
//             </h1>
            
//             {/* Sub-headline / Slogan */}
//             <p className="text-xl md:text-2xl text-slate-300 font-light">
//                 The Global Platform for Java Mastery. <br className="hidden sm:inline" />
//                 Access tools used by millions of developers, all in one place.
//             </p>
//         </div>
        
//         {/* Call to Action */}
//         <div className="pt-6">
//             <Button className="text-lg px-8 py-6 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold shadow-lg shadow-yellow-500/30">
//                 <BookOpen className="h-5 w-5 mr-3" /> Start Free Course Today
//             </Button>
//         </div>
//     </div>
// );


// // ====================================================================
// // Sign Up Form Component
// // ====================================================================
// interface SignUpFormProps {
//     onSuccess: (data: any) => void;
// }

// const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
//     const [name, setName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSignUp = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError("");
//         setLoading(true);

//         // Basic client-side validation
//         if (!name || !email || !password) {
//             setError("All fields are required.");
//             setLoading(false);
//             return;
//         }

//         try {
//             const data = await apiClient.register({ name, email, password }); 

//             if (data.success) {
//                 // Auto-login success: server returns token/user
//                 onSuccess(data); 
//             } else {
//                 // Display server error message
//                 setError(data.msg || "Sign up failed");
//             }
//         } catch (err: any) {
//             console.error("❌ Sign Up error:", err);
//             // Catch network or unhandled errors
//             setError(err.message || "Server error. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     return (
//         <form onSubmit={handleSignUp} className="space-y-5">
//             {error && (
//                 <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg backdrop-blur-sm">
//                     {error}
//                 </div>
//             )}
            
//             {/* Name Input */}
//             <div className="space-y-3">
//                 <label htmlFor="name" className="text-sm font-medium text-slate-300">
//                     Full Name
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
//                     <div className="relative">
//                         <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                             id="name"
//                             type="text"
//                             placeholder="Your name"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-red-400/50 transition-colors"
//                             required
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Email Input */}
//             <div className="space-y-3">
//                 <label htmlFor="reg-email" className="text-sm font-medium text-slate-300">
//                     Email Address
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
//                     <div className="relative">
//                         <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                             id="reg-email"
//                             type="email"
//                             placeholder="Enter a valid email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-red-400/50 transition-colors"
//                             required
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Password Input */}
//             <div className="space-y-3">
//                 <label htmlFor="reg-password" className="text-sm font-medium text-slate-300">
//                     Password
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
//                     <div className="relative">
//                         <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                             id="reg-password"
//                             type={showPassword ? "text" : "password"}
//                             placeholder="Create a strong password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="pl-10 pr-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-red-400/50 transition-colors"
//                             required
//                         />
//                         <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
//                         >
//                             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Sign Up Button */}
//             <Button 
//                 type="submit" 
//                 className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-semibold py-2.5 transition-all duration-300 shadow-lg hover:shadow-red-500/25 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={loading}
//             >
//                 {loading ? (
//                     <div className="flex items-center justify-center space-x-2">
//                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                         <span>Registering...</span>
//                     </div>
//                 ) : (
//                     <span className="flex items-center justify-center space-x-2">
//                         <Rocket className="h-4 w-4" />
//                         <span>Start Coding Now</span>
//                     </span>
//                 )}
//             </Button>
//         </form>
//     );
// }

// // ====================================================================
// // Login Form Component
// // ====================================================================
// interface LoginFormProps {
//     onSuccess: (data: any) => void;
// }

// const LoginForm = ({ onSuccess }: LoginFormProps) => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//      const router = useRouter();
//     // const handleLogin = async (e: React.FormEvent) => {
//     //     e.preventDefault();
//     //     setError("");
//     //     setLoading(true);
        

//     //     try {
//     //         const data = await apiClient.login(email, password);
//     //         console.log("✅ Login API response:", data);
       
//     //         if (data.token && data.user) {
//     //             onSuccess(data);
//     //         } else {
//     //             setError(data.msg || "Login failed");
//     //         }
//     //     } catch (err: any) {
//     //         console.error("❌ Login error:", err);
//     //         setError(err.message || "Server error. Please try again.");
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };
//     const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       console.log("🔄 Starting login process...");
//       const data = await apiClient.login(email, password);
//       console.log("✅ Login API response:", data);

//       if (data.token && data.user) {
//         // Save to localStorage
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));
        
//         console.log("💾 Saved to localStorage:", {
//           token: data.token,
//           user: data.user
//         });

//         // Force a storage event to trigger layout re-render
//         window.dispatchEvent(new Event('storage'));
        
//         // Small delay to ensure state updates
//         setTimeout(() => {
//           console.log("🚀 Redirecting to dashboard...");
//           if (data.user.role === "admin") {
//             router.replace("/admin/dashboard");
//           } else {
//             router.replace("/student/dashboard");
//           }
//         }, 50);
//       } else {
//         setError(data.msg || "Login failed");
//       }
//     } catch (err: any) {
//       console.error("❌ Login error:", err);
//       setError(err.message || "Server error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//     return (
//         <form onSubmit={handleLogin} className="space-y-5">
//             {error && (
//                 <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg backdrop-blur-sm">
//                     {error}
//                 </div>
//             )}
            
//             {/* Email Input */}
//             <div className="space-y-3">
//                 <label htmlFor="email" className="text-sm font-medium text-slate-300">
//                     Email Address
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
//                     <div className="relative">
//                         <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                             id="email"
//                             type="email"
//                             placeholder="Enter your email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50 transition-colors"
//                             required
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Password Input */}
//             <div className="space-y-3">
//                 <label htmlFor="password" className="text-sm font-medium text-slate-300">
//                     Password
//                 </label>
//                 <div className="relative group">
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
//                     <div className="relative">
//                         <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//                         <Input
//                             id="password"
//                             type={showPassword ? "text" : "password"}
//                             placeholder="Enter your password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="pl-10 pr-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50 transition-colors"
//                             required
//                         />
//                         <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
//                         >
//                             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Sign In Button */}
//             <Button 
//                 type="submit" 
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={loading}
//             >
//                 {loading ? (
//                     <div className="flex items-center justify-center space-x-2">
//                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                         <span>Signing in...</span>
//                     </div>
//                 ) : (
//                     <span className="flex items-center justify-center space-x-2">
//                         <Code className="h-4 w-4" />
//                         <span>Sign In</span>
//                     </span>
//                 )}
//             </Button>
//         </form>
//     );
// }

// // ====================================================================
// // Main AuthPage Component
// // ====================================================================
// export default function AuthPage() {
//     const router = useRouter();
//     const [activeTab, setActiveTab] = useState("login");

//     const handleAuthSuccess = (data: any) => {
//         // Save token and user object to localStorage
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));
        
//         console.log("💾 Saved to localStorage and redirecting...");

//         // Force a storage event to trigger layout re-render
//         window.dispatchEvent(new Event('storage'));
        
//         // Redirect based on user role
//         setTimeout(() => {
//             if (data.user.role === "admin") {
//                 router.replace("/admin/dashboard");
//             } else {
//                 router.replace("/student/dashboard");
//             }
//         }, 50);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden p-4">
//             {/* Background Elements */}
//             <FloatingParticles />
            
//             <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
//             <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
//             {/* Two-Column Layout Container */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl w-full relative z-10 p-4">
                
//                 {/* LEFT COLUMN: Marketing Content */}
//                 <div className="hidden lg:block">
//                     <MarketingContent />
//                 </div>

//                 {/* RIGHT COLUMN: Auth Forms */}
//                 <Card className="w-full max-w-md mx-auto shadow-2xl border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
//                     <CardHeader className="space-y-1 text-center pb-6">
//                         <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg relative overflow-hidden">
//                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine"></div>
//                             <Terminal className="h-8 w-8 text-white" />
//                         </div>
                        
//                         <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
//                             {activeTab === 'login' ? 'Code Your Future' : 'Join the Dev Community'}
//                         </CardTitle>
//                         <CardDescription className="text-slate-400">
//                             {activeTab === 'login' ? 'Sign in to your account to resume your journey.' : 'Create an account in seconds and start learning Java.'}
//                         </CardDescription>
//                     </CardHeader>
                    
//                     <CardContent className="space-y-6">
//                         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                             {/* Tab List */}
//                             <TabsList className="grid w-full grid-cols-2 bg-slate-800/70 border border-slate-700/50 mb-6">
//                                 <TabsTrigger 
//                                     value="login" 
//                                     className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold transition-all duration-200"
//                                 >
//                                     <Code className="h-4 w-4 mr-2" /> Login
//                                 </TabsTrigger>
//                                 <TabsTrigger 
//                                     value="register" 
//                                     className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white font-semibold transition-all duration-200"
//                                 >
//                                     <Sparkles className="h-4 w-4 mr-2" /> Sign Up
//                                 </TabsTrigger>
//                             </TabsList>
                            
//                             {/* Login Content */}
//                             <TabsContent value="login">
//                                 <LoginForm onSuccess={handleAuthSuccess} />
//                             </TabsContent>
                            
//                             {/* Sign Up Content (Fixed for auto-login) */}
//                             <TabsContent value="register">
//                                 <SignUpForm onSuccess={handleAuthSuccess} /> 
//                             </TabsContent>
//                         </Tabs>
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Footer */}
//             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-500 text-sm">
//                 Secure Dev Platform • v2.1
//             </div>
//         </div>
//     );
// }

// src/app/auth/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock, Sparkles, Code, Terminal, Rocket, ChevronRight, Play, Sun, Moon, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { apiClient } from "@/lib/api";

// ====================================================================
// FloatingParticles Component (Background Effect)
// ====================================================================
const FloatingParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

// ====================================================================
// Code Preview (Simulates an IDE)
// ====================================================================
const CodePreview = () => {
  const codeSnippet = `
public class FutureBuilder {
  public static void main(String[] args) {
    String lang = "Java";
    for (int i = 0; i < 3; i++) {
      System.out.println("Coding in " + lang + "...");
    }
  }
}
  `;
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/50">
        <div className="flex justify-between items-center p-3 bg-slate-800 border-b border-slate-700">
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-xs text-slate-400 font-mono">FutureBuilder.java</span>
            <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 flex items-center space-x-1">
                <Play className="h-3 w-3" />
                <span>Run</span>
            </Button>
        </div>
        <pre className="p-4 text-sm font-mono overflow-x-auto">
            {codeSnippet.split('\n').slice(1, -1).map((line, index) => (
                <div key={index} className="flex space-x-4">
                    <span className="text-slate-600 w-4 text-right">{index + 1}</span>
                    <span className="flex-1">
                        {line.split(' ').map((word, wIndex) => {
                            if (['public', 'class', 'static', 'void', 'String', 'for', 'int'].includes(word)) {
                                return <span key={wIndex} className="text-purple-400">{word} </span>;
                            }
                            if (['System.out.println'].includes(word.replace(/[;()]/g, ''))) {
                                return <span key={wIndex} className="text-cyan-400">{word} </span>;
                            }
                            if (word.startsWith('"') && word.endsWith('"')) {
                                return <span key={wIndex} className="text-yellow-400">{word} </span>;
                            }
                            return <span key={wIndex} className="text-white">{word} </span>;
                        })}
                    </span>
                </div>
            ))}
        </pre>
        <div className="p-3 bg-slate-800 border-t border-slate-700 text-sm text-green-400 font-mono">
            &gt; Output: Coding in Java...
        </div>
    </div>
  );
};

// ====================================================================
// Marketing Content Component for Java Learning
// ====================================================================
const MarketingContent = () => (
    <div className="max-w-xl space-y-8 p-4">
        {/* Animated Code Snippet */}
        <CodePreview />
        
        <div className="space-y-4">
            {/* Primary Headline */}
            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tighter">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Code. Create. Career.
                </span>
                <br />
                <span className="text-white">Learn Java the Right Way.</span>
            </h1>
            
            {/* Sub-headline / Slogan */}
            <p className="text-xl md:text-2xl text-slate-300 font-light">
                The Global Platform for Java Mastery. <br className="hidden sm:inline" />
                Access tools used by millions of developers, all in one place.
            </p>
        </div>
        
        {/* Call to Action */}
        <div className="pt-6">
            <Button className="text-lg px-8 py-6 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold shadow-lg shadow-yellow-500/30">
                <BookOpen className="h-5 w-5 mr-3" /> Start Free Course Today
            </Button>
        </div>
    </div>
);

// ====================================================================
// Sign Up Form Component
// ====================================================================
interface SignUpFormProps {
    onSuccess: (data: any) => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Basic client-side validation
        if (!name || !email || !password) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        try {
            const data = await apiClient.register({ name, email, password }); 

            if (data.success) {
                // Auto-login success: server returns token/user
                onSuccess(data); 
            } else {
                // Display server error message
                setError(data.msg || "Sign up failed");
            }
        } catch (err: any) {
            console.error("❌ Sign Up error:", err);
            // Catch network or unhandled errors
            setError(err.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
                <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg backdrop-blur-sm">
                    {error}
                </div>
            )}
            
            {/* Name Input */}
            <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">
                    Full Name
                </label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-red-400/50 transition-colors"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
                <label htmlFor="reg-email" className="text-sm font-medium text-slate-300">
                    Email Address
                </label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                        <Input
                            id="reg-email"
                            type="email"
                            placeholder="Enter a valid email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-red-400/50 transition-colors"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
                <label htmlFor="reg-password" className="text-sm font-medium text-slate-300">
                    Password
                </label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                        <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-red-400/50 transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sign Up Button */}
            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-semibold py-2.5 transition-all duration-300 shadow-lg hover:shadow-red-500/25 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Registering...</span>
                    </div>
                ) : (
                    <span className="flex items-center justify-center space-x-2">
                        <Rocket className="h-4 w-4" />
                        <span>Start Coding Now</span>
                    </span>
                )}
            </Button>
        </form>
    );
}

// ====================================================================
// Login Form Component (FIXED - No duplicate logic)
// ====================================================================
interface LoginFormProps {
    onSuccess: (data: any) => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("🔄 Starting login process...");
            const data = await apiClient.login(email, password);
            console.log("✅ Login API response:", data);

            if (data.token && data.user) {
                // Just call onSuccess - let the parent handle the rest
                onSuccess(data);
            } else {
                setError(data.msg || "Login failed");
            }
        } catch (err: any) {
            console.error("❌ Login error:", err);
            setError(err.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-5">
            {error && (
                <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg backdrop-blur-sm">
                    {error}
                </div>
            )}
            
            {/* Email Input */}
            <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                    Email Address
                </label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50 transition-colors"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Password
                </label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400/50 transition-colors"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sign In Button */}
            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Signing in...</span>
                    </div>
                ) : (
                    <span className="flex items-center justify-center space-x-2">
                        <Code className="h-4 w-4" />
                        <span>Sign In</span>
                    </span>
                )}
            </Button>
        </form>
    );
}

// ====================================================================
// Main AuthPage Component
// ====================================================================
export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("login");

    const handleAuthSuccess = (data: any) => {
        // Save token and user object to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("💾 Saved to localStorage and redirecting...");

        // Force a storage event to trigger layout re-render
        window.dispatchEvent(new Event('storage'));
        
        // Redirect based on user role
        setTimeout(() => {
            if (data.user.role === "admin") {
                router.replace("/admin/dashboard");
            } else {
                router.replace("/student/dashboard");
            }
        }, 50);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden p-4">
            {/* Background Elements */}
            <FloatingParticles />
            
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Two-Column Layout Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl w-full relative z-10 p-4">
                
                {/* LEFT COLUMN: Marketing Content */}
                <div className="hidden lg:block">
                    <MarketingContent />
                </div>

                {/* RIGHT COLUMN: Auth Forms */}
                <Card className="w-full max-w-md mx-auto shadow-2xl border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine"></div>
                            <Terminal className="h-8 w-8 text-white" />
                        </div>
                        
                        <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            {activeTab === 'login' ? 'Code Your Future' : 'Join the Dev Community'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {activeTab === 'login' ? 'Sign in to your account to resume your journey.' : 'Create an account in seconds and start learning Java.'}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            {/* Tab List */}
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800/70 border border-slate-700/50 mb-6">
                                <TabsTrigger 
                                    value="login" 
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold transition-all duration-200"
                                >
                                    <Code className="h-4 w-4 mr-2" /> Login
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="register" 
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white font-semibold transition-all duration-200"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" /> Sign Up
                                </TabsTrigger>
                            </TabsList>
                            
                            {/* Login Content */}
                            <TabsContent value="login">
                                <LoginForm onSuccess={handleAuthSuccess} />
                            </TabsContent>
                            
                            {/* Sign Up Content */}
                            <TabsContent value="register">
                                <SignUpForm onSuccess={handleAuthSuccess} /> 
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-500 text-sm">
                Secure Dev Platform • v2.1
            </div>
        </div>
    );
}