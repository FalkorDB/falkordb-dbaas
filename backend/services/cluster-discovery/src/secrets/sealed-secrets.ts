import { getK8sConfig } from "../utils/k8s";
import {
  SEALED_SECRETS_KEY_SECRET_NAME,
  SEALED_SECRETS_KEY_SECRET_NAMESPACE,
} from "../constants";
import logger from "../logger";
import { Cluster } from "../types";
import * as k8s from "@kubernetes/client-node";

/**
 * Creates or updates the sealed-secrets TLS key pair on a target app-plane cluster.
 *
 * All app-plane clusters share the same key pair so that a single SealedSecret
 * YAML can be deployed across every spoke via ApplicationSets.
 *
 * The private key and public cert are read from env vars
 * (SEALED_SECRETS_TLS_CRT / SEALED_SECRETS_TLS_KEY) which are injected from
 * a sealed secret on the control plane.
 */
export const createTargetClusterSealedSecretsKey = async (
  cluster: Cluster,
) => {
  const tlsCrt = process.env.SEALED_SECRETS_TLS_CRT;
  const tlsKey = process.env.SEALED_SECRETS_TLS_KEY;

  if (!tlsCrt || !tlsKey) {
    logger.warn(
      "SEALED_SECRETS_TLS_CRT or SEALED_SECRETS_TLS_KEY is not set, skipping sealed-secrets key provisioning",
    );
    return;
  }

  const kc = await getK8sConfig(cluster);
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  const desiredData: Record<string, string> = {
    "tls.crt": Buffer.from(tlsCrt).toString("base64"),
    "tls.key": Buffer.from(tlsKey).toString("base64"),
  };

  const secretManifest: k8s.V1Secret = {
    metadata: {
      name: SEALED_SECRETS_KEY_SECRET_NAME,
      namespace: SEALED_SECRETS_KEY_SECRET_NAMESPACE,
      labels: {
        "sealedsecrets.bitnami.com/sealed-secrets-key": "active",
      },
    },
    type: "kubernetes.io/tls",
    data: desiredData,
  };

  try {
    const existing = await k8sApi.readNamespacedSecret(
      SEALED_SECRETS_KEY_SECRET_NAME,
      SEALED_SECRETS_KEY_SECRET_NAMESPACE,
    );
    logger.info(
      `Sealed-secrets key already exists in cluster ${cluster.name}`,
    );

    // Update if content differs
    if (
      existing.body.data?.["tls.crt"] !== desiredData["tls.crt"] ||
      existing.body.data?.["tls.key"] !== desiredData["tls.key"]
    ) {
      logger.info(
        `Updating sealed-secrets key in cluster ${cluster.name}...`,
      );
      const updatedSecret: k8s.V1Secret = {
        ...secretManifest,
        metadata: {
          ...existing.body.metadata,
          labels: {
            ...existing.body.metadata?.labels,
            "sealedsecrets.bitnami.com/sealed-secrets-key": "active",
          },
        },
      };
      await k8sApi.replaceNamespacedSecret(
        SEALED_SECRETS_KEY_SECRET_NAME,
        SEALED_SECRETS_KEY_SECRET_NAMESPACE,
        updatedSecret,
      );
      logger.info(
        `Successfully updated sealed-secrets key in cluster ${cluster.name}`,
      );
    }
  } catch (err: any) {
    if (err.statusCode === 404) {
      logger.info(
        `Creating sealed-secrets key in cluster ${cluster.name}...`,
      );
      try {
        await k8sApi
          .createNamespace({
            metadata: { name: SEALED_SECRETS_KEY_SECRET_NAMESPACE },
          })
          .catch(() => {});
        await k8sApi.createNamespacedSecret(
          SEALED_SECRETS_KEY_SECRET_NAMESPACE,
          secretManifest,
        );
        logger.info(
          `Successfully created sealed-secrets key in cluster ${cluster.name}`,
        );
      } catch (createErr) {
        logger.error(
          createErr,
          `Error creating sealed-secrets key in cluster ${cluster.name}:`,
        );
      }
    } else {
      logger.error(
        err.response?.body || err,
        `Error checking for existing sealed-secrets key in cluster ${cluster.name}:`,
      );
    }
  }
};
