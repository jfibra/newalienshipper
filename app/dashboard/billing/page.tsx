"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Loader2,
  TrendingUp,
  Receipt,
  Wallet,
} from "lucide-react"

type PaymentMethod = {
  id: string
  user_id: string
  provider: string
  provider_payment_id: string
  brand: string | null
  last4: string | null
  exp_month: number | null
  exp_year: number | null
  created_at: string
}

// Sample transactions (replace with real data if available)
const sampleTransactions = [
  { id: 1, type: "Cash In", amount: 100, date: "2025-07-30", status: "Completed", description: "Account deposit" },
  {
    id: 2,
    type: "Shipment",
    amount: -12.5,
    date: "2025-07-31",
    status: "Completed",
    description: "Package to Mars Colony",
  },
  { id: 3, type: "Cash In", amount: 50, date: "2025-08-01", status: "Pending", description: "Account deposit" },
  {
    id: 4,
    type: "Shipment",
    amount: -8.75,
    date: "2025-08-01",
    status: "Completed",
    description: "Express delivery to Jupiter",
  },
  {
    id: 5,
    type: "Refund",
    amount: 15.25,
    date: "2025-08-02",
    status: "Completed",
    description: "Cancelled shipment refund",
  },
]

export default function Billing() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  // Calculate statistics
  const currentBalance = 137.5
  const totalDeposited = sampleTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = Math.abs(sampleTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
  const totalTransactions = sampleTransactions.length

  // Fetch payment methods
  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMethods(data || [])
        setLoading(false)
      })
  }, [user])

  // Stripe Elements Add Payment Method
  function AddPaymentMethodForm({ onAdded }: { onAdded: () => void }) {
    const stripe = useStripe()
    const elements = useElements()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setError("")
      setSuccess("")
      if (!user) return
      if (!stripe || !elements) {
        setError("Stripe is not loaded.")
        return
      }
      setLoading(true)
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        setError("Card element not found.")
        setLoading(false)
        return
      }
      // Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      })
      if (stripeError || !paymentMethod) {
        setError(stripeError?.message || "Failed to create payment method.")
        setLoading(false)
        return
      }
      // Extract card metadata
      const { brand, last4, exp_month, exp_year } = paymentMethod.card || {}
      // Store only id and metadata in Supabase
      const method = {
        user_id: user.id,
        provider: "stripe",
        provider_payment_id: paymentMethod.id,
        brand,
        last4,
        exp_month,
        exp_year,
      }
      const { error: insertError } = await supabase.from("payment_methods").insert([method])
      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess("Payment method added!")
        onAdded()
      }
      setLoading(false)
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Payment Method</CardTitle>
          <CardDescription>Add a credit or debit card to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="p-3 border rounded-lg bg-gray-50">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Payment Method
              </Button>
              <Button type="button" variant="outline" onClick={onAdded}>
                Cancel
              </Button>
            </div>
            {success && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    )
  }

  // Delete payment method
  async function handleDelete(id: string) {
    setDeleting(id)
    setError("")
    setSuccess("")
    const { error: delError } = await supabase.from("payment_methods").delete().eq("id", id)
    if (delError) {
      setError(delError.message)
    } else {
      setSuccess("Payment method deleted.")
      setMethods((prev) => prev.filter((m) => m.id !== id))
    }
    setDeleting(null)
  }

  // Stripe publishable key
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_API_KEY ||
      "pk_test_51RareaReB4GFfJph1pd5UoEeeuTEAafXVPdR35IWXuz1DDO1wcxpA7TWuiVcHKOMlfUtuHO2x168ygDdTDnfeGkh00u51syNac",
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
            <p className="text-gray-600 mt-1">Manage your account balance, payment methods, and billing information</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Balance</p>
                  <p className="text-3xl font-bold text-green-600">${currentBalance.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Available for shipping</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deposited</p>
                  <p className="text-3xl font-bold text-blue-600">${totalDeposited.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Lifetime deposits</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-purple-600">${totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">On shipping labels</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-3xl font-bold text-orange-600">{totalTransactions}</p>
                  <p className="text-xs text-gray-500 mt-1">Total transactions</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Receipt className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-white shadow-sm">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Account Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Available Balance</span>
                      <span className="font-semibold text-green-600">${currentBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Total Deposited</span>
                      <span className="font-semibold">${totalDeposited.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-semibold">${totalSpent.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sampleTransactions.slice(0, 3).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                          </div>
                          <span
                            className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.amount > 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Transaction History</h3>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Filter by Date
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left p-4 font-medium text-gray-900">Description</th>
                            <th className="text-left p-4 font-medium text-gray-900">Type</th>
                            <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                            <th className="text-left p-4 font-medium text-gray-900">Date</th>
                            <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleTransactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-sm text-gray-500">Transaction #{transaction.id}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {transaction.amount > 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-4 text-gray-600">{transaction.date}</td>
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payment-methods" className="p-6">
              <Elements stripe={stripePromise}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Payment Methods</h3>
                      <p className="text-gray-600">Manage your saved payment methods for quick checkout</p>
                    </div>
                    <Button onClick={() => setAdding(!adding)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>

                  {adding && (
                    <AddPaymentMethodForm
                      onAdded={async () => {
                        setAdding(false)
                        // Refetch payment methods after add/cancel
                        const { data } = await supabase
                          .from("payment_methods")
                          .select("*")
                          .eq("user_id", user?.id)
                          .order("created_at", { ascending: false })
                        setMethods(data || [])
                      }}
                    />
                  )}

                  {success && (
                    <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-green-800">{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                      <span className="text-red-800">{error}</span>
                    </div>
                  )}

                  {loading ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">Loading payment methods...</p>
                      </CardContent>
                    </Card>
                  ) : methods.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No payment methods</h4>
                        <p className="text-gray-600 mb-4">
                          Add a payment method to start making purchases and adding funds to your account.
                        </p>
                        <Button onClick={() => setAdding(true)} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Payment Method
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {methods.map((method) => (
                        <Card key={method.id} className="relative">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <CreditCard className="w-8 h-8 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-semibold capitalize">{method.brand}</p>
                                  <p className="text-sm text-gray-600">•••• {method.last4}</p>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(method.id)}
                                disabled={deleting === method.id}
                                className="text-red-500 hover:bg-red-50"
                              >
                                {deleting === method.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                Expires {method.exp_month}/{method.exp_year}
                              </p>
                              <p>Added {method.created_at ? new Date(method.created_at).toLocaleDateString() : ""}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </Elements>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
