import { SSTConfig } from "sst";
import { StaticSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "super-panel",
      region: "ap-south-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const staticSite = new StaticSite(stack, "StaticSite", {
        buildCommand: "yarn build",
        buildOutput: "dist",
        errorPage: "index.html",
        indexPage: "index.html",
      });

      stack.addOutputs({
        SiteUrl: staticSite.url,
      });
    });
  },
} satisfies SSTConfig;
