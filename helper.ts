export function addKSNamespace(o: any) {
    addNamespace(o, "kube-system")
};

export function addLENamespace(o: any) {
    addNamespace(o, "le")
}
function addNamespace(o: any, namespace: string) {
    if (o !== undefined) {
        if (o.metadata !== undefined) {
            o.metadata.namespace = namespace;
        } else {
            o.metadata = {namespace: namespace};
        }
    }
}