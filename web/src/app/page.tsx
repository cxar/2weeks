import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Brain, Clock, Target } from "lucide-react"

const features = [  {
    icon: Brain,
    title: "AI-Generated Path",
    description: "Custom learning roadmaps crafted for your specific goals"
  },
  {
    icon: Clock,
    title: "Two Week Timeline",
    description: "Clear daily objectives to keep you focused and on track"
  },
  {
    icon: Target,
    title: "Any Topic",
    description: "From programming to painting, master the fundamentals"
  }
]

export default function Home() {
  const ActionButton = () => {
    return (
      <>
        <SignedIn>
          <Link href="/create">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 transition-all duration-300 hover:scale-105"
            >
              Start Learning
            </Button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignUpButton mode="modal">
            <Button 
              size="lg" 
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Button>
          </SignUpButton>
        </SignedOut>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="min-h-[80vh] flex flex-col items-center justify-center gap-16">
            <div className="space-y-8 text-center">
              <h1 className="text-6xl font-bold tracking-tight sm:text-7xl mx-auto max-w-[800px]">
                Learn anything in{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  two weeks
                </span>
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-500 text-xl">
                Intelligent learning paths to help you master new skills efficiently.
              </p>
              <ActionButton />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-100">
          <div className="container mx-auto max-w-[1200px] px-4 py-32">
            <div className="grid gap-12 md:grid-cols-3">
              {features.map((feature) => (
                <Card 
                  key={feature.title} 
                  className="bg-white/50 backdrop-blur-sm border-black/5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-500/20"
                >
                  <CardHeader>
                    <feature.icon className="h-8 w-8 text-blue-600" />
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-500">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100">
        <div className="container mx-auto max-w-[1200px] px-4 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} 2weeks
        </div>
      </footer>
    </div>
  );
}