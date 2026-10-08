import { 
  AIAssistanceAction, 
  AIAssistRequestPayload, 
  AIAssistResponsePayload 
} from '../types/application';

/**
 * Dedicated AI Assistance Service for FundEcho Application & Proposal Workspace.
 * Proxies calls securely to the backend /api/ai/application-assist endpoint.
 */
export async function requestAIAssistance(
  payload: AIAssistRequestPayload
): Promise<AIAssistResponsePayload> {
  try {
    const response = await fetch('/api/ai/application-assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        action: payload.action,
        fieldKey: payload.fieldKey,
        resultText: '',
        timestamp: new Date().toISOString(),
        error: errorData.error || `Server returned error (${response.status})`,
        fallbackAvailable: errorData.fallbackAvailable ?? true,
      };
    }

    const data: AIAssistResponsePayload = await response.json();
    return data;
  } catch (err: any) {
    console.error('Client AI Service Request Failed:', err);
    return {
      success: false,
      action: payload.action,
      fieldKey: payload.fieldKey,
      resultText: '',
      timestamp: new Date().toISOString(),
      error: 'Unable to connect to the AI assistance service. Please check your connection or server status.',
      fallbackAvailable: true,
    };
  }
}

/**
 * Action metadata for UI rendering
 */
export interface AIAssistanceActionConfig {
  id: AIAssistanceAction;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  promptPlaceholder?: string;
}

export const AI_ASSISTANCE_ACTIONS: AIAssistanceActionConfig[] = [
  {
    id: 'improve_writing',
    label: 'Improve Writing & Clarity',
    shortLabel: 'Improve Writing',
    description: 'Polishes grammar, enhances flow, and strengthens active phrasing while strictly keeping your factual details.',
    iconName: 'Sparkles',
    promptPlaceholder: 'Optional focus: e.g. "Focus on executive clarity" or "Highlight urgency"',
  },
  {
    id: 'expand',
    label: 'Expand Details & Methodology',
    shortLabel: 'Expand',
    description: 'Elaborates on key points with structured sections, mechanisms, and implementation steps.',
    iconName: 'Maximize2',
    promptPlaceholder: 'Optional focus: e.g. "Add details on community onboarding process"',
  },
  {
    id: 'make_professional',
    label: 'Make More Professional',
    shortLabel: 'Make More Professional',
    description: 'Elevates to formal grant proposal register suitable for institutional review committees.',
    iconName: 'Briefcase',
    promptPlaceholder: 'Optional focus: e.g. "Align with United Nations/EU grant terminology"',
  },
  {
    id: 'generate_draft',
    label: 'Generate Initial Draft from Notes',
    shortLabel: 'Generate Draft',
    description: 'Creates a structured first draft outline based on your rough bullet points and opportunity goals.',
    iconName: 'FileText',
    promptPlaceholder: 'Enter your rough notes, bullet points, or core ideas here...',
  },
  {
    id: 'shorten',
    label: 'Shorten & Condense',
    shortLabel: 'Shorten',
    description: 'Tightens wording to meet strict word limits without sacrificing key impact claims.',
    iconName: 'Minimize2',
    promptPlaceholder: 'Optional focus: e.g. "Keep under 150 words"',
  },
  {
    id: 'explain_question',
    label: 'Explain Question & Reviewer Expectations',
    shortLabel: 'Explain Question',
    description: 'Breaks down what grant evaluators specifically look for and how to maximize your score.',
    iconName: 'HelpCircle',
  },
];
