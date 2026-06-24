export const APP_NAME = 'VoxFunnels'
export const APP_DESCRIPTION = 'Crie funis interativos que qualificam leads automaticamente e enviam os contatos certos para o WhatsApp, CRM ou automação.'


export const CLASSIFICATION_CONFIG = {
  COLD: { label: 'Frio', color: '#93C5FD', bgColor: '#DBEAFE', emoji: '🧊', min: 0, max: 30 },
  WARM: { label: 'Morno', color: '#FBBF24', bgColor: '#FEF3C7', emoji: '🌤️', min: 31, max: 60 },
  HOT: { label: 'Quente', color: '#FB923C', bgColor: '#FFEDD5', emoji: '🔥', min: 61, max: 85 },
  VERY_HOT: { label: 'Muito Quente', color: '#EF4444', bgColor: '#FEE2E2', emoji: '🌋', min: 86, max: 100 },
} as const

export const STEP_TYPE_CONFIG = {
  WELCOME: { label: 'Boas-vindas', icon: 'Sparkles', color: '#8B5CF6' },
  MULTIPLE_CHOICE: { label: 'Múltipla Escolha', icon: 'ListChecks', color: '#3B82F6' },
  OPEN_QUESTION: { label: 'Pergunta Aberta', icon: 'MessageSquare', color: '#10B981' },
  CAPTURE_FORM: { label: 'Formulário de Captura', icon: 'ClipboardList', color: '#F59E0B' },
  LOADING: { label: 'Tela de Loading', icon: 'Loader2', color: '#6366F1' },
  RESULT: { label: 'Resultado', icon: 'Trophy', color: '#EC4899' },
  REDIRECT: { label: 'Redirecionamento', icon: 'ExternalLink', color: '#14B8A6' },
  IMAGE_CHOICE: { label: 'Escolha de Imagem', icon: 'Image', color: '#D946EF' },
  BEFORE_AFTER: { label: 'Antes & Depois', icon: 'Split', color: '#06B6D4' },
} as const

export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
] as const

export const DEFAULT_THEME = {
  primaryColor: '#6366F1',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'Inter' as const,
  borderRadius: 12,
  mode: 'light' as const,
}

export const DEFAULT_WHATSAPP_MESSAGE = 'Olá, meu nome é {{nome}}. Acabei de preencher o diagnóstico "{{funil}}" e minha classificação foi {{classificacao}}.'

export const LEADS_PER_PAGE = 20
export const FUNNELS_PER_PAGE = 20
