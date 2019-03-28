import * as k8s from "@pulumi/kubernetes";
import {project} from "@pulumi/gcp/config"
import {k8sProvider, k8sCluster} from "./index";
import {externalDnsVersion} from "./config";
import {addKSNamespace} from "./helper";

const externaldns = new k8s.helm.v2.Chart("externaldns1", {
        repo: "stable",
        version: externalDnsVersion,
        chart: "external-dns",
        namespace: "kube-system",
        transformations: [addKSNamespace],
        values: {
            google: {
                project: project,
            },
            policy: "sync",
            provider: "google",
            rbac: {
                create: true
            },
            tolerations: []
        }
    },
    {
        providers: {kubernetes: k8sProvider},
        parent: k8sCluster,
        dependsOn: k8sCluster
    });
