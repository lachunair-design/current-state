import { GoalCategory, EnergyLevel, WorkType, TimeEstimate, PriorityLevel } from '@/types/database'

export interface TaskSuggestion {
  title: string
  description?: string
  energy_required: EnergyLevel
  work_type: WorkType
  time_estimate: TimeEstimate
  priority: PriorityLevel
}

// Pre-built task templates for each goal category
export const GOAL_TASK_SUGGESTIONS: Record<GoalCategory, TaskSuggestion[]> = {
  career: [
    {
      title: 'Update resume with recent achievements',
      energy_required: 'medium',
      work_type: 'admin',
      time_estimate: 'medium',
      priority: 'should_do'
    },
    {
      title: 'Update LinkedIn profile',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'short',
      priority: 'should_do'
    },
    {
      title: 'Research companies in target industry',
      energy_required: 'medium',
      work_type: 'steady_focus',
      time_estimate: 'medium',
      priority: 'should_do'
    },
    {
      title: 'Prepare for common interview questions',
      energy_required: 'high',
      work_type: 'deep_work',
      time_estimate: 'long',
      priority: 'could_do'
    },
    {
      title: 'Network on LinkedIn - connect with 10 people',
      energy_required: 'low',
      work_type: 'light_lift',
      time_estimate: 'short',
      priority: 'could_do'
    },
  ],
  business: [
    {
      title: 'Define your unique value proposition',
      energy_required: 'high',
      work_type: 'deep_work',
      time_estimate: 'long',
      priority: 'must_do'
    },
    {
      title: 'Research competitors and pricing',
      energy_required: 'medium',
      work_type: 'steady_focus',
      time_estimate: 'medium',
      priority: 'must_do'
    },
    {
      title: 'Create basic business plan outline',
      energy_required: 'high',
      work_type: 'deep_work',
      time_estimate: 'long',
      priority: 'should_do'
    },
    {
      title: 'Design minimal viable product (MVP)',
      energy_required: 'high',
      work_type: 'steady_focus',
      time_estimate: 'extended',
      priority: 'must_do'
    },
    {
      title: 'Set up business social media profiles',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'short',
      priority: 'could_do'
    },
    {
      title: 'Register business name and domain',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'short',
      priority: 'should_do'
    },
  ],
  finance: [
    {
      title: 'Track all expenses for one month',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'short',
      priority: 'must_do'
    },
    {
      title: 'Create monthly budget spreadsheet',
      energy_required: 'medium',
      work_type: 'admin',
      time_estimate: 'medium',
      priority: 'must_do'
    },
    {
      title: 'Research high-yield savings accounts',
      energy_required: 'low',
      work_type: 'steady_focus',
      time_estimate: 'short',
      priority: 'should_do'
    },
    {
      title: 'Set up automated savings transfer',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'tiny',
      priority: 'should_do'
    },
    {
      title: 'Review and cancel unused subscriptions',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'short',
      priority: 'could_do'
    },
    {
      title: 'Research investment options for beginners',
      energy_required: 'medium',
      work_type: 'steady_focus',
      time_estimate: 'medium',
      priority: 'could_do'
    },
  ],
  health: [
    {
      title: 'Schedule annual physical checkup',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'tiny',
      priority: 'should_do'
    },
    {
      title: 'Plan healthy meals for the week',
      energy_required: 'medium',
      work_type: 'steady_focus',
      time_estimate: 'short',
      priority: 'should_do'
    },
    {
      title: 'Research workout routines for beginners',
      energy_required: 'low',
      work_type: 'steady_focus',
      time_estimate: 'short',
      priority: 'could_do'
    },
    {
      title: 'Set sleep schedule and stick to it',
      energy_required: 'medium',
      work_type: 'admin',
      time_estimate: 'tiny',
      priority: 'must_do'
    },
    {
      title: 'Buy healthy groceries for the week',
      energy_required: 'medium',
      work_type: 'light_lift',
      time_estimate: 'medium',
      priority: 'should_do'
    },
  ],
  relationships: [
    {
      title: 'Schedule weekly quality time with partner',
      energy_required: 'low',
      work_type: 'light_lift',
      time_estimate: 'tiny',
      priority: 'must_do'
    },
    {
      title: 'Call a friend you haven\'t talked to in a while',
      energy_required: 'medium',
      work_type: 'light_lift',
      time_estimate: 'short',
      priority: 'should_do'
    },
    {
      title: 'Plan a date night or family outing',
      energy_required: 'medium',
      work_type: 'steady_focus',
      time_estimate: 'short',
      priority: 'could_do'
    },
    {
      title: 'Write thank you notes to 3 people',
      energy_required: 'low',
      work_type: 'steady_focus',
      time_estimate: 'short',
      priority: 'could_do'
    },
    {
      title: 'Join a local community group or club',
      energy_required: 'medium',
      work_type: 'light_lift',
      time_estimate: 'short',
      priority: 'could_do'
    },
  ],
  personal: [
    {
      title: 'Start a daily journaling practice',
      energy_required: 'low',
      work_type: 'steady_focus',
      time_estimate: 'tiny',
      priority: 'could_do'
    },
    {
      title: 'Learn a new skill - choose one',
      energy_required: 'high',
      work_type: 'steady_focus',
      time_estimate: 'extended',
      priority: 'could_do'
    },
    {
      title: 'Declutter one room or area',
      energy_required: 'medium',
      work_type: 'light_lift',
      time_estimate: 'medium',
      priority: 'could_do'
    },
    {
      title: 'Read one book this month',
      energy_required: 'low',
      work_type: 'steady_focus',
      time_estimate: 'tiny',
      priority: 'could_do'
    },
    {
      title: 'Practice mindfulness or meditation',
      energy_required: 'low',
      work_type: 'deep_work',
      time_estimate: 'tiny',
      priority: 'should_do'
    },
  ],
}

