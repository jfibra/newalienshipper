import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Package, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const carrierRates = [
    {
      carrier: "USPS",
      logo: "📮",
      services: [
        { name: "Priority Mail", retail: "$8.95", alien: "$6.20", savings: "31%" },
        { name: "Priority Express", retail: "$28.95", alien: "$19.45", savings: "33%" },
        { name: "Ground Advantage", retail: "$5.50", alien: "$4.10", savings: "25%" },
        { name: "Media Mail", retail: "$3.49", alien: "$2.89", savings: "17%" },
      ],
    },
    {
      carrier: "UPS",
      logo: "📦",
      services: [
        { name: "Ground", retail: "$12.45", alien: "$7.89", savings: "37%" },
        { name: "3 Day Select", retail: "$18.50", alien: "$12.30", savings: "34%" },
        { name: "2nd Day Air", retail: "$24.95", alien: "$16.85", savings: "32%" },
        { name: "Next Day Air", retail: "$45.50", alien: "$32.20", savings: "29%" },
      ],
    },
    {
      carrier: "FedEx",
      logo: "✈️",
      services: [
        { name: "Ground", retail: "$11.25", alien: "$7.45", savings: "34%" },
        { name: "Express Saver", retail: "$22.50", alien: "$15.20", savings: "32%" },
        { name: "2Day", retail: "$28.95", alien: "$19.85", savings: "31%" },
        { name: "Overnight", retail: "$52.50", alien: "$38.90", savings: "26%" },
      ],
    },
    {
      carrier: "DHL",
      logo: "🌍",
      services: [
        { name: "Express Worldwide", retail: "$65.50", alien: "$45.20", savings: "31%" },
        { name: "Express 12:00", retail: "$85.95", alien: "$62.40", savings: "27%" },
        { name: "Economy Select", retail: "$42.50", alien: "$29.85", savings: "30%" },
        { name: "Express Easy", retail: "$38.95", alien: "$26.50", savings: "32%" },
      ],
    },
  ]

  const includedFeatures = [
    {
      icon: Package,
      title: "Batch Label Creation",
      description: "Create hundreds of labels in seconds",
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      description: "Track all packages across carriers",
    },
    {
      icon: Shield,
      title: "Shipping Insurance",
      description: "Protect your valuable shipments",
    },
    {
      icon: Globe,
      title: "International Shipping",
      description: "Ship anywhere in the galaxy",
    },
  ]

  const faqs = [
    {
      question: "How can AlienShipper offer such low rates?",
      answer:
        "Our alien technology partners have negotiated exclusive rates with Earth carriers through advanced diplomatic channels. We pass these savings directly to you with no markup.",
    },
    {
      question: "Are there really no monthly fees?",
      answer:
        "We only make money when you save money. There are no setup fees, monthly charges, or hidden costs. You only pay for shipping labels at our discounted rates.",
    },
    {
      question: "How do these rates compare to other platforms?",
      answer:
        "Our alien-negotiated rates are typically 15-40% lower than other shipping platforms and up to 89% off retail rates. The savings increase with volume.",
    },
    {
      question: "Can I get better rates with higher volume?",
      answer:
        "Yes! Our alien algorithms automatically optimize your rates based on shipping volume. Enterprise customers get access to even deeper discounts.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, ACH transfers, and various forms of intergalactic currency. Payment is only required when purchasing labels.",
    },
    {
      question: "Is there a minimum shipping volume required?",
      answer:
        "No minimum volume required! Whether you ship 1 package or 10,000 packages per month, you get the same great rates from day one.",
    },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            No hidden fees. No monthly charges. Just incredible savings powered by alien technology.
          </p>
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            100% Free Platform • Pay Only for Labels
          </Badge>
        </div>

        {/* Carrier Rates */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sample Shipping Rates</h2>
            <p className="text-xl text-gray-600">Compare our alien-negotiated rates with retail prices</p>
            <p className="text-sm text-gray-500 mt-2">* Rates for 1 lb package from New York to Los Angeles</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {carrierRates.map((carrier, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-3xl">{carrier.logo}</span>
                    <span className="text-2xl font-bold text-gray-900">{carrier.carrier}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Retail</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">AlienShipper</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Savings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {carrier.services.map((service, serviceIndex) => (
                          <tr key={serviceIndex} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.name}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600 line-through">
                              {service.retail}
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-semibold text-green-600">
                              {service.alien}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {service.savings}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Included for Free</h2>
            <p className="text-xl text-gray-600">All these features come at no additional cost</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {includedFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Address validation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Package tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Email notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">API access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">24/7 support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Unlimited users</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Custom branding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Pickup scheduling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Analytics dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing FAQ</h2>
            <p className="text-xl text-gray-600">Common questions about our transparent pricing</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="p-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent>
              <h2 className="text-3xl font-bold mb-4">Ready to Start Saving?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already saving with AlienShipper. No setup fees, no monthly charges, just
                incredible savings from day one.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    Sign Up Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                  asChild
                >
                  <Link href="/calculator">Calculate Your Savings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
