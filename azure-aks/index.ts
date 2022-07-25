import * as resources from "@pulumi/azure-native/resources";

import { resourceGroupName, mysqlPassword } from "./config";
import { MySql } from "./mysql";
import { AksCluster } from "./cluster";
import { Temporal } from "./temporal";

const resourceGroup = new resources.ResourceGroup("resourceGroup", {
    resourceGroupName: resourceGroupName,
    location: "CentralUS",
});

const database = new MySql("mysql", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    administratorLogin: "sree",
    administratorPassword: mysqlPassword,
});

const cluster = new AksCluster("aks", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    kubernetesVersion: "1.22.11",
    vmSize: "Standard_DS2_v2",
    vmCount: 2,
});

const temporal = new Temporal("temporal", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    version: "1.1.1",
    storage: {
        type: "mysql",
        hostName: database.hostName,
        login: database.administratorLogin,
        password: database.administratorPassword,
    },
    cluster: cluster,
    app: {
        namespace: "temporal",
        folder: "./workflow",
        port: 8080,
    },
});

export const webEndpoint = temporal.webEndpoint;
export const starterEndpoint = temporal.starterEndpoint;