// Smart keyword-based suggestions
export function getSmartTaskSuggestions(goalTitle: string, category: GoalCategory): TaskSuggestion[] {
  const lower = goalTitle.toLowerCase()
  const baseSuggestions = GOAL_TASK_SUGGESTIONS[category] || []

  // Add smart, context-aware suggestions based on keywords
  const smartSuggestions: TaskSuggestion[] = []

  // Job search keywords
  if (lower.includes('job') || lower.includes('hire') || lower.includes('career change')) {
    smartSuggestions.push(
      {
        title: 'Apply to 5 relevant job postings',
        energy_required: 'medium',
        work_type: 'admin',
        time_estimate: 'long',
        priority: 'must_do'
      },
      {
        title: 'Reach out to 3 recruiters on LinkedIn',
        energy_required: 'medium',
        work_type: 'light_lift',
        time_estimate: 'short',
        priority: 'should_do'
      }
    )
  }

  // Business/startup keywords
  if (lower.includes('launch') || lower.includes('startup') || lower.includes('business')) {
    smartSuggestions.push(
      {
        title: `Validate idea - talk to 10 potential customers`,
        energy_required: 'high',
        work_type: 'light_lift',
        time_estimate: 'extended',
        priority: 'must_do'
      },
      {
        title: 'Build landing page to collect emails',
        energy_required: 'high',
        work_type: 'steady_focus',
        time_estimate: 'long',
        priority: 'should_do'
      }
    )
  }

  // Finance keywords
  if (lower.includes('save') || lower.includes('debt') || lower.includes('money')) {
    smartSuggestions.push({
      title: 'Calculate total debt and create payoff plan',
      energy_required: 'medium',
      work_type: 'admin',
      time_estimate: 'medium',
      priority: 'must_do'
    })
  }

  // Health/fitness keywords
  if (lower.includes('weight') || lower.includes('fit') || lower.includes('healthy')) {
    smartSuggestions.push({
      title: 'Set up fitness tracking app',
      energy_required: 'low',
      work_type: 'admin',
      time_estimate: 'tiny',
      priority: 'should_do'
    })
  }

  // Learning keywords
  if (lower.includes('learn') || lower.includes('skill') || lower.includes('course')) {
    smartSuggestions.push({
      title: 'Research and enroll in online course',
      energy_required: 'medium',
      work_type: 'steady_focus',
      time_estimate: 'short',
      priority: 'must_do'
    })
  }

  // Combine smart suggestions with category defaults, removing duplicates
  const allSuggestions = [...smartSuggestions, ...baseSuggestions]
  const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
    index === self.findIndex((s) => s.title === suggestion.title)
  )

  // Return top 6 suggestions
  return uniqueSuggestions.slice(0, 6)
}
