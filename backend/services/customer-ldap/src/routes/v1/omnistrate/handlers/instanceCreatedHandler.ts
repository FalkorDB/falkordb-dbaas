import { type FastifyReply, type FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { UserService } from '../../../../services/UserService';
import { ALLOWED_ACL } from '../../../../constants';

interface InstanceCreatedBody {
  instanceId: string;
  subscriptionId: string;
}

export async function instanceCreatedHandler(request: FastifyRequest<{ Body: InstanceCreatedBody }>, reply: FastifyReply): Promise<void> {
  const { instanceId, subscriptionId } = request.body;

  request.log.info({ instanceId, subscriptionId }, 'Handling instance created webhook');

  try {
    // Get Omnistrate repository from DI container
    const omnistrateRepo = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);
    
    // Get instance details from Omnistrate
    const instance = await omnistrateRepo.getInstance(instanceId);
    
    if (!instance) {
      request.log.error({ instanceId }, 'Instance not found in Omnistrate');
      return reply.code(404).send({ 
        error: 'Instance not found',
        message: `Instance ${instanceId} not found in Omnistrate - webhook will be retried`,
      });
    }

    // Extract FalkorDB credentials from resultParams
    const resultParams = instance.resultParams || {};
    const falkordbUsername = resultParams.falkordbUsername;
    const falkordbPassword = resultParams.falkordbPassword;

    if (!falkordbUsername || !falkordbPassword) {
      request.log.error({ instanceId, hasResultParams: !!instance.resultParams }, 'Missing FalkorDB credentials in resultParams');
      return reply.code(503).send({ 
        error: 'Missing credentials',
        message: 'Missing falkordbUsername or falkordbPassword in instance resultParams - webhook will be retried',
      });
    }

    // Get cloud provider, cluster name, and region from instance
    const cloudProvider = instance.cloudProvider;
    const k8sClusterName = instance.clusterId;
    const region = instance.region;

    if (!cloudProvider || !k8sClusterName || !region) {
      request.log.error({ instanceId, cloudProvider, k8sClusterName, region }, 'Missing required instance details');
      return reply.code(503).send({ 
        error: 'Invalid instance data',
        message: 'Missing cloud_provider, cluster name, or region in instance - webhook will be retried',
      });
    }

    // Create user in LDAP with ALLOWED_ACL permissions
    const userService = request.diScope.resolve<UserService>('userService');
    
    try {
      await userService.createUser(instanceId, cloudProvider, k8sClusterName, region, {
        username: falkordbUsername,
        password: falkordbPassword,
        acl: ALLOWED_ACL,
      });

      request.log.info({ instanceId, username: '***' }, 'User created successfully');
      
      return reply.code(201).send({ 
        message: 'User created successfully',
      });
    } catch (error) {
      // Check if user already exists (idempotency)
      if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('409'))) {
        request.log.info({ instanceId }, 'User already exists - webhook is idempotent');
        return reply.code(200).send({ 
          message: 'User already exists',
        });
      }

      // Check for rate limiting (429)
      if (error instanceof Error && error.message.includes('429')) {
        request.log.warn({ instanceId }, 'Rate limited by LDAP server');
        return reply.code(429).send({ 
          error: 'Rate limited',
          message: 'LDAP server rate limit reached - webhook will be retried',
        });
      }

      // For other errors, propagate to outer catch which returns 500 to trigger retry
      throw error;
    }
  } catch (error) {
    request.log.error({ error: error instanceof Error ? error.message : 'Unknown error', instanceId, subscriptionId }, 'Error handling instance created webhook');
    
    // Return 500 for unexpected errors to trigger retry
    return reply.code(500).send({ 
      error: 'Internal server error',
      message: 'Failed to create user - webhook will be retried',
    });
  }
}
