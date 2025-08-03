import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Globe,
  Shield,
  Bell,
  MapPin,
  BarChart3,
  Package,
  CreditCard,
  Users,
  Settings,
  Truck,
  Clock,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: "Batch Label Creation",
      description:
        "Create hundreds of shipping labels in seconds with our quantum processing technology. Upload CSV files or connect via API for seamless integration.",
      category: "Efficiency",
      color: "text-purple-600",
    },
    {
      icon: Globe,
      title: "International Shipping",
      description:
        "Ship to any planet in the galaxy with our intergalactic network. Automatic customs forms and duty calculations included.",
      category: "Global",
      color: "text-blue-600",
    },
    {
      icon: Shield,
      title: "Shipping Insurance",
      description:
        "Protect your packages with coverage that spans dimensions. Automatic claims processing and instant payouts for lost or damaged items.",
      category: "Protection",
      color: "text-green-600",
    },
    {
      icon: Bell,
      title: "Tracking & Notifications",
      description:
        "Real-time updates transmitted via quantum entanglement. SMS, email, and telepathic notifications available.",
      category: "Communication",
      color: "text-orange-600",
    },
    {
      icon: MapPin,
      title: "Address Validation",
      description:
        "Verify addresses across all known galaxies and dimensions. Automatic correction suggestions and geocoding included.",
      category: "Accuracy",
      color: "text-red-600",
    },
    {
      icon: BarChart3,
      title: "Cost Reporting",
      description:
        "Advanced analytics powered by alien artificial intelligence. Track spending, identify savings opportunities, and generate detailed reports.",
      category: "Analytics",
      color: "text-indigo-600",
    },
    {
      icon: Package,
      title: "Multi-Carrier Support",
      description:
        "Access rates from USPS, UPS, FedEx, and intergalactic carriers all in one platform. Compare rates instantly.",
      category: "Integration",
      color: "text-cyan-600",
    },
    {
      icon: CreditCard,
      title: "Flexible Billing",
      description:
        "Pay only for what you ship. No monthly fees, no setup costs, no hidden charges. Accept all forms of currency including space credits.",
      category: "Billing",
      color: "text-emerald-600",
    },
    {
      icon: Users,
      title: "Team Management",
      description:
        "Add unlimited team members with role-based permissions. Perfect for businesses of any size across any galaxy.",
      category: "Collaboration",
      color: "text-pink-600",
    },
    {
      icon: Settings,
      title: "API Integration",
      description:
        "Powerful REST API with comprehensive documentation. Integrate with any e-commerce platform or custom application.",
      category: "Development",
      color: "text-violet-600",
    },
    {
      icon: Truck,
      title: "Pickup Scheduling",
      description:
        "Schedule pickups with any carrier directly from the platform. Same-day and next-day pickup options available.",
      category: "Logistics",
      color: "text-amber-600",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Round-the-clock support from our team of alien shipping experts. Live chat, phone, and telepathic support available.",
      category: "Support",
      color: "text-teal-600",
    },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Features from Another Galaxy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the powerful features that make AlienShipper the most advanced shipping platform in the
            universe. Built with alien technology for earthly businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow h-full">
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <IconComponent className={`w-12 h-12 ${feature.color}`} />
                    <Badge variant="secondary" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12 relative overflow-hidden"
            style={{
              backgroundImage: `url('/images/abstract-api-connection.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Experience These Features?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Start using all these powerful features today. No setup fees, no monthly charges, just incredible
                shipping technology at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-shadow">
                  Get Started for Free
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
