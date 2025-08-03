"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Headphones,
  Globe,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react"

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubject = (value: string) => {
    setForm((prev) => ({ ...prev, subject: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!form.firstName || !form.lastName || !form.email || !form.subject || !form.message) {
      setError("Please fill in all required fields.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      let data = null
      try {
        data = await res.json()
      } catch (jsonErr) {
        // If the response is not valid JSON
        setError("Unexpected server response. Please try again later.")
        setSubmitting(false)
        return
      }
      if (!res.ok) throw new Error(data?.error || "Submission failed")
      setSuccess("Thank you! Your message has been received. We'll get back to you soon.")
      setForm({ firstName: "", lastName: "", email: "", company: "", subject: "", message: "" })
    } catch (err: any) {
      setError(err.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@alienshipper.com",
      availability: "24/7 Response",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our team",
      contact: "+1 (555) ALIEN-1",
      availability: "24/7 Available",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant messaging support",
      contact: "Available on website",
      availability: "24/7 Online",
    },
    {
      icon: Headphones,
      title: "Priority Support",
      description: "Enterprise customers",
      contact: "enterprise@alienshipper.com",
      availability: "Dedicated team",
    },
  ]

  const officeInfo = [
    {
      title: "Headquarters",
      address: "123 Cosmic Way, Space City, TX 77058",
      description: "Our main Earth operations center",
    },
    {
      title: "Mars Office",
      address: "Sector 7-G, New Olympia, Mars Colony",
      description: "Interplanetary shipping hub",
    },
    {
      title: "Jupiter Station",
      address: "Europa Base, Jupiter System",
      description: "Outer galaxy logistics center",
    },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help, 24/7. Reach out to our alien support team across the galaxy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                <Send className="w-6 h-6 mr-2 text-purple-600" />
                Send us a Message
              </CardTitle>
              <p className="text-gray-600">Fill out the form below and we'll get back to you within light speed</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">{success}</div>}
              {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="John" value={form.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john@company.com" value={form.email} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Acme Corp" value={form.company} onChange={handleChange} />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={form.subject} onValueChange={handleSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Billing Question">Billing Question</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Feedback">Feedback</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" placeholder="Tell us how we can help you..." className="min-h-[120px]" value={form.message} onChange={handleChange} />
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6">
                  <Send className="w-5 h-5 mr-2" />
                  {submitting ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  * Required fields. We typically respond within 1 hour during business hours.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon
                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                        <p className="font-medium text-purple-600">{method.contact}</p>
                        <p className="text-sm text-gray-500">{method.availability}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Office Locations */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                  Our Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {officeInfo.map((office, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-4">
                    <h4 className="font-semibold text-gray-900">{office.title}</h4>
                    <p className="text-gray-600 text-sm">{office.address}</p>
                    <p className="text-gray-500 text-xs">{office.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Support Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email & Chat Support:</span>
                    <span className="font-medium text-gray-900">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone Support:</span>
                    <span className="font-medium text-gray-900">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enterprise Support:</span>
                    <span className="font-medium text-gray-900">24/7 Priority</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Our alien support team never sleeps! We provide round-the-clock assistance across all time zones and
                  galaxies.
                </p>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="p-6">
              <CardContent>
                <img
                  src="/images/abstract-api-connection.png"
                  alt="AlienShipper Technology Network"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">Our Technology Network</h4>
                  <p className="text-gray-600 text-sm">
                    Our advanced alien technology network spans across galaxies, connecting Earth businesses with
                    intergalactic shipping solutions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Media & Additional Info */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect With Us</h2>
            <p className="text-xl text-gray-600">Follow our intergalactic journey on social media</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Social Media */}
            <Card className="p-8 text-center">
              <CardContent className="space-y-6">
                <Globe className="w-12 h-12 text-purple-600 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900">Social Media</h3>
                <p className="text-gray-600">Stay updated with our latest news and shipping tips</p>
                <div className="flex justify-center space-x-6">
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Facebook className="w-8 h-8" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Twitter className="w-8 h-8" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">
                    <Linkedin className="w-8 h-8" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                    <Instagram className="w-8 h-8" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="p-8 text-center bg-gradient-to-r from-red-50 to-orange-50">
              <CardContent className="space-y-6">
                <Phone className="w-12 h-12 text-red-600 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900">Emergency Support</h3>
                <p className="text-gray-600">For urgent shipping issues or system outages</p>
                <div className="space-y-2">
                  <p className="font-semibold text-red-600">+1 (555) URGENT-1</p>
                  <p className="text-sm text-gray-500">Available 24/7 for critical issues</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <Card className="p-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 max-w-4xl mx-auto">
            <CardContent>
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-xl opacity-90 mb-8">
                Our alien support team is standing by to help you with any questions about shipping, pricing, or our
                intergalactic technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Start Live Chat
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
                >
                  Browse Help Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
