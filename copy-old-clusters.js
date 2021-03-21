const path = require("path");
const fs = require("fs");
const homedir = require("os").homedir();
const newPath = path.resolve(homedir, ".config/Lens/lens-cluster-store.json");
const oldPath = path.resolve(homedir, "snap/kontena-lens/current/.config/Lens/lens-cluster-store.json");

let newJSON = require(newPath);
let oldJSON = require(oldPath);

oldJSON.clusters = oldJSON.clusters.map(x => {
    console.log(x.kubeConfigPath);
    if (x.kubeConfigPath.includes("kubeconfigs")) {
        x.kubeConfigPath = path.resolve(homedir, ".config/Lens/kubeconfigs" + x.kubeConfigPath.split("kubeconfigs")[1]);
    }
    return x;
});
newJSON.clusters = newJSON.clusters.concat(oldJSON.clusters);
console.log(newJSON);

fs.writeFileSync(newPath, JSON.stringify(newJSON));
