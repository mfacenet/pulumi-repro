import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
// Addons
import "./addon_externaldns"

import {name} from "./config";

export const k8sCluster = new gcp.container.Cluster("gke-cluster",
    {
        name: name,
        loggingService: "logging.googleapis.com/kubernetes",
        monitoringService: "monitoring.googleapis.com/kubernetes",
        addonsConfig: {
            httpLoadBalancing: {
                disabled: false
            }
        },
        nodePools: [{name: "default-pool",}],
    },
    {
        deleteBeforeReplace: true,
    }
);

// Manufacture a GKE-style kubeconfig. Note that this is slightly "different"
// because of the way GKE requires gcloud to be in the picture for cluster
// authentication (rather than using the client cert/key directly).
export const kubeconfig = pulumi.all([k8sCluster.name, k8sCluster.endpoint, k8sCluster.masterAuth]).apply(([name, endpoint, masterAuth]) => {
        const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
        return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`;
    },
);

export const k8sProvider = new k8s.Provider("gkeK8s", {
    kubeconfig: kubeconfig,
}, {
    dependsOn: k8sCluster,
    parent: k8sCluster
});

// Export the Cluster name
export const clusterName = k8sCluster.name;


