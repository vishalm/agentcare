import { Logger } from '../utils/Logger';
import { 
  Organization, 
  TenantContext, 
  ITenantResolver, 
  IOrganizationService,
  OrganizationUser,
  OrganizationStats,
  OnboardingStatus,
  TenantNotFoundError,
  TenantAccessDeniedError,
  TenantSubscriptionExpiredError
} from '../types/MultiTenant';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Multi-Tenant Service for AgentCare
 * Handles organization management and tenant context
 */
export class MultiTenantService implements ITenantResolver, IOrganizationService {
  private logger: Logger;
  private tenantStorage: AsyncLocalStorage<TenantContext>;
  private organizationCache: Map<string, Organization> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.tenantStorage = new AsyncLocalStorage();
  }

  /**
   * Resolve tenant from domain
   */
  async resolveFromDomain(domain: string): Promise<Organization | null> {
    this.logger.info('Resolving tenant from domain', { domain });
    
    try {
      // Check cache first
      const cached = this.organizationCache.get(`domain:${domain}`);
      if (cached) {
        return cached;
      }

      // Query database for organization by domain
      // This would be replaced with actual database query
      const organization = await this.findOrganizationByDomain(domain);
      
      if (organization) {
        this.organizationCache.set(`domain:${domain}`, organization);
        this.organizationCache.set(`id:${organization.id}`, organization);
      }

      return organization;
    } catch (error) {
      this.logger.error('Failed to resolve tenant from domain', { domain, error });
      return null;
    }
  }

  /**
   * Resolve tenant from slug
   */
  async resolveFromSlug(slug: string): Promise<Organization | null> {
    this.logger.info('Resolving tenant from slug', { slug });
    
    try {
      const cached = this.organizationCache.get(`slug:${slug}`);
      if (cached) {
        return cached;
      }

      const organization = await this.findOrganizationBySlug(slug);
      
      if (organization) {
        this.organizationCache.set(`slug:${slug}`, organization);
        this.organizationCache.set(`id:${organization.id}`, organization);
      }

      return organization;
    } catch (error) {
      this.logger.error('Failed to resolve tenant from slug', { slug, error });
      return null;
    }
  }

  /**
   * Resolve tenant from subdomain
   */
  async resolveFromSubdomain(subdomain: string): Promise<Organization | null> {
    // Extract organization slug from subdomain
    const slug = subdomain.split('.')[0];
    return this.resolveFromSlug(slug);
  }

  /**
   * Resolve tenant from request context
   */
  async resolveFromContext(context: any): Promise<Organization | null> {
    const { domain, subdomain, slug, organizationId } = context;

    if (organizationId) {
      return this.findById(organizationId);
    }

    if (domain) {
      return this.resolveFromDomain(domain);
    }

    if (subdomain) {
      return this.resolveFromSubdomain(subdomain);
    }

    if (slug) {
      return this.resolveFromSlug(slug);
    }

    return null;
  }

  /**
   * Create a new organization
   */
  async create(data: Partial<Organization>): Promise<Organization> {
    this.logger.info('Creating new organization', { name: data.name });

    try {
      // Validate required fields
      if (!data.name || !data.slug || !data.address || !data.contactInfo) {
        throw new Error('Missing required organization fields');
      }

      // Check if slug is unique
      const existing = await this.findBySlug(data.slug);
      if (existing) {
        throw new Error(`Organization slug '${data.slug}' already exists`);
      }

      // This would be replaced with actual database insert
      const organization = await this.insertOrganization(data as Organization);
      
      // Clear cache
      this.invalidateCache();
      
      this.logger.info('Organization created successfully', { 
        id: organization.id, 
        name: organization.name 
      });

      return organization;
    } catch (error) {
      this.logger.error('Failed to create organization', { data, error });
      throw error;
    }
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    try {
      const cached = this.organizationCache.get(`id:${id}`);
      if (cached) {
        return cached;
      }

      const organization = await this.findOrganizationById(id);
      
      if (organization) {
        this.organizationCache.set(`id:${id}`, organization);
      }

      return organization;
    } catch (error) {
      this.logger.error('Failed to find organization by ID', { id, error });
      return null;
    }
  }

  /**
   * Find organization by slug
   */
  async findBySlug(slug: string): Promise<Organization | null> {
    return this.resolveFromSlug(slug);
  }

  /**
   * Update organization
   */
  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    this.logger.info('Updating organization', { id, updates: Object.keys(data) });

    try {
      const organization = await this.updateOrganization(id, data);
      
      // Clear cache
      this.invalidateCache();
      
      this.logger.info('Organization updated successfully', { id });
      return organization;
    } catch (error) {
      this.logger.error('Failed to update organization', { id, data, error });
      throw error;
    }
  }

  /**
   * Delete organization
   */
  async delete(id: string): Promise<void> {
    this.logger.info('Deleting organization', { id });

    try {
      await this.deleteOrganization(id);
      
      // Clear cache
      this.invalidateCache();
      
      this.logger.info('Organization deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete organization', { id, error });
      throw error;
    }
  }

  /**
   * Add user to organization
   */
  async addUser(organizationId: string, userId: string, role: string): Promise<OrganizationUser> {
    this.logger.info('Adding user to organization', { organizationId, userId, role });

    try {
      const orgUser = await this.insertOrganizationUser({
        organizationId,
        userId,
        role,
        permissions: this.getDefaultPermissions(role),
        isActive: true
      });

      this.logger.info('User added to organization successfully', { 
        organizationId, 
        userId, 
        role 
      });

      return orgUser;
    } catch (error) {
      this.logger.error('Failed to add user to organization', { 
        organizationId, 
        userId, 
        role, 
        error 
      });
      throw error;
    }
  }

  /**
   * Remove user from organization
   */
  async removeUser(organizationId: string, userId: string): Promise<void> {
    this.logger.info('Removing user from organization', { organizationId, userId });

    try {
      await this.deleteOrganizationUser(organizationId, userId);
      
      this.logger.info('User removed from organization successfully', { 
        organizationId, 
        userId 
      });
    } catch (error) {
      this.logger.error('Failed to remove user from organization', { 
        organizationId, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Update user role in organization
   */
  async updateUserRole(organizationId: string, userId: string, role: string): Promise<OrganizationUser> {
    this.logger.info('Updating user role in organization', { organizationId, userId, role });

    try {
      const orgUser = await this.updateOrganizationUser(organizationId, userId, {
        role,
        permissions: this.getDefaultPermissions(role)
      });

      this.logger.info('User role updated successfully', { organizationId, userId, role });
      return orgUser;
    } catch (error) {
      this.logger.error('Failed to update user role', { 
        organizationId, 
        userId, 
        role, 
        error 
      });
      throw error;
    }
  }

  /**
   * Get organization users
   */
  async getUsers(organizationId: string): Promise<OrganizationUser[]> {
    try {
      return await this.findOrganizationUsers(organizationId);
    } catch (error) {
      this.logger.error('Failed to get organization users', { organizationId, error });
      throw error;
    }
  }

  /**
   * Get organization statistics
   */
  async getStats(organizationId: string): Promise<OrganizationStats> {
    try {
      return await this.calculateOrganizationStats(organizationId);
    } catch (error) {
      this.logger.error('Failed to get organization stats', { organizationId, error });
      throw error;
    }
  }

  /**
   * Set tenant context for current request
   */
  setTenantContext(context: TenantContext): void {
    this.tenantStorage.enterWith(context);
    
    // Set database session variable for RLS
    this.setDatabaseTenantContext(context.organizationId);
  }

  /**
   * Get current tenant context
   */
  getTenantContext(): TenantContext | null {
    return this.tenantStorage.getStore() || null;
  }

  /**
   * Middleware to resolve and set tenant context
   */
  resolveTenantMiddleware() {
    return async (req: any, res: any, next: any) => {
      try {
        // Extract tenant information from request
        const domain = req.get('host');
        const subdomain = domain?.split('.')[0];
        const slug = req.params.organizationSlug || req.query.org;
        const organizationId = req.headers['x-organization-id'];

        // Resolve organization
        const organization = await this.resolveFromContext({
          domain,
          subdomain,
          slug,
          organizationId
        });

        if (!organization) {
          return res.status(404).json({
            error: 'Organization not found',
            code: 'TENANT_NOT_FOUND'
          });
        }

        // Check if organization is active
        if (!organization.isActive) {
          return res.status(403).json({
            error: 'Organization is inactive',
            code: 'TENANT_INACTIVE'
          });
        }

        // Check subscription status
        if (organization.subscriptionStatus !== 'active' && 
            organization.subscriptionStatus !== 'trial') {
          return res.status(402).json({
            error: 'Subscription required',
            code: 'SUBSCRIPTION_REQUIRED'
          });
        }

        // Set tenant context
        const context: TenantContext = {
          organizationId: organization.id,
          organization,
          user: req.user, // Assuming user is set by auth middleware
          permissions: [], // Would be loaded based on user role
          subscription: {} as any, // Would be loaded from database
          settings: organization.settings,
          timestamp: new Date()
        };

        this.setTenantContext(context);
        req.tenantContext = context;

        next();
      } catch (error) {
        this.logger.error('Failed to resolve tenant', { error });
        res.status(500).json({
          error: 'Internal server error',
          code: 'TENANT_RESOLUTION_ERROR'
        });
      }
    };
  }

  /**
   * Require tenant middleware
   */
  requireTenantMiddleware() {
    return (req: any, res: any, next: any) => {
      const context = this.getTenantContext();
      
      if (!context) {
        return res.status(400).json({
          error: 'Tenant context required',
          code: 'TENANT_REQUIRED'
        });
      }

      next();
    };
  }

  // Private helper methods
  private async setDatabaseTenantContext(organizationId: string): Promise<void> {
    // This would execute: SELECT set_tenant_context($1)
    // Implementation depends on your database driver
  }

  private getDefaultPermissions(role: string): any[] {
    const permissionMap: Record<string, any[]> = {
      admin: [
        { resource: '*', actions: ['*'] }
      ],
      manager: [
        { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'patients', actions: ['create', 'read', 'update'] },
        { resource: 'providers', actions: ['read', 'update'] },
        { resource: 'reports', actions: ['read'] }
      ],
      staff: [
        { resource: 'appointments', actions: ['create', 'read', 'update'] },
        { resource: 'patients', actions: ['read', 'update'] }
      ],
      readonly: [
        { resource: 'appointments', actions: ['read'] },
        { resource: 'patients', actions: ['read'] }
      ]
    };

    return permissionMap[role] || [];
  }

  private invalidateCache(): void {
    this.organizationCache.clear();
  }

  // Database methods (to be implemented with actual database)
  private async findOrganizationByDomain(domain: string): Promise<Organization | null> {
    // Implementation with database query
    return null;
  }

  private async findOrganizationBySlug(slug: string): Promise<Organization | null> {
    // Implementation with database query
    return null;
  }

  private async findOrganizationById(id: string): Promise<Organization | null> {
    // Implementation with database query
    return null;
  }

  private async insertOrganization(data: Organization): Promise<Organization> {
    // Implementation with database insert
    throw new Error('Not implemented');
  }

  private async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    // Implementation with database update
    throw new Error('Not implemented');
  }

  private async deleteOrganization(id: string): Promise<void> {
    // Implementation with database delete
    throw new Error('Not implemented');
  }

  private async insertOrganizationUser(data: Partial<OrganizationUser>): Promise<OrganizationUser> {
    // Implementation with database insert
    throw new Error('Not implemented');
  }

  private async updateOrganizationUser(organizationId: string, userId: string, data: Partial<OrganizationUser>): Promise<OrganizationUser> {
    // Implementation with database update
    throw new Error('Not implemented');
  }

  private async deleteOrganizationUser(organizationId: string, userId: string): Promise<void> {
    // Implementation with database delete
    throw new Error('Not implemented');
  }

  private async findOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
    // Implementation with database query
    return [];
  }

  private async calculateOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    // Implementation with database aggregations
    return {
      totalUsers: 0,
      totalProviders: 0,
      totalPatients: 0,
      appointmentsThisMonth: 0,
      appointmentsLastMonth: 0,
      averageRating: 0,
      subscriptionStatus: 'active',
      storageUsed: 0,
      storageLimit: 1000
    };
  }

  // ITenantResolver implementation
  async resolveTenant(context: any): Promise<string | null> {
    const organization = await this.resolveFromContext(context);
    return organization ? organization.id : null;
  }

  // IOrganizationService implementation
  async getOrganizationStats(id: string): Promise<OrganizationStats> {
    return await this.getStats(id);
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    return await this.create(data);
  }

  async registerProvider(organizationId: string, providerData: any): Promise<any> {
    // This would delegate to the actual OrganizationService
    throw new Error('Not implemented - should delegate to OrganizationService');
  }

  async registerPatient(organizationId: string, patientData: any): Promise<any> {
    // This would delegate to the actual OrganizationService
    throw new Error('Not implemented - should delegate to OrganizationService');
  }

  async addCaregiver(organizationId: string, caregiverData: any): Promise<any> {
    // This would delegate to the actual OrganizationService
    throw new Error('Not implemented - should delegate to OrganizationService');
  }

  async getOnboardingStatus(organizationId: string): Promise<OnboardingStatus> {
    // This would delegate to the actual OrganizationService
    throw new Error('Not implemented - should delegate to OrganizationService');
  }
} 