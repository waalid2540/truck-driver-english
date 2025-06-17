import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Settings, ClipboardCheck, MessageCircle, Calendar, Trophy } from "lucide-react";
import { api } from "@/lib/api";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["/api/user/1"],
    queryFn: () => api.getUser(1),
  });

  const { data: recentSessions } = useQuery({
    queryKey: ["/api/practice-sessions/user/1/recent"],
    queryFn: () => api.getRecentSessions(1, 2),
  });

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-truck-blue text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-medium">English Coach</h1>
              <p className="text-blue-100 text-sm">For Professional Drivers</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 dark:hover:bg-blue-600">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-truck-blue to-blue-600 text-white rounded-2xl p-6">
          <h2 className="text-xl font-medium mb-2">Welcome Back, {user?.name || 'Driver'}!</h2>
          <p className="text-blue-100 text-sm">Continue improving your English skills</p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{user?.practiceStreak || 0} day streak</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>{user?.totalSessions || 0} sessions</span>
            </div>
          </div>
        </div>

        {/* Practice Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Choose Your Practice</h3>
          
          {/* DOT Practice Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <ClipboardCheck className="text-truck-orange h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">DOT Practice English</h4>
                  <p className="text-gray-600 text-sm mb-3">Practice regulations, safety terms, and documentation</p>
                  <Link href="/dot-practice">
                    <Button className="bg-truck-orange hover:bg-orange-600 text-white">
                      Start Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversational Coach Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <MessageCircle className="text-truck-blue h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Conversational Coach</h4>
                  <p className="text-gray-600 text-sm mb-3">AI-powered conversations for real-world situations</p>
                  <Link href="/coach">
                    <Button className="bg-truck-blue hover:bg-blue-700 text-white">
                      Start Conversation
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Progress */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Recent Progress</h4>
            <div className="space-y-3">
              {recentSessions && recentSessions.length > 0 ? (
                recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.type === 'dot' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.type === 'dot' ? 'DOT Practice' : 'Conversation'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()}, {session.duration} min
                        </p>
                      </div>
                    </div>
                    {session.score && (
                      <div className="text-sm font-medium text-green-600">
                        {session.score}%
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No practice sessions yet.</p>
                  <p className="text-sm">Start your first practice session above!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
