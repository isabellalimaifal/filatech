"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  HelpCircle,
  Smartphone,
  Clock,
  Shield,
  Users,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"

const FEATURES = [
  {
    icon: Smartphone,
    title: "100% Digital",
    description: "Acesse de qualquer dispositivo",
  },
  {
    icon: Clock,
    title: "Tempo Real",
    description: "Atualizações instantâneas",
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Dados protegidos por criptografia",
  },
  {
    icon: Users,
    title: "Para Todos",
    description: "Serviço público e gratuito",
  },
]

const FAQ_ITEMS = [
  {
    question: "Como funciona a fila virtual?",
    answer:
      "A fila virtual do FilaDigital permite que você entre na fila de atendimento de qualquer órgão público sem precisar estar fisicamente no local. Basta selecionar a unidade, escolher o serviço desejado e confirmar sua entrada. Você receberá um ticket com sua posição e poderá acompanhar em tempo real quando será sua vez.",
  },
  {
    question: "Posso entrar em mais de uma fila ao mesmo tempo?",
    answer:
      "Não, para garantir a organização e evitar ausências no momento do atendimento, cada cidadão pode ter apenas uma senha ativa por vez. Você deve concluir ou cancelar seu atendimento atual antes de entrar em outra fila.",
  },
  {
    question: "Como recebo notificações sobre minha vez?",
    answer:
      "Você pode ativar as notificações clicando no botão 'Solicitar Notificação' no seu ticket ativo. Quando sua vez estiver próxima, você receberá um alerta no navegador ou celular. Certifique-se de permitir notificações do FilaDigital no seu dispositivo.",
  },
  {
    question: "O que acontece se eu perder minha vez?",
    answer:
      "Se você não comparecer quando for chamado, sua senha será cancelada automaticamente e você precisará entrar novamente na fila. Recomendamos chegar ao local com antecedência quando sua posição estiver próxima.",
  },
  {
    question: "O serviço é gratuito?",
    answer:
      "Sim! O FilaDigital é um serviço público completamente gratuito, oferecido pelo governo para facilitar o acesso da população aos serviços públicos e reduzir o tempo de espera presencial.",
  },
]

const CONTACT_OPTIONS = [
  {
    icon: Phone,
    title: "Telefone",
    value: "0800 123 4567",
  },
  {
    icon: Mail,
    title: "E-mail",
    value: "suporte@filadigital.gov.br",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    value: "Seg-Sex, 8h-18h",
  },
]

export default function AjudaPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Central de Ajuda</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Como podemos ajudar?
          </h1>
          <p className="text-muted-foreground">
            Encontre respostas para as dúvidas mais frequentes sobre o FilaDigital.
          </p>
        </div>

        {/* Features Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 shadow-sm text-center"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Perguntas Frequentes
          </h2>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="px-6 text-left hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Ainda precisa de ajuda?
              </h2>
              <p className="text-muted-foreground mb-6">
                Entre em contato com nossa equipe de suporte.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONTACT_OPTIONS.map((option) => (
                  <div
                    key={option.title}
                    className="flex items-center gap-3 p-4 rounded-lg bg-card"
                  >
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {option.title}
                      </p>
                      <p className="font-medium text-foreground">
                        {option.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
