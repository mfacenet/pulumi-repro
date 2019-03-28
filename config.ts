import * as pulumi from "@pulumi/pulumi";
const config = new pulumi.Config();

export const name = pulumi.getStack();

// Addons
//ExternalDNS
export const externalDnsVersion = config.get("externalDnsVersion") || "1.7.0";

