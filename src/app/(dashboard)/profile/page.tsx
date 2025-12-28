'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Loader2, Camera, Save, Mail, MapPin, Globe, Bell } from 'lucide-react'
import { COUNTRIES, TIMEZONES, getTimezoneForCountry } from '@/lib/countries'
import clsx from 'clsx'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Form state
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [timezone, setTimezone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [notificationPreferences, setNotificationPreferences] = useState({
    daily_checkin: true,
    gentle_reminders: true,
  })

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode)
    // Auto-update timezone based on country
    if (countryCode) {
      const detectedTimezone = getTimezoneForCountry(countryCode)
      setTimezone(detectedTimezone)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: any }

    if (data) {
      setProfile({ ...data, email: user.email })
      setFullName(data.full_name || '')
      setCountry(data.country || '')
      setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
      setAvatarUrl(data.avatar_url || '')
      setNotificationPreferences(data.notification_preferences || { daily_checkin: true, gentle_reminders: true })
    }
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          country: country.trim() || null,
          timezone,
          avatar_url: avatarUrl.trim() || null,
          notification_preferences: notificationPreferences,
        } as never)
        .eq('id', user.id)

      await fetchProfile()

      // Show success message
      alert('Profile updated successfully!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-lg text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="card p-8 animate-slide-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center border-4 border-gray-100">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              )}
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow-lg"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <label className="label">Photo URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="input"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Paste a link to your profile photo</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-8 animate-slide-in" style={{ animationDelay: '50ms' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                className="input bg-gray-50 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Country
              </label>
              <select
                value={country}
                onChange={e => handleCountryChange(e.target.value)}
                className="input"
              >
                <option value="">Select a country...</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                🌍 Timezone will auto-update based on your country
              </p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="input"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Auto-detected from country, or select manually
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card p-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={notificationPreferences.daily_checkin}
                onChange={e => setNotificationPreferences({
                  ...notificationPreferences,
                  daily_checkin: e.target.checked
                })}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  Daily Check-in Reminders
                </div>
                <div className="text-sm text-gray-600">
                  Get a gentle reminder to check in when you haven't done so today
                </div>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={notificationPreferences.gentle_reminders}
                onChange={e => setNotificationPreferences({
                  ...notificationPreferences,
                  gentle_reminders: e.target.checked
                })}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  Gentle Task Reminders
                </div>
                <div className="text-sm text-gray-600">
                  Non-intrusive nudges when you have matched tasks waiting
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
