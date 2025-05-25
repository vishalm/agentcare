/**
 * Multi-Tenant Healthcare SaaS Type Definitions
 * Comprehensive types for AgentCare multi-tenant architecture
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  subtype?: string;
  size?: OrganizationSize;
  address: Address;
  contactInfo: ContactInfo;
  businessHours?: BusinessHours;
  timezone?: string;
  licenseNumber?: string;
  taxId?: string;
  npiNumber?: string;
  accreditation?: Accreditation[];
  logoUrl?: string;
  website?: string;
  brandColors?: BrandColors;
  customDomain?: string;
  settings: OrganizationSettings;
  featuresEnabled: string[];
  integrationConfig?: IntegrationConfig;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Date;
  billingInfo?: BillingInfo;
  isActive: boolean;
  isVerified: boolean;
  onboardingStatus: OnboardingStep;
  createdAt: Date;
  updatedAt: Date;
  onboardedAt?: Date;
  onboardedBy?: string;
}

export type OrganizationType = 
  | 'hospital' 
  | 'clinic' 
  | 'practice'
  | 'urgent_care'
  | 'specialty_center'
  | 'telehealth'
  | 'multi_location';

export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  building?: string;
  floor?: string;
  suite?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  fax?: string;
  website?: string;
  emergencyPhone?: string;
}

export interface BusinessHours {
  [day: string]: {
    open: string;
    close: string;
    isClosed?: boolean;
  };
}

export interface Accreditation {
  type: string;
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiresDate?: Date;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface OrganizationSettings {
  allowSelfRegistration?: boolean;
  requireEmailVerification?: boolean;
  enableTwoFactor?: boolean;
  allowCaregiverAccess?: boolean;
  requirePatientConsent?: boolean;
  appointmentReminderHours?: number;
  cancellationPolicyHours?: number;
  allowOnlineBooking?: boolean;
  [key: string]: any;
}

export interface IntegrationConfig {
  ehr?: EHRIntegration;
  billing?: BillingIntegration;
  lab?: LabIntegration;
  pharmacy?: PharmacyIntegration;
  imaging?: ImagingIntegration;
  [key: string]: any;
}

export interface EHRIntegration {
  provider: string;
  apiEndpoint: string;
  apiKey?: string;
  isEnabled: boolean;
  lastSync?: Date;
}

export interface BillingIntegration {
  provider: string;
  accountId: string;
  isEnabled: boolean;
  defaultCodes?: string[];
}

export interface LabIntegration {
  provider: string;
  facilityId: string;
  isEnabled: boolean;
  supportedTests?: string[];
}

export interface PharmacyIntegration {
  provider: string;
  networkId: string;
  isEnabled: boolean;
  preferredPharmacies?: string[];
}

export interface ImagingIntegration {
  provider: string;
  facilityId: string;
  isEnabled: boolean;
  supportedModalities?: string[];
}

export type SubscriptionPlan = 'trial' | 'basic' | 'professional' | 'enterprise' | 'custom';

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';

export interface BillingInfo {
  paymentMethod?: PaymentMethod;
  billingAddress?: Address;
  billingContact?: ContactInfo;
  invoiceEmail?: string;
  taxExempt?: boolean;
  taxExemptId?: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank' | 'check' | 'wire';
  last4?: string;
  brand?: string;
  expiresMonth?: number;
  expiresYear?: number;
  bankName?: string;
  accountLast4?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  category: RoleCategory;
  level: number;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: Date;
}

export type RoleCategory = 
  | 'management'
  | 'provider'
  | 'nursing'
  | 'support'
  | 'allied_health'
  | 'patient'
  | 'caregiver'
  | 'external';

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: string; // Role name or ID
  additionalRoles?: string[];
  permissions: string[];
  employeeId?: string;
  department?: string;
  title?: string;
  specialties?: string[];
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiresAt?: Date;
  deaNumber?: string;
  npiNumber?: string;
  certifications?: Certification[];
  hireDate?: Date;
  employmentType?: EmploymentType;
  workSchedule?: WorkSchedule;
  isActive: boolean;
  isVerified: boolean;
  accessLevel: number;
  lastLoginAt?: Date;
  passwordExpiresAt?: Date;
  requires2FA: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Certification {
  name: string;
  issuedBy: string;
  number: string;
  issuedDate: Date;
  expiresDate?: Date;
  isActive: boolean;
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'per_diem' | 'volunteer';

export interface WorkSchedule {
  type: 'fixed' | 'rotating' | 'flexible' | 'on_call';
  hoursPerWeek?: number;
  daysPerWeek?: number;
  shiftStart?: string;
  shiftEnd?: string;
  schedule?: ScheduleEntry[];
}

export interface ScheduleEntry {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface PatientCaregiver {
  id: string;
  organizationId: string;
  patientId: string;
  caregiverId: string;
  relationshipType: RelationshipType;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  authorizationLevel: AuthorizationLevel;
  authorizedActions: string[];
  authorizationDocumentUrl?: string;
  authorizedBy: string;
  authorizedAt?: Date;
  canScheduleAppointments: boolean;
  canReceiveMedicalInfo: boolean;
  canMakeMedicalDecisions: boolean;
  preferredContactMethod?: ContactMethod;
  isActive: boolean;
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RelationshipType = 
  | 'spouse'
  | 'parent'
  | 'child'
  | 'guardian'
  | 'power_of_attorney'
  | 'professional_caregiver'
  | 'sibling'
  | 'grandparent'
  | 'other_family'
  | 'friend'
  | 'healthcare_proxy';

export type AuthorizationLevel = 'basic' | 'full' | 'medical_decisions' | 'financial' | 'emergency_only';

export type ContactMethod = 'phone' | 'email' | 'sms' | 'portal' | 'mail';

export interface OrganizationDepartment {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  description?: string;
  departmentType: DepartmentType;
  parentDepartmentId?: string;
  headUserId?: string;
  location?: DepartmentLocation;
  contactInfo?: ContactInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DepartmentType = 'clinical' | 'administrative' | 'support' | 'ancillary';

export interface DepartmentLocation {
  building?: string;
  floor?: string;
  wing?: string;
  room?: string;
  address?: Address;
}

export interface OrganizationStats {
  totalUsers: number;
  totalProviders: number;
  totalPatients: number;
  totalStaff?: number;
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
  averageRating?: number;
  totalRatings?: number;
  subscriptionStatus: SubscriptionStatus;
  storageUsed: number;
  storageLimit: number;
  activeDepartments?: number;
  licensedProviders?: number;
  verifiedUsers?: number;
}

export interface OnboardingStatus {
  step: OnboardingStep;
  completedSteps: string[];
  currentStep: string;
  totalSteps: number;
  isComplete: boolean;
  organizationId: string;
  progress?: number;
  nextActions?: string[];
  blockers?: string[];
}

export type OnboardingStep = 
  | 'pending'
  | 'organization'
  | 'admin_user'
  | 'settings'
  | 'providers'
  | 'departments'
  | 'billing'
  | 'integration'
  | 'testing'
  | 'completed';

export interface TenantContext {
  organizationId: string;
  userId?: string;
  userRole?: string;
  permissions?: string[];
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  userType: UserType;
  dateOfBirth?: Date;
  gender?: Gender;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  medicalRecordNumber?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
  isActive: boolean;
  isVerified: boolean;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserType = 'patient' | 'provider' | 'caregiver' | 'admin' | 'staff';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
  isPrimary?: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberId?: string;
  subscriberName?: string;
  relationship?: string;
  effectiveDate?: Date;
  expirationDate?: Date;
  copay?: number;
  deductible?: number;
  isActive?: boolean;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  appointmentReminders?: boolean;
  marketingEmails?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  accessibility?: AccessibilityPreferences;
}

export interface AccessibilityPreferences {
  highContrast?: boolean;
  largeText?: boolean;
  screenReader?: boolean;
  reduceMotion?: boolean;
  colorBlindAssist?: boolean;
}

export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  departmentId?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  duration: number;
  endTime?: Date;
  notes?: string;
  chiefComplaint?: string;
  priority?: AppointmentPriority;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  remindersSent?: Date[];
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  noShowReason?: string;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type AppointmentType = 
  | 'consultation'
  | 'follow_up'
  | 'procedure'
  | 'surgery'
  | 'therapy'
  | 'diagnostic'
  | 'emergency'
  | 'telehealth'
  | 'vaccination'
  | 'screening';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type AppointmentPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export interface MedicalRecord {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  recordType: MedicalRecordType;
  title?: string;
  content: string;
  diagnosis?: string[];
  medications?: string[];
  allergies?: string[];
  vitals?: VitalSigns;
  isSensitive?: boolean;
  isConfidential?: boolean;
  accessRestrictions?: string[];
  attachments?: MedicalAttachment[];
  tags?: string[];
  version?: number;
  previousVersionId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

export type MedicalRecordType = 
  | 'consultation'
  | 'progress_note'
  | 'procedure_note'
  | 'discharge_summary'
  | 'lab_result'
  | 'imaging_report'
  | 'prescription'
  | 'referral'
  | 'psychiatric'
  | 'addiction'
  | 'general';

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: 'celsius' | 'fahrenheit';
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  height?: number;
  heightUnit?: 'cm' | 'inches';
  bmi?: number;
  painLevel?: number; // 1-10 scale
  recordedAt?: Date;
  recordedBy?: string;
}

export interface MedicalAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  isEncrypted?: boolean;
  uploadedAt: Date;
  uploadedBy: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  path?: string;
  method?: string;
  statusCode?: number;
  validationErrors?: ValidationError[];
}

// Database Query Types
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: any;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  include?: string[];
  exclude?: string[];
}

// Audit and Logging Types
export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SecurityEvent {
  id: string;
  organizationId?: string;
  userId?: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  metadata?: any;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  timestamp: Date;
}

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'password_change'
  | 'permission_denied'
  | 'data_access'
  | 'data_modification'
  | 'export_request'
  | 'suspicious_activity'
  | 'account_lockout';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

// Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolMin?: number;
  poolMax?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
  ttl?: number;
}

export interface EmailConfig {
  provider: string;
  apiKey?: string;
  from: string;
  replyTo?: string;
  templates?: { [key: string]: string };
}

export interface StorageConfig {
  provider: 'local' | 'aws_s3' | 'gcp_storage' | 'azure_blob';
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
  encryptionKey?: string;
}

// Service Interfaces
export interface MultiTenantServiceOptions {
  enableRLS?: boolean;
  defaultTenant?: string;
  tenantHeader?: string;
  tenantCookieName?: string;
  enforceIsolation?: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  appointmentChanges: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
}

export interface HealthcareProvider {
  id: string;
  userId: string;
  organizationId: string;
  licenseNumber: string;
  licenseState: string;
  licenseType: string;
  licenseStatus: 'active' | 'inactive' | 'suspended' | 'expired';
  licenseExpiresAt: Date;
  deaNumber?: string;
  npiNumber?: string;
  specialties: string[];
  boardCertifications: BoardCertification[];
  education: Education[];
  experience: Experience[];
  isAcceptingPatients: boolean;
  averageRating?: number;
  totalRatings?: number;
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardCertification {
  boardName: string;
  specialty: string;
  certificationDate: Date;
  expirationDate?: Date;
  isActive: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
  isVerified: boolean;
}

export interface Experience {
  organization: string;
  position: string;
  specialty?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

// Type Guards
export function isOrganization(obj: any): obj is Organization {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.slug === 'string';
}

export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string' && typeof obj.organizationId === 'string';
}

export function isOrganizationUser(obj: any): obj is OrganizationUser {
  return obj && typeof obj.organizationId === 'string' && typeof obj.userId === 'string';
}

export function isPatientCaregiver(obj: any): obj is PatientCaregiver {
  return obj && typeof obj.patientId === 'string' && typeof obj.caregiverId === 'string';
} 