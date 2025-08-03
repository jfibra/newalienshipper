"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Package,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react"

type UserProfile = {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
  full_name: string
  role: string
  email: string
  phone: string | null
  company: string | null
  company_bio: string | null
  status: string | null
  created_at: string | null
  last_login: string | null
  agreed_terms: boolean
  newsletter_opt_in: boolean | null
  business_type: string | null
  monthly_shipping_volume: string | null
}

const businessTypes = ["ecommerce", "manufacturing", "retail", "wholesale", "healthcare", "technology", "other"]

const volumeOptions = ["1-50", "51-200", "201-500", "501-1000", "1000+"]

export default function Profile() {
  const { user } = useUser()
  // Debug: log user id and email
  useEffect(() => {
    if (user) {
      console.log("[Profile Debug] Auth user.id:", user.id)
      console.log("[Profile Debug] Auth user.email:", user.email)
    }
  }, [user])
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(async ({ data, error }) => {
        if (data) {
          setProfile(data)
          setForm(data)
          setLoading(false)
        } else {
          // Try to find by email in case id is mismatched
          const { data: byEmail } = await supabase.from("users").select("*").eq("email", user.email).single()
          if (byEmail) {
            // Update the id to match auth user
            await supabase.from("users").update({ id: user.id }).eq("email", user.email)
            setProfile({ ...byEmail, id: user.id })
            setForm({ ...byEmail, id: user.id })
            setLoading(false)
            return
          }
          // Auto-create profile row if not found by id or email
          const meta = user.user_metadata || {}
          const first_name = meta.first_name || (meta.full_name ? meta.full_name.split(" ")[0] : "")
          const last_name = meta.last_name || (meta.full_name ? meta.full_name.split(" ").slice(1).join(" ") : "")
          const newProfile = {
            id: user.id,
            first_name: first_name || "",
            middle_name: null,
            last_name: last_name || "",
            role: "user",
            email: user.email,
            phone: null,
            company: null,
            company_bio: null,
            status: "active",
            agreed_terms: false,
            newsletter_opt_in: false,
            business_type: null,
            monthly_shipping_volume: null,
          }
          const { error: insertError } = await supabase.from("users").insert([newProfile])
          if (!insertError) {
            // Refetch
            const { data: created } = await supabase.from("users").select("*").eq("id", user.id).single()
            setProfile(created)
            setForm(created)
          }
          setLoading(false)
        }
      })
  }, [user])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    let fieldValue: string | boolean = value
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked
    }
    setForm((f) => ({
      ...f,
      [name]: fieldValue,
    }))
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    if (!user) return

    const update = { ...form }
    // Don't allow editing id, email, role, status, created_at, last_login, full_name
    delete update.id
    delete update.email
    delete update.role
    delete update.status
    delete update.created_at
    delete update.last_login
    delete update.full_name

    const { error: upError } = await supabase.from("users").update(update).eq("id", user.id)

    if (upError) {
      setError(upError.message)
    } else {
      setSuccess("Profile updated successfully!")
      setEditing(false)
      // Refetch profile
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      setProfile(data)
      setForm(data)
      setTimeout(() => setSuccess(""), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-blue-400 border-b-transparent rounded-full animate-spin mx-auto opacity-60"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="text-purple-200 font-medium">Loading your cosmic profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl border border-red-400/20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-red-200">Unable to load your profile. Please contact our alien support team.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-slate-800 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-slate-800" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {profile.full_name || "Space Captain"}
                </h1>
                <p className="text-purple-300/80 flex items-center mt-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Intergalactic Shipper • {profile.status}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setEditing(!editing)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                editing
                  ? "bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-500 hover:to-pink-500 border border-red-400/20"
                  : "bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 border border-purple-400/20"
              }`}
            >
              {editing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
          <span className="text-green-200 font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-400/20 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
          <span className="text-red-200 font-medium">{error}</span>
        </div>
      )}

      {/* Profile Content */}
      {!editing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-3 text-purple-400" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Mail className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <div className="text-xs text-purple-300/70 uppercase tracking-wide">Email</div>
                    <div className="text-white font-medium">{profile.email}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Phone className="w-5 h-5 text-blue-400 mr-3" />
                  <div>
                    <div className="text-xs text-blue-300/70 uppercase tracking-wide">Phone</div>
                    <div className="text-white font-medium">{profile.phone || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Calendar className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <div className="text-xs text-green-300/70 uppercase tracking-wide">Member Since</div>
                    <div className="text-white font-medium">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Building className="w-5 h-5 mr-3 text-blue-400" />
                Business Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Building className="w-5 h-5 text-blue-400 mr-3" />
                  <div>
                    <div className="text-xs text-blue-300/70 uppercase tracking-wide">Company</div>
                    <div className="text-white font-medium">{profile.company || "Not provided"}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <FileText className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <div className="text-xs text-purple-300/70 uppercase tracking-wide">Business Type</div>
                    <div className="text-white font-medium capitalize">{profile.business_type || "Not specified"}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Package className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <div className="text-xs text-green-300/70 uppercase tracking-wide">Monthly Volume</div>
                    <div className="text-white font-medium">
                      {profile.monthly_shipping_volume || "Not specified"} packages
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-3 text-purple-400" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">First Name</label>
                    <Input
                      name="first_name"
                      value={form.first_name || ""}
                      onChange={handleChange}
                      required
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Middle Name</label>
                    <Input
                      name="middle_name"
                      value={form.middle_name || ""}
                      onChange={handleChange}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Last Name</label>
                    <Input
                      name="last_name"
                      value={form.last_name || ""}
                      onChange={handleChange}
                      required
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Phone</label>
                    <Input
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      type="tel"
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Building className="w-5 h-5 mr-3 text-blue-400" />
                  Business Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Company</label>
                    <Input
                      name="company"
                      value={form.company || ""}
                      onChange={handleChange}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Business Type</label>
                    <select
                      name="business_type"
                      value={form.business_type || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white focus:border-blue-400 focus:ring-blue-400/20 focus:ring-2 outline-none"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type} className="capitalize">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Monthly Shipping Volume</label>
                    <select
                      name="monthly_shipping_volume"
                      value={form.monthly_shipping_volume || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white focus:border-blue-400 focus:ring-blue-400/20 focus:ring-2 outline-none"
                    >
                      <option value="">Select volume range</option>
                      {volumeOptions.map((volume) => (
                        <option key={volume} value={volume}>
                          {volume} packages
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Company Bio</label>
                    <textarea
                      name="company_bio"
                      value={form.company_bio || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-2 outline-none resize-none"
                      placeholder="Tell us about your business..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-green-400" />
                Preferences
              </h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="newsletter_opt_in"
                    checked={!!form.newsletter_opt_in}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500/20 focus:ring-2"
                  />
                  <span className="text-white font-medium">Subscribe to intergalactic newsletter</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-green-400/20 hover:border-green-400/40"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
