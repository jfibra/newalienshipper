"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  HelpCircle,
  MessageSquare,
  FileText,
  Send,
  Search,
  Rocket,
  Zap,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Mail,
} from "lucide-react"

const tabs = [
  { label: "Create Ticket", icon: MessageSquare },
  { label: "My Tickets", icon: FileText },
  { label: "Knowledge Base", icon: HelpCircle },
]

type Ticket = {
  id: string
  user_id: string
  user_name: string
  page: string
  message: string
  ip_address?: string
  location?: string
  device?: string
  browser?: string
  os?: string
  created_at: string
  updated_at: string
  status: string
}

const PAGES = ["Dashboard", "Calculator", "Pricing", "Features", "Signup/Login", "Other"]

const faqs = [
  {
    category: "Getting Started",
    icon: Rocket,
    items: [
      {
        q: "What is AlienShipper?",
        a: "AlienShipper is an intergalactic shipping platform that provides discounted USPS® and UPS® shipping rates using advanced alien technology. Our platform is free to use, with no monthly fees or hidden costs.",
      },
      {
        q: "How do I get started with AlienShipper?",
        a: "Simply create a free account, connect your carrier accounts (or create new ones through our platform), and you're ready to start shipping at warp speed with discounted rates.",
      },
      {
        q: "Is AlienShipper really free to use?",
        a: "Yes! There are no monthly fees, subscription costs, or markup on postage. AlienShipper earns a small portion of the discount from carriers, but users still save significantly compared to retail rates.",
      },
      {
        q: "Do I need existing carrier accounts?",
        a: "No, you don't need existing carrier accounts. You can create new ones through our platform or connect your existing accounts using our alien technology.",
      },
    ],
  },
  {
    category: "Shipping Rates",
    icon: Zap,
    items: [
      {
        q: "How much can I save on shipping?",
        a: "Users typically save 30–89% compared to retail rates using our alien technology. The exact savings depend on the service, package dimensions, weight, and destination across the galaxy.",
      },
      {
        q: "How do your rates compare to USPS and UPS retail prices?",
        a: "AlienShipper offers Commercial Plus Pricing for USPS and negotiated rates for UPS that are significantly lower than retail prices. These discounts are usually only available to high-volume shippers, but our alien technology makes them accessible to all businesses.",
      },
      {
        q: "Are there any hidden fees or charges?",
        a: "No. There are no hidden fees, no markup on postage, and no minimum shipping requirements. Our alien overlords believe in transparent pricing.",
      },
      {
        q: "Which shipping services and carriers do you support?",
        a: "All major USPS services (Priority Mail, First Class Package, Priority Mail Express, etc.) and UPS services (Ground, 2nd Day Air, Next Day Air, etc.) are supported. More carriers and services are being added regularly as we expand across the galaxy.",
      },
    ],
  },
  {
    category: "Labels & Printing",
    icon: FileText,
    items: [
      {
        q: "What types of printers can I use?",
        a: "All standard Earth printers are supported, including desktop inkjet/laser printers and thermal label printers. You can print on regular paper or adhesive labels using our alien-enhanced printing technology.",
      },
      {
        q: "Can I print multiple labels at once?",
        a: "Yes, our batch label printing allows you to create and print multiple shipping labels at warp speed.",
      },
      {
        q: "What label formats do you support?",
        a: "Formats include 4x6 thermal labels, 8.5x11 paper (with 1 or 2 labels per page), and more. Users can choose the format that works best for their printer and intergalactic workflow.",
      },
      {
        q: "Can I customize my shipping labels?",
        a: "Yes, labels can be customized with your company logo, return address, and other information. Different label templates can be saved for different shipment types across different planets.",
      },
    ],
  },
  {
    category: "Tracking & Delivery",
    icon: Globe,
    items: [
      {
        q: "How do I track my shipments?",
        a: "All shipments include real-time tracking powered by our alien satellite network. Users can track shipments from their dashboard or use the carrier's tracking page with the provided tracking number.",
      },
      {
        q: "Can I send tracking information to my customers?",
        a: "Yes, tracking information can be sent automatically via email using our alien communication systems. Email templates are customizable, and users can choose when to send notifications.",
      },
      {
        q: "What if a package is lost or damaged?",
        a: "Claims can be filed directly through our platform. AlienShipper assists with the claims process and works with our alien insurance partners to resolve issues quickly.",
      },
      {
        q: "Do you offer shipping insurance?",
        a: "Yes, affordable shipping insurance options are available for both domestic and intergalactic shipments. Insurance can be added during label creation and is backed by our alien insurance consortium.",
      },
    ],
  },
]

export default function Support() {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(PAGES[0])
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useUser()
  const supabase = createClientComponentClient()

  // Fetch tickets for the user
  useEffect(() => {
    if (activeTab === 1 && user) {
      setLoadingTickets(true)
      supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          setTickets(data || [])
          setLoadingTickets(false)
        })
    }
  }, [activeTab, user])

  // Handle ticket form submit
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    if (!user) {
      setError("You must be signed in to submit a ticket.")
      setSubmitting(false)
      return
    }

    if (!message.trim()) {
      setError("Message is required.")
      setSubmitting(false)
      return
    }

    const device = typeof window !== "undefined" ? navigator.platform : ""
    const browser = typeof window !== "undefined" ? navigator.userAgent : ""
    const os = typeof window !== "undefined" ? navigator.appVersion : ""

    const ticket = {
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email,
      page,
      message,
      device,
      browser,
      os,
    }

    const { error: insertError } = await supabase.from("tickets").insert([ticket])

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess("Ticket submitted successfully! Our support team will respond soon.")
      setMessage("")
      setPage(PAGES[0])
      setTimeout(() => setSuccess(""), 5000)
    }
    setSubmitting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200"
      case "resolved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          searchQuery === "" ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600 text-lg">Our support team is here to help you with any questions or issues</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
        <div className="flex space-x-2">
          {tabs.map((tab, i) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.label}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  i === activeTab
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab(i)}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-800 font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-purple-500" />
            Create Support Ticket
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page/Section</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 outline-none"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                required
              >
                {PAGES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 outline-none resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Describe your issue or question in detail..."
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-500" />
            Your Support Tickets
          </h2>
          {loadingTickets ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No support tickets found</p>
              <p className="text-gray-500">Create your first ticket to get help from our support team</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.page}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{ticket.message}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}
                    >
                      {ticket.status}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-8">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 max-w-2xl mx-auto">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <Input
                type="text"
                placeholder="Search the knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-none text-lg"
              />
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {filteredFaqs.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.category} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Icon className="w-6 h-6 mr-3 text-purple-500" />
                    {category.category}
                  </h3>
                  <div className="space-y-6">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-lg text-gray-900 mb-3 flex items-start">
                          <Sparkles className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                          {item.q}
                        </h4>
                        <p className="text-gray-600 leading-relaxed pl-8">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Still Need Help?</h4>
            <p className="text-gray-600 mb-6">Our support team is standing by to assist you</p>
            <Button
              asChild
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <a href="mailto:support@alienshipper.com">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
