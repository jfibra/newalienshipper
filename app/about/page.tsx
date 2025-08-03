import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Rocket, Users, Globe, Zap, Award, TrendingUp, Heart, ArrowRight, Linkedin, Twitter } from "lucide-react"

export default function AboutPage() {
  const milestones = [
    {
      year: "2019",
      title: "First Contact",
      description:
        "Our founders made contact with advanced alien shipping technology during a routine space observation.",
      icon: Rocket,
    },
    {
      year: "2020",
      title: "Technology Transfer",
      description: "Successfully adapted alien quantum shipping algorithms for Earth-based logistics systems.",
      icon: Zap,
    },
    {
      year: "2021",
      title: "Platform Launch",
      description: "AlienShipper officially launched, offering unprecedented shipping discounts to Earth businesses.",
      icon: Globe,
    },
    {
      year: "2022",
      title: "1 Million Shipments",
      description: "Processed our millionth package, saving customers over $10 million in shipping costs.",
      icon: Award,
    },
    {
      year: "2023",
      title: "Galactic Expansion",
      description: "Extended our network to include Mars and Jupiter shipping routes for interplanetary commerce.",
      icon: TrendingUp,
    },
    {
      year: "2024",
      title: "10,000+ Customers",
      description: "Reached 10,000 active customers across multiple galaxies, processing 100,000+ shipments monthly.",
      icon: Users,
    },
  ]

  const team = [
    {
      name: "Dr. Sarah Cosmos",
      title: "CEO & Co-Founder",
      bio: "Former NASA engineer who pioneered the integration of alien technology with Earth shipping systems. PhD in Quantum Logistics.",
      avatar: "SC",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Commander Alex Stellar",
      title: "CTO & Co-Founder",
      bio: "Ex-Space Force officer with 15 years experience in intergalactic communications and alien technology adaptation.",
      avatar: "AS",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Dr. Maria Nebula",
      title: "Head of Alien Relations",
      bio: "Xenolinguist and diplomat responsible for maintaining our partnerships with shipping carriers across the galaxy.",
      avatar: "MN",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Captain Jake Orbit",
      title: "VP of Operations",
      bio: "Former logistics coordinator for the International Space Station, now manages our Earth-based operations.",
      avatar: "JO",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Luna Starlight",
      title: "Head of Customer Success",
      bio: "Customer experience expert who ensures every human and alien customer receives stellar support 24/7.",
      avatar: "LS",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Dr. Zara Quantum",
      title: "Lead Engineer",
      bio: "Quantum computing specialist who maintains and optimizes our alien-powered shipping algorithms.",
      avatar: "ZQ",
      social: { linkedin: "#", twitter: "#" },
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make is guided by what's best for our customers across all galaxies.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously push the boundaries of what's possible with alien technology.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making advanced shipping technology available to businesses of all sizes, everywhere.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working together with alien partners to create solutions that benefit everyone.",
    },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">About AlienShipper</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how we're revolutionizing shipping with technology from beyond the stars
          </p>
        </div>

        {/* Mission Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                In 2019, our founders were conducting routine astronomical observations when they detected unusual
                energy signatures from a distant galaxy. What they discovered changed everything: an advanced
                civilization with shipping technology far beyond anything on Earth.
              </p>
              <p>
                Through careful diplomatic contact, we established a partnership that allows us to adapt their quantum
                logistics algorithms for Earth-based shipping. This alien technology enables us to negotiate rates and
                optimize routes in ways that were previously impossible.
              </p>
              <p>
                Today, AlienShipper serves as the bridge between advanced alien logistics technology and Earth
                businesses, helping thousands of companies save millions of dollars on shipping costs while maintaining
                the highest standards of service and reliability.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/abstract-ecommerce-flow.png"
              alt="Alien technology integration"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide our intergalactic mission</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our intergalactic adventure</p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const IconComponent = milestone.icon
                const isEven = index % 2 === 0
                return (
                  <div key={index} className={`flex items-center ${isEven ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`w-1/2 ${isEven ? "pr-8 text-right" : "pl-8 text-left"}`}>
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="text-sm font-semibold">
                              {milestone.year}
                            </Badge>
                            <IconComponent className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{milestone.title}</h3>
                          <p className="text-gray-600">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-white border-4 border-purple-600 rounded-full"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The humans and alien technology experts behind AlienShipper</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => {
              let avatarContent = (
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">
                  {member.avatar}
                </div>
              )

              if (member.name === "Dr. Sarah Cosmos") {
                avatarContent = (
                  <img
                    src="/images/android-chrome-192x192.png"
                    alt="Dr. Sarah Cosmos"
                    className="w-20 h-20 rounded-full mx-auto"
                  />
                )
              }

              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="text-center space-y-4">
                    {avatarContent}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-purple-600 font-medium">{member.title}</p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                    <div className="flex justify-center space-x-3">
                      <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-xl text-gray-600">Numbers that showcase our intergalactic success</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
                <div className="text-gray-600">Active Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5M+</div>
                <div className="text-gray-600">Packages Shipped</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$100M+</div>
                <div className="text-gray-600">Customer Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Mission?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Become part of the shipping revolution and start saving with alien technology today.
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
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
