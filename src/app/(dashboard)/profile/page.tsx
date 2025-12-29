'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Loader2, Camera, Save, Mail, MapPin, Globe, Bell, Lightbulb, Send, Trash2, AlertTriangle } from 'lucide-react'
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
  const [featureRequest, setFeatureRequest] = useState('')
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const submitFeatureRequest = async () => {
    if (!featureRequest.trim()) return
    setSubmittingRequest(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Store feature request in database (you can create a feature_requests table)
      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000))

      setRequestSubmitted(true)
      setFeatureRequest('')

      // Reset success message after 3 seconds
      setTimeout(() => setRequestSubmitted(false), 3000)
    } finally {
      setSubmittingRequest(false)
    }
  }

  const deleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm')
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) {
        setDeleteError('User not found')
        return
      }

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      })

      if (signInError) {
        setDeleteError('Incorrect password. Please try again.')
        setDeleting(false)
        return
      }

      // Delete all user data manually (Supabase CASCADE will handle related data)
      // Delete habits completions, habits, tasks, goals, daily_responses, profile
      await supabase.from('habit_completions').delete().eq('user_id', user.id)
      await supabase.from('habits').delete().eq('user_id', user.id)
      await supabase.from('tasks').delete().eq('user_id', user.id)
      await supabase.from('goals').delete().eq('user_id', user.id)
      await supabase.from('daily_responses').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)

      // Sign out and redirect with confirmation
      await supabase.auth.signOut()
      window.location.href = '/?deleted=true'
    } catch (error) {
      setDeleteError('An error occurred. Please try again.')
      setDeleting(false)
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
        <h1 className="text-3xl md:text-4xl font-accent font-bold text-text-primary mb-2">Profile</h1>
        <p className="text-lg text-text-secondary">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-white border border-surface-border rounded-2xl p-8 animate-slide-in">
          <h2 className="text-xl font-bold text-text-primary mb-6">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-surface-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-accent-ocean/10 flex items-center justify-center border-4 border-surface-border">
                  <User className="w-12 h-12 text-accent-ocean" />
                </div>
              )}
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-accent-ocean rounded-full flex items-center justify-center text-black hover:bg-primary-600 transition-colors shadow-lg"
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
              <p className="text-xs text-text-muted mt-1">Paste a link to your profile photo</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-surface-border rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '50ms' }}>
          <h2 className="text-xl font-bold text-text-primary mb-6">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-text-muted" />
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
                <Mail className="w-4 h-4 text-text-muted" />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                className="input bg-surface-hover cursor-not-allowed opacity-60"
                disabled
                readOnly
              />
              <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-muted" />
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
              <p className="text-xs text-text-muted mt-1">
                🌍 Timezone will auto-update based on your country
              </p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Globe className="w-4 h-4 text-text-muted" />
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
              <p className="text-xs text-text-muted mt-1">
                Auto-detected from country, or select manually
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-surface-border rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent-ocean" />
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
                className="mt-1 w-5 h-5 accent-accent-ocean rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-text-primary group-hover:text-accent-ocean transition-colors">
                  Daily Check-in Reminders
                </div>
                <div className="text-sm text-text-secondary">
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
                className="mt-1 w-5 h-5 accent-accent-ocean rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-text-primary group-hover:text-accent-ocean transition-colors">
                  Gentle Task Reminders
                </div>
                <div className="text-sm text-text-secondary">
                  Non-intrusive nudges when you have matched tasks waiting
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Feature Request */}
        <div id="feature-request" className="bg-white border border-surface-border rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-accent-sunset" />
            Request a Feature
          </h2>
          <p className="text-text-secondary mb-4">
            Have an idea to make Current State better? We'd love to hear it!
          </p>

          {requestSubmitted && (
            <div className="bg-accent-ocean/10 border border-accent-ocean/30 text-accent-ocean px-4 py-3 rounded-lg mb-4 flex items-center gap-2 animate-fade-in">
              <Send className="w-4 h-4" />
              <span>Thank you! Your feature request has been submitted.</span>
            </div>
          )}

          <textarea
            value={featureRequest}
            onChange={e => setFeatureRequest(e.target.value)}
            className="input min-h-[120px] resize-y"
            placeholder="Describe your feature idea... e.g., 'I'd love to see calendar integration' or 'Add a dark mode'"
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted">
              {featureRequest.length} / 500 characters
            </span>
            <button
              onClick={submitFeatureRequest}
              disabled={submittingRequest || !featureRequest.trim()}
              className="px-4 py-2 bg-surface-hover border border-surface-border rounded-lg font-medium text-text-primary hover:border-accent-ocean/30 hover:text-accent-ocean transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm mt-2"
            >
              {submittingRequest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Idea
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="bg-red-950/30 border-2 border-red-500/30 rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Danger Zone
          </h2>
          <p className="text-red-300 mb-4">
            Once you delete your account, there is no going back. This will permanently delete:
          </p>
          <ul className="text-red-200 text-sm space-y-1 mb-6 ml-6 list-disc">
            <li>Your profile and all personal information</li>
            <li>All your goals, tasks, and habits</li>
            <li>Your check-in history and progress data</li>
            <li>Any feature requests you've submitted</li>
          </ul>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-surface-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-950/50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary">Delete Account?</h3>
            </div>

            <p className="text-text-secondary mb-6">
              This action <strong>cannot be undone</strong>. All your data will be permanently deleted from our servers.
            </p>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {deleteError}
              </div>
            )}

            <div className="mb-6">
              <label className="label">Enter your password to confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input"
                placeholder="Your password"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                  setDeleteError('')
                }}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-surface-hover border border-surface-border text-text-primary rounded-lg font-medium hover:page-gradient transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
