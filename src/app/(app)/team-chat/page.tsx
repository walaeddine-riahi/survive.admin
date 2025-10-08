"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, SendHorizonal, Paperclip, Smile, User, Users } from "lucide-react"

// Données d'exemple pour les équipes
const teams = [
  {
    id: "1",
    name: "Équipe Marketing",
    members: 12,
  },
  {
    id: "2",
    name: "Équipe Développement",
    members: 8,
  },
  {
    id: "3",
    name: "Équipe Design",
    members: 6,
  },
  {
    id: "4",
    name: "Équipe Support Client",
    members: 15,
  },
  {
    id: "5",
    name: "Équipe Ventes",
    members: 9,
  },
]

// Données d'exemple pour les membres d'équipe
const teamMembers = [
  {
    id: "1",
    name: "Emma Martin",
    email: "emma.martin@example.com",
    avatar: "/avatars/01.png",
    team: "Marketing",
    status: "online",
  },
  {
    id: "2",
    name: "Thomas Durant",
    email: "thomas.durant@example.com",
    avatar: "/avatars/02.png",
    team: "Développement",
    status: "online",
  },
  {
    id: "3",
    name: "Sophie Bernard",
    email: "sophie.bernard@example.com",
    avatar: "/avatars/03.png",
    team: "Design",
    status: "offline",
  },
  {
    id: "4",
    name: "Lucas Dupont",
    email: "lucas.dupont@example.com",
    avatar: "/avatars/04.png",
    team: "Support Client",
    status: "online",
  },
]

// Messages d'exemple
const messages = [
  {
    id: "1",
    sender: "Emma Martin",
    avatar: "/avatars/01.png",
    content: "Bonjour à tous ! Quelqu'un a-t-il travaillé sur la nouvelle campagne marketing ?",
    timestamp: "09:30",
    isCurrentUser: false,
  },
  {
    id: "2",
    sender: "Thomas Durant",
    avatar: "/avatars/02.png",
    content: "Oui, j'ai terminé la première ébauche. Je vous envoie ça tout de suite.",
    timestamp: "09:32",
    isCurrentUser: false,
  },
  {
    id: "3",
    sender: "Sophie Bernard",
    avatar: "/avatars/03.png",
    content: "Super ! J'ai hâte de voir ça. Pensez-vous qu'on pourra l'intégrer dans notre présentation de vendredi ?",
    timestamp: "09:35",
    isCurrentUser: false,
  },
  {
    id: "4",
    sender: "Vous",
    avatar: "/avatars/user.png",
    content: "Absolument, je viens justement de terminer les slides. Je vous partage le fichier.",
    timestamp: "09:40",
    isCurrentUser: true,
  },
  {
    id: "5",
    sender: "Lucas Dupont",
    avatar: "/avatars/04.png",
    content: "Super travail tout le monde ! Je suggère qu'on se réunisse demain pour finaliser tout ça avant la présentation.",
    timestamp: "09:45",
    isCurrentUser: false,
  },
  {
    id: "6",
    sender: "Emma Martin",
    avatar: "/avatars/01.png",
    content: "Excellente idée Lucas. 10h dans la salle de réunion principale ?",
    timestamp: "09:47",
    isCurrentUser: false,
  },
  {
    id: "7",
    sender: "Vous",
    avatar: "/avatars/user.png",
    content: "Parfait pour moi. J'amènerai les dernières données des performances de la campagne précédente pour comparaison.",
    timestamp: "09:50",
    isCurrentUser: true,
  },
]

export default function TeamChatPage() {
  const [newMessage, setNewMessage] = useState("")
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Chat d'équipe</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
              />
            </div>
            
            {/* Onglets équipes/membres */}
            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teams">Équipes</TabsTrigger>
                <TabsTrigger value="members">Membres</TabsTrigger>
              </TabsList>
              <TabsContent value="teams" className="mt-2">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Vos équipes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                      <div className="flex flex-col">
                        {teams.map((team) => (
                          <div 
                            key={team.id}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{team.name}</p>
                              <p className="text-xs text-muted-foreground">{team.members} membres</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="members" className="mt-2">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Membres</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                      <div className="flex flex-col">
                        {teamMembers.map((member) => (
                          <div 
                            key={member.id}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
                          >
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.team}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Chat principal */}
          <Card className="flex flex-col h-[calc(100vh-12rem)]">
            <CardHeader className="px-6 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">Équipe Marketing</CardTitle>
                    <CardDescription className="text-xs">12 membres, 8 en ligne</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      Aujourd'hui
                    </span>
                  </div>
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-2 ${message.isCurrentUser ? 'justify-end' : ''}`}>
                      {!message.isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.avatar} alt={message.sender} />
                          <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${message.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} px-3 py-2 rounded-md`}>
                        {!message.isCurrentUser && (
                          <p className="text-xs font-medium mb-1">{message.sender}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
                      </div>
                      {message.isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.avatar} alt={message.sender} />
                          <AvatarFallback>V</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <div className="flex items-center gap-2 w-full">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input 
                  placeholder="Écrivez votre message..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button size="icon">
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
