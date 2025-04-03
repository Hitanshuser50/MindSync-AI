"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { usePremium } from "@/hooks/use-premium"
import { CheckCircle, Sparkles, CreditCard, Loader2, AlertCircle, IndianRupee, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function SubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("inr")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card")

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/subscription")
      return
    }

    // Simulate loading subscription data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [user, router])

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login?redirect=/subscription")
      return
    }

    setIsProcessing(true)

    try {
      // In a real app, this would call your API to create a checkout session
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success
      toast({
        title: "Subscription successful!",
        description: "Welcome to Premium! You now have access to all premium features.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error processing subscription:", error)

      toast({
        title: "Subscription failed",\
        description: "Faile  error)
      
      toast({
        title: "Subscription failed",
        description: "Failed to process your subscription. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subscription options...</p>
        </div>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">You're a Premium Member!</h1>
          <p className="text-muted-foreground mb-6">You already have access to all premium features and content.</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Upgrade to Premium</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock advanced features, premium content, and personalized insights to enhance your mental wellbeing
            journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="space-y-6">
              <Tabs defaultValue="monthly" onValueChange={setSelectedPlan}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-4">
                  <Card className="border-primary">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">Premium Monthly</CardTitle>
                          <CardDescription>Full access to all premium features</CardDescription>
                        </div>
                        <div className="flex items-baseline">
                          {selectedCurrency === "inr" ? (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1" />
                              <span className="text-3xl font-bold">499</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="text-3xl font-bold">6.99</span>
                            </>
                          )}
                          <span className="text-muted-foreground ml-1">/month</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <PremiumFeatureItem text="Unlimited AI therapy sessions" />
                        <PremiumFeatureItem text="All premium meditations" />
                        <PremiumFeatureItem text="Advanced insights & analytics" />
                        <PremiumFeatureItem text="Personalized recommendations" />
                        <PremiumFeatureItem text="Ad-free experience" />
                        <PremiumFeatureItem text="Priority support" />
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <Card className="border-primary">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">Premium Yearly</CardTitle>
                          <CardDescription>Full access to all premium features</CardDescription>
                        </div>
                        <div className="flex items-baseline">
                          {selectedCurrency === "inr" ? (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1" />
                              <span className="text-3xl font-bold">4,799</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="text-3xl font-bold">67.99</span>
                            </>
                          )}
                          <span className="text-muted-foreground ml-1">/year</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded">
                          Save 20% with yearly billing
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <PremiumFeatureItem text="Unlimited AI therapy sessions" />
                        <PremiumFeatureItem text="All premium meditations" />
                        <PremiumFeatureItem text="Advanced insights & analytics" />
                        <PremiumFeatureItem text="Personalized recommendations" />
                        <PremiumFeatureItem text="Ad-free experience" />
                        <PremiumFeatureItem text="Priority support" />
                        <PremiumFeatureItem text="Exclusive yearly subscriber content" />
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div>
                <h3 className="text-lg font-medium mb-4">Select Currency</h3>
                <Tabs defaultValue="inr" onValueChange={setSelectedCurrency}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inr" className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      <span>INR</span>
                    </TabsTrigger>
                    <TabsTrigger value="usd" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>USD</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="card" onValueChange={setSelectedPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card">Card</TabsTrigger>
                    <TabsTrigger value="upi">UPI</TabsTrigger>
                    <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4 pt-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image src="/placeholder.svg?height=24&width=36&text=Visa" alt="Visa" width={36} height={24} />
                      </div>
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=36&text=MC"
                          alt="Mastercard"
                          width={36}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=36&text=Amex"
                          alt="American Express"
                          width={36}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=36&text=RuPay"
                          alt="RuPay"
                          width={36}
                          height={24}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Your card details will be securely processed by Stripe. We don't store your card information.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Secure payment processing by Stripe</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="upi" className="space-y-4 pt-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=36&text=GPay"
                          alt="Google Pay"
                          width={36}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=36&text=PhonePe"
                          alt="PhonePe"
                          width={36}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=36&text=Paytm"
                          alt="Paytm"
                          width={36}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 w-16 h-10 flex items-center justify-center">
                        <Image src="/placeholder.svg?height=24&width=36&text=BHIM" alt="BHIM" width={36} height={24} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You'll receive a UPI payment request on your preferred UPI app to complete the transaction.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="netbanking" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-2 h-12 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=80&text=HDFC"
                          alt="HDFC Bank"
                          width={80}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 h-12 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=80&text=ICICI"
                          alt="ICICI Bank"
                          width={80}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 h-12 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=80&text=SBI"
                          alt="State Bank of India"
                          width={80}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 h-12 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=80&text=Axis"
                          alt="Axis Bank"
                          width={80}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 h-12 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=24&width=80&text=Kotak"
                          alt="Kotak Bank"
                          width={80}
                          height={24}
                        />
                      </div>
                      <div className="border rounded-md p-2 h-12 flex items-center justify-center text-sm text-muted-foreground">
                        + More Banks
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You'll be redirected to your bank's website to complete the payment securely.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="pt-4 border-t">
                  <Button className="w-full gap-2" size="lg" onClick={handleSubscribe} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>You can cancel your subscription anytime</span>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  By subscribing, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </a>
                  .
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FaqItem
              question="How does the billing work?"
              answer="You'll be charged immediately upon subscribing, and then on the same date each month or year, depending on your plan. You can cancel anytime before your next billing cycle."
            />
            <FaqItem
              question="Can I switch between monthly and yearly plans?"
              answer="Yes, you can switch between plans at any time. If you switch from monthly to yearly, you'll be charged the yearly rate immediately. If you switch from yearly to monthly, the change will take effect at the end of your current billing cycle."
            />
            <FaqItem
              question="Is my payment information secure?"
              answer="Yes, we use Stripe for payment processing, which is PCI-DSS compliant and uses industry-standard encryption to protect your payment information. We never store your full card details on our servers."
            />
            <FaqItem
              question="How do I cancel my subscription?"
              answer="You can cancel your subscription at any time from your account settings. After cancellation, you'll continue to have access to premium features until the end of your current billing period."
            />
            <FaqItem
              question="Do you offer refunds?"
              answer="We offer a 7-day money-back guarantee. If you're not satisfied with your premium subscription within the first 7 days, contact our support team for a full refund."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards (Visa, Mastercard, American Express, RuPay), UPI payments (Google Pay, PhonePe, Paytm, BHIM), and net banking from all major Indian banks."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PremiumFeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </li>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{question}</h3>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  )
}

